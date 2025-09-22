
'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/context/LanguageContext';
import { useTranslations, type Language } from '@/lib/translations';
import { useLayout } from '@/context/LayoutContext';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { cn } from '@/lib/utils';

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const languages: { code: Language; name: string }[] = [
  { code: 'es', name: 'Español' },
  { code: 'en', name: 'English' },
];

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const { language, setLanguage } = useLanguage();
  const { theme, setTheme } = useLayout();
  const t = useTranslations(language);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn(
        "rounded-2xl shadow-lg border",
        theme === 'light' ? 'bg-white/95 text-foreground border-slate-200' : 'bg-slate-900/95 text-foreground border-slate-700',
        )}>
        <DialogHeader>
          <DialogTitle>{t('settingsDialog.title')}</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="language-select">{t('settingsDialog.languageLabel')}</Label>
            <Select value={language} onValueChange={(value) => setLanguage(value as Language)}>
              <SelectTrigger id="language-select" className={cn("w-full border-border/50", theme === 'light' ? 'bg-slate-100/80' : 'bg-slate-800/80')}>
                <SelectValue placeholder={t('settingsDialog.languagePlaceholder')} />
              </SelectTrigger>
              <SelectContent>
                {languages.map((lang) => (
                  <SelectItem key={lang.code} value={lang.code}>
                    {lang.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-3">
             <Label>Modo</Label>
              <RadioGroup
                value={theme}
                onValueChange={(value) => setTheme(value as 'light' | 'dark')}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="light" id="light-mode" />
                  <Label htmlFor="light-mode" className="font-normal">Claro</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="dark" id="dark-mode" />
                  <Label htmlFor="dark-mode" className="font-normal">Oscuro</Label>
                </div>
              </RadioGroup>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="ghost">
              {t('settingsDialog.close')}
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
