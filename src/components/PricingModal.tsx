"use client";
import { X, Check, Zap } from "lucide-react";

export default function PricingModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-zen-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition">
          <X className="w-5 h-5 opacity-50" />
        </button>

        <div className="p-8 text-center">
          <div className="w-16 h-16 bg-zen-gold/20 rounded-full flex items-center justify-center mx-auto mb-6 text-zen-gold">
            <Zap className="w-8 h-8 fill-current" />
          </div>
          <h2 className="text-2xl font-serif text-zen-black mb-2">补充灵石</h2>
          <p className="text-sm text-zen-black/50 mb-8">
            您的免费体验次数已用完。<br/>请补充灵石以继续探索时空能量。
          </p>

          <div className="space-y-4">
            {/* 套餐 A */}
            <div className="border border-zen-black/10 rounded-xl p-4 flex items-center justify-between hover:border-zen-gold transition cursor-pointer group">
              <div className="text-left">
                <div className="font-bold text-lg">9.9元 <span className="text-xs font-normal opacity-50">/ 10次</span></div>
                <div className="text-xs text-zen-green">新手推荐</div>
              </div>
              <button className="px-4 py-1.5 rounded-full bg-zen-black text-white text-xs group-hover:bg-zen-gold transition">
                购买
              </button>
            </div>

            {/* 套餐 B */}
            <div className="border border-zen-gold/50 bg-zen-gold/5 rounded-xl p-4 flex items-center justify-between cursor-pointer relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-zen-gold text-white text-[10px] px-2 py-0.5 rounded-bl-lg">热销</div>
              <div className="text-left">
                <div className="font-bold text-lg">29.9元 <span className="text-xs font-normal opacity-50">/ 35次</span></div>
                <div className="text-xs opacity-50">多送 5 次</div>
              </div>
              <button className="px-4 py-1.5 rounded-full bg-zen-gold text-zen-black text-xs font-bold shadow-lg">
                购买
              </button>
            </div>
          </div>

          <p className="text-[10px] text-center mt-6 opacity-30">
            * 仅为演示，实际并未接入支付
          </p>
        </div>
      </div>
    </div>
  );
}