'use client';

import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import type { Vote } from '@/lib/storage';

interface LiveNotificationProps {
  latestVote: Vote | null;
  position?: 'top-right' | 'top-left' | 'bottom-right';
  duration?: number;
}

export default function LiveNotification({ 
  latestVote, 
  position = 'top-right',
  duration = 5000
}: LiveNotificationProps) {
  const [visible, setVisible] = useState(false);
  const [queue, setQueue] = useState<Vote[]>([]);
  const [currentVote, setCurrentVote] = useState<Vote | null>(null);
  
  // Add new votes to queue
  useEffect(() => {
    if (latestVote && latestVote.id) {
      setQueue(prev => {
        // Avoid duplicates
        if (prev.some(v => v.id === latestVote.id)) {
          return prev;
        }
        return [...prev, latestVote];
      });
    }
  }, [latestVote]);
  
  // Process queue
  useEffect(() => {
    if (queue.length > 0 && !visible) {
      const nextVote = queue[0];
      setCurrentVote(nextVote);
      setVisible(true);
      setQueue(prev => prev.slice(1));
      
      // Auto-hide after duration
      const timer = setTimeout(() => {
        setVisible(false);
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [queue, visible, duration]);
  
  // Hide animation complete
  useEffect(() => {
    if (!visible && currentVote) {
      const timer = setTimeout(() => {
        setCurrentVote(null);
      }, 300); // Wait for exit animation
      
      return () => clearTimeout(timer);
    }
  }, [visible, currentVote]);
  
  if (!currentVote) return null;
  
  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4'
  }[position];
  
  return (
    <div 
      className={`fixed ${positionClasses} z-50 transition-all duration-300 ${
        visible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
    >
      <div className={`bg-white rounded-2xl shadow-2xl border-2 ${
        currentVote.choice === 'girl' ? 'border-pink-300' : 'border-blue-300'
      } p-4 min-w-[320px] max-w-md animate-slide-in-right`}>
        {/* Header avec badge pulsant */}
        <div className="flex items-center gap-3 mb-3">
          <div className={`relative ${
            currentVote.choice === 'girl' 
              ? 'bg-gradient-to-br from-pink-100 to-pink-200' 
              : 'bg-gradient-to-br from-blue-100 to-blue-200'
          } rounded-full p-2`}>
            <Bell className={`w-5 h-5 ${
              currentVote.choice === 'girl' ? 'text-pink-600' : 'text-blue-600'
            } animate-pulse`} />
            {/* Pulse effect */}
            <span className={`absolute top-0 right-0 flex h-3 w-3`}>
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${
                currentVote.choice === 'girl' ? 'bg-pink-400' : 'bg-blue-400'
              } opacity-75`}></span>
              <span className={`relative inline-flex rounded-full h-3 w-3 ${
                currentVote.choice === 'girl' ? 'bg-pink-500' : 'bg-blue-500'
              }`}></span>
            </span>
          </div>
          <div className="flex-1">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Nouveau vote !
            </p>
            <p className={`text-sm font-black ${
              currentVote.choice === 'girl' ? 'text-pink-600' : 'text-blue-600'
            }`}>
              Team {currentVote.choice === 'girl' ? 'Fille' : 'Garçon'}
            </p>
          </div>
          <button
            onClick={() => setVisible(false)}
            className="text-slate-400 hover:text-slate-600 transition-colors"
            aria-label="Fermer"
          >
            ✕
          </button>
        </div>
        
        {/* Content */}
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white text-xl font-black flex-shrink-0 ${
            currentVote.choice === 'girl' 
              ? 'bg-gradient-to-br from-pink-400 to-pink-600' 
              : 'bg-gradient-to-br from-blue-400 to-blue-600'
          }`}>
            {currentVote.choice === 'girl' ? '♀' : '♂'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-black text-slate-800 text-lg truncate">
              {currentVote.name}
            </p>
            <p className="text-xs text-slate-500">
              vient de voter
            </p>
          </div>
        </div>
        
        {/* Message preview if exists */}
        {currentVote.message && currentVote.message.trim().length > 0 && (
          <div className={`mt-3 p-2 rounded-lg text-xs ${
            currentVote.choice === 'girl' 
              ? 'bg-pink-50 text-pink-700' 
              : 'bg-blue-50 text-blue-700'
          }`}>
            <p className="line-clamp-2">
              💬 {currentVote.message}
            </p>
          </div>
        )}
        
        {/* Queue indicator */}
        {queue.length > 0 && (
          <div className="mt-2 text-center">
            <p className="text-[10px] text-slate-400 font-medium">
              +{queue.length} en attente
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
