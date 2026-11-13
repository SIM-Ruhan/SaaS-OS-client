'use client';

import { useState, useEffect } from 'react';
import { X, Loader2, ImagePlus } from 'lucide-react';

export default function EditModal({ title, fields, initialValues = {}, onSave, onClose }) {
  const [values, setValues] = useState(initialValues);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(
    initialValues.imageUrl || initialValues.logoUrl || null
  );
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  function handleTextChange(name, value) {
    setValues((prev) => ({ ...prev, [name]: value }));
  }

  function handleImageChange(e, name) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile({ name, file });
    setImagePreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setIsSaving(true);
    try {
      const formData = new FormData();
      fields.forEach((f) => {
        if (f.type !== 'image' && values[f.name] !== undefined) {
          formData.append(f.name, values[f.name]);
        }
      });
      if (imageFile) {
        formData.append(imageFile.name, imageFile.file);
      }
      await onSave(formData);
      onClose();
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
      setIsSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-0 sm:p-4">
      {/* Backdrop click to close */}
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative z-10 flex w-full max-w-md max-h-[92vh] sm:max-h-[85vh] flex-col rounded-t-2xl sm:rounded-2xl border border-[#E5E2DA] bg-white shadow-xl">
        {/* Sticky header */}
        <div className="flex shrink-0 items-center justify-between border-b border-[#E5E2DA] px-5 py-4">
          <h3 className="font-sans text-base font-semibold text-[#1B2027]">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-[#1B2027]/40 hover:bg-[#F7F6F3] hover:text-[#1B2027]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable body */}
        <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
            {fields.map((f) => {
              if (f.type === 'image') {
                return (
                  <div key={f.name}>
                    <label className="mb-1.5 block text-sm font-medium text-[#1B2027]">
                      {f.label}
                    </label>
                    <label className="flex h-28 w-full cursor-pointer items-center justify-center overflow-hidden rounded-xl border border-dashed border-[#E5E2DA] bg-[#F7F6F3] transition-colors hover:border-green-700">
                      {imagePreview ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={imagePreview} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <span className="flex flex-col items-center gap-1 text-[#1B2027]/40">
                          <ImagePlus className="h-5 w-5" />
                          <span className="text-xs">Click to upload</span>
                        </span>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleImageChange(e, f.name)}
                      />
                    </label>
                  </div>
                );
              }

              if (f.type === 'textarea') {
                return (
                  <div key={f.name}>
                    <label className="mb-1.5 block text-sm font-medium text-[#1B2027]">
                      {f.label}
                    </label>
                    <textarea
                      rows={3}
                      value={values[f.name] ?? ''}
                      onChange={(e) => handleTextChange(f.name, e.target.value)}
                      placeholder={f.placeholder}
                      className="w-full resize-none rounded-lg border border-[#E5E2DA] px-4 py-2.5 text-sm text-[#1B2027] placeholder:text-[#1B2027]/35 focus:border-green-700 focus:outline-none"
                    />
                  </div>
                );
              }

              return (
                <div key={f.name}>
                  <label className="mb-1.5 block text-sm font-medium text-[#1B2027]">
                    {f.label}
                  </label>
                  <input
                    type="text"
                    value={values[f.name] ?? ''}
                    onChange={(e) => handleTextChange(f.name, e.target.value)}
                    placeholder={f.placeholder}
                    className="w-full rounded-lg border border-[#E5E2DA] px-4 py-2.5 text-sm text-[#1B2027] placeholder:text-[#1B2027]/35 focus:border-green-700 focus:outline-none"
                  />
                </div>
              );
            })}

            {error && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">{error}</p>
            )}
          </div>

          {/* Sticky footer actions */}
          <div className="shrink-0 border-t border-[#E5E2DA] px-5 py-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-full border border-[#E5E2DA] py-2.5 text-sm font-medium text-[#1B2027] transition-colors hover:border-[#1B2027]/30"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex flex-1 items-center justify-center gap-2 rounded-full bg-gradient-to-b from-green-600 via-green-700 to-green-800 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}