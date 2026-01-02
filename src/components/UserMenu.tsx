import { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LogIn, LogOut, User } from 'lucide-react';

interface UserMenuProps {
  onSignIn?: () => void;
}

export const UserMenu = memo(function UserMenu({ onSignIn }: UserMenuProps) {
  const navigate = useNavigate();
  const { user, profile, isAuthenticated, loading, signOut, initializeAuth } = useAuth();

  const handleSignIn = async () => {
    await initializeAuth();
    if (onSignIn) {
      onSignIn();
    } else {
      navigate('/auth');
    }
  };

  const handleSignOut = async () => {
    await signOut();
  };

  // Get user initials for avatar fallback
  const getInitials = () => {
    if (profile?.full_name) {
      return profile.full_name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    if (user?.email) {
      return user.email[0].toUpperCase();
    }
    return 'U';
  };

  // Get display name
  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'User';

  if (!isAuthenticated) {
    return (
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={handleSignIn}
        disabled={loading}
        className="gap-2"
      >
        <LogIn className="w-4 h-4" />
        Sign in
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2 px-2">
          <Avatar className="h-7 w-7">
            <AvatarImage src={profile?.avatar_url || undefined} alt={displayName} />
            <AvatarFallback className="text-xs bg-primary/10 text-primary">
              {getInitials()}
            </AvatarFallback>
          </Avatar>
          <span className="hidden sm:inline text-sm font-medium max-w-[120px] truncate">
            {displayName}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{displayName}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user?.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="gap-2 text-muted-foreground">
          <User className="w-4 h-4" />
          <span>Profile</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut} className="gap-2 text-destructive">
          <LogOut className="w-4 h-4" />
          <span>Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
});
