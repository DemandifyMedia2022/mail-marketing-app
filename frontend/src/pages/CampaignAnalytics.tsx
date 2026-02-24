import React, { useState, useEffect } from 'react';
import axios from 'axios';
import RealtimeTracking from '../components/RealtimeTracking';

// Custom Button Component
const CustomButton = ({ 
  children, 
  onClick, 
  variant = "primary", 
  size = "default",
  className = "",
  style = {},
  ...props 
}: {
  children?: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "default" | "lg";
  className?: string;
  style?: React.CSSProperties;
  [key: string]: any;
}) => {
  const baseStyles: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '6px',
    fontWeight: '500',
    transition: 'all 0.2s ease',
    cursor: 'pointer',
    border: 'none',
    outline: 'none',
    fontSize: '14px',
    ...style
  };

  const variants = {
    primary: {
      background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
      color: 'white',
      boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)',
    },
    secondary: {
      background: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
      color: 'white',
      boxShadow: '0 4px 12px rgba(107, 114, 128, 0.4)',
    },
    outline: {
      background: 'transparent',
      color: '#3b82f6',
      border: '2px solid #3b82f6',
      boxShadow: '0 2px 8px rgba(59, 130, 246, 0.1)',
    },
    ghost: {
      background: 'rgba(59, 130, 246, 0.1)',
      color: '#3b82f6',
      boxShadow: '0 2px 8px rgba(59, 130, 246, 0.1)',
    }
  };

  const sizes = {
    sm: { padding: '6px 12px', fontSize: '12px' },
    default: { padding: '10px 20px', fontSize: '14px' },
    lg: { padding: '12px 24px', fontSize: '16px' }
  };

  return (
    <button
      className={className}
      style={{
        ...baseStyles,
        ...variants[variant],
        ...sizes[size],
      }}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
};

// Custom Card Component
const CustomCard = ({ 
  children, 
  className = "",
  style = {},
  ...props 
}: {
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  [key: string]: any;
}) => {
  return (
    <div
      className={className}
      style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        overflow: 'hidden',
        transition: 'all 0.3s ease',
        ...style
      }}
      {...props}
    >
      {children}
    </div>
  );
};

// Custom Badge Component
const CustomBadge = ({ 
  children, 
  variant = "default",
  className = "",
  style = {},
  ...props 
}: {
  children?: React.ReactNode;
  variant?: "default" | "secondary" | "success" | "destructive";
  className?: string;
  style?: React.CSSProperties;
  [key: string]: any;
}) => {
  const variants = {
    default: {
      backgroundColor: '#f3f4f6',
      color: '#374151',
      padding: '4px 8px',
      borderRadius: '4px',
      fontSize: '12px',
      fontWeight: '500',
    },
    secondary: {
      backgroundColor: '#e5e7eb',
      color: '#6b7280',
      padding: '4px 8px',
      borderRadius: '4px',
      fontSize: '12px',
      fontWeight: '500',
    },
    success: {
      backgroundColor: '#dcfce7',
      color: '#166534',
      padding: '4px 8px',
      borderRadius: '4px',
      fontSize: '12px',
      fontWeight: '500',
    },
    destructive: {
      backgroundColor: '#fee2e2',
      color: '#dc2626',
      padding: '4px 8px',
      borderRadius: '4px',
      fontSize: '12px',
      fontWeight: '500',
    }
  };

  return (
    <span
      className={className}
      style={{
        ...variants[variant],
        ...style,
      }}
      {...props}
    >
      {children}
    </span>
  );
};

// Custom Progress Component
const CustomProgress = ({ 
  value = 0, 
  max = 100,
  className = "",
  style = {},
  ...props 
}: {
  value?: number;
  max?: number;
  className?: string;
  style?: React.CSSProperties;
  [key: string]: any;
}) => {
  const percentage = Math.min((value / max) * 100, 100);
  
  return (
    <div
      className={className}
      style={{
        width: '100%',
        height: '8px',
        backgroundColor: '#f3f4f6',
        borderRadius: '4px',
        overflow: 'hidden',
        ...style
      }}
      {...props}
    >
      <div
        style={{
          height: '100%',
          width: `${percentage}%`,
          background: 'linear-gradient(90deg, #3b82f6 0%, #1d4ed8 100%)',
          borderRadius: '4px',
          transition: 'width 0.3s ease'
        }}
      />
    </div>
  );
};

