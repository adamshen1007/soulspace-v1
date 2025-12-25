"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { UserButton } from "@clerk/nextjs";
import { 
  Upload, Sparkles, RefreshCcw, Camera, 
  ArrowLeft, Share2, Download, Scan, Eye, Wind, Loader2
} from "lucide-react";
// 👇 1. 引入 html2canvas
import html2canvas from 'html2canvas';

import PricingModal from "../../components/PricingModal";

export default function AnalyzePage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  // 👇 2. 新增一个 Ref，用于指向要截图的区域
  const resultRef = useRef<HTMLDivElement>(null);

  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  // 新增：保存/分享时的 loading 状态
  const [isSaving, setIsSaving] = useState(false);
  
  const [showPaywall, setShowPaywall] = useState(false);

  const [loadingText, setLoadingText] = useState("正在建立能量链接...");
  useEffect(() => {
    if (!loading) return;
    const texts = [
      "正在建立能量链接...",
      "感应《阳宅三要》之理...",
      "扫描空间气场流动...",
      "正在与古老智慧共鸣..."
    ];
    let i = 0;
    const timer = setInterval(() => {
      i = (i + 1) % texts.length;
      setLoadingText(texts[i]);
    }, 1500); 
    return () => clearInterval(timer);
  }, [loading]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setImage(e.target?.result as string);
      reader.readAsDataURL(file);
      setResult(null);
    }
  };

  const handleAnalyze = async () => {
    if (!fileInputRef.current?.files?.[0]) return;
    setLoading(true);
    setResult(null);
    try {
      const formData = new FormData();
      formData.append("image", fileInputRef.current.files[0]);
      const res = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });
      if (res.status === 402) {
        setShowPaywall(true); 
        setLoading(false);   
        return;
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "诊断失败");
      setResult(data.data);
    } catch (error: any) {
      console.error(error);
      alert(error.message || "连接时空失败，请重试");
    } finally {
      setLoading(false);
    }
  };

  // 👇👇👇 新增核心功能：生成图片 URL 👇👇👇
  const generateImage = async () => {
    if (!resultRef.current) return null;
    setIsSaving(true);
    try {
      // 调用 html2canvas 截图
      const canvas = await html2canvas(resultRef.current, {
        scale: 2, // 提高分辨率，让图片更清晰
        useCORS: true, // 允许跨域图片 (虽然这里没用到外部图片，但加上保险)
        backgroundColor: '#F5F5F0', // 确保背景色是我们的米色
      });
      const imageBase64 = canvas.toDataURL("image/png");
      return imageBase64;
    } catch (err) {
      console.error("生成图片失败:", err);
      alert("生成灵境海报失败，请重试");
      return null;
    } finally {
      setIsSaving(false);
    }
  };

  // 👇 功能 A：保存图片到本地
  const handleSave = async () => {
    const imageBase64 = await generateImage();
    if (!imageBase64) return;

    // 创建一个虚拟的下载链接并点击它
    const link = document.createElement('a');
    link.href = imageBase64;
    link.download = `灵境诊断报告_${new Date().toISOString().slice(0, 10)}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 👇 功能 B：调用系统分享 (优先) 或保存图片
  const handleShare = async () => {
    const imageBase64 = await generateImage();
    if (!imageBase64) return;

    // 将 base64 转回 Blob 文件对象，以便分享
    const fetchRes = await fetch(imageBase64);
    const blob = await fetchRes.blob();
    const file = new File([blob], "soulspace_report.png", { type: "image/png" });

    // 尝试调用原生分享 API (主要在手机 Safari/Chrome 有效)
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          title: '灵境 · 空间诊断报告',
          text: '这是我的空间能量诊断结果，快来看看！',
          files: [file],
        });
      } catch (err) {
        console.log("分享取消或失败", err);
      }
    } else {
      // 如果不支持原生分享，就降级为下载图片
      handleSave();
      alert("已为您保存海报图片，请手动分享");
    }
  };
  // 👆👆👆

  return (
    <div className="min-h-screen bg-zen-bg font-serif text-zen-black pb-24 selection:bg-zen-gold/30 relative overflow-x-hidden">
      {/* 背景光晕保持不变 */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-40">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-zen-gold/10 rounded-full blur-[100px] animate-pulse-slow" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-zen-green/5 rounded-full blur-[80px] animate-pulse-slower delay-1000" />
      </div>

      {/* 顶部导航保持不变 */}
      <nav className="fixed top-0 left-0 w-full p-6 bg-zen-bg/80 backdrop-blur-md z-30 flex justify-between items-center border-b border-zen-black/5">
        <Link href="/" className="flex items-center text-xs tracking-widest opacity-60 hover:opacity-100 transition group">
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" /> 
          归位
        </Link>
        <span className="text-xs tracking-[0.3em] uppercase opacity-40 absolute left-1/2 -translate-x-1/2 hidden md:block">
          Space Energy
        </span>
        <div className="scale-75 origin-right">
          <UserButton afterSignOutUrl="/" />
        </div>
      </nav>

      <main className="pt-32 max-w-2xl mx-auto px-6 relative z-10">
        {/* 标题区保持不变 */}
        {!result && (
          <header className={`text-center mb-12 transition-all duration-700 ${loading ? 'opacity-0 translate-y-4' : 'opacity-100 animate-fade-in-up'}`}>
            <h1 className="text-4xl font-light mb-4 text-zen-black tracking-widest">空间诊断</h1>
            <div className="flex items-center justify-center gap-2 text-xs text-zen-black/40 tracking-[0.2em] opacity-60">
              <Eye className="w-3 h-3" />
              <span>感知</span>
              <span className="w-1 h-1 rounded-full bg-zen-black/20"></span>
              <Wind className="w-3 h-3" />
              <span>气场</span>
            </div>
          </header>
        )}

        {/* 图片容器保持不变 */}
        <div className={`relative transition-all duration-1000 ease-out ${result ? 'mb-12' : ''}`}>
          <div 
            onClick={() => !loading && fileInputRef.current?.click()}
            className={`
              relative w-full rounded-3xl overflow-hidden cursor-pointer 
              transition-all duration-700 border group
              ${image 
                ? 'aspect-video shadow-2xl border-zen-black/5' 
                : 'aspect-[4/3] border-dashed border-zen-black/10 hover:border-zen-gold/50 bg-white/30 backdrop-blur-sm'
              }
              ${loading ? 'scale-95 opacity-80 border-zen-gold/50 shadow-[0_0_30px_rgba(212,175,55,0.2)]' : 'scale-100'}
            `}
          >
            <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*"/>
            {image ? (
              <>
                <Image src={image} alt="Space" fill className="object-cover transition-transform duration-[20s] ease-linear hover:scale-110" />
                {!loading && !result && (
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/20 to-transparent translate-y-[-100%] animate-scan pointer-events-none" />
                )}
                {!loading && (
                  <div className="absolute top-4 right-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                     <div className="bg-black/30 backdrop-blur-md text-white p-2 rounded-full hover:bg-zen-black transition">
                        <RefreshCcw className="w-4 h-4" />
                     </div>
                  </div>
                )}
              </>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="w-20 h-20 rounded-full border border-zen-black/5 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:border-zen-gold/30 transition-all duration-500 relative">
                  <div className="absolute inset-0 rounded-full border border-zen-black/5 scale-125 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-700"></div>
                  <Camera className="w-6 h-6 text-zen-black/30 group-hover:text-zen-gold transition-colors" />
                </div>
                <p className="text-xs text-zen-black/40 tracking-[0.2em] group-hover:text-zen-gold/80 transition-colors">
                  点击上传空间照片
                </p>
              </div>
            )}
            {loading && (
              <div className="absolute inset-0 bg-zen-bg/40 backdrop-blur-[2px] z-10 flex items-center justify-center">
                 <div className="w-full h-full absolute inset-0 bg-gradient-to-t from-zen-bg via-transparent to-zen-bg opacity-80"></div>
              </div>
            )}
          </div>
          {image && !result && !loading && (
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 z-20 animate-fade-in-up">
              <button 
                onClick={(e) => { e.stopPropagation(); handleAnalyze(); }}
                className="group relative px-10 py-4 bg-zen-black text-white rounded-full text-xs tracking-[0.2em] shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 overflow-hidden"
              >
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:animate-shine"></div>
                <span className="relative flex items-center gap-3">
                  <Scan className="w-4 h-4" /> 开始诊断
                </span>
              </button>
            </div>
          )}
        </div>

        {/* Loading 保持不变 */}
        {loading && (
          <div className="py-12 text-center animate-pulse-slow">
            <div className="relative w-16 h-16 mx-auto mb-8 flex items-center justify-center">
              <div className="absolute inset-0 border border-zen-gold/30 rounded-full animate-ping-slow"></div>
              <div className="absolute inset-2 border border-zen-gold/50 rounded-full animate-spin-slow"></div>
              <Sparkles className="w-6 h-6 text-zen-gold animate-pulse" />
            </div>
            <p className="text-xs text-zen-black/50 tracking-[0.2em] font-light min-h-[1.5em] transition-opacity duration-500">
              {loadingText}
            </p>
          </div>
        )}

        {/* 📜 4. 诊断结果：需要被截图的区域 */}
        {/* 👇👇👇 重点：给最外层加 ref，并设置背景色，确保截图完整 */}
        {result && (
          <div ref={resultRef} className="animate-fade-in-slow space-y-12 bg-zen-bg p-4 -m-4 rounded-[3rem]">
            
            {/* 核心分数卡 - 罗盘设计 */}
            <div className="relative bg-white p-8 md:p-12 rounded-[2rem] shadow-2xl border border-zen-black/5 overflow-hidden group">
              {/* 背景纹理 */}
              <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] pointer-events-none"></div>
              <div className="absolute top-0 right-0 w-64 h-64 bg-zen-gold/5 rounded-full blur-[60px] translate-x-1/3 -translate-y-1/3"></div>

              <div className="flex flex-col md:flex-row gap-10 items-center">
                
                {/* 罗盘分数 */}
                <div className="relative w-40 h-40 flex-shrink-0 flex items-center justify-center">
                  <svg className="absolute inset-0 w-full h-full animate-spin-veryslow opacity-20" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="48" stroke="currentColor" strokeWidth="0.5" fill="none" strokeDasharray="4 4" />
                    <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="0.5" fill="none" />
                  </svg>
                  <div className="relative text-center z-10">
                    <span className="block text-6xl font-light text-zen-black font-serif tracking-tighter">{result.score}</span>
                    <span className="block text-[10px] text-zen-gold tracking-[0.3em] uppercase mt-1">Energy</span>
                  </div>
                  {/* 动态圆环进度 */}
                  <svg className="absolute inset-0 w-full h-full -rotate-90">
                     <circle cx="50" cy="50" r="44" stroke="#eee" strokeWidth="2" fill="none" />
                     <circle 
                       cx="50" cy="50" r="44" 
                       stroke="var(--zen-gold)" strokeWidth="2" fill="none" 
                       strokeDasharray="276"
                       strokeDashoffset={276 - (276 * result.score) / 100}
                       className="transition-all duration-[2s] ease-out"
                     />
                  </svg>
                </div>
                
                {/* 判词 */}
                <div className="flex-1 text-center md:text-left">
                  <div className="mb-4">
                     <h2 className="text-xs font-bold text-zen-gold uppercase tracking-widest mb-2">Diagnosis Summary</h2>
                     <div className="w-12 h-[1px] bg-zen-black/10 mx-auto md:mx-0"></div>
                  </div>
                  <p className="text-lg leading-relaxed text-zen-black/80 font-serif italic relative">
                    <span className="text-3xl text-zen-gold/30 absolute -top-4 -left-4 font-serif">“</span>
                    {result.summary}
                    <span className="text-3xl text-zen-gold/30 absolute -bottom-4 -right-0 font-serif rotate-180">“</span>
                  </p>
                </div>
              </div>

              {/* 维度条 */}
              <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 pt-8 border-t border-zen-black/5">
                {result.dimensions && Object.entries(result.dimensions).map(([key, value]: any, i) => (
                  <div key={key} className="flex items-center gap-4 group/item" style={{ transitionDelay: `${i * 100}ms` }}>
                    <span className="text-[10px] uppercase tracking-widest w-20 text-right opacity-50">{key}</span>
                    <div className="flex-1 h-1 bg-zen-black/5 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-zen-black/60 rounded-full transition-all duration-[1.5s] ease-out group-hover/item:bg-zen-gold" 
                        style={{ width: `${value}%` }}
                      ></div>
                    </div>
                    <span className="text-xs font-bold opacity-30 w-8">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 建议列表 */}
            {result.issues && result.issues.length > 0 && (
              <div className="space-y-6">
                <div className="flex items-center justify-center gap-4 opacity-40">
                   <div className="h-[1px] w-12 bg-zen-black"></div>
                   <span className="text-xs tracking-[0.3em] uppercase">Guidance</span>
                   <div className="h-[1px] w-12 bg-zen-black"></div>
                </div>
                
                {result.issues.map((issue: any, i: number) => (
                  <div key={i} className="bg-white/60 backdrop-blur-sm p-6 rounded-2xl border border-zen-black/5 hover:bg-white hover:shadow-lg hover:border-zen-gold/20 transition-all duration-500 group">
                    <div className="flex items-start gap-4">
                      <div className="text-xs font-serif text-zen-gold/50 mt-1">0{i + 1}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-medium text-zen-black">{issue.title}</h4>
                          <span className="text-[9px] px-2 py-0.5 rounded-full border border-zen-black/10 text-zen-black/40 uppercase tracking-wider">
                            {issue.type}
                          </span>
                        </div>
                        <p className="text-sm text-zen-black/60 leading-relaxed mb-4">
                          {issue.description}
                        </p>
                        
                        {issue.suggestion && (
                          <div className="relative overflow-hidden bg-zen-bg p-4 rounded-xl border border-zen-black/5 group-hover:border-zen-gold/10 transition-colors">
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-zen-gold opacity-30"></div>
                            <div className="flex gap-3">
                              <Sparkles className="w-4 h-4 text-zen-gold mt-0.5 flex-shrink-0" />
                              <div className="text-sm text-zen-black/80 italic">
                                {issue.suggestion}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* 👇 海报底部品牌标识 (仅截图时显示，增加仪式感) */}
            <div className="text-center pt-8 pb-4 opacity-40">
              <p className="text-[10px] tracking-[0.5em] uppercase">灵境 · SoulSpace</p>
              <p className="text-[8px] mt-1 tracking-widest">AI DRIVEN MINDFULNESS</p>
            </div>

          </div>
        )}

        {/* 👇 底部按钮：修改为调用 handleSave 和 handleShare */}
        {result && (
          <div className="flex justify-center gap-6 py-8 opacity-80 hover:opacity-100 transition-opacity duration-500 relative z-20">
             <button 
               onClick={handleSave} 
               disabled={isSaving}
               className="flex flex-col items-center gap-2 group disabled:opacity-50"
             >
               <div className="w-10 h-10 rounded-full border border-zen-black/10 flex items-center justify-center group-hover:bg-zen-black group-hover:text-white transition-all bg-white">
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
               </div>
               <span className="text-[10px] tracking-widest">保存海报</span>
             </button>
             <button 
               onClick={handleShare}
               disabled={isSaving}
               className="flex flex-col items-center gap-2 group disabled:opacity-50"
             >
               <div className="w-10 h-10 rounded-full border border-zen-black/10 flex items-center justify-center group-hover:bg-zen-black group-hover:text-white transition-all bg-white">
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Share2 className="w-4 h-4" />}
               </div>
               <span className="text-[10px] tracking-widest">一键分享</span>
             </button>
          </div>
        )}

      </main>

      {showPaywall && <PricingModal onClose={() => setShowPaywall(false)} />}
    </div>
  );
}