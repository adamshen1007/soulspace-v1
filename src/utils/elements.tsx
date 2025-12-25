import { Leaf, Flame, Droplets, Mountain, Coins, Wind } from "lucide-react";

// 定义五行对应的视觉主题
export const getElementTheme = (element: string) => {
  // 简单的模糊匹配，防止 AI 返回 "五行属木" 导致匹配失败
  const el = element || "";
  
  if (el.includes("木")) {
    return { 
      name: "木 (Wood)",
      icon: Leaf, 
      color: "text-zen-green", 
      border: "border-zen-green",
      bg: "bg-zen-green/10",
      desc: "生机 · 向上 · 疗愈"
    };
  }
  if (el.includes("火")) {
    return { 
      name: "火 (Fire)",
      icon: Flame, 
      color: "text-zen-red", 
      border: "border-zen-red",
      bg: "bg-zen-red/10",
      desc: "活力 · 温暖 · 升腾"
    };
  }
  if (el.includes("水")) {
    return { 
      name: "水 (Water)",
      icon: Droplets, 
      color: "text-blue-400", 
      border: "border-blue-400",
      bg: "bg-blue-400/10",
      desc: "智慧 · 流动 · 滋润"
    };
  }
  if (el.includes("土")) {
    return { 
      name: "土 (Earth)",
      icon: Mountain, 
      color: "text-stone-500", 
      border: "border-stone-500",
      bg: "bg-stone-500/10",
      desc: "承载 · 稳重 · 包容"
    };
  }
  if (el.includes("金")) {
    return { 
      name: "金 (Metal)",
      icon: Coins, 
      color: "text-zen-gold", 
      border: "border-zen-gold",
      bg: "bg-zen-gold/10",
      desc: "秩序 · 收敛 · 决断"
    };
  }

  // 默认 (风)
  return { 
    name: "气 (Qi)",
    icon: Wind, 
    color: "text-zen-black", 
    border: "border-zen-black",
    bg: "bg-zen-black/5",
    desc: "流转 · 平衡"
  };
};