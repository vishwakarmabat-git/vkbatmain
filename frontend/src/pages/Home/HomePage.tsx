import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, ShieldCheck, Zap, Award, Sparkles, Star, ChevronRight, CheckCircle2, Phone } from 'lucide-react';
import { productService, categoryService } from '@/services/productService';
import { cmsService } from '@/services/cmsService';
import { Product, Category, Testimonial } from '@/types';
import { ProductCard } from '@/components/products/ProductCard';
import { Button } from '@/components/ui/Button';
import { CategoriesCollectionSection } from '@/components/home/CategoriesCollectionSection';
import { LatestCollectionSection } from '@/components/home/LatestCollectionSection';
import { ChooseYourWeaponSection } from '@/components/home/ChooseYourWeaponSection';
import { ContactRequirementSection } from '@/components/common/ContactRequirementSection';
import { CraftsmanshipStorySection } from '@/components/common/CraftsmanshipStorySection';
import { CraftsmanshipTimelineSection } from '@/components/common/CraftsmanshipTimelineSection';
import { TrustedByChampionsSection } from '@/components/common/TrustedByChampionsSection';
import { HeroCarousel } from '@/components/home/HeroCarousel';
import { WhyVKSection } from '@/components/home/WhyVKSection';

import { useRealtimeSync } from '@/hooks/useRealtime';

export const HomePage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [prodRes, catRes, testRes] = await Promise.all([
        productService.getProducts({ limit: 50, sort_by: 'newest' }),
        categoryService.getCategories(),
        cmsService.getTestimonials(),
      ]);
      setProducts(prodRes.items || []);
      setCategories(catRes || []);
      setTestimonials(testRes || []);
    } catch (e) {
      console.error('Error fetching homepage data', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Realtime instant auto-sync without refresh
  useRealtimeSync(['vk:realtime:products', 'vk:realtime:categories', 'vk:realtime:cms'], fetchData);

  return (
    <div className="space-y-24 pb-20">
      {/* SECTION 1: AUTO-LOOPING 3-SECOND HERO CAROUSEL */}
      <HeroCarousel />

      {/* SECTION 2: CATEGORIES COLLECTION (EXPLORE SERIES) */}
      <CategoriesCollectionSection categories={categories} />

      {/* SECTION 3: LATEST COLLECTION (NEW ARRIVAL) */}
      <LatestCollectionSection products={products.slice(0, 4)} />

      {/* SECTION 4: OUR COLLECTION (CHOOSE YOUR WEAPON) */}
      <ChooseYourWeaponSection products={products} categories={categories} />

      {/* SECTION 4: WHY VK? (BUILT DIFFERENT. PERFORMS DIFFERENT.) */}
      <WhyVKSection />

      {/* SECTION 5: TRUSTED BY CHAMPIONS TESTIMONIALS */}
      <TrustedByChampionsSection />

      {/* SECTION 6: THE 7-STAGE CRAFT TIMELINE (FROM WILLOW TO CHAMPIONSHIP WEAPON) */}
      <CraftsmanshipTimelineSection />

      {/* SECTION 7: THE CRAFTSMANSHIP & HERITAGE STORY */}
      <CraftsmanshipStorySection />

      {/* SECTION 8: READY TO ORDER REQUIREMENT & CONTACT SECTION */}
      <ContactRequirementSection />
    </div>
  );
};
