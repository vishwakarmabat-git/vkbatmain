import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  DollarSign, ShoppingCart, Clock, Package, AlertTriangle, Users,
  TrendingUp, TrendingDown, ArrowUpRight, ArrowRight, ShieldCheck, Box
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell
} from 'recharts';
import { adminService } from '@/services/adminService';
import { AdminDashboardStats } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useRealtimeSync } from '@/hooks/useRealtime';

export const AdminDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = () => {
    adminService
      .getDashboardStats()
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchStats();
  }, []);

  // Realtime instant metrics updates on orders or products
  useRealtimeSync(['vk:realtime:orders', 'vk:realtime:products'], fetchStats);

  if (loading || !stats) {
    return (
      <div className="py-20 text-center space-y-4">
        <div className="w-10 h-10 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="font-sport tracking-widest text-[#A1A1AA] uppercase text-xs">
          Loading Real-Time Executive Analytics...
        </p>
      </div>
    );
  }

  const avgOrderValue = stats.total_orders > 0 ? Math.round(stats.total_revenue / stats.total_orders) : 0;

  const statCards = [
    {
      title: 'TOTAL REVENUE',
      value: `₹${Number(stats.total_revenue).toLocaleString('en-IN')}`,
      growth: stats.revenue_growth_percent >= 0 ? `+${stats.revenue_growth_percent}% vs prev 7d` : `${stats.revenue_growth_percent}% vs prev 7d`,
      isPositive: stats.revenue_growth_percent >= 0,
      icon: <DollarSign className="w-5 h-5 text-[#D4AF37]" />,
      link: '/admin/orders',
    },
    {
      title: 'TOTAL ORDERS',
      value: stats.total_orders,
      growth: stats.orders_growth_percent >= 0 ? `+${stats.orders_growth_percent}% vs prev 7d` : `${stats.orders_growth_percent}% vs prev 7d`,
      isPositive: stats.orders_growth_percent >= 0,
      icon: <ShoppingCart className="w-5 h-5 text-blue-400" />,
      link: '/admin/orders',
    },
    {
      title: 'PENDING ORDERS',
      value: stats.pending_orders,
      growth: stats.pending_orders > 0 ? 'Requires fulfillment action' : 'All orders processed',
      isPositive: stats.pending_orders === 0,
      icon: <Clock className="w-5 h-5 text-amber-400" />,
      link: '/admin/orders?status=pending',
    },
    {
      title: 'ACTIVE PRODUCTS',
      value: stats.total_products,
      growth: `${stats.total_products} active bat models`,
      isPositive: true,
      icon: <Package className="w-5 h-5 text-emerald-400" />,
      link: '/admin/products',
    },
    {
      title: 'REGISTERED PLAYERS',
      value: stats.total_customers,
      growth: `${stats.total_customers} active accounts`,
      isPositive: true,
      icon: <Users className="w-5 h-5 text-purple-400" />,
      link: '/admin/customers',
    },
    {
      title: 'AVG ORDER VALUE',
      value: `₹${avgOrderValue.toLocaleString('en-IN')}`,
      growth: 'Per checkout average',
      isPositive: true,
      icon: <TrendingUp className="w-5 h-5 text-[#D4AF37]" />,
      link: '/admin/orders',
    },
  ];

  return (
    <div className="space-y-8 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-sport font-bold tracking-widest text-[#D4AF37] uppercase">
            OPERATIONS & LIVE REVENUE OVERVIEW
          </span>
          <h1 className="text-3xl font-serif font-black text-[#F4F4F5] uppercase mt-0.5">
            EXECUTIVE DASHBOARD
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/admin/products/new">
            <Button variant="gold" size="sm" leftIcon={<Package className="w-4 h-4" />}>
              ADD NEW BAT
            </Button>
          </Link>
          <Link to="/admin/orders">
            <Button variant="outline" size="sm" leftIcon={<ShoppingCart className="w-4 h-4" />}>
              VIEW ORDERS
            </Button>
          </Link>
        </div>
      </div>

      {/* 6 Real-Time Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {statCards.map((card) => (
          <Link
            key={card.title}
            to={card.link}
            className="bg-[#121216] border border-[#24242D] hover:border-[#D4AF37]/60 rounded-xl p-5 transition-all duration-200 hover:shadow-xl space-y-3 block"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-sport font-bold text-[#71717A] tracking-wider uppercase">
                {card.title}
              </span>
              <div className="p-2 bg-[#181821] rounded-md border border-[#24242D]">
                {card.icon}
              </div>
            </div>

            <div className="text-2xl sm:text-3xl font-sport font-black text-[#F4F4F5]">
              {card.value}
            </div>

            <div className="text-[11px] font-sport text-[#A1A1AA] flex items-center gap-1">
              {card.isPositive ? (
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <TrendingDown className="w-3.5 h-3.5 text-amber-400" />
              )}
              <span>{card.growth}</span>
            </div>
          </Link>
        ))}
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Revenue Trend Area Chart (8 cols) */}
        <div className="lg:col-span-8 bg-[#121216] border border-[#24242D] rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#24242D]">
            <div>
              <h3 className="font-sport font-bold text-base text-[#F4F4F5] uppercase tracking-wider">
                LIVE REVENUE (LAST 7 DAYS)
              </h3>
              <p className="text-xs text-[#71717A]">
                Exact daily sales performance from paid orders in Indian Rupees (INR).
              </p>
            </div>
            <Badge variant="gold">LIVE REVENUE</Badge>
          </div>

          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.revenue_chart}>
                <defs>
                  <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#D4AF37" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#24242D" />
                <XAxis dataKey="date" stroke="#71717A" tick={{ fontSize: 11 }} />
                <YAxis stroke="#71717A" tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#181821', borderColor: '#24242D', color: '#FFF' }}
                  formatter={(value: any) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Revenue']}
                />
                <Area type="monotone" dataKey="revenue" stroke="#D4AF37" strokeWidth={2} fillOpacity={1} fill="url(#goldGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Orders by Status Bar Chart (4 cols) */}
        <div className="lg:col-span-4 bg-[#121216] border border-[#24242D] rounded-xl p-6 space-y-4">
          <div className="pb-2 border-b border-[#24242D]">
            <h3 className="font-sport font-bold text-base text-[#F4F4F5] uppercase tracking-wider">
              ORDER STATUS BREAKDOWN
            </h3>
            <p className="text-xs text-[#71717A]">Real-time fulfillment pipeline state.</p>
          </div>

          <div className="h-72 w-full pt-4">
            {stats.orders_by_status.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs font-sport text-[#71717A] uppercase">
                No orders logged in pipeline
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.orders_by_status}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#24242D" />
                  <XAxis dataKey="status" stroke="#71717A" tick={{ fontSize: 10 }} />
                  <YAxis stroke="#71717A" tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#181821', borderColor: '#24242D', color: '#FFF' }} />
                  <Bar dataKey="count" fill="#D4AF37" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Top Products Table */}
      <div className="bg-[#121216] border border-[#24242D] rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#24242D]">
          <h3 className="font-sport font-bold text-base text-[#F4F4F5] uppercase tracking-wider">
            TOP SELLING CRICKET BLADES
          </h3>
          <Link to="/admin/products" className="text-xs font-sport text-[#D4AF37] hover:underline uppercase">
            VIEW ALL PRODUCTS
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sport tracking-wider">
            <thead>
              <tr className="border-b border-[#24242D] text-[#71717A] uppercase">
                <th className="pb-3 font-semibold">BAT MODEL</th>
                <th className="pb-3 font-semibold">UNITS SOLD</th>
                <th className="pb-3 font-semibold text-right">GROSS REVENUE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#24242D]/50">
              {stats.top_selling_products.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-8 text-center text-[#71717A]">
                    No sales recorded yet. Once customers place orders, top-performing models will rank here automatically.
                  </td>
                </tr>
              ) : (
                stats.top_selling_products.map((item, idx) => (
                  <tr key={idx} className="hover:bg-[#181821]/50 transition-colors">
                    <td className="py-3 font-bold text-white text-sm">{item.name}</td>
                    <td className="py-3 text-[#A1A1AA]">{item.sold} Blades</td>
                    <td className="py-3 text-[#D4AF37] font-black text-right">
                      ₹{item.revenue.toLocaleString('en-IN')}
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
