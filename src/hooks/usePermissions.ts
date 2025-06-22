import { useSelector } from 'react-redux';
import type { RootState } from '../store';

export const useHasPermission = (permission: string): boolean => {
  const user = useSelector((state: RootState) => state.auth.user);

  const permissions = user?.roles?.flatMap(role => role.permissions) ?? [];

  return permissions.includes(permission);
};
