import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useGamification } from './useGamification';
import { Json } from '@/integrations/supabase/types';

export interface ProductivityQuestion {
  id: string;
  category: string;
  question: string;
  options: {
    value: string;
    label: string;
    profiles: Record<string, number>;
  }[];
}

export interface ProductivityProfile {
  id: string;
  name: string;
  description: string;
  characteristics: string[];
  strengths: string[];
  growthAreas: string[];
  recommendedStrategies: string[];
  color: string;
  icon: string;
}

export interface AssessmentResult {
  id: string;
  user_id: string;
  question_responses: Json;
  profile_scores: Json;
  dominant_profile: string;
  secondary_profile?: string;
  recommended_strategies: Json;
  strengths: Json;
  growth_areas: Json;
  completed_at: string;
}

const PRODUCTIVITY_PROFILES: Record<string, ProductivityProfile> = {
  strategist: {
    id: 'strategist',
    name: 'The Strategist',
    description: 'Long-term thinker who excels at planning and seeing the big picture',
    characteristics: [
      'Plans extensively before taking action',
      'Thinks in systems and frameworks',
      'Focuses on long-term outcomes',
      'Enjoys analyzing and optimizing processes'
    ],
    strengths: [
      'Excellent at strategic planning',
      'Strong analytical thinking',
      'Effective at prioritization',
      'Good at seeing connections'
    ],
    growthAreas: [
      'May over-plan and under-execute',
      'Can get stuck in analysis paralysis',
      'Might resist quick pivots',
      'Sometimes misses emotional factors'
    ],
    recommendedStrategies: [
      'Set implementation deadlines for plans',
      'Use time-boxing for planning sessions',
      'Practice rapid prototyping',
      'Build in regular review checkpoints'
    ],
    color: '#6366f1',
    icon: 'target'
  },
  executor: {
    id: 'executor',
    name: 'The Executor',
    description: 'Action-oriented achiever who gets things done efficiently',
    characteristics: [
      'Prefers action over extensive planning',
      'Works well under pressure',
      'Focuses on completion and results',
      'Enjoys tackling challenging tasks'
    ],
    strengths: [
      'High execution speed',
      'Results-oriented mindset',
      'Thrives under pressure',
      'Great at meeting deadlines'
    ],
    growthAreas: [
      'May rush without proper planning',
      'Can burn out from overwork',
      'Might miss important details',
      'Sometimes neglects stakeholder input'
    ],
    recommendedStrategies: [
      'Build planning buffers into schedules',
      'Use checklists to catch details',
      'Schedule regular breaks',
      'Seek input before major decisions'
    ],
    color: '#ef4444',
    icon: 'zap'
  },
  collaborator: {
    id: 'collaborator',
    name: 'The Collaborator',
    description: 'Team-focused achiever who thrives through relationships and shared goals',
    characteristics: [
      'Energized by team interactions',
      'Seeks consensus in decision-making',
      'Values relationships and communication',
      'Prefers shared accountability'
    ],
    strengths: [
      'Excellent team player',
      'Strong communication skills',
      'Builds trust easily',
      'Good at conflict resolution'
    ],
    growthAreas: [
      'May avoid difficult conversations',
      'Can be slower in individual work',
      'Might defer too much to others',
      'Sometimes prioritizes harmony over results'
    ],
    recommendedStrategies: [
      'Schedule regular solo work time',
      'Practice assertive communication',
      'Set personal accountability measures',
      'Use structured decision-making frameworks'
    ],
    color: '#10b981',
    icon: 'users'
  },
  optimizer: {
    id: 'optimizer',
    name: 'The Optimizer',
    description: 'Efficiency expert who continuously improves systems and processes',
    characteristics: [
      'Constantly seeks improvement opportunities',
      'Loves automating repetitive tasks',
      'Values efficiency and optimization',
      'Enjoys learning new tools and methods'
    ],
    strengths: [
      'Great at process improvement',
      'Highly efficient workflows',
      'Quick to adopt useful tools',
      'Excellent at eliminating waste'
    ],
    growthAreas: [
      'May over-optimize simple tasks',
      'Can get distracted by new tools',
      'Might neglect relationship building',
      'Sometimes loses sight of bigger picture'
    ],
    recommendedStrategies: [
      'Set optimization boundaries',
      'Focus on high-impact improvements',
      'Schedule relationship building time',
      'Regular strategic reviews'
    ],
    color: '#8b5cf6',
    icon: 'settings'
  },
  explorer: {
    id: 'explorer',
    name: 'The Explorer',
    description: 'Curious innovator who thrives on learning and discovering new possibilities',
    characteristics: [
      'Energized by new ideas and concepts',
      'Enjoys variety and changing tasks',
      'Values learning and growth',
      'Comfortable with ambiguity'
    ],
    strengths: [
      'High creativity and innovation',
      'Adaptable to change',
      'Continuous learner',
      'Good at seeing opportunities'
    ],
    growthAreas: [
      'May struggle with routine tasks',
      'Can have difficulty with follow-through',
      'Might resist structure',
      'Sometimes lacks focus'
    ],
    recommendedStrategies: [
      'Rotate between different types of work',
      'Set learning goals alongside task goals',
      'Use timeboxing for focus',
      'Create accountability partnerships'
    ],
    color: '#f59e0b',
    icon: 'compass'
  },
  perfectionist: {
    id: 'perfectionist',
    name: 'The Perfectionist',
    description: 'Quality-focused achiever who excels at producing exceptional results',
    characteristics: [
      'High attention to detail',
      'Strives for excellence in everything',
      'Takes pride in quality work',
      'Prefers thorough preparation'
    ],
    strengths: [
      'Exceptional quality output',
      'Strong attention to detail',
      'High personal standards',
      'Reliable and consistent'
    ],
    growthAreas: [
      'May struggle with deadlines',
      'Can experience decision paralysis',
      'Might resist delegation',
      'Sometimes burns out from high standards'
    ],
    recommendedStrategies: [
      'Set "good enough" thresholds',
      'Use progressive deadlines',
      'Practice delegating non-critical tasks',
      'Build in recovery time'
    ],
    color: '#ec4899',
    icon: 'star'
  },
  minimalist: {
    id: 'minimalist',
    name: 'The Minimalist',
    description: 'Focus-driven achiever who excels through simplicity and clarity',
    characteristics: [
      'Values simplicity and clarity',
      'Prefers fewer, more important tasks',
      'Eliminates unnecessary complexity',
      'Focuses on essential activities'
    ],
    strengths: [
      'Excellent at prioritization',
      'Strong focus and concentration',
      'Efficient use of time and energy',
      'Clear decision-making'
    ],
    growthAreas: [
      'May miss valuable opportunities',
      'Can be too rigid in approach',
      'Might under-collaborate',
      'Sometimes oversimplifies complex issues'
    ],
    recommendedStrategies: [
      'Regular opportunity reviews',
      'Schedule collaboration time',
      'Use systematic evaluation criteria',
      'Build flexibility into plans'
    ],
    color: '#64748b',
    icon: 'minus-circle'
  },
  balancer: {
    id: 'balancer',
    name: 'The Balancer',
    description: 'Holistic achiever who integrates work and life for sustainable success',
    characteristics: [
      'Values work-life integration',
      'Seeks sustainable productivity',
      'Considers multiple life domains',
      'Prioritizes well-being'
    ],
    strengths: [
      'Sustainable productivity habits',
      'Good boundary management',
      'Holistic perspective',
      'Stress management skills'
    ],
    growthAreas: [
      'May lack intensity during critical periods',
      'Can struggle with urgent demands',
      'Might avoid high-stress opportunities',
      'Sometimes spreads efforts too thin'
    ],
    recommendedStrategies: [
      'Identify peak performance periods',
      'Develop surge capacity protocols',
      'Use energy management techniques',
      'Create focused work blocks'
    ],
    color: '#06b6d4',
    icon: 'scale'
  }
};

