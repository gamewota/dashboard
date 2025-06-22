import { useSelector } from 'react-redux';

export const useAuth = () => {
  return useSelector((state: any) => state.auth);
};