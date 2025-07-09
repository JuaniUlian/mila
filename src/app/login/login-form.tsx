
'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Loader2, User, AlertCircle } from 'lucide-react';
import { Logo } from '@/components/layout/logo';

const loginSchema = z.object({
  email: z.string().email('Por favor, introduce un correo electrónico válido.'),
  password: z.string().min(1, 'La contraseña no puede estar vacía.'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const { signInWithEmail, signInAsGuest, authError, clearAuthError, firebaseConfigured } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  useEffect(() => {
    if (authError) {
      toast({
        variant: 'destructive',
        title: 'Error de Autenticación',
        description: authError,
      });
      setIsLoading(false);
      clearAuthError();
    }
  }, [authError, toast, clearAuthError]);

  const handleEmailLogin = async (data: LoginFormValues) => {
    setIsLoading(true);
    try {
      await signInWithEmail(data.email, data.password);
      // On success, the AuthContext listener will redirect.
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error de inicio de sesión',
        description: error.message,
      });
      setIsLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setIsLoading(true);
    await signInAsGuest();
    router.push('/prepare');
    setIsLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl bg-white/60 backdrop-blur-lg">
        <CardHeader className="text-center">
            <Logo variant="color" className="mx-auto h-16 w-16" />
            <CardTitle className="text-3xl font-bold mt-4">Bienvenido</CardTitle>
        </CardHeader>
        <CardContent>
          {firebaseConfigured ? (
            <>
              <CardDescription className="text-center mb-4">
                Inicia sesión para analizar tus documentos.
              </CardDescription>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleEmailLogin)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Correo Electrónico</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="tu@correo.com"
                            {...field}
                            disabled={isLoading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contraseña</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="••••••••"
                            {...field}
                            disabled={isLoading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Iniciar Sesión
                  </Button>
                </form>
              </Form>
            </>
          ) : (
            <div className="text-center space-y-4">
              <div className="bg-amber-100 border-l-4 border-amber-500 text-amber-800 p-4 rounded-r-lg">
                <div className="flex">
                  <div className="py-1"><AlertCircle className="h-5 w-5 mr-3"/></div>
                  <div>
                    <p className="font-bold">Modo Demostración</p>
                    <p className="text-sm text-left">La conexión a Firebase no está configurada. Puedes continuar como invitado para explorar la aplicación con datos de ejemplo.</p>
                  </div>
                </div>
              </div>
              <Button onClick={handleGuestLogin} className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <User className="mr-2 h-4 w-4" />
                )}
                Ingresar como Invitado
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
