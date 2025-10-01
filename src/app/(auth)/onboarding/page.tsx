'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FileText, MapPin, Building2, CheckCircle2, ArrowRight, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const DOCUMENT_TYPES = [
  { id: 'pliego', label: 'Pliegos de licitación pública', icon: '📋' },
  { id: 'contrato', label: 'Contratos públicos', icon: '📝' },
  { id: 'resolucion', label: 'Resoluciones administrativas', icon: '⚖️' },
  { id: 'manual', label: 'Manuales de procedimiento', icon: '📚' },
  { id: 'otro', label: 'Otro tipo de documento', icon: '📄' },
];

const COUNTRIES = [
  { code: 'AR', name: 'Argentina', flag: '🇦🇷' },
  { code: 'MX', name: 'México', flag: '🇲🇽' },
  { code: 'CO', name: 'Colombia', flag: '🇨🇴' },
  { code: 'CL', name: 'Chile', flag: '🇨🇱' },
  { code: 'PE', name: 'Perú', flag: '🇵🇪' },
  { code: 'BR', name: 'Brasil', flag: '🇧🇷' },
  { code: 'UY', name: 'Uruguay', flag: '🇺🇾' },
  { code: 'PY', name: 'Paraguay', flag: '🇵🇾' },
  { code: 'EC', name: 'Ecuador', flag: '🇪🇨' },
  { code: 'BO', name: 'Bolivia', flag: '🇧🇴' },
];

