import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell, BellOff, BellRing, Check } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import {
  getNotificationSettings,
  saveNotificationSettings,
  requestNotificationPermission,
  getNotificationPermissionStatus,
  scheduleReminders,
  NotificationSettings as NotificationSettingsType,
} from '@/lib/notifications';
import { CycleInsights } from '@/lib/cycleCalculations';

interface NotificationSettingsProps {
  insights: CycleInsights;
  goal?: string;
}

export function NotificationSettings({ insights, goal }: NotificationSettingsProps) {
  const { toast } = useToast();
  const [settings, setSettings] = useState<NotificationSettingsType>(getNotificationSettings());
  const [permissionStatus, setPermissionStatus] = useState(getNotificationPermissionStatus());

  useEffect(() => {
    setPermissionStatus(getNotificationPermissionStatus());
  }, []);

  const handleEnableNotifications = async () => {
    const granted = await requestNotificationPermission();
    setPermissionStatus(getNotificationPermissionStatus());

    if (granted) {
      const scheduledNotifications = scheduleReminders(
        insights.nextPeriodDate,
        insights.fertileWindowStart,
        goal
      );
      
      const newSettings = {
        ...settings,
        enabled: true,
        scheduledNotifications,
      };
      setSettings(newSettings);
      saveNotificationSettings(newSettings);

      toast({
        title: 'Reminders enabled! 🔔',
        description: `You'll receive ${scheduledNotifications.length} upcoming reminder(s).`,
      });
    } else {
      toast({
        title: 'Permission denied',
        description: 'Please enable notifications in your browser settings.',
        variant: 'destructive',
      });
    }
  };

  const handleDisableNotifications = () => {
    const newSettings = {
      ...settings,
      enabled: false,
      scheduledNotifications: [],
    };
    setSettings(newSettings);
    saveNotificationSettings(newSettings);
    
    toast({
      title: 'Reminders disabled',
      description: 'You won\'t receive cycle reminders.',
    });
  };

  const toggleReminderType = (type: 'periodReminder' | 'fertileReminder') => {
    const newSettings = {
      ...settings,
      [type]: !settings[type],
    };
    setSettings(newSettings);
    saveNotificationSettings(newSettings);
  };

  const isUnsupported = permissionStatus === 'unsupported';
  const isDenied = permissionStatus === 'denied';

  return (
    <Card variant="soft" className="overflow-hidden border border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <BellRing className="w-5 h-5 text-primary" />
          Reminders
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isUnsupported ? (
          <p className="text-sm text-muted-foreground">
            Your browser doesn't support notifications. Try using a modern browser.
          </p>
        ) : isDenied ? (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Notifications are blocked. Please enable them in your browser settings.
            </p>
            <Button variant="outline" size="sm" disabled>
              <BellOff className="w-4 h-4 mr-2" />
              Blocked by browser
            </Button>
          </div>
        ) : settings.enabled ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between p-3 rounded-xl bg-primary/10 border border-primary/20">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">Reminders enabled</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDisableNotifications}
                className="text-muted-foreground"
              >
                Disable
              </Button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="period-reminder" className="text-sm cursor-pointer">
                  Period reminders
                </Label>
                <Switch
                  id="period-reminder"
                  checked={settings.periodReminder}
                  onCheckedChange={() => toggleReminderType('periodReminder')}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="fertile-reminder" className="text-sm cursor-pointer">
                  Fertility reminders
                </Label>
                <Switch
                  id="fertile-reminder"
                  checked={settings.fertileReminder}
                  onCheckedChange={() => toggleReminderType('fertileReminder')}
                />
              </div>
            </div>

            {settings.scheduledNotifications.length > 0 && (
              <div className="pt-2 border-t border-border">
                <p className="text-xs text-muted-foreground mb-2">
                  Upcoming reminders:
                </p>
                <div className="space-y-1">
                  {settings.scheduledNotifications.slice(0, 3).map((n) => (
                    <div key={n.id} className="text-xs text-foreground/80 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-primary/50" />
                      {new Date(n.date).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                      {' - '}
                      {n.type === 'period' ? 'Period reminder' : 'Fertility reminder'}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Get notified before your period starts and during your fertile window.
            </p>
            <Button
              variant="soft"
              className="w-full gap-2"
              onClick={handleEnableNotifications}
            >
              <Bell className="w-4 h-4" />
              Enable Reminders
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
