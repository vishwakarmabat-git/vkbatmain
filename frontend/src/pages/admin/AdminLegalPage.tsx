import React, { useEffect, useState } from 'react';
import {
  Scale,
  FileText,
  ShieldAlert,
  Search,
  CheckCircle2,
  Clock,
  Trash2,
  Edit3,
  Save,
  RotateCcw,
  Layers,
  Calendar,
  AlertTriangle,
  UserX,
  ExternalLink,
} from 'lucide-react';
import { legalService, LegalDocument, ConsentRecord, PrivacyRequest } from '@/services/legalService';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { toast } from 'sonner';

export const AdminLegalPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'documents' | 'consent_log' | 'privacy_requests'>('documents');

  // Documents state
  const [documents, setDocuments] = useState<LegalDocument[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<LegalDocument | null>(null);
  const [loadingDocs, setLoadingDocs] = useState(true);
  const [savingDoc, setSavingDoc] = useState(false);

  // Edit draft form
  const [draftTitle, setDraftTitle] = useState('');
  const [draftVersion, setDraftVersion] = useState('');
  const [draftDate, setDraftDate] = useState('');
  const [draftContent, setDraftContent] = useState('');
  const [draftReconsent, setDraftReconsent] = useState(false);

  // Consent log state
  const [consentRecords, setConsentRecords] = useState<ConsentRecord[]>([]);
  const [consentFilter, setConsentFilter] = useState('');
  const [loadingConsent, setLoadingConsent] = useState(false);

  // Privacy requests state
  const [privacyRequests, setPrivacyRequests] = useState<PrivacyRequest[]>([]);
  const [requestFilter, setRequestFilter] = useState('');
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [updatingRequestId, setUpdatingRequestId] = useState<string | null>(null);
  const [adminNoteInput, setAdminNoteInput] = useState('');

  // 1. Fetch Legal Documents
  const fetchDocuments = () => {
    setLoadingDocs(true);
    legalService
      .adminGetDocuments()
      .then((docs) => {
        setDocuments(docs);
        if (docs.length > 0 && !selectedDoc) {
          selectDocument(docs[0]);
        } else if (selectedDoc) {
          const updated = docs.find((d) => d.slug === selectedDoc.slug);
          if (updated) selectDocument(updated);
        }
      })
      .catch((err) => {
        console.error(err);
        toast.error('Failed to load legal documents.');
      })
      .finally(() => setLoadingDocs(false));
  };

  const selectDocument = (doc: LegalDocument) => {
    setSelectedDoc(doc);
    setDraftTitle(doc.title);
    setDraftVersion(doc.version);
    setDraftDate(doc.effective_date);
    setDraftContent(doc.content);
    setDraftReconsent(doc.requires_reconsent);
  };

  // 2. Fetch Consent Log
  const fetchConsentRecords = () => {
    setLoadingConsent(true);
    legalService
      .adminGetConsentRecords(consentFilter || undefined, 100)
      .then(setConsentRecords)
      .catch((err) => {
        console.error(err);
        toast.error('Failed to load consent records.');
      })
      .finally(() => setLoadingConsent(false));
  };

  // 3. Fetch Privacy Requests
  const fetchPrivacyRequests = () => {
    setLoadingRequests(true);
    legalService
      .adminGetPrivacyRequests(requestFilter || undefined)
      .then(setPrivacyRequests)
      .catch((err) => {
        console.error(err);
        toast.error('Failed to load privacy requests.');
      })
      .finally(() => setLoadingRequests(false));
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  useEffect(() => {
    if (activeTab === 'consent_log') fetchConsentRecords();
    if (activeTab === 'privacy_requests') fetchPrivacyRequests();
  }, [activeTab, consentFilter, requestFilter]);

  const handleSaveDocument = async () => {
    if (!selectedDoc) return;
    setSavingDoc(true);
    try {
      const updated = await legalService.adminUpdateDocument(selectedDoc.slug, {
        title: draftTitle,
        version: draftVersion,
        effective_date: draftDate,
        content: draftContent,
        requires_reconsent: draftReconsent,
      });
      setSelectedDoc(updated);
      toast.success(`Published updates for ${updated.title} (v${updated.version})`);
      fetchDocuments();
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Failed to update document.');
    } finally {
      setSavingDoc(false);
    }
  };

  const handleResolvePrivacyRequest = async (requestId: string, newStatus: string) => {
    setUpdatingRequestId(requestId);
    try {
      await legalService.adminUpdatePrivacyRequest(requestId, {
        status: newStatus,
        admin_notes: adminNoteInput || undefined,
      });
      toast.success(`Request marked as ${newStatus}`);
      setAdminNoteInput('');
      fetchPrivacyRequests();
    } catch (err: any) {
      toast.error('Failed to update privacy request status.');
    } finally {
      setUpdatingRequestId(null);
    }
  };

  return (
    <div className="space-y-6 text-left font-sport">
      {/* Header Card */}
      <div className="bg-gradient-to-r from-[#12121A] via-[#161622] to-[#0E0E14] border border-[#242436] rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Scale className="w-5 h-5 text-[#D4AF37]" />
              <Badge variant="gold" className="text-[10px] font-bold uppercase tracking-widest">
                Compliance & Governance
              </Badge>
            </div>
            <h1 className="text-xl sm:text-2xl font-serif font-black text-white uppercase tracking-wider">
              Legal, Policies & Privacy Management
            </h1>
            <p className="text-xs text-[#8E8E93] font-sans">
              Maintain Indian ecommerce legal documents, manage versioning, review consent audit trails, and process customer data deletion requests.
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 pt-6 border-t border-[#242436]/80 mt-6">
          <button
            type="button"
            onClick={() => setActiveTab('documents')}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'documents'
                ? 'bg-[#D4AF37] text-black shadow-[0_0_15px_rgba(212,175,55,0.3)]'
                : 'text-[#A1A1AA] hover:bg-[#181824] hover:text-white'
            }`}
          >
            Policy Documents Editor
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('consent_log')}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'consent_log'
                ? 'bg-[#D4AF37] text-black shadow-[0_0_15px_rgba(212,175,55,0.3)]'
                : 'text-[#A1A1AA] hover:bg-[#181824] hover:text-white'
            }`}
          >
            Consent Audit Log
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('privacy_requests')}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'privacy_requests'
                ? 'bg-[#D4AF37] text-black shadow-[0_0_15px_rgba(212,175,55,0.3)]'
                : 'text-[#A1A1AA] hover:bg-[#181824] hover:text-white'
            }`}
          >
            Privacy & Deletion Requests
          </button>
        </div>
      </div>

      {/* TAB 1: Policy Documents Editor */}
      {activeTab === 'documents' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Document Selector Column (4 cols) */}
          <div className="lg:col-span-4 bg-[#12121A] border border-[#242436] rounded-2xl p-4 space-y-3">
            <h3 className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider border-b border-[#242436] pb-2">
              All Legal & Support Policies
            </h3>
            {loadingDocs ? (
              <div className="py-10 text-center text-xs text-[#71717A]">Loading policies...</div>
            ) : (
              <div className="space-y-1.5 max-h-[650px] overflow-y-auto pr-1">
                {documents.map((doc) => (
                  <button
                    key={doc.slug}
                    type="button"
                    onClick={() => selectDocument(doc)}
                    className={`w-full text-left p-3 rounded-xl text-xs transition-all flex items-center justify-between cursor-pointer ${
                      selectedDoc?.slug === doc.slug
                        ? 'bg-[#D4AF37]/15 border border-[#D4AF37]/50 text-white font-bold'
                        : 'bg-[#161622] border border-transparent text-[#A1A1AA] hover:border-[#2A2A3C] hover:text-white'
                    }`}
                  >
                    <div>
                      <p className="font-sport uppercase tracking-wider">{doc.title}</p>
                      <p className="text-[10px] text-[#71717A] font-sans">
                        v{doc.version} • {doc.slug}
                      </p>
                    </div>
                    {doc.requires_reconsent && (
                      <Badge variant="gold" className="text-[9px] px-1.5 py-0">
                        RECONSENT
                      </Badge>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Document Content Editor (8 cols) */}
          <div className="lg:col-span-8 bg-[#12121A] border border-[#242436] rounded-2xl p-6 space-y-5">
            {selectedDoc ? (
              <>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#242436] pb-4">
                  <div>
                    <span className="text-[10px] text-[#D4AF37] uppercase font-bold tracking-wider block">
                      Editing: {selectedDoc.slug}
                    </span>
                    <h3 className="text-base font-bold text-white uppercase tracking-wider">
                      {draftTitle}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <a
                      href={`/${selectedDoc.slug}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 rounded-lg border border-[#2A2A3C] text-xs text-[#A1A1AA] hover:text-white flex items-center gap-1.5 transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Live View</span>
                    </a>
                    <Button
                      variant="gold"
                      size="sm"
                      onClick={handleSaveDocument}
                      disabled={savingDoc}
                      className="text-xs font-bold"
                    >
                      <Save className="w-3.5 h-3.5 mr-1" />
                      <span>{savingDoc ? 'SAVING...' : 'PUBLISH CHANGES'}</span>
                    </Button>
                  </div>
                </div>

                {/* Metadata Row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-sans">
                  <div>
                    <label className="block text-[10px] font-sport font-bold uppercase text-[#71717A] mb-1">
                      DOCUMENT TITLE
                    </label>
                    <input
                      type="text"
                      value={draftTitle}
                      onChange={(e) => setDraftTitle(e.target.value)}
                      className="w-full bg-[#181824] border border-[#2A2A3C] focus:border-[#D4AF37] text-white px-3 py-2 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-sport font-bold uppercase text-[#71717A] mb-1">
                      DOCUMENT VERSION
                    </label>
                    <input
                      type="text"
                      value={draftVersion}
                      onChange={(e) => setDraftVersion(e.target.value)}
                      placeholder="e.g. 1.0, 1.1, 2.0"
                      className="w-full bg-[#181824] border border-[#2A2A3C] focus:border-[#D4AF37] text-white px-3 py-2 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-sport font-bold uppercase text-[#71717A] mb-1">
                      EFFECTIVE DATE
                    </label>
                    <input
                      type="text"
                      value={draftDate}
                      onChange={(e) => setDraftDate(e.target.value)}
                      placeholder="e.g. September 2026"
                      className="w-full bg-[#181824] border border-[#2A2A3C] focus:border-[#D4AF37] text-white px-3 py-2 rounded-lg text-xs"
                    />
                  </div>
                </div>

                {/* Re-consent Toggle */}
                <div className="p-3.5 rounded-xl bg-[#181824] border border-[#2A2A3C] flex items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-white uppercase tracking-wider block">
                      Require User Re-Consent Upon Publishing
                    </span>
                    <p className="text-[11px] text-[#71717A] font-sans leading-relaxed">
                      If checked, logged-in customers will see a one-time acknowledgement modal on their next visit to accept this updated version.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={draftReconsent}
                    onChange={(e) => setDraftReconsent(e.target.checked)}
                    className="w-4 h-4 accent-[#D4AF37] cursor-pointer"
                  />
                </div>

                {/* Content Editor */}
                <div className="space-y-1.5 font-sans">
                  <label className="block text-[10px] font-sport font-bold uppercase text-[#71717A]">
                    POLICY CONTENT (MARKDOWN / TEXT)
                  </label>
                  <textarea
                    rows={18}
                    value={draftContent}
                    onChange={(e) => setDraftContent(e.target.value)}
                    className="w-full bg-[#181824] border border-[#2A2A3C] focus:border-[#D4AF37] text-white p-3.5 rounded-xl text-xs font-mono leading-relaxed focus:outline-none"
                  />
                </div>
              </>
            ) : (
              <div className="py-20 text-center text-xs text-[#71717A]">
                Select a policy from the left to edit
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: Consent Audit Log */}
      {activeTab === 'consent_log' && (
        <div className="bg-[#12121A] border border-[#242436] rounded-2xl p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#242436] pb-4">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Auditable Consent Records
              </h3>
              <p className="text-xs text-[#71717A] font-sans">
                Immutable chronological log of customer terms acceptance, checkout confirmations, and cookie preferences
              </p>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={consentFilter}
                onChange={(e) => setConsentFilter(e.target.value)}
                className="bg-[#181824] border border-[#2A2A3C] text-xs text-white px-3 py-2 rounded-xl focus:outline-none font-sans"
              >
                <option value="">All Consent Types</option>
                <option value="TERMS_AND_PRIVACY">Terms & Privacy</option>
                <option value="TERMS_OF_SALE">Terms of Sale</option>
                <option value="MARKETING_PROMOTIONS">Marketing Opt-In</option>
                <option value="COOKIE_PREFERENCES">Cookie Preferences</option>
              </select>
              <Button variant="outline" size="sm" onClick={fetchConsentRecords} className="text-xs border-[#2A2A3C]">
                REFRESH
              </Button>
            </div>
          </div>

          {loadingConsent ? (
            <div className="py-16 text-center text-xs text-[#71717A]">Loading consent records...</div>
          ) : consentRecords.length === 0 ? (
            <div className="py-16 text-center text-xs text-[#71717A]">No consent records found for this filter.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#181824] text-[#A1A1AA] uppercase text-[10px] font-sport tracking-wider border-b border-[#242436]">
                  <tr>
                    <th className="p-3">Timestamp</th>
                    <th className="p-3">Consent Type</th>
                    <th className="p-3">Document</th>
                    <th className="p-3">Version</th>
                    <th className="p-3">Source</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">User ID</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1E1E2A] font-sans">
                  {consentRecords.map((r) => (
                    <tr key={r.id} className="hover:bg-[#161622] transition-colors">
                      <td className="p-3 text-[#71717A] whitespace-nowrap">
                        {new Date(r.created_at).toLocaleString('en-IN')}
                      </td>
                      <td className="p-3 font-sport uppercase font-bold text-white">
                        {r.consent_type}
                      </td>
                      <td className="p-3 text-[#A1A1AA]">{r.document_type}</td>
                      <td className="p-3 text-[#D4AF37] font-bold">v{r.document_version}</td>
                      <td className="p-3 text-[#71717A]">{r.source}</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            r.consent_status === 'ACCEPTED'
                              ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/50'
                              : 'bg-zinc-800 text-zinc-400'
                          }`}
                        >
                          {r.consent_status}
                        </span>
                      </td>
                      <td className="p-3 font-mono text-[11px] text-[#71717A] truncate max-w-[120px]">
                        {r.user_id || 'Guest'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Privacy & Deletion Requests Queue */}
      {activeTab === 'privacy_requests' && (
        <div className="bg-[#12121A] border border-[#242436] rounded-2xl p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#242436] pb-4">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Customer Data & Account Deletion Requests
              </h3>
              <p className="text-xs text-[#71717A] font-sans">
                Review authenticated requests for account deletion and data rights. Ensure statutory tax retention checks before completion.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={requestFilter}
                onChange={(e) => setRequestFilter(e.target.value)}
                className="bg-[#181824] border border-[#2A2A3C] text-xs text-white px-3 py-2 rounded-xl focus:outline-none font-sans"
              >
                <option value="">All Statuses</option>
                <option value="PENDING">Pending</option>
                <option value="IN_REVIEW">In Review</option>
                <option value="COMPLETED">Completed</option>
                <option value="REJECTED">Rejected</option>
              </select>
              <Button variant="outline" size="sm" onClick={fetchPrivacyRequests} className="text-xs border-[#2A2A3C]">
                REFRESH
              </Button>
            </div>
          </div>

          {loadingRequests ? (
            <div className="py-16 text-center text-xs text-[#71717A]">Loading privacy requests...</div>
          ) : privacyRequests.length === 0 ? (
            <div className="py-16 text-center text-xs text-[#71717A]">No customer privacy requests pending.</div>
          ) : (
            <div className="space-y-3">
              {privacyRequests.map((req) => (
                <div
                  key={req.id}
                  className="p-4 rounded-xl bg-[#161622] border border-[#2A2A3C] space-y-3 font-sans text-xs"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#242436] pb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm font-sport uppercase">
                        {req.customer_name}
                      </span>
                      <span className="text-[#71717A]">({req.customer_email})</span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          req.status === 'PENDING'
                            ? 'bg-amber-950/60 text-amber-400 border border-amber-800/40'
                            : req.status === 'COMPLETED'
                            ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/40'
                            : 'bg-zinc-800 text-zinc-400'
                        }`}
                      >
                        {req.status}
                      </span>
                    </div>
                    <span className="text-[11px] text-[#71717A]">
                      Submitted: {new Date(req.created_at).toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <p className="text-[10px] font-sport font-bold uppercase text-[#71717A]">REQUEST TYPE</p>
                      <p className="font-bold text-[#D4AF37] font-sport uppercase">{req.request_type}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-sport font-bold uppercase text-[#71717A]">CUSTOMER REASON</p>
                      <p className="text-[#A1A1AA]">{req.reason || 'None provided'}</p>
                    </div>
                  </div>

                  {req.admin_notes && (
                    <div className="p-2.5 rounded-lg bg-[#121218] border border-[#242436] text-[11px] text-[#A1A1AA]">
                      <strong className="text-white">Admin Notes:</strong> {req.admin_notes}
                    </div>
                  )}

                  {req.status === 'PENDING' && (
                    <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-[#242436] font-sport">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleResolvePrivacyRequest(req.id, 'IN_REVIEW')}
                        disabled={updatingRequestId === req.id}
                        className="text-xs border-[#2A2A3C]"
                      >
                        MARK IN REVIEW
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleResolvePrivacyRequest(req.id, 'REJECTED')}
                        disabled={updatingRequestId === req.id}
                        className="text-xs border-red-900/40 text-red-400"
                      >
                        REJECT
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleResolvePrivacyRequest(req.id, 'COMPLETED')}
                        disabled={updatingRequestId === req.id}
                        className="text-xs bg-red-600 hover:bg-red-700 text-white font-bold"
                      >
                        DEACTIVATE ACCOUNT & COMPLETE
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