const ASSESSMENT_QUESTIONS: ProductivityQuestion[] = [
  {
    id: 'planning_style',
    category: 'Planning Approach',
    question: 'When starting a new project, you typically:',
    options: [
      {
        value: 'detailed_plan',
        label: 'Create a detailed plan before starting',
        profiles: { strategist: 3, perfectionist: 2, minimalist: 1 }
      },
      {
        value: 'rough_outline',
        label: 'Make a rough outline and adjust as you go',
        profiles: { executor: 2, explorer: 2, balancer: 2 }
      },
      {
        value: 'dive_in',
        label: 'Dive in and figure it out along the way',
        profiles: { executor: 3, explorer: 2 }
      },
      {
        value: 'team_planning',
        label: 'Collaborate with others to create a shared plan',
        profiles: { collaborator: 3, balancer: 1 }
      }
    ]
  },
  {
    id: 'work_style',
    category: 'Work Preferences',
    question: 'Your ideal work environment includes:',
    options: [
      {
        value: 'minimal_distractions',
        label: 'Minimal distractions and high focus',
        profiles: { minimalist: 3, perfectionist: 2 }
      },
      {
        value: 'collaborative_space',
        label: 'Collaborative spaces with team interaction',
        profiles: { collaborator: 3, balancer: 1 }
      },
      {
        value: 'varied_settings',
        label: 'Varied settings that change based on mood/task',
        profiles: { explorer: 3, balancer: 2 }
      },
      {
        value: 'optimized_setup',
        label: 'Highly optimized tools and systems',
        profiles: { optimizer: 3, strategist: 1 }
      }
    ]
  },
  {
    id: 'decision_making',
    category: 'Decision Making',
    question: 'When making important decisions, you:',
    options: [
      {
        value: 'thorough_analysis',
        label: 'Conduct thorough analysis of all options',
        profiles: { strategist: 3, perfectionist: 2 }
      },
      {
        value: 'quick_decisive',
        label: 'Make quick decisions and adjust if needed',
        profiles: { executor: 3, explorer: 1 }
      },
      {
        value: 'seek_input',
        label: 'Seek input from trusted colleagues or friends',
        profiles: { collaborator: 3, balancer: 1 }
      },
      {
        value: 'systematic_criteria',
        label: 'Use systematic criteria and frameworks',
        profiles: { optimizer: 3, minimalist: 2 }
      }
    ]
  },
  {
    id: 'stress_response',
    category: 'Stress Management',
    question: 'Under pressure, you tend to:',
    options: [
      {
        value: 'thrive_pressure',
        label: 'Thrive and produce your best work',
        profiles: { executor: 3, collaborator: 1 }
      },
      {
        value: 'systematic_breakdown',
        label: 'Break things down systematically',
        profiles: { strategist: 2, optimizer: 2, minimalist: 2 }
      },
      {
        value: 'seek_perfection',
        label: 'Become more focused on getting everything perfect',
        profiles: { perfectionist: 3 }
      },
      {
        value: 'maintain_balance',
        label: 'Try to maintain balance and perspective',
        profiles: { balancer: 3, explorer: 1 }
      }
    ]
  },
  {
    id: 'learning_style',
    category: 'Learning Preferences',
    question: 'You learn best through:',
    options: [
      {
        value: 'structured_learning',
        label: 'Structured courses and systematic study',
        profiles: { strategist: 2, perfectionist: 2, minimalist: 1 }
      },
      {
        value: 'hands_on',
        label: 'Hands-on experimentation and practice',
        profiles: { executor: 2, explorer: 3, optimizer: 2 }
      },
      {
        value: 'collaborative_learning',
        label: 'Discussion and collaboration with others',
        profiles: { collaborator: 3, balancer: 1 }
      },
      {
        value: 'varied_methods',
        label: 'A mix of different learning methods',
        profiles: { explorer: 2, balancer: 2, optimizer: 1 }
      }
    ]
  },
  {
    id: 'goal_setting',
    category: 'Goal Setting',
    question: 'Your approach to goal setting involves:',
    options: [
      {
        value: 'strategic_goals',
        label: 'Setting long-term strategic objectives',
        profiles: { strategist: 3, minimalist: 1 }
      },
      {
        value: 'action_oriented',
        label: 'Focusing on immediate actionable targets',
        profiles: { executor: 3, optimizer: 1 }
      },
      {
        value: 'shared_goals',
        label: 'Creating shared goals with team/family',
        profiles: { collaborator: 3, balancer: 2 }
      },
      {
        value: 'flexible_goals',
        label: 'Setting flexible goals that can evolve',
        profiles: { explorer: 3, balancer: 1 }
      }
    ]
  },
  {
    id: 'productivity_tools',
    category: 'Tool Usage',
    question: 'Your relationship with productivity tools is:',
    options: [
      {
        value: 'tool_enthusiast',
        label: 'Always exploring and optimizing new tools',
        profiles: { optimizer: 3, explorer: 2 }
      },
      {
        value: 'minimal_tools',
        label: 'Prefer simple, essential tools only',
        profiles: { minimalist: 3, balancer: 1 }
      },
      {
        value: 'comprehensive_system',
        label: 'Use comprehensive, integrated systems',
        profiles: { strategist: 2, perfectionist: 2 }
      },
      {
        value: 'collaborative_tools',
        label: 'Focus on tools that enhance collaboration',
        profiles: { collaborator: 3, executor: 1 }
      }
    ]
  },
  {
    id: 'task_completion',
    category: 'Task Management',
    question: 'You feel most satisfied when:',
    options: [
      {
        value: 'perfect_execution',
        label: 'Tasks are completed to perfection',
        profiles: { perfectionist: 3, strategist: 1 }
      },
      {
        value: 'quick_completion',
        label: 'Tasks are completed quickly and efficiently',
        profiles: { executor: 3, optimizer: 2 }
      },
      {
        value: 'team_achievement',
        label: 'Goals are achieved through team effort',
        profiles: { collaborator: 3, balancer: 1 }
      },
      {
        value: 'learning_growth',
        label: 'Tasks lead to learning and growth',
        profiles: { explorer: 3, balancer: 2 }
      }
    ]
  }
];

