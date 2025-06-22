import { useSelector } from 'react-redux';

export const useHasPermission = (permission: string) => {
    const user = useSelector((state: any) => state.auth.user);
    return user?.permissions?.includes(permission) ?? false;
  };