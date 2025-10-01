# 🚀 ROADMAP DE IMPLEMENTACIÓN MILA - LANZAMIENTO 48H

## ✅ COMPLETADO (40%)

### 1. Sistema de Pricing ✅
- Archivo: `/src/lib/pricing.ts`
- Tiers: Free, Professional ($299), Government ($899), Enterprise (custom)
- Funciones: `canPerformAction()`, `calculateROI()`, `getRecommendedUpgrade()`

### 2. Landing Page ✅
- Archivo: `/src/app/(public)/landing/page.tsx`
- Incluye: Hero, Social Proof, ROI Calculator interactivo, Pricing table, FAQ
- CTA optimizados para conversión

### 3. Onboarding ✅
- Archivo: `/src/app/(auth)/onboarding/page.tsx`
- 3 pasos: Tipo de documento → País → Tipo de organización
- Carga normativa local automática

### 4. Modal de Discusión con Aprendizaje ✅
- Archivo: `/src/ai/flows/discuss-finding.ts`
- Funciones: `evaluateUserArgument()`, `generateModuleInstruction()`, `saveModuleInstruction()`
- Outcomes: user_wins, ai_wins, ongoing

### 5. Sistema de Métricas ✅
- Archivo: `/src/lib/metrics.ts`
- Tracking: análisis, hallazgos, discusiones, tiempo, costos API, precisión

---

## 🔥 PENDIENTE CRÍTICO (60%)

### 6. Dashboard de Métricas 🚧 **PRIORIDAD 1**

**Archivo:** `/src/app/(protected)/dashboard/page.tsx`

```tsx
'use client';

import { getUserMetrics, getAccuracyRate, getTimeSaved } from '@/lib/metrics';
import { PRICING_TIERS, canPerformAction } from '@/lib/pricing';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  FileText, AlertTriangle, Target, Clock, DollarSign,
  MessageSquare, TrendingUp, CheckCircle2
} from 'lucide-react';

export default function DashboardPage() {
  const metrics = getUserMetrics();
  const userTier = 'professional'; // TODO: obtener del contexto de auth
  const tier = PRICING_TIERS[userTier];
  const accuracyRate = getAccuracyRate();
  const hoursSaved = getTimeSaved();

  const usagePercentage = tier.analysisLimit === -1
    ? 0
    : (metrics.analysisCount / tier.analysisLimit) * 100;

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <MetricCard
          title="Análisis este mes"
          value={metrics.analysisCount}
          subtitle={`de ${tier.analysisLimit === -1 ? '∞' : tier.analysisLimit}`}
          icon={<FileText className="h-6 w-6" />}
          progress={usagePercentage}
        />
        <MetricCard
          title="Hallazgos detectados"
          value={metrics.findingsDetected}
          subtitle={`${metrics.findingsApplied} aplicados`}
          icon={<AlertTriangle className="h-6 w-6" />}
        />
        <MetricCard
          title="Tasa de precisión"
          value={`${accuracyRate}%`}
          subtitle={`${metrics.userUpvotes} confirmados`}
          icon={<Target className="h-6 w-6" />}
        />
        <MetricCard
          title="Tiempo ahorrado"
          value={`${hoursSaved}h`}
          subtitle="vs auditoría manual"
          icon={<Clock className="h-6 w-6" />}
        />
        <MetricCard
          title="Costo API"
          value={`$${metrics.apiCost.toFixed(2)}`}
          subtitle="este mes"
          icon={<DollarSign className="h-6 w-6" />}
        />
        <MetricCard
          title="Discusiones"
          value={`${metrics.discussionsWon}/${metrics.discussionsStarted}`}
          subtitle="ganadas"
          icon={<MessageSquare className="h-6 w-6" />}
        />
      </div>

      {/* CTAs de upsell - ver sección 9 */}
      {usagePercentage > 80 && (
        <UpgradeAlert currentTier={userTier} usage={metrics.analysisCount} limit={tier.analysisLimit} />
      )}

      {/* Actividad reciente */}
      <RecentActivity />
    </div>
  );
}

function MetricCard({ title, value, subtitle, icon, progress }: any) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
          <div className="text-blue-600">{icon}</div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold mb-1">{value}</div>
        {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
        {progress !== undefined && (
          <Progress value={progress} className="h-2 mt-3" />
        )}
      </CardContent>
    </Card>
  );
}
```

---

### 7. Reportes PDF Profesionales 🚧 **PRIORIDAD 2**

**Archivo:** `/src/lib/pdf-generator-pro.ts`

