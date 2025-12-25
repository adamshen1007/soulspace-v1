import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@supabase/supabase-js";
import { auth } from '@clerk/nextjs/server';
import "../../../lib/gemini"; 
import { checkAndConsumeCredit } from "../../../lib/payment"; // 👈 引入扣费工具

export const dynamic = 'force-dynamic';

const SYSTEM_PROMPT = `
你是一位精通《周易》(I Ching) 与现代决策博弈论的"灵境军师"。
用户正面临困惑，请根据其问题起一卦，并进行深度解读。

【核心知识库：周易正宗】
1. **起卦逻辑**：基于用户问题的能量场，模拟"大衍之数"或"梅花易数"得出六十四卦中的一卦。
2. **变爻分析**：若形势复杂，可指出"变爻"。

【分析原则】
1. **原文引用**：必须引用《周易》的【卦名】、【卦辞】或关键的【爻辞】。
   - 例如："此卦为《水火既济》，初九，曳其轮，濡其尾，无咎。"
2. **现代转译**：将"君子"、"利涉大川"等转化为现代职场或生活建议。
3. **拒绝宿命论**：强调人的主观能动性。

【重要：JSON 输出规则】
1. 绝对不要使用 Markdown 代码块（不要写 \`\`\`json）。
2. 直接输出纯 JSON 字符串。
3. **严禁在 JSON 属性值内部使用未转义的双引号**。如果原文中有引号，请使用单引号代替，或者转义。
   - 错误：{ "analysis": "孔子曰："逝者如斯"" }
   - 正确：{ "analysis": "孔子曰：'逝者如斯'" }

【输出格式】
{
  "hexagram": "卦名",
  "title": "四字短标题",
  "analysis": "引用原文 + 深度解读",
  "pros_cons": { "gain": "有利因素", "risk": "风险预警" },
  "strategy": "行动锦囊 (30字以内)",
  "intuition": "直觉指引"
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
    const apiKey = process.env.GOOGLE_API_KEY!;
    
    const { query } = await req.json();
    
    // 👇👇👇 核心修正：
    // 1. 必须使用 gemini-1.5-flash
    // 2. 暂时移除 generationConfig 以保证最大兼容性
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash" 
    });

    const result = await model.generateContent([SYSTEM_PROMPT, `用户困惑：${query}`]);
    const text = result.response.text(); 
    
    console.log("AI Raw Output:", text); // 方便调试

    // 清洗数据：有时候 AI 还是会忍不住加 ```json，这里手动去掉
    let cleanText = text.replace(/```json/g, "").replace(/```/g, "").trim();

    // 尝试解析
    let data;
    try {
      data = JSON.parse(cleanText);
    } catch (e) {
      console.error("JSON Parse Error:", cleanText);
      throw new Error("天机混沌，请重试 (解析失败)");
    }

    const supabase = createClient(sbUrl, sbKey, { auth: { persistSession: false } });
    
    const { error: dbError } = await supabase.from('oracle_logs').insert([
      {
        user_id: userId,
        user_query: query,
        hexagram_name: data.hexagram,
        result_json: data
      }
    ]);

    if (dbError) console.error("🔥 数据库写入失败:", dbError);

    return NextResponse.json({ success: true, data });

  } catch (error: any) {
    console.error("Oracle API Error:", error);
    return NextResponse.json({ success: false, error: error.message || "灵感链接断开" }, { status: 500 });
  }
}