interface CampaignAnalyticsProps {
  campaignId: string;
  campaignName: string;
  campaignNumber?: number | null;
  onBack: () => void;
}

export default function CampaignAnalytics({
  campaignId,
  campaignName,
  campaignNumber,
  onBack,
}: CampaignAnalyticsProps) {
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [emailOpens, setEmailOpens] = useState<any[]>([]);
  const [openStats, setOpenStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const title = campaignNumber
    ? `#${campaignNumber} - ${campaignName || "Analytics"}`
    : `${campaignName || "Campaign"} Analytics`;

  useEffect(() => {
    fetchAnalyticsData();
    
    // Set up auto-refresh every 5 minutes
    const interval = setInterval(() => {
      console.log('🔄 Auto-refreshing analytics data...');
      fetchAnalyticsData();
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [campaignId]);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    setError("");

    try {
      const API_URL = "http://localhost:5000/api/emails";
      
      // Try to get cached analytics first (faster)
      let analyticsResponse = await fetch(`${API_URL}/campaigns/${campaignId}/analytics/cached`);
      
      if (!analyticsResponse.ok) {
        // Fallback to realtime if cached fails
        analyticsResponse = await fetch(`${API_URL}/campaigns/${campaignId}/analytics/realtime`);
      }
      
      if (analyticsResponse.ok) {
        const analyticsResult = await analyticsResponse.json();
        if (analyticsResult.success) {
          setAnalyticsData(analyticsResult.data);
        }
      } else {
        // Fallback to original endpoint
        const fallbackResponse = await fetch(`${API_URL}/campaigns/${campaignId}/analytics`);
        if (fallbackResponse.ok) {
          const data = await fallbackResponse.json();
          if (data.success && data.data) {
            setAnalyticsData(data.data);
          }
        }
      }
      
      // Fetch email opens data
      if (campaignId && campaignId !== 'undefined') {
        try {
          const [opensResponse, statsResponse] = await Promise.all([
            fetch(`${API_URL}/campaigns/${campaignId}/opens`),
            fetch(`${API_URL}/campaigns/${campaignId}/open-stats`)
          ]);

          if (opensResponse.ok) {
            const opensResult = await opensResponse.json();
            if (opensResult.success) {
              setEmailOpens(opensResult.data || []);
            }
          }

          if (statsResponse.ok) {
            const statsResult = await statsResponse.json();
            if (statsResult.success) {
              setOpenStats(statsResult.data);
            }
          }
        } catch (err) {
          console.warn("Failed to fetch email opens data:", err);
        }
      }
    } catch (err: any) {
      console.error("Analytics fetch error:", err);
      setError(`Failed to load analytics: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const formatStatusName = (status: string) => {
    const statusMap: { [key: string]: string } = {
      'sent': 'Sent',
      'delivered': 'Delivered',
      'hard_bounced': 'Hard Bounce',
      'soft_bounced': 'Soft Bounce',
      'failed': 'Failed',
      'queued': 'Queued'
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colorMap: { [key: string]: string } = {
      'sent': '#2196F3',
      'delivered': '#4CAF50',
      'hard_bounced': '#f44336',
      'soft_bounced': '#FF9800',
      'failed': '#9E9E9E',
      'queued': '#9C27B0'
    };
    return colorMap[status] || '#666';
  };

  const getFunnelColor = (stage: string) => {
    const colorMap: { [key: string]: string } = {
      'Total Emails': '#2196F3',
      'Sent': '#4CAF50',
      'Delivered': '#FF9800',
      'Opened': '#9C27B0',
      'Clicked': '#f44336'
    };
    return colorMap[stage] || '#666';
  };

  // Enhanced Pie Chart Component
  const EnhancedPieChart = ({ data, title }: { data: any[], title: string }) => {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    
    return (
      <div style={{
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '15px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        marginBottom: '25px'
      }}>
        <h3 style={{ marginBottom: '20px', textAlign: 'center', color: '#333', fontSize: '16px', fontWeight: '600' }}>{title}</h3>
        
        {/* Pie Chart Visual Representation */}
        <div style={{
          width: '180px',
          height: '180px',
          margin: '0 auto 20px auto',
          position: 'relative',
          borderRadius: '50%',
          background: `conic-gradient(
            ${data.map((item, index) => {
              const percentage = (item.value / total) * 100;
              const startAngle = data.slice(0, index).reduce((sum, prev) => sum + (prev.value / total) * 360, 0);
              return `${getStatusColor(item.name)} ${startAngle}deg ${startAngle + percentage * 3.6}deg`;
            }).join(', ')}
          )`
        }}>
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '100px',
            height: '100px',
            backgroundColor: 'white',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column'
          }}>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#333' }}>{total}</div>
            <div style={{ fontSize: '10px', color: '#666' }}>Total</div>
          </div>
        </div>
        
        {/* Legend */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {data.map((item, index) => (
            <div key={index} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '8px',
              borderRadius: '6px',
              backgroundColor: '#f8f9fa'
            }}>
              <div style={{
                width: '16px',
                height: '16px',
                backgroundColor: getStatusColor(item.name),
                borderRadius: '3px'
              }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 'bold', fontSize: '12px' }}>{formatStatusName(item.name)}</div>
                <div style={{ fontSize: '11px', color: '#666' }}>
                  {item.value} emails ({((item.value / total) * 100).toFixed(1)}%)
                </div>
              </div>
              <div style={{
                fontSize: '14px',
                fontWeight: 'bold',
                color: getStatusColor(item.name)
              }}>
                {item.value}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Enhanced Bar Chart Component
  const EnhancedBarChart = ({ data, title }: { data: any[], title: string }) => {
    const maxValue = Math.max(...data.map(item => item.clicks || 0));
    
    return (
      <div style={{
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '15px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        marginBottom: '25px'
      }}>
        <h3 style={{ marginBottom: '20px', textAlign: 'center', color: '#333', fontSize: '16px', fontWeight: '600' }}>{title}</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {data.map((item, index) => {
            const percentage = maxValue > 0 ? (item.clicks / maxValue) * 100 : 0;
            return (
              <div key={index}>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  marginBottom: '6px',
                  alignItems: 'center'
                }}>
                  <span style={{ 
                    fontSize: '13px', 
                    fontWeight: '500',
                    flex: 1,
                    marginRight: '15px'
                  }} title={item.fullUrl}>
                    {item.url.length > 40 ? item.url.substring(0, 40) + '...' : item.url}
                  </span>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 'bold', color: '#2196F3', fontSize: '14px' }}>
                      {item.clicks}
                    </div>
                    <div style={{ fontSize: '11px', color: '#666' }}>
                      {item.uniqueClickers} unique
                    </div>
                  </div>
                </div>
                <div style={{
                  height: '24px',
                  backgroundColor: '#f0f0f0',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  position: 'relative'
                }}>
                  <div style={{
                    height: '100%',
                    width: `${percentage}%`,
                    background: `linear-gradient(90deg, #2196F3 0%, #1976D2 100%)`,
                    borderRadius: '12px',
                    transition: 'width 0.5s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    paddingRight: '8px'
                  }}>
                    {percentage > 15 && (
                      <span style={{ color: 'white', fontSize: '11px', fontWeight: 'bold' }}>
                        {percentage.toFixed(0)}%
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const FunnelChart = ({ data, title }: { data: any[], title: string }) => {
    return (
      <div style={{
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '10px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        marginBottom: '20px'
      }}>
        <h3 style={{ marginBottom: '20px', textAlign: 'center' }}>{title}</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {data.map((item, index) => (
            <div key={index} style={{
              display: 'flex',
              alignItems: 'center',
              padding: '15px',
              backgroundColor: getFunnelColor(item.stage),
              color: 'white',
              borderRadius: index === 0 ? '10px 10px 0 0' : 
                           index === data.length - 1 ? '0 0 10px 10px' : '0',
              position: 'relative'
            }}>
              <div style={{ flex: 1, fontWeight: 'bold' }}>{item.stage}</div>
              <div style={{ 
                fontSize: '20px', 
                fontWeight: 'bold',
                backgroundColor: 'rgba(255,255,255,0.2)',
                padding: '5px 15px',
                borderRadius: '20px'
              }}>
                {item.count}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div style={{ 
      width: '140%',
      height: '100%',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      padding: '0',
      margin: '0',
      boxSizing: 'border-box',
      overflow: 'hidden'
    }}>
      {/* Professional Header */}
      <div style={{ 
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
        borderBottom: '1px solid rgba(226, 232, 240, 0.8)'
      }}>
        <div style={{
          width: '100%',
          padding: '20px 30px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxSizing: 'border-box'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <CustomButton
              onClick={onBack}
              variant="primary"
              size="default"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <span style={{ fontSize: '18px' }}>←</span>
              Back 
            </CustomButton>
            
            <div style={{justifyContent:'center'}}>
              <h1 style={{ 
                margin: '0 0 5px 0', 
                fontSize: '24px',
                fontWeight: '700',
                background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                {title}
              </h1>
              <p style={{ 
                margin: 0, 
                color: '#64748b',
                fontSize: '14px',
                fontWeight: '500'
              }}>
                Campaign ID: {campaignId}
              </p>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
            <CustomBadge variant="success">
              Live Data
            </CustomBadge>
            <CustomButton
              onClick={fetchAnalyticsData}
              variant="secondary"
              size="default"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <span style={{ fontSize: '16px' }}>🔄</span>
              Refresh Data
            </CustomButton>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{
        width: '100%',
        padding: '30px',
        boxSizing: 'border-box',
        overflow: 'hidden',
        // maxHeight: 'calc(100vh - 120px)',
        // overflowY: 'auto'
      }}>
        {/* Loading and Error States */}
        {loading && (
          <CustomCard style={{ 
            textAlign: 'center', 
            padding: '80px 20px'
          }}>
            <div style={{ 
              fontSize: '64px', 
              marginBottom: '20px',
              animation: 'pulse 2s infinite'
            }}>📊</div>
            <h3 style={{ 
              color: '#1f2937',
              fontSize: '20px',
              fontWeight: '600',
              marginBottom: '10px'
            }}>
              Loading Analytics Data
            </h3>
            <p style={{ color: '#6b7280', margin: 0 }}>
              Fetching your campaign insights...
            </p>
          </CustomCard>
        )}

        {error && (
          <CustomCard style={{ 
            textAlign: 'center', 
            padding: '80px 20px',
            border: '1px solid rgba(239, 68, 68, 0.2)'
          }}>
            <div style={{ fontSize: '64px', marginBottom: '20px' }}>❌</div>
            <h3 style={{ 
              color: '#dc2626',
              fontSize: '20px',
              fontWeight: '600',
              marginBottom: '10px'
            }}>
              Unable to Load Analytics
            </h3>
            <p style={{ color: '#991b1b', marginBottom: '20px' }}>{error}</p>
            <CustomButton
              onClick={fetchAnalyticsData}
              variant="primary"
              size="default"
              style={{
                background: 'linear-gradient(135deg, #9b9999ff 0%, #e7e7e7ff 100%)',
              }}
            >
              Try Again
            </CustomButton>
          </CustomCard>
        )}

        {/* Analytics Content */}
        {!loading && !error && analyticsData && (
          <div>
            {/* Real-time Tracking */}
            <RealtimeTracking 
              campaignId={campaignId}
              onOpenEvent={(event) => {
                console.log('Real-time open event:', event);
                // Optionally refresh analytics data when email is opened
                fetchAnalyticsData();
              }}
            />

            {/* Email Opens Details */}
            {emailOpens.length > 0 && (
              <div style={{ marginBottom: '40px' }}>
                <h2 style={{
                  color: '#1e293b',
                  fontSize: '20px',
                  fontWeight: '600',
                  marginBottom: '20px'
                }}>
                  📧 Email Open Activity ({emailOpens.length} opens)
                </h2>
                <div style={{
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '20px',
                  maxHeight: '400px',
                  overflowY: 'auto'
                }}>
                  {emailOpens.map((open, index) => (
                    <div key={index} style={{
                      backgroundColor: '#ffffff',
                      padding: '12px 16px',
                      borderRadius: '8px',
                      marginBottom: '8px',
                      border: '1px solid #e2e8f0',
                      fontSize: '13px'
                    }}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '4px'
                      }}>
                        <strong style={{ color: '#1e293b' }}>
                          {open.emailId?.to || 'Unknown Email'}
                        </strong>
                        <span style={{
                          backgroundColor: '#10b981',
                          color: 'white',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontSize: '11px'
                        }}>
                          {open.openCount} opens
                        </span>
                      </div>
                      <div style={{ color: '#6b7280', fontSize: '11px' }}>
                        Subject: {open.emailId?.subject || 'No subject'}
                      </div>
                      <div style={{ color: '#6b7280', fontSize: '11px' }}>
                        Last opened: {new Date(open.lastOpenedAt).toLocaleString()}
                      </div>
                      {open.ipAddress && (
                        <div style={{ color: '#6b7280', fontSize: '11px' }}>
                          IP: {open.ipAddress}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Key Metrics Dashboard */}
            <div style={{
              marginBottom: '40px'
            }}>
              <h2 style={{
                color: '#1e293b',
                fontSize: '24px',
                fontWeight: '700',
                marginBottom: '25px',
                textShadow: 'none'
              }}>
                📊 Campaign Performance Overview
              </h2>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '20px',
                marginBottom: '30px',
                width: '100%'
              }}>
                {[
                  { 
                    label: 'Total Emails', 
                    value: analyticsData.metrics?.totalEmails || 0, 
                    color: '#3b82f6',
                    bgGradient: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                    icon: '📧'
                  },
                  { 
                    label: 'Delivery Rate', 
                    value: `${analyticsData.metrics?.deliveryRate || '0'}%`, 
                    color: '#10b981',
                    bgGradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    icon: '✅'
                  },
                  { 
                    label: 'Open Rate', 
                    value: `${analyticsData.metrics?.openRate || '0'}%`, 
                    color: '#f59e0b',
                    bgGradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                    icon: '👁️'
                  },
                  { 
                    label: 'Click Rate', 
                    value: `${analyticsData.metrics?.clickRate || '0'}%`, 
                    color: '#8b5cf6',
                    bgGradient: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
                    icon: '🔗'
                  },
                  { 
                    label: 'Bounce Rate', 
                    value: `${analyticsData.metrics?.bounceRate || '0'}%`, 
                    color: '#ef4444',
                    bgGradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                    icon: '⚠️'
                  },
                  { 
                    label: 'Click-to-Open Rate', 
                    value: `${analyticsData.metrics?.clickToOpenRate || '0'}%`, 
                    color: '#f97316',
                    bgGradient: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                    icon: '📈'
                  }
                ].map((metric, index) => (
                  <CustomCard
                    key={index}
                    style={{
                      padding: '30px',
                      position: 'relative',
                      overflow: 'hidden',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.transform = 'translateY(-5px)';
                      e.currentTarget.style.boxShadow = '0 12px 40px rgba(0, 0, 0, 0.15)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.08)';
                    }}
                  >
                    {/* Background Accent */}
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '4px',
                      background: metric.bgGradient
                    }} />
                    
                    {/* Icon */}
                    <div style={{
                      fontSize: '32px',
                      marginBottom: '15px',
                      filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))'
                    }}>
                      {metric.icon}
                    </div>
                    
                    {/* Label */}
                    <div style={{ 
                      fontSize: '14px', 
                      color: '#6b7280', 
                      marginBottom: '8px',
                      fontWeight: '500',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      {metric.label}
                    </div>
                    
                    {/* Value */}
                    <div style={{ 
                      fontSize: '36px', 
                      fontWeight: 'bold', 
                      color: metric.color,
                      lineHeight: 1,
                      textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                    }}>
                      {metric.value}
                    </div>
                  </CustomCard>
                ))}
              </div>
            </div>

            {/* Charts Section */}
            <div style={{
              marginBottom: '40px',
              width: '100%'
            }}>
              <h2 style={{
                color: '#1e293b',
                fontSize: '24px',
                fontWeight: '700',
                marginBottom: '25px',
                textShadow: 'none'
              }}>
                📈 Detailed Analytics & Visualizations
              </h2>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
                gap: '25px',
                marginBottom: '30px'
              }}>
                {/* Status Distribution Pie Chart */}
                {analyticsData.charts?.statusChart && analyticsData.charts.statusChart.length > 0 && (
                  <CustomCard style={{ overflow: 'hidden' }}>
                    <div style={{
                      background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                      padding: '20px 25px',
                      borderBottom: '1px solid rgba(255, 255, 255, 0.2)'
                    }}>
                      <h3 style={{ 
                        margin: 0, 
                        color: 'white',
                        fontSize: '18px',
                        fontWeight: '600'
                      }}>
                        📊 Email Status Distribution
                      </h3>
                    </div>
                    <div style={{ padding: '25px' }}>
                      <EnhancedPieChart 
                        data={analyticsData.charts.statusChart} 
                        title="" 
                      />
                    </div>
                  </CustomCard>
                )}

                {/* Engagement Funnel */}
                {analyticsData.charts?.funnelChart && analyticsData.charts.funnelChart.length > 0 && (
                  <CustomCard style={{ overflow: 'hidden' }}>
                    <div style={{
                      background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
                      padding: '20px 25px',
                      borderBottom: '1px solid rgba(255, 255, 255, 0.2)'
                    }}>
                      <h3 style={{ 
                        margin: 0, 
                        color: 'white',
                        fontSize: '18px',
                        fontWeight: '600'
                      }}>
                        🔽 Email Engagement Funnel
                      </h3>
                    </div>
                    <div style={{ padding: '25px' }}>
                      <FunnelChart 
                        data={analyticsData.charts.funnelChart} 
                        title="" 
                      />
                    </div>
                  </CustomCard>
                )}
              </div>

              {/* URL Performance Bar Chart */}
              {analyticsData.charts?.urlChart && analyticsData.charts.urlChart.length > 0 && (
                <CustomCard style={{ overflow: 'hidden' }}>
                  <div style={{
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    padding: '20px 25px',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.2)'
                  }}>
                    <h3 style={{ 
                      margin: 0, 
                      color: 'white',
                      fontSize: '18px',
                      fontWeight: '600'
                    }}>
                      🔗 Top Performing Links
                    </h3>
                  </div>
                  <div style={{ padding: '25px' }}>
                    <EnhancedBarChart 
                      data={analyticsData.charts.urlChart} 
                      title="" 
                    />
                  </div>
                </CustomCard>
              )}
            </div>

            {/* No Data Message */}
            {!analyticsData.charts?.statusChart?.length && 
             !analyticsData.charts?.urlChart?.length && 
             !analyticsData.charts?.funnelChart?.length && (
              <div style={{ 
                textAlign: 'center', 
                padding: '80px 20px',
                background: 'rgba(255, 255, 255, 0.95)',
                borderRadius: '20px',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
              }}>
                <div style={{ fontSize: '64px', marginBottom: '20px' }}>📊</div>
                <h3 style={{ 
                  color: '#1f2937',
                  fontSize: '20px',
                  fontWeight: '600',
                  marginBottom: '10px'
                }}>
                  No Analytics Data Available
                </h3>
                <p style={{ color: '#6b7280', margin: 0 }}>
                  Send some emails first to see detailed analytics and beautiful visualizations
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add CSS for pulse animation */}
      <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
      `}</style>
    </div>
  );
}