Mejoras sobre el actual:
```typescript
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export async function generateProfessionalReport(data: {
  documentName: string;
  findings: any[];
  complianceScore: number;
  riskCategory: any;
  userName?: string;
  organization?: string;
}) {
  const pdfDoc = await PDFDocument.create();

  // 1. PORTADA con logo grande
  await addCoverPage(pdfDoc, data);

  // 2. RESUMEN EJECUTIVO con gauge chart visual
  await addExecutiveSummary(pdfDoc, data);

  // 3. HALLAZGOS con mejor layout
  for (const [idx, finding] of data.findings.entries()) {
    await addFindingPage(pdfDoc, finding, idx + 1);
  }

  // 4. RECOMENDACIONES
  await addRecommendationsPage(pdfDoc, data);

  // 5. ANEXOS (normativa referenciada)
  await addAnnexPage(pdfDoc, data);

  // Footer en todas las páginas
  addFooters(pdfDoc);

  return await pdfDoc.save();
}

async function addCoverPage(doc: PDFDocument, data: any) {
  const page = doc.addPage([595, 842]); // A4
  const { width, height } = page.getSize();

  // Logo centrado
  const logoBytes = await fetch('/logo/Logo MILA (sin fondo).png').then(r => r.arrayBuffer());
  const logo = await doc.embedPng(logoBytes);
  const logoDims = logo.scale(0.15);

  page.drawImage(logo, {
    x: (width - logoDims.width) / 2,
    y: height - 200,
    width: logoDims.width,
    height: logoDims.height,
  });

  // Título
  const boldFont = await doc.embedFont(StandardFonts.HelveticaBold);
  page.drawText('INFORME DE CUMPLIMIENTO NORMATIVO', {
    x: 50,
    y: height - 300,
    size: 20,
    font: boldFont,
    color: rgb(0.1, 0.2, 0.5),
  });

  // Score grande con color
  const scoreColor = data.complianceScore >= 80 ? rgb(0.2, 0.6, 0.3) :
                     data.complianceScore >= 60 ? rgb(0.9, 0.6, 0.2) :
                     rgb(0.8, 0.2, 0.2);

  page.drawText(`${data.complianceScore}%`, {
    x: width / 2 - 50,
    y: height / 2,
    size: 72,
    font: boldFont,
    color: scoreColor,
  });

  // Metadata
  const font = await doc.embedFont(StandardFonts.Helvetica);
  let y = 200;
  page.drawText(`Documento: ${data.documentName}`, { x: 50, y, size: 10, font });
  y -= 20;
  page.drawText(`Fecha: ${new Date().toLocaleDateString()}`, { x: 50, y, size: 10, font });
  y -= 20;
  if (data.userName) {
    page.drawText(`Analista: ${data.userName}`, { x: 50, y, size: 10, font });
  }
}

// TODO: implementar addExecutiveSummary, addFindingPage, etc.
```

---

### 8. Terms of Service & Privacy Policy 🚧 **PRIORIDAD 3**

**Archivo:** `/src/app/legal/terms/page.tsx`

```tsx
export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold mb-8">Términos de Servicio</h1>

      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">1. Aceptación de los Términos</h2>
        <p className="text-gray-700 mb-4">
          Al acceder y utilizar MILA ("el Servicio"), usted acepta estar sujeto a estos Términos de Servicio ("Términos"). Si no está de acuerdo con estos Términos, no utilice el Servicio.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">2. Descripción del Servicio</h2>
        <p className="text-gray-700 mb-4">
          MILA es una plataforma de análisis normativo asistida por inteligencia artificial diseñada para:
        </p>
        <ul className="list-disc list-inside text-gray-700 mb-4">
          <li>Analizar documentos administrativos y de contratación pública</li>
          <li>Detectar inconsistencias con normativa vigente</li>
          <li>Proporcionar sugerencias de mejora basadas en IA</li>
          <li>Generar reportes de compliance</li>
        </ul>
        <p className="text-gray-700 mb-4 font-semibold">
          IMPORTANTE: MILA es una herramienta de asistencia. No reemplaza el juicio profesional de abogados o auditores. Las sugerencias de MILA deben ser revisadas y validadas por personal calificado.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">3. Planes y Facturación</h2>
        <p className="text-gray-700 mb-4">
          MILA ofrece planes Gratuito, Profesional, Gobierno y Enterprise. Los precios están disponibles en nuestra página de Pricing.
        </p>
        <ul className="list-disc list-inside text-gray-700 mb-4">
          <li>Pagos mensuales se cobran por adelantado</li>
          <li>Puedes cancelar en cualquier momento</li>
          <li>No hay reembolsos por periodos parciales</li>
          <li>Podemos ajustar precios con 30 días de aviso</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">4. Limitación de Responsabilidad</h2>
        <p className="text-gray-700 mb-4">
          MILA se proporciona "tal cual" sin garantías de ningún tipo. No somos responsables por:
        </p>
        <ul className="list-disc list-inside text-gray-700 mb-4">
          <li>Decisiones tomadas basándose en sugerencias de MILA</li>
          <li>Errores u omisiones en los análisis generados</li>
          <li>Pérdidas financieras derivadas del uso del Servicio</li>
          <li>Acciones legales, impugnaciones o multas</li>
        </ul>
        <p className="text-gray-700 mb-4 font-semibold">
          La responsabilidad máxima de MILA está limitada al monto pagado en los últimos 12 meses.
        </p>
      </section>

      {/* TODO: agregar más secciones: Propiedad Intelectual, Cancelación, Ley Aplicable, etc. */}
    </div>
  );
}
```

