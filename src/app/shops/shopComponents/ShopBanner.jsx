'use client';

import { useState, useEffect, useCallback } from 'react';
import { Pencil, ChevronLeft, ChevronRight, Plus, Trash2 } from 'lucide-react';
import { addBanner, updateBanner, deleteBanner } from '@/lib/api';
import EditModal from './Editmodal';

function normalize(data) {
  if (Array.isArray(data)) return data;
  if (data && (data.imageUrl || data.heading)) return [{ id: 'legacy', ...data }];
  return [];
}

export default function BannerSection({ shopSlug, banners: initialBanners = [], isOwner }) {
  // Compute initial state directly without useEffect
  const [banners, setBanners] = useState(() => normalize(initialBanners));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const hasMultiple = banners.length > 1;
  const current = banners[currentIndex] || {};

  const goTo = useCallback(
    (index) => {
      if (banners.length === 0) return;
      setCurrentIndex((index + banners.length) % banners.length);
    },
    [banners.length]
  );

  // Auto-slide effect
  useEffect(() => {
    if (!hasMultiple) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [hasMultiple, banners.length]);

  async function handleSave(formData) {
    let nextBanners;
    if (editingId === 'new') {
      nextBanners = await addBanner(shopSlug, formData);
    } else {
      nextBanners = await updateBanner(shopSlug, editingId, formData);
    }

    setBanners(normalize(nextBanners));
    setIsEditing(false);
    setEditingId(null);
  }

  async function handleDelete(bannerId) {
    const nextBanners = await deleteBanner(shopSlug, bannerId);
    const normalizedNext = normalize(nextBanners);
    setBanners(normalizedNext);
    setCurrentIndex((prev) => Math.min(prev, Math.max(0, normalizedNext.length - 1)));
  }

  const hasContent = banners.length > 0;

  return (
    <div className="group relative w-full overflow-hidden">
      {hasContent ? (
        <div className="relative w-full overflow-hidden">
          {/* Slides Container */}
          <div
            className="flex transition-transform duration-500 ease-in-out"
            style={{
              transform: `translateX(-${currentIndex * 100}%)`,
            }}
          >
            {banners.map((b) => (
              <div
                key={b.id || b.imageUrl}
                className="relative flex h-56 w-full shrink-0 items-center justify-center bg-cover bg-center text-center text-white sm:h-72 md:h-80 lg:h-96"
                style={{
                  backgroundImage: b.imageUrl ? `url(${b.imageUrl})` : undefined,
                  backgroundColor: b.imageUrl ? undefined : '#1B2027',
                }}
              >
                <div className="absolute inset-0 bg-black/40" />
                <div className="relative z-10 max-w-2xl px-4 sm:px-6">
                  {b.heading && (
                    <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-5xl leading-tight">
                      {b.heading}
                    </h1>
                  )}
                  {b.description && (
                    <p className="mt-2 sm:mt-3 text-sm sm:text-base text-white/85 line-clamp-3">
                      {b.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Navigation Controls */}
          {hasMultiple && (
            <>
              <button
                type="button"
                onClick={() => goTo(currentIndex - 1)}
                className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 rounded-full bg-white/80 p-1.5 sm:p-2 text-[#1B2027] shadow hover:bg-white transition-colors"
                aria-label="Previous"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => goTo(currentIndex + 1)}
                className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 rounded-full bg-white/80 p-1.5 sm:p-2 text-[#1B2027] shadow hover:bg-white transition-colors"
                aria-label="Next"
              >
                <ChevronRight className="h-5 w-5" />
              </button>

              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex gap-1.5">
                {banners.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-1.5 rounded-full transition-all ${
                      idx === currentIndex ? 'w-5 bg-white' : 'w-1.5 bg-white/60'
                    }`}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      ) : (
        isOwner && (
          <button
            type="button"
            onClick={() => {
              setEditingId('new');
              setIsEditing(true);
            }}
            className="flex h-36 sm:h-40 w-full items-center justify-center border-b border-dashed border-[#E5E2DA] bg-[#F7F6F3] text-sm text-[#1B2027]/50 hover:border-green-700 hover:text-[#1B2027] transition-colors"
          >
            + Add a shop banner
          </button>
        )
      )}

      {/* Owner controls */}
      {isOwner && hasContent && (
        <div className="absolute right-3 top-3 z-30 flex flex-col gap-2 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            type="button"
            onClick={() => {
              setEditingId(current.id);
              setIsEditing(true);
            }}
            className="flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-xs font-medium text-[#1B2027] shadow-sm hover:bg-white transition-colors"
          >
            <Pencil className="h-3 w-3" /> Edit
          </button>

          <button
            type="button"
            onClick={() => {
              setEditingId('new');
              setIsEditing(true);
            }}
            className="flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-xs font-medium text-[#1B2027] shadow-sm hover:bg-white transition-colors"
          >
            <Plus className="h-3 w-3" /> Add another
          </button>

          <button
            type="button"
            onClick={() => handleDelete(current.id)}
            className="flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-xs font-medium text-red-600 shadow-sm hover:bg-white transition-colors"
          >
            <Trash2 className="h-3 w-3" /> Remove
          </button>
        </div>
      )}

      {isEditing && (
        <EditModal
          title={editingId === 'new' ? 'Add banner' : 'Edit banner'}
          fields={[
            { name: 'bannerImage', label: 'Banner image', type: 'image' },
            { name: 'heading', label: 'Heading', type: 'text', placeholder: 'e.g. Winter Collection is here' },
            { name: 'description', label: 'Supporting text', type: 'textarea', placeholder: 'A short line under the heading' },
          ]}
          initialValues={{
            heading: editingId === 'new' ? '' : current.heading || '',
            description: editingId === 'new' ? '' : current.description || '',
            imageUrl: editingId === 'new' ? null : current.imageUrl,
          }}
          onSave={handleSave}
          onClose={() => {
            setIsEditing(false);
            setEditingId(null);
          }}
        />
      )}
    </div>
  );
}