'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Sparkles, Target, TrendingUp, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export function PricingModular() {
  return (
    <section id="pricing" className="max-w-7xl mx-auto px-4 py-20">
      <div className="text-center mb-16">
        <Badge className="mb-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-0 px-4 py-2">
          <Sparkles className="h-4 w-4 mr-2 inline" />
          Modelo Consultivo - Sin barrera de entrada
        </Badge>
        <h2 className="text-4xl font-bold text-gray-900 mb-4">
          Paga solo por lo que necesitas
        </h2>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Empieza con un módulo y escala cuando lo necesites. Sin sorpresas, sin permanencia.
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="grid lg:grid-cols-3 gap-8 mb-16">
        {/* Discovery */}
        <Card className="relative border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white">
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
              <p className="text-sm text-gray-600 mt-2">Pago único obligatorio</p>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 mb-6">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-700">Entrevistas con stakeholders clave</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-700">Relevamiento de normativa aplicable</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-700">Configuración del RAG con tus normativas</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-700">Personalización de criterios de análisis</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-700">Documentación de flujos institucionales</span>
              </div>
            </div>
            <div className="bg-blue-100 border border-blue-200 rounded-lg p-4">
              <p className="text-xs text-blue-900 font-semibold">
                ⏱️ Duración: 2-3 semanas
              </p>
              <p className="text-xs text-blue-800 mt-1">
                Necesario antes de activar cualquier módulo. Se hace una sola vez.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Installation */}
        <Card className="relative border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 to-white">
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
              <p className="text-sm text-gray-600 mt-2">Por módulo / Pago único</p>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 mb-6">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-700">Configuración del módulo seleccionado</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-700">Integración con tu biblioteca normativa</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-700">Personalización de prompts y criterios</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-700">Testing con documentos reales</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-700">Ajustes según feedback inicial</span>
              </div>
            </div>
            <div className="bg-indigo-100 border border-indigo-200 rounded-lg p-4">
              <p className="text-xs text-indigo-900 font-semibold mb-2">
                📦 Módulos disponibles:
              </p>
              <ul className="text-xs text-indigo-800 space-y-1">
                <li>• Operativo (pliegos y licitaciones)</li>
                <li>• Técnico (especificaciones y obras)</li>
                <li>• Estratégico (concesiones y PPPs)</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Monthly License - HIGHLIGHTED */}
        <Card className="relative border-4 border-green-500 bg-gradient-to-br from-green-50 to-white shadow-2xl scale-105">
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
            <Badge className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-2 text-sm font-bold shadow-lg">
              ⭐ Inversión recurrente
            </Badge>
          </div>
          <CardHeader className="pt-8">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg bg-gradient-to-r from-green-500 to-green-600 text-white">
                <TrendingUp className="h-8 w-8" />
              </div>
              <Badge className="bg-green-100 text-green-800 border-green-200">
                Mensual
              </Badge>
            </div>
            <CardTitle className="text-2xl">Licencia por Módulo</CardTitle>
            <div className="mt-4">
              <div className="text-5xl font-bold text-gray-900">
                $150
              </div>
              <p className="text-sm text-gray-600 mt-2">Por módulo / Mensual</p>
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
                <span className="text-sm text-gray-700">Documentos ilimitados por mes</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-700">Actualización continua de normativas</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-700">Mejoras y nuevas funcionalidades</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-700">Informes y reportes exportables</span>
              </div>
            </div>
            <div className="bg-green-100 border border-green-200 rounded-lg p-4">
              <p className="text-xs text-green-900 font-semibold">
                💰 Sin permanencia mínima
              </p>
              <p className="text-xs text-green-800 mt-1">
                Cancela cuando quieras. Activa/desactiva módulos según necesidad.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add-ons */}
      <div className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-8 mb-12">
        <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Servicios Adicionales (On-Demand)
        </h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-bold text-gray-900">Capacitaciones</h4>
              <div className="text-2xl font-bold text-gray-900">$800</div>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              Sesiones de entrenamiento para tu equipo en el uso de MILA y mejores prácticas de compliance.
            </p>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <CheckCircle2 className="h-4 w-4 text-slate-400" />
              <span>Incluye: Manual de usuario + Sesión online + Certificado</span>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-bold text-gray-900">Soporte Técnico Premium</h4>
              <div className="text-2xl font-bold text-gray-900">$300<span className="text-sm text-gray-600 font-normal">/mes</span></div>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              Respuesta prioritaria, asistencia remota, y canal directo con el equipo técnico.
            </p>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <CheckCircle2 className="h-4 w-4 text-slate-400" />
              <span>Respuesta en menos de 4 horas hábiles</span>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Examples */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-8 text-white">
        <h3 className="text-2xl font-bold mb-6 text-center">
          Ejemplos de Inversión Total
        </h3>
        <div className="grid md:grid-cols-3 gap-6">
          {/* Example 1 */}
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
            <div className="text-sm text-blue-200 mb-2">Gobierno Municipal Pequeño</div>
            <div className="text-3xl font-bold mb-4">1 Módulo</div>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-blue-100">Discovery:</span>
                <span className="font-semibold">$2,500</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-blue-100">Setup (Operativo):</span>
                <span className="font-semibold">$500</span>
              </div>
              <div className="flex justify-between text-sm border-t border-white/20 pt-2">
                <span className="text-blue-100">Primer mes:</span>
                <span className="font-bold text-lg">$3,150</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-blue-100">Mes 2+:</span>
                <span className="font-semibold">$150/mes</span>
              </div>
            </div>
            <div className="text-xs text-blue-200">
              💡 ROI en 1er mes: evita 1 impugnación ($50K+)
            </div>
          </div>

          {/* Example 2 */}
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border-2 border-green-400">
            <div className="text-sm text-green-200 mb-2">Gobierno Provincial</div>
            <div className="text-3xl font-bold mb-4">2 Módulos</div>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-blue-100">Discovery:</span>
                <span className="font-semibold">$2,500</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-blue-100">Setup (Operativo + Técnico):</span>
                <span className="font-semibold">$1,000</span>
              </div>
              <div className="flex justify-between text-sm border-t border-white/20 pt-2">
                <span className="text-blue-100">Primer mes:</span>
                <span className="font-bold text-lg">$3,800</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-blue-100">Mes 2+:</span>
                <span className="font-semibold">$300/mes</span>
              </div>
            </div>
            <div className="text-xs text-green-200">
              💡 ROI en 2 meses: $3,600/año vs $60K en auditores
            </div>
          </div>

          {/* Example 3 */}
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
            <div className="text-sm text-blue-200 mb-2">Organismo Nacional</div>
            <div className="text-3xl font-bold mb-4">3 Módulos</div>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-blue-100">Discovery:</span>
                <span className="font-semibold">$2,500</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-blue-100">Setup (todos):</span>
                <span className="font-semibold">$1,500</span>
              </div>
              <div className="flex justify-between text-sm border-t border-white/20 pt-2">
                <span className="text-blue-100">Primer mes:</span>
                <span className="font-bold text-lg">$4,450</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-blue-100">Mes 2+:</span>
                <span className="font-semibold">$450/mes</span>
              </div>
            </div>
            <div className="text-xs text-blue-200">
              💡 $5,400/año: menos que 1 mes de auditor senior
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link href="/contact">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 font-bold px-12 py-6">
              Solicitar Reunión Comercial
            </Button>
          </Link>
        </div>
      </div>

      {/* Value Proposition */}
      <div className="mt-12 bg-amber-50 border-2 border-amber-200 rounded-2xl p-8">
        <div className="text-center max-w-3xl mx-auto">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            ¿Por qué $150/mes y no $15/mes?
          </h3>
          <div className="text-left space-y-4 text-gray-700">
            <div className="flex items-start gap-3">
              <div className="bg-amber-200 rounded-full p-2 flex-shrink-0">
                <CheckCircle2 className="h-5 w-5 text-amber-800" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Precio serio para comprador serio</p>
                <p className="text-sm text-gray-600">$15/mes es precio de Netflix, no de software B2B2G profesional. Los gobiernos no toman en serio herramientas baratas.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-amber-200 rounded-full p-2 flex-shrink-0">
                <CheckCircle2 className="h-5 w-5 text-amber-800" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Justificación presupuestaria facilitada</p>
                <p className="text-sm text-gray-600">$150/mes es "software empresarial". $15/mes es "no sirve para nada importante" ante auditores internos.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-amber-200 rounded-full p-2 flex-shrink-0">
                <CheckCircle2 className="h-5 w-5 text-amber-800" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">ROI innegable</p>
                <p className="text-sm text-gray-600">Un solo error evitado ($50K-$200K en litigios) justifica 300 meses de licencia. Es literalmente gratis.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-amber-200 rounded-full p-2 flex-shrink-0">
                <CheckCircle2 className="h-5 w-5 text-amber-800" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Barrera de entrada baja, no ridícula</p>
                <p className="text-sm text-gray-600">Discovery obligatorio ($2,500) filtra clientes no serios. Luego $150/mes elimina objeción de "muy caro" sin perder credibilidad.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