**Archivo:** `/src/app/legal/privacy/page.tsx`

```tsx
export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold mb-8">Política de Privacidad</h1>

      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">1. Información que Recopilamos</h2>
        <ul className="list-disc list-inside text-gray-700 mb-4">
          <li>Datos de cuenta: email, nombre, organización</li>
          <li>Datos de uso: análisis realizados, métricas de sesión</li>
          <li>NO almacenamos contenido de documentos analizados</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">2. Tratamiento de Documentos</h2>
        <div className="bg-green-50 border-2 border-green-500 rounded-lg p-6 mb-4">
          <h3 className="font-bold text-green-900 mb-2">🔒 Garantía de Privacidad</h3>
          <ul className="list-disc list-inside text-green-800">
            <li>Los documentos se procesan en memoria durante el análisis</li>
            <li>Se eliminan inmediatamente después del procesamiento</li>
            <li>NO se almacenan en nuestros servidores</li>
            <li>NO se utilizan para entrenar modelos de IA</li>
          </ul>
        </div>
        <p className="text-gray-700 mb-4">
          Solo tú guardas los resultados del análisis (hallazgos, scores), no el documento original.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">3. Uso de APIs de Terceros</h2>
        <p className="text-gray-700 mb-4">
          MILA utiliza Google Gemini y/o Anthropic Claude para análisis de IA.
        </p>
        <ul className="list-disc list-inside text-gray-700 mb-4">
          <li>Configuramos "no-training" en todas las llamadas API</li>
          <li>Los datos se procesan según políticas de Google/Anthropic</li>
          <li>Para tier Gobierno, ofrecemos opción on-premise sin APIs externas</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">4. Cumplimiento Normativo</h2>
        <ul className="list-disc list-inside text-gray-700 mb-4">
          <li>GDPR compliant (Unión Europea)</li>
          <li>LGPD compliant (Brasil)</li>
          <li>ISO 27001 en roadmap (Q2 2025)</li>
        </ul>
      </section>

      {/* TODO: agregar Cookies, Tus Derechos, Contacto, etc. */}
    </div>
  );
}
```

---

### 9. Floating CTAs para Upselling 🚧 **PRIORIDAD 4**

**Archivo:** `/src/components/upsell/floating-cta.tsx`

```tsx
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { getUserMetrics } from '@/lib/metrics';
import { PRICING_TIERS, getRecommendedUpgrade } from '@/lib/pricing';
import Link from 'next/link';

export function FloatingCTA({ currentTier }: { currentTier: string }) {
  const [isVisible, setIsVisible] = useState(false);
  const metrics = getUserMetrics();
  const tier = PRICING_TIERS[currentTier as keyof typeof PRICING_TIERS];
  const recommended = getRecommendedUpgrade(currentTier as any);

  useEffect(() => {
    // Mostrar si está cerca del límite
    if (tier.analysisLimit !== -1 && metrics.analysisCount >= tier.analysisLimit * 0.8) {
      setIsVisible(true);
    }
  }, [metrics.analysisCount, tier.analysisLimit]);

  if (!isVisible || !recommended) return null;

  return (
    <div className="fixed bottom-8 right-8 z-50 animate-in slide-in-from-bottom duration-500">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-2xl shadow-2xl p-6 max-w-sm relative">
        <button
          onClick={() => setIsVisible(false)}
          className="absolute top-2 right-2 text-white/70 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        <h3 className="text-lg font-bold mb-2">
          ⚠️ Límite alcanzado
        </h3>
        <p className="text-sm text-blue-100 mb-4">
          Has usado {metrics.analysisCount} de {tier.analysisLimit} análisis este mes.
        </p>

        <div className="bg-white/10 rounded-lg p-4 mb-4">
          <p className="text-sm font-semibold mb-2">
            Actualiza a {recommended.displayName}:
          </p>
          <ul className="text-xs space-y-1">
            <li>✓ {recommended.analysisLimit === -1 ? 'Análisis ilimitados' : `${recommended.analysisLimit} análisis/mes`}</li>
            <li>✓ Documentos de tamaño ilimitado</li>
            <li>✓ Soporte prioritario</li>
          </ul>
        </div>

        <Link href="/upgrade">
          <Button className="w-full bg-white text-blue-600 hover:bg-blue-50">
            Actualizar ahora → ${recommended.price}/mes
          </Button>
        </Link>
      </div>
    </div>
  );
}
```

