import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Search,
  Star,
  Menu,
  Calendar,
  Target,
  Zap,
  Home,
  FileText,
  Users
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';

interface OrbitalButton {
  id: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  action: () => void;
  color: string;
  shortcut?: string;
}

interface LunaOrbitalButtonsProps {
  isVisible: boolean;
  centerX: number;
  centerY: number;
  radius?: number;
  onClose: () => void;
  className?: string;
}

export const LunaOrbitalButtons: React.FC<LunaOrbitalButtonsProps> = ({
  isVisible,
  centerX,
  centerY,
  radius = 80,
  onClose,
  className
}) => {
  const { triggerHaptic } = useHapticFeedback();
  const navigate = useNavigate();
  const location = useLocation();
  const [rotationOffset, setRotationOffset] = useState(0);

  // Rotation gesture state
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartAngle, setDragStartAngle] = useState(0);
  const [dragStartRotation, setDragStartRotation] = useState(0);
  const [lastRotationUpdate, setLastRotationUpdate] = useState(0);

  // Use actual center coordinates
  const actualCenterX = centerX || window.innerWidth / 2;
  const actualCenterY = centerY || window.innerHeight / 2;

  // Helper function to calculate angle from center to point
  const getAngleFromCenter = (x: number, y: number) => {
    const deltaX = x - actualCenterX;
    const deltaY = y - actualCenterY;
    return Math.atan2(deltaY, deltaX) * (180 / Math.PI);
  };

  // Helper function to normalize angle difference for smooth rotation
  const normalizeAngleDifference = (angle: number) => {
    while (angle > 180) angle -= 360;
    while (angle < -180) angle += 360;
    return angle;
  };

  // Check if point is in rotation area (around the orbital buttons)
  const isInRotationArea = (x: number, y: number) => {
    const distance = Math.sqrt(
      Math.pow(x - actualCenterX, 2) + Math.pow(y - actualCenterY, 2)
    );
    return distance >= radius * 0.7 && distance <= radius * 1.4; // Ring around buttons
  };

  // Define context-aware orbital buttons
  const getOrbitalButtons = (): OrbitalButton[] => {
    const currentPath = location.pathname;

    // Base navigation buttons
    const baseButtons: OrbitalButton[] = [
      {
        id: 'home',
        icon: Home,
        label: 'Home',
        action: () => {
          triggerHaptic('medium');
          navigate('/app/capture');
          onClose();
        },
        color: currentPath.includes('/capture') ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600',
        shortcut: '⌘H'
      },
      {
        id: 'plan',
        icon: Calendar,
        label: 'Plan',
        action: () => {
          triggerHaptic('medium');
          navigate('/app/plan');
          onClose();
        },
        color: currentPath.includes('/plan') ? 'bg-green-600 hover:bg-green-700' : 'bg-green-500 hover:bg-green-600',
        shortcut: '⌘P'
      },
      {
        id: 'tasks',
        icon: Target,
        label: 'Tasks',
        action: () => {
          triggerHaptic('medium');
          navigate('/app/capture');
          onClose();
        },
        color: 'bg-purple-500 hover:bg-purple-600',
        shortcut: '⌘T'
      },
      {
        id: 'engage',
        icon: Users,
        label: 'Engage',
        action: () => {
          triggerHaptic('medium');
          navigate('/app/engage');
          onClose();
        },
        color: currentPath.includes('/engage') ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-indigo-500 hover:bg-indigo-600',
        shortcut: '⌘E'
      },
      {
        id: 'profile',
        icon: Star,
        label: 'Profile',
        action: () => {
          triggerHaptic('medium');
          navigate('/app/profile');
          onClose();
        },
        color: currentPath.includes('/profile') ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-yellow-500 hover:bg-yellow-600',
        shortcut: '⌘U'
      },
      {
        id: 'search',
        icon: Search,
        label: 'Search',
        action: () => {
          triggerHaptic('medium');
          // TODO: Open search overlay
          console.log('🔍 Search overlay to be implemented');
          onClose();
        },
        color: 'bg-gray-500 hover:bg-gray-600',
        shortcut: '⌘K'
      }
    ];

    // Add context-specific quick action based on current page
    if (currentPath.includes('/plan')) {
      baseButtons.push({
        id: 'quick-action',
        icon: Zap,
        label: 'New Event',
        action: () => {
          triggerHaptic('medium');
          // TODO: Open new event dialog
          console.log('⚡ Quick: New Event');
          onClose();
        },
        color: 'bg-orange-500 hover:bg-orange-600',
        shortcut: '⌘N'
      });
    } else if (currentPath.includes('/capture')) {
      baseButtons.push({
        id: 'quick-action',
        icon: Zap,
        label: 'Quick Task',
        action: () => {
          triggerHaptic('medium');
          // TODO: Open quick task dialog
          console.log('⚡ Quick: New Task');
          onClose();
        },
        color: 'bg-orange-500 hover:bg-orange-600',
        shortcut: '⌘N'
      });
    }

    return baseButtons;
  };

  const orbitalButtons = getOrbitalButtons();

  // Rotation gesture handlers
  const handleRotationStart = (clientX: number, clientY: number) => {
    if (!isInRotationArea(clientX, clientY)) return false;

    const startAngle = getAngleFromCenter(clientX, clientY);
    setIsDragging(true);
    setDragStartAngle(startAngle);
    setDragStartRotation(rotationOffset);
    setLastRotationUpdate(Date.now());

    console.log('🔄 Rotation started at angle:', startAngle.toFixed(1));
    triggerHaptic('light');
    return true; // Indicate rotation started
  };

  const handleRotationMove = (clientX: number, clientY: number) => {
    if (!isDragging) return;

    const currentAngle = getAngleFromCenter(clientX, clientY);
    const angleDiff = normalizeAngleDifference(currentAngle - dragStartAngle);
    const newRotation = (dragStartRotation + angleDiff) % 360;

    // Throttle updates for smooth performance
    const now = Date.now();
    if (now - lastRotationUpdate > 16) { // ~60fps
      setRotationOffset(newRotation);
      setLastRotationUpdate(now);
    }
  };

  const handleRotationEnd = () => {
    if (isDragging) {
      setIsDragging(false);
      console.log('🔄 Rotation ended at offset:', rotationOffset.toFixed(1));
      triggerHaptic('medium');
    }
  };

  // Calculate button positions in circular arrangement
  const getButtonPosition = (index: number, total: number) => {
    const angleStep = (2 * Math.PI) / total;
    // Start from top (-π/2) and add rotation offset
    const angle = (index * angleStep - Math.PI / 2) + (rotationOffset * Math.PI / 180);

    // Calculate position relative to center
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;

    return {
      x,
      y,
    };
  };

  // Handle escape key to close
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isVisible) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isVisible, onClose]);

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Backdrop with rotation gesture support */}
          <motion.div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={(e) => {
              // Only close if not dragging and not clicking in rotation area
              if (!isDragging && !isInRotationArea(e.clientX, e.clientY)) {
                onClose();
              }
            }}
            onMouseDown={(e) => {
              e.preventDefault();
              handleRotationStart(e.clientX, e.clientY);
            }}
            onMouseMove={(e) => {
              handleRotationMove(e.clientX, e.clientY);
            }}
            onMouseUp={handleRotationEnd}
            onMouseLeave={handleRotationEnd}
            onTouchStart={(e) => {
              e.preventDefault();
              const touch = e.touches[0];
              handleRotationStart(touch.clientX, touch.clientY);
            }}
            onTouchMove={(e) => {
              e.preventDefault();
              const touch = e.touches[0];
              handleRotationMove(touch.clientX, touch.clientY);
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              handleRotationEnd();
            }}
            style={{
              cursor: isDragging ? 'grabbing' : 'grab',
              touchAction: 'none' // Prevent scrolling during touch
            }}
          />

          {/* Orbital Buttons Container */}
          <div
            className={cn('fixed z-[60] pointer-events-none', className)}
            style={{
              left: actualCenterX,
              top: actualCenterY,
              transform: 'translate(-50%, -50%)',
            }}>
            {orbitalButtons.map((button, index) => {
              const position = getButtonPosition(index, orbitalButtons.length);
              const ButtonIcon = button.icon;

              return (
                <motion.div
                  key={button.id}
                  className={cn(
                    'absolute w-12 h-12 rounded-full shadow-lg border-2 border-white',
                    'flex items-center justify-center cursor-pointer pointer-events-auto',
                    'transition-all duration-200 ease-out',
                    button.color,
                    'hover:scale-110 active:scale-95',
                    'touch-manipulation select-none'
                  )}
                  style={{
                    left: position.x,
                    top: position.y,
                    transform: 'translate(-50%, -50%)',
                  }}
                  initial={{
                    scale: 0,
                    opacity: 0,
                    rotate: -180
                  }}
                  animate={{
                    scale: 1,
                    opacity: 1,
                    rotate: 0
                  }}
                  exit={{
                    scale: 0,
                    opacity: 0,
                    rotate: 180
                  }}
                  transition={{
                    type: 'spring',
                    stiffness: 200,
                    damping: 20,
                    delay: index * 0.1, // Stagger animation
                  }}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log(`🎯 ORBITAL BUTTON CLICKED: ${button.label}`, {
                      buttonId: button.id,
                      position: position,
                      event: e.type,
                      timeStamp: e.timeStamp
                    });
                    button.action();
                  }}
                  onPointerDown={(e) => {
                    console.log(`👆 POINTER DOWN on ${button.label}`, e.pointerType);
                  }}
                  onTouchStart={(e) => {
                    console.log(`👆 TOUCH START on ${button.label}`);
                  }}
                  whileHover={{
                    boxShadow: '0 6px 20px rgba(0, 0, 0, 0.3)',
                    scale: 1.1,
                  }}
                  whileTap={{
                    scale: 0.95,
                    transition: { duration: 0.1 }
                  }}
                  aria-label={`${button.label} (${button.shortcut})`}
                  title={`${button.label} (${button.shortcut})`}
                >
                  <ButtonIcon size={18} className="text-white" />

                  {/* Button Label - positioned outside the circle */}
                  <motion.div
                    className="absolute pointer-events-none"
                    style={{
                      // Position label based on button's angle
                      left: position.x > 0 ? '120%' : position.x < 0 ? '-120%' : '50%',
                      top: position.y > 0 ? '120%' : position.y < 0 ? '-120%' : '50%',
                      transform: `translate(${position.x > 0 ? '0' : position.x < 0 ? '-100%' : '-50%'}, ${position.y > 0 ? '0' : position.y < 0 ? '-100%' : '-50%'})`,
                    }}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ delay: 0.2 + (index * 0.05) }}
                  >
                    <div className="bg-black/90 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-md whitespace-nowrap shadow-lg">
                      <div className="font-medium">{button.label}</div>
                      <div className="text-gray-300 text-[10px] mt-0.5">{button.shortcut}</div>
                    </div>
                  </motion.div>
                </motion.div>
              );
            })}
          </div>


          {/* Rotation indicator ring */}
          {isDragging && (
            <motion.div
              className="fixed z-[55] pointer-events-none"
              style={{
                left: actualCenterX,
                top: actualCenterY,
                transform: 'translate(-50%, -50%)',
              }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
            >
              <div
                className="rounded-full border-2 border-dashed border-blue-400/50 animate-pulse"
                style={{
                  width: radius * 2,
                  height: radius * 2,
                }}
              />
            </motion.div>
          )}

          {/* Instructions overlay */}
          <motion.div
            className="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-[65] pointer-events-none"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3, delay: 0.5 }}
          >
            <div className="bg-black/80 text-white text-sm px-4 py-2 rounded-lg whitespace-nowrap">
              {isDragging ? 'Drag to rotate • Release to select' : 'Tap button or drag to rotate'}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};