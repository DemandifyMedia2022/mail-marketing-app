
import { useEffect, useState } from "react";
import { deleteCampaign } from "../services/emailService";
import CampaignAnalytics from "./CampaignAnalytics";
import SurveyResponsePopup from "../components/SurveyResponsePopup";
import FormSubmissionPopup from "../components/FormSubmissionPopup";
import axios from "axios";

interface CampaignDetailProps {
  campaignId: string;
  campaignName: string;
  campaignNumber?: number | null;
  onBack: () => void;
  onAnalyticsReport?: () => void;
}

interface CampaignAnalytics {
  metrics: {
    totalEmails: number;
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    bounced: number;
    failed: number;
    openRate: string;
    clickRate: string;
    bounceRate: string;
    deliveryRate: string;
    topTrackingLinks?: Array<{
      url: string;
      totalClicks: number;
      uniqueClicks: number;
    }>;
  };
  charts?: {
    statusChart: Array<{ name: string; value: number }>;
    timelineChart: Array<{ date: string; opens: number; clicks: number }>;
  };
  lastUpdated: string;
}

interface EmailAnalytics {
  messageId: string;
  recipient: string;
  templateName: string;
  status: string;
  openCount: number;
  clickCount: number;
  sentAt: string;
  updatedAt: string;
}

