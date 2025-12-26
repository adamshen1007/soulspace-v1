import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { auth } from "@clerk/nextjs/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16", // 或者最新版本
});

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { plan } = body; // 前端传过来 plan: 'pro' | 'basic'

    // 定义商品价格 (正式上线建议在 Stripe 后台创建 Product 直接引用 ID)
    let priceAmount = 0;
    let creditsAmount = 0;
    let productName = "";

    if (plan === "basic") {
      priceAmount = 990; // 9.90 CNY (Stripe 单位是分)
      creditsAmount = 10;
      productName = "灵力充值 - 基础包 (10点)";
    } else if (plan === "pro") {
      priceAmount = 2990; // 29.90 CNY
      creditsAmount = 50;
      productName = "灵力充值 - 高级包 (50点)";
    }

    // 创建 Stripe 会话
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card", "alipay"], // 👈 开启支付宝支持！
      line_items: [
        {
          price_data: {
            currency: "cny",
            product_data: {
              name: productName,
              images: ["https://lingjingxinju.com/icon-512.png"], // 你的 Logo URL
            },
            unit_amount: priceAmount,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL}/`,
      // 👇👇👇 关键：把 userId 和 充值数量 藏在 metadata 里，
      // 这样等用户付完钱，Stripe 通知我们时，我们才知道给谁充钱！
      metadata: {
        userId: userId,
        credits: creditsAmount.toString(),
      },
    });

    return NextResponse.json({ url: session.url });

  } catch (error: any) {
    console.error("Stripe Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}