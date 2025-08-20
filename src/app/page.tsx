
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LanguageSwitcher } from '@/components/layout/language-switcher';
import { Button } from '@/components/ui/button';
import { Scale, Search, AlertTriangle, BookCheck, Edit, TrendingUp, Share2, Network, FileStack, ShieldAlert, Landmark, Globe, MapPin } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useTranslations } from '@/lib/translations';
import Image from 'next/image';


const cardBaseClasses = "glass p-6 shadow rounded-2xl card-hud-hover h-full flex flex-col items-center text-center";
const detailsBaseClasses = "glass p-4 rounded-2xl shadow card-hud-hover";

export default function LandingPage() {
  const { language } = useLanguage();
  const t = useTranslations(language);
  const router = useRouter();

  const handleDemoClick = () => {
    // Redirect directly to prepare page
    router.push('/prepare');
  };
  
  return (
    <div className="bg-gradient-to-br from-white via-slate-300 to-sky-900/40 text-gray-800">
      <header className="glass max-w-7xl mx-auto mt-6 px-4 py-3 flex justify-end items-center sticky top-4 z-50">
        <div className="flex items-center space-x-2 sm:space-x-4">
          <LanguageSwitcher variant="light" />
          <Button onClick={handleDemoClick} className="hidden sm:inline-flex btn-neu-light rounded-full animate-subtle-breathing">
            {t('nav.demo')}
          </Button>
        </div>
      </header>

      <main>
        <section className="text-center py-16 px-4">
          <div className="flex justify-center mb-8">
            <Image
              src="/logo/Logo MILA (sin fondo).png"
              alt="MILA Logo"
              width={200}
              height={200}
              className="h-28 w-auto"
              data-ai-hint="logo company"
            />
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold mb-4 tracking-tight text-gray-900">{t('hero.title')}</h1>
          <p className="text-lg max-w-2xl mx-auto font-medium text-gray-600">{t('hero.subtitle')}</p>
           <div className="mt-8 flex flex-col sm:flex-row justify-center items-center gap-4 sm:hidden">
              <Button onClick={handleDemoClick} size="lg" className="btn-neu-light rounded-full animate-subtle-breathing">
                {t('nav.demo')}
              </Button>
            </div>
        </section>

        <section id="features" className="py-20 px-6 max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12">{t('whatIsMila.title')}</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className={cardBaseClasses}>
              <div className="bg-blue-100/70 rounded-full p-3 mb-4">
                <Search className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-2xl font-semibold mb-3">{t('whatIsMila.analysisTitle')}</h3>
              <p>{t('whatIsMila.analysisText')}</p>
            </div>
            <div className={cardBaseClasses}>
              <div className="bg-blue-100/70 rounded-full p-3 mb-4">
                <AlertTriangle className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-2xl font-semibold mb-3">{t('whatIsMila.alertsTitle')}</h3>
              <p>{t('whatIsMila.alertsText')}</p>
            </div>
            <div className={cardBaseClasses}>
              <div className="bg-blue-100/70 rounded-full p-3 mb-4">
                <Edit className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-2xl font-semibold mb-3">{t('whatIsMila.editingTitle')}</h3>
              <p>{t('whatIsMila.editingText')}</p>
            </div>
            <div className={cardBaseClasses}>
              <div className="bg-blue-100/70 rounded-full p-3 mb-4">
                <TrendingUp className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-2xl font-semibold mb-3">{t('whatIsMila.scoreTitle')}</h3>
              <p>{t('whatIsMila.scoreText')}</p>
            </div>
            <div className={cardBaseClasses}>
              <div className="bg-blue-100/70 rounded-full p-3 mb-4">
                <BookCheck className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-2xl font-semibold mb-3">{t('whatIsMila.normsTitle')}</h3>
              <p>{t('whatIsMila.normsText')}</p>
            </div>
            <div className={cardBaseClasses}>
              <div className="bg-blue-100/70 rounded-full p-3 mb-4">
                <Share2 className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-2xl font-semibold mb-3">{t('whatIsMila.exportTitle')}</h3>
              <p>{t('whatIsMila.exportText')}</p>
            </div>
          </div>
        </section>
        
        <section id="results" className="py-20 px-6 max-w-6xl mx-auto">
          <div className="text-center">
            <h2 className="text-4xl font-bold mb-4">{t('results.title')}</h2>
            <p className="mb-10 italic text-sm text-gray-600">{t('results.disclaimer')}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
              <div className={cardBaseClasses}>
                <h4 className="text-5xl font-extrabold text-green-600">+67%</h4>
                <p className="mt-2 font-medium">{t('results.stat1')}</p>
              </div>
              <div className={cardBaseClasses}>
                <h4 className="text-3xl font-extrabold text-blue-600">3 min vs 80 días</h4>
                <p className="mt-2 font-medium">{t('results.stat2')}</p>
              </div>
              <div className={cardBaseClasses}>
                <h4 className="text-5xl font-extrabold text-purple-600">+82%</h4>
                <p className="mt-2 font-medium">{t('results.stat3')}</p>
              </div>
              <div className={cardBaseClasses}>
                <h4 className="text-5xl font-extrabold text-yellow-500">76%</h4>
                <p className="mt-2 font-medium">{t('results.stat4')}</p>
              </div>
               <div className={cardBaseClasses}>
                <h4 className="text-5xl font-extrabold text-indigo-500">+15</h4>
                <p className="mt-2 font-medium">{t('results.stat5')}</p>
              </div>
              <div className={cardBaseClasses}>
                <h4 className="text-5xl font-extrabold text-pink-600">100%</h4>
                <p className="mt-2 font-medium">{t('results.stat6')}</p>
              </div>
            </div>
          </div>
        </section>

        <section id="differentiators" className="py-20 px-6 max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold mb-10 text-center">{t('differentiators.title')}</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className={cardBaseClasses}>
              <div className="bg-blue-100/70 rounded-full p-3 mb-4">
                <Network className="h-8 w-8 text-blue-600"/>
              </div>
              <h3 className="text-2xl font-semibold mb-2">{t('differentiators.trainingTitle')}</h3>
              <p>{t('differentiators.trainingText')}</p>
            </div>
            <div className={cardBaseClasses}>
              <div className="bg-blue-100/70 rounded-full p-3 mb-4">
                <FileStack className="h-8 w-8 text-blue-600"/>
              </div>
              <h3 className="text-2xl font-semibold mb-2">{t('differentiators.docsTitle')}</h3>
              <p>{t('differentiators.docsText')}</p>
            </div>
            <div className={cardBaseClasses}>
              <div className="bg-blue-100/70 rounded-full p-3 mb-4">
                <ShieldAlert className="h-8 w-8 text-blue-600"/>
              </div>
              <h3 className="text-2xl font-semibold mb-2">{t('differentiators.risksTitle')}</h3>
              <p>{t('differentiators.risksText')}</p>
            </div>
            <div className={cardBaseClasses}>
              <div className="bg-blue-100/70 rounded-full p-3 mb-4">
                <Landmark className="h-8 w-8 text-blue-600"/>
              </div>
              <h3 className="text-2xl font-semibold mb-2">{t('differentiators.govTitle')}</h3>
              <p>{t('differentiators.govText')}</p>
            </div>
          </div>
        </section>

        <section id="faq" className="py-20 px-6 max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold mb-10 text-center">{t('faq.title')}</h2>
          <div className="space-y-8">
            <details className={detailsBaseClasses}>
              <summary className="font-semibold cursor-pointer text-lg">{t('faq.q1')}</summary>
              <p className="mt-2 text-gray-700">{t('faq.a1')}</p>
            </details>
            <details className={detailsBaseClasses}>
              <summary className="font-semibold cursor-pointer text-lg">{t('faq.q7')}</summary>
              <p className="mt-2 text-gray-700">{t('faq.a7')}</p>
            </details>
            <details className={detailsBaseClasses}>
              <summary className="font-semibold cursor-pointer text-lg">{t('faq.q2')}</summary>
              <p className="mt-2 text-gray-700">{t('faq.a2')}</p>
            </details>
            <details className={detailsBaseClasses}>
              <summary className="font-semibold cursor-pointer text-lg">{t('faq.q3')}</summary>
              <p className="mt-2 text-gray-700">{t('faq.a3')}</p>
            </details>
            <details className={detailsBaseClasses}>
              <summary className="font-semibold cursor-pointer text-lg">{t('faq.q8')}</summary>
              <p className="mt-2 text-gray-700">{t('faq.a8')}</p>
            </details>
            <details className={detailsBaseClasses}>
              <summary className="font-semibold cursor-pointer text-lg">{t('faq.q4')}</summary>
              <p className="mt-2 text-gray-700">{t('faq.a4')}</p>
            </details>
            <details className={detailsBaseClasses}>
              <summary className="font-semibold cursor-pointer text-lg">{t('faq.q5')}</summary>
              <p className="mt-2 text-gray-700">{t('faq.a5')}</p>
            </details>
            <details className={detailsBaseClasses}>
              <summary className="font-semibold cursor-pointer text-lg">{t('faq.q6')}</summary>
              <p className="mt-2 text-gray-700">{t('faq.a6')}</p>
            </details>
            <details className={detailsBaseClasses}>
              <summary className="font-semibold cursor-pointer text-lg">{t('faq.q9')}</summary>
              <p className="mt-2 text-gray-700">{t('faq.a9')}</p>
            </details>
          </div>
        </section>

        <section className="bg-slate-800 text-white text-center py-16">
          <h2 className="text-3xl font-bold mb-6">{t('cta.title')}</h2>
          <div className="space-x-4">
            <Button onClick={handleDemoClick} size="lg" className="btn-neu-dark rounded-full animate-subtle-breathing">
                {t('nav.demo')}
            </Button>
            <Button asChild size="lg" className="btn-neu-dark rounded-full">
                <a href="mailto:juan.ulian@pluscompol.com?subject=Solicitud%20de%20reuni%C3%B3n%20por%20MILA&body=Hola%20Juan%2C%0D%0A%0D%0AEstoy%20interesado%2Fa%20en%20coordinar%20una%20reuni%C3%B3n%20para%20conocer%20m%C3%A1s%20sobre%20la%20plataforma%20MILA%20y%20evaluar%20su%20implementaci%C3%B3n%20en%20nuestro%20gobierno.%0D%0AQuedo%20a%20disposici%C3%B3n%20para%20coordinar%20d%C3%ADa%20y%20horario.%0D%0A%0D%0AMuchas%20gracias.%0D%0A%0D%0ASaludos%2C%0D%0A">{t('cta.contact')}</a>
            </Button>
          </div>
        </section>
      </main>

      <footer className="bg-gray-900 text-gray-400 py-8">
        <div className="max-w-6xl mx-auto text-center text-sm flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-8 px-4">
            <p className="shrink-0">{t('footer.developedBy')}</p>
            <div className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-envelope flex-shrink-0" viewBox="0 0 16 16"><path d="M.05 3.555A2 2 0 0 1 2 2h12a2 2 0 0 1 1.95 1.555L8 8.414.05 3.555zM0 4.697v7.104l5.803-3.558L0 4.697zM6.761 8.83l-6.57 4.027A2 2 0 0 0 2 14h12a2 2 0 0 0 1.808-1.144l-6.57-4.027L8 9.586l-1.239-.757zm3.436-.586L16 11.803V4.697l-5.803 3.546z"/></svg>
              <a href="mailto:juan.ulian@pluscompol.com" className="hover:text-white truncate">juan.ulian@pluscompol.com</a>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 flex-shrink-0" />
              <a href="https://pluscompol.com" target="_blank" rel="noopener noreferrer" className="hover:text-white">{t('footer.website')}</a>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 flex-shrink-0" />
              <span>{t('footer.location')}</span>
            </div>
        </div>
      </footer>
    </div>
  );
}

    