interface PaginatedEmails {
  emails: EmailAnalytics[];
  currentPage: number;
  totalPages: number;
  totalEmails: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export default function CampaignDetail({
  campaignId,
  campaignName,
  campaignNumber,
  onBack,
  onAnalyticsReport,
}: CampaignDetailProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [analyticsData, setAnalyticsData] = useState<CampaignAnalytics | null>(null);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [emailAnalytics, setEmailAnalytics] = useState<PaginatedEmails | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [emailsLoading, setEmailsLoading] = useState(false);
  const [surveyResponses, setSurveyResponses] = useState<{[key: string]: any}>({});
  const [selectedSurveyResponse, setSelectedSurveyResponse] = useState<any>(null);
  const [showSurveyPopup, setShowSurveyPopup] = useState(false);
  const [allSurveyResponses, setAllSurveyResponses] = useState<any[]>([]);
  const [surveyResponsesLoading, setSurveyResponsesLoading] = useState(false);
  const [surveyStats, setSurveyStats] = useState({
    totalResponses: 0,
    responseRate: '0%',
    interestedCount: 0,
    interestedRate: '0%'
  });

  // Landing page form submission states
  const [formSubmissions, setFormSubmissions] = useState<{[key: string]: any}>({});
  const [selectedFormSubmission, setSelectedFormSubmission] = useState<any>(null);
  const [showFormPopup, setShowFormPopup] = useState(false);
  const [allFormSubmissions, setAllFormSubmissions] = useState<any[]>([]);
  const [formSubmissionsLoading, setFormSubmissionsLoading] = useState(false);
  const [formStats, setFormStats] = useState({
    totalSubmissions: 0,
    submissionRate: '0%',
    uniqueSubmitters: 0,
    conversionRate: '0%'
  });
  const [acknowledgements, setAcknowledgements] = useState<any[]>([]);
  const [acknowledgementsLoading, setAcknowledgementsLoading] = useState(false);
  const [acknowledgementStats, setAcknowledgementStats] = useState({
    totalViews: 0,
    uniqueViews: 0,
    avgTimeSpent: 0
  });
  const [landingPageClicks, setLandingPageClicks] = useState<any[]>([]);
  const [landingPageClicksLoading, setLandingPageClicksLoading] = useState(false);

  const title = campaignNumber
    ? `#${campaignNumber} - ${campaignName || "(No name)"}`
    : campaignName || "(No name)";

  // Fetch campaign content and analytics
  const fetchCampaignData = async () => {
    if (!campaignId || campaignId === 'undefined') {
      setError("Invalid campaign ID");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const API_URL = "http://localhost:5000/api/emails";
      
      // Fetch analytics data
      const analyticsResponse = await fetch(`${API_URL}/campaigns/${campaignId}/analytics`);
      if (analyticsResponse.ok) {
        const analyticsResult = await analyticsResponse.json();
        if (analyticsResult.success) {
          setAnalyticsData(analyticsResult.data);
        }
      }

      // Fetch email analytics for current page
      await fetchEmailAnalytics(currentPage);

      // Fetch acknowledgements
      await fetchAcknowledgements();

      // Fetch landing page clicks
      await fetchLandingPageClicks();

      setLastRefresh(new Date());
    } catch (err: any) {
      console.error("Campaign data fetch error:", err);
      setError(`Failed to load campaign data: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Fetch email analytics with pagination
  const fetchEmailAnalytics = async (page: number = 1) => {
    setEmailsLoading(true);
    try {
      // Use network IP for accessibility from other systems
      const API_URL = "http://localhost:5000/api/emails";
      const response = await fetch(`${API_URL}/campaigns/${campaignId}/emails?page=${page}&limit=25`);
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setEmailAnalytics(data.data);
          setCurrentPage(page);
          // Update analytics data with metrics from email analytics
          if (data.data.metrics) {
            setAnalyticsData({
              metrics: data.data.metrics,
              lastUpdated: new Date().toISOString()
            });
          }
          // Load survey responses for the emails on this page
          if (data.data.emails && data.data.emails.length > 0) {
            const promises = data.data.emails.map((email: any) => fetchSurveyResponse(email.messageId));
            await Promise.all(promises);
          }
        }
      }
    } catch (err: any) {
      console.error("Email analytics fetch error:", err);
      setError(`Failed to load email analytics: ${err.message}`);
    } finally {
      setEmailsLoading(false);
    }
  };

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && emailAnalytics && newPage <= emailAnalytics.totalPages) {
      fetchEmailAnalytics(newPage);
    }
  };

  // Helper function to format date/time
  const formatDateTime = (dateString: string) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return date.toLocaleString();
    } catch {
      return '-';
    }
  };

  // Helper function to get status color
  const getStatusColor = (status: string) => {
    const statusColors: { [key: string]: string } = {
      'sent': '#4CAF50',
      'delivered': '#2196F3',
      'opened': '#FF9800',
      'clicked': '#9C27B0',
      'bounced': '#F44336',
      'failed': '#9E9E9E',
      'pending': '#FFC107',
      'queued': '#607D8B'
    };
    return statusColors[status.toLowerCase()] || '#666666';
  };

  // Fetch survey response for a specific email
  const fetchSurveyResponse = async (emailId: string) => {
    try {
      // Use network IP for accessibility from other systems
      const response = await axios.get(`http://localhost:5000/api/surveys/email/${emailId}/response`);
      if (response.data.success && response.data.data) {
        setSurveyResponses(prev => ({
          ...prev,
          [emailId]: response.data.data
        }));
      }
    } catch (error) {
      console.error('Error fetching survey response:', error);
    }
  };

  // Fetch acknowledgements for the campaign
  const fetchAcknowledgements = async () => {
    setAcknowledgementsLoading(true);
    try {
      const response = await axios.get(`http://localhost:5000/api/landing-pages/campaign/${campaignId}/acknowledgements`);
      if (response.data.success) {
        setAcknowledgements(response.data.data);
        
        // Calculate stats
        const totalViews = response.data.data.length;
        const uniqueViews = response.data.data.filter((ack: any) => ack.isUnique).length;
        const avgTimeSpent = response.data.data.reduce((sum: number, ack: any) => sum + (ack.timeSpent || 0), 0) / totalViews || 0;
        
        setAcknowledgementStats({
          totalViews,
          uniqueViews,
          avgTimeSpent: Math.round(avgTimeSpent)
        });
      }
    } catch (error) {
      console.error('Error fetching acknowledgements:', error);
    } finally {
      setAcknowledgementsLoading(false);
    }
  };

  // Fetch landing page clicks for the campaign
  const fetchLandingPageClicks = async () => {
    setLandingPageClicksLoading(true);
    try {
      const response = await axios.get(`http://localhost:5000/api/emails/campaigns/${campaignId}/landing-page-clicks`);
      if (response.data.success) {
        setLandingPageClicks(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching landing page clicks:', error);
    } finally {
      setLandingPageClicksLoading(false);
    }
  };

  // Handle survey response click
  const handleSurveyResponseClick = async (emailId: string) => {
    if (surveyResponses[emailId]) {
      setSelectedSurveyResponse(surveyResponses[emailId]);
      setShowSurveyPopup(true);
    } else {
      // Fetch if not already loaded
      await fetchSurveyResponse(emailId);
      // Check again after fetching
      setTimeout(() => {
        if (surveyResponses[emailId]) {
          setSelectedSurveyResponse(surveyResponses[emailId]);
          setShowSurveyPopup(true);
        }
      }, 100);
    }
  };

  // Fetch all survey responses for the campaign
  const fetchAllSurveyResponses = async () => {
    setSurveyResponsesLoading(true);
    try {
      // Use network IP for accessibility from other systems
      const response = await fetch(`http://localhost:5000/api/surveys/responses/basic`);
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data.responses) {
          // Filter responses for this campaign - handle ObjectId object structure
          const campaignResponses = data.data.responses.filter((response: any) => {
            // Handle both string and ObjectId object formats
            if (response.campaignId) {
              // If campaignId is an object (ObjectId), get its _id as string
              if (typeof response.campaignId === 'object' && response.campaignId._id) {
                return String(response.campaignId._id) === campaignId;
              }
              // If campaignId is already a string
              return String(response.campaignId) === campaignId;
            }
            return false;
          });
          setAllSurveyResponses(campaignResponses);
          
          // Calculate survey statistics based on campaign-specific responses only
          const totalResponses = campaignResponses.length;
          const interestedCount = campaignResponses.filter((r: any) => r.interested).length;
          const totalEmails = analyticsData?.metrics?.totalEmails || 0;
          const responseRate = totalEmails > 0 
            ? `${((totalResponses / totalEmails) * 100).toFixed(1)}%`
            : '0%';
          const interestedRate = totalResponses > 0
            ? `${((interestedCount / totalResponses) * 100).toFixed(1)}%`
            : '0%';
          
          setSurveyStats({
            totalResponses,
            responseRate,
            interestedCount,
            interestedRate
          });
          
          console.log(`📊 Campaign ${campaignId} Survey Stats:`, {
            totalResponses,
            interestedCount,
            responseRate,
            interestedRate,
            totalCampaignResponses: campaignResponses.length
          });
        }
      }
    } catch (error) {
      console.error('Error fetching all survey responses:', error);
    } finally {
      setSurveyResponsesLoading(false);
    }
  };

  // Load survey responses for all emails in current page
  const loadSurveyResponses = async () => {
    if (emailAnalytics && emailAnalytics.emails.length > 0) {
      const promises = emailAnalytics.emails.map(email => fetchSurveyResponse(email.messageId));
      await Promise.all(promises);
    }
  };

  // Fetch form submission for a specific landing page
  const fetchFormSubmission = async (landingPageId: string) => {
    try {
      // Use network IP for accessibility from other systems
      const response = await axios.get(`http://localhost:5000/api/landing-pages/${landingPageId}/form-submissions`);
      if (response.data.success && response.data.data) {
        setFormSubmissions(prev => ({
          ...prev,
          [landingPageId]: response.data.data
        }));
      }
    } catch (error) {
      console.error('Error fetching form submissions:', error);
    }
  };

  // Handle form submission click
  const handleFormSubmissionClick = async (landingPageId: string) => {
    if (formSubmissions[landingPageId]) {
      setSelectedFormSubmission(formSubmissions[landingPageId]);
      setShowFormPopup(true);
    } else {
      // Fetch if not already loaded
      await fetchFormSubmission(landingPageId);
      // Check again after fetching
      setTimeout(() => {
        if (formSubmissions[landingPageId]) {
          setSelectedFormSubmission(formSubmissions[landingPageId]);
          setShowFormPopup(true);
        }
      }, 100);
    }
  };

  // Fetch all form submissions for the campaign
  const fetchAllFormSubmissions = async () => {
    setFormSubmissionsLoading(true);
    try {
      // Use network IP for accessibility from other systems
      const response = await fetch(`http://localhost:5000/api/landing-pages/campaign/${campaignId}/form-submissions`);
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          // Filter submissions for this specific campaign
          const campaignSubmissions = data.data.filter((submission: any) => 
            submission.campaignId === campaignId
          );
          setAllFormSubmissions(campaignSubmissions);
          
          // Calculate form statistics based on campaign-specific submissions only
          const totalSubmissions = campaignSubmissions.length;
          const uniqueSubmitters = new Set(campaignSubmissions.map((s: any) => s.recipientEmail)).size;
          const totalEmails = analyticsData?.metrics?.totalEmails || 0;
          
          const submissionRate = totalEmails > 0 
            ? `${((totalSubmissions / totalEmails) * 100).toFixed(1)}%`
            : '0%';
          
          const conversionRate = totalSubmissions > 0 
            ? `${((uniqueSubmitters / totalSubmissions) * 100).toFixed(1)}%`
            : '0%';
          
          setFormStats({
            totalSubmissions,
            submissionRate,
            uniqueSubmitters,
            conversionRate
          });
          
          console.log(`📊 Campaign ${campaignId} Form Stats:`, {
            totalSubmissions,
            uniqueSubmitters,
            submissionRate,
            conversionRate,
            totalCampaignSubmissions: campaignSubmissions.length
          });
        }
      }
    } catch (error) {
      console.error('Error fetching all form submissions:', error);
    } finally {
      setFormSubmissionsLoading(false);
    }
  };

