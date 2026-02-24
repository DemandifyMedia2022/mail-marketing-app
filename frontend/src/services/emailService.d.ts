declare module "services/emailService" {
  // Basic axios-style return types are left as any to keep it simple
  export function sendEmail(data: any): any;
  export function saveDraft(data: any): any;
  export function fetchTemplates(): any;
  export function createTemplate(data: any): any;
  export function fetchFolderEmails(folder: string): any;
  export function moveEmailToTrash(id: string): any;
  export function fetchCampaigns(): any;
  export function createCampaign(data: any): any;
  export function fetchSentEmailCount(): any;
  export function fetchCampaignsStats(): any;
}
