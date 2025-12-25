import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { auth } from '@clerk/nextjs/server'; // 引入 Clerk 验证

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // 1. 获取当前登录用户的 ID
    const { userId } = await auth();
    
    // 如果没登录，直接返回空列表（或者报错，这里为了前端不崩，返回空数组也行）
    if (!userId) {
      return NextResponse.json({ success: true, data: [] });
    }

    const sbUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const sbKey = process.env.SUPABASE_SERVICE_ROLE_KEY!; // 使用 Service Key 才有权限读所有数据并过滤
    const supabase = createClient(sbUrl, sbKey, { auth: { persistSession: false } });

    // 2. 并行查询两张表，且严格筛选 user_id
    const [reportsData, oracleData] = await Promise.all([
      // 查询空间诊断 (只查当前用户的)
      supabase.from('reports')
        .select('*')
        .eq('user_id', userId) // <--- 关键：只看自己的
        .order('created_at', { ascending: false })
        .limit(20),
        
      // 查询决策罗盘 (只查当前用户的)
      supabase.from('oracle_logs')
        .select('*')
        .eq('user_id', userId) // <--- 关键：只看自己的
        .order('created_at', { ascending: false })
        .limit(20)
    ]);

    // 3. 数据清洗与合并
    const history = [
      ...(reportsData.data || []).map((item: any) => ({
        type: 'space',
        id: item.id,
        date: item.created_at,
        title: item.analysis_result?.summary || "空间能量诊断",
        score: item.score,
        // 处理一下 detail，防止它是字符串格式
        detail: typeof item.analysis_result === 'string' ? JSON.parse(item.analysis_result) : item.analysis_result,
        query: null
      })),
      ...(oracleData.data || []).map((item: any) => ({
        type: 'oracle',
        id: item.id,
        date: item.created_at,
        title: item.hexagram_name ? `卦象：${item.hexagram_name}` : "决策指引",
        score: null,
        query: item.user_query,
        detail: typeof item.result_json === 'string' ? JSON.parse(item.result_json) : item.result_json
      }))
    ];

    // 4. 按时间倒序重新排列
    history.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return NextResponse.json({ success: true, data: history });

  } catch (error: any) {
    console.error("History API Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}