import type { UserRole } from './types';

export interface AuthGuardResult {
  allowed: boolean;
  redirectTo?: string;
  reason?: 'unauthenticated' | 'unauthorized';
}

export function authGuard(
  isAuthenticated: boolean,
  hasRole: (roles: UserRole[]) => boolean,
  allowedRoles?: UserRole[]
): AuthGuardResult {
  if (!isAuthenticated) {
    return { allowed: false, redirectTo: '/auth', reason: 'unauthenticated' };
  }
  if (allowedRoles && allowedRoles.length > 0 && !hasRole(allowedRoles)) {
    return { allowed: false, reason: 'unauthorized' };
  }
  return { allowed: true };
}
