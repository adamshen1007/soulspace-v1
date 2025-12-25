import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { auth } from '@clerk/nextjs/server';
// 👇 引入代理工具
import { getGeminiModel } from "../../../lib/gemini";
import { checkAndConsumeCredit } from "../../../lib/payment"; // 👈 引入扣费工具


export const dynamic = 'force-dynamic';

const SYSTEM_PROMPT = `
你是一位精通时间能量学的"灵境管家"。
你熟知《协纪辨方书》的择吉智慧、二十四节气的物候变化以及《黄帝内经》的四时养生之道。

请根据用户提供的【日期】，感知今日的天地能量场，生成一份"能量日课"。

【核心知识库调取】
1. **节气与物候**：确认今日处于哪个节气（如：惊蛰、清明），并引用相关的物候描述（如：桃始华、仓庚鸣）。
2. **干支五行**：感知今日的五行强弱（如：火旺之日，宜静心，忌烦躁）。

【内容要求】
1. **主题 (Theme)**：提炼一个极具美感的双字词（如：微澜、归根、破晓、安住）。
2. **宜忌 (Do/Don't)**：
   - 将《通书》的"宜动土/祭祀"转化为现代生活的"宜整理空间/冥想"。
   - 将"忌远行"转化为"忌过度社交/信息过载"。
3. **色彩 (Color)**：推荐一种中国传统色或莫兰迪色，并赋予其能量含义。

【输出格式】
严格输出 JSON：
{
  "date_str": "YYYY.MM.DD 周X (包含节气信息，如有)",
  "theme": "双字高维主题",
  "energy_level": 0-100 (根据五行平衡度打分),
  "lucky_color": "颜色名称 (如：天青色 / 暖白)",
  "lucky_time": "吉时 (如：未时 13:00-15:00)",
  "quote": "一句结合今日物候与心境的古诗词或哲理短句",
  "todo": { "title": "今日微行动", "description": "一件简单但能滋养身心的小事 (引用《内经》养生之理)" },
  "avoid": "今日宜断舍离之事"
}
`;

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ success: false, error: "请先登录" }, { status: 401 });
    }

    // 👇👇👇【新增商业化逻辑】👇👇👇
    const payment = await checkAndConsumeCredit(userId);
    if (!payment.success) {
      // 返回特殊的状态码 402 (Payment Required)
      return NextResponse.json({ success: false, error: payment.message, code: "NO_CREDIT" }, { status: 402 });
    }
    // 👆👆👆

    const sbUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const sbKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    const { date } = await req.json();

    // 👇 1. 获取模型
    const model = getGeminiModel();

    // 👇 2. 生成内容
    const result = await model.generateContent([SYSTEM_PROMPT, `今天是：${date}`]);
    
    // 👇👇👇【关键修复】确保这里也有 text 定义
    const text = result.response.text();
    // 👆👆👆

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("AI 未返回有效的 JSON 格式");
    const data = JSON.parse(jsonMatch[0]);

    // 3. 存入数据库
    const supabase = createClient(sbUrl, sbKey, { auth: { persistSession: false } });

    const { error } = await supabase.from('daily_logs').insert([
      {
        user_id: userId,
        date_str: data.date_str,
        theme: data.theme,
        energy_score: data.energy_level,
        result_json: data
      }
    ]);

    if (error) console.error("日课存档失败:", error);

    return NextResponse.json({ success: true, data });

  } catch (error: any) {
    console.error("Daily API Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}