
'use client';

import React from 'react';
import Link from 'next/link';
import { LanguageSwitcher } from '@/components/layout/language-switcher';
import { Logo } from '@/components/layout/logo';
import { Button } from '@/components/ui/button';
import { BrainCircuit, Scale, ShieldCheck, Target, Search, FolderCheck, BookCheck, FileSignature, Edit, TrendingUp, CheckCircle, Share2, BarChart, Clock, Users, FileText, Globe, MapPin } from 'lucide-react';


const cardBaseClasses = "glass p-6 shadow rounded-2xl card-hud-hover h-full";
const detailsBaseClasses = "glass p-4 rounded-2xl shadow card-hud-hover";

export default function LandingPage() {
  return (
    <div className="bg-gradient-to-br from-slate-50 via-gray-100 to-slate-200 text-gray-800">
      <header className="glass max-w-7xl mx-auto mt-6 px-4 py-3 flex justify-between items-center sticky top-4 z-50">
        <Link href="/">
          <span className="sr-only">MILA Home</span>
          <Logo className="h-10 w-auto" />
        </Link>
        <div className="flex items-center space-x-2 sm:space-x-4">
          <LanguageSwitcher variant="light" />
          <Button asChild className="hidden sm:inline-flex">
            <Link href="/prepare">Ir a Demo</Link>
          </Button>
          <Button asChild variant="outline" className="hidden sm:inline-flex">
            <Link href="https://drive.usercontent.google.com/download?id=1dbhoCDpThH1n0K6Aw4sNnhWVEilxvyEa" target="_blank">
              Descargá el dossier
            </Link>
          </Button>
        </div>
      </header>

      <main>
        <section className="text-center py-16 px-4">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-4 tracking-tight text-gray-900">MILA</h1>
          <p className="text-lg max-w-2xl mx-auto font-medium text-gray-600">La herramienta para gobiernos que acelera procesos, evita errores y asegura el cumplimiento normativo.</p>
           <div className="mt-8 flex flex-col sm:flex-row justify-center items-center gap-4 sm:hidden">
              <Button asChild size="lg">
                <Link href="/prepare">Ir a Demo</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="https://drive.usercontent.google.com/download?id=1dbhoCDpThH1n0K6Aw4sNnhWVEilxvyEa" target="_blank">
                  Descargá el dossier
                </Link>
              </Button>
            </div>
        </section>

        <section id="features" className="py-20 px-6 max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12">¿Qué hace MILA?</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className={cardBaseClasses}>
              <Search className="h-8 w-8 text-blue-600 mb-3" />
              <h3 className="text-2xl font-semibold mb-3">Análisis inteligente</h3>
              <p>Divide los documentos en bloques y analiza punto por punto para detectar errores y riesgos.</p>
            </div>
            <div className={cardBaseClasses}>
              <FolderCheck className="h-8 w-8 text-blue-600 mb-3" />
              <h3 className="text-2xl font-semibold mb-3">Alertas automáticas</h3>
              <p>Clasifica los errores en niveles de riesgo (rojo, amarillo, verde) para que sepas qué atender primero.</p>
            </div>
            <div className={cardBaseClasses}>
              <Edit className="h-8 w-8 text-blue-600 mb-3" />
              <h3 className="text-2xl font-semibold mb-3">Edición ágil</h3>
              <p>Editá y corregí desde la plataforma, con control de versiones y sugerencias integradas.</p>
            </div>
            <div className={cardBaseClasses}>
              <TrendingUp className="h-8 w-8 text-blue-600 mb-3" />
              <h3 className="text-2xl font-semibold mb-3">Puntaje legal</h3>
              <p>Recibí una puntuación por documento o bloque, según el cumplimiento normativo.</p>
            </div>
            <div className={cardBaseClasses}>
              <BookCheck className="h-8 w-8 text-blue-600 mb-3" />
              <h3 className="text-2xl font-semibold mb-3">Normas vinculadas</h3>
              <p>MILA te muestra en qué norma o resolución se basa cada sugerencia.</p>
            </div>
            <div className={cardBaseClasses}>
              <Share2 className="h-8 w-8 text-blue-600 mb-3" />
              <h3 className="text-2xl font-semibold mb-3">Exportá y compartí</h3>
              <p>Generá una versión corregida del documento para compartir fácilmente.</p>
            </div>
          </div>
        </section>
        
        <section id="results" className="py-20 px-6 max-w-6xl mx-auto">
          <div className="text-center">
            <h2 className="text-4xl font-bold mb-4">Resultados Reales</h2>
            <p className="mb-10 italic text-sm text-gray-600">*Basado en promedios de uso en gobiernos de distintas escalas</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              <div className={cardBaseClasses}>
                <h4 className="text-5xl font-extrabold text-green-600">+67%</h4>
                <p className="mt-2 font-medium">Errores detectados vs revisión humana</p>
              </div>
              <div className={cardBaseClasses}>
                <h4 className="text-3xl font-extrabold text-blue-600">3 min vs 80 días</h4>
                <p className="mt-2 font-medium">Tiempo de revisión MILA vs circuito tradicional</p>
              </div>
              <div className={cardBaseClasses}>
                <h4 className="text-5xl font-extrabold text-purple-600">+82%</h4>
                <p className="mt-2 font-medium">Gobiernos reportan mejoras en control interno</p>
              </div>
              <div className={cardBaseClasses}>
                <h4 className="text-5xl font-extrabold text-yellow-500">76%</h4>
                <p className="mt-2 font-medium">Reducción de tiempos en validación de circuitos internos</p>
              </div>
               <div className={cardBaseClasses}>
                <h4 className="text-5xl font-extrabold text-indigo-500">+15</h4>
                <p className="mt-2 font-medium">Tipos de documentos ya validados en municipios reales</p>
              </div>
              <div className={cardBaseClasses}>
                <h4 className="text-5xl font-extrabold text-pink-600">100%</h4>
                <p className="mt-2 font-medium">Conformidad con criterios de control legal y administrativo</p>
              </div>
            </div>
          </div>
        </section>

        <section id="differentiators" className="py-20 px-6 max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold mb-10 text-center">¿En qué se diferencia de ChatGPT y otras IA?</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className={cardBaseClasses}>
              <BrainCircuit className="h-8 w-8 text-blue-600 mb-2"/>
              <h3 className="text-2xl font-semibold mb-2">Entrenamiento especializado</h3>
              <p>MILA está entrenada específicamente con normativa local que le cargues, prácticas de control interno y criterios de auditoría. No es una IA genérica.</p>
            </div>
            <div className={cardBaseClasses}>
              <FileSignature className="h-8 w-8 text-blue-600 mb-2"/>
              <h3 className="text-2xl font-semibold mb-2">Entiende documentos públicos</h3>
              <p>Puede identificar contratos, decretos, resoluciones y documentos administrativos con lógica jurídica-administrativa, no solo texto libre.</p>
            </div>
            <div className={cardBaseClasses}>
              <ShieldCheck className="h-8 w-8 text-blue-600 mb-2"/>
              <h3 className="text-2xl font-semibold mb-2">Detecta riesgos, no solo errores</h3>
              <p>MILA no corrige ortografía: clasifica observaciones por riesgo legal, operativo o de control, con semáforo y recomendaciones aplicables.</p>
            </div>
            <div className={cardBaseClasses}>
              <Target className="h-8 w-8 text-blue-600 mb-2"/>
              <h3 className="text-2xl font-semibold mb-2">Diseñada para gobiernos</h3>
              <p>Desde la carga hasta los reportes, todo está pensado para secretarías legales, equipos técnicos y áreas administrativas del Estado.</p>
            </div>
          </div>
        </section>

        <section id="faq" className="py-20 px-6 max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold mb-10 text-center">Preguntas Frecuentes</h2>
          <div className="space-y-8">
            <details className={detailsBaseClasses}>
              <summary className="font-semibold cursor-pointer text-lg">¿Reemplaza al equipo legal?</summary>
              <p className="mt-2 text-gray-700">No. Lo potencia. MILA automatiza lo repetitivo y permite al equipo enfocarse en lo importante.</p>
            </details>
            <details className={detailsBaseClasses}>
              <summary className="font-semibold cursor-pointer text-lg">¿Se pueden subir nuestras normativas internas?</summary>
              <p className="mt-2 text-gray-700">Sí. Podés incorporar reglamentos propios y MILA los usará como referencia.</p>
            </details>
            <details className={detailsBaseClasses}>
              <summary className="font-semibold cursor-pointer text-lg">¿Qué pasa si mi municipio no tiene sistema de gestión documental?</summary>
              <p className="mt-2 text-gray-700">No hay problema. MILA funciona con carga directa de archivos Word o PDF.</p>
            </details>
            <details className={detailsBaseClasses}>
              <summary className="font-semibold cursor-pointer text-lg">¿Cuánto tiempo toma capacitar a mi equipo?</summary>
              <p className="mt-2 text-gray-700">MILA es intuitiva. En promedio, en menos de 2 horas tu equipo puede usarla con autonomía total.</p>
            </details>
            <details className={detailsBaseClasses}>
              <summary className="font-semibold cursor-pointer text-lg">¿Qué costo tiene?</summary>
              <p className="mt-2 text-gray-700">Hay planes adaptados a cada tamaño de municipio. Además, ofrecemos licencias promocionales para primeros adoptantes.</p>
            </details>
            <details className={detailsBaseClasses}>
              <summary className="font-semibold cursor-pointer text-lg">¿Puede ayudarme con observaciones del Tribunal de Cuentas?</summary>
              <p className="mt-2 text-gray-700">Sí. MILA detecta muchas de las observaciones típicas antes de que lleguen a auditoría, y sugiere mejoras alineadas con prácticas de control interno.</p>
            </details>
          </div>
        </section>

        <section className="bg-slate-800 text-white text-center py-16">
          <h2 className="text-3xl font-bold mb-6">¿Querés MILA en tu municipio?</h2>
          <div className="space-x-4">
            <Button asChild size="lg" className="bg-white text-blue-800 hover:bg-slate-200">
                <Link href="/prepare">Ir a Demo</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                <a href="mailto:juan.ulian@pluscompol.com?subject=Solicitud%20de%20reuni%C3%B3n%20por%20MILA&body=Hola%20Juan%2C%0D%0A%0D%0AEstoy%20interesado%2Fa%20en%20coordinar%20una%20reuni%C3%B3n%20para%20conocer%20m%C3%A1s%20sobre%20la%20plataforma%20MILA%20y%20evaluar%20su%20implementaci%C3%B3n%20en%20nuestro%20gobierno.%0D%0AQuedo%20a%20disposici%C3%B3n%20para%20coordinar%20d%C3%ADa%20y%20horario.%0D%0A%0D%0AMuchas%20gracias.%0D%0A%0D%0ASaludos%2C%0D%0A">Contactar</a>
            </Button>
          </div>
        </section>
      </main>

      <footer className="bg-gray-900 text-gray-400 py-8">
        <div className="max-w-6xl mx-auto text-center text-sm flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-8 px-4">
            <p className="shrink-0">MILA es una solución GovTech desarrollada por PLUS BI</p>
            <div className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-envelope flex-shrink-0" viewBox="0 0 16 16"><path d="M.05 3.555A2 2 0 0 1 2 2h12a2 2 0 0 1 1.95 1.555L8 8.414.05 3.555zM0 4.697v7.104l5.803-3.558L0 4.697zM6.761 8.83l-6.57 4.027A2 2 0 0 0 2 14h12a2 2 0 0 0 1.808-1.144l-6.57-4.027L8 9.586l-1.239-.757zm3.436-.586L16 11.803V4.697l-5.803 3.546z"/></svg>
              <a href="mailto:juan.ulian@pluscompol.com" className="hover:text-white truncate">juan.ulian@pluscompol.com</a>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 flex-shrink-0" />
              <a href="https://pluscompol.com" target="_blank" rel="noopener noreferrer" className="hover:text-white">pluscompol.com</a>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 flex-shrink-0" />
              <span>Argentina</span>
            </div>
        </div>
      </footer>
    </div>
  );
}
