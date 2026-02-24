import { useEffect, useState } from "react";

interface CampaignsProps {
  onStartCreate?: () => void;
  onOpenDetail?: (campaign: any) => void;
}

export default function Campaigns({ onStartCreate, onOpenDetail }: CampaignsProps) {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchCampaignsWithAnalytics = async () => {
    try {
      setLoading(true);
      setError("");

      const API_URL = "http://localhost:5000/api/emails";
      
      // Fetch campaigns with analytics
      const response = await fetch(`${API_URL}/campaigns/analytics/all`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        setCampaigns(result.data || []);
        setLastUpdated(new Date(result.timestamp));
      } else {
        throw new Error("Failed to fetch campaigns with analytics");
      }
    } catch (err: any) {
      console.error("Failed to load campaigns:", err);
      setError("Failed to load campaigns");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaignsWithAnalytics();
    
    // Set up auto-refresh every 5 minutes
    const interval = setInterval(() => {
      console.log('🔄 Auto-refreshing campaigns data...');
      fetchCampaignsWithAnalytics();
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, []);

  const filtered = campaigns.filter((c: any) => {
    const name = c.name || "";
    const matchesSearch = name
      ? name.toLowerCase().includes(search.toLowerCase())
      : false;
    const matchesStatus =
      statusFilter === "all"
        ? true
        : (c.type || "regular") === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const formatDateTime = (value: any) => {
    if (!value) return "-";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "-";
    return d.toLocaleString();
  };

  const formatPercent = (value: number) => {
    if (!value) return "0%";
    return `${value.toFixed(1)}%`;
  };

  const getStatusBadge = (status: string) => {
    const statusColors = {
      'draft': 'badge-gray',
      'active': 'badge-green', 
      'completed': 'badge-blue',
      'paused': 'badge-yellow'
    };
    return statusColors[status as keyof typeof statusColors] || 'badge-gray';
  };

  const getStatusText = (status: string) => {
    const statusTexts = {
      'draft': 'Draft',
      'active': 'Active',
      'completed': 'Completed', 
      'paused': 'Paused'
    };
    return statusTexts[status as keyof typeof statusTexts] || status;
  };

  return (
   <div className="campaigns-page">
  {/* Header */}
  <div className="campaigns-header-row">
    <div>
      <h1 className="campaigns-title">Campaigns</h1>
      <p className="campaigns-subtitle">
        Manage and track your email marketing campaigns
        {lastUpdated && (
          <span className="last-updated-text">
            <br />Last updated: {formatDateTime(lastUpdated)}
          </span>
        )}
      </p>
    </div>

    <button
      type="button"
      className="primary-button"
      onClick={() => onStartCreate?.()}
    >
      + Create Campaign
    </button>
  </div>

  {/* Toolbar */}
  <div className="campaigns-toolbar">
    <input
      type="text"
      className="campaigns-search"
      placeholder="🔍 Search campaign name..."
      value={search}
      onChange={(e) => setSearch(e.target.value)}
    />

    <select
      className="campaigns-status-filter"
      value={statusFilter}
      onChange={(e) => setStatusFilter(e.target.value)}
    >
      <option value="all">All Types</option>
      <option value="regular">Regular</option>
      <option value="ab_test">A/B Test</option>
    </select>
  </div>

  {loading && <p className="info-text">Loading campaigns...</p>}
  {error && <p className="alert error">{error}</p>}

  {!loading && filtered.length === 0 && !error && (
    <div className="empty-state">
      <p>No campaigns found.</p>
    </div>
  )}

  {!loading && filtered.length > 0 && (
    <div className="campaigns-table-card">
      <div className="campaigns-table-header">
        <span>Campaign</span>
        <span>Type</span>
        <span>Status</span>
        <span>Total</span>
        <span>Sent</span>
        <span>Delivered</span>
        <span>Opened</span>
        <span>Clicked</span>
        <span>Open Rate</span>
        <span>Click Rate</span>
        <span>Created</span>
      </div>

      {filtered.map((c) => {
        const analytics = c.analytics || {};
        const key = String(c._id || c.id || "");

        return (
          <div
            key={key}
            className="campaign-row"
            onClick={() => onOpenDetail?.(c)}
          >
            <span className="campaign-name">{c.name || "(No name)"}</span>

            <span
              className={`badge ${
                c.type === "ab_test" ? "badge-purple" : "badge-blue"
              }`}
            >
              {c.type === "ab_test" ? "A/B Test" : "Regular"}
            </span>

            <span className={`badge ${getStatusBadge(c.status)}`}>
              {getStatusText(c.status)}
            </span>

            <span className="metric-center">{analytics.totalEmails || 0}</span>
            <span className="metric-center">{analytics.sent || 0}</span>
            <span className="metric-center">{analytics.delivered || 0}</span>
            <span className="metric-center">{analytics.opened || 0}</span>
            <span className="metric-center">{analytics.clicked || 0}</span>
            <span className="metric-center">{formatPercent(analytics.openRate)}</span>
            <span className="metric-center">{formatPercent(analytics.clickRate)}</span>
            <span className="muted-text">
              {formatDateTime(c.createdAt)}
            </span>
          </div>
        );
      })}
    </div>
  )}
</div>

  );
}
