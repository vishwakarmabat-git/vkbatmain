import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronRight, ChevronLeft, ShoppingBag, Sparkles, Shield, Wrench, MessageCircle } from 'lucide-react';
import { Product, BatCustomization } from '@/types';
import { useCartStore } from '@/store/cartStore';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { orderService } from '@/services/orderService';
import { toast } from 'sonner';

interface BatCustomizerProps {
  product: Product;
  onAddedToCart?: () => void;
}

export const BatCustomizer: React.FC<BatCustomizerProps> = ({ product, onAddedToCart }) => {
  const { addItem } = useCartStore();
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isOrderingWhatsApp, setIsOrderingWhatsApp] = useState(false);

  // Configuration State
  const [weight, setWeight] = useState<string>('1150–1180g');
  const [handleShape, setHandleShape] = useState<string>('Round');
  const [handleSize, setHandleSize] = useState<string>('SH');
  const [gripPattern, setGripPattern] = useState<string>('Chevron');
  const [gripColor, setGripColor] = useState<string>('Metallic Gold');
  const [gripCount, setGripCount] = useState<string>('Single');
  const [stickerFinish, setStickerFinish] = useState<string>('Laser Gold');
  const [preKnocking, setPreKnocking] = useState<string>('Raw');
  const [oiling, setOiling] = useState<string>('None');
  const [faceProtection, setFaceProtection] = useState<string>('None');
  const [customEngraving, setCustomEngraving] = useState<string>('');

  // Calculate Extra Customization Cost
  const calculateExtraCost = (): number => {
    let extra = 0;
    if (gripCount === 'Double') extra += 150;
    if (preKnocking === '5,000 Machine Knocks') extra += 500;
    if (preKnocking === '10,000 Machine Knocks + Match Ready') extra += 999;
    if (oiling === 'Single Layer Linseed Oil') extra += 200;
    if (oiling === 'Double Oil + Face Sheet') extra += 450;
    if (faceProtection === 'Clear Anti-Scuff Sheet') extra += 250;
    if (faceProtection === 'Fibre Edge Tape + Toe Guard') extra += 350;
    if (faceProtection === 'Complete Armor Package (Anti-Scuff + Fibre + Toe)') extra += 550;
    if (customEngraving.trim().length > 0) extra += 300;
    return extra;
  };

  const extraCost = calculateExtraCost();
  const basePrice = Number(product.price);
  const finalUnitPrice = basePrice + extraCost;

  const currentCustomization: BatCustomization = {
    weight,
    handle_shape: handleShape,
    handle_size: handleSize,
    grip_pattern: gripPattern,
    grip_color: gripColor,
    grip_count: gripCount,
    sticker_finish: stickerFinish,
    pre_knocking: preKnocking,
    oiling,
    face_protection: faceProtection,
    custom_engraving: customEngraving.trim() || undefined,
    extra_cost: extraCost,
  };

  const handleAddToCart = () => {
    addItem(product, currentCustomization, 1);
    toast.success(`Customized ${product.name} added to cart!`, {
      description: `Weight: ${weight} | ${handleShape} handle | Knocks: ${preKnocking}`,
    });
    if (onAddedToCart) onAddedToCart();
  };

  const handleWhatsAppOrder = async () => {
    setIsOrderingWhatsApp(true);
    try {
      const res = await orderService.generateWhatsAppOrder({
        items: [{ product_id: product.id, quantity: 1, customization: currentCustomization }],
        customer_name: 'Cricket Enthusiast',
        customer_phone: 'Direct Inquiry',
        city: 'India',
        notes: 'Inquiry from Product Customizer',
      });
      window.open(res.whatsapp_url, '_blank');
    } catch (e) {
      toast.error('Could not generate WhatsApp order');
    } finally {
      setIsOrderingWhatsApp(false);
    }
  };

  const steps = [
    { number: 1, label: 'WEIGHT', title: 'Select Cleft Weight & Pickup' },
    { number: 2, label: 'HANDLE', title: 'Handle Shape & Size' },
    { number: 3, label: 'GRIP', title: 'Grip Style & Color' },
    { number: 4, label: 'FINISH', title: '3D Laser Decal Foil' },
    { number: 5, label: 'ARMOR', title: 'Machine Knocking & Protection' },
    { number: 6, label: 'PERSONALIZE', title: 'Laser Engraving & Final Summary' },
  ];

  return (
    <div className="bg-[#121216] border border-[#24242D] rounded-md p-6 lg:p-8 text-left shadow-2xl relative overflow-hidden">
      {/* Top Gold Accent */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#24242D]">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#D4AF37] animate-ping" />
            <span className="text-xs font-sport uppercase tracking-widest text-[#D4AF37] font-bold">
              ARTISAN BESPOKE STUDIO
            </span>
          </div>
          <h3 className="text-2xl font-serif font-black gold-gradient-text mt-1">
            CUSTOMIZE YOUR CRICKET BLADE
          </h3>
          <p className="text-xs text-[#A1A1AA] mt-0.5">
            Tailor exact weight, handle ergonomics, and protective treatment to your batting DNA.
          </p>
        </div>

        {/* Live Price Tag */}
        <div className="bg-[#181821] border border-[#24242D] px-5 py-2.5 rounded-sm flex flex-col items-end">
          <span className="text-[11px] font-sport uppercase tracking-wider text-[#A1A1AA]">
            Total Custom Unit Price
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-sport font-black text-[#D4AF37]">
              ₹{finalUnitPrice.toLocaleString('en-IN')}
            </span>
            {extraCost > 0 && (
              <span className="text-xs font-sport text-emerald-400">
                (+₹{extraCost} services)
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Step Indicators */}
      <div className="grid grid-cols-6 gap-2 py-6 border-b border-[#24242D]">
        {steps.map((step) => {
          const isActive = currentStep === step.number;
          const isDone = currentStep > step.number;

          return (
            <button
              key={step.number}
              onClick={() => setCurrentStep(step.number)}
              className={`flex flex-col items-center text-center p-2 rounded-sm transition-all ${isActive
                  ? 'bg-[#181821] border-b-2 border-[#D4AF37] text-[#D4AF37]'
                  : isDone
                    ? 'text-[#F4F4F5] hover:bg-[#181821]'
                    : 'text-[#52525B] hover:text-[#A1A1AA]'
                }`}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-sport font-bold mb-1 ${isActive
                    ? 'bg-[#D4AF37] text-[#09090B]'
                    : isDone
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-[#181821] border border-[#24242D]'
                  }`}
              >
                {isDone ? <Check className="w-3 h-3" /> : `0${step.number}`}
              </div>
              <span className="text-[10px] font-sport font-bold tracking-wider uppercase hidden sm:inline">
                {step.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Step Content Area */}
      <div className="py-8 min-h-[300px]">
        <AnimatePresence mode="wait">
          {/* STEP 1: WEIGHT */}
          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <h4 className="text-base font-bold font-sport uppercase tracking-wider text-[#F4F4F5] flex items-center gap-2">
                <span>01. SELECT CLEFT WEIGHT (GRAMS)</span>
              </h4>
              <p className="text-xs text-[#A1A1AA]">
                Our artisans weigh each bat before and after pressing to achieve your exact pickup balance.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
                {[
                  { range: '1120–1150g', name: 'Feather Pickup', desc: 'Lightning bat speed & wristy play' },
                  { range: '1150–1180g', name: 'Balanced All-Round', desc: 'The pro gold standard balance' },
                  { range: '1180–1210g', name: 'Classic Power', desc: 'Enhanced ping through mid-wicket' },
                  { range: '1210–1240g', name: 'Power Hitter', desc: 'Heavy willow density for big boundaries' },
                  { range: '1240–1280g', name: 'Monster Carnage', desc: 'Maximum mass behind the driving zone' },
                ].map((item) => (
                  <button
                    key={item.range}
                    onClick={() => setWeight(item.range)}
                    className={`p-4 rounded-sm border text-left transition-all relative ${weight === item.range
                        ? 'bg-[#181821] border-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.15)]'
                        : 'bg-[#121216] border-[#24242D] hover:border-[#383846]'
                      }`}
                  >
                    {weight === item.range && (
                      <span className="absolute top-3 right-3 w-4 h-4 rounded-full bg-[#D4AF37] flex items-center justify-center text-[#09090B]">
                        <Check className="w-2.5 h-2.5" />
                      </span>
                    )}
                    <div className="text-lg font-sport font-black text-[#F4F4F5]">{item.range}</div>
                    <div className="text-xs font-sport font-bold text-[#D4AF37] uppercase">{item.name}</div>
                    <div className="text-[11px] text-[#71717A] mt-1">{item.desc}</div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* STEP 2: HANDLE */}
          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div>
                <h4 className="text-base font-bold font-sport uppercase tracking-wider text-[#F4F4F5]">
                  02A. HANDLE SHAPE
                </h4>
                <p className="text-xs text-[#A1A1AA] mt-1">
                  12-Piece imported Sarawak cane handle bonded with rubber vibration inlays.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3">
                  {[
                    { shape: 'Round', desc: 'Full rotational freedom for bottom-hand flicking & wrists' },
                    { shape: 'Oval', desc: 'Locked top-hand alignment for precise directional drives' },
                    { shape: 'Semi-Oval', desc: 'Modern hybrid contour preferred by international pros' },
                  ].map((item) => (
                    <button
                      key={item.shape}
                      onClick={() => setHandleShape(item.shape)}
                      className={`p-4 rounded-sm border text-left transition-all ${handleShape === item.shape
                          ? 'bg-[#181821] border-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.15)]'
                          : 'bg-[#121216] border-[#24242D] hover:border-[#383846]'
                        }`}
                    >
                      <div className="text-base font-sport font-black text-[#F4F4F5]">{item.shape} Handle</div>
                      <div className="text-xs text-[#71717A] mt-1">{item.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-base font-bold font-sport uppercase tracking-wider text-[#F4F4F5]">
                  02B. HANDLE SIZE
                </h4>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 pt-3">
                  {['SH (Short Handle)', 'LH (Long Handle)', 'LB (Long Blade)', 'Junior / Harrow', 'Size 6', 'Size 5'].map(
                    (sizeOption) => (
                      <button
                        key={sizeOption}
                        onClick={() => setHandleSize(sizeOption.split(' ')[0])}
                        className={`p-3 rounded-sm border text-center font-sport font-bold transition-all ${handleSize === sizeOption.split(' ')[0]
                            ? 'bg-[#D4AF37] text-[#09090B] border-[#D4AF37]'
                            : 'bg-[#181821] text-[#A1A1AA] border-[#24242D] hover:text-white'
                          }`}
                      >
                        <div className="text-sm">{sizeOption.split(' ')[0]}</div>
                        <div className="text-[10px] opacity-75">{sizeOption.split(' ')[1] || 'Std'}</div>
                      </button>
                    )
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 3: GRIP */}
          {currentStep === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div>
                <h4 className="text-base font-bold font-sport uppercase tracking-wider text-[#F4F4F5]">
                  03A. GRIP TEXTURE PATTERN
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3">
                  {['Chevron', 'Octopus', 'Scale Matrix', 'Aqua Wave'].map((p) => (
                    <button
                      key={p}
                      onClick={() => setGripPattern(p)}
                      className={`p-3.5 rounded-sm border text-center font-sport font-bold transition-all ${gripPattern === p
                          ? 'bg-[#181821] border-[#D4AF37] text-[#D4AF37]'
                          : 'bg-[#121216] border-[#24242D] text-[#A1A1AA] hover:text-white'
                        }`}
                    >
                      {p} Grip
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-base font-bold font-sport uppercase tracking-wider text-[#F4F4F5]">
                  03B. GRIP COLOR
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-6 gap-2.5 pt-3">
                  {[
                    { color: 'Metallic Gold', hex: '#D4AF37' },
                    { color: 'Stealth Black', hex: '#1E1E24' },
                    { color: 'Pure White', hex: '#FFFFFF' },
                    { color: 'Crimson Red', hex: '#E31B23' },
                    { color: 'Royal Navy Blue', hex: '#1D4ED8' },
                    { color: 'Neon Green', hex: '#22C55E' },
                  ].map((c) => (
                    <button
                      key={c.color}
                      onClick={() => setGripColor(c.color)}
                      className={`p-2.5 rounded-sm border flex items-center gap-2 transition-all ${gripColor === c.color
                          ? 'bg-[#181821] border-[#D4AF37] text-[#D4AF37]'
                          : 'bg-[#121216] border-[#24242D] text-[#A1A1AA] hover:text-white'
                        }`}
                    >
                      <span className="w-3.5 h-3.5 rounded-full shrink-0 border border-white/20" style={{ backgroundColor: c.hex }} />
                      <span className="text-xs font-sport font-bold truncate">{c.color}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-base font-bold font-sport uppercase tracking-wider text-[#F4F4F5]">
                  03C. GRIP THICKNESS
                </h4>
                <div className="grid grid-cols-2 gap-3 pt-3">
                  {[
                    { count: 'Single', extra: 0, desc: 'Direct tactile blade response' },
                    { count: 'Double', extra: 150, desc: 'Enhanced palm cushioning & anti-sting dampening (+₹150)' },
                  ].map((g) => (
                    <button
                      key={g.count}
                      onClick={() => setGripCount(g.count)}
                      className={`p-4 rounded-sm border text-left transition-all ${gripCount === g.count
                          ? 'bg-[#181821] border-[#D4AF37]'
                          : 'bg-[#121216] border-[#24242D] hover:border-[#383846]'
                        }`}
                    >
                      <div className="text-sm font-sport font-bold text-[#F4F4F5]">{g.count} Grip</div>
                      <div className="text-xs text-[#71717A] mt-0.5">{g.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 4: STICKER FINISH */}
          {currentStep === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <h4 className="text-base font-bold font-sport uppercase tracking-wider text-[#F4F4F5]">
                04. 3D EMBOSSED FOIL DECAL FINISH
              </h4>
              <p className="text-xs text-[#A1A1AA]">
                Laser-cut metallic decals sealed with ultraviolet scratch protection.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                {[
                  {
                    name: 'Laser Gold',
                    badge: 'FLAGSHIP',
                    desc: '3D Gold Chrome with Holographic Edge Badging',
                    style: 'from-[#D4AF37] to-[#AA7C11]',
                  },
                  {
                    name: 'Matte Stealth',
                    badge: 'MODERN',
                    desc: 'Sleek Carbon Charcoal on Satin Black',
                    style: 'from-[#27272A] to-[#09090B]',
                  },
                  {
                    name: 'Chrome Silver',
                    badge: 'LIMITED',
                    desc: 'Mirror Silver Hologram with White Accents',
                    style: 'from-[#E4E4E7] to-[#71717A]',
                  },
                ].map((s) => (
                  <button
                    key={s.name}
                    onClick={() => setStickerFinish(s.name)}
                    className={`p-5 rounded-sm border text-left transition-all ${stickerFinish === s.name
                        ? 'bg-[#181821] border-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.15)]'
                        : 'bg-[#121216] border-[#24242D] hover:border-[#383846]'
                      }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-sport font-black text-[#F4F4F5]">{s.name}</span>
                      <Badge variant="gold">{s.badge}</Badge>
                    </div>
                    <p className="text-xs text-[#71717A] mt-2">{s.desc}</p>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* STEP 5: PRE-KNOCKING & ARMOR */}
          {currentStep === 5 && (
            <motion.div
              key="step5"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {/* Knocking */}
              <div>
                <h4 className="text-base font-bold font-sport uppercase tracking-wider text-[#F4F4F5]">
                  05A. WORKSHOP PRE-KNOCKING SERVICE
                </h4>
                <p className="text-xs text-[#A1A1AA] mt-1">
                  Automated computer-controlled machine mallet compression to harden willow fibres.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3">
                  {[
                    { type: 'Raw', cost: 0, desc: 'Un-knocked. Requires manual oiling and knocking by customer' },
                    { type: '5,000 Machine Knocks', cost: 500, desc: 'Semi-prepared face and edge compression (+₹500)' },
                    { type: '10,000 Machine Knocks + Match Ready', cost: 999, desc: '10,000 precision mallet strikes + rounded edges. 100% Match Ready (+₹999)' },
                  ].map((k) => (
                    <button
                      key={k.type}
                      onClick={() => setPreKnocking(k.type)}
                      className={`p-4 rounded-sm border text-left transition-all ${preKnocking === k.type
                          ? 'bg-[#181821] border-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.15)]'
                          : 'bg-[#121216] border-[#24242D] hover:border-[#383846]'
                        }`}
                    >
                      <div className="text-sm font-sport font-bold text-[#F4F4F5]">{k.type}</div>
                      <div className="text-xs text-[#71717A] mt-1">{k.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Protection & Oiling */}
              <div>
                <h4 className="text-base font-bold font-sport uppercase tracking-wider text-[#F4F4F5]">
                  05B. BLADE ARMOR & FACE PROTECTION
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3">
                  {[
                    { opt: 'None', cost: 0, desc: 'Natural Kashmir Willow face' },
                    { opt: 'Clear Anti-Scuff Sheet', cost: 250, desc: 'Protective polyurethane face sheet (+₹250)' },
                    { opt: 'Complete Armor Package (Anti-Scuff + Fibre + Toe)', cost: 550, desc: 'Anti-scuff face + fibre edge tape + pro rubber toe guard (+₹550)' },
                  ].map((p) => (
                    <button
                      key={p.opt}
                      onClick={() => setFaceProtection(p.opt)}
                      className={`p-4 rounded-sm border text-left transition-all ${faceProtection === p.opt
                          ? 'bg-[#181821] border-[#D4AF37]'
                          : 'bg-[#121216] border-[#24242D] hover:border-[#383846]'
                        }`}
                    >
                      <div className="text-sm font-sport font-bold text-[#F4F4F5]">{p.opt}</div>
                      <div className="text-xs text-[#71717A] mt-1">{p.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 6: PERSONALIZE & SUMMARY */}
          {currentStep === 6 && (
            <motion.div
              key="step6"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {/* Laser Engraving Input */}
              <div className="bg-[#181821] border border-[#24242D] p-5 rounded-sm">
                <h4 className="text-base font-bold font-sport uppercase tracking-wider text-[#F4F4F5] flex items-center justify-between">
                  <span>06. BESPOKE LASER ENGRAVING (+₹300)</span>
                  <span className="text-xs text-[#D4AF37] font-normal">MAX 20 CHARACTERS</span>
                </h4>
                <p className="text-xs text-[#A1A1AA] mt-1">
                  Have your name, nickname, or jersey number precision laser-etched onto the edge or back spine.
                </p>

                <div className="pt-3">
                  <input
                    type="text"
                    maxLength={20}
                    placeholder="e.g. VIRAT 18 / MASTERBLASTER"
                    value={customEngraving}
                    onChange={(e) => setCustomEngraving(e.target.value.toUpperCase())}
                    className="w-full bg-[#121216] border border-[#24242D] focus:border-[#D4AF37] text-lg font-sport font-bold text-[#D4AF37] tracking-widest px-4 py-3 rounded-sm focus:outline-none placeholder:text-[#52525B]"
                  />
                  {customEngraving && (
                    <p className="text-xs text-emerald-400 mt-2 font-sport tracking-wider">
                      ✓ Preview Engraving: "{customEngraving}" (+₹300)
                    </p>
                  )}
                </div>
              </div>

              {/* Complete Configuration Summary Card */}
              <div className="bg-[#121216] border border-[#D4AF37]/30 rounded-sm p-6 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#24242D]">
                  <h5 className="font-sport font-black text-lg text-[#F4F4F5] tracking-wider uppercase">
                    🏏 FINAL SPECIFICATION SUMMARY
                  </h5>
                  <Badge variant="gold">CUSTOM BUILT</Badge>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs font-sport tracking-wider">
                  <div>
                    <span className="text-[#71717A] block">BAT MODEL</span>
                    <span className="font-bold text-[#F4F4F5]">{product.name}</span>
                  </div>
                  <div>
                    <span className="text-[#71717A] block">WEIGHT</span>
                    <span className="font-bold text-[#D4AF37]">{weight}</span>
                  </div>
                  <div>
                    <span className="text-[#71717A] block">HANDLE & SIZE</span>
                    <span className="font-bold text-[#F4F4F5]">{handleShape} ({handleSize})</span>
                  </div>
                  <div>
                    <span className="text-[#71717A] block">GRIP SETUP</span>
                    <span className="font-bold text-[#F4F4F5]">{gripPattern} ({gripColor}, {gripCount})</span>
                  </div>
                  <div>
                    <span className="text-[#71717A] block">KNOCKING</span>
                    <span className="font-bold text-[#F4F4F5]">{preKnocking}</span>
                  </div>
                  <div>
                    <span className="text-[#71717A] block">PROTECTION</span>
                    <span className="font-bold text-[#F4F4F5]">{faceProtection}</span>
                  </div>
                  {customEngraving && (
                    <div className="col-span-2 sm:col-span-3">
                      <span className="text-[#71717A] block">LASER ENGRAVING</span>
                      <span className="font-bold text-[#D4AF37] tracking-widest">{customEngraving}</span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation and Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-[#24242D]">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {currentStep > 1 && (
            <Button
              variant="outline"
              size="md"
              onClick={() => setCurrentStep(currentStep - 1)}
              leftIcon={<ChevronLeft className="w-4 h-4" />}
            >
              PREVIOUS STEP
            </Button>
          )}
          {currentStep < 6 && (
            <Button
              variant="secondary"
              size="md"
              onClick={() => setCurrentStep(currentStep + 1)}
              rightIcon={<ChevronRight className="w-4 h-4" />}
            >
              NEXT STEP
            </Button>
          )}
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <Button
            variant="whatsapp"
            size="md"
            onClick={handleWhatsAppOrder}
            isLoading={isOrderingWhatsApp}
            leftIcon={<MessageCircle className="w-4 h-4" />}
          >
            ORDER VIA WHATSAPP
          </Button>

          <Button
            variant="gold"
            size="lg"
            onClick={handleAddToCart}
            leftIcon={<ShoppingBag className="w-5 h-5" />}
          >
            ADD CUSTOM BAT TO CART (₹{finalUnitPrice.toLocaleString('en-IN')})
          </Button>
        </div>
      </div>
    </div>
  );
};
