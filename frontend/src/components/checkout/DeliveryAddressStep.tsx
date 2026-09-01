import React, { useState, useEffect } from 'react';
import { MapPin, User, Phone, Mail, Home, Building2, Bookmark, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Address } from '@/types';
import { authService } from '@/services/authService';

export const INDIAN_STATES = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  'Andaman and Nicobar Islands',
  'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi',
  'Jammu and Kashmir',
  'Ladakh',
  'Lakshadweep',
  'Puducherry',
];

export interface AddressFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address1: string;
  city: string;
  stateName: string;
  pincode: string;
  customerNotes: string;
}

export interface AddressValidationErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  address1?: string;
  city?: string;
  stateName?: string;
  pincode?: string;
}

interface DeliveryAddressStepProps {
  formData: AddressFormData;
  onChange: (field: keyof AddressFormData, value: string) => void;
  onApplySavedAddress?: (address: Address) => void;
  onSubmit: () => void;
}

export const validateAddress = (data: AddressFormData): AddressValidationErrors => {
  const errors: AddressValidationErrors = {};

  if (!data.firstName.trim()) {
    errors.firstName = 'First name is required';
  } else if (data.firstName.trim().length < 2) {
    errors.firstName = 'First name must be at least 2 characters';
  }

  if (!data.lastName.trim()) {
    errors.lastName = 'Last name is required';
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!data.email.trim()) {
    errors.email = 'Email address is required';
  } else if (!emailRegex.test(data.email.trim())) {
    errors.email = 'Enter a valid email address (e.g. name@domain.com)';
  }

  const cleanPhone = data.phone.replace(/[\s\-+()]/g, '');
  const indianPhoneRegex = /^(?:91)?[6-9]\d{9}$/;
  if (!data.phone.trim()) {
    errors.phone = 'Mobile phone number is required';
  } else if (!indianPhoneRegex.test(cleanPhone)) {
    errors.phone = 'Enter a valid 10-digit Indian mobile number';
  }

  if (!data.address1.trim()) {
    errors.address1 = 'Street address / House number is required';
  } else if (data.address1.trim().length < 5) {
    errors.address1 = 'Please enter a complete delivery address';
  }

  if (!data.city.trim()) {
    errors.city = 'City / Town is required';
  }

  if (!data.stateName.trim()) {
    errors.stateName = 'State is required';
  }

  const pinRegex = /^\d{6}$/;
  if (!data.pincode.trim()) {
    errors.pincode = '6-digit PIN code is required';
  } else if (!pinRegex.test(data.pincode.trim())) {
    errors.pincode = 'Enter a valid 6-digit postal PIN code';
  }

  return errors;
};

