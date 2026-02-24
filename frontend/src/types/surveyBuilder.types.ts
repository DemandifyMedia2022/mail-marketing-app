export interface SurveyField {
  id: string;
  type: 'text' | 'email' | 'phone' | 'number' | 'textarea' | 'radio' | 'checkbox' | 'dropdown' | 'rating' | 'emoji' | 'yesno' | 'date' | 'file' | 'divider';
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
  order: number;
  hidden?: boolean;
}
