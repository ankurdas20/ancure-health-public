import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Phone, Sparkles, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PhoneCollectionModalProps {
  open: boolean;
  onClose: () => void;
  userId: string;
}

export function PhoneCollectionModal({ open, onClose, userId }: PhoneCollectionModalProps) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { toast } = useToast();

  const validatePhoneNumber = (phone: string) => {
    // Basic phone validation - allows formats like +1234567890, 1234567890, etc.
    const phoneRegex = /^[+]?[\d\s-]{10,15}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!phoneNumber.trim()) {
      setError('Please enter your phone number');
      return;
    }

    if (!validatePhoneNumber(phoneNumber)) {
      setError('Please enter a valid phone number (10-15 digits)');
      return;
    }

    setIsLoading(true);

    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ phone_number: phoneNumber.trim() })
        .eq('user_id', userId);

      if (updateError) {
        throw updateError;
      }

      toast({
        title: "Phone number saved! 📱",
        description: "Your phone number has been added to your profile.",
      });
      
      onClose();
    } catch (err) {
      console.error('Error saving phone number:', err);
      toast({
        title: "Oops!",
        description: "Failed to save phone number. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={() => {/* Prevent closing without phone */}}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <motion.div 
            className="mx-auto mb-4 p-4 rounded-full bg-primary/10 w-fit"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Phone className="w-8 h-8 text-primary" />
          </motion.div>
          <DialogTitle className="text-2xl">Add your phone number 📱</DialogTitle>
          <DialogDescription className="text-base">
            Stay connected! Add your phone number for important updates and reminders.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Input
              type="tel"
              placeholder="+1 (555) 123-4567"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              disabled={isLoading}
              autoComplete="tel"
            />
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm text-destructive flex items-center gap-1"
              >
                <AlertCircle className="w-4 h-4" />
                {error}
              </motion.p>
            )}
          </div>

          <Button
            type="submit"
            variant="hero"
            size="lg"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <motion.div
                  className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                />
                Saving...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Save Phone Number
              </>
            )}
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            Your phone number is required to complete registration.
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
}
