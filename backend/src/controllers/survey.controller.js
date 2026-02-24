import { Survey } from "../models/Survey.js";
import { SurveyResponse } from "../models/SurveyResponse.js";
import { BasicSurveyResponse } from "../models/BasicSurveyResponse.js";
import Email from "../models/Email.js";
import mongoose from "mongoose";

// Fix applied: Handle mixed ObjectId types for survey responses

/**
 * Create a new survey
 */
export const createSurvey = async (req, res) => {
  try {
    const { title, description, questions } = req.body;
    
    if (!title || !questions || questions.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Title and at least one question are required"
      });
    }

    // Validate questions
    for (const question of questions) {
      if (!question.question || !question.type) {
        return res.status(400).json({
          success: false,
          message: "Each question must have text and type"
        });
      }
      
      if (['radio', 'checkbox', 'dropdown'].includes(question.type) && 
          (!question.options || question.options.length === 0)) {
        return res.status(400).json({
          success: false,
          message: "Multiple choice questions must have options"
        });
      }
    }

    const survey = new Survey({
      title,
      description,
      questions: questions.map((q, index) => ({ ...q, order: index })),
      createdBy: req.user?.id || 'system' // Fallback for now
    });

    await survey.save();

    res.status(201).json({
      success: true,
      message: "Survey created successfully",
      data: survey
    });
  } catch (err) {
    console.error("Create survey error:", err);
    res.status(500).json({
      success: false,
      message: "Error creating survey"
    });
  }
};

/**
 * Get all surveys
 */
export const getSurveys = async (req, res) => {
  try {
    const surveys = await Survey.find({ isActive: true })
      .sort({ createdAt: -1 })
      .select('title description createdAt questionCount');

    const surveysWithCount = surveys.map(survey => ({
      ...survey.toObject(),
      questionCount: survey.questions.length
    }));

    res.json({
      success: true,
      data: surveysWithCount
    });
  } catch (err) {
    console.error("Get surveys error:", err);
    res.status(500).json({
      success: false,
      message: "Error fetching surveys"
    });
  }
};

/**
 * Get survey by ID
 */
export const getSurveyById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const survey = await Survey.findById(id);
    
    if (!survey) {
      return res.status(404).json({
        success: false,
        message: "Survey not found"
      });
    }

    res.json({
      success: true,
      data: survey
    });
  } catch (err) {
    console.error("Get survey error:", err);
    res.status(500).json({
      success: false,
      message: "Error fetching survey"
    });
  }
};

/**
 * Submit survey response
 */
export const submitSurveyResponse = async (req, res) => {
  try {
    const { surveyId, emailId, answers } = req.body;
    
    if (!surveyId || !emailId || !answers || answers.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Survey ID, email ID, and answers are required"
      });
    }

    // Verify survey exists
    const survey = await Survey.findById(surveyId);
    if (!survey) {
      return res.status(404).json({
        success: false,
        message: "Survey not found"
      });
    }

    // Verify email exists
    const email = await Email.findById(emailId);
    if (!email) {
      return res.status(404).json({
        success: false,
        message: "Email not found"
      });
    }

    // Check if already responded
    const existingResponse = await SurveyResponse.findOne({
      surveyId,
      emailId
    });

    if (existingResponse) {
      return res.status(400).json({
        success: false,
        message: "Survey already submitted for this email"
      });
    }

    // Create survey response
    const surveyResponse = new SurveyResponse({
      surveyId,
      emailId,
      recipientEmail: email.to,
      answers,
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
      completed: true
    });

    await surveyResponse.save();

    res.status(201).json({
      success: true,
      message: "Survey response submitted successfully",
      data: surveyResponse
    });
  } catch (err) {
    console.error("Submit survey response error:", err);
    res.status(500).json({
      success: false,
      message: "Error submitting survey response"
    });
  }
};

/**
 * Get survey responses
 */
export const getSurveyResponses = async (req, res) => {
  try {
    const { surveyId } = req.params;
    
    const responses = await SurveyResponse.find({ surveyId })
      .populate('emailId', 'to subject')
      .sort({ submittedAt: -1 });

    res.json({
      success: true,
      data: responses,
      total: responses.length
    });
  } catch (err) {
    console.error("Get survey responses error:", err);
    res.status(500).json({
      success: false,
      message: "Error fetching survey responses"
    });
  }
};

/**
 * Get survey analytics
 */
