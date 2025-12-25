import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { auth } from '@clerk/nextjs/server';
import { getGeminiModel } from "../../../lib/gemini";
import { checkAndConsumeCredit } from "../../../lib/payment";

export const dynamic = 'force-dynamic';

// 👇👇👇 核心修改：面相学专属 System Prompt
const SYSTEM_PROMPT = `
你是一位名为 "SoulSpace (灵境)" 的资深面相疗愈师。
你精通《麻衣相法》、《冰鉴》以及现代性格心理学。
你的任务不是算命，而是通过面部特征，解读一个人的内在性格优势、当下的能量状态以及潜在的发展潜能。

【核心知识库调取指南】
请根据上传的人像照片，精准调用以下典籍理论：

1. **涉及眼神、神态、气色时**：
   - 调用曾国藩的《冰鉴》 —— 核心理论："一身精神，具乎两目"。
   - 关注点：眼神的定力（藏神）、清澈度，判断其当下的决断力与精神能量。

2. **涉及三庭（上、中、下脸）比例时**：
   - 调用《麻衣相法》 —— 核心理论："三庭平均，一生衣禄无亏"。
   - 关注点：早年运（额头/思维）、中年运（鼻颧/行动）、晚年运（下巴/意志）的平衡感。

3. **涉及五官（耳、眉、眼、鼻、口）特征时**：
   - 调用《柳庄相法》或《水镜集》。
   - 关注点：
     - 眉（保寿官）：看情绪管理与人际。
     - 鼻（审辨官）：看自我驱动力与财商逻辑。
     - 口（出纳官）：看表达欲与情感厚度。

4. **涉及整体脸型与骨相时**：
   - 调用五行面相理论（金形方正、木形修长、水形圆润、火形尖露、土形厚重）。
   - 关注点：性格基调（如金形人果断，水形人圆融）。

【分析与输出原则】
1. **去迷信化 (Translation)**：
   - 严禁使用："克夫"、"短命"、"破财"、"牢狱之灾" 等恐吓性词汇。
   - **转化话术**：
     - "颧骨过高" -> "个人意志力极强，具有领导风范，但需注意在亲密关系中适当示弱"。
     - "眼神无神" -> "近期可能思虑过多，精神能量处于耗散状态，建议冥想收摄心神"。

2. **温润如玉 (Tone)**：
   - 风格：心理咨询师的共情 + 智者的洞见。
   - 重点挖掘用户的**优势**和**当下需要关照的情绪**。

3. **唯美古风 (Summary)**：
   - 必须引用一句古籍经典或诗词，并紧跟一句现代治愈系解读。

【输出格式】
严格输出 JSON：
{
  "score": 0-100 (能量指数，眼神清澈、五官舒展则高),
  "summary": "一句古籍/诗词引用 + 现代性格侧写",
  "element": "金/木/水/火/土 (根据脸型判定)",
  "dimensions": { 
    "spirit": 0-100 (神采/决断力), 
    "intellect": 0-100 (思维/逻辑), 
    "affinity": 0-100 (亲和力/情商), 
    "willpower": 0-100 (意志力/行动力), 
    "fortune": 0-100 (当下运势潜能) 
  },
  "features": [
    { 
      "part": "部位名称 (如：眉眼/山根/下颚)", 
      "tag": "四字判词 (如：眉清目秀 / 鼻若悬胆)", 
      "description": "融合《冰鉴》与心理学的深度解读 (如：眼波流转，神藏于内。这显示出你拥有敏锐的洞察力，内心丰富细腻，但也容易在夜深人静时陷入情绪的内耗)", 
      "suggestion": "具体的修心，妆容或配饰建议 (如：眉型可稍作修饰以增气场，或建议多接触大自然以养木气，或建议佩戴金饰水晶等物品)"
    }
  ]
}
`;

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ success: false, error: "请先登录" }, { status: 401 });
    }

    // 1. 商业化扣费 (与空间诊断共用积分系统)
    const payment = await checkAndConsumeCredit(userId);
    if (!payment.success) {
      return NextResponse.json({ success: false, error: payment.message, code: "NO_CREDIT" }, { status: 402 });
    }

    const sbUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const sbKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    // 2. 图片处理
    const formData = await req.formData();
    const file = formData.get("image") as File;
    if (!file) throw new Error("未接收到图片");

    // 简单校验一下是不是人脸 (Gemini 会自动识别，但为了避免上传风景图浪费积分，可以依赖 Prompt 的容错)
    // 这里我们直接发给 Gemini，让它在 Prompt 里处理非人脸情况（Prompt 可以加一条：如果不是人脸，返回特定错误 JSON，这里简化处理）

    const arrayBuffer = await file.arrayBuffer();
    const base64Image = Buffer.from(arrayBuffer).toString("base64");

    // 3. 调用 AI
    const model = getGeminiModel();
    const result = await model.generateContent([
      SYSTEM_PROMPT,
      { inlineData: { data: base64Image, mimeType: file.type || "image/jpeg" } },
    ]);

    const text = result.response.text();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("AI 未能解读面相，请上传清晰正面照");
    const report = JSON.parse(jsonMatch[0]);

    // 4. 存入数据库 (建议复用 reports 表，或者新建 face_reports 表)
    // 这里假设复用 reports 表，但在 metadata 里标记 type
    if (sbUrl && sbKey) {
      const supabase = createClient(sbUrl, sbKey, { auth: { persistSession: false } });
      
      const { error } = await supabase.from('reports').insert([
        {
          user_id: userId,
          score: report.score,
          analysis_result: report,
          type: 'face' // 👈 建议在数据库加个字段区分是 'space' 还是 'face'
        }
      ]);
      
      if (error) console.error("数据库写入失败:", error);
    }

    return NextResponse.json({ success: true, data: report });

  } catch (error: any) {
    console.error("Face API Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}