import { createClient } from "@supabase/supabase-js";
// 👇 1. 引入 undici 的原生 fetch 和 Agent
import { fetch as undiciFetch, Agent } from 'undici';

const sbUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const sbKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

console.log("Supabase Key Check:", sbKey ? `${sbKey.substring(0, 5)}...` : "MISSING");

// 👇 2. 创建一个“直连”的 Agent (不走代理)
const directAgent = new Agent({
  connect: {
    timeout: 30000, // 30秒超时
  },
});

// 👇 3. 封装一个强制直连的 fetch 函数
const customFetch = (url: any, options: any) => {
  return undiciFetch(url, {
    ...options,
    dispatcher: directAgent, // 强制指定使用直连 Agent，无视全局代理
  });
};

// 👇 4. 初始化 Supabase 时注入这个 customFetch
const supabase = createClient(sbUrl, sbKey, {
  auth: { persistSession: false },
  global: {
    fetch: customFetch as any, // 覆盖默认 fetch
  },
});

export async function checkAndConsumeCredit(userId: string) {
  // 1. 先查询用户积分
  let { data: profile, error: fetchError } = await supabase
    .from('profiles')
    .select('credits')
    .eq('user_id', userId)
    .single();

  if (fetchError && fetchError.code !== 'PGRST116') {
    console.error("查询积分失败:", fetchError);
  }

  // 如果用户不存在 (第一次来)，初始化
  if (!profile) {
    console.log(`正在为新用户 ${userId} 初始化积分...`);
    
    const { data: newProfile, error: insertError } = await supabase
      .from('profiles')
      .insert([{ user_id: userId, credits: 3 }])
      .select()
      .single();
    
    if (insertError) {
      console.error("🔥 数据库插入失败，详细原因:", insertError);
      throw new Error(`账户初始化失败: ${insertError.message}`);
    }
    
    if (!newProfile) throw new Error("账户初始化未返回数据");
    
    profile = newProfile;
  }

  // 2. 检查余额
  if (profile.credits <= 0) {
    return { success: false, message: "灵力已耗尽，请补充能量" };
  }

  // 3. 扣除 1 积分
  const { error: updateError } = await supabase
    .from('profiles')
    .update({ credits: profile.credits - 1 })
    .eq('user_id', userId);

  if (updateError) {
    console.error("扣费更新失败:", updateError);
    return { success: false, message: "扣费失败，请重试" };
  }

  console.log(`扣费成功: 用户 ${userId} 剩余 ${profile.credits - 1} 积分`);
  return { success: true, remaining: profile.credits - 1 };
}