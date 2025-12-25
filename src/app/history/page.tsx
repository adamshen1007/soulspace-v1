"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Home, Compass, User } from "lucide-react";
// 👇 1. 引入 Clerk 组件
import { UserButton, useUser } from "@clerk/nextjs";

export default function HistoryPage() {
  const [loading, setLoading] = useState(true);
  const [list, setList] = useState<any[]>([]);
  // 获取当前用户信息
  const { user, isLoaded } = useUser();

  useEffect(() => {
    // 只有当用户加载完毕，才去获取数据
    if (!isLoaded || !user) return;

    const fetchData = async () => {
      try {
        const res = await fetch("/api/history");
        const json = await res.json();
        if (json.success) setList(json.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [isLoaded, user]);

  // 格式化时间
  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${d.getMonth() + 1}月${d.getDate()}日 ${d.getHours()}:${d.getMinutes().toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-zen-bg font-serif text-zen-black p-6">
      {/* 导航栏 */}
      <nav className="fixed top-0 left-0 w-full p-6 bg-zen-bg/90 backdrop-blur z-20 flex justify-between items-center border-b border-zen-black/5">
        <Link href="/" className="flex items-center text-xs tracking-widest opacity-60 hover:opacity-100 transition">
          <ArrowLeft className="w-4 h-4 mr-2" /> 归位
        </Link>
        
        <span className="text-xs tracking-[0.3em] uppercase opacity-40 absolute left-1/2 -translate-x-1/2">
          MY ARCHIVE
        </span>

        {/* 👇 2. 右上角放置用户头像 */}
        <div className="flex items-center gap-4">
           <div className="scale-75 origin-right">
              <UserButton afterSignOutUrl="/" />
           </div>
        </div>
      </nav>

      <main className="pt-24 max-w-2xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-light mb-2">灵境 · 归档</h1>
          {/* 显示用户的名字 */}
          {user && <p className="text-xs tracking-widest opacity-40">Hello, {user.firstName || user.username || "Traveler"}</p>}
        </div>

        {loading ? (
          <div className="text-center opacity-40 animate-pulse text-xs tracking-widest py-20">正在回溯时空...</div>
        ) : list.length === 0 ? (
          <div className="text-center opacity-40 py-20">
            <p className="mb-4">暂无记录</p>
            <Link href="/analyze" className="text-xs border-b border-black pb-1 hover:text-zen-green hover:border-zen-green transition">
              去体验第一次诊断
            </Link>
          </div>
        ) : (
          <div className="space-y-8 relative">
            {/* 左侧时间轴线 */}
            <div className="absolute left-[19px] top-4 bottom-4 w-[1px] bg-zen-black/10"></div>

            {list.map((item) => (
              <div key={`${item.type}-${item.id}`} className="relative pl-12 group">
                
                {/* 时间点图标 */}
                <div className={`absolute left-0 top-0 w-10 h-10 rounded-full border-4 border-zen-bg flex items-center justify-center z-10 transition-colors
                  ${item.type === 'space' ? 'bg-zen-green/20 text-zen-green' : 'bg-zen-gold/20 text-zen-gold'}
                `}>
                  {item.type === 'space' ? <Home className="w-4 h-4" /> : <Compass className="w-4 h-4" />}
                </div>

                {/* 卡片内容 */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-zen-black/5 hover:shadow-md transition cursor-pointer">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] tracking-widest opacity-40 bg-zen-black/5 px-2 py-1 rounded">
                      {formatDate(item.date)}
                    </span>
                    {item.score && (
                      <span className={`text-lg font-bold ${item.score >= 80 ? 'text-zen-green' : 'text-zen-gold'}`}>
                        {item.score}分
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-medium mb-2">{item.title}</h3>
                  
                  {item.query && (
                    <p className="text-xs opacity-50 mb-3 bg-zen-bg p-2 rounded">问：{item.query}</p>
                  )}

                  <p className="text-sm opacity-60 line-clamp-2 leading-relaxed">
                    {item.type === 'space' ? item.detail?.summary : item.detail?.analysis}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}