import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Grid3x3, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LunaAvatar } from '@/components/luna/core/LunaAvatar';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';
import { ActionSheetProps, LunaAction } from '@/components/luna/actionsheets/types';

export const PopupGridActionSheet: React.FC<ActionSheetProps> = ({
  isOpen,
  onClose,
  actions,
  className
}) => {
  const { buttonPress } = useHapticFeedback();
  const [currentPage, setCurrentPage] = useState(0);
  const actionsPerPage = 6; // 2x3 grid
  const totalPages = Math.ceil(actions.length / actionsPerPage);

  const handleActionClick = (action: LunaAction) => {
    buttonPress();
    action.action();
    onClose();
  };

  const nextPage = () => {
    buttonPress();
    setCurrentPage((prev) => (prev + 1) % totalPages);
  };

  const prevPage = () => {
    buttonPress();
    setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages);
  };

  const getCurrentPageActions = () => {
    const startIndex = currentPage * actionsPerPage;
    return actions.slice(startIndex, startIndex + actionsPerPage);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* Popup Grid Panel */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.8, opacity: 0, y: 50 }}
        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
        className={cn(
          'fixed bottom-24 left-4 right-4 bg-background/95 backdrop-blur-xl rounded-3xl shadow-2xl border z-50 max-w-sm mx-auto',
          className
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-3">
            <LunaAvatar size="medium" expression="happy" />
            <div>
              <h3 className="font-semibold text-foreground">Luna AI</h3>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Grid3x3 className="w-3 h-3" />
                Grid View
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-accent transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Grid Content */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPage}
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-2 gap-4 min-h-[200px]"
            >
              {getCurrentPageActions().map((action, index) => {
                const Icon = action.icon;
                return (
                  <motion.button
                    key={action.id}
                    initial={{ scale: 0, opacity: 0, rotateY: -90 }}
                    animate={{ scale: 1, opacity: 1, rotateY: 0 }}
                    transition={{
                      delay: index * 0.1,
                      type: 'spring',
                      damping: 15,
                      stiffness: 300
                    }}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleActionClick(action)}
                    className="group flex flex-col items-center gap-3 p-4 rounded-2xl bg-gradient-to-br from-background to-accent/20 hover:to-accent/40 transition-all duration-300 border border-accent/20 hover:border-accent/40 shadow-lg hover:shadow-xl"
                  >
                    <motion.div
                      className={cn(
                        'p-4 rounded-2xl shadow-lg group-hover:shadow-xl transition-all duration-300',
                        action.color
                      )}
                      whileHover={{ rotate: 5 }}
                    >
                      <Icon className="w-6 h-6 text-white" />
                    </motion.div>
                    <div className="text-center">
                      <span className="text-sm font-semibold text-foreground block">
                        {action.label}
                      </span>
                      {action.description && (
                        <span className="text-xs text-muted-foreground block mt-1">
                          {action.description}
                        </span>
                      )}
                    </div>
                  </motion.button>
                );
              })}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t bg-accent/10">
            <button
              onClick={prevPage}
              disabled={currentPage === 0}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-background border transition-colors hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="text-sm font-medium">Previous</span>
            </button>

            <div className="flex items-center gap-2">
              {Array.from({ length: totalPages }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentPage(index)}
                  className={cn(
                    'w-2 h-2 rounded-full transition-all duration-200',
                    currentPage === index
                      ? 'bg-orange-500 w-6'
                      : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                  )}
                />
              ))}
            </div>

            <button
              onClick={nextPage}
              disabled={currentPage === totalPages - 1}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-background border transition-colors hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="text-sm font-medium">Next</span>
            </button>
          </div>
        )}

        {/* Tip */}
        <div className="p-4 pt-0">
          <div className="bg-gradient-to-r from-orange-50 to-blue-50 dark:from-orange-900/20 dark:to-blue-900/20 rounded-lg p-3">
            <p className="text-xs text-foreground/70 text-center">
              💡 Swipe or use arrows to navigate between action pages
            </p>
          </div>
        </div>
      </motion.div>
    </>
  );
};