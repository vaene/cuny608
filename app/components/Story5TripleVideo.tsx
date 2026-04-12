'use client';

import React, { useRef } from 'react';

const videos = [
  { title: 'Temperature AND', src: '/videos/Temperature.mp4' },
  { title: 'Tornado AND', src: '/videos/Tornado.mp4' },
  { title: 'Hurricane ...', src: '/videos/Hurricane.mp4' },
];

const Story5TripleVideo: React.FC = () => {
  const videoRefs = useRef<HTMLVideoElement[]>([]);

  return (
    <div className="w-full flex flex-col items-center justify-center py-4">
      <div
        className="mb-6 text-4xl font-semibold text-rose-300"
        style={{
          animation: 'fadeUp 700ms ease forwards',
          animationDelay: '5300ms',
          opacity: 0,
        }}
      >
        Oh my!
      </div>

      <div className="w-full max-w-6xl bg-slate-900 rounded border border-slate-700 p-4">
        <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-4">
          {videos.map((video, index) => (
            <div
              key={video.title}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3"
              style={{
                animation: 'fadeUp 700ms ease forwards',
                animationDelay: `${1000 + index * 1050}ms`,
                opacity: 0,
              }}
            >
              <div className="text-xs font-semibold text-slate-300 uppercase tracking-wide mb-2">
                {video.title}
              </div>
              <div className="w-full bg-black rounded-lg overflow-hidden aspect-[4/5]">
                <video
                  className="w-full h-full object-cover"
                  src={video.src}
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="auto"
                  ref={(el) => {
                    if (el) videoRefs.current[index] = el;
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeUp {
          0% {
            opacity: 0;
            transform: translateY(14px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default Story5TripleVideo;
