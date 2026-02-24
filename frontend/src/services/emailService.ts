import axios from "axios";

const API_URL = "http://localhost:5000/api/emails";

export const sendEmail = (data: any) => {
  return axios.post(`${API_URL}/send`, data);
};

export const saveDraft = (data: any) => {
  return axios.post(`${API_URL}/draft`, data);
};

export const fetchTemplates = () => {
  return axios.get(`${API_URL}/templates`);
};

export const createTemplate = (data: any) => {
  return axios.post(`${API_URL}/templates`, data);
};

export const deleteTemplate = (id: string) => {
  return axios.delete(`${API_URL}/templates/${id}`);
};

export const fetchFolderEmails = (folder: string) => {
  // folder: 'sent' | 'draft' | 'trash'
  const path =
    folder === "sent" ? "/sent" : folder === "draft" ? "/drafts" : "/trash";
  return axios.get(`${API_URL}${path}`);
};

export const moveEmailToTrash = (id: string) => {
  return axios.post(`${API_URL}/${id}/trash`);
};

export const fetchCampaigns = () => {
  return axios.get(`${API_URL}/campaigns`);
};

export const createCampaign = (data: any) => {
  return axios.post(`${API_URL}/campaigns`, data);
};

export const fetchSentEmailCount = () => {
  return axios.get(`${API_URL}/stats/sent-count`);
};

export const fetchCampaignsStats = () => {
  return axios.get(`${API_URL}/campaigns/stats`);
};

export const fetchCampaignDashboard = (campaignId: string) => {
  return axios.get(`${API_URL}/campaigns/${campaignId}/dashboard`);
};

export const fetchCampaignAnalytics = (campaignId: string) => {
  return axios.get(`${API_URL}/campaigns/${campaignId}/analytics`);
};

export const deleteCampaign = (campaignId: string) => {
  return axios.delete(`/api/emails/campaigns/${campaignId}`);
};