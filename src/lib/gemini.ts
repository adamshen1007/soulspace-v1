import { GoogleGenerativeAI } from "@google/generative-ai";
// 引入 Next.js 内置的 server-only 防止泄露到前端
import "server-only";

// 定义你的本地代理地址 (Clash 默认是 7890)
// 如果你的 VPN 端口不是 7890，请修改这里！
const LOCAL_PROXY = "http://127.0.0.1:7890"; 

export function getGeminiModel() {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    throw new Error("Missing GOOGLE_API_KEY in environment variables");
  }

  // 🌍 1. 生产环境 (Vercel): 直连 Google
  if (process.env.NODE_ENV === "production") {
    return new GoogleGenerativeAI(apiKey).getGenerativeModel({ 
      model: "gemini-2.5-flash" 
    });
  }

  // 🏠 2. 本地开发环境 (Local): 强制走代理
  // 我们通过修改全局 fetch 的 dispatcher 来实现
  try {
    const { ProxyAgent, setGlobalDispatcher } = require("undici");
    
    // 创建一个代理 Agent
    const dispatcher = new ProxyAgent(LOCAL_PROXY);
    
    // 设置为全局 Dispatcher (让所有 fetch 请求都走这个代理)
    setGlobalDispatcher(dispatcher);
    
    console.log(`[Dev Mode] 🚀 已挂载本地代理: ${LOCAL_PROXY}`);
  } catch (error) {
    console.warn("[Dev Mode] ⚠️ 无法挂载代理 (可能缺少 undici 包)，尝试直连...");
  }

  return new GoogleGenerativeAI(apiKey).getGenerativeModel({ 
    model: "gemini-2.5-flash" 
  });
}
