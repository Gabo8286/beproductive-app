import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Quote, ArrowRight, Target, Briefcase, GraduationCap } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface SuccessStory {
  id: string;
  name: string;
  role: string;
  avatar: string;
  category: string;
  categoryIcon: React.ReactNode;
  headline: string;
  excerpt: string;
  fullStory: string;
  metrics: {
    label: string;
    value: string;
  }[];
  image?: string;
}

const successStories: SuccessStory[] = [
  {
    id: "1",
    name: "Alex Chen",
    role: "Product Manager",
    avatar: "AC",
    category: "Career Growth",
    categoryIcon: <Briefcase className="h-4 w-4" />,
    headline: "Promoted to Senior PM in 6 Months",
    excerpt:
      "BeProductive's goal framework helped me map my career progression systematically...",
    fullStory:
      "When I started using BeProductive, I was struggling to organize my career development goals. The platform's structured approach to breaking down big goals into actionable milestones was a game-changer. I set clear objectives for skill development, project leadership, and stakeholder management. Within 6 months, I had completed all my planned milestones and earned a promotion to Senior Product Manager. The reflection feature helped me learn from each project and continuously improve.",
    metrics: [
      { label: "Time to Promotion", value: "6 months" },
      { label: "Goals Achieved", value: "12/12" },
      { label: "Skills Mastered", value: "8" },
    ],
  },
  {
    id: "2",
    name: "Maria Rodriguez",
    role: "PhD Candidate",
    avatar: "MR",
    category: "Academic Excellence",
    categoryIcon: <GraduationCap className="h-4 w-4" />,
    headline: "Completed Dissertation 3 Months Early",
    excerpt:
      "The milestone tracking feature kept my research on schedule and my advisor impressed...",
    fullStory:
      "Juggling research, teaching, and writing was overwhelming until I found BeProductive. I broke down my dissertation into manageable milestones and tracked my progress daily. The habit tracker helped me maintain consistent writing sessions, and the reflection prompts helped me process my research insights. I completed my dissertation 3 months ahead of schedule and published 5 papers during my PhD.",
    metrics: [
      { label: "Ahead of Schedule", value: "3 months" },
      { label: "Papers Published", value: "5" },
      { label: "Writing Streak", value: "127 days" },
    ],
  },
  {
    id: "3",
    name: "James Kim",
    role: "Startup Founder",
    avatar: "JK",
    category: "Business Launch",
    categoryIcon: <Target className="h-4 w-4" />,
    headline: "Launched SaaS Product in 90 Days",
    excerpt:
      "From idea to first customer in just 3 months using BeProductive's journey framework...",
    fullStory:
      "I had been dreaming about launching my SaaS product for years, but never made real progress. BeProductive's goal breakdown methodology finally gave me a clear path forward. I set a 90-day launch goal, created detailed milestones for MVP development, beta testing, and marketing. The visual progress tracking kept me motivated through the challenging early stages. Today, my product has 500+ paying customers.",
    metrics: [
      { label: "Launch Timeline", value: "90 days" },
      { label: "Customers", value: "500+" },
      { label: "Revenue", value: "$50K MRR" },
    ],
  },
];

export function SuccessStoriesGrid() {
  const [selectedStory, setSelectedStory] = useState<SuccessStory | null>(null);

  return (
    <>
      <div className="space-y-8">
        <div className="text-center space-y-3">
          <h3 className="text-3xl md:text-4xl font-heading font-bold">
            Real Journeys, Real Results
          </h3>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover how professionals like you transformed their productivity and achieved their most ambitious goals
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {successStories.map((story, index) => (
            <motion.div
              key={story.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="glass-card elevated-card group cursor-pointer h-full">
                <CardContent
                  className="p-6 space-y-4"
                  onClick={() => setSelectedStory(story)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-lg shadow-lg">
                        {story.avatar}
                      </div>
                      <div>
                        <div className="font-heading font-bold">{story.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {story.role}
                        </div>
                      </div>
                    </div>
                    <Badge variant="outline" className="gap-1.5 text-xs">
                      {story.categoryIcon}
                      {story.category}
                    </Badge>
                  </div>

                  <Quote className="h-6 w-6 text-primary/20" />

                  <div className="space-y-2">
                    <h4 className="font-heading font-bold text-lg leading-tight">
                      {story.headline}
                    </h4>
                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                      {story.excerpt}
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-3 pt-3 border-t">
                    {story.metrics.slice(0, 3).map((metric) => (
                      <div key={metric.label} className="text-center">
                        <div className="text-lg font-heading font-bold text-primary">
                          {metric.value}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {metric.label}
                        </div>
                      </div>
                    ))}
                  </div>

                  <Button
                    variant="ghost"
                    className="w-full group-hover:bg-primary/5 transition-colors"
                    size="sm"
                  >
                    Read Full Story
                    <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Story Detail Dialog */}
      <Dialog open={!!selectedStory} onOpenChange={() => setSelectedStory(null)}>
        <DialogContent className="max-w-2xl glass-effect">
          <DialogHeader>
            <DialogTitle className="sr-only">Success Story Details</DialogTitle>
          </DialogHeader>

          {selectedStory && (
            <div className="space-y-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                    {selectedStory.avatar}
                  </div>
                  <div>
                    <div className="font-heading font-bold text-xl">
                      {selectedStory.name}
                    </div>
                    <div className="text-muted-foreground">
                      {selectedStory.role}
                    </div>
                    <Badge variant="outline" className="gap-1.5 text-xs mt-2">
                      {selectedStory.categoryIcon}
                      {selectedStory.category}
                    </Badge>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-2xl font-heading font-bold mb-4">
                  {selectedStory.headline}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {selectedStory.fullStory}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-4 p-6 glass-card rounded-xl">
                {selectedStory.metrics.map((metric) => (
                  <div key={metric.label} className="text-center">
                    <div className="text-3xl font-heading font-bold text-primary mb-1">
                      {metric.value}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {metric.label}
                    </div>
                  </div>
                ))}
              </div>

              <Button className="w-full apple-button shadow-lg" size="lg" asChild>
                <a href="/signup">Start Your Success Story</a>
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
