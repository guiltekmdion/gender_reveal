'use client';

import React, { useState, useEffect } from 'react';
import { MessageCircle } from 'lucide-react';
import type { Vote } from '@/lib/storage';
import { detectSentiment } from '@/lib/emoji-detector';
import { sanitizeMessage, cleanMessage } from '@/lib/sanitization';

interface MessageCarouselProps {
  votes: Vote[];
  displayDuration?: number;
  animationType?: 'slide' | 'fade' | 'zoom';
}

export default function MessageCarousel({ 
  votes, 
  displayDuration = 8000,
  animationType = 'slide'
}: MessageCarouselProps) {
  const messagesVotes = votes.filter(v => v.message && v.message.trim().length > 0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  
  // Auto-rotation
  useEffect(() => {
    if (messagesVotes.length <= 1 || isPaused) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % messagesVotes.length);
    }, displayDuration);
    
    return () => clearInterval(interval);
  }, [messagesVotes.length, displayDuration, isPaused]);
  
  if (messagesVotes.length === 0) {
    return (
      <div className="bg-gradient-to-br from-white to-purple-50 rounded-2xl shadow-xl border-2 border-purple-200 h-full flex flex-col items-center justify-center p-8">
        <MessageCircle className="w-16 h-16 text-purple-300 mb-4" />
        <p className="text-xl text-slate-400 font-medium text-center">
          Aucun message pour l&apos;instant
        </p>
        <p className="text-sm text-slate-300 mt-2 text-center">
          Laissez un petit mot avec votre vote !
        </p>
      </div>
    );
  }
  
  const currentVote = messagesVotes[currentIndex];
  const emoji = detectSentiment(currentVote.message || '');
  
  const animationClass = {
    slide: 'animate-slide-in-right',
    fade: 'animate-fade-in',
    zoom: 'animate-pop-in'
  }[animationType];
  
  return (
    <div 
      className="bg-gradient-to-br from-white via-purple-50 to-pink-50 rounded-2xl shadow-xl border-2 border-purple-200 h-full flex flex-col overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Header Compact */}
      <div className="flex items-center gap-2 px-3 py-2 bg-white/50 backdrop-blur-sm border-b border-purple-200">
        <MessageCircle className="w-4 h-4 text-purple-500" />
        <h2 className="text-sm font-black text-purple-700 uppercase tracking-wider">
          Messages
        </h2>
        <div className="ml-auto text-xs text-slate-500 font-medium">
          {currentIndex + 1} / {messagesVotes.length}
        </div>
      </div>
      
      {/* Message Content Compact */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 relative">
        <div 
          key={`${currentVote.id}-${currentIndex}`}
          className={`w-full ${animationClass}`}
        >
          {/* Avatar & Name Compact */}
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-xl font-black shadow-md
              ${currentVote.choice === 'girl' 
                ? 'bg-gradient-to-br from-pink-400 to-pink-600' 
                : 'bg-gradient-to-br from-blue-400 to-blue-600'}
            `}>
              {currentVote.choice === 'girl' ? '♀' : '♂'}
            </div>
            <div>
              <p className="text-base font-black text-slate-800">{currentVote.name}</p>
              <p className={`text-xs font-bold ${currentVote.choice === 'girl' ? 'text-pink-500' : 'text-blue-500'}`}>
                Team {currentVote.choice === 'girl' ? 'Fille' : 'Garçon'}
              </p>
            </div>
          </div>
          
          {/* Message avec emoji compact */}
          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-3 shadow-md border border-purple-100">
            <div className="flex items-start gap-2">
              <div className="text-2xl flex-shrink-0">{emoji}</div>
              <p 
                className="text-sm text-slate-700 leading-relaxed font-medium flex-1 line-clamp-3"
                dangerouslySetInnerHTML={{ 
                  __html: `&ldquo;${sanitizeMessage(cleanMessage(currentVote.message, 200))}&rdquo;` 
                }}
              />
            </div>
          </div>
        </div>
        
        {/* Navigation dots compact */}
        {messagesVotes.length > 1 && (
          <div className="flex items-center gap-1.5 mt-3">
            {messagesVotes.slice(0, Math.min(10, messagesVotes.length)).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                  index === currentIndex 
                    ? 'bg-purple-500 w-6' 
                    : 'bg-purple-200 hover:bg-purple-300'
                }`}
                aria-label={`Message ${index + 1}`}
              />
            ))}
            {messagesVotes.length > 10 && (
              <span className="text-[10px] text-slate-400 ml-1">
                +{messagesVotes.length - 10}
              </span>
            )}
          </div>
        )}
      </div>
      
      {/* Pause indicator */}
      {isPaused && messagesVotes.length > 1 && (
        <div className="absolute top-12 right-3 bg-slate-800 text-white text-[10px] px-2 py-0.5 rounded-full">
          ⏸ Pause
        </div>
      )}
    </div>
  );
}
