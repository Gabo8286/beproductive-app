import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, Sparkles, MessageCircle, Brain, Zap } from 'lucide-react';
import { LunaAvatar } from '../core/LunaAvatar';
import { useLuna } from '../context/LunaContext';
import { LUNA_COLORS } from '@/assets/luna/luna-assets';

interface LunaIntroStepProps {
  onNext: () => void;
  onBack: () => void;
}

export const LunaIntroStep: React.FC<LunaIntroStepProps> = ({ onNext, onBack }) => {
  const [currentMessage, setCurrentMessage] = useState(0);
  const [showFeatures, setShowFeatures] = useState(false);
  const { setExpression, setContext } = useLuna();

  const lunaMessages = [
    {
      text: "Hi there! I'm Luna, your AI productivity assistant! 🦊",
      expression: 'happy' as const,
      delay: 0
    },
    {
      text: "I'm here to help you capture ideas, plan your work, and stay focused on what matters most.",
      expression: 'default' as const,
      delay: 1500
    },
    {
      text: "I learn your workflow and provide personalized suggestions to boost your productivity!",
      expression: 'success' as const,
      delay: 3000
    }
  ];

  const lunaFeatures = [
    {
      icon: MessageCircle,
      title: 'Smart Conversations',
      description: 'Chat with me anytime for help, suggestions, or just to brainstorm ideas.',
      color: 'text-blue-500',
      bgColor: 'bg-blue-50'
    },
    {
      icon: Brain,
      title: 'Context Awareness',
      description: 'I understand what you\'re working on and adapt my help accordingly.',
      color: 'text-purple-500',
      bgColor: 'bg-purple-50'
    },
    {
      icon: Zap,
      title: 'Proactive Assistance',
      description: 'Get helpful suggestions and reminders without having to ask.',
      color: 'text-orange-500',
      bgColor: 'bg-orange-50'
    }
  ];

  useEffect(() => {
    setContext('general');

    const timer = setTimeout(() => {
      if (currentMessage < lunaMessages.length - 1) {
        const nextMessage = currentMessage + 1;
        setCurrentMessage(nextMessage);
        setExpression(lunaMessages[nextMessage].expression);
      } else {
        setShowFeatures(true);
      }
    }, lunaMessages[currentMessage]?.delay || 2500);

    return () => clearTimeout(timer);
  }, [currentMessage, setContext, setExpression]);

  const handleNext = () => {
    setExpression('happy');
    onNext();
  };

  const handleSkip = () => {
    setCurrentMessage(lunaMessages.length - 1);
    setShowFeatures(true);
    setExpression('happy');
  };

  return (
    <div className="space-y-8">
      {/* Luna Introduction */}
      <div className="text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <LunaAvatar
            size="large"
            expression={lunaMessages[currentMessage]?.expression || 'default'}
            animated={true}
            className="mx-auto mb-4"
          />
        </motion.div>

        <h2 className="text-2xl font-bold text-gray-900 mb-3">
          Meet Luna
        </h2>
        <p className="text-gray-600 mb-6">
          Your AI productivity companion
        </p>
      </div>

      {/* Luna's Message */}
      <div className="max-w-2xl mx-auto">
        <Card
          className="relative"
          style={{
            borderColor: LUNA_COLORS.furLight + '40',
            background: `linear-gradient(135deg, ${LUNA_COLORS.furLight}08 0%, white 100%)`,
          }}
        >
          <CardContent className="p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentMessage}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="text-center"
              >
                <p className="text-lg text-gray-700 leading-relaxed">
                  {lunaMessages[currentMessage]?.text}
                </p>
              </motion.div>
            </AnimatePresence>

            {/* Speech Bubble Arrow */}
            <div
              className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0"
              style={{
                borderLeft: '12px solid transparent',
                borderRight: '12px solid transparent',
                borderTop: `12px solid ${LUNA_COLORS.furLight}20`,
              }}
            />
          </CardContent>
        </Card>
      </div>

      {/* Luna Features */}
      <AnimatePresence>
        {showFeatures && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="max-w-4xl mx-auto"
          >
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                What I can help you with:
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {lunaFeatures.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
                  >
                    <Card className="h-full hover:shadow-md transition-shadow duration-200">
                      <CardContent className="p-6 text-center">
                        <div className={`w-12 h-12 ${feature.bgColor} rounded-full mx-auto mb-4 flex items-center justify-center`}>
                          <Icon className={`w-6 h-6 ${feature.color}`} />
                        </div>
                        <h4 className="font-semibold text-gray-900 mb-2">
                          {feature.title}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {feature.description}
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>

            {/* Luna Usage Tip */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.6 }}
              className="mt-8 text-center"
            >
              <div
                className="inline-flex items-center gap-3 px-4 py-3 rounded-full text-sm"
                style={{
                  background: `linear-gradient(135deg, ${LUNA_COLORS.lanternGlow}20 0%, ${LUNA_COLORS.furLight}10 100%)`,
                  border: `1px solid ${LUNA_COLORS.furLight}30`,
                }}
              >
                <Sparkles className="w-4 h-4" style={{ color: LUNA_COLORS.orangePrimary }} />
                <span className="font-medium text-gray-700">
                  Look for the Luna button (🦊) in the menu to chat with me anytime!
                </span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation - Always visible */}
      <div className="flex justify-between max-w-4xl mx-auto">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
        
        <AnimatePresence mode="wait">
          {!showFeatures ? (
            <Button
              key="skip"
              variant="outline"
              onClick={handleSkip}
              className="text-gray-600"
            >
              Skip intro <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <motion.div
              key="continue"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Button
                onClick={handleNext}
                style={{
                  backgroundColor: LUNA_COLORS.furPrimary,
                  borderColor: LUNA_COLORS.furPrimary,
                }}
                className="text-white hover:opacity-90"
              >
                Continue with Luna <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default LunaIntroStep;