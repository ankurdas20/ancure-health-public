import { motion } from 'framer-motion';
import { ArrowLeft, MessageCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Logo } from '@/components/Logo';

const AncureOneWelcome = () => {
  const navigate = useNavigate();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { type: 'spring' as const, stiffness: 100 }
    }
  };

  return (
    <div className="min-h-screen gradient-hero">
      <div className="container mx-auto px-4 py-12 max-w-lg">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          {/* Logo */}
          <motion.div variants={itemVariants} className="flex justify-center">
            <Logo />
          </motion.div>

          {/* Thank You Card */}
          <motion.div variants={itemVariants}>
            <Card variant="glow" className="overflow-hidden text-center">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 pointer-events-none" />
              <CardContent className="pt-10 pb-8 relative space-y-6">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-5xl"
                >
                  🌸
                </motion.div>
                
                <div className="space-y-4">
                  <h1 className="text-2xl font-bold text-foreground">
                    Thank you for supporting Ancure Health
                  </h1>
                  
                  <p className="text-muted-foreground leading-relaxed">
                    Your support helps keep Ancure private, gentle, and accessible for everyone.
                  </p>
                  
                  <p className="text-muted-foreground leading-relaxed">
                    Your Ancure One benefits will activate as you continue tracking.
                    If you're using our Telegram reminders, you'll see deeper insights there too 🤍
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Telegram Note */}
          <motion.div variants={itemVariants}>
            <Card variant="soft" className="border-primary/10">
              <CardContent className="pt-5 pb-5">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center flex-shrink-0">
                    <MessageCircle className="w-4 h-4 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-foreground">
                      Using our Telegram reminders?
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Type <code className="px-1.5 py-0.5 rounded bg-muted text-primary font-mono text-xs">/one</code> in the bot to activate Ancure One features.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Back Button */}
          <motion.div variants={itemVariants}>
            <Button 
              onClick={() => navigate('/track')}
              variant="hero"
              size="lg"
              className="w-full"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Dashboard
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default AncureOneWelcome;
