import { useEffect, useState } from "react";

export default function Compass({ score, loading }: { score?: number; loading?: boolean }) {
  // 根据分数决定罗盘的光晕颜色
  const getColor = (s: number) => {
    if (s >= 80) return "text-zen-green border-zen-green shadow-zen-green/30";
    if (s >= 60) return "text-zen-gold border-zen-gold shadow-zen-gold/30";
    return "text-zen-red border-zen-red shadow-zen-red/30";
  };

  const baseColor = score ? getColor(score) : "text-zen-black/20 border-zen-black/10";

  return (
    <div className="relative w-64 h-64 md:w-80 md:h-80 flex items-center justify-center mx-auto my-10">
      
      {/* 1. 外层光环 (呼吸效果) */}
      <div className={`absolute inset-0 rounded-full border border-current opacity-20 ${baseColor} ${loading ? 'animate-ping' : ''}`}></div>
      
      {/* 2. 乾坤圈 (旋转动画) */}
      <div className={`absolute inset-4 border border-dashed rounded-full ${baseColor} transition-all duration-1000
        ${loading ? "animate-spin-slow opacity-50" : "opacity-30"}`} 
      >
        {/* 装饰性刻度 */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-2 bg-current"></div>
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-2 bg-current"></div>
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-1 bg-current"></div>
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-1 bg-current"></div>
      </div>

      {/* 3. 内层八卦盘 (反向旋转) */}
      <div className={`absolute inset-12 border border-dotted rounded-full ${baseColor} opacity-40 
        ${loading ? "animate-[spin_4s_linear_infinite_reverse]" : ""}`}
      ></div>

      {/* 4. 核心数值显示区 */}
      <div className="z-10 text-center relative backdrop-blur-sm p-6 rounded-full">
        {loading ? (
          <div className="flex flex-col items-center animate-pulse">
            <span className="text-4xl mb-2">☯</span>
            <span className="text-xs tracking-[0.2em] text-zen-black/50">读取场能...</span>
          </div>
        ) : score !== undefined ? (
          <div className="flex flex-col items-center animate-breathe">
            <span className="text-xs text-zen-black/40 tracking-[0.2em] mb-1">灵境指数</span>
            <span className={`text-6xl font-light tracking-tighter ${baseColor.split(' ')[0]}`}>
              {score}
            </span>
            <div className="w-8 h-[1px] bg-current opacity-30 my-2"></div>
            <span className="text-xs text-zen-black/30">满分 100</span>
          </div>
        ) : (
          <div className="text-zen-black/20">
            <div className="w-16 h-16 border border-current rounded-full mx-auto mb-2 opacity-50 flex items-center justify-center text-2xl">
              📷
            </div>
            <span className="text-xs tracking-widest">待上传</span>
          </div>
        )}
      </div>
    </div>
  );
}