import { createClient } from "@supabase/supabase-js";
// 👇 1. 引入 undici 的原生 fetch 和 Agent
import { fetch as undiciFetch, Agent } from 'undici';

const sbUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const sbKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// 生产环境 Vercel 不需要打印 Key，为了安全可以去掉 log
// console.log("Supabase Key Check:", sbKey ? `${sbKey.substring(0, 5)}...` : "MISSING");

// 👇 2. 创建一个“直连”的 Agent
const directAgent = new Agent({
  connect: {
    timeout: 30000, 
  },
});

const customFetch = (url: any, options: any) => {
  return undiciFetch(url, {
    ...options,
    dispatcher: directAgent, 
  });
};

const supabase = createClient(sbUrl, sbKey, {
  auth: { persistSession: false },
  global: {
    fetch: customFetch as any, 
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

  // 👇👇👇【核心修复：类型守卫】👇👇👇
  // 加这一段是为了满足 TypeScript，告诉它“到这里 profile 绝不可能是 null”
  if (!profile) {
    throw new Error("系统异常：无法读取用户档案");
  }
  // 👆👆👆

  // 2. 检查余额 (这时候 TS 就放心了，知道 profile 肯定有值)
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

  return { success: true, remaining: profile.credits - 1 };
}