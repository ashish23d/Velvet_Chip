import React, { useState, useEffect } from 'react';
import SupabaseImage from '../components/shared/SupabaseImage';
import { SparklesIcon, TruckIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import { BUCKETS } from '../constants.ts';
import { useAppContext } from '../context/AppContext.tsx';
import { supabase } from '../services/supabaseClient.ts';

const AboutPage: React.FC = () => {
  const { siteContent } = useAppContext();
  const [textureUrl, setTextureUrl] = useState('');

  useEffect(() => {
    const { data } = supabase.storage
      .from(BUCKETS.SITE_ASSETS)
      .getPublicUrl('Velvetchip_placeholders/about/fabric_texture');

    if (data.publicUrl) {
      setTextureUrl(data.publicUrl);
    }
  }, []);

  // Find the about section content, with detailed fallbacks.
  const aboutContentData =
    siteContent.find(c => c.id === 'home_about_section')?.data || {};

  const aboutContent = {
    heroTitle: aboutContentData.heroTitle || 'Our Story',
    heroDescription: aboutContentData.heroDescription || '"Explore easy-to-make recipes, personalized meal plans, and expert articles on a variety of diet types, including keto, paleo, vegan, and Mediterranean diets."',
    title: aboutContentData.title || 'Our Story',
    text:
      aboutContentData.text ||
      `Welcome to Velvet Chip, where healthy eating meets convenience and taste. 
      Whether you're looking to lose weight, gain energy, or simply eat cleaner, 
      we've got you covered with recipes, tips, and meal plans designed for every dietary need.
      Our mission is to make nutritious food accessible and enjoyable for everyone.
      ounded by certified nutritionists and passionate food lovers, we offer expert advice backed by science, helping you make sustainable changes to your eating habits.
      Our website provides easy-to-follow meal plans for popular diets like Keto, Paleo, and Mediterranean, plus insights into mindful eating and wellness.`,
    imagePath:
      aboutContentData.imagePath ||
      'Velvetchip_placeholders/about/woman_sewing'
  };

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="relative bg-pink-50/70">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{
            backgroundImage: textureUrl ? `url(${textureUrl})` : 'none'
          }}
          aria-hidden="true"
        />
        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h1 className="text-4xl sm:text-5xl font-serif font-bold text-primary">
            {aboutContent.heroTitle}
          </h1>
          <p className="mt-4 text-lg text-gray-700 max-w-3xl mx-auto">
            {aboutContent.heroDescription}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="prose prose-lg max-w-none text-gray-600 dangerously-set-html">
            <h2 className="text-3xl font-serif text-gray-900 mb-6">
              {aboutContent.title}
            </h2>
            {aboutContent.text ? (
              <div dangerouslySetInnerHTML={{ __html: aboutContent.text }} />
            ) : (
              <p>No content available.</p>
            )}
          </div>

          <div>
            <SupabaseImage
              bucket={BUCKETS.SITE_ASSETS}
              imagePath={aboutContent.imagePath}
              alt="Velvet Chip"
              className="rounded-lg shadow-2xl"
              width={600}
              height={800}
            />
          </div>
        </div>
      </div>

      {/* Trust Badges */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-serif text-center text-gray-800 mb-12">
            Our Promise to You
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="p-6">
              <SparklesIcon className="w-12 h-12 mx-auto text-primary" />
              <h3 className="mt-4 text-lg font-semibold text-gray-800">
                Quality Craftsmanship
              </h3>
              <p className="mt-2 text-gray-600">
                Every garment is thoughtfully crafted using premium fabrics
                and meticulous attention to detail.
              </p>
            </div>

            <div className="p-6">
              <TruckIcon className="w-12 h-12 mx-auto text-primary" />
              <h3 className="mt-4 text-lg font-semibold text-gray-800">
                Fast & Secure Delivery
              </h3>
              <p className="mt-2 text-gray-600">
                Reliable, well-packaged, and timely delivery — ensuring a
                seamless shopping experience.
              </p>
            </div>

            <div className="p-6">
              <LockClosedIcon className="w-12 h-12 mx-auto text-primary" />
              <h3 className="mt-4 text-lg font-semibold text-gray-800">
                Secure Payments
              </h3>
              <p className="mt-2 text-gray-600">
                Your transactions are protected with industry-standard
                encryption for complete peace of mind.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
