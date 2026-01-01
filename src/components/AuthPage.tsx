import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Logo } from '@/components/Logo';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft, Mail, Sparkles, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function AuthPage() {
  const navigate = useNavigate();
  const { signInWithMagicLink, initializeAuth, user } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState('');

  // Initialize auth when page loads
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/track');
    }
  }, [user, navigate]);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }
    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }
    setIsLoading(true);
    const {
      error
    } = await signInWithMagicLink(email);
    setIsLoading(false);
    if (error) {
      toast({
        title: "Oops!",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive"
      });
      return;
    }
    setEmailSent(true);
    toast({
      title: "Check your email! 💌",
      description: "We've sent you a magic link to sign in."
    });
  };
  return <div className="min-h-screen gradient-hero">
      {/* Decorative background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div className="absolute top-20 right-10 w-48 h-48 bg-primary/10 rounded-full blur-3xl" animate={{
        scale: [1, 1.3, 1],
        opacity: [0.3, 0.5, 0.3]
      }} transition={{
        duration: 8,
        repeat: Infinity
      }} />
        <motion.div className="absolute bottom-40 left-10 w-64 h-64 bg-secondary/15 rounded-full blur-3xl" animate={{
        scale: [1.2, 1, 1.2],
        opacity: [0.4, 0.6, 0.4]
      }} transition={{
        duration: 10,
        repeat: Infinity
      }} />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-6">
        {/* Header */}
        <motion.header className="flex items-center justify-between mb-12" initial={{
        opacity: 0,
        y: -20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        duration: 0.5
      }}>
          <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <Logo size="small" />
          <div className="w-16" />
        </motion.header>

        {/* Auth Card */}
        <motion.div initial={{
        opacity: 0,
        y: 30
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        duration: 0.6
      }} className="max-w-md mx-auto">
          <Card variant="glow">
            <CardHeader className="text-center">
              <motion.div className="mx-auto mb-4 p-4 rounded-full bg-primary/10 w-fit" animate={{
              scale: [1, 1.05, 1]
            }} transition={{
              duration: 2,
              repeat: Infinity
            }}>
                <Mail className="w-8 h-8 text-primary" />
              </motion.div>
              <CardTitle className="text-2xl">
                {emailSent ? 'Check your inbox!' : 'Welcome back 💕'}
              </CardTitle>
              <CardDescription className="text-base">
                {emailSent ? `We've sent a magic link to ${email}. Click it to sign in!` : 'Sign in with your email to save your cycle data across devices'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!emailSent ? <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Input type="email" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} disabled={isLoading} autoComplete="email" />
                    {error && <motion.p initial={{
                  opacity: 0,
                  y: -10
                }} animate={{
                  opacity: 1,
                  y: 0
                }} className="text-sm text-destructive flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {error}
                      </motion.p>}
                  </div>
                  
                  <Button type="submit" variant="hero" size="lg" className="w-full" disabled={isLoading}>
                    {isLoading ? <>
                        <motion.div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full" animate={{
                    rotate: 360
                  }} transition={{
                    duration: 1,
                    repeat: Infinity,
                    ease: 'linear'
                  }} />
                        Sending...
                      </> : <>
                        <Sparkles className="w-5 h-5" />
                        Send Magic Link
                      </>}
                  </Button>

                  <p className="text-xs text-center text-muted-foreground">
                    No password needed! We'll send you a secure link to sign in.
                  </p>
                </form> : <div className="text-center space-y-4">
                  <motion.div initial={{
                scale: 0
              }} animate={{
                scale: 1
              }} transition={{
                type: 'spring',
                stiffness: 200
              }}>
                    <CheckCircle className="w-16 h-16 text-primary mx-auto" />
                  </motion.div>
                  
                  <p className="text-gray-950 text-base">
                    Didn't receive it? Check your Spam folder or
                  </p>
                  
                  <Button variant="outline" onClick={() => {
                setEmailSent(false);
                setEmail('');
              }}>
                    Try a different email
                  </Button>
                </div>}
            </CardContent>
          </Card>

          {/* Continue without account */}
          <motion.div initial={{
          opacity: 0
        }} animate={{
          opacity: 1
        }} transition={{
          delay: 0.5
        }} className="mt-6 text-center">
            <Button variant="ghost" onClick={() => navigate('/track')} className="text-muted-foreground">
              Continue without an account
            </Button>
            <p className="text-xs text-muted-foreground mt-2">
              Your data will only be saved on this device
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>;
}