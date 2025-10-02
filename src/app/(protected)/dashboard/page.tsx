'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  FileText,
  AlertTriangle,
  Clock,
  TrendingUp,
  Database,
  Settings,
  LogOut,
  ChevronRight,
  Shield,
  Briefcase,
  Target,
} from 'lucide-react';
import { getCurrentUser, logout, hasModule } from '@/lib/auth/mock-auth';
import { getUserMetrics, getAccuracyRate, getTimeSaved } from '@/lib/metrics';
import { Progress } from '@/components/ui/progress';
import Link from 'next/link';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const metrics = getUserMetrics();
  const accuracyRate = getAccuracyRate();
  const hoursSaved = getTimeSaved();

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      router.push('/login');
      return;
    }
    setUser(currentUser);
  }, [router]);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin">⏳</div>
      </div>
    );
  }

  // Módulos disponibles
  const modules = [
    {
      id: 'operativo',
      name: 'Módulo Operativo',
      description: 'Validación de pliegos de licitación y contratación directa',
      icon: <Briefcase className="h-12 w-12" />,
      color: 'from-blue-500 to-blue-600',
      route: '/prepare', // Módulo ya existente
      active: hasModule('operativo'),
    },
    {
      id: 'tecnico',
      name: 'Módulo Técnico',
      description: 'Análisis de especificaciones técnicas y obras públicas',
      icon: <Target className="h-12 w-12" />,
      color: 'from-green-500 to-green-600',
      route: '/technical-module',
      active: hasModule('tecnico'),
    },
    {
      id: 'estrategico',
      name: 'Módulo Estratégico',
      description: 'Contratos de concesión y asociaciones público-privadas',
      icon: <TrendingUp className="h-12 w-12" />,
      color: 'from-indigo-500 to-indigo-600',
      route: '/strategic-module',
      active: hasModule('estrategico'),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Shield className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-xl font-bold text-gray-900">MILA</h1>
              <p className="text-xs text-gray-600">{user.name}</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Link href="/admin/clients">
              <Button variant="ghost" size="sm">
                <Database className="h-4 w-4 mr-2" />
                Biblioteca Normativa
              </Button>
            </Link>
            <Link href="/settings">
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Configuración
              </Button>
            </Link>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Salir
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Bienvenido, {user.name.split(' ')[0]} 👋
          </h2>
          <p className="text-gray-600">
            Aquí tienes un resumen de tu actividad y acceso a los módulos activos.
          </p>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Análisis realizados"
            value={metrics.analysisCount}
            subtitle="este mes"
            icon={<FileText className="h-6 w-6 text-blue-600" />}
            bgColor="bg-blue-50"
          />
          <MetricCard
            title="Hallazgos detectados"
            value={metrics.findingsDetected}
            subtitle={`${metrics.findingsApplied} aplicados`}
            icon={<AlertTriangle className="h-6 w-6 text-amber-600" />}
            bgColor="bg-amber-50"
          />
          <MetricCard
            title="Tiempo ahorrado"
            value={`${hoursSaved}h`}
            subtitle="vs auditoría manual"
            icon={<Clock className="h-6 w-6 text-green-600" />}
            bgColor="bg-green-50"
          />
          <MetricCard
            title="Tasa de precisión"
            value={`${accuracyRate}%`}
            subtitle={`${metrics.userUpvotes} confirmados`}
            icon={<TrendingUp className="h-6 w-6 text-indigo-600" />}
            bgColor="bg-indigo-50"
          />
        </div>

        {/* Modules Section */}
        <div className="mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Tus Módulos</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {modules.map((module) => (
              <Card
                key={module.id}
                className={`relative overflow-hidden hover:shadow-xl transition-shadow ${
                  !module.active ? 'opacity-60' : ''
                }`}
              >
                <div className={`absolute top-0 left-0 right-0 h-2 bg-gradient-to-r ${module.color}`} />
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-lg bg-gradient-to-r ${module.color} text-white`}>
                      {module.icon}
                    </div>
                    {module.active ? (
                      <Badge className="bg-green-100 text-green-800">Activo</Badge>
                    ) : (
                      <Badge className="bg-gray-100 text-gray-600">No disponible</Badge>
                    )}
                  </div>
                  <CardTitle className="text-xl">{module.name}</CardTitle>
                  <p className="text-sm text-gray-600 mt-2">{module.description}</p>
                </CardHeader>
                <CardContent>
                  {module.active ? (
                    <Link href={module.route}>
                      <Button className="w-full btn-bg-image">
                        Abrir módulo
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  ) : (
                    <Button className="w-full" variant="outline" disabled>
                      Contacta a tu administrador
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <Card className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold mb-2">
                  ¿Necesitas ayuda o capacitación?
                </h3>
                <p className="text-blue-100">
                  Nuestro equipo está disponible para soporte técnico y capacitaciones personalizadas.
                </p>
              </div>
              <Button className="bg-white text-blue-600 hover:bg-blue-50">
                Contactar Soporte
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function MetricCard({
  title,
  value,
  subtitle,
  icon,
  bgColor,
}: {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ReactNode;
  bgColor: string;
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-lg ${bgColor}`}>{icon}</div>
        </div>
        <div className="text-3xl font-bold text-gray-900 mb-1">{value}</div>
        <p className="text-sm text-gray-600">{title}</p>
        {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
      </CardContent>
    </Card>
  );
}
