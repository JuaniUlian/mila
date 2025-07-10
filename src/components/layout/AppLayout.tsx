// Este archivo ya no se usa y puede ser eliminado. 
// La lógica se ha movido a MainContent.tsx y el RootLayout.
// Se deja vacío para evitar errores de importación si algún archivo aún lo referencia,
// pero debería limpiarse en el futuro.
import React from 'react';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
