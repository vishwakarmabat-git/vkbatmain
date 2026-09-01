import React, { useEffect, useState } from 'react';
import { History, Shield, Clock } from 'lucide-react';
import { adminService } from '@/services/adminService';
import { ActivityLog } from '@/types';
import { Badge } from '@/components/ui/Badge';

export const AdminActivityLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService
      .getActivityLogs()
      .then(setLogs)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6 text-left">
      <div className="border-b border-[#24242D] pb-4">
        <span className="text-xs font-sport font-bold tracking-widest text-[#D4AF37] uppercase">
          SECURITY & AUDIT TRAILS
        </span>
        <h1 className="text-2xl sm:text-3xl font-serif font-black text-[#F4F4F5] uppercase mt-0.5">
          ADMIN ACTIVITY AUDIT LOGS ({logs.length})
        </h1>
      </div>

      <div className="bg-[#121216] border border-[#24242D] rounded-md overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sport tracking-wider">
            <thead className="bg-[#181821] border-b border-[#24242D] text-[#71717A] uppercase">
              <tr>
                <th className="py-3 px-4 font-semibold">ACTION</th>
                <th className="py-3 px-4 font-semibold">ENTITY TYPE</th>
                <th className="py-3 px-4 font-semibold">DETAILS / REASON</th>
                <th className="py-3 px-4 font-semibold">IP ADDRESS</th>
                <th className="py-3 px-4 font-semibold">TIMESTAMP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#24242D]/60">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-[#71717A]">
                    Loading audit trail...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-[#71717A]">
                    No activity logs recorded yet.
                  </td>
                </tr>
              ) : (
                logs.map((l) => (
                  <tr key={l.id} className="hover:bg-[#181821]/40 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-[#D4AF37] text-sm uppercase">
                      {l.action}
                    </td>
                    <td className="py-3.5 px-4 text-white uppercase">{l.entity_type}</td>
                    <td className="py-3.5 px-4 text-[#A1A1AA] max-w-sm">{l.details || 'N/A'}</td>
                    <td className="py-3.5 px-4 text-[#71717A]">{l.ip_address || '127.0.0.1'}</td>
                    <td className="py-3.5 px-4 text-[#71717A]">
                      {new Date(l.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
