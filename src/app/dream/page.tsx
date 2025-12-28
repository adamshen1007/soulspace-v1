"use client";

import { useState, useRef, useEffect } from "react";
import { Send, ArrowLeft, Loader2, Sparkles, Moon, Wand2 } from "lucide-react";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";

export default function DreamPage() {
  const [history, setHistory] = useState<{ role: "user" | "ai"; content: string }[]>([
    { role: "ai", content: "欢迎来到灵境。请分享你梦境中的片段，无论是模糊的意象还是清晰的场景。" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [finalResult, setFinalResult] = useState<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // 自动滚动到最新消息
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history]);

  const handleSubmit = async () => {
    if (!input.trim() || loading) return;
    const newHistory = [...history, { role: "user", content: input }];
    setHistory(newHistory);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/dream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ history: newHistory }),
      });
      const data = await res.json();
      if (data.is_final) {
        setFinalResult(data.data);
        setHistory([...newHistory, { role: "ai", content: "梦境已重构。请阅览这份来自潜意识的报告。" }]);
      } else {
        setHistory([...newHistory, { role: "ai", content: data.question }]);
      }
    } catch (e) {
      setHistory([...newHistory, { role: "ai", content: "灵性链接中断，请稍后重试。" }]);
    } finally {
      setLoading(false);
    }
  };

  // 处理回车发送
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="min-h-screen bg-zen-bg font-serif text-zen-black selection:bg-zen-gold/30 relative overflow-x-hidden">
      
      {/* 氛围背景 (保持与观相一致) */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-40">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-zen-gold/15 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-blue-100/20 rounded-full blur-[80px]" />
      </div>

      {/* 顶部导航 */}
      <nav className="fixed top-0 left-0 w-full p-6 bg-zen-bg/80 backdrop-blur-md z-30 flex justify-between items-center border-b border-zen-black/5">
        <Link href="/" className="flex items-center text-xs tracking-widest opacity-60 hover:opacity-100 transition group">
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" /> 
          归位
        </Link>
        <span className="text-xs tracking-[0.3em] uppercase opacity-40 absolute left-1/2 -translate-x-1/2 hidden md:block">
          Dream Interpretation
        </span>
        <div className="scale-75 origin-right">
          <UserButton afterSignOutUrl="/" />
        </div>
      </nav>

      <main className="pt-32 max-w-2xl mx-auto px-6 relative z-10 pb-24">
        
        {/* 标题区 */}
        {!finalResult && (
          <header className="text-center mb-12 animate-fade-in-up">
            <h1 className="text-4xl font-light mb-4 text-zen-black tracking-widest">灵境 · 解梦</h1>
            <div className="flex items-center justify-center gap-2 text-xs text-zen-black/40 tracking-[0.2em] opacity-60">
              <Moon className="w-3 h-3" />
              <span>观照</span>
              <span className="w-1 h-1 rounded-full bg-zen-black/20"></span>
              <Wand2 className="w-3 h-3" />
              <span>重构</span>
            </div>
            <p className="mt-6 text-xs text-zen-black/40 tracking-[0.2em] leading-loose">
              诉说梦境片段 · 追溯潜意识深处 · 开启心灵对话
            </p>
          </header>
        )}

        {/* 聊天对话区 */}
        <div className="space-y-6 mb-8">
          <div 
            ref={scrollRef}
            className="bg-white/30 backdrop-blur-md rounded-[2.5rem] p-6 md:p-8 min-h-[400px] max-h-[500px] overflow-y-auto border border-white/20 shadow-sm space-y-6 custom-scrollbar"
          >
            {history.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                <div className={`max-w-[85%] px-5 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                  msg.role === 'user' 
                    ? 'bg-zen-black text-white rounded-tr-none' 
                    : 'bg-white/80 text-zen-black rounded-tl-none border border-black/5'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white/80 px-5 py-3 rounded-2xl animate-pulse flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin opacity-20" />
                  <span className="text-[10px] tracking-widest opacity-40">正在读取场能...</span>
                </div>
              </div>
            )}
          </div>

          {/* 输入框区域 */}
          {!finalResult && (
            <div className="relative group animate-fade-in-up">
              <input 
                value={input} 
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="描述梦境中的一个细节..."
                className="w-full bg-white/80 border border-black/5 rounded-full px-8 py-5 pr-16 shadow-lg focus:outline-none focus:ring-2 ring-zen-gold/20 transition-all font-light"
              />
              <button 
                onClick={handleSubmit}
                disabled={loading || !input.trim()}
                className="absolute right-2 top-2 p-3.5 bg-zen-black text-white rounded-full hover:bg-zen-gold hover:text-zen-black transition-all disabled:opacity-10 shadow-md"
              >
                <Send className="w-5 h-5"/>
              </button>
            </div>
          )}
        </div>

        {/* 最终解梦报告 (卡片风格) */}
        {finalResult && (
          <div className="animate-fade-in-slow space-y-8">
             <div className="bg-white rounded-[3rem] p-8 md:p-12 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.08)] border border-stone-100 overflow-hidden text-center">
                <div className="inline-block px-4 py-1 rounded-full bg-zen-gold/10 text-zen-gold text-[10px] tracking-[0.3em] mb-6 uppercase font-bold">
                  重构 · 梦境意象
                </div>
                <h2 className="text-3xl font-light mb-10 tracking-widest">{finalResult.title}</h2>
                
                {/* 梦境生成图 */}
                <div className="relative aspect-square w-full rounded-[2rem] overflow-hidden mb-12 shadow-2xl group">
                   <img 
                    src={finalResult.imagery.image_url} 
                    alt="Dream Impression" 
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" 
                   />
                   <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-8">
                      <p className="text-white text-[10px] tracking-widest italic opacity-80">{finalResult.imagery.description}</p>
                   </div>
                </div>

                {/* 报告详情 */}
                <div className="grid grid-cols-1 gap-8 text-left">
                   <div className="space-y-4">
                      <h4 className="flex items-center gap-2 text-[10px] font-bold opacity-30 uppercase tracking-[0.2em]"><Sparkles className="w-3 h-3"/> 潜意识解析</h4>
                      <p className="text-sm leading-loose text-zen-black/70 text-justify">{finalResult.interpretation.psychology}</p>
                   </div>
                   <div className="pt-8 border-t border-black/5 space-y-4">
                      <h4 className="flex items-center gap-2 text-[10px] font-bold opacity-30 uppercase tracking-[0.2em]"><Wand2 className="w-3 h-3"/> 灵境启示</h4>
                      <p className="text-sm leading-loose text-zen-black/70 text-justify">{finalResult.interpretation.guidance}</p>
                   </div>
                </div>

                <div className="mt-12 pt-8 border-t border-black/5 opacity-20 flex justify-center items-center gap-2">
                   <Moon className="w-3 h-3" />
                   <span className="text-[8px] tracking-[0.5em] uppercase">SoulSpace Dream Lab</span>
                </div>
             </div>

             <button 
               onClick={() => window.location.reload()}
               className="w-full py-5 rounded-full border border-black/5 text-xs tracking-widest text-zen-black/40 hover:bg-black hover:text-white transition-all"
             >
               重新开启另一段梦境
             </button>
          </div>
        )}
      </main>
    </div>
  );
}