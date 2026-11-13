'use client';

import { useState } from 'react';
import { Pencil, Trash2, Plus, Tag } from 'lucide-react';
import { addCategory, updateCategory, deleteCategory } from '@/lib/api';
import EditModal from './Editmodal';

export default function CategoriesSection({ shopSlug, categories, isOwner }) {
  const [items, setItems] = useState(categories || []);
  const [editingId, setEditingId] = useState(null);
  const [pendingDeleteId, setPendingDeleteId] = useState(null);

  const editingItem = items.find((c) => c.id === editingId);

  async function handleSave(formData) {
    if (editingId === 'new') {
      const created = await addCategory(shopSlug, formData);
      setItems((prev) => [...prev, created]);
    } else {
      await updateCategory(shopSlug, editingId, formData);
      const name = formData.get('name');
      setItems((prev) =>
        prev.map((c) => (c.id === editingId ? { ...c, name } : c))
      );
    }
  }

  async function handleDelete(id) {
    setPendingDeleteId(id);
    try {
      await deleteCategory(shopSlug, id);
      setItems((prev) => prev.filter((c) => c.id !== id));
    } finally {
      setPendingDeleteId(null);
    }
  }

  if (items.length === 0 && !isOwner) return null;

  return (
    <section id="categories" className="mx-auto max-w-6xl px-6 py-10">
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {items.map((category) => (
          <div key={category.id} className="group relative">
            {/* Bigger card – full square, image covers everything */}
            <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-[#E5E2DA] bg-[#F7F6F3] transition-colors group-hover:border-green-700">
              {category.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={category.imageUrl}
                  alt={category.name}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-[#1B2027]/30">
                    <Tag className="h-6 w-6" />
                  </span>
                </div>
              )}

              {/* Name overlay */}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent px-3 pb-3 pt-10">
                <span className="block text-sm font-medium text-white truncate text-center">
                  {category.name}
                </span>
              </div>
            </div>

            {isOwner && (
              <div className="absolute right-2 top-2 z-10 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  type="button"
                  onClick={() => setEditingId(category.id)}
                  className="rounded-full bg-white/90 p-1.5 text-[#1B2027] shadow-sm hover:bg-white"
                >
                  <Pencil className="h-3 w-3" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(category.id)}
                  disabled={pendingDeleteId === category.id}
                  className="rounded-full bg-white/90 p-1.5 text-red-600 shadow-sm hover:bg-white disabled:opacity-50"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            )}
          </div>
        ))}

        {isOwner && (
          <button
            type="button"
            onClick={() => setEditingId('new')}
            className="flex aspect-square w-full flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-[#E5E2DA] text-[#1B2027]/40 transition-colors hover:border-green-700 hover:text-[#1B2027]"
          >
            <Plus className="h-5 w-5" />
            <span className="text-sm">Add category</span>
          </button>
        )}
      </div>

      {editingId && (
        <EditModal
          title={editingId === 'new' ? 'Add category' : 'Edit category'}
          fields={[
            { name: 'image', label: 'Image', type: 'image' },
            { name: 'name', label: 'Category name', type: 'text', placeholder: 'e.g. New arrivals' },
          ]}
          initialValues={{
            name: editingItem?.name || '',
            imageUrl: editingItem?.imageUrl,
          }}
          onSave={handleSave}
          onClose={() => setEditingId(null)}
        />
      )}
    </section>
  );
}