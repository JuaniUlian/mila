
'use client';

import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import type { ButtonProps } from '@/components/ui/button';

interface FileUploadButtonProps extends ButtonProps {
  onFileSelect: (file: File) => void;
  children: React.ReactNode;
}

export function FileUploadButton({ onFileSelect, children, ...props }: FileUploadButtonProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileSelect(file);
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
        // Accept common document types including zip
        accept=".txt,.pdf,.docx,.md,.zip"
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
