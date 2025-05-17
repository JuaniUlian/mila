import type React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface DocumentInputAreaProps {
  documentText: string;
  setDocumentText: (text: string) => void;
  isLoading: boolean;
}

export function DocumentInputArea({ documentText, setDocumentText, isLoading }: DocumentInputAreaProps) {
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>Document Content</CardTitle>
        <CardDescription>Paste your normative document text below for analysis.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid w-full gap-2">
          <Label htmlFor="document-text" className="sr-only">Document Text</Label>
          <Textarea
            id="document-text"
            placeholder="Enter document text here..."
            value={documentText}
            onChange={(e) => setDocumentText(e.target.value)}
            rows={15}
            className="min-h-[300px] resize-y text-base"
            disabled={isLoading}
            aria-label="Document text input area"
          />
        </div>
      </CardContent>
    </Card>
  );
}
