import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useTranslation } from "react-i18next";
import { X, Check, Mail, Copy, Send, User, Lock, Eye, EyeOff } from "lucide-react";
import { useConversionTracking } from "@/hooks/useConversionTracking";
import { ConversionEventType } from "@/types/conversion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

const AnimatedLogo = ({ text = "BeProductive" }) => {
  const chars = text.split("");
  return (
    <span className="inline-flex">
      {chars.map((char, index) => (
        <motion.span
          key={index}
          className="inline-block font-heading font-extrabold"
          animate={{
            color: [
              "hsl(221, 83%, 53%)",
              "hsl(262, 52%, 47%)",
              "hsl(142, 71%, 45%)",
              "hsl(221, 83%, 53%)"
            ]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: index * 0.05,
            ease: "linear"
          }}
        >
          {char}
        </motion.span>
      ))}
    </span>
  );
};

const AnimatedWord = ({ word, delay = 0 }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.span
      className="inline-block mx-1"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      animate={isHovered ? { scale: 1.05 } : { scale: 1 }}
      transition={{ duration: 0.2 }}
    >
      {word}
    </motion.span>
  );
};

const FeatureBlock = ({ title, description, index }) => {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.3 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, []);

  return (
    <motion.div
      ref={ref}
      className="py-6 px-8 mb-12 border-l-4 border-transparent transition-all duration-800"
      initial={{ opacity: 0, y: 30 }}
      animate={isVisible ? {
        opacity: 1,
        y: 0,
        borderLeftColor: "hsl(221, 83%, 53%)"
      } : {
        opacity: 0,
        y: 30,
        borderLeftColor: "transparent"
      }}
      transition={{ duration: 0.8, delay: index * 0.1 }}
    >
      <h3 className="text-3xl font-heading font-extrabold mb-3 text-foreground">
        {title}
      </h3>
      <p className="text-lg text-muted-foreground leading-relaxed">
        {description}
      </p>
    </motion.div>
  );
};

