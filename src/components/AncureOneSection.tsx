import { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { Heart, CheckCircle, Calendar, FileText, Bell, Sparkles, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const benefits = [
  { icon: Calendar, text: 'Long-term cycle history (6–12 months view)' },
  { icon: Sparkles, text: 'Deeper pattern insights over time' },
  { icon: FileText, text: 'Doctor-ready summary (PDF or text)' },
  { icon: Bell, text: 'Smarter and customizable Telegram reminders' },
  { icon: Heart, text: 'Early access to upcoming features' },
];

interface AncureOneSectionProps {
  id?: string;
}

export const AncureOneSection = forwardRef<HTMLDivElement, AncureOneSectionProps>(
  ({ id }, ref) => {
    const handleJoinClick = () => {
      window.open('https://pages.razorpay.com/stores/ancureone', '_blank');
    };

    return (
      <Card 
        ref={ref}
        id={id}
        variant="soft" 
        className="overflow-hidden border border-border/50"
      >
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-xl">
            Ancure One 
            <span className="text-lg">🤍</span>
          </CardTitle>
          <CardDescription className="text-sm italic">
            Always optional. Always gentle.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Ancure will always be free to use.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Ancure One is an optional care support plan for sisters who want long-term tracking, 
            deeper pattern insights, and to support the continued growth of Ancure Health.
          </p>

          {/* Benefits List */}
          <ul className="space-y-3">
            {benefits.map((benefit, index) => (
              <motion.li 
                key={index}
                className="flex items-start gap-3 text-sm"
                initial={{ opacity: 0, x: -15 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.08 }}
                viewport={{ once: true }}
              >
                <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <CheckCircle className="w-3 h-3 text-primary" />
                </div>
                <span className="text-muted-foreground">{benefit.text}</span>
              </motion.li>
            ))}
          </ul>

          {/* CTA Button */}
          <div className="pt-2">
            <Button 
              onClick={handleJoinClick}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-soft hover:shadow-glow transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
              size="lg"
            >
              Join Ancure One
              <ExternalLink className="w-4 h-4 ml-1" />
            </Button>
          </div>

          {/* Supporting Micro-copy */}
          <p className="text-xs text-center text-muted-foreground pt-1">
            No pressure. You can use Ancure freely forever.
          </p>
        </CardContent>
      </Card>
    );
  }
);

AncureOneSection.displayName = 'AncureOneSection';
