import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { LunaAvatar } from '../core/LunaAvatar';
import { useLuna } from '../context/LunaContext';
import { LUNA_COLORS } from '@/assets/luna/luna-assets';

interface LunaEmptyStateProps {
  context: 'capture' | 'plan' | 'engage' | 'general';
  title: string;
  description: string;
  primaryAction?: {
    label: string;
    onClick: () => void;
    icon?: React.ComponentType<{ className?: string }>;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
    icon?: React.ComponentType<{ className?: string }>;
  };
  lunaMessage?: string;
  suggestions?: string[];
  className?: string;
}

export const LunaEmptyState: React.FC<LunaEmptyStateProps> = ({
  context,
  title,
  description,
  primaryAction,
  secondaryAction,
  lunaMessage,
  suggestions = [],
  className = '',
}) => {
  const [showLunaTip, setShowLunaTip] = useState(false);
  const { setContext, openChat, setExpression } = useLuna();

  // Context-specific Luna messages and tips
  const getContextualLunaContent = () => {
    switch (context) {
      case 'capture':
        return {
          message: lunaMessage || "Ready to capture some great ideas? I can help you organize your thoughts and turn them into actionable items! 📝",
          tips: suggestions.length > 0 ? suggestions : [
            "Try voice notes for quick capture",
            "Use templates to save time",
            "I can help categorize your ideas"
          ]
        };
      case 'plan':
        return {
          message: lunaMessage || "Let's plan something amazing! I can help you break down goals, set priorities, and create actionable plans. 📋",
          tips: suggestions.length > 0 ? suggestions : [
            "Start with your biggest goal",
            "Break large tasks into smaller steps",
            "I can suggest optimal scheduling"
          ]
        };
      case 'engage':
        return {
          message: lunaMessage || "Time to get things done! I can help you stay focused, track your progress, and maintain momentum. 🎯",
          tips: suggestions.length > 0 ? suggestions : [
            "Start with a quick win",
            "Use the Pomodoro technique",
            "I can coach you through tasks"
          ]
        };
      default:
        return {
          message: lunaMessage || "I'm here to help make you more productive! What would you like to work on today? 🦊",
          tips: suggestions.length > 0 ? suggestions : [
            "Ask me for suggestions",
            "I learn from your workflow",
            "Chat with me anytime for help"
          ]
        };
    }
  };

  const { message: contextualMessage, tips } = getContextualLunaContent();

  useEffect(() => {
    setContext(context);
    // Show Luna tip after a brief delay
    const timer = setTimeout(() => {
      setShowLunaTip(true);
      setExpression('happy');
    }, 1000);

    return () => clearTimeout(timer);
  }, [context, setContext, setExpression]);

  const handleChatWithLuna = () => {
    setContext(context);
    setExpression('happy');
    openChat();
  };

  const getContextEmoji = () => {
    switch (context) {
      case 'capture': return '📝';
      case 'plan': return '📋';
      case 'engage': return '🎯';
      default: return '✨';
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Main Empty State */}
      <Card className="border-dashed border-2 border-gray-200">
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <div className="text-6xl mb-4">
            {getContextEmoji()}
          </div>

          <h3 className="text-2xl font-semibold mb-2 text-gray-900">
            {title}
          </h3>

          <p className="text-gray-600 mb-8 max-w-md leading-relaxed">
            {description}
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            {primaryAction && (
              <Button
                onClick={primaryAction.onClick}
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {primaryAction.icon && <primaryAction.icon className="w-5 h-5 mr-2" />}
                {primaryAction.label}
              </Button>
            )}

            {secondaryAction && (
              <Button
                onClick={secondaryAction.onClick}
                variant="outline"
                size="lg"
              >
                {secondaryAction.icon && <secondaryAction.icon className="w-5 h-5 mr-2" />}
                {secondaryAction.label}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Luna Assistant Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: showLunaTip ? 1 : 0, y: showLunaTip ? 0 : 20 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card
          className="relative overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${LUNA_COLORS.furLight}08 0%, white 100%)`,
            borderColor: LUNA_COLORS.furLight + '30',
          }}
        >
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              {/* Luna Avatar */}
              <div className="flex-shrink-0">
                <LunaAvatar
                  size="medium"
                  expression="happy"
                  animated={true}
                  onClick={handleChatWithLuna}
                  className="cursor-pointer hover:scale-105 transition-transform"
                />
              </div>

              {/* Luna Message */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-semibold text-gray-900">Luna</h4>
                  <span className="text-xs px-2 py-1 bg-orange-100 text-orange-700 rounded-full">
                    AI Assistant
                  </span>
                </div>

                <p className="text-gray-700 mb-4 leading-relaxed">
                  {contextualMessage}
                </p>

                {/* Tips */}
                {tips.length > 0 && (
                  <div className="space-y-2 mb-4">
                    <p className="text-sm font-medium text-gray-600">Quick tips:</p>
                    <ul className="space-y-1">
                      {tips.map((tip, index) => (
                        <li key={index} className="text-sm text-gray-600 flex items-center gap-2">
                          <div
                            className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                            style={{ backgroundColor: LUNA_COLORS.orangePrimary }}
                          />
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Chat Button */}
                <Button
                  onClick={handleChatWithLuna}
                  variant="outline"
                  size="sm"
                  className="text-blue-600 border-blue-200 hover:bg-blue-50"
                >
                  💬 Chat with Luna
                </Button>
              </div>
            </div>

            {/* Decorative Elements */}
            <div
              className="absolute top-0 right-0 w-20 h-20 opacity-10 pointer-events-none"
              style={{
                background: `radial-gradient(circle, ${LUNA_COLORS.lanternGlow} 0%, transparent 70%)`,
              }}
            />
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

// Specific empty state components for different contexts
export const CaptureEmptyState: React.FC<{
  onCreateNote?: () => void;
  onCreateTask?: () => void;
  className?: string;
}> = ({ onCreateNote, onCreateTask, className }) => (
  <LunaEmptyState
    context="capture"
    title="Ready to capture your ideas?"
    description="Start collecting your thoughts, tasks, and inspiration. Everything you capture here becomes part of your productivity system."
    primaryAction={onCreateNote ? {
      label: "Create First Note",
      onClick: onCreateNote,
    } : undefined}
    secondaryAction={onCreateTask ? {
      label: "Add Quick Task",
      onClick: onCreateTask,
    } : undefined}
    className={className}
  />
);

export const PlanEmptyState: React.FC<{
  onCreateGoal?: () => void;
  onCreateProject?: () => void;
  className?: string;
}> = ({ onCreateGoal, onCreateProject, className }) => (
  <LunaEmptyState
    context="plan"
    title="Let's plan something great!"
    description="Transform your ideas into structured goals and projects. Good planning is the foundation of productive action."
    primaryAction={onCreateGoal ? {
      label: "Set Your First Goal",
      onClick: onCreateGoal,
    } : undefined}
    secondaryAction={onCreateProject ? {
      label: "Start a Project",
      onClick: onCreateProject,
    } : undefined}
    className={className}
  />
);

export const EngageEmptyState: React.FC<{
  onStartTimer?: () => void;
  onViewTasks?: () => void;
  className?: string;
}> = ({ onStartTimer, onViewTasks, className }) => (
  <LunaEmptyState
    context="engage"
    title="Time to get things done!"
    description="Focus on your priorities and make progress on what matters most. Every small step moves you forward."
    primaryAction={onStartTimer ? {
      label: "Start Focus Session",
      onClick: onStartTimer,
    } : undefined}
    secondaryAction={onViewTasks ? {
      label: "View My Tasks",
      onClick: onViewTasks,
    } : undefined}
    className={className}
  />
);

export default LunaEmptyState;