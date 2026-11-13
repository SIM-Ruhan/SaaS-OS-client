'use client';

import { useState } from 'react';
import { Pencil, Trash2, Plus, ImageIcon } from 'lucide-react';
import { addStaticSection, updateStaticSection, deleteStaticSection } from '@/lib/api';
import EditModal from './Editmodal';

export default function StaticSections({ shopSlug, sections, isOwner }) {
  const [items, setItems] = useState(sections || []);
  const [editingId, setEditingId] = useState(null); // null | 'new' | section id
  const [pendingDeleteId, setPendingDeleteId] = useState(null);

  const editingItem = items.find((s) => s.id === editingId);

  async function handleSave(formData) {
    if (editingId === 'new') {
      const created = await addStaticSection(shopSlug, formData);
      setItems((prev) => [...prev, created]);
    } else {
      await updateStaticSection(shopSlug, editingId, formData);
      const patch = {
        heading: formData.get('heading'),
        description: formData.get('description'),
        ctaText: formData.get('ctaText'),
        ctaLink: formData.get('ctaLink'),
        imagePosition: formData.get('imagePosition'),
      };
      setItems((prev) => prev.map((s) => (s.id === editingId ? { ...s, ...patch } : s)));
    }
  }

  async function handleDelete(id) {
    setPendingDeleteId(id);
    try {
      await deleteStaticSection(shopSlug, id);
      setItems((prev) => prev.filter((s) => s.id !== id));
    } finally {
      setPendingDeleteId(null);
    }
  }

  if (items.length === 0 && !isOwner) return null;

  return (
    <section className="mx-auto max-w-5xl px-6 py-10">
      <div className="flex flex-col gap-10">
        {items.map((section) => (
          <div key={section.id} className="group relative">
            <div
              className={`flex flex-col gap-6 overflow-hidden rounded-2xl border border-[#E5E2DA] sm:flex-row ${
                section.imagePosition === 'left' ? 'sm:flex-row-reverse' : ''
              }`}
            >
              <div className="flex w-full items-center justify-center bg-[#F7F6F3] sm:w-1/2">
                {section.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={section.imageUrl}
                    alt={section.heading}
                    className="h-56 w-full object-cover sm:h-full"
                  />
                ) : (
                  <div className="flex h-56 w-full items-center justify-center text-[#1B2027]/25 sm:h-full">
                    <ImageIcon className="h-8 w-8" />
                  </div>
                )}
              </div>
              <div className="flex w-full flex-col justify-center gap-3 p-6 sm:w-1/2 sm:p-8">
                <h3 className="font-serif text-xl text-[#1B2027]">{section.heading}</h3>
                <p className="text-sm leading-relaxed text-[#1B2027]/65">{section.description}</p>
                {section.ctaText && (
                  <a
                    href={section.ctaLink || '#'}
                    className="mt-1 self-start text-sm font-medium text-green-800 hover:underline"
                  >
                    {section.ctaText}
                  </a>
                )}
              </div>
            </div>

            {isOwner && (
              <div className="absolute right-3 top-3 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  type="button"
                  onClick={() => setEditingId(section.id)}
                  className="rounded-full bg-white/90 p-1.5 text-[#1B2027] shadow-sm hover:bg-white"
                >
                  <Pencil className="h-3 w-3" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(section.id)}
                  disabled={pendingDeleteId === section.id}
                  className="rounded-full bg-white/90 p-1.5 text-red-600 shadow-sm hover:bg-white disabled:opacity-50"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            )}
          </div>
        ))}

        {isOwner && items.length < 3 && (
          <button
            type="button"
            onClick={() => setEditingId('new')}
            className="flex h-24 w-full flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-[#E5E2DA] text-[#1B2027]/40 transition-colors hover:border-green-700 hover:text-[#1B2027]"
          >
            <Plus className="h-5 w-5" />
            <span className="text-sm">Add section</span>
          </button>
        )}
      </div>

      {editingId && (
        <EditModal
          title={editingId === 'new' ? 'Add section' : 'Edit section'}
          fields={[
            { name: 'image', label: 'Image', type: 'image' },
            { name: 'heading', label: 'Heading', type: 'text', placeholder: 'e.g. Made to last' },
            { name: 'description', label: 'Description', type: 'textarea', placeholder: 'A sentence or two' },
            { name: 'ctaText', label: 'Button text', type: 'text', placeholder: 'e.g. Learn more' },
            { name: 'ctaLink', label: 'Button link', type: 'text', placeholder: 'https://...' },
            { name: 'imagePosition', label: "Image side (\"left\" or \"right\")", type: 'text', placeholder: 'right' },
          ]}
          initialValues={{
            heading: editingItem?.heading || '',
            description: editingItem?.description || '',
            ctaText: editingItem?.ctaText || '',
            ctaLink: editingItem?.ctaLink || '',
            imagePosition: editingItem?.imagePosition || 'right',
            imageUrl: editingItem?.imageUrl,
          }}
          onSave={handleSave}
          onClose={() => setEditingId(null)}
        />
      )}
    </section>
  );
}