export const DeliveryAddressStep: React.FC<DeliveryAddressStepProps> = ({
  formData,
  onChange,
  onApplySavedAddress,
  onSubmit,
}) => {
  const [errors, setErrors] = useState<AddressValidationErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);

  // Fetch saved user addresses if available
  useEffect(() => {
    let isMounted = true;
    setLoadingAddresses(true);
    authService
      .getAddresses()
      .then((res) => {
        if (isMounted && res && res.length > 0) {
          setSavedAddresses(res);
        }
      })
      .catch(() => {
        // silent if guest or unauthenticated
      })
      .finally(() => {
        if (isMounted) setLoadingAddresses(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleBlur = (field: keyof AddressFormData) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const currentErrors = validateAddress(formData);
    setErrors(currentErrors);
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    const currentErrors = validateAddress(formData);
    setErrors(currentErrors);
    setTouched({
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      address1: true,
      city: true,
      stateName: true,
      pincode: true,
    });

    if (Object.keys(currentErrors).length === 0) {
      onSubmit();
    }
  };

  const handleSelectSaved = (addr: Address) => {
    if (onApplySavedAddress) {
      onApplySavedAddress(addr);
    } else {
      const parts = (addr.full_name || '').trim().split(' ');
      onChange('firstName', parts[0] || '');
      onChange('lastName', parts.slice(1).join(' ') || '');
      onChange('phone', addr.phone || '');
      onChange('address1', addr.address_line1 || '');
      onChange('city', addr.city || '');
      onChange('stateName', addr.state || '');
      onChange('pincode', addr.pincode || '');
    }
    setErrors({});
  };

  return (
    <div className="bg-[#121216] border border-[#1E1E28] rounded-xl p-5 sm:p-8 space-y-6 shadow-xl text-left">
      {/* Step Header */}
      <div className="border-b border-[#1E1E28] pb-4 space-y-1">
        <div className="flex items-center gap-2 text-[#D4AF37]">
          <MapPin className="w-5 h-5" />
          <h2 className="text-xl sm:text-2xl font-serif font-black text-white tracking-wide uppercase">
            Delivery Address
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-[#A1A1AA]">
          Where should we deliver your handcrafted bat and cricket gear?
        </p>
      </div>

      {/* Saved Addresses Bar (If available) */}
      {savedAddresses.length > 0 && (
        <div className="space-y-2.5 bg-[#09090C] border border-[#1E1E28] p-3.5 sm:p-4 rounded-lg">
          <div className="flex items-center justify-between text-xs font-sport font-bold text-[#D4AF37] uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <Bookmark className="w-3.5 h-3.5" />
              Saved Addresses ({savedAddresses.length})
            </span>
            <span className="text-[10px] text-[#71717A] lowercase font-normal">click to auto-fill</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {savedAddresses.map((addr) => (
              <button
                key={addr.id}
                type="button"
                onClick={() => handleSelectSaved(addr)}
                className="text-left p-3 rounded-md bg-[#121216] hover:bg-[#181821] border border-[#24242D] hover:border-[#D4AF37] transition-all duration-200 group flex items-start justify-between gap-2"
              >
                <div className="min-w-0 space-y-0.5">
                  <div className="font-bold text-xs text-white truncate group-hover:text-[#D4AF37]">
                    {addr.full_name} ({addr.city})
                  </div>
                  <div className="text-[11px] text-[#A1A1AA] truncate">
                    {addr.address_line1}, {addr.pincode}
                  </div>
                  <div className="text-[10px] text-[#71717A]">Ph: {addr.phone}</div>
                </div>
                <span className="text-[10px] font-sport uppercase px-2 py-0.5 bg-[#D4AF37]/10 text-[#D4AF37] rounded-xs shrink-0 font-bold">
                  Use
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Address Form */}
      <form onSubmit={handleSubmitForm} className="space-y-4">
        {/* First & Last Name */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-sport font-bold text-[#A1A1AA] tracking-wider uppercase">
              First Name <span className="text-[#E31B23]">*</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-[#71717A] absolute left-3 top-3 pointer-events-none" />
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => onChange('firstName', e.target.value)}
                onBlur={() => handleBlur('firstName')}
                placeholder="e.g. Virat"
                autoComplete="given-name"
                className={`w-full bg-[#09090C] border ${
                  touched.firstName && errors.firstName
                    ? 'border-red-500/70 focus:border-red-500'
                    : 'border-[#1E1E28] focus:border-[#D4AF37]'
                } text-white pl-9 pr-3.5 py-2.5 rounded-md text-sm outline-none transition-colors placeholder:text-[#52525B]`}
              />
            </div>
            {touched.firstName && errors.firstName && (
              <p className="text-xs text-red-400">{errors.firstName}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-sport font-bold text-[#A1A1AA] tracking-wider uppercase">
              Last Name <span className="text-[#E31B23]">*</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-[#71717A] absolute left-3 top-3 pointer-events-none" />
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => onChange('lastName', e.target.value)}
                onBlur={() => handleBlur('lastName')}
                placeholder="e.g. Kohli"
                autoComplete="family-name"
                className={`w-full bg-[#09090C] border ${
                  touched.lastName && errors.lastName
                    ? 'border-red-500/70 focus:border-red-500'
                    : 'border-[#1E1E28] focus:border-[#D4AF37]'
                } text-white pl-9 pr-3.5 py-2.5 rounded-md text-sm outline-none transition-colors placeholder:text-[#52525B]`}
              />
            </div>
            {touched.lastName && errors.lastName && (
              <p className="text-xs text-red-400">{errors.lastName}</p>
            )}
          </div>
        </div>

        {/* Phone & Email */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-sport font-bold text-[#A1A1AA] tracking-wider uppercase">
              Phone Number (10 Digits) <span className="text-[#E31B23]">*</span>
            </label>
            <div className="relative flex">
              <span className="inline-flex items-center px-3 bg-[#181821] border border-r-0 border-[#1E1E28] rounded-l-md text-xs font-bold text-[#D4AF37] select-none">
                🇮🇳 +91
              </span>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^\d]/g, '').slice(0, 10);
                  onChange('phone', val);
                }}
                onBlur={() => handleBlur('phone')}
                placeholder="9876543210"
                autoComplete="tel"
                maxLength={10}
                className={`w-full bg-[#09090C] border ${
                  touched.phone && errors.phone
                    ? 'border-red-500/70 focus:border-red-500'
                    : 'border-[#1E1E28] focus:border-[#D4AF37]'
                } text-white px-3.5 py-2.5 rounded-r-md text-sm outline-none transition-colors placeholder:text-[#52525B]`}
              />
            </div>
            {touched.phone && errors.phone && (
              <p className="text-xs text-red-400">{errors.phone}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-sport font-bold text-[#A1A1AA] tracking-wider uppercase">
              Email Address <span className="text-[#E31B23]">*</span>
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#71717A] absolute left-3 top-3 pointer-events-none" />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => onChange('email', e.target.value)}
                onBlur={() => handleBlur('email')}
                placeholder="virat@cricket.in"
                autoComplete="email"
                className={`w-full bg-[#09090C] border ${
                  touched.email && errors.email
                    ? 'border-red-500/70 focus:border-red-500'
                    : 'border-[#1E1E28] focus:border-[#D4AF37]'
                } text-white pl-9 pr-3.5 py-2.5 rounded-md text-sm outline-none transition-colors placeholder:text-[#52525B]`}
              />
            </div>
            {touched.email && errors.email && (
              <p className="text-xs text-red-400">{errors.email}</p>
            )}
          </div>
        </div>

        {/* Street Address */}
        <div className="space-y-1.5">
          <label className="block text-xs font-sport font-bold text-[#A1A1AA] tracking-wider uppercase">
            Street Address / House / Flat No. <span className="text-[#E31B23]">*</span>
          </label>
          <div className="relative">
            <Home className="w-4 h-4 text-[#71717A] absolute left-3 top-3 pointer-events-none" />
            <input
              type="text"
              value={formData.address1}
              onChange={(e) => onChange('address1', e.target.value)}
              onBlur={() => handleBlur('address1')}
              placeholder="Flat 402, Royal Residency, Opp. Cricket Stadium"
              autoComplete="street-address"
              className={`w-full bg-[#09090C] border ${
                touched.address1 && errors.address1
                  ? 'border-red-500/70 focus:border-red-500'
                  : 'border-[#1E1E28] focus:border-[#D4AF37]'
              } text-white pl-9 pr-3.5 py-2.5 rounded-md text-sm outline-none transition-colors placeholder:text-[#52525B]`}
            />
          </div>
          {touched.address1 && errors.address1 && (
            <p className="text-xs text-red-400">{errors.address1}</p>
          )}
        </div>

        {/* City, State, PIN Code */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-sport font-bold text-[#A1A1AA] tracking-wider uppercase">
              City / Town <span className="text-[#E31B23]">*</span>
            </label>
            <div className="relative">
              <Building2 className="w-4 h-4 text-[#71717A] absolute left-3 top-3 pointer-events-none" />
              <input
                type="text"
                value={formData.city}
                onChange={(e) => onChange('city', e.target.value)}
                onBlur={() => handleBlur('city')}
                placeholder="Mumbai"
                autoComplete="address-level2"
                className={`w-full bg-[#09090C] border ${
                  touched.city && errors.city
                    ? 'border-red-500/70 focus:border-red-500'
                    : 'border-[#1E1E28] focus:border-[#D4AF37]'
                } text-white pl-9 pr-3.5 py-2.5 rounded-md text-sm outline-none transition-colors placeholder:text-[#52525B]`}
              />
            </div>
            {touched.city && errors.city && (
              <p className="text-xs text-red-400">{errors.city}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-sport font-bold text-[#A1A1AA] tracking-wider uppercase">
              State <span className="text-[#E31B23]">*</span>
            </label>
            <select
              value={formData.stateName}
              onChange={(e) => onChange('stateName', e.target.value)}
              onBlur={() => handleBlur('stateName')}
              className={`w-full bg-[#09090C] border ${
                touched.stateName && errors.stateName
                  ? 'border-red-500/70 focus:border-red-500'
                  : 'border-[#1E1E28] focus:border-[#D4AF37]'
              } text-white px-3 py-2.5 rounded-md text-sm outline-none transition-colors appearance-none cursor-pointer`}
            >
              <option value="" disabled className="bg-[#09090C] text-[#71717A]">
                Select State
              </option>
              {INDIAN_STATES.map((st) => (
                <option key={st} value={st} className="bg-[#121216] text-white">
                  {st}
                </option>
              ))}
            </select>
            {touched.stateName && errors.stateName && (
              <p className="text-xs text-red-400">{errors.stateName}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-sport font-bold text-[#A1A1AA] tracking-wider uppercase">
              PIN Code (6 Digits) <span className="text-[#E31B23]">*</span>
            </label>
            <input
              type="text"
              value={formData.pincode}
              onChange={(e) => {
                const val = e.target.value.replace(/[^\d]/g, '').slice(0, 6);
                onChange('pincode', val);
              }}
              onBlur={() => handleBlur('pincode')}
              placeholder="400001"
              autoComplete="postal-code"
              maxLength={6}
              className={`w-full bg-[#09090C] border ${
                touched.pincode && errors.pincode
                  ? 'border-red-500/70 focus:border-red-500'
                  : 'border-[#1E1E28] focus:border-[#D4AF37]'
              } text-white px-3.5 py-2.5 rounded-md text-sm outline-none transition-colors placeholder:text-[#52525B]`}
            />
            {touched.pincode && errors.pincode && (
              <p className="text-xs text-red-400">{errors.pincode}</p>
            )}
          </div>
        </div>

        {/* Order Notes (Optional) */}
        <div className="space-y-1.5 pt-2">
          <label className="block text-xs font-sport font-bold text-[#71717A] tracking-wider uppercase">
            Order Notes / Special Workshop Requests (Optional)
          </label>
          <textarea
            value={formData.customerNotes}
            onChange={(e) => onChange('customerNotes', e.target.value)}
            rows={2}
            placeholder="Special packing requests, custom initials engraving preference, gate code..."
            className="w-full bg-[#09090C] border border-[#1E1E28] focus:border-[#D4AF37] text-white px-3.5 py-2.5 rounded-md text-sm outline-none transition-colors placeholder:text-[#52525B]"
          />
        </div>

        {/* Action Button */}
        <div className="pt-4 border-t border-[#1E1E28]">
          <Button
            type="submit"
            variant="gold"
            size="lg"
            className="w-full text-sm sm:text-base py-3.5 flex items-center justify-center gap-2 font-black shadow-[0_0_20px_rgba(212,175,55,0.3)]"
          >
            <span>CONTINUE TO PAYMENT</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </form>
    </div>
  );
};
