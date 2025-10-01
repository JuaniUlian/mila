'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import {
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Shield,
  Clock,
  Users,
  Zap,
  FileCheck,
  Building2,
  ArrowRight,
  Play,
  Star
} from 'lucide-react';
import { PRICING_TIERS, calculateROI, type TierType } from '@/lib/pricing';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function LandingPage() {
  const [documentsPerMonth, setDocumentsPerMonth] = useState(10);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Shield className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-gray-900">MILA</span>
          </div>
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-gray-600 hover:text-gray-900">Características</a>
            <a href="#pricing" className="text-gray-600 hover:text-gray-900">Precios</a>
            <a href="#roi" className="text-gray-600 hover:text-gray-900">ROI</a>
            <a href="#faq" className="text-gray-600 hover:text-gray-900">FAQ</a>
          </nav>
          <div className="flex items-center space-x-4">
            <Link href="/login">
              <Button variant="ghost">Iniciar Sesión</Button>
            </Link>
            <Link href="/signup">
              <Button className="btn-bg-image">Empezar Gratis</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 py-20 text-center">
        <Badge className="mb-4 bg-blue-100 text-blue-800 hover:bg-blue-100">
          ⚡ Detecta 67-80% más errores que la auditoría manual
        </Badge>
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
          Detecta el 80% de errores normativos<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
            que los auditores humanos pasan por alto
          </span>
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          MILA analiza tus pliegos de licitación, contratos y resoluciones administrativas
          en minutos, no en días. Powered by IA.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
          <Link href="/signup">
            <Button size="lg" className="btn-bg-image text-lg px-8 py-6">
              Empezar Gratis - 3 Análisis
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <Button size="lg" variant="outline" className="text-lg px-8 py-6">
            <Play className="mr-2 h-5 w-5" />
            Ver Demo (60s)
          </Button>
        </div>

        {/* Social Proof */}
        <div className="flex items-center justify-center gap-8 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 border-2 border-white" />
              ))}
            </div>
            <span>+127 organismos ya usan MILA</span>
          </div>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            ))}
            <span className="ml-1">4.9/5 (89 reseñas)</span>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">
            Un error en un pliego de $50M puede costar:
          </h2>
          <div className="grid md:grid-cols-3 gap-8 mt-12">
            <Card className="border-2 border-red-200">
              <CardHeader>
                <AlertTriangle className="h-12 w-12 text-red-600 mb-4" />
                <CardTitle className="text-red-900">6 meses de retraso</CardTitle>
              </CardHeader>
              <CardContent className="text-gray-700">
                Impugnaciones y recursos administrativos que paralizan la licitación.
              </CardContent>
            </Card>
            <Card className="border-2 border-orange-200">
              <CardHeader>
                <TrendingUp className="h-12 w-12 text-orange-600 mb-4" />
                <CardTitle className="text-orange-900">$200K en honorarios</CardTitle>
              </CardHeader>
              <CardContent className="text-gray-700">
                Defensa legal especializada para resolver el conflicto.
              </CardContent>
            </Card>
            <Card className="border-2 border-amber-200">
              <CardHeader>
                <Users className="h-12 w-12 text-amber-600 mb-4" />
                <CardTitle className="text-amber-900">Riesgo de destitución</CardTitle>
              </CardHeader>
              <CardContent className="text-gray-700">
                Responsabilidad del funcionario que aprobó el documento erróneo.
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section id="features" className="max-w-7xl mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            La solución: Auditoría inteligente en 3 pasos
          </h2>
          <p className="text-xl text-gray-600">
            De horas de revisión manual a minutos con IA
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-12">
          <div className="relative">
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-full w-12 h-12 flex items-center justify-center text-2xl font-bold mb-6">
              1
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Sube tu documento</h3>
            <p className="text-gray-600 mb-4">
              PDF, Word, hasta 200+ páginas. Pliegos, contratos, resoluciones, lo que sea.
            </p>
            <div className="bg-slate-100 rounded-lg p-6 border-2 border-slate-200">
              <FileCheck className="h-16 w-16 text-slate-400 mx-auto" />
            </div>
          </div>

          <div className="relative">
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-full w-12 h-12 flex items-center justify-center text-2xl font-bold mb-6">
              2
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Selecciona normativas</h3>
            <p className="text-gray-600 mb-4">
              MILA cruza tu doc con Ley 80/93, Decreto 1082/15, manuales internos, etc.
            </p>
            <div className="bg-slate-100 rounded-lg p-6 border-2 border-slate-200">
              <Shield className="h-16 w-16 text-slate-400 mx-auto" />
            </div>
          </div>

          <div className="relative">
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-full w-12 h-12 flex items-center justify-center text-2xl font-bold mb-6">
              3
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Recibe hallazgos</h3>
            <p className="text-gray-600 mb-4">
              Con evidencia literal, gravedad, propuesta de solución y justificación legal.
            </p>
            <div className="bg-slate-100 rounded-lg p-6 border-2 border-slate-200">
              <Zap className="h-16 w-16 text-slate-400 mx-auto" />
            </div>
          </div>
        </div>
      </section>

      {/* ROI Calculator */}
      <section id="roi" className="bg-gradient-to-br from-blue-600 to-indigo-700 py-20 text-white">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-4">
            Calcula tu ahorro con MILA
          </h2>
          <p className="text-xl text-center text-blue-100 mb-12">
            Compara el costo de auditoría manual vs MILA
          </p>

          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardContent className="p-8">
              <div className="mb-8">
                <label className="text-lg font-semibold mb-4 block">
                  ¿Cuántos documentos procesas al mes?
                </label>
                <div className="flex items-center gap-6">
                  <Slider
                    value={[documentsPerMonth]}
                    onValueChange={(val) => setDocumentsPerMonth(val[0])}
                    min={1}
                    max={100}
                    step={1}
                    className="flex-1"
                  />
                  <span className="text-3xl font-bold w-20 text-right">
                    {documentsPerMonth}
                  </span>
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
                        ${(documentsPerMonth * 120).toLocaleString()} USD
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4 text-blue-100">Con MILA Profesional</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Suscripción mensual:</span>
                      <span className="font-bold">$299 USD</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tiempo por documento:</span>
                      <span className="font-bold">~5 minutos</span>
                    </div>
                    <div className="h-px bg-white/20 my-4" />
                    <div className="flex justify-between text-xl">
                      <span>Total mensual:</span>
                      <span className="font-bold text-green-300">$299 USD</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 p-6 bg-green-500/20 rounded-lg border-2 border-green-400">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-green-100">Ahorro mensual</div>
                    <div className="text-4xl font-bold text-green-300">
                      ${((documentsPerMonth * 120) - 299).toLocaleString()} USD
                    </div>
                    <div className="text-sm text-green-100 mt-1">
                      ({Math.round((((documentsPerMonth * 120) - 299) / (documentsPerMonth * 120)) * 100)}% de ahorro)
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-green-100">Tiempo ahorrado</div>
                    <div className="text-4xl font-bold text-green-300">
                      {Math.round((documentsPerMonth * 55) / 60)}h
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
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Elige tu plan
          </h2>
          <p className="text-xl text-gray-600">
            Desde gratis hasta enterprise. Sin sorpresas.
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-6">
          {Object.values(PRICING_TIERS).map((tier) => (
            <Card
              key={tier.name}
              className={cn(
                'relative',
                tier.popular && 'border-4 border-blue-500 shadow-2xl scale-105'
              )}
            >
              {tier.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <Badge className="bg-blue-500 text-white px-4 py-1">
                    Más Popular
                  </Badge>
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-2xl">{tier.displayName}</CardTitle>
                <div className="mt-4">
                  {tier.price === -1 ? (
                    <div className="text-3xl font-bold">Personalizado</div>
                  ) : tier.price === 0 ? (
                    <div className="text-3xl font-bold">Gratis</div>
                  ) : (
                    <>
                      <div className="text-4xl font-bold">
                        ${tier.price}
                        <span className="text-lg text-gray-600 font-normal">/mes</span>
                      </div>
                    </>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <Link href={tier.name === 'free' ? '/signup' : '/contact'}>
                  <Button
                    className={cn(
                      'w-full mb-6',
                      tier.popular && 'btn-bg-image'
                    )}
                    variant={tier.popular ? 'default' : 'outline'}
                  >
                    {tier.cta}
                  </Button>
                </Link>

                <div className="space-y-3">
                  {tier.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Use Cases */}
      <section className="bg-slate-100 py-20">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">
            Casos de uso reales
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                title: 'Pliegos de Licitación Pública',
                description: 'Valida especificaciones técnicas, criterios de evaluación, garantías y cláusulas contractuales.',
                icon: Building2,
              },
              {
                title: 'Contratos de Concesión',
                description: 'Verifica obligaciones, plazos, penalidades y cláusulas de reversión.',
                icon: FileCheck,
              },
              {
                title: 'Resoluciones Administrativas',
                description: 'Asegura competencia, motivación, procedimiento y fundamentación legal.',
                icon: Shield,
              },
              {
                title: 'Manuales de Procedimiento',
                description: 'Cruza con normativa vigente y detecta contradicciones internas.',
                icon: Users,
              },
            ].map((useCase, idx) => (
              <Card key={idx} className="hover:shadow-xl transition-shadow">
                <CardHeader>
                  <useCase.icon className="h-12 w-12 text-blue-600 mb-4" />
                  <CardTitle>{useCase.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-gray-700">
                  {useCase.description}
                </CardContent>
              </Card>
            ))}
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
              q: '¿Mis documentos quedan almacenados en la nube de MILA?',
              a: 'No. Los documentos se procesan en memoria durante el análisis y se eliminan inmediatamente después. Solo tú guardas el historial de resultados localmente o en tu cuenta (encriptado).',
            },
            {
              q: '¿Es mejor que ChatGPT para análisis normativo?',
              a: 'Sí. ChatGPT no conoce normativa argentina, mexicana o colombiana específica, ni está optimizado para compliance. MILA sí, y además aprende de tus validaciones.',
            },
            {
              q: '¿Reemplaza a un abogado?',
              a: 'No. MILA es como Grammarly para abogados: detecta el 80% de errores automáticamente, pero necesitas validación humana para el 20% crítico y decisiones de contexto.',
            },
            {
              q: '¿Puedo cancelar en cualquier momento?',
              a: 'Sí. Sin permanencia. Cancelas cuando quieras desde tu dashboard.',
            },
            {
              q: '¿Qué pasa si suben los precios de las APIs de IA?',
              a: 'Ajustamos los precios proporcionalmente y te avisamos 30 días antes. Pero tienes la opción de mantener tu tarifa si renuevas anualmente.',
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
            Empieza a detectar errores que cuestan millones
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            3 análisis gratis. No requiere tarjeta de crédito.
          </p>
          <Link href="/signup">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 text-lg px-12 py-6">
              Empezar Ahora
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
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
                <li><a href="#features">Características</a></li>
                <li><a href="#pricing">Precios</a></li>
                <li><a href="#roi">ROI Calculator</a></li>
                <li><a href="/docs">Documentación</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><Link href="/legal/terms">Términos de Servicio</Link></li>
                <li><Link href="/legal/privacy">Política de Privacidad</Link></li>
                <li><Link href="/legal/dpa">Data Processing Agreement</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Contacto</h3>
              <ul className="space-y-2 text-sm text-slate-400">
                <li>hola@mila.ai</li>
                <li>+54 11 XXXX-XXXX</li>
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
