// Modificar RouteGuard.jsx para manejar la hidratación
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useAuthStore from '@/store/authStore';

export default function RouteGuard({ children, allowedRoles = ['admin'] }) {
  const router = useRouter();
  const { isAuthenticated, role } = useAuthStore();
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) return; // No hacer nada hasta que esté hidratado

    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (!allowedRoles.includes(role)) {
      router.push(role === 'juez' ? '/jueces' : '/login');
    }
  }, [isAuthenticated, role, router, allowedRoles, isHydrated]);

  if (!isHydrated || !isAuthenticated || !allowedRoles.includes(role)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-xl font-semibold text-gray-600">
          Cargando...
        </div>
      </div>
    );
  }

  return children;
}