import { useEffect, useState } from "react";
import type { ChangeEvent } from "react";
import { sendEmail, saveDraft, fetchTemplates, deleteTemplate, fetchCampaigns } from "../services/emailService";
import validator from "validator";
interface ComposeMailProps {
  initialData?: Partial<FormState> | null;
}

type SendMode = "single" | "bulk";

interface FormState {
  to: string;
  cc: string;
  bcc: string;
  subject: string;
  body: string;
  bulkRecipients: string;
  mode: SendMode;
}

interface StatusState {
  type: "" | "success" | "error";
  message: string;
}

interface BulkRow {
  email: string;
  name?: string;
  [key: string]: string | undefined;
}

interface AttachmentFile extends File {
  // no extra fields; this exists for clarity
}

interface Template {
  _id?: string;
  id?: string;
  name: string;
  subject: string;
  body: string;
  campaignId?: string;
  campaignName?: string;
  campaignNumber?: number | null;
}

interface NewTemplateState {
  name: string;
  subject: string;
  body: string;
  buttonType: "" | "read_more" | "read_less" | "see_now" | "on_click" | "copy";
  buttonLabel: string;
  buttonUrl: string;
  buttonDisplayUrl: string;
}

const defaultNewTemplate: NewTemplateState = {
  name: "",
  subject: "",
  body: "",
  buttonType: "",
  buttonLabel: "",
  buttonUrl: "",
  buttonDisplayUrl: "",
};

export default function ComposeMail({ initialData }: ComposeMailProps) {
  const [form, setForm] = useState<FormState>({
    to: "",
    cc: "",
    bcc: "",
    subject: "",
    body: "",
    bulkRecipients: "",
    mode: "single",
  });

  const [showCc, setShowCc] = useState(false);
  const [showBcc, setShowBcc] = useState(false);
  const [bulkMode, setBulkMode] = useState(false);
  const [attachments, setAttachments] = useState<AttachmentFile[]>([]);
  const [_bulkData, setBulkData] = useState<BulkRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<StatusState>({ type: "", message: "" });
  const [templates, setTemplates] = useState<Template[]>([]);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);
  const [_templateImage, _setTemplateImage] = useState<File | null>(null);
  const [_newTemplate, _setNewTemplate] = useState<NewTemplateState>(defaultNewTemplate);
  const [_ampaigns, setCampaigns] = useState<any[]>([]);
  const [_emplateCampaignId, _setTemplateCampaignId] = useState<string>("");
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>("");
  const [selectedCampaignName, setSelectedCampaignName] = useState<string>("");
  const [selectedCampaignNumber, setSelectedCampaignNumber] = useState<number | null>(null);
  const [selectedTemplateName, setSelectedTemplateName] = useState<string>("");
  const [landingPages, setLandingPages] = useState<any[]>([]);
  const [previewLandingPage, setPreviewLandingPage] = useState<any>(null);
  const [activeTemplateTab, setActiveTemplateTab] = useState<'templates' | 'landingPages'>('templates');
  const [selectedLandingPage, setSelectedLandingPage] = useState<string>('');
  const [landingPageCustomName, setLandingPageCustomName] = useState<string>('');



