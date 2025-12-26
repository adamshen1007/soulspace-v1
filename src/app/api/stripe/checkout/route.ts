import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { auth } from "@clerk/nextjs/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
});

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { plan } = body;

    // 👇 优化点：使用 Stripe 后台生成的 Price ID (请替换为你自己的真实 ID)
    // 基础包 ID (9.9元)
    const BASIC_PRICE_ID = "prod_TfvBIz1rf7SmnC"; 
    // 高级包 ID (29.9元)
    const PRO_PRICE_ID = "prod_TfvCAFjvKHMexM";

    let priceId = "";
    let creditsAmount = 0;

    if (plan === "basic") {
      priceId = BASIC_PRICE_ID;
      creditsAmount = 10;
    } else if (plan === "pro") {
      priceId = PRO_PRICE_ID;
      creditsAmount = 50;
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card", "alipay"], // 微信支付需要企业资质，个人只有支付宝
      line_items: [
        {
          // 👇 优化点：这里直接传 ID，Stripe 会自动处理金额和商品名
          price: priceId, 
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL}/`,
      // metadata 保持不变，这是最重要的发货凭证
      metadata: {
        userId: userId,
        credits: creditsAmount.toString(),
      },
      // 👇 优化点：允许使用促销码 (如果你想做活动)
      allow_promotion_codes: true, 
    });

    return NextResponse.json({ url: session.url });

  } catch (error: any) {
    console.error("Stripe Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}