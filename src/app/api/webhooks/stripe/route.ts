import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-12-15.clover",
});

// 初始化 Supabase Admin (为了绕过 RLS 权限直接修改余额)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

export async function POST(req: Request) {
  const body = await req.text();
  const signature = headers().get("Stripe-Signature") as string;

  let event: Stripe.Event;

  try {
    // 1. 验证这是不是 Stripe 发来的真消息 (防止黑客伪造)
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error: any) {
    return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
  }

  // 2. 监听 "checkout.session.completed" 事件 (付款成功)
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    // 从 metadata 里拿回我们在 checkout 里存的数据
    const userId = session.metadata?.userId;
    const creditsToAdd = Number(session.metadata?.credits);

    if (userId && creditsToAdd) {
      console.log(`💰 用户 ${userId} 充值成功，增加 ${creditsToAdd} 灵力`);

      // 3. 数据库操作：先查旧余额，再加新余额
      // (也可以写个 RPC 函数原子更新，这里用简单方法)
      const { data: profile } = await supabaseAdmin
        .from("profiles")
        .select("credits")
        .eq("user_id", userId)
        .single();

      const currentCredits = profile?.credits || 0;

      const { error } = await supabaseAdmin
        .from("profiles")
        .update({ credits: currentCredits + creditsToAdd })
        .eq("user_id", userId);

      if (error) {
        console.error("🔥 充值写入数据库失败:", error);
        return new NextResponse("Database Error", { status: 500 });
      }
    }
  }

  return new NextResponse(null, { status: 200 });
}