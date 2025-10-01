'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  CheckCircle2,
  ArrowRight,
  Building2,
  Zap,
  FileCheck,
} from 'lucide-react';
import Link from 'next/link';

/**
 * Sección de Pricing adaptada al modelo consultivo
 * Para reemplazar la sección actual en landing/page.tsx
 */
export function PricingConsultivo() {
  return (
    <section id="pricing" className="max-w-7xl mx-auto px-4 py-20">
      <div className="text-center mb-16">
        <Badge className="mb-4 bg-green-100 text-green-800 hover:bg-green-100">
          🏛️ Especializado en Sector Público
        </Badge>
        <h2 className="text-4xl font-bold text-gray-900 mb-4">
          Implementación Profesional
        </h2>
        <p className="text-xl text-gray-600">
          No es un software genérico. Es tu sistema de compliance personalizado.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 mb-16">
        {/* Fase 1: Prueba de Concepto */}
        <Card className="relative border-2 border-blue-200 hover:shadow-2xl transition-shadow">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
            <Badge className="bg-blue-600 text-white px-4 py-1">
              Paso 1
            </Badge>
          </div>
          <CardHeader className="text-center pt-8">
            <CardTitle className="text-2xl mb-2">Prueba de Concepto</CardTitle>
            <div className="text-4xl font-bold text-blue-600 mb-2">
              Gratis
            </div>
            <p className="text-sm text-gray-600">2-3 semanas</p>
          </CardHeader>
          <CardContent>
            <p className="text-center text-gray-700 mb-6 font-semibold">
              Validamos si MILA funciona para tu caso específico
            </p>
            <div className="space-y-3">
              {[
                'Reunión con tu equipo técnico',
                'Análisis de 5 documentos reales',
                'Carga de tus normativas locales',
                'Demo personalizada a stakeholders',
                'Informe de viabilidad'
              ].map((feature, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">{feature}</span>
                </div>
              ))}
            </div>
            <Link href="/contact">
              <Button className="w-full mt-6 btn-bg-image">
                Solicitar POC Gratis
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <p className="text-xs text-center text-gray-500 mt-3">
              Sin compromiso. Si no funciona, no avanzamos.
            </p>
          </CardContent>
        </Card>

        {/* Fase 2: Implementación */}
        <Card className="relative border-4 border-green-500 shadow-2xl scale-105">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
            <Badge className="bg-green-600 text-white px-4 py-1">
              ⭐ Paso 2 - Más Elegido
            </Badge>
          </div>
          <CardHeader className="text-center pt-8">
            <CardTitle className="text-2xl mb-2">Implementación</CardTitle>
            <div className="text-4xl font-bold text-green-600 mb-2">
              $15K - $50K
            </div>
            <p className="text-sm text-gray-600">4-8 semanas (una vez)</p>
          </CardHeader>
          <CardContent>
            <p className="text-center text-gray-700 mb-6 font-semibold">
              Setup completo y personalizado para tu organismo
            </p>
            <div className="space-y-3">
              {[
                'Indexación de toda tu normativa en RAG',
                'Fine-tuning de IA según tus casos de uso',
                'Capacitación del equipo (3 sesiones)',
                'Documentación de procedimientos',
                'Integración con tus sistemas (opcional)',
                'Despliegue on-premise o cloud dedicado'
              ].map((feature, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">{feature}</span>
                </div>
              ))}
            </div>
            <Link href="/contact">
              <Button className="w-full mt-6 bg-green-600 hover:bg-green-700 text-white">
                Solicitar Cotización
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <p className="text-xs text-center text-gray-500 mt-3">
              Facturación por tesorería. Contratación directa o licitación.
            </p>
          </CardContent>
        </Card>

        {/* Fase 3: Licencia Anual */}
        <Card className="relative border-2 border-indigo-200 hover:shadow-2xl transition-shadow">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
            <Badge className="bg-indigo-600 text-white px-4 py-1">
              Paso 3
            </Badge>
          </div>
          <CardHeader className="text-center pt-8">
            <CardTitle className="text-2xl mb-2">Licencia + Soporte</CardTitle>
            <div className="text-4xl font-bold text-indigo-600 mb-2">
              $12K - $60K
            </div>
            <p className="text-sm text-gray-600">Por año</p>
          </CardHeader>
          <CardContent>
            <p className="text-center text-gray-700 mb-6 font-semibold">
              Mantenimiento continuo y actualizaciones
            </p>
            <div className="space-y-3">
              {[
                'Uso ilimitado del sistema',
                'Actualizaciones de normativa (trimestral)',
                'Soporte técnico prioritario',
                'Monitoreo y optimización',
                'Nuevas features incluidas',
                'SLA garantizado (99.5%)'
              ].map((feature, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">{feature}</span>
                </div>
              ))}
            </div>
            <div className="mt-6 p-4 bg-indigo-50 rounded-lg border border-indigo-200">
              <p className="text-xs text-indigo-800 font-semibold">
                💡 Incluido después de la implementación
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ejemplo de Cliente Típico */}
      <Card className="bg-gradient-to-br from-slate-50 to-blue-50 border-2 border-blue-300 mb-16">
        <CardHeader>
          <CardTitle className="text-2xl text-center">
            📊 Ejemplo Real: Municipio de 100K habitantes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-bold text-lg mb-4 text-gray-900">Situación Actual</h3>
              <div className="space-y-2 text-gray-700">
                <p>• 15 pliegos de licitación por mes</p>
                <p>• 2 abogados dedicados a revisión (8h/pliego)</p>
                <p>• Costo mensual: ~$6,000 USD en salarios</p>
                <p>• 2 impugnaciones al año ($50K en defensas)</p>
                <p>• <strong className="text-red-600">Costo anual: ~$172K USD</strong></p>
              </div>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-4 text-gray-900">Con MILA</h3>
              <div className="space-y-2 text-gray-700">
                <p>• Revisión automática en 15 minutos</p>
                <p>• Abogados validan hallazgos críticos (2h/pliego)</p>
                <p>• Costo mensual: ~$3,000 USD (50% reducción)</p>
                <p>• 0 impugnaciones (detección preventiva)</p>
                <p>• <strong className="text-green-600">Costo anual: ~$66K USD</strong></p>
              </div>
            </div>
          </div>
          <div className="mt-6 p-6 bg-green-100 rounded-xl border-2 border-green-500">
            <div className="text-center">
              <p className="text-sm text-green-800 font-semibold mb-2">
                AHORRO NETO AÑO 1 (incluyendo implementación):
              </p>
              <p className="text-5xl font-bold text-green-700">
                $76K USD
              </p>
              <p className="text-sm text-green-700 mt-2">
                ROI del 153% en el primer año
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Formas de Contratación */}
      <div>
        <h3 className="text-2xl font-bold text-center text-gray-900 mb-8">
          Modalidades de Contratación para Gobierno
        </h3>
        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <Building2 className="h-12 w-12 text-blue-600 mb-4" />
              <CardTitle>Licitación Pública</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-700 text-sm">
              <p className="mb-4">
                Para organismos grandes con presupuestos superiores a $50K USD.
              </p>
              <p className="font-semibold text-gray-900">Tiempo: 3-6 meses</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Zap className="h-12 w-12 text-green-600 mb-4" />
              <CardTitle>Contratación Directa</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-700 text-sm">
              <p className="mb-4">
                Por urgencia o especialidad. Ideal para pilotos y organismos medianos.
              </p>
              <p className="font-semibold text-gray-900">Tiempo: 1-2 meses</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <FileCheck className="h-12 w-12 text-indigo-600 mb-4" />
              <CardTitle>Convenio Marco</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-700 text-sm">
              <p className="mb-4">
                Pre-aprobado por el Estado. Compra directa sin RFP individual.
              </p>
              <p className="font-semibold text-gray-900">Tiempo: Inmediato</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
