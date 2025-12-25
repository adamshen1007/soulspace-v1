"use client";

import { useState, useRef, useEffect } from 'react';
import { Volume2, VolumeX, Music } from 'lucide-react';

export default function SonicPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // 🎵 这里换成了一个更稳定的冥想白噪音链接 (来自 Pixabay)
  // 如果你想用本地文件，请把这里改成: "/sounds/zen.mp3" (前提是你把文件放进了 public/sounds 文件夹)
  const SOUND_URL = "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=meditation-impulse-3000.mp3";

  useEffect(() => {
    if (audioRef.current) {
      // 设置初始音量为 0.4 (不要太吵)
      audioRef.current.volume = 0.4;
    }
  }, []);

  const toggleSound = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      // 暂停
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      // 播放 (增加 catch 来捕获浏览器的自动播放限制错误)
      const playPromise = audioRef.current.play();
      
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
          })
          .catch((error) => {
            console.error("播放失败 (可能是浏览器阻止了自动播放):", error);
            // 这里可以加一个 Toast 提示用户
          });
      }
    }
  };

  return (
    <>
      {/* 隐藏的 Audio 标签 - 这是最稳健的写法 */}
      <audio 
        ref={audioRef} 
        src={SOUND_URL} 
        loop // 循环播放
        preload="auto" // 预加载
      />

      {/* 悬浮按钮 */}
      <button 
        onClick={toggleSound}
        className={`fixed bottom-6 right-6 z-50 p-3 rounded-full backdrop-blur-md border transition-all duration-700 ease-out shadow-sm group
          ${isPlaying 
            ? 'bg-zen-green/20 border-zen-green/30 text-zen-black shadow-[0_0_15px_rgba(166,203,175,0.4)]' 
            : 'bg-white/50 border-zen-black/10 text-zen-black/40 hover:bg-white hover:text-zen-black'
          }
        `}
        title={isPlaying ? "暂停疗愈音" : "开启空间听觉疗愈"}
      >
        <div className="relative">
          {isPlaying ? (
            <>
              <Volume2 className="w-5 h-5 animate-pulse" />
              {/* 播放时的音波动画装饰 */}
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-zen-green rounded-full animate-ping opacity-75"></span>
            </>
          ) : (
            <div className="relative">
              <VolumeX className="w-5 h-5" />
              {/* 提示用户点击的微动画 */}
              <span className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-zen-red/50 rounded-full animate-pulse"></span>
            </div>
          )}
        </div>
      </button>
    </>
  );
}