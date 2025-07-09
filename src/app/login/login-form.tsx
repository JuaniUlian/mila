'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
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
import { Separator } from '@/components/ui/separator';

const loginSchema = z.object({
  email: z.string().email('Por favor, introduce un correo electrónico válido.'),
  password: z.string().min(1, 'La contraseña no puede estar vacía.'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginForm() {
  const { signInWithEmail, authError, clearAuthError, signInAsGuest, loading: isLoading } = useAuth();
  const { toast } = useToast();

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
      clearAuthError();
    }
  }, [authError, toast, clearAuthError]);

  const handleEmailLogin = async (data: LoginFormValues) => {
    clearAuthError();
    await signInWithEmail(data.email, data.password);
  };

  const handleGuestLogin = async () => {
    await signInAsGuest();
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl bg-white/60 backdrop-blur-lg">
        <CardHeader className="text-center">
            <Logo variant="color" className="mx-auto h-16 w-16" />
            <CardTitle className="text-3xl font-bold mt-4">Bienvenido</CardTitle>
            <CardDescription>
                Ingresa tus credenciales para usar la IA o explora en modo invitado.
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
        <CardFooter className="flex-col gap-4">
             <div className="relative flex w-full items-center">
                <Separator className="flex-1" />
                <span className="mx-4 text-xs text-muted-foreground">O</span>
                <Separator className="flex-1" />
            </div>
             <Button
                variant="outline"
                className="w-full"
                onClick={handleGuestLogin}
                disabled={isLoading}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Ingresar como Invitado
              </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
