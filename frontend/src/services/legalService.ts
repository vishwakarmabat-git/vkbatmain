import { apiClient } from '@/api/client';

export interface LegalDocument {
  id: string;
  slug: string;
  title: string;
  category: 'legal' | 'support' | string;
  content: string;
  version: string;
  effective_date: string;
  requires_reconsent: boolean;
  is_active: boolean;
  updated_at: string;
}

export interface ConsentRecord {
  id: string;
  user_id?: string;
  consent_type: string;
  document_type: string;
  document_version: string;
  consent_status: 'ACCEPTED' | 'REJECTED' | 'REVOKED';
  source: string;
  created_at: string;
}

export interface MarketingPreferences {
  email_marketing: boolean;
  sms_marketing: boolean;
  whatsapp_marketing: boolean;
  updated_at?: string;
}

export interface PrivacyRequest {
  id: string;
  user_id?: string;
  customer_email: string;
  customer_name: string;
  request_type: 'ACCOUNT_DELETION' | 'DATA_ACCESS' | 'GRIEVANCE';
  status: 'PENDING' | 'IN_REVIEW' | 'COMPLETED' | 'REJECTED';
  reason?: string;
  admin_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface ReconsentStatus {
  requires_reconsent: boolean;
  pending_documents: Array<{
    slug: string;
    title: string;
    version: string;
    effective_date: string;
  }>;
}

export const legalService = {
  // Public
  async getLegalDocuments(): Promise<LegalDocument[]> {
    const response = await apiClient.get<LegalDocument[]>('/legal/documents');
    return response.data;
  },

  async getLegalDocument(slug: string): Promise<LegalDocument> {
    const response = await apiClient.get<LegalDocument>(`/legal/documents/${slug}`);
    return response.data;
  },

  // Consent
  async recordConsent(data: {
    consent_type: string;
    document_type: string;
    document_version?: string;
    consent_status?: string;
    source?: string;
  }): Promise<ConsentRecord> {
    const response = await apiClient.post<ConsentRecord>('/legal/consent', data);
    return response.data;
  },

  async getMyConsentHistory(): Promise<ConsentRecord[]> {
    const response = await apiClient.get<ConsentRecord[]>('/legal/my-consent');
    return response.data;
  },

  async checkReconsent(): Promise<ReconsentStatus> {
    const response = await apiClient.get<ReconsentStatus>('/legal/check-reconsent');
    return response.data;
  },

  // Marketing Preferences
  async getMarketingPreferences(): Promise<MarketingPreferences> {
    const response = await apiClient.get<MarketingPreferences>('/legal/marketing-preferences');
    return response.data;
  },

  async updateMarketingPreferences(data: MarketingPreferences): Promise<MarketingPreferences> {
    const response = await apiClient.put<MarketingPreferences>('/legal/marketing-preferences', data);
    return response.data;
  },

  // Privacy Requests & Account Deletion
  async createPrivacyRequest(data: {
    request_type: 'ACCOUNT_DELETION' | 'DATA_ACCESS' | 'GRIEVANCE';
    reason?: string;
    current_password?: string;
  }): Promise<PrivacyRequest> {
    const response = await apiClient.post<PrivacyRequest>('/legal/privacy-request', data);
    return response.data;
  },

  async getMyPrivacyRequests(): Promise<PrivacyRequest[]> {
    const response = await apiClient.get<PrivacyRequest[]>('/legal/my-privacy-requests');
    return response.data;
  },

  // Admin
  async adminGetDocuments(): Promise<LegalDocument[]> {
    const response = await apiClient.get<LegalDocument[]>('/admin/legal/documents');
    return response.data;
  },

  async adminUpdateDocument(slug: string, data: Partial<LegalDocument>): Promise<LegalDocument> {
    const response = await apiClient.put<LegalDocument>(`/admin/legal/documents/${slug}`, data);
    return response.data;
  },

  async adminGetConsentRecords(consentType?: string, limit: number = 100): Promise<ConsentRecord[]> {
    const response = await apiClient.get<ConsentRecord[]>('/admin/legal/consent-records', {
      params: { consent_type: consentType, limit },
    });
    return response.data;
  },

  async adminGetPrivacyRequests(statusFilter?: string): Promise<PrivacyRequest[]> {
    const response = await apiClient.get<PrivacyRequest[]>('/admin/legal/privacy-requests', {
      params: { status_filter: statusFilter },
    });
    return response.data;
  },

  async adminUpdatePrivacyRequest(
    id: string,
    data: { status: string; admin_notes?: string }
  ): Promise<PrivacyRequest> {
    const response = await apiClient.put<PrivacyRequest>(`/admin/legal/privacy-requests/${id}`, data);
    return response.data;
  },
};