export function useProductivityProfile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { awardPoints } = useGamification();

  const [currentAssessment, setCurrentAssessment] = useState<AssessmentResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchCurrentAssessment = useCallback(async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('productivity_assessments')
        .select('*')
        .eq('user_id', user.id)
        .order('completed_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setCurrentAssessment(data);
    } catch (error) {
      console.error('Error fetching assessment:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const calculateProfileScores = (responses: Record<string, string>) => {
    const scores: Record<string, number> = {};

    // Initialize all profile scores to 0
    Object.keys(PRODUCTIVITY_PROFILES).forEach(profileId => {
      scores[profileId] = 0;
    });

    // Calculate scores based on responses
    ASSESSMENT_QUESTIONS.forEach(question => {
      const response = responses[question.id];
      const option = question.options.find(opt => opt.value === response);

      if (option) {
        Object.entries(option.profiles).forEach(([profileId, points]) => {
          scores[profileId] = (scores[profileId] || 0) + points;
        });
      }
    });

    return scores;
  };

  const getDominantProfiles = (scores: Record<string, number>) => {
    const sortedProfiles = Object.entries(scores)
      .sort(([, a], [, b]) => b - a);

    const dominant = sortedProfiles[0]?.[0];
    const secondary = sortedProfiles[1]?.[0];

    return { dominant, secondary };
  };

  const getRecommendationsForProfile = (profileId: string) => {
    const profile = PRODUCTIVITY_PROFILES[profileId];
    return {
      strategies: profile.recommendedStrategies,
      strengths: profile.strengths,
      growthAreas: profile.growthAreas
    };
  };

  const submitAssessment = useCallback(async (responses: Record<string, string>) => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    setIsSubmitting(true);
    try {
      const scores = calculateProfileScores(responses);
      const { dominant, secondary } = getDominantProfiles(scores);
      const recommendations = getRecommendationsForProfile(dominant);

      const assessmentData = {
        user_id: user.id,
        question_responses: responses,
        profile_scores: scores,
        dominant_profile: dominant,
        secondary_profile: secondary,
        recommended_strategies: recommendations.strategies,
        strengths: recommendations.strengths,
        growth_areas: recommendations.growthAreas,
        completed_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('productivity_assessments')
        .insert(assessmentData)
        .select()
        .single();

      if (error) throw error;

      // Update user profile with assessment completion
      await supabase
        .from('user_gamification_profiles')
        .update({
          productivity_profile_type: dominant,
          assessment_completed_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      // Award points for completing assessment
      await awardPoints('PROFILE_ASSESSMENT_COMPLETED');

      setCurrentAssessment(data);

      toast({
        title: "Assessment Complete!",
        description: `You're a ${PRODUCTIVITY_PROFILES[dominant].name}! Check out your personalized insights.`,
        duration: 5000
      });

      return data;
    } catch (error) {
      console.error('Error submitting assessment:', error);
      toast({
        title: "Error",
        description: "Failed to submit assessment. Please try again.",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }, [user, awardPoints, toast]);

  const retakeAssessment = useCallback(async () => {
    setCurrentAssessment(null);
  }, []);

  useEffect(() => {
    fetchCurrentAssessment();
  }, [fetchCurrentAssessment]);

  return {
    currentAssessment,
    isLoading,
    isSubmitting,
    submitAssessment,
    retakeAssessment,
    questions: ASSESSMENT_QUESTIONS,
    profiles: PRODUCTIVITY_PROFILES,
    calculateProfileScores,
    getDominantProfiles,
    getRecommendationsForProfile
  };
}