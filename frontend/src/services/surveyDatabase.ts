// Survey Database Service
// Handles all survey form database operations

import type { Survey } from '../types/survey.types';

export interface SurveyForm {
  id: string;
  name: string;
  description: string;
  category: string;
  fields: any[];
  createdAt: string;
  updatedAt: string;
  usageCount: number;
  isFavorite: boolean;
  status: 'Draft' | 'Published' | 'Archived';
  originalSurvey?: any;
}

export interface SurveyQuestion {
  _id: string;
  type: string;
  question: string;
  required: boolean;
  order: number;
  options?: string[];
  placeholder?: string;
  validation?: any;
}

class SurveyDatabaseService {
  private static readonly DB_NAME = 'SurveyFormsDB';
  private static readonly STORE_NAME = 'surveyForms';
  private static readonly VERSION = 1;

  // Initialize database
  static async initDatabase(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, this.VERSION);
      
      request.onerror = () => {
        console.error('❌ Failed to open database:', request.error);
        reject(request.error);
      };
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        console.log('🔄 Database upgrade needed, creating object store...');
        
        // Create object store if it doesn't exist
        if (!db.objectStoreNames.contains(this.STORE_NAME)) {
          const objectStore = db.createObjectStore(this.STORE_NAME, { 
            keyPath: '_id',
            autoIncrement: false 
          });
          
          // Create indexes for better querying
          objectStore.createIndex('title', 'title', { unique: false });
          objectStore.createIndex('category', 'category', { unique: false });
          objectStore.createIndex('status', 'status', { unique: false });
          objectStore.createIndex('createdAt', 'createdAt', { unique: false });
          
          console.log('✅ Object store and indexes created');
        }
      };
      
      request.onsuccess = () => {
        console.log('✅ Database initialized successfully');
        resolve();
      };
      
      request.onblocked = () => {
        console.warn('⚠️ Database initialization blocked');
      };
    });
  }

  // Save survey to database
  static async saveSurvey(survey: Survey): Promise<void> {
    try {
      // Ensure database is initialized first
      await this.initDatabase();
      const db = await this.openDatabase();
      
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([this.STORE_NAME], 'readwrite');
        const store = transaction.objectStore(this.STORE_NAME);
        
        const request = store.put(survey);
        
        request.onsuccess = () => {
          console.log('✅ Survey saved to database:', survey._id);
          resolve();
        };
        
        request.onerror = () => {
          console.error('❌ Failed to save survey:', request.error);
          reject(request.error);
        };
      });
    } catch (error) {
      console.error('❌ Error in saveSurvey:', error);
      throw error;
    }
  }

  // Get all surveys from database
  static async getAllSurveys(): Promise<Survey[]> {
    try {
      // Ensure database is initialized first
      await this.initDatabase();
      const db = await this.openDatabase();
      
      return new Promise((resolve, reject) => {
        // Check if the store exists before creating transaction
        if (!db.objectStoreNames.contains(this.STORE_NAME)) {
          console.warn(`⚠️ Object store '${this.STORE_NAME}' not found, returning empty array`);
          resolve([]);
          return;
        }
        
        const transaction = db.transaction([this.STORE_NAME], 'readonly');
        const store = transaction.objectStore(this.STORE_NAME);
        
        const request = store.getAll();
        
        request.onsuccess = () => {
          const surveys = request.result;
          console.log('✅ Retrieved surveys from database:', surveys.length);
          resolve(surveys);
        };
        
        request.onerror = () => {
          console.error('❌ Failed to retrieve surveys:', request.error);
          reject(request.error);
        };
      });
    } catch (error) {
      console.error('❌ Error in getAllSurveys:', error);
      // Return empty array as fallback
      return [];
    }
  }

  // Get survey by ID
  static async getSurveyById(id: string): Promise<Survey | null> {
    try {
      // Ensure database is initialized first
      await this.initDatabase();
      const db = await this.openDatabase();
      
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([this.STORE_NAME], 'readonly');
        const store = transaction.objectStore(this.STORE_NAME);
        
        const request = store.get(id);
        
        request.onsuccess = () => {
          const survey = request.result;
          console.log('✅ Retrieved survey by ID:', survey?._id || 'Not found');
          resolve(survey || null);
        };
        
        request.onerror = () => {
          console.error('❌ Failed to get survey by ID:', request.error);
          reject(request.error);
        };
      });
    } catch (error) {
      console.error('❌ Database error in getSurveyById:', error);
      return null;
    }
  }

  // Delete survey by ID
  static async deleteSurvey(id: string): Promise<void> {
    try {
      // Ensure database is initialized first
      await this.initDatabase();
      const db = await this.openDatabase();
      
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([this.STORE_NAME], 'readwrite');
        const store = transaction.objectStore(this.STORE_NAME);
        
        const request = store.delete(id);
        
        request.onsuccess = () => {
          console.log('✅ Survey deleted successfully:', id);
          resolve();
        };
        
        request.onerror = () => {
          console.error('❌ Failed to delete survey:', request.error);
          reject(request.error);
        };
      });
    } catch (error) {
      console.error('❌ Database error in deleteSurvey:', error);
      throw error;
    }
  }

  // Search surveys by title or category
  static async searchSurveys(query: string, category?: string): Promise<Survey[]> {
    const surveys = await this.getAllSurveys();
    
    return surveys.filter(survey => {
      const matchesQuery = !query || 
        survey.title.toLowerCase().includes(query.toLowerCase()) ||
        survey.description.toLowerCase().includes(query.toLowerCase());
      
      const matchesCategory = !category || survey.category === category;
      
      return matchesQuery && matchesCategory;
    });
  }

  // Get surveys by category
  static async getSurveysByCategory(category: string): Promise<Survey[]> {
    const surveys = await this.getAllSurveys();
    
    return surveys.filter(survey => survey.category === category);
  }

  // Get surveys by status
  static async getSurveysByStatus(status: string): Promise<Survey[]> {
    const surveys = await this.getAllSurveys();
    
    return surveys.filter(survey => survey.status === status);
  }

  // Clear all surveys (for testing)
  static async clearAllSurveys(): Promise<void> {
    const db = await this.openDatabase();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.STORE_NAME], 'readwrite');
      const store = transaction.objectStore(this.STORE_NAME);
      
      const request = store.clear();
      
      request.onsuccess = () => {
        console.log('✅ All surveys cleared from database');
        resolve();
      };
      
      request.onerror = () => {
        console.error('❌ Failed to clear surveys:', request.error);
        reject(request.error);
      };
    });
  }

  // Helper method to open database
  private static async openDatabase(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, this.VERSION);
      
      request.onerror = () => {
        console.error('❌ Failed to open database:', request.error);
        reject(request.error);
      };
      
      request.onsuccess = () => {
        resolve(request.result);
      };
    });
  }

  // Convert Survey to SurveyForm for display
  static surveyToForm(survey: Survey): SurveyForm {
    return {
      id: survey._id,
      name: survey.title,
      description: survey.description,
      category: survey.category,
      fields: survey.questions || [],
      createdAt: survey.createdAt,
      updatedAt: survey.updatedAt,
      usageCount: Math.floor(Math.random() * 100), // Mock usage count
      isFavorite: false, // Mock favorite status
      status: survey.status as 'Draft' | 'Published' | 'Archived',
      originalSurvey: survey
    };
  }

  // Get database statistics
  static async getDatabaseStats(): Promise<{
    totalSurveys: number;
    draftSurveys: number;
    publishedSurveys: number;
    archivedSurveys: number;
  }> {
    const surveys = await this.getAllSurveys();
    
    return {
      totalSurveys: surveys.length,
      draftSurveys: surveys.filter(s => s.status === 'Draft').length,
      publishedSurveys: surveys.filter(s => s.status === 'Active').length,
      archivedSurveys: surveys.filter(s => s.status === 'Inactive').length
    };
  }
}

export default SurveyDatabaseService;
