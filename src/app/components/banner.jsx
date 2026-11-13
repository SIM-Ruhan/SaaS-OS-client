'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';

const bannerImages = [
  {
    id: 1,
    url: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?q=80&w=1200&auto=format&fit=crop',
    alt: 'E-commerce website store preview 1',
  },
  {
    id: 2,
    url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1200&auto=format&fit=crop',
    alt: 'E-commerce website store preview 2',
  },
  {
    id: 3,
    url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1200&auto=format&fit=crop',
    alt: 'E-commerce website store preview 3',
  },
];

export default function HeroBanner() {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto-play slideshow every 4 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prevIndex) => (prevIndex + 1) % bannerImages.length);
    }, 4000);

    return () => clearInterval(timer);
  }, []);

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const nextSlide = () => {
    setCurrentSlide((prevIndex) => (prevIndex + 1) % bannerImages.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prevIndex) =>
      prevIndex === 0 ? bannerImages.length - 1 : prevIndex - 1
    );
  };

  return (
    <section className="w-full py-16 px-6 md:px-12 lg:px-20 overflow-hidden min-h-[600px] flex items-center">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
        {/* LEFT COLUMN: Heading, Description & Button */}
        <div className="lg:col-span-5 flex flex-col justify-center space-y-6">
          <h1 className="text-5xl font-bold text-gray-900 leading-tight tracking-tight">
            Discover why <span className="text-[#30794b]">ShopOS</span> is the best platform for your shop.
          </h1>

          <p className="text-gray-600 text-base md:text-lg leading-relaxed">
            ShopOS is an ultra fast, modern and easy to use multipurpose WooCommerce theme. 
            Give your customers the ultimate online shopping experience with a website unlike any other.
          </p>

          <div className="pt-2">
            <Link href={"#pricing"} className="inline-flex items-center gap-4 bg-gray-100 hover:bg-gray-200 border border-gray-300 text-gray-800 font-semibold text-sm tracking-wider uppercase pl-6 pr-2 py-2 rounded-full transition-all duration-300 shadow-sm group">
              <span>Start Your Shop</span>
              <span className="w-9 h-9 bg-emerald-500 group-hover:bg-emerald-600 rounded-full flex items-center justify-center text-white transition-colors duration-200">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2.5}
                  stroke="currentColor"
                  className="w-5 h-5 group-hover:translate-x-0.5 transition-transform"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </span>
            </Link>
          </div>
        </div>

        {/* RIGHT COLUMN: E-commerce Website Mockup & Slideshow */}
        <div className="lg:col-span-7 relative w-full">
          {/* Browser Window Mockup Frame */}
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200/80 overflow-hidden transform lg:scale-[1.02] transition-transform">

            {/* Slideshow Image Area */}
            <div className="relative aspect-16/10 w-full bg-gray-100 overflow-hidden">
              {bannerImages.map((image, index) => (
                <div
                  key={image.id}
                  className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                    index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
                  }`}
                >
                  <Image unoptimized width={50} height={50}
                    src={image.url}
                    alt={image.alt}
                    className="w-full h-full object-cover object-top"
                  />
                </div>
              ))}

              {/* Prev / Next Navigation Controls */}
              <button
                onClick={prevSlide}
                className="absolute left-3 top-1/2 -translate-y-1/2 z-20 bg-black/40 hover:bg-black/60 text-white p-2 rounded-full backdrop-blur-sm transition"
                aria-label="Previous slide"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-3 top-1/2 -translate-y-1/2 z-20 bg-black/40 hover:bg-black/60 text-white p-2 rounded-full backdrop-blur-sm transition"
                aria-label="Next slide"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>

              {/* Slide Indicators / Dots */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
                {bannerImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToSlide(index)}
                    className={`h-2.5 rounded-full transition-all duration-300 ${
                      index === currentSlide ? 'w-8 bg-emerald-500' : 'w-2.5 bg-white/70 hover:bg-white'
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}