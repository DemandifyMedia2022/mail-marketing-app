import { useEffect, useState } from "react";
import { fetchFolderEmails, moveEmailToTrash, saveDraft, sendEmail } from "../services/emailService.ts";

type FolderKey = "sent" | "draft" | "trash";

interface FolderViewProps {
  folder: FolderKey;
  onOpenCompose?: (initial: any) => void;
}

// Helper function to strip HTML tags for preview
const stripHtml = (html: string) => {
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
};

export default function FolderView({ folder, onOpenCompose }: FolderViewProps) {
  const [emails, setEmails] = useState<any[]>([]);
  const [selected, setSelected] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showTemplate, setShowTemplate] = useState(false);

  const titleMap: Record<string, string> = {
    sent: "Sent emails",
    draft: "Draft emails",
    trash: "Trash",
  };

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError("");

    fetchFolderEmails(folder)
      .then((res: any) => {
        if (!mounted) return;
        const list = res.data?.data || [];
        setEmails(list);
        // Do not auto-open the first email; wait for explicit click
        setSelected(null);
      })
      .catch((err: any) => {
        console.error("Failed to load emails", err);
        if (!mounted) return;
        setError("Failed to load emails");
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [folder]);

  const handleDelete = async (id: string) => {
    try {
      await moveEmailToTrash(id);
      setEmails((list) => list.filter((e: any) => e._id !== id));
      if (selected && selected._id === id) {
        setSelected(null);
      }
    } catch (err) {
      console.error("Failed to move email to trash", err);
      alert("Failed to delete email");
    }
  };

  const handleEditAsNew = () => {
    if (!selected || !onOpenCompose) return;
    onOpenCompose({
      to: selected.to || "",
      cc: selected.cc || "",
      bcc: selected.bcc || "",
      subject: selected.subject || "",
      body: selected.body || "",
    });
  };

  const handleSaveAsDraft = async () => {
    if (!selected) return;
    try {
      await saveDraft({
        to: selected.to || "",
        cc: selected.cc || "",
        bcc: selected.bcc || "",
        subject: selected.subject || "",
        body: selected.body || "",
        mode: "single",
        bulkRecipients: selected.bulkRecipients || "",
        attachments: [],
      });
      alert("Saved as draft");
    } catch (err) {
      console.error("Failed to save as draft", err);
      alert("Failed to save as draft");
    }
  };

  const handleSendDraft = async () => {
    if (!selected) return;

    try {
      const payload = {
        to: selected.to || "",
        cc: selected.cc || undefined,
        bcc: selected.bcc || undefined,
        subject: selected.subject || "",
        body: selected.body || "",
        mode: selected.mode || "single",
        bulkRecipients: selected.bulkRecipients || "",
        bulkData: selected.bulkData || [],
        attachments: Array.isArray(selected.attachments)
          ? selected.attachments.map((att: any) => ({
              filename: att.name || att.filename,
              content: att.content,
              encoding: att.encoding || "base64",
              size: att.size,
              type: att.type,
            }))
          : [],
      };

      await sendEmail(payload);
      alert("Draft email sent");

      // Optimistically remove from current list after sending
      setEmails((list) => list.filter((e: any) => e._id !== selected._id));
      setSelected(null);
    } catch (err) {
      console.error("Failed to send draft email", err);
      alert("Failed to send draft email");
    }
  };

  const handlePrint = () => {
    if (!selected) return;
    window.print();
  };

  const groupEmailsByDate = (items: any[]) => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const oneDayMs = 24 * 60 * 60 * 1000;

    const sections: Record<string, any[]> = {};

    items.forEach((email) => {
      const date = email.sentAt || email.createdAt;
      if (!date) {
        const key = "Other";
        if (!sections[key]) sections[key] = [];
        sections[key].push(email);
        return;
      }

      const d = new Date(date);
      const diffDays = Math.floor((startOfToday.getTime() - new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()) / oneDayMs);

      let label: string;
      if (diffDays === 0) {
        label = "Today";
      } else if (diffDays > 0 && diffDays <= 7) {
        label = "Last 7 days";
      } else {
        label = String(d.getFullYear());
      }

      if (!sections[label]) sections[label] = [];
      sections[label].push(email);
    });

    const order = ["Today", "Last 7 days"]; // years will be appended after
    const years = Object.keys(sections)
      .filter((k) => !order.includes(k))
      .sort((a, b) => Number(b) - Number(a));

    const orderedLabels = [...order.filter((k) => sections[k]), ...years];

    return orderedLabels.map((label) => ({ label, items: sections[label] }));
  };

  const getStatusIcon = () => {
    if (folder === "sent") return "✔";
    if (folder === "draft") return "📝";
    if (folder === "trash") return "🗑";
    return "";
  };

  return (
    <div className="folder-view">
      <div className="folder-header">{titleMap[folder] || "Emails"}</div>
      {loading && <p>Loading...</p>}
      {error && <p className="alert error">{error}</p>}
      <div className="folder-body">
        <div className="folder-list">
          <div className="folder-list-scroll">
            {emails.length === 0 && !loading && (
              <p className="templates-empty">No emails found.</p>
            )}
            {groupEmailsByDate(emails).map((section) => (
              <div key={section.label} className="folder-section">
                <div className="folder-section-header">{section.label}</div>
                {section.items.map((email: any) => (
                  <button
                    key={email._id}
                    type="button"
                    className={
                      selected && selected._id === email._id
                        ? "folder-item active"
                        : "folder-item"
                    }
                    onClick={() => {
                      if (folder === "draft" && onOpenCompose) {
                        onOpenCompose({
                          to: email.to || "",
                          cc: email.cc || "",
                          bcc: email.bcc || "",
                          subject: email.subject || "",
                          body: email.body || "",
                          bulkRecipients: email.bulkRecipients || "",
                          mode: email.mode || "single",
                        });
                      } else {
                        setSelected(email);
                      }
                    }}
                  >
                    <div className="folder-item-row">
                      <div className="folder-item-icon-wrap">
                        {getStatusIcon() && (
                          <span className="folder-item-status-icon">
                            {getStatusIcon()}
                          </span>
                        )}
                      </div>
                      <div className="folder-item-main">
                        <div className="folder-item-from">{email.to}</div>
                        <div className="folder-item-subject">{email.subject}</div>
                        <div className="folder-item-preview">
                          {stripHtml(email.body || "").slice(0, 60)}
                          {stripHtml(email.body || "").length > 60 ? "…" : ""}
                        </div>
                      </div>
                      <div className="folder-item-meta">
                        {Array.isArray(email.attachments) && email.attachments.length > 0 && (
                          <span className="folder-item-attachment" title="Has attachments">
                            📎
                          </span>
                        )}
                        <span className="folder-item-date">
                          {email.sentAt
                            ? new Date(email.sentAt).toLocaleDateString()
                            : ""}
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>
        <div className="folder-detail">
          {!selected && <p>Select an email to view details.</p>}
          {selected && (
            <div className="email-detail">
              <div className="email-detail-header">
                <div className="email-detail-title-block">
                  <h2>{selected.subject}</h2>
                  <div className="email-detail-from-row">
                    <span className="badge-avatar">Me</span>
                    <span className="email-from-text">
                      {typeof import.meta !== "undefined" && (import.meta as any).env && (import.meta as any).env.VITE_FROM_EMAIL
                        ? (import.meta as any).env.VITE_FROM_EMAIL
                        : "me@example.com"}
                    </span>
                  </div>
                  <div className="email-detail-meta-row">
                    <div><strong>To:</strong> {selected.to}</div>
                    {selected.cc && (
                      <div><strong>Cc:</strong> {selected.cc}</div>
                    )}
                    {selected.bcc && (
                      <div><strong>Bcc:</strong> {selected.bcc}</div>
                    )}
                    {selected.sentAt && (
                      <div>
                        <strong>Sent:</strong>{" "}
                        {new Date(selected.sentAt).toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>
                <div className="email-detail-actions">
                  {folder === "draft" && (
                    <button
                      type="button"
                      className="icon-button"
                      title="Send mail"
                      onClick={handleSendDraft}
                    >
                      ➤
                    </button>
                  )}
                  <button
                    type="button"
                    className="icon-button"
                    title="Reply"
                    onClick={() => {
                      if (!onOpenCompose) return;
                      onOpenCompose({
                        to: selected.to,
                        cc: "",
                        bcc: "",
                        subject: selected.subject?.startsWith("Re:")
                          ? selected.subject
                          : `Re: ${selected.subject || ""}`,
                        body: `\n\n----- Original message -----\n${selected.body || ""}`,
                      });
                    }}
                  >
                    ↩
                  </button>
                  <button
                    type="button"
                    className="icon-button"
                    title="Reply all"
                    onClick={() => {
                      if (!onOpenCompose) return;
                      onOpenCompose({
                        to: selected.to,
                        cc: selected.cc || "",
                        bcc: "",
                        subject: selected.subject?.startsWith("Re:")
                          ? selected.subject
                          : `Re: ${selected.subject || ""}`,
                        body: `\n\n----- Original message -----\n${selected.body || ""}`,
                      });
                    }}
                  >
                    ↪
                  </button>
                  <button
                    type="button"
                    className="icon-button"
                    title="Forward"
                    onClick={() => {
                      if (!onOpenCompose) return;
                      onOpenCompose({
                        to: "",
                        cc: "",
                        bcc: "",
                        subject: selected.subject?.startsWith("Fwd:")
                          ? selected.subject
                          : `Fwd: ${selected.subject || ""}`,
                        body: `\n\n----- Forwarded message -----\n${selected.body || ""}`,
                      });
                    }}
                  >
                    ➦
                  </button>
                  <div className="email-detail-menu">
                    <button
                      type="button"
                      className="icon-button"
                      title="More actions"
                    >
                      ⋯
                    </button>
                    <div className="email-detail-menu-list">
                      <button
                        type="button"
                        className="menu-item"
                        onClick={handleEditAsNew}
                      >
                        Edit as new
                      </button>
                      <button
                        type="button"
                        className="menu-item"
                        onClick={handleSaveAsDraft}
                      >
                        Save as
                      </button>
                      <button
                        type="button"
                        className="menu-item"
                        onClick={handlePrint}
                      >
                        Print
                      </button>
                      {folder !== "trash" && (
                        <button
                          type="button"
                          className="menu-item menu-item-danger"
                          onClick={() => handleDelete(selected._id)}
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="email-detail-body">
                {/* Toggle buttons for template/preview view */}
                <div style={{ 
                  marginBottom: '12px', 
                  borderBottom: '1px solid #e5e7eb', 
                  paddingBottom: '8px' 
                }}>
                  <button
                    type="button"
                    onClick={() => setShowTemplate(false)}
                    style={{
                      padding: '6px 12px',
                      marginRight: '8px',
                      border: 'none',
                      borderRadius: '4px',
                      backgroundColor: !showTemplate ? '#2563eb' : '#f3f4f6',
                      color: !showTemplate ? '#fff' : '#374151',
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    Preview
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowTemplate(true)}
                    style={{
                      padding: '6px 12px',
                      border: 'none',
                      borderRadius: '4px',
                      backgroundColor: showTemplate ? '#2563eb' : '#f3f4f6',
                      color: showTemplate ? '#fff' : '#374151',
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    Template
                  </button>
                </div>

                {/* Email body content */}
                {showTemplate ? (
                  <div 
                    style={{
                      fontFamily: 'monospace',
                      fontSize: '13px',
                      lineHeight: '1.4',
                      color: '#374151',
                      backgroundColor: '#f9fafb',
                      padding: '16px',
                      borderRadius: '6px',
                      border: '1px solid #e5e7eb',
                      whiteSpace: 'pre-wrap',
                      overflowX: 'auto'
                    }}
                  >
                    {selected.body || 'No content'}
                  </div>
                ) : (
                  <div 
                    dangerouslySetInnerHTML={{ __html: selected.body || '' }}
                    style={{
                      fontFamily: 'inherit',
                      fontSize: 'inherit',
                      lineHeight: '1.5',
                      color: 'inherit'
                    }}
                  />
                )}
                {Array.isArray(selected.attachments) && selected.attachments.length > 0 && (
                  <div className="email-detail-attachments">
                    <strong>Attachments:</strong>
                    <div className="attachment-list-inline">
                      {selected.attachments.map((att: any, idx: number) => {
                        const hasContent = att && att.content;
                        const mime = att.type || "application/octet-stream";
                        const href = hasContent
                          ? `data:${mime};base64,${att.content}`
                          : undefined;
                        return hasContent ? (
                          <a
                            key={idx}
                            href={href}
                            download={att.name || `attachment-${idx + 1}`}
                            className="attachment-pill-link"
                          >
                            {att.name || `Attachment ${idx + 1}`}
                          </a>
                        ) : (
                          <span key={idx} className="attachment-pill">
                            {att.name || `Attachment ${idx + 1}`}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