const ORGANIZATION_TYPES = [
  { id: 'gobierno_nacional', label: 'Gobierno Nacional' },
  { id: 'gobierno_provincial', label: 'Gobierno Provincial/Estatal' },
  { id: 'gobierno_municipal', label: 'Gobierno Municipal' },
  { id: 'empresa_publica', label: 'Empresa Pública' },
  { id: 'consultora', label: 'Consultoría Legal/Administrativa' },
  { id: 'privado', label: 'Sector Privado' },
  { id: 'otro', label: 'Otro' },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    documentType: '',
    country: '',
    organizationType: '',
  });

  const handleDocumentTypeSelect = (type: string) => {
    setFormData({ ...formData, documentType: type });
  };

  const handleCountrySelect = (country: string) => {
    setFormData({ ...formData, country });
  };

  const handleOrganizationTypeSelect = (orgType: string) => {
    setFormData({ ...formData, organizationType: orgType });
  };

  const handleNext = () => {
    if (step === 1 && !formData.documentType) {
      toast({
        title: 'Selecciona un tipo de documento',
        description: 'Necesitamos saber qué tipo de documentos analizas más frecuentemente.',
        variant: 'destructive',
      });
      return;
    }
    if (step === 2 && !formData.country) {
      toast({
        title: 'Selecciona tu país',
        description: 'Necesitamos saber tu jurisdicción para cargar la normativa apropiada.',
        variant: 'destructive',
      });
      return;
    }
    if (step === 3 && !formData.organizationType) {
      toast({
        title: 'Selecciona tu tipo de organización',
        description: 'Esto nos ayuda a personalizar tu experiencia.',
        variant: 'destructive',
      });
      return;
    }

    if (step < 3) {
      setStep(step + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = async () => {
    setIsLoading(true);

    try {
      // Guardar preferencias del usuario
      localStorage.setItem('userPreferences', JSON.stringify(formData));

      // Simular carga de normativa local
      await new Promise(resolve => setTimeout(resolve, 2000));

      toast({
        title: '¡Perfil configurado!',
        description: 'Hemos cargado la normativa de tu país. Estás listo para empezar.',
      });

      // Redirigir al prepare
      setTimeout(() => {
        router.push('/prepare');
      }, 1000);
    } catch (error) {
      toast({
        title: 'Error al configurar',
        description: 'Por favor intenta nuevamente.',
        variant: 'destructive',
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                    s < step
                      ? 'bg-green-500 text-white'
                      : s === step
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-300 text-gray-600'
                  }`}
                >
                  {s < step ? <CheckCircle2 className="h-6 w-6" /> : s}
                </div>
                {s < 3 && (
                  <div
                    className={`h-1 w-20 md:w-40 mx-2 ${
                      s < step ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="text-center text-sm text-gray-600">
            Paso {step} de 3
          </div>
        </div>

        {/* Step Content */}
        <Card className="shadow-2xl">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-3xl font-bold">
              {step === 1 && '¿Qué tipo de documentos validas más?'}
              {step === 2 && '¿En qué país/jurisdicción trabajas?'}
              {step === 3 && '¿Qué tipo de organización eres?'}
            </CardTitle>
            <p className="text-gray-600 mt-2">
              {step === 1 && 'Esto nos ayuda a optimizar el análisis para tu caso específico'}
              {step === 2 && 'Cargaremos automáticamente la normativa local relevante'}
              {step === 3 && 'Personalizaremos tu experiencia según tu sector'}
            </p>
          </CardHeader>

          <CardContent className="px-6 pb-8">
            {/* Step 1: Document Type */}
            {step === 1 && (
              <RadioGroup
                value={formData.documentType}
                onValueChange={handleDocumentTypeSelect}
                className="grid md:grid-cols-2 gap-4"
              >
                {DOCUMENT_TYPES.map((type) => (
                  <div
                    key={type.id}
                    className={`relative border-2 rounded-lg p-4 cursor-pointer transition-all ${
                      formData.documentType === type.id
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleDocumentTypeSelect(type.id)}
                  >
                    <RadioGroupItem value={type.id} id={type.id} className="sr-only" />
                    <Label htmlFor={type.id} className="cursor-pointer">
                      <div className="flex items-center space-x-3">
                        <span className="text-3xl">{type.icon}</span>
                        <span className="font-medium">{type.label}</span>
                      </div>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            )}

            {/* Step 2: Country */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  {COUNTRIES.map((country) => (
                    <div
                      key={country.code}
                      className={`relative border-2 rounded-lg p-4 cursor-pointer transition-all ${
                        formData.country === country.code
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handleCountrySelect(country.code)}
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-3xl">{country.flag}</span>
                        <span className="font-medium">{country.name}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {formData.country && (
                  <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 flex items-start space-x-3">
                    <MapPin className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-blue-900">Normativa que cargaremos</h4>
                      <p className="text-sm text-blue-700 mt-1">
                        {formData.country === 'AR' && 'Ley 80/93, Decreto 1082/15, normativa de contrataciones CABA, provincia de Buenos Aires, etc.'}
                        {formData.country === 'MX' && 'Ley de Adquisiciones, Ley de Obras Públicas, normativa estatal y municipal.'}
                        {formData.country === 'CO' && 'Ley 80/93, Ley 1150/07, Decreto 1082/15, Colombia Compra Eficiente.'}
                        {formData.country === 'CL' && 'Ley 19.886, Reglamento de Compras Públicas, normativa ChileCompra.'}
                        {formData.country === 'PE' && 'Ley 30225, Reglamento de Contrataciones, normativa OSCE.'}
                        {formData.country === 'BR' && 'Lei 8.666/93, Lei 14.133/21, normativa estadual e municipal.'}
                        {!['AR', 'MX', 'CO', 'CL', 'PE', 'BR'].includes(formData.country) && 'Normativa general de contrataciones públicas y derecho administrativo.'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Organization Type */}
            {step === 3 && (
              <RadioGroup
                value={formData.organizationType}
                onValueChange={handleOrganizationTypeSelect}
                className="grid md:grid-cols-2 gap-4"
              >
                {ORGANIZATION_TYPES.map((orgType) => (
                  <div
                    key={orgType.id}
                    className={`relative border-2 rounded-lg p-4 cursor-pointer transition-all ${
                      formData.organizationType === orgType.id
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleOrganizationTypeSelect(orgType.id)}
                  >
                    <RadioGroupItem value={orgType.id} id={orgType.id} className="sr-only" />
                    <Label htmlFor={orgType.id} className="cursor-pointer">
                      <div className="flex items-center space-x-3">
                        <Building2 className="h-6 w-6 text-gray-600" />
                        <span className="font-medium">{orgType.label}</span>
                      </div>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t">
              <Button
                variant="ghost"
                onClick={() => setStep(Math.max(1, step - 1))}
                disabled={step === 1 || isLoading}
              >
                Atrás
              </Button>

              <Button
                size="lg"
                onClick={handleNext}
                disabled={isLoading}
                className="btn-bg-image"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Configurando...
                  </>
                ) : step === 3 ? (
                  <>
                    Completar
                    <CheckCircle2 className="ml-2 h-5 w-5" />
                  </>
                ) : (
                  <>
                    Siguiente
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Skip Option */}
        {!isLoading && (
          <div className="text-center mt-6">
            <button
              onClick={() => router.push('/prepare')}
              className="text-sm text-gray-600 hover:text-gray-900 underline"
            >
              Saltar configuración (usar valores por defecto)
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
