'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  CheckCircle2,
  Shield,
  Clock,
  Zap,
  FileCheck,
  Building2,
  ArrowRight,
  Briefcase,
  Target,
  TrendingUp,
  BookOpen,
  Upload,
  Search,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function PricingPage() {
  const [documents, setDocuments] = useState(10);
  const [hours, setHours] = useState(40);

  const manualCost = documents * 120;
  const milaCost = 150; // por módulo
  const savings = manualCost - milaCost;
  const timeSaved = Math.round((documents * 55) / 60);

  return (
    <div className="min-h-screen bg-home-page">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/home" className="flex items-center space-x-2">
            <Image
              src="/logo/Logo MILA (sin fondo).png"
              alt="MILA Logo"
              width={120}
              height={120}
              className="h-14 w-auto"
            />
          </Link>
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#funciona" className="text-gray-600 hover:text-gray-900">¿Cómo funciona?</a>
            <a href="#pricing" className="text-gray-600 hover:text-gray-900">Precios</a>
            <a href="#roi" className="text-gray-600 hover:text-gray-900">Ahorro</a>
            <a href="#gobiernos" className="text-gray-600 hover:text-gray-900">Gobiernos</a>
          </nav>
          <div className="flex items-center space-x-4">
            <Link href="/login">
              <Button variant="ghost">Iniciar Sesión</Button>
            </Link>
            <Button asChild className="btn-bg-image">
              <a href="mailto:juan.ulian@pluscompol.com?subject=Solicitud%20de%20reuni%C3%B3n%20por%20MILA">
                Agendar Reunión
                <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 py-20 text-center">
        <Badge className="mb-4 bg-blue-100 text-blue-800 hover:bg-blue-100">
          ⚡ Tu aliado inteligente en compliance
        </Badge>
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
          Trabaja más eficiente,<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
            con menos riesgos y en menos tiempo
          </span>
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          MILA es tu asistente de IA que analiza documentos de contratación pública en minutos,
          ayudándote a tomar mejores decisiones con mayor seguridad.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
          <Button asChild size="lg" className="btn-bg-image text-lg px-8 py-6">
            <a href="mailto:juan.ulian@pluscompol.com?subject=Solicitud%20de%20reuni%C3%B3n%20por%20MILA">
              Agendar Reunión
              <ArrowRight className="ml-2 h-5 w-5" />
            </a>
          </Button>
        </div>

        {/* Social Proof - Gobiernos */}
        <div id="gobiernos" className="mt-16">
          <p className="text-sm text-gray-600 mb-6 font-semibold uppercase tracking-wide">
            Gobiernos que han probado MILA
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 text-gray-700">
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-blue-600" />
              <span className="font-medium">Municipalidad de Rosario</span>
            </div>
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-blue-600" />
              <span className="font-medium">Provincia de Santa Fe</span>
            </div>
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-blue-600" />
              <span className="font-medium">Municipio de Córdoba</span>
            </div>
          </div>
        </div>
      </section>

      {/* Cómo funciona */}
      <section id="funciona" className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              ¿Cómo funciona MILA?
            </h2>
            <p className="text-xl text-gray-600">
              Tres pasos simples para analizar tus documentos
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            <Card className="border-2 border-slate-200">
              <CardContent className="p-8 text-center">
                <div className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-full w-12 h-12 flex items-center justify-center text-2xl font-bold mb-6 mx-auto">
                  1
                </div>
                <div className="bg-slate-100 rounded-lg p-8 border-2 border-slate-200 mb-6">
                  <Upload className="h-16 w-16 text-slate-400 mx-auto" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Sube tu documento</h3>
                <p className="text-gray-600">
                  PDF, Word, hasta 200+ páginas. Pliegos, contratos, resoluciones, lo que necesites.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-slate-200">
              <CardContent className="p-8 text-center">
                <div className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-full w-12 h-12 flex items-center justify-center text-2xl font-bold mb-6 mx-auto">
                  2
                </div>
                <div className="bg-slate-100 rounded-lg p-8 border-2 border-slate-200 mb-6">
                  <BookOpen className="h-16 w-16 text-slate-400 mx-auto" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">MILA cruza con tu normativa</h3>
                <p className="text-gray-600">
                  Tu biblioteca normativa personalizada: leyes nacionales, decretos locales, manuales internos.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-slate-200">
              <CardContent className="p-8 text-center">
                <div className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-full w-12 h-12 flex items-center justify-center text-2xl font-bold mb-6 mx-auto">
                  3
                </div>
                <div className="bg-slate-100 rounded-lg p-8 border-2 border-slate-200 mb-6">
                  <CheckCircle2 className="h-16 w-16 text-slate-400 mx-auto" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Recibe hallazgos</h3>
                <p className="text-gray-600">
                  Con evidencia literal, gravedad, propuesta de solución y justificación legal.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* ROI Calculator */}
      <section id="roi" className="bg-gradient-to-br from-blue-600 to-indigo-700 py-20 text-white">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-4">
            Calcula tu ahorro con MILA
          </h2>
          <p className="text-xl text-center text-blue-100 mb-12">
            Compara el costo de auditoría manual vs MILA
          </p>

          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardContent className="p-8">
              <div className="grid md:grid-cols-2 gap-8 mb-8">
                <div>
                  <label className="text-lg font-semibold mb-4 block">
                    Documentos procesados por mes
                  </label>
                  <Input
                    type="number"
                    value={documents}
                    onChange={(e) => setDocuments(Math.max(1, parseInt(e.target.value) || 1))}
                    className="text-2xl font-bold text-gray-900 p-4"
                    min="1"
                  />
                </div>
                <div>
                  <label className="text-lg font-semibold mb-4 block">
                    Horas laborales ahorradas
                  </label>
                  <Input
                    type="number"
                    value={timeSaved}
                    disabled
                    className="text-2xl font-bold text-gray-900 p-4 bg-white/20"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-blue-100">Auditoría Manual</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Costo por documento:</span>
                      <span className="font-bold">$120 USD</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tiempo por documento:</span>
                      <span className="font-bold">~1 hora</span>
                    </div>
                    <div className="h-px bg-white/20 my-4" />
                    <div className="flex justify-between text-xl">
                      <span>Total mensual:</span>
                      <span className="font-bold text-red-300">
                        ${manualCost.toLocaleString()} USD
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4 text-blue-100">Con MILA (1 módulo)</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Licencia mensual:</span>
                      <span className="font-bold">$150 USD</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tiempo por documento:</span>
                      <span className="font-bold">~5 minutos</span>
                    </div>
                    <div className="h-px bg-white/20 my-4" />
                    <div className="flex justify-between text-xl">
                      <span>Total mensual:</span>
                      <span className="font-bold text-green-300">$150 USD</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 p-6 bg-green-500/20 rounded-lg border-2 border-green-400">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-green-100">Ahorro mensual</div>
                    <div className="text-4xl font-bold text-green-300">
                      ${savings.toLocaleString()} USD
                    </div>
                    <div className="text-sm text-green-100 mt-1">
                      ({Math.round((savings / manualCost) * 100)}% de ahorro)
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-green-100">Tiempo ahorrado</div>
                    <div className="text-4xl font-bold text-green-300">
                      {timeSaved}h
                    </div>
                    <div className="text-sm text-green-100 mt-1">
                      al mes
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="max-w-7xl mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-0 px-4 py-2">
            <Zap className="h-4 w-4 mr-2 inline" />
            Modelo Consultivo Flexible
          </Badge>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Implementación personalizada
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Cada gobierno es único. Trabajamos juntos para adaptar MILA a tus necesidades.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid lg:grid-cols-3 gap-8 mb-16">
          {/* Discovery */}
          <Card className="border-2 border-blue-200">
            <CardHeader>
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                  <Zap className="h-8 w-8" />
                </div>
                <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                  Pago único
                </Badge>
              </div>
              <CardTitle className="text-2xl">Discovery</CardTitle>
              <div className="mt-4">
                <div className="text-5xl font-bold text-gray-900">
                  $2,500
                </div>
                <p className="text-sm text-gray-600 mt-2">Primera etapa</p>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 mb-6">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">Entrevistas con stakeholders</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">Relevamiento de normativa</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">Configuración de biblioteca normativa</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">Personalización de criterios</span>
                </div>
              </div>
              <div className="bg-blue-100 border border-blue-200 rounded-lg p-4">
                <p className="text-xs text-blue-900 font-semibold">
                  ⏱️ Duración: 2-3 semanas
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Installation */}
          <Card className="border-2 border-indigo-200">
            <CardHeader>
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-lg bg-gradient-to-r from-indigo-500 to-indigo-600 text-white">
                  <Target className="h-8 w-8" />
                </div>
                <Badge className="bg-indigo-100 text-indigo-800 border-indigo-200">
                  Por módulo
                </Badge>
              </div>
              <CardTitle className="text-2xl">Instalación</CardTitle>
              <div className="mt-4">
                <div className="text-5xl font-bold text-gray-900">
                  $500
                </div>
                <p className="text-sm text-gray-600 mt-2">Por módulo / Una vez</p>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 mb-6">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">Configuración del módulo</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">Integración con biblioteca</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">Testing con docs reales</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">Ajustes según feedback</span>
                </div>
              </div>
              <div className="bg-indigo-100 border border-indigo-200 rounded-lg p-4">
                <p className="text-xs text-indigo-900 font-semibold mb-2">
                  📦 Módulos:
                </p>
                <ul className="text-xs text-indigo-800 space-y-1">
                  <li>• Operativo</li>
                  <li>• Técnico</li>
                  <li>• Estratégico</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Monthly License */}
          <Card className="border-2 border-green-200">
            <CardHeader>
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-lg bg-gradient-to-r from-green-500 to-green-600 text-white">
                  <TrendingUp className="h-8 w-8" />
                </div>
                <Badge className="bg-green-100 text-green-800 border-green-200">
                  Mensual
                </Badge>
              </div>
              <CardTitle className="text-2xl">Licencia</CardTitle>
              <div className="mt-4">
                <div className="text-5xl font-bold text-gray-900">
                  $150
                </div>
                <p className="text-sm text-gray-600 mt-2">Por módulo / Mes</p>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 mb-6">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700 font-semibold">Uso ilimitado del módulo</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">Documentos ilimitados</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">Mejoras continuas</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">Reportes exportables</span>
                </div>
              </div>
              <div className="bg-green-100 border border-green-200 rounded-lg p-4">
                <p className="text-xs text-green-900 font-semibold">
                  💰 Sin permanencia mínima
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Add-ons */}
        <div className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-8 mb-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Servicios Adicionales
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-bold text-gray-900">Capacitaciones</h4>
                <div className="text-2xl font-bold text-gray-900">$800</div>
              </div>
              <p className="text-sm text-gray-600">
                Sesiones de entrenamiento para tu equipo en el uso de MILA y mejores prácticas.
              </p>
            </div>

            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-bold text-gray-900">Soporte Premium</h4>
                <div className="text-2xl font-bold text-gray-900">$300<span className="text-sm text-gray-600 font-normal">/mes</span></div>
              </div>
              <p className="text-sm text-gray-600">
                Respuesta prioritaria y asistencia remota. Respuesta en menos de 4 horas.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="max-w-4xl mx-auto px-4 py-20">
        <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">
          Preguntas Frecuentes
        </h2>
        <div className="space-y-6">
          {[
            {
              q: '¿Mis documentos quedan almacenados?',
              a: 'No. Los documentos se procesan en memoria durante el análisis y se eliminan inmediatamente después. Solo guardas el historial de resultados.',
            },
            {
              q: '¿Es mejor que usar ChatGPT o herramientas genéricas?',
              a: 'Sí. Las herramientas genéricas no conocen TU normativa específica, ni están optimizadas para compliance gubernamental. MILA aprende de tus validaciones y se adapta a tu contexto.',
            },
            {
              q: '¿Reemplaza al equipo legal?',
              a: 'No, es un aliado. MILA acelera la detección de inconsistencias y te ayuda a trabajar más eficiente, pero las decisiones finales siempre son tuyas.',
            },
            {
              q: '¿Puedo cancelar en cualquier momento?',
              a: 'Sí. Sin permanencia. Cancelas cuando quieras.',
            },
            {
              q: '¿Qué pasa si suben los precios de las APIs de IA?',
              a: 'Te avisamos 30 días antes de cualquier ajuste. Tienes la opción de mantener tu tarifa si renuevas anualmente.',
            },
          ].map((faq, idx) => (
            <Card key={idx}>
              <CardHeader>
                <CardTitle className="text-lg">{faq.q}</CardTitle>
              </CardHeader>
              <CardContent className="text-gray-700">
                {faq.a}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Final */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 py-20">
        <div className="max-w-4xl mx-auto px-4 text-center text-white">
          <h2 className="text-4xl font-bold mb-6">
            ¿Listo para trabajar más eficiente?
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Agenda una reunión con nuestro equipo para conocer cómo MILA puede ayudarte.
          </p>
          <Button asChild size="lg" className="bg-white text-blue-600 hover:bg-blue-50 text-lg px-12 py-6">
            <a href="mailto:juan.ulian@pluscompol.com?subject=Solicitud%20de%20reuni%C3%B3n%20por%20MILA">
              Agendar Reunión
              <ArrowRight className="ml-2 h-5 w-5" />
            </a>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Shield className="h-6 w-6" />
                <span className="text-xl font-bold">MILA</span>
              </div>
              <p className="text-slate-400 text-sm">
                Más Inteligencia Legal y Administrativa
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Producto</h3>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#funciona">¿Cómo funciona?</a></li>
                <li><a href="#pricing">Precios</a></li>
                <li><a href="#roi">Ahorro</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Contacto</h3>
              <ul className="space-y-2 text-sm text-slate-400">
                <li>juan.ulian@pluscompol.com</li>
                <li>Buenos Aires, Argentina</li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-slate-800 text-center text-sm text-slate-400">
            © 2025 MILA. Todos los derechos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
}