const [mailSummary, setMailSummary] = useState<{
  sent: number;
  failed: number;
} | null>(null);


  // When opening from Reply / Forward, prefill form
  useEffect(() => {
    if (initialData) {
      setForm((prev) => ({
        ...prev,
        ...initialData,
      }));
    }
  }, [initialData]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    Promise.all([fetchTemplates(), fetchCampaigns()])
      .then(([tplRes, campRes]: any[]) => {
        const tplList: Template[] = tplRes.data?.data || [];
        const campList: any[] = campRes.data?.data || [];
        setTemplates(tplList);
        setCampaigns(campList);
      })
      .catch((err: unknown) => {
        console.error("Failed to load templates or campaigns", err);
      });

    // Fetch landing pages
    fetchLandingPages();
  }, []);

  const fetchLandingPages = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/landing-pages");
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setLandingPages(data.data);
        }
      }
    } catch (error) {
      console.error("Failed to fetch landing pages:", error);
    }
  };

  const insertLandingPageLink = (landingPage: any) => {
    // Use custom name if provided, otherwise use landing page title
    const displayName = landingPageCustomName || landingPage.title;
    // Generate a tracked landing page URL that will be replaced with actual email ID when sent
    const trackedUrl = `{{LANDING_PAGE_${landingPage._id}}}`;
    const linkHtml = `<a href="${trackedUrl}" style="display: inline-block; padding: 12px 24px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 6px; font-weight: 500;">${displayName}</a>`;
    
    setForm(prev => ({
      ...prev,
      body: prev.body + '\n\n' + linkHtml
    }));
    
    // Reset landing page selection
    setSelectedLandingPage('');
    setLandingPageCustomName('');
    setShowTemplateModal(false);
    setPreviewLandingPage(null);
  };

  const handleCsvUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = String((event.target as FileReader | null)?.result || "");
      const lines = text.split(/\r?\n/).filter((line) => line.trim().length > 0);
      if (lines.length === 0) return;

      const [headerLine, ...dataLines] = lines;
      const headers = headerLine.split(",").map((h) => h.trim().toLowerCase());
      const emailIndex = headers.indexOf("email") !== -1 ? headers.indexOf("email") : 0;
      const nameIndex = headers.indexOf("name");

      const rows: BulkRow[] = dataLines
        .map((line) => line.split(","))
        .map((cols) => {
          const base: BulkRow = {
            email: (cols[emailIndex] || "").trim(),
            name: nameIndex >= 0 ? (cols[nameIndex] || "").trim() : "",
          };

          // Preserve all other columns as attributes using their header names
          headers.forEach((h, idx) => {
            const key = h || `col${idx}`;
            const value = (cols[idx] || "").trim();
            if (key && !base[key]) {
              base[key] = value;
            }
          });

          return base;
        })
        .filter((row) => row.email);

      setBulkData(rows);
      setForm((prev) => ({
        ...prev,
        bulkRecipients: rows.map((r) => r.email).join("\n"),
      }));
    };

    reader.readAsText(file);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []) as AttachmentFile[];
    setAttachments(files);
  };

  const handleSaveDraft = async () => {
    setStatus({ type: "", message: "" });

    const payload = {
      to: form.to.trim(),
      cc: form.cc || "",
      bcc: form.bcc || "",
      subject: form.subject || "",
      body: form.body || "",
      mode: form.mode,
      bulkRecipients: form.bulkRecipients || "",
      attachments: attachments.map((file) => ({
        name: file.name,
        size: file.size,
        type: file.type,
      })),
    };

    try {
      setLoading(true);
      await saveDraft(payload as any);
      setStatus({ type: "success", message: "Draft saved" });
    } catch (error) {
      console.error(error);
      setStatus({ type: "error", message: "Failed to save draft" });
    } finally {
      setLoading(false);
    }
  };




