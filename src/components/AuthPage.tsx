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
  const { signInWithMagicLink, signInWithGoogle, initializeAuth, user } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState('');

  // Initialize auth when page loads
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

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

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    const { error } = await signInWithGoogle();
    if (error) {
      setIsGoogleLoading(false);
      toast({
        title: "Oops!",
        description: error.message || "Failed to sign in with Google. Please try again.",
        variant: "destructive"
      });
    } else {
      navigate('/');
    }
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

                   <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    className="w-full gap-2"
                    onClick={handleGoogleSignIn}
                    disabled={isGoogleLoading || isLoading}
                  >
                    {isGoogleLoading ? (
                      <motion.div
                        className="w-5 h-5 border-2 border-foreground border-t-transparent rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      />
                    ) : (
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path
                          fill="currentColor"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="currentColor"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="currentColor"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                          fill="currentColor"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                      </svg>
                    )}
                    Sign in with Google
                  </Button>

                  <p className="text-xs text-center text-muted-foreground">
                    No password needed! Use magic link or Google.
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