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
import { Loader2 } from 'lucide-react';
import { Logo } from '@/components/layout/logo';

const loginSchema = z.object({
  email: z.string().email('Por favor, introduce un correo electrónico válido.'),
  password: z.string().min(1, 'La contraseña no puede estar vacía.'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const { signInWithEmail, authError, clearAuthError } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // Effect to watch for async auth errors from the AuthContext
  useEffect(() => {
    if (authError) {
      toast({
        variant: 'destructive',
        title: 'Error de Autenticación',
        description: authError,
      });
      setIsLoading(false); // Ensure loading state is reset
      clearAuthError(); // Clear the error after showing it
    }
  }, [authError, toast, clearAuthError]);

  const handleEmailLogin = async (data: LoginFormValues) => {
    setIsLoading(true);
    try {
      await signInWithEmail(data.email, data.password);
      // On success, the onIdTokenChanged listener in AuthContext will handle the user state
      // and redirect will be handled by the middleware or the main page.
      // We can push the user to the prepare page as an optimistic update.
      router.push('/prepare');
    } catch (error: any) {
      let description = 'Ocurrió un error inesperado. Por favor, inténtalo de nuevo.';
      
      // This handles client-side errors (e.g., Firebase not configured on client)
      if (error.message && error.message.includes('Firebase no está configurado')) {
        description = 'Firebase no está configurado. Por favor, revisa que las variables `NEXT_PUBLIC_FIREBASE_*` estén correctas en tu archivo `.env`. Si las acabas de añadir, recuerda reiniciar el servidor.';
      } else if (error.code) {
        // This handles specific Firebase Auth error codes from the client
        switch (error.code) {
          case 'auth/invalid-credential':
          case 'auth/user-not-found':
          case 'auth/wrong-password':
            description = 'El correo o la contraseña son incorrectos. Por favor, verifica tus credenciales.';
            break;
          case 'auth/invalid-api-key':
            description = 'La clave de API de Firebase no es válida. Revisa la configuración en tu archivo .env.';
            break;
          case 'auth/network-request-failed':
            description = 'Error de red. Por favor, revisa tu conexión a internet.';
            break;
          case 'auth/too-many-requests':
            description = 'Se han realizado demasiados intentos. Por favor, inténtalo más tarde.';
            break;
          default:
            description = `Ocurrió un error de Firebase: ${error.message}`;
            break;
        }
      } else if (error.message) {
        // This can catch other generic errors
        description = error.message;
      }

      toast({
        variant: 'destructive',
        title: 'Error de autenticación',
        description,
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl bg-white/60 backdrop-blur-lg">
        <CardHeader className="text-center">
          <Logo variant="color" className="mx-auto h-16 w-16" />
          <CardTitle className="text-3xl font-bold mt-4">Bienvenido</CardTitle>
          <CardDescription>
            Inicia sesión para analizar tus documentos.
          </CardDescription>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>
    </div>
  );
}
