import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// 定义哪些路由是公共的 (不登录也能看首页)
const isPublicRoute = createRouteMatcher(['/api(.*)', '/']); // 为了方便调试，暂时让 API 也是公开的，我们在 API 内部做校验

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    // 如果不是公共路由，强制跳转登录页
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // 排除静态资源
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};