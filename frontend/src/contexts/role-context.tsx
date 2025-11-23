'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';

export type UserRole = 'Insurer' | 'Policyholder';

const ROLE_STORAGE_KEY = 'user-role';

interface RoleContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

interface RoleProviderProps {
  children: ReactNode;
  defaultRole?: UserRole;
}

export function RoleProvider({ children, defaultRole = 'Policyholder' }: RoleProviderProps): React.JSX.Element {
  const [role, setRoleState] = useState<UserRole>(defaultRole);

  // Load role from localStorage on mount
  useEffect(() => {
    if (globalThis.window !== undefined) {
      const storedRole = globalThis.window.localStorage.getItem(ROLE_STORAGE_KEY) as UserRole | null;
      if (storedRole && (storedRole === 'Insurer' || storedRole === 'Policyholder')) {
        setRoleState(storedRole);
      } else {
        // Set default role if nothing stored
        globalThis.window.localStorage.setItem(ROLE_STORAGE_KEY, defaultRole);
        setRoleState(defaultRole);
      }
    }
  }, [defaultRole]);

  const setRole = useCallback((newRole: UserRole) => {
    setRoleState(newRole);
    if (globalThis.window !== undefined) {
      globalThis.window.localStorage.setItem(ROLE_STORAGE_KEY, newRole);
    }
  }, []);

  const value: RoleContextType = {
    role,
    setRole,
  };

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
}

export function useRole(): RoleContextType {
  const context = useContext(RoleContext);
  if (context === undefined) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
}

