import React, { useEffect, useRef, useState } from 'react';
import { WHEEL_SLICES } from '../constants';
import { OutcomeId } from '../types';
import { motion, useAnimation, useMotionValue } from 'framer-motion';
import { playTick } from '../services/audioService';

interface WheelProps {
  isSpinning: boolean;
  onSpinComplete: () => void;
  targetOutcome: OutcomeId | null;
}

const Wheel: React.FC<WheelProps> = ({ isSpinning, onSpinComplete, targetOutcome }) => {
  const controls = useAnimation();
  const tickerControls = useAnimation();
  const rotation = useMotionValue(0);
  const [currentRotation, setCurrentRotation] = useState(0);
  const lastTickRef = useRef(0);

  const sliceAngle = 360 / WHEEL_SLICES.length;
  
  useEffect(() => {
    if (isSpinning && targetOutcome) {
      spinWheel();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSpinning, targetOutcome]);

  useEffect(() => {
    const unsubscribe = rotation.on("change", (latest) => {
      const dist = Math.abs(latest - lastTickRef.current);
      if (dist >= sliceAngle) {
        playTick();
        lastTickRef.current = latest;
        
        tickerControls.start({
          rotate: [0, -25, 0],
          transition: { duration: 0.15, ease: "easeOut" }
        });
      }
    });

    return () => unsubscribe();
  }, [rotation, sliceAngle, tickerControls]);

  const spinWheel = async () => {
    const matchingIndices = WHEEL_SLICES
      .map((slice, index) => slice.outcomeId === targetOutcome ? index : -1)
      .filter(index => index !== -1);
    
    const winningSliceIndex = matchingIndices[Math.floor(Math.random() * matchingIndices.length)];
    const sliceCenterAngle = (winningSliceIndex * sliceAngle) + (sliceAngle / 2);
    
    const extraSpins = 5 + Math.floor(Math.random() * 3);
    const entropy = (Math.random() - 0.5) * (sliceAngle * 0.6);
    
    const targetRotation = currentRotation + (extraSpins * 360) + (360 - sliceCenterAngle) + entropy;

    lastTickRef.current = currentRotation;

    await controls.start({
      rotate: targetRotation,
      transition: {
        duration: 5.5,
        ease: [0.12, 0, 0, 1],
      },
    });

    setCurrentRotation(targetRotation);
    onSpinComplete();
  };

  const getCoordinatesForPercent = (percent: number) => {
    const x = Math.cos(2 * Math.PI * percent);
    const y = Math.sin(2 * Math.PI * percent);
    return [x, y];
  };

  return (
    // Updated container size for landscape optimization
    <div className="relative w-[320px] h-[320px] sm:w-[380px] sm:h-[380px] md:w-[550px] md:h-[550px] mx-auto flex items-center justify-center">
      
      {/* Ticker / Pointer */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 z-30 pointer-events-none" style={{ marginTop: '-18px' }}>
        <motion.div 
          animate={tickerControls}
          className="origin-top"
          style={{ transformOrigin: '50% 10px' }}
        >
          <div className="w-8 h-12 md:w-10 md:h-14 bg-gradient-to-b from-slate-700 to-slate-900 rounded-sm shadow-xl flex items-end justify-center pb-1 relative">
            <div className="absolute bottom-[-10px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[14px] border-t-slate-900" />
            <div className="w-2 h-2 rounded-full bg-slate-400 mb-4 shadow-inner" />
          </div>
        </motion.div>
      </div>

      {/* Outer Rim */}
      <div className="absolute inset-0 rounded-full border-[10px] md:border-[16px] border-slate-800 shadow-2xl z-20 pointer-events-none ring-1 ring-white/10" />

      {/* Wheel SVG */}
      <motion.div
        className="w-full h-full rounded-full overflow-hidden relative shadow-[inset_0_0_40px_rgba(0,0,0,0.4)]"
        animate={controls}
        style={{ rotate: rotation }}
        initial={{ rotate: 0 }}
      >
        <svg
          viewBox="-1 -1 2 2"
          className="w-full h-full transform -rotate-90"
          style={{ overflow: 'visible' }}
        >
          {WHEEL_SLICES.map((slice, index) => {
            const startPercent = index / WHEEL_SLICES.length;
            const endPercent = (index + 1) / WHEEL_SLICES.length;
            const [startX, startY] = getCoordinatesForPercent(startPercent);
            const [endX, endY] = getCoordinatesForPercent(endPercent);
            
            const pathData = [
              `M ${startX} ${startY}`,
              `A 1 1 0 0 1 ${endX} ${endY}`,
              `L 0 0`,
            ].join(' ');

            return (
              <g key={index}>
                <path d={pathData} fill={slice.color} stroke="white" strokeWidth="0.015" />
                <path d={pathData} fill="url(#sliceGradient)" opacity="0.1" pointerEvents="none" />
                
                <text
                  x={0.7 * Math.cos(2 * Math.PI * (startPercent + endPercent) / 2)}
                  y={0.7 * Math.sin(2 * Math.PI * (startPercent + endPercent) / 2)}
                  fill="white"
                  fontSize="0.14"
                  fontWeight="800"
                  textAnchor="middle"
                  alignmentBaseline="middle"
                  transform={`rotate(${((startPercent + endPercent) / 2 * 360)}, ${0.7 * Math.cos(2 * Math.PI * (startPercent + endPercent) / 2)}, ${0.7 * Math.sin(2 * Math.PI * (startPercent + endPercent) / 2)})`}
                  style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}
                >
                  {slice.label}
                </text>

                <circle 
                  cx={Math.cos(2 * Math.PI * endPercent) * 0.95} 
                  cy={Math.sin(2 * Math.PI * endPercent) * 0.95} 
                  r="0.04" 
                  fill="#e2e8f0" 
                  stroke="#64748b" 
                  strokeWidth="0.01" 
                  filter="url(#shadow)"
                />
              </g>
            );
          })}
          
          <defs>
            <radialGradient id="sliceGradient">
              <stop offset="50%" stopColor="black" stopOpacity="0" />
              <stop offset="100%" stopColor="black" stopOpacity="1" />
            </radialGradient>
            <filter id="shadow">
              <feDropShadow dx="0.01" dy="0.01" stdDeviation="0.01" floodOpacity="0.3" />
            </filter>
          </defs>
        </svg>
      </motion.div>
      
      {/* Center Cap */}
      <div className="absolute top-1/2 left-1/2 w-16 h-16 md:w-24 md:h-24 bg-gradient-to-br from-slate-100 to-slate-300 rounded-full -translate-x-1/2 -translate-y-1/2 shadow-lg flex items-center justify-center z-20 border border-slate-300">
        <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-slate-800 flex items-center justify-center text-white font-bold text-xs md:text-sm shadow-inner">
           LOGO
        </div>
      </div>
    </div>
  );
};

export default Wheel;