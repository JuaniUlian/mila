
export type AlertLevel = 'grave' | 'media' | 'leve' | 'none';
export type SuggestionSeverity = 'high' | 'medium' | 'low';
export type SuggestionCategory = 'Legal' | 'Administrativa' | 'Redacción';

export interface Suggestion {
  id: string;
  text: string;
  justification: {
    legal: string; 
    technical: string; 
  };
  appliedNorm: string; 
  errorType: string; 
  estimatedConsequence: string; 
  status: 'pending' | 'applied' | 'discarded';
  completenessImpact: number; // How much applying this suggestion contributes to completeness
  severity: SuggestionSeverity;
  category: SuggestionCategory;
}

export interface DocumentBlock {
  id: string;
  name: string;
  category: string; 
  alertLevel: AlertLevel;
  completenessIndex: number; 
  maxCompleteness: number; 
  originalText: string;
  suggestions: Suggestion[];
  alerts: AlertItem[]; // Specific alerts for this block
  missingConnections: MissingConnection[]; // Specific missing connections for this block
  applicableNorms: ApplicableNorm[]; // Specific applicable norms for this block
  legalRisk?: string; // Specific legal risk for this block
}

export interface AlertItem {
  id: string;
  severity: Exclude<AlertLevel, 'none'>;
  description: string;
}

export interface MissingConnection {
  id:string;
  description: string; 
}

export interface ApplicableNorm {
  id: string;
  name: string; // e.g., "Ley 1150 de 2007"
  article: string; // e.g., "Art. 16"
  details?: string; // Optional further details or link
}

// Mock data representing the entire analyzed document
export interface MilaAppPData {
  documentTitle: string;
  overallComplianceScore: number; // Added for overall document score
  overallCompletenessIndex: number; // Added for overall document score
  blocks: DocumentBlock[];
}
