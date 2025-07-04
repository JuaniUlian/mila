
'use client';

import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import type { ButtonProps } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface FileUploadButtonProps extends ButtonProps {
  onFileSelect: (file: { name: string, content: string }) => void;
  children: React.ReactNode;
}

export function FileUploadButton({ onFileSelect, children, ...props }: FileUploadButtonProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        onFileSelect({ name: file.name, content: content || "No se pudo leer el contenido." });
      };
      reader.onerror = () => {
        toast({
            title: "Error de Lectura",
            description: "No se pudo leer el contenido del archivo.",
            variant: "destructive",
        });
      };
      reader.readAsText(file); // Reads the file as text
    }
    // Reset the input value to allow selecting the same file again
    if (event.target) {
        event.target.value = '';
    }
  };

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        aria-hidden="true"
        // Accept common document types
        accept=".txt,.pdf,.doc,.docx,.md"
      />
      <Button {...props} onClick={(e) => {
          props.onClick?.(e); // Propagate original onClick if it exists
          handleButtonClick();
        }}>
        {children}
      </Button>
    </>
  );
}
