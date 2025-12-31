import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/Logo';
import { ArrowRight, Send, Shield, Heart, Sparkles, Calendar } from 'lucide-react';
export function LandingPage() {
  const navigate = useNavigate();
  const containerVariants = {
    hidden: {
      opacity: 0
    },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };
  const itemVariants = {
    hidden: {
      opacity: 0,
      y: 30
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6
      }
    }
  };
  const features = [{
    icon: Calendar,
    text: 'Track your cycle effortlessly'
  }, {
    icon: Heart,
    text: 'Gentle, personalized insights'
  }, {
    icon: Shield,
    text: 'Your data stays private'
  }, {
    icon: Sparkles,
    text: 'No account required'
  }];
  return <div className="min-h-screen bg-background overflow-hidden">
      {/* Floating decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div className="absolute top-20 left-10 w-64 h-64 bg-primary/10 rounded-full blur-3xl" animate={{
        scale: [1, 1.2, 1],
        opacity: [0.3, 0.5, 0.3]
      }} transition={{
        duration: 8,
        repeat: Infinity
      }} />
        <motion.div className="absolute bottom-20 right-10 w-80 h-80 bg-secondary/20 rounded-full blur-3xl" animate={{
        scale: [1.2, 1, 1.2],
        opacity: [0.4, 0.6, 0.4]
      }} transition={{
        duration: 10,
        repeat: Infinity
      }} />
        <motion.div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-accent/10 rounded-full blur-3xl" animate={{
        rotate: [0, 360]
      }} transition={{
        duration: 60,
        repeat: Infinity,
        ease: 'linear'
      }} />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <motion.header className="flex justify-center mb-16" initial={{
        opacity: 0,
        y: -20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        duration: 0.6
      }}>
          <Logo size="large" />
        </motion.header>

        {/* Hero Section */}
        <motion.main variants={containerVariants} initial="hidden" animate="visible" className="max-w-2xl mx-auto text-center">
          <motion.div variants={itemVariants} className="mb-6">
            <motion.span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium" animate={{
            scale: [1, 1.02, 1]
          }} transition={{
            duration: 2,
            repeat: Infinity
          }}>
              <Sparkles className="w-4 h-4" />
              Privacy-first period tracking
            </motion.span>
          </motion.div>

          <motion.h1 variants={itemVariants} className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
            Understand your cycle.
            <br />
            <span className="text-primary">Own your health.</span>
          </motion.h1>

          <motion.p variants={itemVariants} className="text-lg md:text-xl text-muted-foreground mb-10 max-w-lg mx-auto leading-relaxed">
            Track your menstrual cycle, estimate fertile days, and gently understand 
            your body's patterns — privately, safely, and at your own pace.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Button variant="hero" size="xl" onClick={() => navigate('/track')} className="group">
              Start Tracking
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button variant="telegram" size="xl" onClick={() => window.open('https://t.me/Ancurehealth_bot', '_blank')}>
              <Send className="w-5 h-5" />
              Continue on Telegram
            </Button>
          </motion.div>

          {/* Illustration */}
          <motion.div variants={itemVariants} className="relative max-w-sm mx-auto mb-16">
            <motion.div className="relative z-10 p-8 rounded-3xl bg-gradient-to-br from-card to-muted/30 border border-primary/10 shadow-glow" animate={{
            y: [0, -10, 0]
          }} transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut'
          }}>
              <div className="flex items-center justify-center gap-4 mb-4">
                {['🌸', '🌱', '✨', '🍂'].map((emoji, index) => <motion.span key={index} className="text-3xl" animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 10, -10, 0]
              }} transition={{
                duration: 2,
                repeat: Infinity,
                delay: index * 0.3
              }}>
                    {emoji}
                  </motion.span>)}
              </div>
              <p className="text-center text-sm text-muted-foreground">
                Your cycle phases, beautifully tracked
              </p>
            </motion.div>
          </motion.div>

          {/* Features */}
          <motion.div variants={itemVariants} className="grid grid-cols-2 gap-4 max-w-md mx-auto mb-16">
            {features.map((feature, index) => {
            const Icon = feature.icon;
            return <motion.div key={index} className="flex items-center gap-3 p-4 rounded-2xl bg-primary/5 backdrop-blur-sm shadow-card border border-primary/10" whileHover={{
              scale: 1.05,
              y: -2
            }} initial={{
              opacity: 0,
              y: 20
            }} animate={{
              opacity: 1,
              y: 0
            }} transition={{
              delay: 0.6 + index * 0.1
            }}>
                  <div className="p-2 rounded-xl bg-primary/10">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <span className="text-sm font-medium text-foreground">{feature.text}</span>
                </motion.div>;
          })}
          </motion.div>
        </motion.main>

        {/* Footer */}
        <motion.footer className="text-center" initial={{
        opacity: 0
      }} animate={{
        opacity: 1
      }} transition={{
        delay: 1,
        duration: 0.6
      }}>
          <p className="text-xs text-muted-foreground max-w-md mx-auto px-4">
            This tool provides educational estimates only and is not a medical diagnosis or medical advice.
          </p>
        </motion.footer>
      </div>
    </div>;
}