  // Auto-refresh every 5 minutes
  useEffect(() => {
    fetchCampaignData();
  }, [campaignId]);

  // Fetch survey responses after analytics data is available
  useEffect(() => {
    if (analyticsData) {
      fetchAllSurveyResponses();
      fetchAllFormSubmissions();
    }
  }, [analyticsData, campaignId]);
  
  // Set up interval for refreshing both data
  useEffect(() => {
    const interval = setInterval(() => {
      fetchCampaignData();
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [campaignId]);

  const handleDeleteCampaign = async () => {
    if (!confirm("Are you sure you want to delete this campaign? This action cannot be undone.")) {
      return;
    }

    setLoading(true);
    try {
      await deleteCampaign(campaignId);
      onBack();
    } catch (err: any) {
      setError("Failed to delete campaign");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'transparent',
      padding: '20px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* Header Section */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '24px',
       
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={onBack}
              style={{
                background: '#4F46E5',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '10px 16px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.background = '#4338CA'}
              onMouseOut={(e) => e.currentTarget.style.background = '#4F46E5'}
            >
              ← Back
            </button>
            <div>
              <h1 style={{
                margin: 0,
                fontSize: '28px',
                fontWeight: '700',
                color: '#1F2937',
                lineHeight: '1.2'
              }}>
                {title}
              </h1>
              {lastRefresh && (
                <p style={{
                  margin: '4px 0 0 0',
                  fontSize: '12px',
                  color: '#6B7280'
                }}>
                  Last updated: {lastRefresh.toLocaleTimeString()}
                </p>
              )}
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={onAnalyticsReport || (() => setShowAnalytics(!showAnalytics))}
              style={{
                background: '#059669',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '10px 16px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.background = '#047857'}
              onMouseOut={(e) => e.currentTarget.style.background = '#059669'}
            >
              📊 Analytics Report
            </button>
            <button
              onClick={handleDeleteCampaign}
              disabled={loading}
              style={{
                background: '#DC2626',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '10px 16px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                opacity: loading ? 0.6 : 1,
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => !loading && (e.currentTarget.style.background = '#B91C1C')}
              onMouseOut={(e) => !loading && (e.currentTarget.style.background = '#DC2626')}
            >
              🗑️ Delete Campaign
            </button>
          </div>
        </div>
      </div>

      {/* Analytics Section */}
      {showAnalytics && analyticsData && (
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '24px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
        }}>
          <h2 style={{
            margin: '0 0 20px 0',
            fontSize: '20px',
            fontWeight: '600',
            color: '#1F2937'
          }}>
            📊 Campaign Analytics
          </h2>
          
          {/* Metrics Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '16px',
            marginBottom: '24px'
          }}>
            {[
              { label: 'Total Emails', value: analyticsData.metrics?.totalEmails || 0, color: '#4F46E5' },
              { label: 'Sent', value: analyticsData.metrics?.sent || 0, color: '#059669' },
              { label: 'Delivered', value: analyticsData.metrics?.delivered || 0, color: '#10B981' },
              { label: 'Opened', value: analyticsData.metrics?.opened || 0, color: '#F59E0B' },
              { label: 'Clicked', value: analyticsData.metrics?.clicked || 0, color: '#8B5CF6' },
              { label: 'Bounced', value: analyticsData.metrics?.bounced || 0, color: '#EF4444' },
              { label: 'Failed', value: analyticsData.metrics?.failed || 0, color: '#DC2626' },
            ].map((metric, index) => (
              <div key={index} style={{
                background: 'white',
                borderRadius: '12px',
                padding: '16px',
                textAlign: 'center',
                border: `2px solid ${metric.color}20`,
                transition: 'transform 0.2s, box-shadow 0.2s'
              }}>
                <div style={{
                  fontSize: '12px',
                  color: '#6B7280',
                  marginBottom: '4px',
                  fontWeight: '500'
                }}>
                  {metric.label}
                </div>
                <div style={{
                  fontSize: '24px',
                  fontWeight: '700',
                  color: metric.color
                }}>
                  {metric.value.toLocaleString()}
                </div>
              </div>
            ))}
          </div>

          {/* Rates */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px'
          }}>
            {[
              { label: 'Open Rate', value: analyticsData.metrics?.openRate || '0%', color: '#F59E0B' },
              { label: 'Click Rate', value: analyticsData.metrics?.clickRate || '0%', color: '#8B5CF6' },
              { label: 'Bounce Rate', value: analyticsData.metrics?.bounceRate || '0%', color: '#EF4444' },
            ].map((rate, index) => (
              <div key={index} style={{
                background: `linear-gradient(35deg, ${rate.color}1, ${rate.color}2)`,
                borderRadius: '12px',
                padding: '16px',
                border: `1px solid ${rate.color}30`
              }}>
                <div style={{
                  fontSize: '14px',
                  color: '#6B7280',
                  marginBottom: '4px'
                }}>
                  {rate.label}
                </div>
                <div style={{
                  fontSize: '20px',
                  fontWeight: '600',
                  color: rate.color
                }}>
                  {rate.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Campaign Statistics Blocks */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '24px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
      }}>
        <h2 style={{
          margin: '0 0 20px 0',
          fontSize: '20px',
          fontWeight: '600',
          color: '#1F2937'
        }}>
          � Campaign Statistics
        </h2>

        {analyticsData ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px'
          }}>
            {[
              {
                label: 'Total Emails',
                count: analyticsData.metrics?.totalEmails || 0,
                rate: '100%',
                color: '#4F46E5',
                icon: '📧'
              },
              {
                label: 'Sent',
                count: analyticsData.metrics?.sent || 0,
                rate: analyticsData.metrics?.deliveryRate || '0%',
                color: '#059669',
                icon: '📤'
              },
              {
                label: 'Delivered',
                count: analyticsData.metrics?.delivered || 0,
                rate: analyticsData.metrics?.deliveryRate || '0%',
                color: '#10B981',
                icon: '✅'
              },
              {
                label: 'Opened',
                count: analyticsData.metrics?.opened || 0,
                rate: analyticsData.metrics?.openRate || '0%',
                color: '#F59E0B',
                icon: '👁️'
              },
              {
                label: 'Clicked',
                count: analyticsData.metrics?.clicked || 0,
                rate: analyticsData.metrics?.clickRate || '0%',
                color: '#8B5CF6',
                icon: '🔗'
              },
              {
                label: 'Bounced',
                count: analyticsData.metrics?.bounced || 0,
                rate: analyticsData.metrics?.bounceRate || '0%',
                color: '#EF4444',
                icon: '↩️'
              },
              {
                label: 'Failed',
                count: analyticsData.metrics?.failed || 0,
                rate: analyticsData.metrics?.totalEmails > 0 
                  ? `${((analyticsData.metrics?.failed || 0) / analyticsData.metrics?.totalEmails * 100).toFixed(1)}%`
                  : '0%',
                color: '#DC2626',
                icon: '❌'
              },
              {
                label: 'Survey Responses',
                count: surveyStats.totalResponses,
                rate: surveyStats.responseRate,
                color: '#06B6D4',
                icon: '📋'
              },
              {
                label: 'Interested',
                count: surveyStats.interestedCount,
                rate: surveyStats.interestedRate,
                color: '#F97316',
                icon: '⭐'
              },
              {
                label: 'Form Submissions',
                count: formStats.totalSubmissions,
                rate: formStats.submissionRate,
                color: '#10B981',
                icon: '📝'
              },
              {
                label: 'Unique Submitters',
                count: formStats.uniqueSubmitters,
                rate: formStats.conversionRate,
                color: '#8B5CF6',
                icon: '👥'
              }
            ].map((stat, index) => (
              <div key={index} style={{
                background: 'white',
                borderRadius: '12px',
                padding: '20px',
                border: `2px solid ${stat.color}20`,
                transition: 'transform 0.2s, box-shadow 0.2s',
                cursor: 'pointer'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '12px'
                }}>
                  <span style={{ fontSize: '24px', marginRight: '8px' }}>{stat.icon}</span>
                  <div style={{
                    fontSize: '12px',
                    color: '#6B7280',
                    fontWeight: '500',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    {stat.label}
                  </div>
                </div>
                
                <div style={{
                  fontSize: '28px',
                  fontWeight: '700',
                  color: stat.color,
                  marginBottom: '4px'
                }}>
                  {stat.count.toLocaleString()}
                </div>
                
                <div style={{
                  fontSize: '16px',
                  color: stat.color,
                  fontWeight: '600',
                  marginBottom: '12px'
                }}>
                  {stat.rate}
                </div>

                {/* Progress Bar */}
                <div style={{
                  width: '100%',
                  height: '6px',
                  backgroundColor: '#E5E7EB',
                  borderRadius: '3px',
                  marginTop: '12px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${parseFloat(stat.rate)}%`,
                    height: '100%',
                    backgroundColor: stat.color,
                    borderRadius: '3px',
                    transition: 'width 0.3s ease'
                  }}></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{
            textAlign: 'center',
            padding: '40px',
            color: '#6B7280'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📊</div>
            <p>No campaign statistics available</p>
          </div>
        )}
      </div>

      {/* Landing Page Acknowledgements Section */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '24px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
      }}>
        <h2 style={{
          margin: '0 0 20px 0',
          fontSize: '20px',
          fontWeight: '600',
          color: '#1F2937'
        }}>
          📄 Landing Page Acknowledgements
        </h2>
        
        {acknowledgementsLoading ? (
          <div style={{ textAlign: 'center', padding: '20px', color: '#6B7280' }}>
            Loading acknowledgements...
          </div>
        ) : acknowledgements.length > 0 ? (
          <div>
            {/* Acknowledgement Stats */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: '16px',
              marginBottom: '20px'
            }}>
              <div style={{
                background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
                color: 'white',
                padding: '16px',
                borderRadius: '12px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '24px', fontWeight: '700', marginBottom: '4px' }}>
                  {acknowledgementStats.totalViews}
                </div>
                <div style={{ fontSize: '14px', opacity: 0.9 }}>Total Views</div>
              </div>
              
              <div style={{
                background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                color: 'white',
                padding: '16px',
                borderRadius: '12px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '24px', fontWeight: '700', marginBottom: '4px' }}>
                  {acknowledgementStats.uniqueViews}
                </div>
                <div style={{ fontSize: '14px', opacity: 0.9 }}>Unique Views</div>
              </div>
              
              <div style={{
                background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                color: 'white',
                padding: '16px',
                borderRadius: '12px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '24px', fontWeight: '700', marginBottom: '4px' }}>
                  {acknowledgementStats.avgTimeSpent}s
                </div>
                <div style={{ fontSize: '14px', opacity: 0.9 }}>Avg. Time</div>
              </div>
            </div>

            {/* Recent Acknowledgements */}
            <div style={{ marginBottom: '16px' }}>
              <h3 style={{
                margin: '0 0 12px 0',
                fontSize: '16px',
                fontWeight: '600',
                color: '#374151'
              }}>
                Recent Acknowledgements
              </h3>
              <div style={{ display: 'grid', gap: '8px' }}>
                {acknowledgements.slice(0, 5).map((ack: any, index: number) => (
                  <div key={index} style={{
                    background: 'white',
                    borderRadius: '8px',
                    padding: '12px',
                    border: '1px solid #E5E7EB',
                    fontSize: '14px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div>
                      <div style={{ fontWeight: '500', color: '#374151', marginBottom: '2px' }}>
                        {ack.recipientEmail || 'Anonymous'}
                      </div>
                      <div style={{ color: '#6B7280', fontSize: '12px' }}>
                        {new Date(ack.acknowledgedAt).toLocaleString()} • {ack.device || 'Unknown'} • {ack.browser || 'Unknown'}
                      </div>
                    </div>
                    <div style={{
                      background: ack.isUnique ? '#10B981' : '#F59E0B',
                      color: 'white',
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: '11px',
                      fontWeight: '500'
                    }}>
                      {ack.isUnique ? 'Unique' : 'Return'}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {acknowledgements.length > 5 && (
              <div style={{ textAlign: 'center', color: '#6B7280', fontSize: '14px' }}>
                Showing 5 of {acknowledgements.length} total acknowledgements
              </div>
            )}
          </div>
        ) : (
          <div style={{
            textAlign: 'center',
            padding: '40px',
            color: '#6B7280'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📄</div>
            <p>No landing page acknowledgements yet</p>
            <p style={{ fontSize: '14px', marginTop: '8px' }}>
              Create landing pages and share them with your campaign to track acknowledgements.
            </p>
          </div>
        )}
      </div>

      {/* Landing Page Clicks Section */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '24px',
        border: '1px solid rgba(255, 255, 255, 0.2)'
      }}>
        <h2 style={{
          margin: '0 0 20px 0',
          fontSize: '20px',
          fontWeight: '600',
          color: '#1F2937'
        }}>
          🎯 Landing Page Clicks
        </h2>
        
        {landingPageClicksLoading ? (
          <div style={{ textAlign: 'center', padding: '20px', color: '#6B7280' }}>
            Loading landing page clicks...
          </div>
        ) : landingPageClicks.length > 0 ? (
          <div>
            {/* Click Stats */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: '16px',
              marginBottom: '24px'
            }}>
              <div style={{
                background: 'white',
                padding: '16px',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '24px', fontWeight: '700', marginBottom: '4px' }}>
                  {landingPageClicks.length}
                </div>
                <div style={{ fontSize: '14px', opacity: 0.9 }}>Total Clicks</div>
              </div>
              
              <div style={{
                background: 'white',
                padding: '16px',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '24px', fontWeight: '700', marginBottom: '4px' }}>
                  {new Set(landingPageClicks.map(click => click.emailId?.to)).size}
                </div>
                <div style={{ fontSize: '14px', opacity: 0.9 }}>Unique Clickers</div>
              </div>
            </div>

            {/* Recent Clicks */}
            <div style={{ marginBottom: '16px' }}>
              <h3 style={{
                margin: '0 0 12px 0',
                fontSize: '16px',
                fontWeight: '600',
                color: '#374151'
              }}>
                Recent Landing Page Clicks
              </h3>
              <div style={{ display: 'grid', gap: '8px' }}>
                {landingPageClicks.slice(0, 5).map((click: any, index: number) => (
                  <div key={index} style={{
                    background: 'white',
                    borderRadius: '8px',
                    padding: '12px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '14px'
                  }}>
                    <div>
                      <div style={{ fontWeight: '500', color: '#1F2937' }}>
                        {click.emailId?.to || 'Unknown'}
                      </div>
                      <div style={{ color: '#6B7280', fontSize: '12px' }}>
                        {new Date(click.timestamp).toLocaleString()}
                      </div>
                    </div>
                    <div style={{
                      background: '#10B981',
                      color: 'white',
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '500'
                    }}>
                      Clicked
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {landingPageClicks.length > 5 && (
              <div style={{ textAlign: 'center', color: '#6B7280', fontSize: '14px' }}>
                Showing 5 of {landingPageClicks.length} total clicks
              </div>
            )}
          </div>
        ) : (
          <div style={{
            textAlign: 'center',
            padding: '40px',
            color: '#6B7280'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎯</div>
            <p>No landing page clicks yet</p>
            <p style={{ fontSize: '14px', marginTop: '8px' }}>
              Add landing page links to your emails to track clicks.
            </p>
          </div>
        )}
      </div>

      {/* Top Tracking Links Section */}
      {analyticsData?.metrics?.topTrackingLinks && analyticsData.metrics.topTrackingLinks.length > 0 && (
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '24px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
        }}>
          <h2 style={{
            margin: '0 0 20px 0',
            fontSize: '20px',
            fontWeight: '600',
            color: '#1F2937'
          }}>
            🔗 Top Tracking Links
          </h2>
          
          <div style={{ display: 'grid', gap: '12px' }}>
            {analyticsData.metrics.topTrackingLinks.map((link: any, index: number) => (
              <div key={index} style={{
                background: 'white',
                borderRadius: '8px',
                padding: '16px',
                border: '1px solid #E5E7EB',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div style={{ flex: 1, marginRight: '16px' }}>
                  <div style={{
                    fontSize: '14px',
                    color: '#374151',
                    fontWeight: '500',
                    marginBottom: '4px',
                    wordBreak: 'break-all'
                  }}>
                    {link.url}
                  </div>
                  <div style={{
                    fontSize: '12px',
                    color: '#6B7280'
                  }}>
                    {link.uniqueClicks} unique clicks
                  </div>
                </div>
                
                <div style={{
                  textAlign: 'right',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-end'
                }}>
                  <div style={{
                    fontSize: '18px',
                    fontWeight: '700',
                    color: '#8B5CF6',
                    marginBottom: '2px'
                  }}>
                    {link.totalClicks}
                  </div>
                  <div style={{
                    fontSize: '12px',
                    color: '#6B7280'
                  }}>
                    total clicks
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Email Analytics Table Section */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '24px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
      }}>
        <h2 style={{
          margin: '0 0 20px 0',
          fontSize: '20px',
          fontWeight: '600',
          color: '#1F2937'
        }}>
          📊 Email Analytics (Recent 25 emails)
        </h2>

        {emailsLoading ? (
          <div style={{
            textAlign: 'center',
            padding: '40px',
            color: '#6B7280'
          }}>
            <div style={{
              width: '30px',
              height: '30px',
              border: '3px solid #E5E7EB',
              borderTop: '3px solid #4F46E5',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 16px'
            }}></div>
            <p>Loading email analytics...</p>
          </div>
        ) : emailAnalytics && emailAnalytics.emails.length > 0 ? (
          <>
            {/* Table */}
            <div style={{
              background: 'white',
              borderRadius: '12px',
              border: '1px solid #E5E7EB',
              overflow: 'hidden'
            }}>
              {/* Table Header */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '2fr 1.5fr 1fr 1fr 0.8fr 0.8fr 1.2fr 1.2fr 1.2fr',
                background: '#F9FAFB',
                padding: '16px',
                borderBottom: '1px solid #E5E7EB',
                fontSize: '12px',
                fontWeight: '600',
                color: '#6B7280',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                <div>Recipient</div>
                <div>Template</div>
                <div>Status</div>
                <div>Opens</div>
                <div>Clicks</div>
                <div>Survey Response</div>
                <div>Sent At</div>
                <div>Updated At</div>
              </div>

              {/* Table Body */}
              {emailAnalytics.emails.map((email, index) => (
                <div key={email.messageId || index} style={{
                  display: 'grid',
                  gridTemplateColumns: '2fr 1.5fr 1fr 1fr 0.8fr 0.8fr 1.2fr 1.2fr 1.2fr',
                  padding: '16px',
                  borderBottom: index < emailAnalytics.emails.length - 1 ? '1px solid #F3F4F6' : 'none',
                  fontSize: '14px',
                  color: '#374151',
                  transition: 'background-color 0.2s'
                }}>
                  <div style={{
                    fontWeight: '500',
                    color: '#1F2937',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {email.recipient}
                  </div>
                  <div style={{ color: '#6B7280' }}>
                    {email.templateName || '-'}
                  </div>
                  <div>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: '500',
                      background: getStatusColor(email.status) + '20',
                      color: getStatusColor(email.status)
                    }}>
                      {email.status}
                    </span>
                  </div>
                  <div style={{
                    fontWeight: email.openCount > 0 ? '600' : '400',
                    color: email.openCount > 0 ? '#059669' : '#6B7280'
                  }}>
                    {email.openCount}
                  </div>
                  <div style={{
                    fontWeight: email.clickCount > 0 ? '600' : '400',
                    color: email.clickCount > 0 ? '#8B5CF6' : '#6B7280'
                  }}>
                    {email.clickCount}
                  </div>
                  <div>
                    {surveyResponses[email.messageId] ? (
                      <button
                        onClick={() => handleSurveyResponseClick(email.messageId)}
                        style={{
                          padding: '4px 8px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: '500',
                          background: '#10B98120',
                          color: '#10B981',
                          border: '1px solid #10B981',
                          cursor: 'pointer',
                          transition: 'background-color 0.2s'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#10B98130'}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#10B98120'}
                      >
                        View Response
                      </button>
                    ) : (
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: '500',
                        background: '#F3F4F6',
                        color: '#9CA3AF'
                      }}>
                        No Response
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '12px', color: '#6B7280' }}>
                    {formatDateTime(email.sentAt)}
                  </div>
                  <div style={{ fontSize: '12px', color: '#6B7280' }}>
                    {formatDateTime(email.updatedAt)}
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {emailAnalytics.totalPages > 1 && (
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: '20px',
                padding: '16px 0'
              }}>
                <div style={{ fontSize: '14px', color: '#6B7280' }}>
                  Showing {((currentPage - 1) * 25) + 1} to {Math.min(currentPage * 25, emailAnalytics.totalEmails)} of {emailAnalytics.totalEmails} emails
                </div>
                
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={!emailAnalytics.hasPrev}
                    style={{
                      padding: '8px 12px',
                      border: '1px solid #D1D5DB',
                      borderRadius: '6px',
                      background: emailAnalytics.hasPrev ? 'white' : '#F9FAFB',
                      color: emailAnalytics.hasPrev ? '#4F46E5' : '#9CA3AF',
                      cursor: emailAnalytics.hasPrev ? 'pointer' : 'not-allowed',
                      fontSize: '14px',
                      fontWeight: '500'
                    }}
                  >
                    Previous
                  </button>
                  
                  <div style={{
                    display: 'flex',
                    gap: '4px',
                    alignItems: 'center'
                  }}>
                    {Array.from({ length: Math.min(5, emailAnalytics.totalPages) }, (_, i) => {
                      let pageNum;
                      if (emailAnalytics.totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= emailAnalytics.totalPages - 2) {
                        pageNum = emailAnalytics.totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          style={{
                            padding: '8px 12px',
                            border: '1px solid #D1D5DB',
                            borderRadius: '6px',
                            background: pageNum === currentPage ? '#4F46E5' : 'white',
                            color: pageNum === currentPage ? 'white' : '#4F46E5',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: '500'
                          }}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={!emailAnalytics.hasNext}
                    style={{
                      padding: '8px 12px',
                      border: '1px solid #D1D5DB',
                      borderRadius: '6px',
                      background: emailAnalytics.hasNext ? 'white' : '#F9FAFB',
                      color: emailAnalytics.hasNext ? '#4F46E5' : '#9CA3AF',
                      cursor: emailAnalytics.hasNext ? 'pointer' : 'not-allowed',
                      fontSize: '14px',
                      fontWeight: '500'
                    }}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div style={{
            textAlign: 'center',
            padding: '40px',
            color: '#6B7280'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📊</div>
          </div>
        )}
      </div>

      {showSurveyPopup && selectedSurveyResponse && (
        <SurveyResponsePopup
          surveyData={selectedSurveyResponse}
          onClose={() => {
            setShowSurveyPopup(false);
            setSelectedSurveyResponse(null);
          }}
        />
      )}

      {showFormPopup && selectedFormSubmission && (
        <FormSubmissionPopup
          formSubmissionData={selectedFormSubmission}
          onClose={() => {
            setShowFormPopup(false);
            setSelectedFormSubmission(null);
          }}
        />
      )}

      {/* Error Message */}
      {error && (
        <div style={{
          background: '#FEE2E2',
          border: '1px solid #FCA5A5',
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '20px',
          color: '#DC2626'
        }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            padding: '24px',
            borderRadius: '12px',
            textAlign: 'center'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: '4px solid #E5E7EB',
              borderTop: '4px solid #4F46E5',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 16px'
            }}></div>
            <p style={{ margin: 0, color: '#6B7280' }} > Loading campaign data...</p>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
