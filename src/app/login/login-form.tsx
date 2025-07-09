
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
import { Separator } from '@/components/ui/separator';
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
  const { signInWithEmail, signInWithGoogle } = useAuth();
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
        description = 'Firebase no está configurado. Por favor, revisa tu archivo .env.';
      } else if (error.code) {
        switch (error.code) {
          case 'auth/invalid-credential':
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

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      await signInWithGoogle();
      router.push('/prepare');
    } catch (error: any) {
      let description = 'No se pudo iniciar sesión con Google. Por favor, inténtalo de nuevo.';
      if (error.code) {
        switch (error.code) {
          case 'auth/popup-closed-by-user':
            setIsLoading(false);
            return;
          case 'auth/account-exists-with-different-credential':
            description = 'Ya existe una cuenta con este correo electrónico, pero con un método de inicio de sesión diferente.';
            break;
          case 'auth/network-request-failed':
            description = 'Error de red. Por favor, revisa tu conexión a internet.';
            break;
          default:
            description = `Ocurrió un error con Google: ${error.message}`;
        }
      } else if (error.message && error.message.includes('Firebase is not configured')) {
        description = 'Firebase no está configurado. Por favor, revisa tu archivo .env.';
      } else if (error.message) {
        description = `Ocurrió un error con Google: ${error.message}`;
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
          <div className="mx-auto h-16 w-16">
            <Logo variant="color" />
          </div>
          <CardTitle className="text-3xl font-bold mt-4">Bienvenido a MILA</CardTitle>
          <CardDescription>
            Inicia sesión para analizar tus documentos.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
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

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                O continuar con
              </span>
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full"
            onClick={handleGoogleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
                <svg
                    role="img"
                    viewBox="0 0 24 24"
                    className="mr-2 h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <title>Google</title>
                    <path
                    d="M12.48 10.92v3.28h7.84c-.24 1.84-.85 3.18-1.73 4.1-1.02 1.02-2.37 1.62-3.82 1.62-4.51 0-8.15-3.64-8.15-8.15S7.98 3.5 12.5 3.5c2.11 0 3.92.76 5.39 2.18l2.5-2.5C18.16.89 15.47 0 12.5 0 5.6 0 0 5.6 0 12.5s5.6 12.5 12.5 12.5c2.83 0 5.23-.93 7-2.95 1.83-2.06 2.72-4.94 2.72-8.22 0-.62-.07-1.22-.2-1.8z"
                    fill="#4285F4"
                    />
                </svg>
            )}
            Google
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
