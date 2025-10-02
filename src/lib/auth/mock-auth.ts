/**
 * Sistema de autenticación mock para demo
 * En producción, reemplazar con NextAuth, Clerk o Supabase Auth
 */

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
  clientId: string;
  modules: string[]; // módulos activos
}

// Usuario hardcodeado para demo
const MOCK_USER: User = {
  id: 'user-001',
  email: 'juani@mila.ar',
  name: 'Juan Ignacio Ulian',
  role: 'admin',
  clientId: 'municipio-rosario',
  modules: ['operativo', 'tecnico', 'estrategico'], // Tiene todos los módulos
};

const MOCK_PASSWORD = 'Mila.2025';

/**
 * Login con credenciales hardcodeadas
 */
export async function login(email: string, password: string): Promise<{
  success: boolean;
  user?: User;
  error?: string;
}> {
  // Simular delay de red
  await new Promise(resolve => setTimeout(resolve, 500));

  if (email === MOCK_USER.email && password === MOCK_PASSWORD) {
    // Guardar en localStorage para persistencia
    if (typeof window !== 'undefined') {
      localStorage.setItem('mila-user', JSON.stringify(MOCK_USER));
      localStorage.setItem('mila-session', Date.now().toString());
    }

    return {
      success: true,
      user: MOCK_USER,
    };
  }

  return {
    success: false,
    error: 'Email o contraseña incorrectos',
  };
}

/**
 * Logout
 */
export async function logout(): Promise<void> {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('mila-user');
    localStorage.removeItem('mila-session');
  }
}

/**
 * Obtiene el usuario actual de la sesión
 */
export function getCurrentUser(): User | null {
  if (typeof window === 'undefined') return null;

  const stored = localStorage.getItem('mila-user');
  if (!stored) return null;

  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

/**
 * Verifica si el usuario tiene un módulo específico
 */
export function hasModule(moduleId: string): boolean {
  const user = getCurrentUser();
  if (!user) return false;
  return user.modules.includes(moduleId);
}

/**
 * Verifica si hay sesión activa
 */
export function isAuthenticated(): boolean {
  return getCurrentUser() !== null;
}
