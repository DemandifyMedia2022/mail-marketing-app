export interface Survey {
  _id: string;
  title: string;
  description: string;
  category: 'Feedback' | 'Lead' | 'Product' | 'Support' | 'HR' | 'Other';
  status: 'Draft' | 'Active' | 'Inactive';
  expiryDate?: string;
  targetCampaign?: string;
  targetEmailTemplate?: string;
  questions: SurveyQuestion[];
  responses: SurveyResponse[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  metadata?: {
    lastModified?: string;
    modifiedBy?: string;
    version?: string;
    isTemplate?: boolean;
    usageCount?: number;
    tags?: string[];
    shareable?: boolean;
    copiedFrom?: string;
    copiedAt?: string;
    lastEmailed?: string;
    emailCount?: number;
  };
}

export interface SurveyQuestion {
  _id: string;
  type: 'text' | 'email' | 'phone' | 'number' | 'textarea' | 'radio' | 'checkbox' | 'dropdown' | 'rating' | 'emoji' | 'yesno' | 'date' | 'file' | 'divider';
  question: string;
  options?: string[];
  required: boolean;
  order: number;
  placeholder?: string;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
}

export interface SurveyResponse {
  _id: string;
  surveyId: string;
  respondentEmail?: string;
  answers: {
    questionId: string;
    answer: string | string[] | number;
  }[];
  submittedAt: string;
  ipAddress?: string;
}

export interface SurveyAnalytics {
  surveyId: string;
  totalResponses: number;
  completionRate: number;
  averageTime: number;
  responsesByDate: {
    date: string;
    count: number;
  }[];
  questionAnalytics: {
    questionId: string;
    question: string;
    type: string;
    responses: {
      answer: string;
      count: number;
      percentage: number;
    }[];
  }[];
}
