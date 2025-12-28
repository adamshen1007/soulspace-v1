import { NextRequest, NextResponse } from "next/server";
import { auth } from '@clerk/nextjs/server';
import { getGeminiModel } from "../../../lib/gemini";
import { checkAndConsumeCredit } from "../../../lib/payment";

export const dynamic = 'force-dynamic';

const SYSTEM_PROMPT = `
你是一位名为 "灵境解梦师" 的资深心理分析师，精通荣格心理学、弗洛伊德梦的解析以及中国传统的《周公解梦》。

【你的任务】
1. **引导对话**：如果用户提供的梦境描述过于简短（少于两句话），请以温柔且专业的口吻询问1-2个关键细节（如：情绪、颜色、特定的物品）。
2. **深度解析**：当信息充足时，给出多维度的深度解析。
3. **视觉重构**：为该梦境生成一个高度艺术化的、超现实主义的绘画提示词（Image Prompt）。

【交互逻辑】
- 如果需要更多信息，返回 JSON 包含 "is_final": false 和 "question": "你的询问"。
- 如果可以结案，返回 JSON 包含 "is_final": true 以及完整的解析内容。

【输出 JSON 格式要求】
{
  "is_final": boolean,
  "question": "追问细节 (仅当 is_final 为 false)",
  "data": {
    "title": "梦境的诗意命名",
    "score": 0-100 (梦境的清晰度或正能量程度),
    "interpretation": {
      "psychology": "从荣格/弗洛伊德视角分析潜意识符号",
      "tradition": "从东方解梦视角分析预兆或能量场",
      "guidance": "给用户的现实生活建议"
    },
    "imagery": {
      "prompt": "一段极其优美的英文提示词，用于生成 AI 绘画 (超现实主义/数字艺术风格)",
      "description": "对这个画面的中文描述"
    }
  }
}
`;

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ success: false, error: "请先登录" }, { status: 401 });

    const { history } = await req.json(); // 前端传来的对话记录

    const payment = await checkAndConsumeCredit(userId);
    if (!payment.success) return NextResponse.json({ success: false, error: payment.message, code: "NO_CREDIT" }, { status: 402 });

    const model = getGeminiModel();
    const chat = model.startChat({
      history: [
        { role: "user", parts: [{ text: SYSTEM_PROMPT }] },
        { role: "model", parts: [{ text: "准备就绪，请分享你的梦境。" }] },
      ],
    });

    const lastMessage = history[history.length - 1].content;
    const result = await chat.sendMessage(lastMessage);
    const text = result.response.text();

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("AI 返回格式错误");
    const responseData = JSON.parse(jsonMatch[0]);

    // 绘图逻辑：使用免费的 Pollinations API 实时生成图片
    if (responseData.is_final && responseData.data.imagery.prompt) {
      const encodedPrompt = encodeURIComponent(responseData.data.imagery.prompt + ", surrealism, masterpiece, 8k, high quality");
      responseData.data.imagery.image_url = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&nologo=true`;
    }

    return NextResponse.json({ success: true, ...responseData });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}