---

### 10. Sistema de Autenticación 🚧 **IMPORTANTE** (requiere setup externo)

**Opción A: NextAuth.js (recomendada para MVP)**

```bash
npm install next-auth @auth/prisma-adapter
```

**Archivo:** `/src/app/api/auth/[...nextauth]/route.ts`

```typescript
import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import EmailProvider from 'next-auth/providers/email';

export const authOptions = {
  providers: [
    EmailProvider({
      server: process.env.EMAIL_SERVER,
      from: process.env.EMAIL_FROM,
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: '/login',
    signOut: '/logout',
    error: '/error',
  },
  callbacks: {
    async session({ session, token }: any) {
      session.user.id = token.sub;
      session.user.tier = token.tier || 'free';
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
```

**Opción B: Clerk (más fácil, sin backend)**

```bash
npm install @clerk/nextjs
```

Configurar en `.env`:
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=...
CLERK_SECRET_KEY=...
```

---

### 11. Integración de Pagos 🚧 **CRÍTICO PARA MONETIZAR**

**Stripe (recomendado)**

```bash
npm install stripe @stripe/stripe-js
```

**Archivo:** `/src/lib/stripe.ts`

```typescript
import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
});

export const STRIPE_PRICE_IDS = {
  professional: process.env.STRIPE_PRICE_ID_PROFESSIONAL!,
  government: process.env.STRIPE_PRICE_ID_GOVERNMENT!,
};
```

**Archivo:** `/src/app/api/checkout/route.ts`

```typescript
import { stripe, STRIPE_PRICE_IDS } from '@/lib/stripe';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { priceId, userId } = await req.json();

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_URL}/dashboard?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_URL}/pricing?canceled=true`,
    customer_email: userId, // TODO: obtener del usuario autenticado
  });

  return NextResponse.json({ sessionId: session.id });
}
```

**MercadoPago (para LATAM)**

```bash
npm install mercadopago
```

Similar setup pero con SDK de MercadoPago.

---

## 📋 CHECKLIST FINAL DE LANZAMIENTO

### Pre-lanzamiento (48h)
- [ ] Completar dashboard de métricas
- [ ] Mejorar generador de PDF
- [ ] Crear páginas legales (Terms, Privacy)
- [ ] Setup de NextAuth o Clerk
- [ ] Integrar Stripe checkout básico
- [ ] Agregar floating CTAs
- [ ] Testing end-to-end del flujo completo
- [ ] Setup de analytics (Mixpanel/PostHog)

### Configuración (.env)
```bash
# APIs de IA
GOOGLE_API_KEY=...
ANTHROPIC_API_KEY=...

# Auth
NEXTAUTH_SECRET=...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...

# Payments
STRIPE_SECRET_KEY=...
STRIPE_PRICE_ID_PROFESSIONAL=...
STRIPE_PRICE_ID_GOVERNMENT=...

# DB (Supabase recomendado para MVP)
DATABASE_URL=...
SUPABASE_URL=...
SUPABASE_ANON_KEY=...

# Email
EMAIL_SERVER=smtp://...
EMAIL_FROM=noreply@mila.ai
```

### Día de lanzamiento
1. **Deploy en Vercel**
   ```bash
   vercel --prod
   ```

2. **Verificar:**
   - Landing page carga correctamente
   - Signup funciona
   - Onboarding completo
   - Análisis de documento funciona
   - Checkout de Stripe funciona
   - Emails de confirmación llegan

3. **Marketing inicial:**
   - Post en LinkedIn personal
   - Email a 50 leads previos
   - Post en r/govtech, r/legaltech
   - Mensaje en grupos de Slack/Discord

---

## 🎯 MÉTRICAS DE ÉXITO (30 DÍAS)

- [ ] 3 clientes de pago ($299/mes mínimo)
- [ ] 50 signups en tier gratuito
- [ ] 15% conversión de gratis → pago
- [ ] NPS > 40
- [ ] <5% churn mes 1

Si logras esto, tienes product-market fit inicial y puedes levantar pre-seed con tracción.

---

## 📞 PRÓXIMOS PASOS INMEDIATOS

1. **Terminar estos archivos AHORA (6-8 horas):**
   - Dashboard completo
   - PDF generator mejorado
   - Páginas legales
   - Floating CTAs

2. **Setup externo (2-4 horas):**
   - Clerk para auth
   - Stripe para pagos
   - Vercel para hosting

3. **Testing (2 horas):**
   - Flujo completo end-to-end
   - Mobile responsive
   - Velocidad de carga

4. **Deploy & Launch (1 hora):**
   - Push a producción
   - Anuncio en redes

**TOTAL: 12-16 horas de trabajo para estar 100% lanzable.**

¿Con qué parte empezamos?
