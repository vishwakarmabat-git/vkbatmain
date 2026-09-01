import React, { useEffect, useState } from 'react';
import { Users, Search, Ban, CheckCircle, AlertTriangle, ShieldAlert } from 'lucide-react';
import { adminService } from '@/services/adminService';
import { User } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { toast } from 'sonner';

export const AdminCustomersPage: React.FC = () => {
  const [customers, setCustomers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Status Toggle Modal State
  const [actionModalOpen, setActionModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<User | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const data = await adminService.getCustomers(search || undefined);
      setCustomers(data);
    } catch (e) {
      console.error(e);
      toast.error('Failed to load customer records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [search]);

  const openActionModal = (customer: User) => {
    setSelectedCustomer(customer);
    setActionModalOpen(true);
  };

  const handleToggleStatus = async () => {
    if (!selectedCustomer) return;
    setIsProcessing(true);
    try {
      const updated = await adminService.toggleCustomerStatus(selectedCustomer.id);
      const actionText = updated.is_active ? 'unblocked' : 'blocked & marked as spam';
      toast.success(`Customer ${updated.full_name} has been ${actionText}!`);
      setActionModalOpen(false);
      setSelectedCustomer(null);
      fetchCustomers();
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Error updating customer status');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div className="border-b border-[#24242D] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-sport font-bold tracking-widest text-[#D4AF37] uppercase">
            BATSMAN DATABASE & SECURITY
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif font-black text-[#F4F4F5] uppercase mt-0.5">
            REGISTERED CUSTOMERS ({customers.length})
          </h1>
        </div>

        <div className="relative max-w-sm w-full">
          <Search className="w-4 h-4 text-[#71717A] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, email, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#121216] border border-[#24242D] focus:border-[#D4AF37] text-xs font-sport tracking-wider text-white pl-9 pr-3 py-2 rounded-xs focus:outline-none placeholder:text-[#52525B]"
          />
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block bg-[#121216] border border-[#24242D] rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sport tracking-wider">
            <thead className="bg-[#181821] border-b border-[#24242D] text-[#71717A] uppercase">
              <tr>
                <th className="py-3.5 px-4 font-semibold">CUSTOMER NAME</th>
                <th className="py-3.5 px-4 font-semibold">EMAIL ADDRESS</th>
                <th className="py-3.5 px-4 font-semibold">PHONE</th>
                <th className="py-3.5 px-4 font-semibold">STATUS</th>
                <th className="py-3.5 px-4 font-semibold">JOINED DATE</th>
                <th className="py-3.5 px-4 font-semibold text-right">SECURITY ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#24242D]/60">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-[#71717A]">
                    Loading customer accounts...
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-[#71717A]">
                    No customers found matching search criteria.
                  </td>
                </tr>
              ) : (
                customers.map((c) => (
                  <tr key={c.id} className="hover:bg-[#181821]/40 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-white text-sm">
                      {c.full_name}
                    </td>
                    <td className="py-3.5 px-4 text-[#D4AF37]">{c.email}</td>
                    <td className="py-3.5 px-4 text-[#A1A1AA]">{c.phone || 'N/A'}</td>
                    <td className="py-3.5 px-4">
                      {c.is_active ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950/60 text-emerald-400 border border-emerald-800/60">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          ACTIVE
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-950/60 text-red-400 border border-red-800/60">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                          BLOCKED / SPAM
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-[#71717A]">
                      {new Date(c.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {c.is_active ? (
                        <button
                          type="button"
                          onClick={() => openActionModal(c)}
                          className="px-3 py-1.5 bg-[#181822] hover:bg-red-950/60 text-[#71717A] hover:text-red-400 border border-[#2A2A3C] hover:border-red-600/50 rounded-md text-[11px] font-black tracking-wider uppercase inline-flex items-center gap-1.5 transition-all cursor-pointer"
                        >
                          <Ban className="w-3.5 h-3.5 text-red-400" />
                          <span>BLOCK / SPAM</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => openActionModal(c)}
                          className="px-3 py-1.5 bg-[#181822] hover:bg-emerald-950/60 text-emerald-400 border border-emerald-800/60 rounded-md text-[11px] font-black tracking-wider uppercase inline-flex items-center gap-1.5 transition-all cursor-pointer"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>UNBLOCK</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card Stack View (Zero Horizontal Scrolling) */}
      <div className="md:hidden space-y-3 font-sport text-xs">
        {loading ? (
          <div className="py-8 text-center text-[#71717A]">Loading customer accounts...</div>
        ) : customers.length === 0 ? (
          <div className="py-8 text-center text-[#71717A]">No customers found.</div>
        ) : (
          customers.map((c) => (
            <div
              key={c.id}
              className="bg-[#121216] border border-[#24242D] rounded-md p-4 space-y-3 shadow-lg"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="font-bold text-white text-sm">{c.full_name}</h4>
                  <div className="text-[11px] text-[#D4AF37] break-all">{c.email}</div>
                  <div className="text-[10px] text-[#71717A]">Phone: {c.phone || 'N/A'}</div>
                </div>
                {c.is_active ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950/60 text-emerald-400 border border-emerald-800/60">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    ACTIVE
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-950/60 text-red-400 border border-red-800/60">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                    BLOCKED
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-[#24242D]/60">
                <span className="text-[10px] text-[#71717A]">
                  Joined: {new Date(c.created_at).toLocaleDateString()}
                </span>

                {c.is_active ? (
                  <button
                    type="button"
                    onClick={() => openActionModal(c)}
                    className="px-3 py-1.5 bg-[#181822] hover:bg-red-950/60 text-red-400 border border-red-800/60 rounded-xs text-[10px] font-black tracking-wider uppercase inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Ban className="w-3 h-3 text-red-400" />
                    <span>BLOCK</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => openActionModal(c)}
                    className="px-3 py-1.5 bg-[#181822] hover:bg-emerald-950/60 text-emerald-400 border border-emerald-800/60 rounded-xs text-[10px] font-black tracking-wider uppercase inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle className="w-3 h-3" />
                    <span>UNBLOCK</span>
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Block / Unblock Action Confirmation Modal */}
      <Modal
        isOpen={actionModalOpen}
        onClose={() => setActionModalOpen(false)}
        title={selectedCustomer?.is_active ? 'BLOCK CUSTOMER / MARK SPAM' : 'UNBLOCK CUSTOMER'}
      >
        <div className="space-y-4 text-left">
          {selectedCustomer?.is_active ? (
            <div className="flex items-start gap-3 p-3 bg-red-950/30 border border-red-900/50 rounded-md text-red-200 text-xs">
              <ShieldAlert className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Block customer: {selectedCustomer?.full_name}?</p>
                <p className="text-red-300 mt-1">
                  Email: <span className="underline font-bold">{selectedCustomer?.email}</span>
                </p>
                <p className="text-red-300 mt-1 text-[11px]">
                  Blocking this account will immediately revoke their access and deactivate login / checkout privileges.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-3 p-3 bg-emerald-950/30 border border-emerald-900/50 rounded-md text-emerald-200 text-xs">
              <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Unblock customer: {selectedCustomer?.full_name}?</p>
                <p className="text-emerald-300 mt-1">
                  Email: <span className="underline font-bold">{selectedCustomer?.email}</span>
                </p>
                <p className="text-emerald-300 mt-1 text-[11px]">
                  This will reactivate their account and restore their ability to log in and place custom bat orders.
                </p>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setActionModalOpen(false)}
            >
              CANCEL
            </Button>
            <Button
              type="button"
              variant={selectedCustomer?.is_active ? 'danger' : 'gold'}
              size="sm"
              isLoading={isProcessing}
              onClick={handleToggleStatus}
            >
              {selectedCustomer?.is_active ? 'CONFIRM BLOCK' : 'CONFIRM UNBLOCK'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
