import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Check, Droplet, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarPicker } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { CycleData } from '@/lib/cycleCalculations';

interface PeriodLoggerProps {
  currentLastPeriodDate: string;
  onLogPeriod: (date: string) => void;
}

export function PeriodLogger({ currentLastPeriodDate, onLogPeriod }: PeriodLoggerProps) {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleLogToday = () => {
    const today = new Date().toISOString().split('T')[0];
    onLogPeriod(today);
    toast({
      title: 'Period logged! 🌸',
      description: 'Your cycle predictions have been updated.',
    });
  };

  const handleSelectDate = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      setShowConfirm(true);
    }
  };

  const handleConfirmDate = () => {
    if (selectedDate) {
      const dateStr = selectedDate.toISOString().split('T')[0];
      onLogPeriod(dateStr);
      setIsOpen(false);
      setShowConfirm(false);
      setSelectedDate(undefined);
      toast({
        title: 'Period logged! 🌸',
        description: `Updated to ${format(selectedDate, 'MMMM d, yyyy')}.`,
      });
    }
  };

  const handleCancelDate = () => {
    setShowConfirm(false);
    setSelectedDate(undefined);
  };

  const currentDate = new Date(currentLastPeriodDate);
  const today = new Date();

  return (
    <Card variant="soft" className="overflow-hidden border border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Droplet className="w-5 h-5 text-primary" />
          Log Period
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Log when your period actually starts to improve prediction accuracy.
        </p>

        <div className="text-xs text-muted-foreground bg-secondary/30 rounded-lg p-3">
          <span className="font-medium">Last logged:</span>{' '}
          {format(currentDate, 'MMMM d, yyyy')}
        </div>

        <div className="flex gap-2">
          <Button
            variant="soft"
            className="flex-1 gap-2"
            onClick={handleLogToday}
          >
            <Check className="w-4 h-4" />
            Started Today
          </Button>

          <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Calendar className="w-4 h-4" />
                Pick Date
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <AnimatePresence mode="wait">
                {showConfirm ? (
                  <motion.div
                    key="confirm"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="p-4 space-y-3"
                  >
                    <p className="text-sm font-medium">
                      Update period start to{' '}
                      {selectedDate && format(selectedDate, 'MMMM d, yyyy')}?
                    </p>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleCancelDate}
                        className="flex-1"
                      >
                        <X className="w-4 h-4 mr-1" />
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        variant="soft"
                        onClick={handleConfirmDate}
                        className="flex-1"
                      >
                        <Check className="w-4 h-4 mr-1" />
                        Confirm
                      </Button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="calendar"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                  >
                    <CalendarPicker
                      mode="single"
                      selected={selectedDate}
                      onSelect={handleSelectDate}
                      disabled={(date) => date > today || date < new Date(currentLastPeriodDate)}
                      initialFocus
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </PopoverContent>
          </Popover>
        </div>
      </CardContent>
    </Card>
  );
}
