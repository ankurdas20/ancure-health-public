import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LandingPage } from '@/components/LandingPage';
import { useAuth } from '@/contexts/AuthContext';
import { PhoneCollectionModal } from '@/components/PhoneCollectionModal';

const Index = () => {
  const navigate = useNavigate();
  const { user, profile, initializeAuth, initialized, loading } = useAuth();
  const [showPhoneModal, setShowPhoneModal] = useState(false);

  // Initialize auth to handle OAuth callback
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // Check if user needs to add phone number after login
  useEffect(() => {
    if (initialized && !loading && user && profile) {
      if (!profile.phone_number) {
        setShowPhoneModal(true);
      } else {
        navigate('/track', { replace: true });
      }
    }
  }, [user, profile, initialized, loading, navigate]);

  const handlePhoneModalClose = () => {
    setShowPhoneModal(false);
    navigate('/track', { replace: true });
  };

  return (
    <>
      <LandingPage />
      {user && (
        <PhoneCollectionModal
          open={showPhoneModal}
          onClose={handlePhoneModalClose}
          userId={user.id}
        />
      )}
    </>
  );
};

export default Index;
