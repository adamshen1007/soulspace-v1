import type { Config } from "tailwindcss";

const config: Config = {
  // ✅ 保持这个路径配置，因为刚才测试通过了！
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // 灵境·五行色系 (低饱和度新中式)
        'zen-green': '#A6CBAF',   // 青瓷绿 (木 - 疗愈)
        'zen-red': '#D69E96',     // 朱砂红 (火 - 温暖)
        'zen-black': '#2C2F33',   // 玄黑   (水 - 沉静)
        'zen-gold': '#E6CFA1',    // 赤金   (金 - 秩序)
        'zen-white': '#F5F5F3',   // 云白   (土 - 包容)
        'zen-bg': '#F9F9F7',      // 宣纸底色
      },
      animation: {
        'breathe': 'breathe 8s ease-in-out infinite', // 呼吸
        'float': 'float 10s ease-in-out infinite',    // 悬浮
        'mist': 'mist 20s linear infinite',           // 烟雾流转
        'spin-slow': 'spin 12s linear infinite',      // 罗盘慢转
      },
      keyframes: {
        breathe: {
          '0%, 100%': { opacity: '0.8', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.02)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        mist: {
          '0%': { backgroundPosition: '0% 50%' },
          '100%': { backgroundPosition: '100% 50%' },
        }
      },
    },
  },
  plugins: [],
};
export default config;