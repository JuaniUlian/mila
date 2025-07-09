import { getAuthenticatedUser } from '@/lib/firebase/server';
import { redirect } from 'next/navigation';
import LoginForm from './login-form';

export default async function LoginPage() {
  const { user } = await getAuthenticatedUser();

  if (user) {
    redirect('/prepare');
  }

  return <LoginForm />;
}
