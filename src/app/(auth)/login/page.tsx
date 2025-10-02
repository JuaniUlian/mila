'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield, Loader2, AlertCircle } from 'lucide-react';
import { login } from '@/lib/auth/mock-auth';
import { useToast } from '@/hooks/use-toast';

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await login(email, password);

      if (result.success) {
        toast({
          title: '¡Bienvenido!',
          description: `Sesión iniciada como ${result.user?.name}`,
        });

        // Redirigir al dashboard
        router.push('/dashboard');
      } else {
        setError(result.error || 'Error al iniciar sesión');
      }
    } catch (err: any) {
      setError('Error de conexión. Intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Shield className="h-16 w-16 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">MILA</h1>
          <p className="text-gray-600 mt-2">Más Inteligencia Legal y Administrativa</p>
        </div>

        {/* Card de Login */}
        <Card className="shadow-2xl">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Iniciar Sesión</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  className="bg-white"
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="bg-white"
                />
              </div>

              {/* Error message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              {/* Submit button */}
              <Button
                type="submit"
                className="w-full btn-bg-image text-lg py-6"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Iniciando sesión...
                  </>
                ) : (
                  'Ingresar'
                )}
              </Button>
            </form>

            {/* Demo credentials hint */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-xs text-blue-800 font-semibold mb-2">
                🔐 Credenciales de demo:
              </p>
              <p className="text-xs text-blue-700 font-mono">
                Email: juani@mila.ar<br />
                Contraseña: Mila.2025
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-6 text-sm text-gray-600">
          <p>¿No tienes cuenta? Contacta a tu administrador</p>
        </div>
      </div>
    </div>
  );
}
