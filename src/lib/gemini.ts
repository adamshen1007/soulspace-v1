// src/lib/gemini.ts
import { GoogleGenerativeAI } from "@google/generative-ai";
import { setGlobalDispatcher, ProxyAgent } from 'undici';

const API_KEY = process.env.GOOGLE_API_KEY;
// 👇 这里假设你的代理端口是 7890 (Clash 默认)。如果是其他软件(如 V2Ray)，可能是 1080或10809，请自行修改。
const PROXY_URL = "http://127.0.0.1:7890"; 

// 强制设置全局代理 (只在开发环境生效，Vercel 部署后不需要)
if (process.env.NODE_ENV === 'development') {
  try {
    const dispatcher = new ProxyAgent(PROXY_URL);
    setGlobalDispatcher(dispatcher);
    console.log(`🔌 Gemini 代理已挂载: ${PROXY_URL}`);
  } catch (e) {
    console.error("❌ 代理设置失败:", e);
  }
}

if (!API_KEY) {
  throw new Error("请在 .env.local 中设置 GOOGLE_API_KEY");
}

const genAI = new GoogleGenerativeAI(API_KEY);

// 导出配置好的 model 获取函数，避免重复写 model name
export const getGeminiModel = () => {
  return genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
};