export const getSurveyAnalytics = async (req, res) => {
  try {
    const { surveyId } = req.params;
    
    const survey = await Survey.findById(surveyId);
    if (!survey) {
      return res.status(404).json({
        success: false,
        message: "Survey not found"
      });
    }

    const responses = await SurveyResponse.find({ surveyId });
    const totalResponses = responses.length;

    // Calculate analytics for each question
    const questionAnalytics = survey.questions.map(question => {
      const questionResponses = responses
        .map(response => response.answers.find(a => a.questionId.toString() === question._id.toString()))
        .filter(answer => answer !== undefined);

      let analytics = {
        question: question.question,
        type: question.type,
        totalResponses: questionResponses.length,
        data: {}
      };

      if (question.type === 'radio' || question.type === 'dropdown') {
        // Count options
        const optionCounts = {};
        question.options.forEach(option => {
          optionCounts[option] = 0;
        });
        
        questionResponses.forEach(response => {
          if (response.answer && optionCounts[response.answer] !== undefined) {
            optionCounts[response.answer]++;
          }
        });
        
        analytics.data = optionCounts;
      } else if (question.type === 'checkbox') {
        // Count checkbox selections
        const optionCounts = {};
        question.options.forEach(option => {
          optionCounts[option] = 0;
        });
        
        questionResponses.forEach(response => {
          if (Array.isArray(response.answer)) {
            response.answer.forEach(selected => {
              if (optionCounts[selected] !== undefined) {
                optionCounts[selected]++;
              }
            });
          }
        });
        
        analytics.data = optionCounts;
      } else if (question.type === 'rating') {
        // Calculate average rating
        const ratings = questionResponses
          .map(r => parseFloat(r.answer))
          .filter(r => !isNaN(r));
        
        if (ratings.length > 0) {
          analytics.data = {
            average: (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(2),
            distribution: {}
          };
          
          // Rating distribution
          for (let i = 1; i <= 5; i++) {
            analytics.data.distribution[i] = ratings.filter(r => r === i).length;
          }
        }
      } else if (question.type === 'yesno') {
        const yesCount = questionResponses.filter(r => r.answer === 'yes').length;
        const noCount = questionResponses.filter(r => r.answer === 'no').length;
        
        analytics.data = {
          yes: yesCount,
          no: noCount
        };
      } else if (question.type === 'text') {
        analytics.data = {
          responses: questionResponses.map(r => r.answerText || r.answer)
        };
      }

      return analytics;
    });

    res.json({
      success: true,
      data: {
        survey: {
          title: survey.title,
          description: survey.description,
          totalQuestions: survey.questions.length
        },
        totalResponses,
        questionAnalytics
      }
    });
  } catch (err) {
    console.error("Get survey analytics error:", err);
    res.status(500).json({
      success: false,
      message: "Error fetching survey analytics"
    });
  }
};

/**
 * Submit basic survey response
 */
export const submitBasicSurveyResponse = async (req, res) => {
  try {
    const { name, contact, interested, feedback, emailId, surveyId, recipientEmail } = req.body;
    
    if (!name || !contact || !feedback) {
      return res.status(400).json({
        success: false,
        message: "Name, contact, and feedback are required"
      });
    }

    // If emailId is provided, fetch the email to get recipient email and campaign
    let emailRecipientEmail = recipientEmail;
    let campaignId = null;
    if (emailId && !recipientEmail) {
      try {
        const email = await Email.findById(emailId);
        if (email) {
          emailRecipientEmail = email.recipient;
          campaignId = email.campaignId;
        }
      } catch (err) {
        console.error("Error fetching email:", err);
      }
    }

    const basicResponse = new BasicSurveyResponse({
      name,
      contact,
      interested: interested || false,
      feedback,
      emailId: emailId || null,
      campaignId: campaignId,
      surveyId: surveyId || 'basic-survey',
      recipientEmail: emailRecipientEmail,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    await basicResponse.save();

    res.status(201).json({
      success: true,
      message: "Basic survey response submitted successfully",
      data: basicResponse
    });
  } catch (err) {
    console.error("Submit basic survey response error:", err);
    res.status(500).json({
      success: false,
      message: "Error submitting basic survey response"
    });
  }
};

/**
 * Get basic survey responses
 */
export const getBasicSurveyResponses = async (req, res) => {
  try {
    const { surveyId = 'basic-survey', page = 1, limit = 50 } = req.query;
    
    const skip = (page - 1) * limit;
    
    const responses = await BasicSurveyResponse.find({ surveyId })
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('emailId', 'recipient subject')
      .populate('campaignId', 'name campaignNumber');

    const total = await BasicSurveyResponse.countDocuments({ surveyId });

    res.json({
      success: true,
      data: {
        responses,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (err) {
    console.error("Get basic survey responses error:", err);
    res.status(500).json({
      success: false,
      message: "Error fetching basic survey responses"
    });
  }
};

/**
 * Get basic survey responses by campaign and email
 */
export const getSurveyResponsesByCampaign = async (req, res) => {
  try {
    const { campaignId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    
    const skip = (page - 1) * limit;
    
    const responses = await BasicSurveyResponse.find({ campaignId })
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('emailId', 'recipient subject')
      .populate('campaignId', 'name campaignNumber');

    const total = await BasicSurveyResponse.countDocuments({ campaignId });

    res.json({
      success: true,
      data: {
        responses,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (err) {
    console.error("Get survey responses by campaign error:", err);
    res.status(500).json({
      success: false,
      message: "Error fetching survey responses by campaign"
    });
  }
};

/**
 * Get survey response by email ID
 */
export const getSurveyResponseByEmail = async (req, res) => {
  try {
    const { emailId } = req.params;
    
    const response = await BasicSurveyResponse.findOne({ emailId })
      .populate('emailId', 'recipient subject')
      .populate('campaignId', 'name campaignNumber');

    if (!response) {
      return res.json({
        success: true,
        data: null
      });
    }

    res.json({
      success: true,
      data: response
    });
  } catch (err) {
    console.error("Get survey response by email error:", err);
    res.status(500).json({
      success: false,
      message: "Error fetching survey response by email"
    });
  }
};

/**
 * Submit survey preview response (no email validation required)
 */
export const submitSurveyPreviewResponse = async (req, res) => {
  try {
    const { surveyId, recipientEmail, answers, title, description, questions } = req.body;
    
    console.log('📝 Submit survey preview request:', { surveyId, recipientEmail, answersCount: answers?.length });
    
    if (!surveyId || !answers || answers.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Survey ID and answers are required"
      });
    }

    let survey;
    
    // First try to find existing survey by various ID formats
    try {
      console.log('🔍 Looking for survey with ID:', surveyId);
      
      // Try to find by ObjectId only if it's a valid ObjectId
      if (mongoose.Types.ObjectId.isValid(surveyId)) {
        survey = await Survey.findById(surveyId);
        console.log('📝 findById result:', survey ? 'Found' : 'Not found');
      }
      
      if (!survey) {
        // Try to find by string _id field (for timestamp IDs)
        survey = await Survey.findOne({ _id: surveyId });
        console.log('📝 findOne(_id) result:', survey ? 'Found' : 'Not found');
      }
      
      if (!survey) {
        // Try to find by customId field (for timestamp IDs)
        survey = await Survey.findOne({ customId: surveyId });
        console.log('📝 findOne(customId) result:', survey ? 'Found' : 'Not found');
      }
      
      if (!survey) {
        // Try to find by custom id field
        survey = await Survey.findOne({ id: surveyId });
        console.log('📝 findOne(id) result:', survey ? 'Found' : 'Not found');
      }
    } catch (error) {
      console.error('❌ Error finding survey:', error);
    }
    
    // If survey doesn't exist, create it (for preview surveys created in frontend)
    if (!survey) {
      console.log('🆕 Creating new survey for preview:', surveyId);
      
      // Clean the questions data to remove _id fields that might cause issues
      const cleanedQuestions = (questions || []).map(q => {
        const { _id, ...questionWithoutId } = q;
        return {
          ...questionWithoutId,
          // Let MongoDB generate the _id for questions if not a valid ObjectId
          _id: _id && mongoose.Types.ObjectId.isValid(_id) ? _id : undefined
        };
      });
      
      // Create a basic survey object with the provided data or defaults
      const surveyData = {
        title: title || 'Preview Survey',
        description: description || 'Survey created via preview',
        questions: cleanedQuestions,
        isActive: true,
        createdBy: new mongoose.Types.ObjectId('507f1f77bcf86cd799439011'), // Default system user
        customId: surveyId // Store the frontend ID in customId
      };
      
      // Only set _id if it's a valid ObjectId, otherwise let MongoDB generate one
      if (mongoose.Types.ObjectId.isValid(surveyId)) {
        surveyData._id = surveyId;
      }
      
      survey = new Survey(surveyData);
      await survey.save();
      console.log('✅ New survey created:', survey._id);
    }
    
    console.log('✅ Survey found/created:', survey.title);
    console.log('🔍 Survey object details:', { _id: survey._id, customId: survey.customId, id: survey.id });

    // Create survey response without email validation
    // Always use the MongoDB ObjectId, not the custom timestamp ID
    const surveyObjectId = survey._id || survey.id;
    console.log('🎯 Using survey ObjectId for response:', surveyObjectId);

    const surveyResponse = new SurveyResponse({
      surveyId: surveyObjectId, // Use the actual ObjectId from the found/created survey
      emailId: null, // Make emailId optional for preview responses
      recipientEmail: recipientEmail || 'anonymous@example.com',
      answers: answers.map(answer => ({
        questionId: answer.questionId, // Keep as string for now
        question: answer.question,
        answer: answer.answer,
        answerText: answer.answerText
      })),
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
      completed: true
    });

    console.log('💾 Saving survey response...');
    await surveyResponse.save();
    console.log('✅ Survey response saved successfully');

    res.status(201).json({
      success: true,
      message: "Survey preview response submitted successfully",
      data: surveyResponse
    });
  } catch (err) {
    console.error("❌ Submit survey preview response error:", err);
    res.status(500).json({
      success: false,
      message: "Error submitting survey preview response",
      error: err.message
    });
  }
};
