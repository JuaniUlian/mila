'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Settings, User, Bell, Shield, Save, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { mockAuth } from '@/lib/auth/mock-auth';

export default function ConfiguracionPage() {
  const user = mockAuth.getCurrentUser();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    notifications: true,
    autoSave: true,
  });

  const handleSave = () => {
    alert('Configuración guardada exitosamente');
  };

  return (
    <div className="min-h-screen bg-home-page">
      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver al Dashboard
            </Button>
          </Link>
          <div className="flex items-center space-x-4">
            <div className="p-4 rounded-lg bg-gradient-to-r from-slate-500 to-slate-600 text-white">
              <Settings className="h-12 w-12" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Configuración</h1>
              <p className="text-gray-600 mt-2">
                Administra tu cuenta y preferencias
              </p>
            </div>
          </div>
        </div>

        {/* Settings Sections */}
        <div className="space-y-6">
          {/* Profile */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-3">
                <User className="h-6 w-6 text-blue-600" />
                <CardTitle>Información de Perfil</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Nombre completo</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Tu nombre"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="tu@email.com"
                />
              </div>
              <div>
                <Label htmlFor="role">Rol</Label>
                <Input
                  id="role"
                  value={user?.role || 'usuario'}
                  disabled
                  className="bg-slate-50"
                />
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-3">
                <Bell className="h-6 w-6 text-amber-600" />
                <CardTitle>Notificaciones</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Alertas de análisis completados</p>
                  <p className="text-sm text-gray-600">Recibe notificaciones cuando un análisis termine</p>
                </div>
                <input
                  type="checkbox"
                  checked={formData.notifications}
                  onChange={(e) => setFormData({ ...formData, notifications: e.target.checked })}
                  className="h-4 w-4"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Guardado automático</p>
                  <p className="text-sm text-gray-600">Guarda tus cambios automáticamente</p>
                </div>
                <input
                  type="checkbox"
                  checked={formData.autoSave}
                  onChange={(e) => setFormData({ ...formData, autoSave: e.target.checked })}
                  className="h-4 w-4"
                />
              </div>
            </CardContent>
          </Card>

          {/* Security */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-3">
                <Shield className="h-6 w-6 text-green-600" />
                <CardTitle>Seguridad</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Cliente asignado</Label>
                <Input
                  value={user?.clientId || 'N/A'}
                  disabled
                  className="bg-slate-50"
                />
              </div>
              <Button variant="outline" className="w-full">
                Cambiar contraseña
              </Button>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button onClick={handleSave} className="btn-bg-image">
              <Save className="mr-2 h-4 w-4" />
              Guardar cambios
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
