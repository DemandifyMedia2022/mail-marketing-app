const API_BASE_URL = 'http://localhost:5000';

export interface SurveyAnswer {
  questionId: string;
  question: string;
  answer: any;
  answerText?: string;
}

export interface SurveyResponseData {
  surveyId: string;
  emailId?: string;
  recipientEmail?: string;
  answers: SurveyAnswer[];
  ipAddress?: string;
  userAgent?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}

class SurveyResponseService {
  /**
   * Submit a survey response to MongoDB (requires valid emailId)
   */
  static async submitSurveyResponse(responseData: SurveyResponseData): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/surveys/responses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(responseData),
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to submit survey response');
      }

      return result;
    } catch (error) {
      console.error('Survey response submission error:', error);
      throw error;
    }
  }

  /**
   * Submit basic survey response to MongoDB (no emailId validation required)
   */
  static async submitBasicSurveyResponse(responseData: any): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/surveys/responses/basic`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(responseData),
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to submit basic survey response');
      }

      return result;
    } catch (error) {
      console.error('Basic survey response submission error:', error);
      throw error;
    }
  }

  /**
   * Submit survey preview response to MongoDB (no emailId validation required)
   */
  static async submitSurveyPreviewResponse(responseData: any): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/surveys/responses/preview`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(responseData),
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to submit survey preview response');
      }

      return result;
    } catch (error) {
      console.error('Survey preview response submission error:', error);
      throw error;
    }
  }

  /**
   * Get survey responses for a specific survey
   */
  static async getSurveyResponses(surveyId: string): Promise<ApiResponse<any[]>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/surveys/${surveyId}/responses`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch survey responses');
      }

      return result;
    } catch (error) {
      console.error('Get survey responses error:', error);
      throw error;
    }
  }

  /**
   * Get survey analytics
   */
  static async getSurveyAnalytics(surveyId: string): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/surveys/${surveyId}/analytics`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch survey analytics');
      }

      return result;
    } catch (error) {
      console.error('Get survey analytics error:', error);
      throw error;
    }
  }
}

export default SurveyResponseService;
