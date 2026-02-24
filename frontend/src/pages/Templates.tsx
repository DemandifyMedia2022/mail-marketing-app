import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Mail, 
  Send, 
  FileText, 
  Shield, 
  Trash2, 
  Clipboard, 
  Megaphone, 
  Globe,
  ChevronLeft,
  ChevronRight,
  LogOut,
  User
} from "lucide-react";

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
  includeSurvey: boolean;
  surveyType: "basic" | "custom";
  surveyId?: string;
  includeLandingPage: boolean;
  landingPageId?: string;
  landingPageCustomName?: string;
}

const defaultNewTemplate: NewTemplateState = {
  name: "",
  subject: "",
  body: "",
  buttonType: "",
  buttonLabel: "",
  buttonUrl: "",
  buttonDisplayUrl: "",
  includeSurvey: false,
  surveyType: "basic",
  surveyId: "",
  includeLandingPage: false,
  landingPageId: "",
  landingPageCustomName: ""
};

interface TemplatesProps {
  onUseTemplate?: (initialData: any) => void;
}

export default function Templates({ onUseTemplate }: TemplatesProps) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [landingPages, setLandingPages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [surveyForms, setSurveyForms] = useState<any[]>([]);
  const [surveyFormsLoading, setSurveyFormsLoading] = useState(false);

  const loadSurveyForms = async () => {
    setSurveyFormsLoading(true);
    try {
      // Use the same data source as SurveyTemplates page
      const savedSurveys = JSON.parse(localStorage.getItem('surveys') || '[]');
      console.log('📋 Loading survey forms from localStorage:', savedSurveys.length);
      
      const surveyForms = savedSurveys.map((survey: any) => ({
        id: survey._id,
        name: survey.title,
        description: survey.description,
        category: survey.category || 'General',
        fields: survey.questions || [],
        status: survey.status || 'Draft'
      }));
      
      console.log('✅ Survey forms loaded:', surveyForms.length);
      console.log('📋 Survey form IDs:', surveyForms.map(f => ({ id: f.id, name: f.name })));
      setSurveyForms(surveyForms);
    } catch (error) {
      console.error('❌ Error loading survey forms:', error);
      setSurveyForms([]);
    } finally {
      setSurveyFormsLoading(false);
    }
  };

  const [newTemplate, setNewTemplate] = useState<NewTemplateState>(defaultNewTemplate);
  const [templateImage, setTemplateImage] = useState<File | null>(null);
  const [templateCampaignId, setTemplateCampaignId] = useState<string>("");
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError("");

    Promise.all([fetchTemplates(), fetchCampaigns()])
      .then(([tplRes, campRes]) => {
        const tplList: Template[] = tplRes.data || [];
        const campList: any[] = campRes.data || [];
        console.log('📋 Templates loaded:', tplList.length);
        console.log('📊 Campaigns loaded:', campList.length);
        setTemplates(tplList);
        setCampaigns(campList);
      })
      .catch((err) => {
        console.error("Failed to load templates or campaigns", err);
        setError("Failed to load templates");
      })
      .finally(() => {
        setLoading(false);
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

  const fetchTemplates = async () => {
    try {
      console.log('📋 Fetching templates...');
      const response = await fetch("http://localhost:5000/api/templates");
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          console.log('✅ Templates fetched successfully');
          return data;
        }
      }
      throw new Error('Failed to fetch templates');
    } catch (error) {
      console.error('❌ Error fetching templates:', error);
      throw error;
    }
  };

  const fetchCampaigns = async () => {
    try {
      console.log('📊 Fetching campaigns...');
      const response = await fetch("http://localhost:5000/api/campaigns");
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          console.log('✅ Campaigns fetched successfully');
          return data;
        }
      }
      throw new Error('Failed to fetch campaigns');
    } catch (error) {
      console.error('❌ Error fetching campaigns:', error);
      throw error;
    }
  };

  return (
    <div className="app-shell">
      <div className="compose-card">
        <header className="compose-header">
          <div>
            <h1 className="title">Templates</h1>
            <p className="subtitle">Create and manage reusable email templates</p>
          </div>
        </header>

        <div className="compose-form templates-page-grid">
          <section className="templates-section templates-create-panel">
            <div className="templates-section-header">
             
            </div>
            <label className="field">
              <span>Template name</span>
              <input
                type="text"
                value={newTemplate.name}
                onChange={(e) =>
                  setNewTemplate((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="Welcome campaign, Newsletter, ..."
              />
            </label>
            <label className="field">
              <span>Subject</span>
              <input
                type="text"
                value={newTemplate.subject}
                onChange={(e) =>
                  setNewTemplate((prev) => ({ ...prev, subject: e.target.value }))
                }
                placeholder="Subject for this template"
              />
            </label>
            <label className="field">
              <span>Campaign</span>
              <select
                value={templateCampaignId}
                onChange={(e) => setTemplateCampaignId(e.target.value)}
              >
                <option value="">Select campaign</option>
                {campaigns.map((c: any) => (
                  <option key={c._id || c.id} value={c._id || c.id}>
                    {c.campaignNumber
                      ? `#${c.campaignNumber} - ${c.name || "(No name)"}`
                      : c.name || "(No name)"}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>Body</span>
              <textarea
                rows={6}
                value={newTemplate.body}
                onChange={(e) =>
                  setNewTemplate((prev) => ({ ...prev, body: e.target.value }))
                }
                placeholder="Write template content here..."
              />
            </label>

            <label className="field">
              <span>Call-to-action button</span>
              <select
                value={newTemplate.buttonType}
                onChange={(e) => {
                  const type = e.target.value as NewTemplateState["buttonType"];
                  const defaultLabelMap: Record<
                    Exclude<NewTemplateState["buttonType"], "">
                  , string> = {
                    read_more: "Read more",
                    read_less: "Read less",
                    see_now: "See now",
                    on_click: "Click here",
                    copy: "Copy",
                  };

                  setNewTemplate((prev) => {
                    const prevDefault = prev.buttonType
                      ? defaultLabelMap[
                          prev.buttonType as Exclude<
                            NewTemplateState["buttonType"],
                            ""
                          >
                        ]
                      : "";
                    const nextDefault = type
                      ? defaultLabelMap[
                          type as Exclude<NewTemplateState["buttonType"], "">
                        ]
                      : "";

                    const shouldOverrideLabel =
                      !prev.buttonLabel || prev.buttonLabel === prevDefault;

                    return {
                      ...prev,
                      buttonType: type,
                      buttonLabel: shouldOverrideLabel
                        ? nextDefault
                        : prev.buttonLabel,
                    };
                  });
                }}
              >
                <option value="">No button</option>
                <option value="read_more">Read more</option>
                <option value="read_less">Read less</option>
                <option value="see_now">See now</option>
                <option value="on_click">On click button</option>
                <option value="copy">Copy</option>
              </select>
            </label>

            <label className="field">
              <span>Button text</span>
              <input
                type="text"
                value={newTemplate.buttonLabel}
                onChange={(e) =>
                  setNewTemplate((prev) => ({
                    ...prev,
                    buttonLabel: e.target.value,
                  }))
                }
                placeholder="Custom button text (optional)"
              />
            </label>

            <label className="field">
              <span>Button link (URL)</span>
              <input
                type="text"
                value={newTemplate.buttonUrl}
                onChange={(e) =>
                  setNewTemplate((prev) => ({ ...prev, buttonUrl: e.target.value }))
                }
                placeholder="https://example.com/your-page"
              />
            </label>

            <label className="field">
              <span>Link text to show in email</span>
              <input
                type="text"
                value={newTemplate.buttonDisplayUrl}
                onChange={(e) =>
                  setNewTemplate((prev) => ({
                    ...prev,
                    buttonDisplayUrl: e.target.value,
                  }))
                }
                placeholder="https://example.com/your-page (optional plain link)"
              />
            </label>

            <label className="field">
              <span>Template image</span>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  setTemplateImage(file);
                }}
              />
            </label>

            <label className="field">
              <span>Include Survey Form</span>
              <select
                value={newTemplate.includeSurvey ? "yes" : "no"}
                onChange={(e) => {
                  const includeSurvey = e.target.value === "yes";
                  setNewTemplate((prev) => ({
                    ...prev,
                    includeSurvey,
                    surveyType: includeSurvey ? "basic" : "basic"
                  }));
                }}
              >
                <option value="no">No</option>
                <option value="yes">Yes</option>
              </select>
            </label>

            {newTemplate.includeSurvey && (
              <>
                <label className="field">
                  <span>Survey Type</span>
                  <select
                    value={newTemplate.surveyType}
                    onChange={(e) => {
                      const surveyType = e.target.value as "basic" | "custom";
                      setNewTemplate((prev) => ({
                        ...prev,
                        surveyType
                      }));
                      if (surveyType === 'custom') {
                        loadSurveyForms();
                      }
                    }}
                  >
                    <option value="basic">Basic Survey (Name, Contact, Interested, Feedback)</option>
                    <option value="custom">Custom Survey</option>
                  </select>
                </label>

                {newTemplate.surveyType === "custom" && (
                  <label className="field">
                    <span>Custom Survey Form</span>
                    {surveyFormsLoading ? (
                      <div className="text-center py-4 border border-slate-200 rounded-lg">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
                        <p className="text-slate-600">Loading survey forms...</p>
                      </div>
                    ) : surveyForms.length === 0 ? (
                      <div className="text-center py-4 border border-slate-200 rounded-lg">
                        <p className="text-slate-600">No saved survey forms found</p>
                        <p className="text-sm text-slate-500 mt-1">Create survey forms first to use custom option</p>
                      </div>
                    ) : (
                      <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-lg">
                        {surveyForms.map((form) => (
                          <div
                            key={form.id}
                            onClick={() => {
                            console.log('🖱️ Survey form clicked:', { id: form.id, name: form.name });
                            setNewTemplate(prev => ({ 
                              ...prev, 
                              surveyId: form.id 
                            }));
                            console.log('✅ Survey ID set to:', form.id);
                          }}
                            className={`p-3 border-b border-slate-100 cursor-pointer hover:bg-blue-50 transition-colors ${
                              newTemplate.surveyId === form.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h4 className="font-medium text-slate-900">{form.name}</h4>
                                <p className="text-sm text-slate-600 mt-1">{form.description}</p>
                                <div className="flex items-center space-x-3 mt-2">
                                  <span className="text-xs text-slate-500">
                                    {form.fields.length} fields
                                  </span>
                                  <span className={`text-xs px-2 py-1 rounded-full ${
                                    form.status === 'Published' ? 'bg-green-100 text-green-700' :
                                    form.status === 'Draft' ? 'bg-yellow-100 text-yellow-700' :
                                    'bg-slate-100 text-slate-700'
                                  }`}>
                                    {form.status}
                                  </span>
                                  <span className="text-xs text-slate-500">
                                    {form.category}
                                  </span>
                                </div>
                              </div>
                              {newTemplate.surveyId === form.id && (
                                <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                                  <div className="w-2 h-2 bg-white rounded-full"></div>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    {newTemplate.surveyId && (
                      <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded">
                        <p className="text-sm text-blue-700">
                          Selected: {surveyForms.find(f => f.id === newTemplate.surveyId)?.name}
                        </p>
                        <p className="text-xs text-blue-600 mt-1">
                          Form ID: {newTemplate.surveyId}
                        </p>
                        <p className="text-xs text-blue-600">
                          Fields: {surveyForms.find(f => f.id === newTemplate.surveyId)?.fields.length || 0}
                        </p>
                      </div>
                    )}
                  </label>
                )}
              </>
            )}

            <label className="field">
              <span>Include Landing Page</span>
              <select
                value={newTemplate.includeLandingPage ? "yes" : "no"}
                onChange={(e) => {
                  const includeLandingPage = e.target.value === "yes";
                  setNewTemplate((prev) => ({
                    ...prev,
                    includeLandingPage,
                    landingPageId: includeLandingPage ? "" : "",
                    landingPageCustomName: includeLandingPage ? "" : ""
                  }));
                }}
              >
                <option value="no">No</option>
                <option value="yes">Yes</option>
              </select>
            </label>

            {newTemplate.includeLandingPage && (
              <>
                <label className="field">
                  <span>Select Landing Page</span>
                  <select
                    value={newTemplate.landingPageId || ""}
                    onChange={(e) => {
                      const landingPageId = e.target.value;
                      const selectedPage = landingPages.find(page => page._id === landingPageId);
                      setNewTemplate((prev) => ({
                        ...prev,
                        landingPageId,
                        landingPageCustomName: selectedPage ? selectedPage.title : ""
                      }));
                    }}
                  >
                    <option value="">Choose a landing page...</option>
                    {landingPages.map((page) => (
                      <option key={page._id} value={page._id}>
                        {page.name} - {page.title}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="field">
                  <span>Custom Link Name (optional)</span>
                  <input
                    type="text"
                    value={newTemplate.landingPageCustomName || ""}
                    onChange={(e) =>
                      setNewTemplate((prev) => ({
                        ...prev,
                        landingPageCustomName: e.target.value
                      }))
                    }
                    placeholder="Enter custom name for the landing page link"
                  />
                </label>
              </>
            )}

            <div className="templates-create-actions">
              <button
                type="button"
                className="btn-primary"
                disabled={loading}
                onClick={async () => {
                if (
                  !newTemplate.name.trim() ||
                  !newTemplate.subject.trim() ||
                  !newTemplate.body.trim()
                )
                  return;

                let finalBody = newTemplate.body.replace(/\n/g, "<br/>");

                // Add survey form button if included
                if (newTemplate.includeSurvey) {
                  // Use the backend server URL for network accessibility
                  const getApiUrl = () => {
                    // Check if running in development and use local IP
                    if (window.location.hostname === 'localhost') {
                      return 'http://localhost:5000'; // Use localhost for development
                    }
                    return `${window.location.protocol}//${window.location.hostname}:5000`;
                  };
                  const surveyUrl = `${window.location.origin}/survey.html`;
                  const surveyId = newTemplate.surveyType === 'custom' ? newTemplate.surveyId : 'basic-survey';
                  const selectedSurveyForm = surveyForms.find(f => f.id === newTemplate.surveyId);
                  const surveyDisplayName = newTemplate.surveyType === 'custom' && selectedSurveyForm ? selectedSurveyForm.name : 'Survey';
                  
                  // Debug logging
                  console.log('🔍 Survey Link Generation Debug:');
                  console.log('  Survey Type:', newTemplate.surveyType);
                  console.log('  Survey ID:', newTemplate.surveyId);
                  console.log('  Selected Survey Form:', selectedSurveyForm);
                  console.log('  Survey Display Name:', surveyDisplayName);
                  console.log('  Survey URL:', surveyUrl);
                  
                  const surveyLink = `<br/><br/><a href="${surveyUrl}?surveyId=${surveyId}&emailId={{emailId}}&recipientEmail={{recipientEmail}}" target="_blank" style="display:inline-block;padding:10px 18px;border-radius:4px;background:#2563eb;color:#ffffff;text-decoration:none;font-size:14px;">Take ${surveyDisplayName}</a>`;
                  console.log('  Generated Link:', surveyLink);
                  finalBody = `${finalBody}${surveyLink}`;
                }

                // Add landing page link if included
                if (newTemplate.includeLandingPage && newTemplate.landingPageId) {
                  // Use the same approach as survey forms for better accessibility
                  const getApiUrl = () => {
                    // Check if running in development and use local IP
                    if (window.location.hostname === 'localhost') {
                      return 'http://localhost:5000'; // Use localhost for development
                    }
                    return `${window.location.protocol}//${window.location.hostname}:5000`;
                  };
                  const landingPageUrl = `${getApiUrl()}/landing-page/${newTemplate.landingPageId}`;
                  const displayName = newTemplate.landingPageCustomName || 'Visit Landing Page';
                  const landingPageLink = `<br/><br/><a href="${landingPageUrl}?emailId={{emailId}}&recipientEmail={{recipientEmail}}" target="_blank" style="display:inline-block;padding:12px 24px;background:linear-gradient(135deg, #667eea 0%, #764ba2 100%);color:#ffffff;text-decoration:none;font-size:14px;font-weight:500;border-radius:6px;">${displayName}</a>`;
                  finalBody = `${finalBody}${landingPageLink}`;
                }

                // Add direct link display URL
                if (newTemplate.buttonDisplayUrl.trim()) {
                  const directUrl = newTemplate.buttonDisplayUrl.trim();
                  const directLinkHtml = `<br/><br/><a href="${directUrl}">${directUrl}</a>`;
                  finalBody = `${finalBody}${directLinkHtml}`;
                }

                // Add custom button (not survey form)
                if (newTemplate.buttonType && newTemplate.buttonUrl) {
                  const defaultLabelMap: Record<
                    Exclude<NewTemplateState["buttonType"], "">
                  , string> = {
                    read_more: "Read more",
                    read_less: "Read less",
                    see_now: "See now",
                    on_click: "Click here",
                    copy: "Copy",
                  };
                  const label =
                    newTemplate.buttonLabel.trim() ||
                    defaultLabelMap[
                      newTemplate.buttonType as Exclude<
                        NewTemplateState["buttonType"],
                        ""
                      >
                    ] ||
                    "Click here";

                  const href = newTemplate.buttonUrl.trim();
                  const buttonHtml = `<br/><br/><a href="${href}" style="display:inline-block;padding:10px 18px;border-radius:4px;background:#2563eb;color:#ffffff;text-decoration:none;font-size:14px;">${label}</a>`;
                  finalBody = `${finalBody}${buttonHtml}`;
                }

                if (templateImage) {
                  const dataUrl = await new Promise<string>((resolve) => {
                    const reader = new FileReader();
                    reader.onload = (e) =>
                      resolve(String((e.target as FileReader | null)?.result || ""));
                    reader.readAsDataURL(templateImage);
                  });
                  const imgHtml = `<br/><br/><img src="${dataUrl}" alt="" style="max-width:100%;height:auto;" />`;
                  finalBody = `${finalBody}${imgHtml}`;
                }

                try {
                  setLoading(true);
                  setError("");
                  const res = await createTemplate({
                    name: newTemplate.name,
                    subject: newTemplate.subject,
                    body: finalBody,
                    campaignId: templateCampaignId,
                  } as any);
                  const saved: Template | undefined = res.data?.data;
                  if (saved) {
                    setTemplates((list) => [saved, ...list]);
                    setNewTemplate(defaultNewTemplate);
                    setTemplateImage(null);
                    setTemplateCampaignId("");
                  }
                } catch (err) {
                  console.error("Failed to create template", err);
                  setError("Failed to create template");
                } finally {
                  setLoading(false);
                }
              }}
              >
                Save template
              </button>
            </div>
          </section>

          <section className="templates-section templates-saved-panel">
            <div className="templates-section-header">
              <div>
                <h3>Saved templates</h3>
                <p className="templates-section-description">
                  Browse all templates linked to campaigns. Preview the content or
                  delete templates you no longer need.
                </p>
              </div>
            </div>
            {loading && <p>Loading...</p>}
            {error && <p className="alert error">{error}</p>}
            {!loading && templates.length === 0 && !error && (
              <p className="templates-empty">No templates saved yet.</p>
            )}
            {!loading && templates.length > 0 && (
              <div className="templates-list-wrapper">
                <ul className="templates-list">
                  {templates.map((tpl: Template) => (
                    <li key={tpl._id || tpl.id} className="template-item">
                      <div className="template-main">
                        <div className="template-name">{tpl.name}</div>
                        <div className="template-subject">{tpl.subject}</div>
                        <div className="template-campaign">
                          {tpl.campaignNumber
                            ? `#${tpl.campaignNumber} - ${tpl.campaignName || "(No name)"}`
                            : tpl.campaignName || "(No campaign)"}
                        </div>
                      </div>
                      <div className="template-actions">
                        <button
                          type="button"
                          className="btn-secondary"
                          onClick={() => {
                            setPreviewTemplate(tpl);
                            setShowPreviewModal(true);
                          }}
                        >
                          Preview
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        </div>

        {showPreviewModal && previewTemplate && (
          <div
            className="modal-backdrop"
            onClick={() => {
              setShowPreviewModal(false);
              setPreviewTemplate(null);
            }}
          >
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Template preview</h2>
                <button
                  type="button"
                  className="modal-close"
                  onClick={() => {
                    setShowPreviewModal(false);
                    setPreviewTemplate(null);
                  }}
                >
                  ×
                </button>
              </div>

              <div className="modal-body">
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
                        if (onUseTemplate) {
                          onUseTemplate({
                            subject: previewTemplate.subject,
                            body: previewTemplate.body,
                          });
                        }
                        setShowPreviewModal(false);
                        setPreviewTemplate(null);
                      }}  style={{margin:"5px 10px"}}
                    >
                      Share
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
                          setShowPreviewModal(false);
                          setPreviewTemplate(null);
                        } catch (err) {
                          console.error("Failed to delete template", err);
                        }
                      }} style={{margin:"5px 10px"}}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
