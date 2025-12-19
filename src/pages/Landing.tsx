import { Link } from "react-router-dom";
import { ArrowRight, GraduationCap, MessageCircle, BookOpen } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { Button } from "@/components/ui/button";
import { FeatureCard } from "@/components/FeatureCard";
import { Footer } from "@/components/Footer";

export default function Landing() {
  const { t } = useLanguage();

  const features = [
    {
      icon: GraduationCap,
      title: t("feature.eligibility.title"),
      description: t("feature.eligibility.desc"),
    },
    {
      icon: MessageCircle,
      title: t("feature.guidance.title"),
      description: t("feature.guidance.desc"),
    },
    {
      icon: BookOpen,
      title: t("feature.alternatives.title"),
      description: t("feature.alternatives.desc"),
    },
  ];

  return (
    <div className="min-h-screen flex flex-col gradient-bg">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 sm:pt-40 sm:pb-32 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center space-y-8 animate-fade-in">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              For Sri Lankan A/L Students
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight">
              <span className="gradient-text">{t("hero.tagline")}</span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              {t("hero.subtitle")}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Button
                asChild
                size="lg"
                className="h-14 px-8 rounded-full text-base font-medium shadow-medium hover:shadow-strong transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
              >
                <Link to="/eligibility">
                  {t("hero.checkEligibility")}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                asChild
                variant="secondary"
                size="lg"
                className="h-14 px-8 rounded-full text-base font-medium transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
              >
                <Link to="/chat">
                  {t("hero.askGuide")}
                  <MessageCircle className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Background decoration */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-1/2 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-primary/5 blur-3xl" />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Everything you need to decide
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Comprehensive tools and guidance to help you make informed decisions about your future education.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <FeatureCard
                key={feature.title}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                delay={index * 100}
              />
            ))}
          </div>
        </div>
      </section>

      {/* How it works section */}
      <section className="py-20 px-4 bg-secondary/30">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">How it works</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: "01", title: "Enter Z-Score", desc: "Input your Z-score and select your district" },
              { step: "02", title: "View Options", desc: "See all universities and courses you qualify for" },
              { step: "03", title: "Get Guidance", desc: "Chat with our AI for personalized career advice" },
            ].map((item, index) => (
              <div 
                key={item.step} 
                className="text-center space-y-4 animate-fade-in"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground text-xl font-bold">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-3xl text-center">
          <div className="glass-card rounded-3xl p-8 sm:p-12 shadow-strong">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">
              Ready to explore your options?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
              Start by checking your eligibility or chat with our AI guide for personalized advice.
            </p>
            <Button
              asChild
              size="lg"
              className="h-14 px-8 rounded-full text-base font-medium shadow-medium"
            >
              <Link to="/eligibility">
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
