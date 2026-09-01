import React from 'react';
import { Badge } from '@/components/ui/Badge';

export const ShippingPolicyPage: React.FC = () => (
  <div className="max-w-4xl mx-auto px-4 py-12 text-left space-y-6">
    <Badge variant="gold">DELIVERY INFORMATION</Badge>
    <h1 className="text-3xl font-serif font-black text-[#F4F4F5] uppercase">SHIPPING & DISPATCH POLICY</h1>
    <div className="bg-[#121216] border border-[#24242D] p-6 rounded-md space-y-4 text-xs text-[#A1A1AA] leading-relaxed">
      <p>All Vishwakarma handcrafted bats are packed in heavy-duty padded bat tubes with shock-absorbent foam inserts to ensure zero transit damage.</p>
      <h3 className="text-sm font-bold text-white font-sport uppercase">DOMESTIC SHIPPING (INDIA)</h3>
      <p>Orders are dispatched within 2-4 business days following cleft selection and knocking in. Standard express insured transit takes 3-5 days across all Indian pin codes. Free express shipping is provided on all orders over ₹15,000.</p>
      <h3 className="text-sm font-bold text-white font-sport uppercase">INTERNATIONAL COURIER</h3>
      <p>We deliver worldwide via DHL Express / FedEx Priority. International tracking is updated immediately upon dispatch from our workshop.</p>
    </div>
  </div>
);

export const RefundPolicyPage: React.FC = () => (
  <div className="max-w-4xl mx-auto px-4 py-12 text-left space-y-6">
    <Badge variant="gold">WARRANTY & REPLACEMENTS</Badge>
    <h1 className="text-3xl font-serif font-black text-[#F4F4F5] uppercase">WARRANTY & REFUND POLICY</h1>
    <div className="bg-[#121216] border border-[#24242D] p-6 rounded-md space-y-4 text-xs text-[#A1A1AA] leading-relaxed">
      <p>Every Grade 1+ English Willow bat manufactured by Vishwakarma Bat House is protected by our 12-Month Structural Guarantee.</p>
      <h3 className="text-sm font-bold text-white font-sport uppercase">HANDLE & DELAMINATION WARRANTY</h3>
      <p>If your handle breaks or the blade experiences defective delamination during normal match use within 12 months of purchase, we will re-handle or replace the bat free of charge.</p>
    </div>
  </div>
);

export const PrivacyPolicyPage: React.FC = () => (
  <div className="max-w-4xl mx-auto px-4 py-12 text-left space-y-6">
    <Badge variant="gold">DATA PROTECTION</Badge>
    <h1 className="text-3xl font-serif font-black text-[#F4F4F5] uppercase">PRIVACY POLICY</h1>
    <div className="bg-[#121216] border border-[#24242D] p-6 rounded-md space-y-4 text-xs text-[#A1A1AA] leading-relaxed">
      <p>Vishwakarma Bat House respects your privacy. We collect customer information strictly for processing orders, generating custom engravings, and sending courier tracking notifications.</p>
      <p>We never sell or distribute your personal contact information to third-party marketing services.</p>
    </div>
  </div>
);

export const TermsPage: React.FC = () => (
  <div className="max-w-4xl mx-auto px-4 py-12 text-left space-y-6">
    <Badge variant="gold">LEGAL TERMS</Badge>
    <h1 className="text-3xl font-serif font-black text-[#F4F4F5] uppercase">TERMS OF SERVICE</h1>
    <div className="bg-[#121216] border border-[#24242D] p-6 rounded-md space-y-4 text-xs text-[#A1A1AA] leading-relaxed">
      <p>By placing an order on Vishwakarma Bat House, you agree to our standard handcrafted terms. As natural English Willow varies in grain density, small organic variations in grain counts are standard hallmarks of genuine artisan wood.</p>
    </div>
  </div>
);
