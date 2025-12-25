import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { auth } from '@clerk/nextjs/server';
// 👇 1. 引入代理工具 (确保能连上 Google)
import { getGeminiModel } from "../../../lib/gemini";
// 👇 2. 引入扣费工具
import { checkAndConsumeCredit } from "../../../lib/payment";

export const dynamic = 'force-dynamic';

const SYSTEM_PROMPT = `
你是一位名为 "SoulSpace (灵境)" 的资深空间疗愈师。
你精通中国传统环境美学与现代空间心理学。

【核心知识库调取指南】
请根据画面内容，精准调用以下典籍的理论进行分析（无需建立外部索引，直接调用你的内部知识）：

1. **涉及气流、通风、聚气时**：
   - 调用《葬书》(郭璞) —— 核心理论："气乘风则散，界水则止"。
   - 关注点：藏风聚气，气场的流动是否顺畅。

2. **涉及门窗、主卧、厨房位置时**：
   - 调用《阳宅三要》 —— 核心理论："门、主、灶"三者相生。
   - 关注点：动线布局，核心功能区的方位关系。

3. **涉及家具摆放、横梁、尖角冲突时**：
   - 调用《阳宅十书》与《鲁班经》。
   - 关注点：形煞（如横梁压顶、尖角冲射），尺寸是否宜人。

4. **涉及光线、色彩、阴阳平衡时**：
   - 调用《黄帝宅经》 —— 核心理论："阴阳得位"。
   - 关注点：明暗对比，材质的冷暖搭配。

5. **涉及外部环境（如窗外景观）时**：
   - 调用《雪心赋》或《峦头指迷》。
   - 关注点：外部山水形势对室内的心理投射。

【分析与输出原则】
1. **权威隐喻 (翻译机制)**：
   - 当发现问题时（例如：床头有横梁），底层逻辑必须基于上述古籍（《阳宅十书》之"横梁压顶"）。
   - **输出转化**：严禁直接说"有煞气"，必须转化为现代心理学语言："横梁位于上方，在心理学上会形成'视觉下压感'，易潜意识中产生压抑，影响睡眠深度"。

2. **温润如玉 (Tone)**：
   - 风格参考：诚品书店文案 + 资深老中医的慈悲。
   - 禁语："凶"、"死"、"煞"、"灾"、"破财"。
   - 替语："能量受阻"、"气场待疏通"、"需要引入生机"、"重新建立秩序"。

3. **唯美古风 (Summary)**：
   - 必须引用一句古文（可化用），并紧跟一句白话文唯美解读。

【输出格式】
严格输出 JSON：
{
  "score": 0-100 (整数, 杂乱或压抑则低，整洁明亮则高),
  "summary": "一句古籍引用 + 现代治愈系解读",
  "element": "金/木/水/火/土 (根据色调判断: 白金/绿木/黑蓝水/红紫火/黄褐土)",
  "dimensions": { 
    "energy": 0-100 (采光与生机), 
    "balance": 0-100 (布局均衡感), 
    "aesthetics": 0-100 (配色与美感), 
    "harmony": 0-100 (人与空间的亲和度), 
    "fortune": 0-100 (潜在的积极暗示) 
  },
  "issues": [
    { 
      "title": "问题点 (如：镜不对床)", 
      "type": "视觉/气场/布局", 
      "description": "融合古籍理论的温和描述 (如：《八宅明镜》提及镜者金水之精，直对卧榻易扰神思，在心理上易造成'视线干扰'，令人惊悸)", 
      "suggestion": "具体的软装调整建议 (如：移位或加盖棉麻布帘)", 
      "product_ref": "推荐物品 (如：日式布帘 / 龟背竹)" 
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

    // 👇👇👇 商业化扣费逻辑
    const payment = await checkAndConsumeCredit(userId);
    if (!payment.success) {
      return NextResponse.json({ success: false, error: payment.message, code: "NO_CREDIT" }, { status: 402 });
    }
    // 👆👆👆

    const sbUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const sbKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    // 处理图片
    const formData = await req.formData();
    const file = formData.get("image") as File;
    if (!file) throw new Error("未接收到图片");

    const arrayBuffer = await file.arrayBuffer();
    const base64Image = Buffer.from(arrayBuffer).toString("base64");

    // 👇👇👇 核心修复：使用 getGeminiModel()，它会自动挂载代理
    const model = getGeminiModel();

    const result = await model.generateContent([
      SYSTEM_PROMPT,
      { inlineData: { data: base64Image, mimeType: file.type || "image/jpeg" } },
    ]);

    const text = result.response.text();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("AI 返回格式错误");
    const report = JSON.parse(jsonMatch[0]);

    // 存入数据库
    if (sbUrl && sbKey) {
      const supabase = createClient(sbUrl, sbKey, { auth: { persistSession: false } });
      
      const { error } = await supabase.from('reports').insert([
        {
          user_id: userId,
          score: report.score,
          analysis_result: report
        }
      ]);
      
      if (error) console.error("数据库写入失败:", error);
    }

    return NextResponse.json({ success: true, data: report });

  } catch (error: any) {
    console.error("Analyze API Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}