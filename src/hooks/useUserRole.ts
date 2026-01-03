import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

type AppRole = 'admin' | 'moderator' | 'user';

interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
  created_at: string;
}

export function useUserRole() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['user-role', user?.id],
    queryFn: async (): Promise<UserRole | null> => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        // No role found is not an error - user just doesn't have a role
        if (error.code === 'PGRST116') {
          return null;
        }
        console.error('Error fetching user role:', error);
        return null;
      }

      return data as UserRole;
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
}

export function useIsAdmin() {
  const { data: role, isLoading } = useUserRole();
  return {
    isAdmin: role?.role === 'admin',
    isLoading,
  };
}
