import React, { useEffect, useState } from 'react';
import { UserCheck, Plus, Trash2, ShieldAlert } from 'lucide-react';
import { adminService } from '@/services/adminService';
import { User } from '@/types';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { toast } from 'sonner';

export const AdminUsersPage: React.FC = () => {
  const [admins, setAdmins] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'admin' | 'staff'>('admin');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const data = await adminService.getAdminUsers();
      setAdmins(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await adminService.createAdminUser({
        full_name: name,
        email,
        password,
        role,
      });
      toast.success(`Admin user ${name} created`);
      setModalOpen(false);
      setName('');
      setEmail('');
      setPassword('');
      fetchAdmins();
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Error creating admin user');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 text-left">
      <div className="border-b border-[#24242D] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-sport font-bold tracking-widest text-[#D4AF37] uppercase">
            ACCESS PERMISSIONS & OPERATORS
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif font-black text-[#F4F4F5] uppercase mt-0.5">
            ADMINISTRATIVE USERS ({admins.length})
          </h1>
        </div>

        <Button variant="gold" size="md" onClick={() => setModalOpen(true)} leftIcon={<Plus className="w-4 h-4" />}>
          INVITE ADMIN / STAFF
        </Button>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block bg-[#121216] border border-[#24242D] rounded-md overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sport tracking-wider">
            <thead className="bg-[#181821] border-b border-[#24242D] text-[#71717A] uppercase">
              <tr>
                <th className="py-3 px-4 font-semibold">NAME</th>
                <th className="py-3 px-4 font-semibold">EMAIL</th>
                <th className="py-3 px-4 font-semibold">ROLE</th>
                <th className="py-3 px-4 font-semibold">CREATED DATE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#24242D]/60">
              {admins.map((u) => (
                <tr key={u.id} className="hover:bg-[#181821]/40 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-white text-sm">{u.full_name}</td>
                  <td className="py-3.5 px-4 text-[#D4AF37]">{u.email}</td>
                  <td className="py-3.5 px-4">
                    <Badge variant={u.role === 'superadmin' ? 'gold' : 'dark'}>
                      {u.role.toUpperCase()}
                    </Badge>
                  </td>
                  <td className="py-3.5 px-4 text-[#71717A]">
                    {new Date(u.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card Stack View (Zero Horizontal Scrolling) */}
      <div className="md:hidden space-y-3 font-sport text-xs">
        {admins.length === 0 ? (
          <div className="py-8 text-center text-[#71717A]">No admin users found.</div>
        ) : (
          admins.map((u) => (
            <div
              key={u.id}
              className="bg-[#121216] border border-[#24242D] rounded-md p-4 space-y-2 shadow-lg"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="font-bold text-white text-sm">{u.full_name}</h4>
                  <div className="text-[11px] text-[#D4AF37] break-all">{u.email}</div>
                </div>
                <Badge variant={u.role === 'superadmin' ? 'gold' : 'dark'}>
                  {u.role.toUpperCase()}
                </Badge>
              </div>

              <div className="pt-2 border-t border-[#24242D]/60 text-[10px] text-[#71717A]">
                Created: {new Date(u.created_at).toLocaleDateString()}
              </div>
            </div>
          ))
        )}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="INVITE ADMIN USER">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input label="FULL NAME" placeholder="Master Artisan Admin" value={name} onChange={(e) => setName(e.target.value)} required />
          <Input label="EMAIL ADDRESS" type="email" placeholder="admin2@vkbathouse.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <Input label="INITIAL PASSWORD" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#A1A1AA] font-sport mb-1.5">
              ROLE & PERMISSION LEVEL
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as any)}
              className="w-full bg-[#121216] border border-[#24242D] text-white p-2.5 text-sm rounded-sm"
            >
              <option value="admin">Administrator (Full Access)</option>
              <option value="staff">Staff (Orders & Fulfillment)</option>
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setModalOpen(false)}>CANCEL</Button>
            <Button type="submit" variant="gold" size="sm" isLoading={isSubmitting}>CREATE ADMIN</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
