import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LandingPage } from '@/components/LandingPage';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const navigate = useNavigate();
  const { user, initializeAuth, initialized, loading } = useAuth();

  // Initialize auth to handle OAuth callback
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // Redirect authenticated users to track page
  useEffect(() => {
    if (initialized && !loading && user) {
      navigate('/track', { replace: true });
    }
  }, [user, initialized, loading, navigate]);

  return <LandingPage />;
};

export default Index;
