'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import type { Vote, AppConfig } from '@/lib/storage';
import { generateFunFacts } from '@/lib/fun-facts';
import QRCode from './QRCode';

interface FunFactsProps {
  votes: Vote[];
  config: AppConfig;
  autoRotate?: boolean;
  intervalSeconds?: number;
  includeQRCode?: boolean;
  compact?: boolean;
}

export default function FunFacts({ 
  votes, 
  config, 
  autoRotate = true, 
  intervalSeconds = 12,
  includeQRCode = false,
  compact = false
}: FunFactsProps) {
  const baseFacts = generateFunFacts(votes, config);
  
  // Ajouter le QR code comme un "fact" si demandé
  const facts = includeQRCode && config.voteUrl 
    ? [
        ...baseFacts,
        {
          emoji: '📱',
          text: 'Scanner pour voter !',
          isQRCode: true
        }
      ]
    : baseFacts;
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  
  // Rotation automatique
  useEffect(() => {
    if (!autoRotate || facts.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % facts.length);
      setProgress(0);
    }, intervalSeconds * 1000);
    
    return () => clearInterval(interval);
  }, [autoRotate, intervalSeconds, facts.length]);
  
  // Progress bar
  useEffect(() => {
    if (!autoRotate || facts.length <= 1) return;
    
    setProgress(0);
    const startTime = Date.now();
    const duration = intervalSeconds * 1000;
    
    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min((elapsed / duration) * 100, 100);
      setProgress(newProgress);
    }, 50);
    
    return () => clearInterval(progressInterval);
  }, [currentIndex, autoRotate, intervalSeconds, facts.length]);
  
  if (facts.length === 0) return null;
  
  const currentFact = facts[currentIndex];
  
  return (
    <div className="relative bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 rounded-2xl shadow-xl overflow-hidden border-2 border-purple-200 h-full flex flex-col">
      {/* Header Compact */}
      <div className="flex items-center gap-2 px-3 py-2 bg-white/50 backdrop-blur-sm border-b border-purple-200">
        <Sparkles className="w-4 h-4 text-purple-500 animate-pulse" />
        <h2 className="text-sm font-black text-purple-700 uppercase tracking-wider">
          Le saviez-vous ?
        </h2>
        {facts.length > 1 && (
          <div className="ml-auto flex items-center gap-1.5">
            {facts.map((_, index) => (
              <div
                key={index}
                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                  index === currentIndex 
                    ? 'bg-purple-500 w-4' 
                    : 'bg-purple-200'
                }`}
              />
            ))}
          </div>
        )}
      </div>
      
      {/* Fact Content Compact */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div 
          key={currentIndex}
          className="text-center animate-pop-in w-full"
        >
          {currentFact.isQRCode && config.voteUrl ? (
            // Affichage spécial pour le QR code
            <div className="flex flex-col items-center gap-2">
              <div className="text-4xl mb-2">
                {currentFact.emoji}
              </div>
              <QRCode value={config.voteUrl} size={compact ? 100 : 120} />
              <p className="text-base font-black text-slate-800 mt-2">
                {currentFact.text}
              </p>
            </div>
          ) : (
            // Affichage normal pour les fun facts
            <>
              <div className="text-5xl mb-3 animate-bounce-slow">
                {currentFact.emoji}
              </div>
              <p className="text-xl font-black text-slate-800 leading-tight animate-text-glow">
                {currentFact.text}
              </p>
            </>
          )}
        </div>
      </div>
      
      {/* Progress Bar Compact */}
      {autoRotate && facts.length > 1 && (
        <div className="h-1 bg-purple-100">
          <div 
            className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 transition-all duration-100 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
}