// Helper function: validate single email
const isValidEmail = (email: string) => {
  return validator.isEmail(email);
};





 const handleSend = async () => {
  setStatus({ type: "", message: "" });
  setLoading(true);

  const hasBody = form.body?.trim().length > 0;
  const hasSubject = form.subject?.trim().length > 0;

  const effectiveMode: SendMode = bulkMode ? "bulk" : "single";
  const recipients =
    effectiveMode === "single"
      ? [form.to.trim()]
      : form.bulkRecipients
          .split(/[ ,\n]+/)
          .map((t) => t.trim())
          .filter(Boolean);

  const validRecipients = recipients.filter((email) => isValidEmail(email));
  const invalidRecipients = recipients.filter((email) => !isValidEmail(email));

  if (!hasSubject || !hasBody || recipients.length === 0) {
    setStatus({ type: "error", message: "To, Subject and Message are required" });
    setLoading(false);
    return;
  }

  if (invalidRecipients.length > 0) {
    setStatus({
      type: "error",
      message: `Invalid email(s) format: ${invalidRecipients.join(", ")}`,
    });
  }

  if (validRecipients.length === 0) {
    setLoading(false);
    return;
  }

  // Read attachments
  const attachmentPayload = await Promise.all(
    attachments.map(
      (file) =>
        new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            const result = (e.target as FileReader | null)?.result;
            const base64 = typeof result === "string" ? result.split(",")[1] || "" : "";
            resolve({
              filename: file.name,
              content: base64,
              encoding: "base64",
              size: file.size,
              type: file.type,
            });
          };
          reader.readAsDataURL(file);
        })
    )
  );

  const payload = {
    to: validRecipients.join(","),
    cc: form.cc || undefined,
    bcc: form.bcc || undefined,
    subject: form.subject,
    body: form.body,
    attachments: attachmentPayload,
    campaignId: selectedCampaignId || undefined,
    campaignName: selectedCampaignName || undefined,
    campaignNumber: selectedCampaignNumber ?? undefined,
    templateName: selectedTemplateName || undefined,
  };

  try {
    const response: any = await sendEmail(payload);
const data = response?.data;

if (data?.success) {
  const sent = data.summary?.sent || 0;
  const failed = data.summary?.failed || 0;

  setStatus({
    type: failed > 0 ? "error" : "success",
    message: `Bulk mail completed.`,
  });

  // store counts separately
  setMailSummary({
    sent,
    failed,
  });

  // reset form only if something was sent
  if (sent > 0) {
    setForm({
      to: "",
      cc: "",
      bcc: "",
      subject: "",
      body: "",
      bulkRecipients: "",
      mode: "single",
    });
    setAttachments([]);
    setSelectedCampaignId("");
    setSelectedCampaignName("");
    setSelectedCampaignNumber(null);
    setSelectedTemplateName("");
    setBulkData([]);
  }
} else {
  setStatus({
    type: "error",
    message: data?.message || "Failed to send email",
  });
}

  
  
  } catch (error: any) {
    console.error(error);
    setStatus({ type: "error", message: "Failed to send email" });
  } finally {
    setLoading(false);
  }
};





  return (
    <div className="app-shell">
      <div className="compose-card">
        <header className="compose-header">
          <div>
            <h1 className="title">Compose Email</h1>
            <p className="subtitle">Send a new email message</p>
          </div>
        </header>

        <div className="compose-form">
          {!bulkMode && (
            <label className="field">
              <span>To</span>
              <input
                type="email"
                name="to"
                value={form.to}
                onChange={handleChange}
                placeholder="recipient@example.com"
              />
            </label>
          )}

          <div className="toolbar-row">
            <button
              type="button"
              className="toolbar-btn"
              onClick={() => setShowCc((v) => !v)}
            >
              {showCc ? "Hide Cc" : "Show Cc"}
            </button>
            <button
              type="button"
              className="toolbar-btn"
              onClick={() => setShowBcc((v) => !v)}
            >
              {showBcc ? "Hide Bcc" : "Show Bcc"}
            </button>
            <button
              type="button"
              className={bulkMode ? "toolbar-btn active" : "toolbar-btn"}
              onClick={() => setBulkMode((v) => !v)}
            >
              Bulk Upload
            </button>
            <button
              type="button"
              className="toolbar-btn"
              onClick={() => setShowTemplateModal(true)}
            >
              Template
            </button>
          </div>

          {bulkMode && (
            <label className="field">
              <span>Bulk recipients</span>
              <textarea
                name="bulkRecipients"
                value={form.bulkRecipients}
                onChange={handleChange}
                rows={3}
                placeholder="Paste or type multiple emails separated by comma or new line"
              />
              <div className="bulk-upload-row">
                <label className="upload-label inline">
                  <span>Import CSV</span>
                  <input type="file" accept=".csv,text/csv" onChange={handleCsvUpload} />
                </label>
              </div>
            </label>
          )}

          {(showCc || showBcc) && (
            <div className="field-row">
              {showCc && (
                <label className="field flex-1">
                  <span>Cc</span>
                  <input
                    type="email"
                    name="cc"
                    value={form.cc}
                    onChange={handleChange}
                    placeholder="Optional Cc"
                  />
                </label>
              )}
              {showBcc && (
                <label className="field flex-1">
                  <span>Bcc</span>
                  <input
                    type="email"
                    name="bcc"
                    value={form.bcc}
                    onChange={handleChange}
                    placeholder="Optional Bcc"
                  />
                </label>
              )}
            </div>
          )}

          <label className="field">
            <span>Subject</span>
            <input
              type="text"
              name="subject"
              value={form.subject}
              onChange={handleChange}
              placeholder="Subject line"
            />
          </label>

          <label className="field">
            <span>Message</span>
            <textarea
              name="body"
              value={form.body}
              onChange={handleChange}
              rows={8}
              placeholder="Write your email content here..."
            />
          </label>

          <div className="attachments-row">
            <label className="upload-label">
              <span>Attach documents</span>
              <input type="file" multiple onChange={handleFileChange} />
            </label>
            {attachments.length > 0 && (
              <div className="attachment-list">
                {attachments.map((file) => (
                  <span key={file.name} className="attachment-pill">
                    {file.name}
                  </span>
                ))}
              </div>
            )}
          </div>

          {status.message && (
  <div className="alert success">
    <span>{status.message}</span>
    {mailSummary && (
      <>
        {" "}
        <span className="text-green">
          Sent: {mailSummary.sent}
        </span>
        {", "}
        <span className="text-red">
          Failed: {mailSummary.failed}
        </span>
      </>
    )}
  </div>
)}

          <div className="compose-footer">
            <button
              type="button"
              className="btn-secondary"
              onClick={handleSaveDraft}
              disabled={loading}
            >
              Save draft
            </button>
            <button
              type="button"
              className="btn-primary"
              onClick={handleSend}
              disabled={loading}
            >
              {loading ? "Sending..." : "Send email"}
            </button>
          </div>
        </div>

        {showTemplateModal && (
          <div
            className="modal-backdrop"
            onClick={() => {
              setShowTemplateModal(false);
              setPreviewTemplate(null);
            }}
          >
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <h2 style={{ margin: 0 }}>Content Library</h2>
                  <div style={{ display: 'flex', gap: '8px', background: '#f3f4f6', padding: '4px', borderRadius: '8px' }}>
                    <button
                      type="button"
                      style={{
                        padding: '8px 16px',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '14px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        background: activeTemplateTab === 'templates' ? 'white' : 'transparent',
                        color: activeTemplateTab === 'templates' ? '#1f2937' : '#6b7280',
                        boxShadow: activeTemplateTab === 'templates' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                      }}
                      onClick={() => setActiveTemplateTab('templates')}
                    >
                      Templates
                    </button>
                    <button
                      type="button"
                      style={{
                        padding: '8px 16px',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '14px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        background: activeTemplateTab === 'landingPages' ? 'white' : 'transparent',
                        color: activeTemplateTab === 'landingPages' ? '#1f2937' : '#6b7280',
                        boxShadow: activeTemplateTab === 'landingPages' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                      }}
                      onClick={() => setActiveTemplateTab('landingPages')}
                    >
                      Landing Pages
                    </button>
                  </div>
                </div>
                <button
                  type="button"
                  className="modal-close"
                  onClick={() => {
                    setShowTemplateModal(false);
                    setPreviewTemplate(null);
                    setPreviewLandingPage(null);
                  }}
                >
                  ×
                </button>
              </div>

              <div className="modal-body templates-modal-body">
                {activeTemplateTab === 'templates' ? (
                  <section className="templates-section templates-list-panel">
                    <div className="templates-section-header">
                      <div>
                        <h3>Saved templates</h3>
                        <p className="templates-section-description">
                          Choose a template to quickly fill in subject, body and campaign
                          details for this email.
                        </p>
                      </div>
                    </div>

                    {templates.length === 0 && (
                      <p className="templates-empty">No templates saved yet.</p>
                    )}

                    {templates.length > 0 && (
                      <ul className="templates-list">
                        {templates.map((tpl) => (
                          <li key={tpl._id || tpl.id} className="template-item">
                            <div className="template-main">
                              <div className="template-name">{tpl.name}</div>
                              <div className="template-subject">{tpl.subject}</div>
                              <div className="template-campaign">
                                {tpl.campaignNumber
                                  ? `#${tpl.campaignNumber} - ${tpl.campaignName || "(No name)"}` : tpl.campaignName || "(No campaign)"}
                              </div>
                            </div>
                            <div className="template-actions">
                              <button
                                type="button"
                                className="btn-secondary"
                                onClick={() => setPreviewTemplate(tpl)}
                              >
                                Preview
                              </button>
                              <button
                                type="button"
                                className="btn-primary"
                                onClick={() => {
                                  setForm((prev) => ({
                                    ...prev,
                                    subject: tpl.subject,
                                    body: tpl.body,
                                  }));
                                  setSelectedTemplateName(tpl.name);
                                  setSelectedCampaignId(tpl.campaignId || "");
                                  setSelectedCampaignName(tpl.campaignName || "");
                                  setSelectedCampaignNumber(
                                    typeof tpl.campaignNumber === "number"
                                      ? tpl.campaignNumber
                                      : null
                                  );
                                  setShowTemplateModal(false);
                                  setPreviewTemplate(null);
                                }}
                              >
                                Use
                              </button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </section>
                ) : (
                  <section className="templates-section templates-list-panel">
                    <div className="templates-section-header">
                      <div>
                        <h3>Landing Pages</h3>
                        <p className="templates-section-description">
                          Insert landing page links into your email to track acknowledgements.
                        </p>
                      </div>
                    </div>

                    {landingPages.length === 0 && (
                      <p className="templates-empty">No landing pages created yet.</p>
                    )}

                    {landingPages.length > 0 && (
                      <div style={{ marginBottom: '20px' }}>
                        <div style={{ marginBottom: '12px' }}>
                          <label style={{ display: 'block', marginBottom: '6px', color: '#374151', fontSize: '14px', fontWeight: '500' }}>
                            Select Landing Page
                          </label>
                          <select
                            value={selectedLandingPage}
                            onChange={(e) => {
                              setSelectedLandingPage(e.target.value);
                              // Set custom name to landing page title when selection changes
                              const selectedPage = landingPages.find(page => page._id === e.target.value);
                              if (selectedPage) {
                                setLandingPageCustomName(selectedPage.title);
                              }
                            }}
                            style={{
                              width: '100%',
                              padding: '10px 12px',
                              border: '1px solid #d1d5db',
                              borderRadius: '8px',
                              fontSize: '14px',
                              background: 'white'
                            }}
                          >
                            <option value="">Choose a landing page...</option>
                            {landingPages.map((page) => (
                              <option key={page._id} value={page._id}>
                                {page.name} - {page.title}
                              </option>
                            ))}
                          </select>
                        </div>

                        {selectedLandingPage && (
                          <div style={{ marginBottom: '12px' }}>
                            <label style={{ display: 'block', marginBottom: '6px', color: '#374151', fontSize: '14px', fontWeight: '500' }}>
                              Custom Name (optional)
                            </label>
                            <input
                              type="text"
                              value={landingPageCustomName}
                              onChange={(e) => setLandingPageCustomName(e.target.value)}
                              placeholder="Enter custom name for the link"
                              style={{
                                width: '100%',
                                padding: '10px 12px',
                                border: '1px solid #d1d5db',
                                borderRadius: '8px',
                                fontSize: '14px'
                              }}
                            />
                          </div>
                        )}

                        {selectedLandingPage && (
                          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                            <button
                              type="button"
                              className="btn-primary"
                              onClick={() => {
                                const selectedPage = landingPages.find(page => page._id === selectedLandingPage);
                                if (selectedPage) {
                                  insertLandingPageLink(selectedPage);
                                }
                              }}
                              style={{
                                flex: '1',
                                padding: '10px 16px',
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                fontSize: '14px',
                                fontWeight: '500',
                                cursor: 'pointer'
                              }}
                            >
                              Insert Landing Page Link
                            </button>
                            <button
                              type="button"
                              className="btn-secondary"
                              onClick={() => {
                                const selectedPage = landingPages.find(page => page._id === selectedLandingPage);
                                if (selectedPage) {
                                  setPreviewLandingPage(selectedPage);
                                }
                              }}
                              style={{
                                padding: '10px 16px',
                                background: '#f3f4f6',
                                color: '#6b7280',
                                border: 'none',
                                borderRadius: '6px',
                                fontSize: '14px',
                                cursor: 'pointer'
                              }}
                            >
                              Preview
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Existing landing pages list for reference */}
                    {landingPages.length > 0 && (
                      <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '16px' }}>
                        <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#6b7280' }}>
                          All Available Landing Pages
                        </h4>
                        <ul className="templates-list">
                          {landingPages.map((page) => (
                            <li key={page._id} className="template-item">
                              <div className="template-main">
                                <div className="template-name">{page.name}</div>
                                <div className="template-subject">{page.title}</div>
                                <div className="template-campaign">
                                  {page.description || 'No description'} • {page.contentType.toUpperCase()}
                                </div>
                              </div>
                              <div className="template-actions">
                                <button
                                  type="button"
                                  className="btn-secondary"
                                  onClick={() => setPreviewLandingPage(page)}
                                >
                                  Preview
                                </button>
                                <button
                                  type="button"
                                  className="btn-primary"
                                  onClick={() => {
                                    setSelectedLandingPage(page._id);
                                    setLandingPageCustomName(page.title);
                                  }}
                                >
                                  Select
                                </button>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </section>
                )}

                <aside className="templates-section templates-preview-panel">
                  {activeTemplateTab === 'templates' && previewTemplate ? (
                    <div className="template-preview">
                      <div className="template-preview-header">
                        <div className="template-preview-title">
                          <h4>{previewTemplate.name}</h4>
                          <span className="template-preview-subject">
                            {previewTemplate.subject}
                          </span>
                        </div>
                        <span className="template-preview-campaign">
                          {previewTemplate.campaignNumber
                            ? `#${previewTemplate.campaignNumber} - ${
                                previewTemplate.campaignName || "(No name)"
                              }`
                            : previewTemplate.campaignName || "(No campaign)"}
                        </span>
                      </div>
                      <div
                        className="template-preview-body"
                        dangerouslySetInnerHTML={{ __html: previewTemplate.body }}
                      />
                      <div className="template-preview-actions">
                        <button
                          type="button"
                          className="btn-primary"
                          onClick={() => {
                            setForm((prev) => ({
                              ...prev,
                              subject: previewTemplate.subject,
                              body: previewTemplate.body,
                            }));
                            setSelectedTemplateName(previewTemplate.name);
                            setSelectedCampaignId(previewTemplate.campaignId || "");
                            setSelectedCampaignName(previewTemplate.campaignName || "");
                            setSelectedCampaignNumber(
                              typeof previewTemplate.campaignNumber === "number"
                                ? previewTemplate.campaignNumber
                                : null
                            );
                            setShowTemplateModal(false);
                            setPreviewTemplate(null);
                          }}
                        >
                          Use this template
                        </button>
                        <button
                          type="button"
                          className="btn-secondary"
                          onClick={async () => {
                            const id = String(previewTemplate._id || previewTemplate.id || "");
                            if (!id) return;
                            try {
                              await deleteTemplate(id);
                              setTemplates((list) =>
                                list.filter((tpl) => String(tpl._id || tpl.id) !== id)
                              );
                              setPreviewTemplate(null);
                            } catch (err) {
                              console.error("Failed to delete template", err);
                            }
                          }}
                        >
                          Delete template
                        </button>
                      </div>
                    </div>
                  ) : activeTemplateTab === 'landingPages' && previewLandingPage ? (
                    <div className="template-preview">
                      <div className="template-preview-header">
                        <div className="template-preview-title">
                          <h4>{previewLandingPage.name}</h4>
                          <span className="template-preview-subject">
                            {previewLandingPage.title}
                          </span>
                        </div>
                        <span className="template-preview-campaign">
                          {previewLandingPage.contentType.toUpperCase()} • {previewLandingPage.description || 'No description'}
                        </span>
                      </div>
                      <div className="template-preview-body">
                        <div style={{ padding: '20px', background: '#f9fafb', borderRadius: '8px', textAlign: 'center' }}>
                          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📄</div>
                          <h5 style={{ margin: '0 0 8px 0', color: '#1f2937' }}>Landing Page Preview</h5>
                          <p style={{ margin: '0 0 16px 0', color: '#6b7280', fontSize: '14px' }}>
                            {previewLandingPage.contentType === 'html' 
                              ? 'HTML content will be rendered when viewed'
                              : previewLandingPage.contentType === 'pdf'
                              ? 'PDF will be embedded when viewed'
                              : 'External content will be loaded when viewed'}
                          </p>
                          <div style={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            padding: '12px 24px',
                            borderRadius: '6px',
                            display: 'inline-block',
                            fontWeight: '500'
                          }}>
                            {previewLandingPage.title}
                          </div>
                        </div>
                      </div>
                      <div className="template-preview-actions">
                        <button
                          type="button"
                          className="btn-primary"
                          onClick={() => insertLandingPageLink(previewLandingPage)}
                        >
                          Insert Link
                        </button>
                        <button
                          type="button"
                          className="btn-secondary"
                          onClick={() => {
                            const baseUrl = 'http://localhost:5000';
                            const landingPageUrl = `${baseUrl}/landing-page/${previewLandingPage._id}`;
                            window.open(landingPageUrl, '_blank');
                          }}
                        >
                          View Live
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="template-preview-empty">
                      <h4>No {activeTemplateTab === 'templates' ? 'template' : 'landing page'} selected</h4>
                      <p>Select a {activeTemplateTab === 'templates' ? 'template' : 'landing page'} from the list to see a preview here.</p>
                    </div>
                  )}
                </aside>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
