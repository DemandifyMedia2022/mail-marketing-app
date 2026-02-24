interface MailSummaryProps {
  summary: {
    sent: number;
    failed: number;
    softBounced: number;
    hardBounced: number;
  };
}

export default function MailSummary({ summary }: MailSummaryProps) {
  const totalBounced = summary.softBounced + summary.hardBounced;

  const totalAttempted =
    summary.sent +
    summary.failed +
    summary.softBounced +
    summary.hardBounced;

  const bounceRate =
    totalAttempted > 0
      ? ((totalBounced / totalAttempted) * 100).toFixed(1)
      : "0.0";

  return (
    <div className="mail-summary-grid">
      <div className="summary-card">
        <div className="summary-label">Sent</div>
        <div className="summary-value text-success">
          {summary.sent}
        </div>
      </div>

      <div className="summary-card">
        <div className="summary-label">Failed</div>
        <div className="summary-value text-danger">
          {summary.failed}
        </div>
      </div>

      <div className="summary-card">
        <div className="summary-label">Soft Bounce</div>
        <div className="summary-value">
          {summary.softBounced}
        </div>
      </div>

      <div className="summary-card">
        <div className="summary-label">Hard Bounce</div>
        <div className="summary-value">
          {summary.hardBounced}
        </div>
      </div>

      <div className="summary-card highlight">
        <div className="summary-label">Bounce Rate</div>
        <div className="summary-value text-danger">
          {bounceRate}%
        </div>
      </div>
    </div>
  );
}
