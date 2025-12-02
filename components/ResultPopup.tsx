import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { OutcomeConfig } from '../types';

interface ResultPopupProps {
  isVisible: boolean;
  outcomeConfig: OutcomeConfig | null;
  onClose: () => void;
  autoHideDuration?: number;
}

const ResultPopup: React.FC<ResultPopupProps> = ({ 
  isVisible, 
  outcomeConfig, 
  onClose, 
  autoHideDuration = 3000 
}) => {
  
  useEffect(() => {
    if (isVisible && autoHideDuration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, autoHideDuration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, autoHideDuration, onClose]);

  return (
    <AnimatePresence>
      {isVisible && outcomeConfig && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.5, y: 50, rotateX: -45 }}
            animate={{ scale: 1, y: 0, rotateX: 0 }}
            exit={{ scale: 0.5, y: 50, opacity: 0 }}
            transition={{ type: "spring", damping: 15 }}
            className="bg-white rounded-3xl p-8 shadow-2xl text-center max-w-sm w-full border-4 border-white relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Background color splash */}
            <div 
              className="absolute top-0 left-0 w-full h-24 opacity-20"
              style={{ backgroundColor: outcomeConfig.color }}
            />
            
            <h2 className="text-2xl font-bold text-slate-800 relative z-10">Result</h2>
            
            <div className="my-6 relative z-10">
              <div 
                className="text-6xl font-black mb-2 tracking-tighter"
                style={{ color: outcomeConfig.color }}
              >
                {outcomeConfig.id}
              </div>
              <div className="text-xl font-medium text-slate-600">
                {outcomeConfig.label.includes(outcomeConfig.id) 
                  ? outcomeConfig.label.replace(outcomeConfig.id, '').trim()
                  : outcomeConfig.label
                }
              </div>
            </div>
            
            <p className="text-sm text-slate-400">Spin recorded.</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ResultPopup;