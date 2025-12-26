"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { UserButton } from "@clerk/nextjs";
import { 
  Upload, Sparkles, RefreshCcw, Camera, 
  ArrowLeft, Share2, Download, Scan, Eye, Wind, Loader2, Compass
} from "lucide-react";
import html2canvas from 'html2canvas';

import PricingModal from "../../components/PricingModal";

export default function AnalyzePage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  // 指向要截图的区域
  const resultRef = useRef<HTMLDivElement>(null);

  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
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

  // 生成图片 URL
  const generateImage = async () => {
    if (!resultRef.current) return null;
    setIsSaving(true);
    try {
      const canvas = await html2canvas(resultRef.current, {
        scale: 3, // 高清
        useCORS: true, 
        backgroundColor: null, // 透明背景，保留阴影效果
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

  const handleSave = async () => {
    const imageBase64 = await generateImage();
    if (!imageBase64) return;

    const link = document.createElement('a');
    link.href = imageBase64;
    link.download = `灵境空间诊断_${new Date().toISOString().slice(0, 10)}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShare = async () => {
    const imageBase64 = await generateImage();
    if (!imageBase64) return;

    const fetchRes = await fetch(imageBase64);
    const blob = await fetchRes.blob();
    const file = new File([blob], "soulspace_report.png", { type: "image/png" });

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
      handleSave();
      alert("已为您保存海报图片，请手动分享");
    }
  };

  return (
    <div className="min-h-screen bg-zen-bg font-serif text-zen-black pb-24 selection:bg-zen-gold/30 relative overflow-x-hidden">
      {/* 氛围背景 */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-40">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-zen-gold/10 rounded-full blur-[100px] animate-pulse-slow" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-zen-green/5 rounded-full blur-[80px] animate-pulse-slower delay-1000" />
      </div>

      {/* 顶部导航 */}
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
        {/* 标题区 */}
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

        {/* 图片容器 */}
        <div className={`relative transition-all duration-1000 ease-out ${result ? 'mb-8 opacity-0 h-0 overflow-hidden' : ''}`}>
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

        {/* Loading */}
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

        {/* 📜 4. 诊断结果卡片 (小红书/Ins 风格) */}
        {/* 👇👇👇 核心修改区域：全新设计的卡片结构 👇👇👇 */}
        {result && (
          <div className="animate-fade-in-slow py-8">
            <div 
              ref={resultRef} 
              className="relative bg-white rounded-[3rem] p-8 md:p-12 shadow-[0_20px_60px_-15px_rgba(212,175,55,0.15)] border border-stone-100 overflow-hidden"
            >
              {/* 装饰：顶部和纸胶带效果 */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-8 bg-zen-gold/10 rotate-3 blur-[1px] rounded-b-xl z-0"></div>

              {/* 头部：照片与标题 */}
              <div className="relative z-10 flex flex-col items-center mb-10">
                <div className="w-32 h-20 md:w-40 md:h-24 rounded-2xl border-4 border-white shadow-xl overflow-hidden relative mb-6 rotate-[-2deg]">
                  {image && <Image src={image} alt="Room Space" fill className="object-cover" />}
                </div>
                <h3 className="text-sm tracking-[0.3em] text-zen-black font-bold uppercase">
                  灵境 · 空间诊断
                </h3>
                <p className="text-[10px] text-zen-gold tracking-[0.2em] mt-2">
                  {new Date().toLocaleDateString('zh-CN').replace(/\//g, '.')}
                </p>
              </div>

              {/* 核心分数卡 (样式微调，融入白色背景) */}
              <div className="relative bg-zen-bg/50 p-8 rounded-[2.5rem] mb-10">
                <div className="flex flex-col md:flex-row gap-10 items-center">
                  
                  {/* 罗盘分数 */}
                  <div className="relative w-36 h-36 flex-shrink-0 flex items-center justify-center">
                    <svg className="absolute inset-0 w-full h-full animate-spin-veryslow opacity-20" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="48" stroke="currentColor" strokeWidth="0.5" fill="none" strokeDasharray="4 4" />
                      <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="0.5" fill="none" />
                    </svg>
                    <div className="relative text-center z-10">
                      <span className="block text-5xl font-light text-zen-black font-serif tracking-tighter">{result.score}</span>
                      <span className="block text-[9px] text-zen-gold tracking-[0.3em] uppercase mt-1">Energy</span>
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
                    <h2 className="text-xs font-bold text-zen-gold uppercase tracking-widest mb-4">Diagnosis Summary</h2>
                    <p className="text-base leading-relaxed text-zen-black/80 font-serif italic relative px-4 md:px-0">
                      <span className="text-2xl text-zen-gold/30 absolute -top-3 -left-2 font-serif">“</span>
                      {result.summary}
                      <span className="text-2xl text-zen-gold/30 absolute -bottom-3 right-0 font-serif rotate-180">“</span>
                    </p>
                  </div>
                </div>

                {/* 维度条 */}
                <div className="mt-8 grid grid-cols-1 gap-y-4 pt-6 border-t border-zen-black/5">
                  {result.dimensions && Object.entries(result.dimensions).map(([key, value]: any, i) => (
                    <div key={key} className="flex items-center gap-4">
                      <span className="text-[9px] uppercase tracking-widest w-16 text-right opacity-50">{key}</span>
                      <div className="flex-1 h-1.5 bg-white rounded-full overflow-hidden shadow-sm">
                        <div 
                          className="h-full bg-gradient-to-r from-zen-gold/60 to-zen-gold rounded-full" 
                          style={{ width: `${value}%` }}
                        ></div>
                      </div>
                      <span className="text-xs font-bold opacity-40 w-6 text-right">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 建议列表 (Ins 风标签样式) */}
              {result.issues && result.issues.length > 0 && (
                <div className="space-y-8">
                  <div className="text-center">
                     <span className="inline-block text-xs tracking-[0.3em] uppercase border-b border-zen-gold/30 pb-2">Guidance 空间指引</span>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4">
                    {result.issues.map((issue: any, i: number) => (
                      <div key={i} className="bg-zen-bg/30 p-5 rounded-2xl flex items-start gap-4">
                        <div className="flex-shrink-0 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm text-zen-gold">
                          <Compass className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-medium text-sm text-zen-black">{issue.title}</h4>
                            <span className="text-[9px] px-2 py-0.5 rounded-full bg-white text-zen-black/60 font-serif shadow-sm">
                              {issue.type}
                            </span>
                          </div>
                          <p className="text-xs text-zen-black/70 leading-relaxed text-justify mb-3">
                            {issue.description}
                          </p>
                          {issue.suggestion && (
                            <div className="text-[10px] text-zen-black/50 italic bg-white/50 p-2 rounded-lg border border-white">
                              💡 建议：{issue.suggestion}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* 底部品牌 (截图专用) */}
              <div className="text-center pt-10 pb-2 opacity-30">
                <p className="text-[8px] tracking-[0.5em] uppercase flex items-center justify-center gap-2">
                  <Wind className="w-3 h-3" />
                  SoulSpace AI Lab
                </p>
              </div>

            </div>
          </div>
        )}
        {/* 👆👆👆 卡片结构结束 👆👆👆 */}

        {/* 底部按钮 */}
        {result && (
          <div className="flex justify-center gap-6 pb-12 opacity-90 hover:opacity-100 transition-opacity duration-500 relative z-20 -mt-4">
             <button 
               onClick={handleSave} 
               disabled={isSaving}
               className="flex flex-col items-center gap-2 group disabled:opacity-50"
             >
               <div className="w-12 h-12 rounded-full bg-zen-black flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-all">
                  {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
               </div>
               <span className="text-[10px] tracking-widest font-bold">保存美图</span>
             </button>
             <button 
               onClick={handleShare}
               disabled={isSaving}
               className="flex flex-col items-center gap-2 group disabled:opacity-50"
             >
               <div className="w-12 h-12 rounded-full bg-zen-gold flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-all">
                  {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Share2 className="w-5 h-5" />}
               </div>
               <span className="text-[10px] tracking-widest font-bold">去晒单</span>
             </button>
          </div>
        )}

      </main>

      {showPaywall && <PricingModal onClose={() => setShowPaywall(false)} />}
    </div>
  );
}