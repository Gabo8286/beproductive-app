import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Briefcase,
  GraduationCap,
  Rocket,
  Users,
  Code,
  CheckCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Persona {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  gradient: string;
  features: string[];
  useCases: string[];
}

const personas: Persona[] = [
  {
    id: "executive",
    title: "Busy Executive",
    description: "Strategic goal management for leadership roles",
    icon: <Briefcase className="h-6 w-6" />,
    gradient: "from-blue-500/10 to-blue-600/10",
    features: [
      "Team goal alignment",
      "Strategic planning tools",
      "Executive dashboards",
      "Progress reporting",
    ],
    useCases: [
      "Manage quarterly OKRs",
      "Track team performance",
      "Strategic initiative planning",
    ],
  },
  {
    id: "student",
    title: "Student",
    description: "Academic success through structured learning",
    icon: <GraduationCap className="h-6 w-6" />,
    gradient: "from-purple-500/10 to-purple-600/10",
    features: [
      "Study schedule planning",
      "Assignment tracking",
      "Exam preparation",
      "Learning habits",
    ],
    useCases: [
      "Prepare for final exams",
      "Build consistent study routines",
      "Track academic progress",
    ],
  },
  {
    id: "entrepreneur",
    title: "Entrepreneur",
    description: "Build and scale your business systematically",
    icon: <Rocket className="h-6 w-6" />,
    gradient: "from-orange-500/10 to-orange-600/10",
    features: [
      "Business milestone tracking",
      "Launch planning",
      "Growth metrics",
      "Market validation",
    ],
    useCases: [
      "Launch MVP to market",
      "Validate business ideas",
      "Track startup metrics",
    ],
  },
  {
    id: "teamlead",
    title: "Team Lead",
    description: "Coordinate team efforts and deliver results",
    icon: <Users className="h-6 w-6" />,
    gradient: "from-green-500/10 to-green-600/10",
    features: [
      "Project coordination",
      "Team task distribution",
      "Sprint planning",
      "Collaboration tools",
    ],
    useCases: [
      "Manage agile sprints",
      "Coordinate team deliverables",
      "Track project milestones",
    ],
  },
  {
    id: "developer",
    title: "Developer",
    description: "Optimize your coding workflow and learning",
    icon: <Code className="h-6 w-6" />,
    gradient: "from-cyan-500/10 to-cyan-600/10",
    features: [
      "Learning roadmaps",
      "Project tracking",
      "Code review habits",
      "Skill development",
    ],
    useCases: [
      "Master new frameworks",
      "Build portfolio projects",
      "Track coding challenges",
    ],
  },
];

interface PersonaSelectorProps {
  onPersonaSelect?: (personaId: string) => void;
}

export function PersonaSelector({
  onPersonaSelect,
}: PersonaSelectorProps = {}) {
  const [selectedPersona, setSelectedPersona] = useState<string>(
    personas[0].id,
  );

  const selected =
    personas.find((p) => p.id === selectedPersona) || personas[0];

  const handleSelect = (personaId: string) => {
    setSelectedPersona(personaId);
    onPersonaSelect?.(personaId);
  };

  return (
    <div className="space-y-8">
      {/* Persona Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {personas.map((persona, index) => (
          <motion.div
            key={persona.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card
              onClick={() => handleSelect(persona.id)}
              className={cn(
                "cursor-pointer elevated-card group transition-all duration-300",
                selectedPersona === persona.id
                  ? "ring-2 ring-primary shadow-xl"
                  : "hover:shadow-lg",
              )}
            >
              <CardContent className="p-6 text-center space-y-3">
                <div
                  className={cn(
                    "w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br flex items-center justify-center group-hover:scale-110 transition-transform duration-300",
                    persona.gradient,
                  )}
                >
                  {persona.icon}
                </div>
                <div>
                  <h4 className="font-heading font-bold text-sm mb-1">
                    {persona.title}
                  </h4>
                  {selectedPersona === persona.id && (
                    <Badge className="bg-primary text-xs">Selected</Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Selected Persona Details */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedPersona}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="glass-card">
            <CardContent className="p-8 md:p-12">
              <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
                <div className="space-y-6">
                  <div>
                    <div
                      className={cn(
                        "inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br mb-4",
                        selected.gradient,
                      )}
                    >
                      {selected.icon}
                    </div>
                    <h3 className="text-3xl font-heading font-bold mb-3">
                      {selected.title}
                    </h3>
                    <p className="text-lg text-muted-foreground">
                      {selected.description}
                    </p>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-heading font-bold text-sm uppercase tracking-wider text-muted-foreground">
                      Key Features
                    </h4>
                    <div className="space-y-2">
                      {selected.features.map((feature, index) => (
                        <motion.div
                          key={feature}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center gap-3"
                        >
                          <div className="w-5 h-5 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0">
                            <CheckCircle className="h-3 w-3 text-success" />
                          </div>
                          <span>{feature}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-3">
                    <h4 className="font-heading font-bold text-sm uppercase tracking-wider text-muted-foreground">
                      Common Use Cases
                    </h4>
                    <div className="space-y-3">
                      {selected.useCases.map((useCase, index) => (
                        <motion.div
                          key={useCase}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="glass-card p-4 rounded-xl"
                        >
                          <p className="font-medium">{useCase}</p>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  <Button
                    size="lg"
                    className="w-full apple-button shadow-lg hover:shadow-xl font-medium"
                    asChild
                  >
                    <a href="/signup">Start As {selected.title}</a>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
