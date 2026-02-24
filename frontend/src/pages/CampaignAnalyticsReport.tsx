import { useEffect, useState } from "react";

interface CampaignAnalyticsReportProps {
  campaignId: string;
  campaignName: string;
  campaignNumber?: number | null;
  onBack: () => void;
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

export default function CampaignAnalyticsReport({
  campaignId,
  campaignName,
  campaignNumber,
  onBack,
}: CampaignAnalyticsReportProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [analyticsData, setAnalyticsData] = useState<CampaignAnalytics | null>(null);
  const [emailAnalytics, setEmailAnalytics] = useState<PaginatedEmails | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const title = campaignNumber
    ? `#${campaignNumber} - ${campaignName || "Analytics Report"}`
    : `${campaignName || "Campaign"} Analytics Report`;

  // Fetch campaign analytics data
  const fetchAnalyticsData = async () => {
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

      // Fetch email analytics for detailed data
      const emailsResponse = await fetch(`${API_URL}/campaigns/${campaignId}/emails?limit=100`);
      if (emailsResponse.ok) {
        const emailsResult = await emailsResponse.json();
        if (emailsResult.success) {
          setEmailAnalytics(emailsResult.data);
        }
      }

      setLastRefresh(new Date());
    } catch (err: any) {
      console.error("Analytics fetch error:", err);
      setError(`Failed to load analytics data: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Auto-refresh every 5 minutes
  useEffect(() => {
    fetchAnalyticsData();
    
    const interval = setInterval(() => {
      fetchAnalyticsData();
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [campaignId]);

  // Prepare chart data
  const getStatusChartData = () => {
    if (!analyticsData) return [];
    
    return [
      { name: 'Sent', value: analyticsData.metrics?.sent || 0, color: '#059669' },
      { name: 'Delivered', value: analyticsData.metrics?.delivered || 0, color: '#10B981' },
      { name: 'Opened', value: analyticsData.metrics?.opened || 0, color: '#F59E0B' },
      { name: 'Clicked', value: analyticsData.metrics?.clicked || 0, color: '#8B5CF6' },
      { name: 'Bounced', value: analyticsData.metrics?.bounced || 0, color: '#EF4444' },
      { name: 'Failed', value: analyticsData.metrics?.failed || 0, color: '#DC2626' },
    ];
  };

  const getRateChartData = () => {
    if (!analyticsData) return [];
    
    return [
      { name: 'Open Rate', value: parseFloat(analyticsData.metrics?.openRate || '0'), color: '#F59E0B' },
      { name: 'Click Rate', value: parseFloat(analyticsData.metrics?.clickRate || '0'), color: '#8B5CF6' },
      { name: 'Bounce Rate', value: parseFloat(analyticsData.metrics?.bounceRate || '0'), color: '#EF4444' },
    ];
  };

  const getTimelineData = () => {
    if (!emailAnalytics) return [];
    
    // Group emails by date
    const timelineData: { [key: string]: { opens: number; clicks: number } } = {};
    
    emailAnalytics.emails.forEach(email => {
      const date = new Date(email.sentAt).toLocaleDateString();
      if (!timelineData[date]) {
        timelineData[date] = { opens: 0, clicks: 0 };
      }
      timelineData[date].opens += email.openCount;
      timelineData[date].clicks += email.clickCount;
    });

    return Object.entries(timelineData).map(([date, data]) => ({
      date,
      opens: data.opens,
      clicks: data.clicks
    })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
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
          
          <button
            onClick={fetchAnalyticsData}
            disabled={loading}
            style={{
              background: '#059669',
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
            onMouseOver={(e) => !loading && (e.currentTarget.style.background = '#047857')}
            onMouseOut={(e) => !loading && (e.currentTarget.style.background = '#059669')}
          >
            🔄 Refresh
          </button>
        </div>
      </div>

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
            <p style={{ margin: 0, color: '#6B7280' }}>Loading analytics data...</p>
          </div>
        </div>
      )}

      {analyticsData && (
        <>
          {/* Summary Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
            marginBottom: '24px'
          }}>
            {[
              { label: 'Total Emails', value: analyticsData.metrics?.totalEmails || 0, color: '#4F46E5', icon: '📧' },
              { label: 'Open Rate', value: analyticsData.metrics?.openRate || '0%', color: '#F59E0B', icon: '👁️' },
              { label: 'Click Rate', value: analyticsData.metrics?.clickRate || '0%', color: '#8B5CF6', icon: '🔗' },
              { label: 'Bounce Rate', value: analyticsData.metrics?.bounceRate || '0%', color: '#EF4444', icon: '↩️' },
            ].map((card, index) => (
              <div key={index} style={{
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                borderRadius: '16px',
                padding: '20px',
                textAlign: 'center',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
              }}>
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>{card.icon}</div>
                <div style={{
                  fontSize: '12px',
                  color: '#6B7280',
                  marginBottom: '4px',
                  fontWeight: '500'
                }}>
                  {card.label}
                </div>
                <div style={{
                  fontSize: '24px',
                  fontWeight: '700',
                  color: card.color
                }}>
                  {card.value}
                </div>
              </div>
            ))}
          </div>

          {/* Charts Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
            gap: '24px',
            marginBottom: '24px'
          }}>
            {/* Status Distribution Chart */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
            }}>
              <h3 style={{
                margin: '0 0 20px 0',
                fontSize: '18px',
                fontWeight: '600',
                color: '#1F2937'
              }}>
                📊 Email Status Distribution
              </h3>
              <div style={{ height: '300px', position: 'relative' }}>
                {getStatusChartData().map((item, index) => (
                  <div key={index} style={{
                    display: 'flex',
                    alignItems: 'center',
                    marginBottom: '12px'
                  }}>
                    <div style={{
                      width: '16px',
                      height: '16px',
                      backgroundColor: item.color,
                      borderRadius: '4px',
                      marginRight: '12px'
                    }}></div>
                    <div style={{
                      flex: 1,
                      fontSize: '14px',
                      color: '#374151'
                    }}>
                      {item.name}
                    </div>
                    <div style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#1F2937',
                      marginRight: '12px'
                    }}>
                      {item.value.toLocaleString()}
                    </div>
                    <div style={{
                      width: '100px',
                      height: '8px',
                      backgroundColor: '#E5E7EB',
                      borderRadius: '4px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        width: `${(item.value / (analyticsData.metrics?.totalEmails || 1)) * 100}%`,
                        height: '100%',
                        backgroundColor: item.color,
                        transition: 'width 0.3s ease'
                      }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Rates Chart */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
            }}>
              <h3 style={{
                margin: '0 0 20px 0',
                fontSize: '18px',
                fontWeight: '600',
                color: '#1F2937'
              }}>
                📈 Performance Rates
              </h3>
              <div style={{ height: '300px', position: 'relative' }}>
                {getRateChartData().map((item, index) => (
                  <div key={index} style={{
                    marginBottom: '20px'
                  }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: '8px'
                    }}>
                      <span style={{
                        fontSize: '14px',
                        color: '#374151',
                        fontWeight: '500'
                      }}>
                        {item.name}
                      </span>
                      <span style={{
                        fontSize: '14px',
                        fontWeight: '600',
                        color: item.color
                      }}>
                        {item.value.toFixed(1)}%
                      </span>
                    </div>
                    <div style={{
                      width: '100%',
                      height: '20px',
                      backgroundColor: '#E5E7EB',
                      borderRadius: '10px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        width: `${item.value}%`,
                        height: '100%',
                        backgroundColor: item.color,
                        borderRadius: '10px',
                        transition: 'width 0.3s ease'
                      }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Timeline Chart */}
          {getTimelineData().length > 0 && (
            <div style={{
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              borderRadius: '16px',
              padding: '24px',
              marginBottom: '24px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
            }}>
              <h3 style={{
                margin: '0 0 20px 0',
                fontSize: '18px',
                fontWeight: '600',
                color: '#1F2937'
              }}>
                📅 Engagement Timeline
              </h3>
              <div style={{ height: '300px', position: 'relative' }}>
                {getTimelineData().map((item, index) => (
                  <div key={index} style={{
                    display: 'flex',
                    alignItems: 'center',
                    marginBottom: '16px'
                  }}>
                    <div style={{
                      width: '120px',
                      fontSize: '12px',
                      color: '#6B7280',
                      fontWeight: '500'
                    }}>
                      {item.date}
                    </div>
                    <div style={{
                      flex: 1,
                      display: 'flex',
                      gap: '16px',
                      alignItems: 'center'
                    }}>
                      <div style={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        <span style={{
                          fontSize: '12px',
                          color: '#6B7280',
                          width: '40px'
                        }}>
                          Opens:
                        </span>
                        <div style={{
                          flex: 1,
                          height: '8px',
                          backgroundColor: '#E5E7EB',
                          borderRadius: '4px',
                          overflow: 'hidden'
                        }}>
                          <div style={{
                            width: `${Math.min((item.opens / Math.max(...getTimelineData().map(d => d.opens))) * 100, 100)}%`,
                            height: '100%',
                            backgroundColor: '#F59E0B',
                            transition: 'width 0.3s ease'
                          }}></div>
                        </div>
                        <span style={{
                          fontSize: '12px',
                          color: '#F59E0B',
                          fontWeight: '600',
                          width: '30px',
                          textAlign: 'right'
                        }}>
                          {item.opens}
                        </span>
                      </div>
                      <div style={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        <span style={{
                          fontSize: '12px',
                          color: '#6B7280',
                          width: '40px'
                        }}>
                          Clicks:
                        </span>
                        <div style={{
                          flex: 1,
                          height: '8px',
                          backgroundColor: '#E5E7EB',
                          borderRadius: '4px',
                          overflow: 'hidden'
                        }}>
                          <div style={{
                            width: `${Math.min((item.clicks / Math.max(...getTimelineData().map(d => d.clicks))) * 100, 100)}%`,
                            height: '100%',
                            backgroundColor: '#8B5CF6',
                            transition: 'width 0.3s ease'
                          }}></div>
                        </div>
                        <span style={{
                          fontSize: '12px',
                          color: '#8B5CF6',
                          fontWeight: '600',
                          width: '30px',
                          textAlign: 'right'
                        }}>
                          {item.clicks}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
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
