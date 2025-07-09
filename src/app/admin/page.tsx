'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';

export default function AdminPage() {
  const { user } = useAuth();

  return (
    <div className="container mx-auto p-4 md:p-8">
      <Card>
        <CardHeader>
          <CardTitle>Panel de Administración</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Bienvenido, {user?.displayName || user?.email}.</p>
          <p>Este es el panel de administración. Aquí podrás gestionar usuarios y ver métricas de la aplicación.</p>
          <p className="mt-4 font-bold">Rol: {user?.role}</p>
        </CardContent>
      </Card>
    </div>
  );
}
