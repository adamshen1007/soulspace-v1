import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { auth } from "@clerk/nextjs/server";

// ⚠️ 保持和你依赖包匹配的版本号
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-12-15.clover",
});

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { plan } = body;

    // 👇👇👇【重要】请务必替换为你 Stripe Live Mode 的真实 Price ID 👇👇👇
    // 去 Stripe Dashboard -> Product Catalog -> 点击商品 -> 复制 price_ 开头的 ID
    const BASIC_PRICE_ID = "price_1SiZL90Vfi61L28C0j3dJayc"; // 替换这里
    const PRO_PRICE_ID = "price_1SiZLc0Vfi61L28ChCDtJ6Md";   // 替换这里

    let priceId = "";
    let creditsAmount = 0;

    if (plan === "basic") {
      priceId = BASIC_PRICE_ID;
      creditsAmount = 10;
    } else if (plan === "pro") {
      priceId = PRO_PRICE_ID;
      creditsAmount = 50;
    }

    // 定义通用的 Session 参数 (避免重复写)
    const commonSessionParams: any = {
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL}/`,
      metadata: {
        userId: userId,
        credits: creditsAmount.toString(),
      },
      allow_promotion_codes: true,
    };

    // ---------------------------------------------------------
    // 🚀 尝试 1：全火力模式 (卡 + 支付宝 + 微信)
    // ---------------------------------------------------------
    try {
      console.log("尝试创建全渠道支付 Session...");
      const session = await stripe.checkout.sessions.create({
        ...commonSessionParams,
        // 尝试开启所有渠道
        payment_method_types: ["card", "alipay", "wechat_pay"],
        // 微信支付通常需要这个配置
        payment_method_options: {
          wechat_pay: {
            client: "web",
          },
        },
      });

      return NextResponse.json({ url: session.url });

    } catch (firstError: any) {
      // ---------------------------------------------------------
      // ⚠️ 如果报错 (通常是因为支付宝/微信还在审核 Pending 状态)
      // ---------------------------------------------------------
      console.warn("全渠道创建失败 (可能是支付宝/微信未激活)，尝试降级为仅银行卡模式...", firstError.message);

      try {
        // 🚀 尝试 2：保底模式 (仅银行卡)
        const backupSession = await stripe.checkout.sessions.create({
          ...commonSessionParams,
          // 只保留 card，删掉其他未激活的渠道
          payment_method_types: ["card"],
          // 移除 payment_method_options，因为 card 不需要
        });

        console.log("✅ 保底模式创建成功");
        return NextResponse.json({ url: backupSession.url });

      } catch (secondError: any) {
        // ---------------------------------------------------------
        // ❌ 如果连卡都付不了，那就是真出错了
        // ---------------------------------------------------------
        console.error("❌ 支付初始化彻底失败:", secondError);
        return NextResponse.json({ error: secondError.message }, { status: 500 });
      }
    }

  } catch (error: any) {
    console.error("API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}