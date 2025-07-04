
'use client';

import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import type { ButtonProps } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import mammoth from 'mammoth';

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

      if (file.name.endsWith('.docx')) {
          reader.onload = (e) => {
              const arrayBuffer = e.target?.result;
              if (arrayBuffer) {
                  mammoth.extractRawText({ arrayBuffer: arrayBuffer as ArrayBuffer })
                      .then(result => {
                          onFileSelect({ name: file.name, content: result.value || "No se pudo extraer contenido del archivo .docx." });
                      })
                      .catch(err => {
                          console.error("Error al procesar .docx:", err);
                          toast({
                              title: "Error de Lectura",
                              description: "No se pudo leer el contenido del archivo .docx.",
                              variant: "destructive",
                          });
                      });
              }
          };
          reader.readAsArrayBuffer(file);
      } else if (file.name.endsWith('.pdf')) {
          onFileSelect({ name: file.name, content: `(Contenido de PDF simulado para '${file.name}'. La extracción de texto de PDF no está implementada en este prototipo.)` });
          toast({
              title: "Soporte limitado para PDF",
              description: "Se ha cargado el archivo PDF, pero la extracción de su contenido es simulada."
          });
      } else if (file.type.startsWith('text/')) {
          reader.onload = (e) => {
              const content = e.target?.result as string;
              onFileSelect({ name: file.name, content: content || "No se pudo leer el contenido." });
          };
          reader.readAsText(file);
      } else {
          onFileSelect({ name: file.name, content: `(Contenido de '${file.name}' no extraído. El tipo de archivo no es de texto plano.)` });
          toast({
              title: "Tipo de archivo no soportado",
              description: "Se ha cargado el archivo, pero su contenido no pudo ser leído como texto.",
              variant: "destructive"
          });
      }
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
        accept=".txt,.pdf,.docx,.md"
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
