import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Briefcase,
  Search,
  Phone,
  Mail,
  Building2,
  Calendar,
  MessageCircle,
  Clock,
  Trash2,
  FileText,
  Save,
  CheckCircle,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import { bulkOrderService, BulkOrderData } from '@/services/bulkOrderService';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { toast } from 'sonner';
import { useRealtimeSync } from '@/hooks/useRealtime';

export const AdminBulkOrdersPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const statusFilter = searchParams.get('status') || '';

  const [inquiries, setInquiries] = useState<BulkOrderData[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [editingNotesId, setEditingNotesId] = useState<string | null>(null);
  const [notesDraft, setNotesDraft] = useState('');

  const fetchInquiries = () => {
    setLoading(true);
    bulkOrderService
      .getAdminBulkOrders(statusFilter || undefined, search || undefined)
      .then(setInquiries)
      .catch((err) => {
        console.error(err);
        toast.error('Failed to load bulk order inquiries.');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchInquiries();
  }, [statusFilter, search]);

  // Real-time synchronization without manual browser refresh
  useRealtimeSync('vk:realtime:bulk_orders', fetchInquiries);

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const updated = await bulkOrderService.updateStatus(id, newStatus);
      setInquiries((prev) => prev.map((item) => (item.id === id ? updated : item)));
      toast.success(`Inquiry status changed to ${newStatus}`);
    } catch (err) {
      toast.error('Failed to update status.');
    }
  };

  const handleSaveNotes = async (id: string) => {
    try {
      const inquiry = inquiries.find((i) => i.id === id);
      if (!inquiry) return;
      const updated = await bulkOrderService.updateStatus(id, inquiry.status, notesDraft);
      setInquiries((prev) => prev.map((item) => (item.id === id ? updated : item)));
      setEditingNotesId(null);
      toast.success('Admin notes saved successfully.');
    } catch (err) {
      toast.error('Failed to save admin notes.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this bulk order inquiry?')) return;
    try {
      await bulkOrderService.deleteBulkOrder(id);
      setInquiries((prev) => prev.filter((item) => item.id !== id));
      toast.success('Inquiry deleted.');
    } catch (err) {
      toast.error('Failed to delete inquiry.');
    }
  };

  const handleWhatsAppContact = (inquiry: BulkOrderData) => {
    const text =
      `Hello ${inquiry.name}, this is Vishwakarma Bat House B2B team regarding your inquiry for ${inquiry.order_quantity || 'custom bats'}${inquiry.club_name ? ` for ${inquiry.club_name}` : ''}.\n\n` +
      `We have reviewed your specifications: "${inquiry.details}". How can we assist you with our bespoke pricing?`;
    const cleanPhone = inquiry.phone.replace(/[^0-9]/g, '');
    const phoneWithCountry = cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`;
    window.open(`https://wa.me/${phoneWithCountry}?text=${encodeURIComponent(text)}`, '_blank');
  };

  // Summary Metrics
  const totalCount = inquiries.length;
  const pendingCount = inquiries.filter((i) => i.status === 'PENDING').length;
  const quotedCount = inquiries.filter((i) => i.status === 'QUOTED' || i.status === 'CONTACTED').length;
  const completedCount = inquiries.filter((i) => i.status === 'COMPLETED').length;

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div className="border-b border-[#24242D] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-sport font-bold tracking-widest text-[#D4AF37] uppercase">
            B2B & INSTITUTIONAL ACQUISITIONS
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif font-black text-[#F4F4F5] uppercase mt-0.5 flex items-center gap-3">
            <span>BULK ORDERS & QUOTES</span>
            <span className="text-sm font-sport bg-[#181821] border border-[#24242D] text-[#D4AF37] px-2.5 py-0.5 rounded-full">
              {totalCount} Total
            </span>
          </h1>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={fetchInquiries}
          leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />}
        >
          REFRESH INQUIRIES
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-[#121216] border border-[#24242D] rounded-xl p-4 space-y-1">
          <span className="text-[10px] font-sport uppercase text-[#71717A] tracking-wider block">
            TOTAL INQUIRIES
          </span>
          <span className="text-2xl font-sport font-black text-white block">{totalCount}</span>
        </div>

        <div className="bg-[#121216] border border-amber-500/30 rounded-xl p-4 space-y-1">
          <span className="text-[10px] font-sport uppercase text-amber-400 tracking-wider block">
            PENDING REVIEW
          </span>
          <span className="text-2xl font-sport font-black text-amber-400 block">{pendingCount}</span>
        </div>

        <div className="bg-[#121216] border border-blue-500/30 rounded-xl p-4 space-y-1">
          <span className="text-[10px] font-sport uppercase text-blue-400 tracking-wider block">
            IN CONTACT / QUOTED
          </span>
          <span className="text-2xl font-sport font-black text-blue-400 block">{quotedCount}</span>
        </div>

        <div className="bg-[#121216] border border-emerald-500/30 rounded-xl p-4 space-y-1">
          <span className="text-[10px] font-sport uppercase text-emerald-400 tracking-wider block">
            COMPLETED / CLOSED
          </span>
          <span className="text-2xl font-sport font-black text-emerald-400 block">{completedCount}</span>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-[#121216] border border-[#24242D] rounded-xl p-4">
        {/* Status Tabs */}
        <div className="flex flex-wrap gap-1.5 font-sport text-xs">
          {[
            { key: '', label: 'ALL INQUIRIES' },
            { key: 'PENDING', label: 'PENDING' },
            { key: 'CONTACTED', label: 'CONTACTED' },
            { key: 'QUOTED', label: 'QUOTED' },
            { key: 'COMPLETED', label: 'COMPLETED' },
            { key: 'ARCHIVED', label: 'ARCHIVED' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => {
                const params = new URLSearchParams(searchParams);
                if (tab.key) params.set('status', tab.key);
                else params.delete('status');
                setSearchParams(params);
              }}
              className={`px-3 py-1.5 rounded-lg font-bold uppercase transition-all cursor-pointer ${
                statusFilter === tab.key
                  ? 'bg-[#D4AF37] text-black shadow-md'
                  : 'bg-[#181821] text-[#A1A1AA] hover:text-white border border-[#2A2A36]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full lg:w-72">
          <Search className="w-4 h-4 text-[#71717A] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search name, phone, academy..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#181821] border border-[#2A2A36] focus:border-[#D4AF37] rounded-lg text-xs text-white pl-9 pr-3 py-2 focus:outline-none placeholder:text-[#52525B]"
          />
        </div>
      </div>

      {/* Inquiries List */}
      {loading ? (
        <div className="py-20 text-center space-y-3 font-sport">
          <div className="w-8 h-8 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-[#A1A1AA]">Loading bulk orders...</p>
        </div>
      ) : inquiries.length === 0 ? (
        <div className="bg-[#121216] border border-[#24242D] rounded-xl p-16 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-[#181821] border border-[#24242D] flex items-center justify-center mx-auto text-[#71717A]">
            <Briefcase className="w-8 h-8 text-[#52525B]" />
          </div>
          <h3 className="font-serif font-bold text-lg text-white uppercase">
            No Bulk Orders Found
          </h3>
          <p className="text-xs text-[#71717A] max-w-sm mx-auto">
            {statusFilter
              ? `No inquiries currently with status '${statusFilter}'.`
              : 'Customer bulk requests from the B2B portal will appear here.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {inquiries.map((inquiry) => {
            const isEditingNotes = editingNotesId === inquiry.id;

            return (
              <div
                key={inquiry.id}
                className="bg-[#121216] border border-[#24242D] hover:border-[#3A3A4A] rounded-xl p-5 sm:p-6 transition-all space-y-4 shadow-xl"
              >
                {/* Top Row: Customer Info & Status Badge */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#24242D]">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#181821] border border-[#2A2A36] text-[#D4AF37] flex items-center justify-center font-sport font-black text-base shrink-0">
                      {inquiry.name.charAt(0).toUpperCase()}
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-serif font-bold text-base sm:text-lg text-white">
                          {inquiry.name}
                        </h3>
                        {inquiry.club_name && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-sport font-bold bg-[#181821] text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-md">
                            <Building2 className="w-3 h-3" />
                            {inquiry.club_name}
                          </span>
                        )}
                        <span className="text-[10px] font-sport text-[#71717A] bg-[#181821] border border-[#24242D] px-2 py-0.5 rounded-md uppercase">
                          {inquiry.inquiry_type === 'custom_requirement' ? 'Custom Spec' : 'Bulk B2B'}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-[#A1A1AA] font-sport mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-[#71717A]" />
                          {new Date(inquiry.created_at).toLocaleString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Status Dropdown */}
                  <div className="flex items-center gap-2 font-sport">
                    <span className="text-[10px] uppercase font-bold text-[#71717A]">STATUS:</span>
                    <select
                      value={inquiry.status}
                      onChange={(e) => handleStatusChange(inquiry.id, e.target.value)}
                      className={`text-xs font-black uppercase px-3 py-1.5 rounded-lg border focus:outline-none cursor-pointer ${
                        inquiry.status === 'PENDING'
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                          : inquiry.status === 'CONTACTED'
                          ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                          : inquiry.status === 'QUOTED'
                          ? 'bg-purple-500/10 text-purple-400 border-purple-500/30'
                          : inquiry.status === 'COMPLETED'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : 'bg-[#181821] text-[#71717A] border-[#2A2A36]'
                      }`}
                    >
                      <option value="PENDING" className="bg-[#121216] text-amber-400">PENDING</option>
                      <option value="CONTACTED" className="bg-[#121216] text-blue-400">CONTACTED</option>
                      <option value="QUOTED" className="bg-[#121216] text-purple-400">QUOTED</option>
                      <option value="COMPLETED" className="bg-[#121216] text-emerald-400">COMPLETED</option>
                      <option value="ARCHIVED" className="bg-[#121216] text-[#71717A]">ARCHIVED</option>
                    </select>

                    <button
                      onClick={() => handleDelete(inquiry.id)}
                      className="p-1.5 text-[#52525B] hover:text-red-400 transition-colors rounded-md hover:bg-[#181821]"
                      title="Delete inquiry"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Middle: Details & Requested Specs */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  {/* Left Column: Requirements & Bat Models (8 cols) */}
                  <div className="md:col-span-8 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      {inquiry.order_quantity && (
                        <div className="bg-[#181821] border border-[#2A2A36] px-2.5 py-1 rounded-md text-xs font-sport">
                          <span className="text-[#71717A] font-bold">QTY: </span>
                          <span className="text-[#D4AF37] font-black">{inquiry.order_quantity}</span>
                        </div>
                      )}

                      {inquiry.bat_models && (
                        <div className="bg-[#181821] border border-[#2A2A36] px-2.5 py-1 rounded-md text-xs font-sport">
                          <span className="text-[#71717A] font-bold">MODELS: </span>
                          <span className="text-white font-bold">{inquiry.bat_models}</span>
                        </div>
                      )}
                    </div>

                    <div className="bg-[#181821] border border-[#24242D] rounded-lg p-3.5 space-y-1">
                      <span className="text-[10px] font-sport font-bold text-[#71717A] uppercase tracking-wider block">
                        CUSTOM SPECIFICATIONS & CLIENT REQUIREMENTS
                      </span>
                      <p className="text-xs text-[#F4F4F5] font-sport leading-relaxed whitespace-pre-line">
                        {inquiry.details}
                      </p>
                    </div>

                    {/* Admin Internal Notes Block */}
                    <div className="bg-[#16161E] border border-[#2A2A36] rounded-lg p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-sport font-bold text-[#D4AF37] uppercase tracking-wider flex items-center gap-1">
                          <FileText className="w-3 h-3" />
                          INTERNAL ADMIN NOTES & QUOTATION LOG
                        </span>
                        {!isEditingNotes && (
                          <button
                            onClick={() => {
                              setEditingNotesId(inquiry.id);
                              setNotesDraft(inquiry.admin_notes || '');
                            }}
                            className="text-[10px] text-[#A1A1AA] hover:text-white underline cursor-pointer"
                          >
                            {inquiry.admin_notes ? 'Edit Notes' : '+ Add Notes'}
                          </button>
                        )}
                      </div>

                      {isEditingNotes ? (
                        <div className="space-y-2">
                          <textarea
                            value={notesDraft}
                            onChange={(e) => setNotesDraft(e.target.value)}
                            placeholder="Enter quotation details, pricing offered, or call discussion logs..."
                            className="w-full bg-[#121216] border border-[#2A2A36] focus:border-[#D4AF37] rounded p-2 text-xs text-white focus:outline-none h-16 resize-none"
                          />
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => setEditingNotesId(null)}
                              className="text-xs text-[#71717A] hover:text-white px-2 py-1"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleSaveNotes(inquiry.id)}
                              className="bg-[#D4AF37] text-black font-sport font-bold text-xs px-3 py-1 rounded flex items-center gap-1 cursor-pointer"
                            >
                              <Save className="w-3 h-3" />
                              Save
                            </button>
                          </div>
                        </div>
                      ) : inquiry.admin_notes ? (
                        <p className="text-xs text-[#A1A1AA] font-sport italic">
                          "{inquiry.admin_notes}"
                        </p>
                      ) : (
                        <p className="text-[11px] text-[#52525B] font-sport">
                          No notes logged yet. Click "+ Add Notes" to record negotiations or pricing.
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right Column: 1-Click Contact Actions (4 cols) */}
                  <div className="md:col-span-4 bg-[#181821] border border-[#24242D] rounded-lg p-3.5 flex flex-col justify-between space-y-3">
                    <div className="space-y-2 font-sport text-xs">
                      <span className="text-[10px] font-bold text-[#71717A] uppercase tracking-wider block">
                        DIRECT CONTACT CHANNELS
                      </span>

                      {/* Phone */}
                      <div className="flex items-center justify-between text-[#F4F4F5]">
                        <span className="text-[#71717A]">Phone:</span>
                        <a
                          href={`tel:${inquiry.phone}`}
                          className="font-bold text-[#D4AF37] hover:underline"
                        >
                          {inquiry.phone}
                        </a>
                      </div>

                      {/* Email */}
                      {inquiry.email && (
                        <div className="flex items-center justify-between text-[#F4F4F5] truncate">
                          <span className="text-[#71717A]">Email:</span>
                          <a
                            href={`mailto:${inquiry.email}`}
                            className="font-bold text-white hover:underline truncate max-w-[140px]"
                            title={inquiry.email}
                          >
                            {inquiry.email}
                          </a>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-2 pt-2 border-t border-[#24242D]">
                      <Button
                        variant="whatsapp"
                        size="sm"
                        className="w-full text-xs font-sport font-black"
                        onClick={() => handleWhatsAppContact(inquiry)}
                        leftIcon={<MessageCircle className="w-4 h-4" />}
                      >
                        REPLY VIA WHATSAPP
                      </Button>

                      <div className="grid grid-cols-2 gap-2">
                        <a href={`tel:${inquiry.phone}`} className="w-full">
                          <Button variant="outline" size="sm" className="w-full text-[11px] font-sport" leftIcon={<Phone className="w-3 h-3" />}>
                            CALL
                          </Button>
                        </a>

                        {inquiry.email ? (
                          <a href={`mailto:${inquiry.email}`} className="w-full">
                            <Button variant="outline" size="sm" className="w-full text-[11px] font-sport" leftIcon={<Mail className="w-3 h-3" />}>
                              EMAIL
                            </Button>
                          </a>
                        ) : (
                          <Button variant="outline" size="sm" disabled className="w-full text-[11px] font-sport opacity-40">
                            NO EMAIL
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
