'use client';

import React, { useState } from 'react';
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
import { Loader2, ShieldQuestion } from 'lucide-react';
import { Logo } from '@/components/layout/logo';

const loginSchema = z.object({
  email: z.string().email('Por favor, introduce un correo electrónico válido.'),
  password: z.string().min(1, 'La contraseña no puede estar vacía.'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const { signInWithEmail, isDemoMode, signInAsGuest } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const handleEmailLogin = async (data: LoginFormValues) => {
    setIsLoading(true);
    try {
      await signInWithEmail(data.email, data.password);
      router.push('/prepare');
    } catch (error: any) {
      let description = 'Ocurrió un error inesperado. Por favor, inténtalo de nuevo.';
      
      if (error.message && error.message.includes('Firebase is not configured')) {
        description = 'Firebase no está configurado. Por favor, revisa que las variables `NEXT_PUBLIC_FIREBASE_*` estén correctas en tu archivo `.env`. Si las acabas de añadir, recuerda reiniciar el servidor.';
      } else if (error.code) {
        switch (error.code) {
          case 'auth/invalid-credential':
          case 'auth/user-not-found':
          case 'auth/wrong-password':
            description = 'El correo o la contraseña son incorrectos. Por favor, verifica tus credenciales y que los usuarios existan en Firebase.';
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

  // If Firebase isn't configured, show a demo mode login screen.
  if (isDemoMode) {
    return (
       <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-2xl bg-white/60 backdrop-blur-lg">
          <CardHeader className="text-center">
            <Logo variant="color" className="mx-auto h-16 w-16" />
            <CardTitle className="text-3xl font-bold mt-4">Bienvenido</CardTitle>
            <CardDescription>
              La configuración de Firebase no está disponible.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center text-center gap-4">
            <p className="text-sm text-muted-foreground">
              Puedes continuar en modo demostración para explorar la aplicación. En este modo, se utilizarán datos de ejemplo y las funciones de IA estarán desactivadas.
            </p>
            <Button onClick={signInAsGuest} className="w-full max-w-xs">
              <ShieldQuestion className="mr-2 h-4 w-4" />
              Continuar en Modo Demostración
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

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
