import { useCallback } from 'react';
import { useNavigate } from 'react-router';
import { useSession } from '../SessionContext';
import { clearSession } from '../authUtils';

export const useAuth = () => {
  const { session, setSession } = useSession();
  const navigate = useNavigate();

  const signIn = useCallback(() => {
    navigate("/sign-in");
  }, [navigate]);

  const signOut = useCallback(() => {
    setSession(null);
    clearSession();
    navigate("/sign-in");
  }, [navigate, setSession]);

  return {
    session,
    signIn,
    signOut
  };
};