import { useEffect, useState, forwardRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LandingPage } from '@/components/LandingPage';
import { useAuth } from '@/contexts/AuthContext';
import { PhoneCollectionModal } from '@/components/PhoneCollectionModal';

const Index = forwardRef<HTMLDivElement>(function Index(_, ref) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile, initializeAuth, initialized, loading } = useAuth();
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [hasHandledAuth, setHasHandledAuth] = useState(false);

  // Initialize auth to handle OAuth callback
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // Only redirect after OAuth callback (when URL has hash with access_token)
  useEffect(() => {
    const isOAuthCallback = location.hash.includes('access_token');
    
    if (initialized && !loading && user && profile && !hasHandledAuth) {
      if (isOAuthCallback) {
        setHasHandledAuth(true);
        if (!profile.phone_number) {
          setShowPhoneModal(true);
        } else {
          navigate('/track', { replace: true });
        }
      }
    }
  }, [user, profile, initialized, loading, navigate, location.hash, hasHandledAuth]);

  const handlePhoneModalClose = () => {
    setShowPhoneModal(false);
    navigate('/track', { replace: true });
  };

  return (
    <div ref={ref}>
      <LandingPage />
      {user && (
        <PhoneCollectionModal
          open={showPhoneModal}
          onClose={handlePhoneModalClose}
          userId={user.id}
        />
      )}
    </div>
  );
});

export default Index;
