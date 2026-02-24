import axios from "axios";

const API_URL = "http://localhost:5000/api/emails";

export const sendEmail = (data) => {
  return axios.post(`${API_URL}/send`, data);
};

export const saveDraft = (data) => {
  return axios.post(`${API_URL}/draft`, data);
};

export const fetchTemplates = () => {
  return axios.get(`${API_URL}/templates`);
};

export const createTemplate = (data) => {
  return axios.post(`${API_URL}/templates`, data);
};

export const deleteTemplate = (id) => {
  return axios.delete(`${API_URL}/templates/${id}`);
};

export const fetchFolderEmails = (folder) => {
  // folder: 'sent' | 'draft' | 'trash'
  const path =
    folder === 'sent' ? '/sent' : folder === 'draft' ? '/drafts' : '/trash';
  return axios.get(`${API_URL}${path}`);
};

export const moveEmailToTrash = (id) => {
  return axios.post(`${API_URL}/${id}/trash`);
};

export const fetchCampaigns = () => {
  return axios.get(`${API_URL}/campaigns`);
};

export const createCampaign = (data) => {
  return axios.post(`${API_URL}/campaigns`, data);
};

export const fetchSentEmailCount = () => {
  return axios.get(`${API_URL}/stats/sent-count`);
};

export const fetchCampaignsStats = () => {
  return axios.get(`${API_URL}/campaigns/stats`);
};

export const fetchCampaignDashboard = (campaignId) => {
  return axios.get(`${API_URL}/campaigns/${campaignId}/dashboard`);
};


export const deleteCampaign = (campaignId) => {
  return axios.delete(`/api/emails/campaigns/${campaignId}`);
};