const PricingCard = ({ plan, featured = false, onClick }) => {
  const { t } = useTranslation('landing');

  // Fallback data in case translations don't load
  const fallbackData = {
    basic: { name: "Basic", price: "$9.99", period: "month" },
    professional: { name: "Professional", price: "$19.99", period: "month" },
    teams: { name: "Teams", price: "$24.99", period: "user/month" }
  };

  const planName = t(`pricing.${plan}.name`, { fallback: fallbackData[plan]?.name || plan });
  const planPrice = t(`pricing.${plan}.price`, { fallback: fallbackData[plan]?.price || "$0" });
  const planPeriod = t(`pricing.${plan}.period`, { fallback: fallbackData[plan]?.period || "month" });

  return (
    <motion.div
      whileHover={{ y: -10 }}
      transition={{ duration: 0.3 }}
      className="flex-1 max-w-sm"
    >
      <Card
        className={`cursor-pointer transition-all duration-300 ${
          featured
            ? "scale-105 border-2 border-primary shadow-xl"
            : "border border-border hover:shadow-lg"
        }`}
        onClick={onClick}
      >
        <CardContent className="p-8">
          <h3 className="text-2xl font-heading font-bold text-primary mb-2">
            {planName}
          </h3>
          <div className="mb-4">
            <span className="text-5xl font-extrabold">
              {planPrice}
            </span>
            <span className="text-muted-foreground ml-2">
              / {planPeriod}
            </span>
          </div>
          {featured && (
            <div className="bg-primary/10 text-primary px-3 py-1 rounded-full inline-block text-sm font-medium">
              {t("pricing.mostPopular", { fallback: "Most Popular" })}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export const RedesignedLandingPage = () => {
  const { t, i18n } = useTranslation('landing');
  const navigate = useNavigate();
  const { trackEvent, trackBehavior } = useConversionTracking();
  const { signInAsGuest } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [showLunaLoginModal, setShowLunaLoginModal] = useState(false);
  const [lunaVisible, setLunaVisible] = useState(false);
  const [betaForm, setBetaForm] = useState({
    email: "",
    name: "",
    comments: ""
  });
  const lunaVideoRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setLunaVisible(window.scrollY > 200);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Control Luna video playback based on visibility
  useEffect(() => {
    if (lunaVideoRef.current) {
      if (lunaVisible) {
        lunaVideoRef.current.play().catch(console.error);
      } else {
        lunaVideoRef.current.pause();
      }
    }
  }, [lunaVisible]);

  const handleCTAClick = (location: string) => {
    trackEvent(ConversionEventType.CTA_CLICK, { location }, 5);
    trackBehavior("click", `cta-${location}`);
    navigate("/signup");
  };

  const handleAssessmentClick = () => {
    trackEvent(ConversionEventType.CTA_CLICK, { location: "assessment-cta" }, 10);
    trackBehavior("click", "assessment-button");
    navigate("/profile-assessment");
  };

  const handlePricingClick = (plan: string) => {
    setSelectedPlan(plan);
    setShowPricingModal(true);
    trackEvent(ConversionEventType.CTA_CLICK, { location: `pricing-${plan}` }, 3);
  };

  const handleLunaClick = () => {
    trackEvent(ConversionEventType.CTA_CLICK, { location: "luna-assistant" }, 8);
    trackBehavior("click", "luna-login");
    setShowLunaLoginModal(true);
  };

  // TEMPORARY DEVELOPMENT FUNCTIONS - REMOVE FOR PRODUCTION
  const handleDevAdminLogin = () => {
    console.log('[DEV] Signing in as admin guest user...');
    signInAsGuest('admin');
    toast.success('Signed in as Super Admin (Development)');
    setTimeout(() => navigate('/app'), 1000);
  };

  const handleDevProfessionalLogin = () => {
    console.log('[DEV] Signing in as professional guest user...');
    signInAsGuest('professional');
    toast.success('Signed in as Professional User (Development)');
    setTimeout(() => navigate('/app'), 1000);
  };

  const handleDevTeamLogin = () => {
    console.log('[DEV] Signing in as team guest user...');
    signInAsGuest('team');
    toast.success('Signed in as Team Lead (Development)');
    setTimeout(() => navigate('/app'), 1000);
  };
  // END TEMPORARY DEVELOPMENT FUNCTIONS

  const handleBetaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const { error } = await supabase
        .from("beta_signups")
        .insert([
          {
            email: betaForm.email,
            name: betaForm.name || null,
            comments: betaForm.comments || null
          }
        ]);

      if (error) throw error;

      toast.success(t("beta.successMessage"));
      setBetaForm({ email: "", name: "", comments: "" });
      trackEvent(ConversionEventType.CTA_CLICK, { location: "beta-signup" }, 10);
    } catch (error) {
      toast.error(t("beta.errorMessage"));
    }
  };

  const features = [
    {
      title: t("features.personalized.title"),
      description: t("features.personalized.description")
    },
    {
      title: t("features.habits.title"),
      description: t("features.habits.description")
    },
    {
      title: t("features.goals.title"),
      description: t("features.goals.description")
    },
    {
      title: t("features.progress.title"),
      description: t("features.progress.description")
    }
  ];

  const plans = ["basic", "professional", "teams"];

  return (
    <div className="min-h-screen bg-background">
      {/* Fixed Logo */}
      <div className="fixed top-5 left-8 z-50">
        <Link to="/">
          <AnimatedLogo />
        </Link>
      </div>

      {/* Language Switcher */}
      <div className="fixed top-5 right-8 z-50 flex gap-2 bg-card border border-border rounded-lg p-2">
        <button
          onClick={() => i18n.changeLanguage("en")}
          className={`px-3 py-1 rounded-md font-heading font-bold transition-colors ${
            i18n.language === "en"
              ? "bg-primary text-white"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          EN
        </button>
        <button
          onClick={() => i18n.changeLanguage("es")}
          className={`px-3 py-1 rounded-md font-heading font-bold transition-colors ${
            i18n.language === "es"
              ? "bg-primary text-white"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          ES
        </button>
      </div>

      {/* Hero Section */}
      <section className="container mx-auto px-4 pt-32 pb-24">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <motion.h1
                className="text-5xl md:text-6xl font-heading font-extrabold leading-tight"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  {t("hero.title.line1")}
                </span>
                <br />
                {t("hero.title.line2").split(" ").map((word, index) => (
                  <AnimatedWord key={index} word={word} delay={index * 0.1} />
                ))}
                <AnimatedLogo />
              </motion.h1>

              <motion.p
                className="text-xl text-muted-foreground leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                {t("hero.subtitle")}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <Button
                  size="lg"
                  className="text-lg px-8 py-6 shadow-lg hover:shadow-xl"
                  onClick={() => handleCTAClick("hero")}
                >
                  {t("hero.cta")}
                </Button>
              </motion.div>
            </div>

            <motion.div
              className="relative"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Card className="p-8 bg-gradient-to-br from-primary/5 to-secondary/5">
                <CardContent className="space-y-4">
                  <div className="aspect-video bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg flex items-center justify-center">
                    <span className="text-4xl">🚀</span>
                  </div>
                  <div className="text-center">
                    <h3 className="font-heading font-bold text-lg mb-2">
                      {t("hero.showcase.title")}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {t("hero.showcase.description")}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-24">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-heading font-extrabold mb-4">
            {t("features.title")}
          </h2>
        </motion.div>

        <div className="max-w-3xl mx-auto">
          {features.map((feature, index) => (
            <FeatureBlock
              key={index}
              title={feature.title}
              description={feature.description}
              index={index}
            />
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="container mx-auto px-4 py-24 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-heading font-extrabold mb-4">
            {t("howItWorks.title")}
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            {t("howItWorks.description")}
          </p>
          <motion.div
            whileHover={{
              scale: 1.05,
              boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)"
            }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.2 }}
          >
            <Button
              size="lg"
              className="text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-shadow duration-200"
              onClick={handleAssessmentClick}
            >
              {t("howItWorks.cta")}
            </Button>
          </motion.div>
        </motion.div>
      </section>

      {/* Pricing Section */}
      <section className="container mx-auto px-4 py-24">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-heading font-extrabold mb-4">
            {t("pricing.title")}
          </h2>
        </motion.div>

        <div className="flex flex-col md:flex-row gap-8 justify-center items-center max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <PricingCard
              key={plan}
              plan={plan}
              featured={index === 1}
              onClick={() => handlePricingClick(plan)}
            />
          ))}
        </div>
      </section>

      {/* Beta Signup Section */}
      <section className="container mx-auto px-4 py-24">
        <div className="max-w-2xl mx-auto">
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-12">
              <h2 className="text-3xl font-heading font-extrabold text-center mb-4 text-primary">
                {t("beta.title")}
              </h2>
              <p className="text-center text-muted-foreground mb-8">
                {t("beta.description")}
              </p>

              <form onSubmit={handleBetaSubmit} className="space-y-4">
                <Input
                  type="email"
                  placeholder={t("beta.emailPlaceholder")}
                  value={betaForm.email}
                  onChange={(e) => setBetaForm({ ...betaForm, email: e.target.value })}
                  required
                  className="text-lg py-6"
                />
                <Input
                  type="text"
                  placeholder={t("beta.namePlaceholder")}
                  value={betaForm.name}
                  onChange={(e) => setBetaForm({ ...betaForm, name: e.target.value })}
                  className="text-lg py-6"
                />
                <Textarea
                  placeholder={t("beta.commentsPlaceholder")}
                  value={betaForm.comments}
                  onChange={(e) => setBetaForm({ ...betaForm, comments: e.target.value })}
                  className="min-h-[100px] text-lg"
                />
                <Button type="submit" className="w-full text-lg py-6">
                  {t("beta.submitButton")}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Contact Section */}
      <section className="container mx-auto px-4 py-24">
        <div className="max-w-4xl mx-auto">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-heading font-extrabold mb-4">
              {t("contact.title")}
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {t("contact.description")}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <Card className="bg-gradient-to-br from-card to-primary/5 border-primary/20 overflow-hidden">
              <CardContent className="p-12">
                <div className="flex flex-col items-center space-y-8">
                  <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                    <Mail className="h-10 w-10 text-primary" />
                  </div>

                  <div className="text-center space-y-4">
                    <h3 className="text-2xl font-heading font-bold text-foreground">
                      {t("contact.emailTitle")}
                    </h3>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                      <a
                        href="mailto:gabosoto@be-productive.app"
                        className="text-xl font-medium text-primary hover:text-primary/80 transition-colors flex items-center gap-2"
                      >
                        <Mail className="h-5 w-5" />
                        gabosoto@be-productive.app
                      </a>

                      <Button
                        variant="outline"
                        size="sm"
                        className="border-primary/20 hover:bg-primary/10"
                        onClick={() => {
                          navigator.clipboard.writeText("gabosoto@be-productive.app");
                          toast.success(t("contact.emailCopied"));
                        }}
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        {t("contact.copyEmail")}
                      </Button>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 pt-4">
                    <Button
                      size="lg"
                      className="shadow-lg hover:shadow-xl"
                      onClick={() => window.location.href = "mailto:gabosoto@be-productive.app?subject=BeProductive Inquiry"}
                    >
                      <Send className="h-5 w-5 mr-2" />
                      {t("contact.sendEmail")}
                    </Button>

                    <Button
                      size="lg"
                      variant="outline"
                      className="border-primary/20 hover:bg-primary/10"
                      onClick={() => handleCTAClick("contact-schedule")}
                    >
                      {t("contact.scheduleCall")}
                    </Button>
                  </div>

                  <div className="text-center pt-4">
                    <p className="text-sm text-muted-foreground">
                      {t("contact.responseTime")}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-12 text-center border-t">
        <AnimatedLogo />
        <p className="text-sm text-muted-foreground mt-4">
          © 2025 BeProductive. All rights reserved.
        </p>
      </footer>

      {/* Luna Assistant */}
      <AnimatePresence>
        {lunaVisible && (
          <motion.div
            className="fixed bottom-5 right-5 z-40 cursor-pointer"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3 }}
            whileHover={{
              scale: 1.1,
              boxShadow: "0 0 20px rgba(59, 130, 246, 0.5)"
            }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLunaClick}
          >
            <div className="w-32 h-32 rounded-full overflow-hidden shadow-xl relative">
              {/* Subtle pulse ring for interaction hint */}
              <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" style={{ animationDuration: '3s' }}></div>

              <video
                ref={lunaVideoRef}
                className="w-full h-full object-cover relative z-10"
                autoPlay
                loop
                muted
                playsInline
                onLoadStart={() => console.log("Luna video loading...")}
                onCanPlay={() => console.log("Luna video ready to play")}
              >
                <source src="/Luna.mp4" type="video/mp4" />
                {/* Fallback for browsers that don't support video */}
                <div className="w-full h-full bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
                  <span className="text-4xl">🤖</span>
                </div>
              </video>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pricing Modal */}
      <Dialog open={showPricingModal} onOpenChange={setShowPricingModal}>
        <DialogContent className="sm:max-w-md">
          <AnimatePresence mode="wait">
            {selectedPlan && (
              <motion.div
                key={selectedPlan}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <DialogHeader>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: 0 }}
                  >
                    <DialogTitle className="text-2xl font-heading font-bold text-primary">
                      {t(`pricing.${selectedPlan}.name`)}
                    </DialogTitle>
                  </motion.div>
                </DialogHeader>

                <div className="space-y-6">
                  <motion.div
                    className="text-center"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                  >
                    <span className="text-4xl font-extrabold">
                      {t(`pricing.${selectedPlan}.price`)}
                    </span>
                    <span className="text-muted-foreground ml-2">
                      / {t(`pricing.${selectedPlan}.period`)}
                    </span>
                  </motion.div>

                  <motion.ul
                    className="space-y-3"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                  >
                    {t(`pricing.${selectedPlan}.features`, { returnObjects: true }).map((feature, index) => (
                      <motion.li
                        key={index}
                        className="flex items-start gap-3 text-sm"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: 0.2 + (index * 0.1) }}
                      >
                        <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </motion.li>
                    ))}
                  </motion.ul>

                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.2 + (t(`pricing.${selectedPlan}.features`, { returnObjects: true }).length * 0.1) + 0.1 }}
                  >
                    <Button
                      className="w-full"
                      onClick={() => {
                        setShowPricingModal(false);
                        handleCTAClick(`pricing-modal-${selectedPlan}`);
                      }}
                    >
                      {t("pricing.choosePlan")}
                    </Button>
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </DialogContent>
      </Dialog>

      {/* Luna Login Modal */}
      <Dialog open={showLunaLoginModal} onOpenChange={setShowLunaLoginModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl font-heading font-bold">
              Welcome to BeProductive
            </DialogTitle>
          </DialogHeader>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Luna Avatar */}
            <div className="flex justify-center">
              <div className="w-20 h-20 rounded-full overflow-hidden shadow-lg">
                <video
                  className="w-full h-full object-cover"
                  autoPlay
                  loop
                  muted
                  playsInline
                >
                  <source src="/Luna.mp4" type="video/mp4" />
                  <div className="w-full h-full bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
                    <span className="text-2xl">🤖</span>
                  </div>
                </video>
              </div>
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-lg font-semibold">Meet Luna, Your AI Assistant</h3>
              <p className="text-muted-foreground">Sign in to unlock personalized productivity insights</p>
            </div>

            {/* Quick Login Options */}
            <div className="space-y-4">
              <Button
                className="w-full text-lg py-6"
                onClick={() => {
                  setShowLunaLoginModal(false);
                  navigate("/login");
                }}
              >
                <User className="h-5 w-5 mr-2" />
                Sign In to Your Account
              </Button>

              <Button
                variant="outline"
                className="w-full text-lg py-6"
                onClick={() => {
                  setShowLunaLoginModal(false);
                  navigate("/signup");
                }}
              >
                <Mail className="h-5 w-5 mr-2" />
                Create New Account
              </Button>

              <div className="text-center">
                <Button
                  variant="ghost"
                  className="text-muted-foreground"
                  onClick={() => setShowLunaLoginModal(false)}
                >
                  Continue as Guest
                </Button>
              </div>
            </div>

            <div className="text-center text-xs text-muted-foreground border-t pt-4">
              <p>🚀 Get AI-powered productivity insights</p>
              <p>📊 Track your progress with advanced analytics</p>
              <p>🎯 Personalized strategies based on your profile</p>
            </div>
          </motion.div>
        </DialogContent>
      </Dialog>

      {/* TEMPORARY DEVELOPMENT PANEL - REMOVE FOR PRODUCTION */}
      {import.meta.env.DEV && (
        <div className="fixed bottom-4 left-4 z-50 bg-yellow-100 border-2 border-yellow-400 rounded-lg p-4 shadow-lg">
          <div className="text-xs font-semibold text-yellow-800 mb-2 flex items-center gap-2">
            <span>⚠️ DEVELOPMENT MODE</span>
          </div>
          <div className="space-y-2">
            <Button
              onClick={handleDevAdminLogin}
              size="sm"
              className="w-full bg-red-600 hover:bg-red-700 text-white text-xs"
            >
              Login as Super Admin
            </Button>
            <Button
              onClick={handleDevProfessionalLogin}
              size="sm"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs"
            >
              Login as Professional User
            </Button>
            <Button
              onClick={handleDevTeamLogin}
              size="sm"
              className="w-full bg-green-600 hover:bg-green-700 text-white text-xs"
            >
              Login as Team Lead
            </Button>
          </div>
          <div className="text-xs text-yellow-700 mt-2">
            Quick access for development testing
          </div>
        </div>
      )}
      {/* END TEMPORARY DEVELOPMENT PANEL */}
    </div>
  );
};