// Componente de protección
// src/components/RouteGuard.jsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useAuthStore from '@/store/authStore';

export default function RouteGuard({ 
  children, 
  allowedRoles = ['admin'] 
}) {
  const router = useRouter();
  const { isAuthenticated, role } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (!allowedRoles.includes(role)) {
      router.push(role === 'juez' ? '/jueces' : '/login');
    }
  }, [isAuthenticated, role, router, allowedRoles]);

  if (!isAuthenticated || !allowedRoles.includes(role)) {
    return null;
  }

  return children;
}