import React, { useState, useEffect } from 'react';
import SupabaseImage from '../components/SupabaseImage.tsx';
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
      .getPublicUrl('awaany_placeholders/about/fabric_texture');
    if (data.publicUrl) {
      setTextureUrl(data.publicUrl);
    }
  }, []);

  // Find the about section content, with detailed fallbacks.
  const aboutContentData = siteContent.find(c => c.id === 'home_about_section')?.data || {};
  const aboutContent = {
      title: aboutContentData.title || "Our Story",
      text: aboutContentData.text || `Awaany was born from a simple yet profound vision: to create beautiful, high-quality garments that make women feel confident and cherished. Since our inception in 1999, we have been dedicated to blending the rich heritage of Indian textiles and craftsmanship with modern, wearable designs.

Our journey began in a small workshop, fueled by a passion for fabrics and an unwavering commitment to detail. Today, we've grown, but our core values remain the same. Every piece, from our elegant sarees to our chic western dresses, is a testament to our love for fashion and our respect for the artisans who bring our creations to life.

We believe in slow fashion – creating pieces that you'll love and wear for years to come. Thank you for being a part of our story.`,
      imagePath: aboutContentData.imagePath || "awaany_placeholders/about/woman_sewing"
  };


  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="relative bg-pink-50/70">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{ backgroundImage: textureUrl ? `url(${textureUrl})` : 'none' }}
          aria-hidden="true"
        >
        </div>
        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h1 className="text-4xl sm:text-5xl font-serif font-bold text-primary">Our Story</h1>
          <p className="mt-4 text-lg text-gray-700 max-w-3xl mx-auto">
            Weaving tradition with contemporary style, Awaany is more than a brand – it's a celebration of feminine grace and timeless elegance.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="prose prose-lg max-w-none text-gray-600">
                <h2 className="text-3xl font-serif text-gray-900">{aboutContent.title}</h2>
                {aboutContent.text?.split('\n').filter(p => p.trim() !== '').map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                ))}
            </div>
            <div>
                 <SupabaseImage
                  bucket={BUCKETS.SITE_ASSETS}
                  imagePath={aboutContent.imagePath} 
                  alt="Awaany artisan at work" 
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
          <h2 className="text-3xl font-serif text-center text-gray-800 mb-12">Our Promise to You</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="p-6">
              <SparklesIcon className="w-12 h-12 mx-auto text-primary"/>
              <h3 className="mt-4 text-lg font-semibold text-gray-800">Quality Craftsmanship</h3>
              <p className="mt-2 text-gray-600">Every piece is crafted with attention to detail and quality materials.</p>
            </div>
            <div className="p-6">
              <TruckIcon className="w-12 h-12 mx-auto text-primary"/>
              <h3 className="mt-4 text-lg font-semibold text-gray-800">Fast & Secure Delivery</h3>
              <p className="mt-2 text-gray-600">Get your favorite styles delivered to your doorstep safely and quickly.</p>
            </div>
            <div className="p-6">
              <LockClosedIcon className="w-12 h-12 mx-auto text-primary"/>
              <h3 className="mt-4 text-lg font-semibold text-gray-800">Secure Payments</h3>
              <p className="mt-2 text-gray-600">Shop with confidence using our secure and encrypted payment gateway.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;