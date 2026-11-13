'use client';

import { useState } from 'react';
import { updateFooter } from '@/lib/api';
import EditModal from './Editmodal';
import Link from 'next/link';
import { Mail, MapPin, MessageCircle, Pencil, Phone } from 'lucide-react';
import { FaFacebook } from 'react-icons/fa6';
import { FiInstagram } from 'react-icons/fi';

export default function Footer({ shopSlug, shopName, footer, isOwner }) {
  const [current, setCurrent] = useState(
    footer || { about: '', email: '', phone: '', address: '', socials: {} }
  );
  const [isEditing, setIsEditing] = useState(false);

  async function handleSave(formData) {
    const payload = {
      about: formData.get('about') || '',
      email: formData.get('email') || '',
      phone: formData.get('phone') || '',
      address: formData.get('address') || '',
      links: current.links || [],
      socials: {
        facebook: formData.get('facebook') || '',
        instagram: formData.get('instagram') || '',
        whatsapp: formData.get('whatsapp') || '',
      },
    };
    const saved = await updateFooter(shopSlug, payload);
    setCurrent(saved);
  }

  const socials = current.socials || {};

  return (
    <footer className="relative border-t border-[#E5E2DA] bg-[#F7F6F3]">
      {isOwner && (
        <button
          type="button"
          onClick={() => setIsEditing(true)}
          className="absolute right-4 top-4 flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-medium text-[#1B2027] shadow-sm hover:opacity-90"
        >
          <Pencil className="h-3 w-3" /> Edit footer
        </button>
      )}

      <div className="mx-auto grid max-w-5xl gap-8 px-6 py-12 sm:grid-cols-3">
        <div>
          <h3 className="font-serif text-lg text-[#1B2027]">{shopName}</h3>
          {current.about && (
            <p className="mt-2 text-sm leading-relaxed text-[#1B2027]/65">{current.about}</p>
          )}
        </div>

        <div>
          <h4 className="text-sm font-medium text-[#1B2027]">Contact</h4>
          <div className="mt-3 flex flex-col gap-2 text-sm text-[#1B2027]/65">
            {current.email && (
              <span className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5" /> {current.email}
              </span>
            )}
            {current.phone && (
              <span className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5" /> {current.phone}
              </span>
            )}
            {current.address && (
              <span className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5" /> {current.address}
              </span>
            )}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium text-[#1B2027]">Follow</h4>
          <div className="mt-3 flex gap-3">
            {socials.facebook && (
              <Link href={socials.facebook} className="text-[#1B2027]/50 hover:text-[#1B2027]">
                <FaFacebook className="h-4 w-4" />
              </Link>
            )}
            {socials.instagram && (
              <Link href={socials.instagram} className="text-[#1B2027]/50 hover:text-[#1B2027]">
                <FiInstagram className="h-4 w-4" />
              </Link>
            )}
            {socials.whatsapp && (
              <a href={socials.whatsapp} className="text-[#1B2027]/50 hover:text-[#1B2027]">
                <MessageCircle className="h-4 w-4" />
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="border-t border-[#E5E2DA] px-6 py-4 text-center text-xs text-[#1B2027]/45">
        © {new Date().getFullYear()} {shopName}. Powered by ShopOS.
      </div>

      {isEditing && (
        <EditModal
          title="Edit footer"
          fields={[
            { name: 'about', label: 'About your shop', type: 'textarea', placeholder: 'A short line about your shop' },
            { name: 'email', label: 'Contact email', type: 'text', placeholder: 'hello@yourshop.com' },
            { name: 'phone', label: 'Phone number', type: 'text', placeholder: '+880 ...' },
            { name: 'address', label: 'Address', type: 'text', placeholder: 'City, country' },
            { name: 'facebook', label: 'Facebook URL', type: 'text', placeholder: 'https://facebook.com/...' },
            { name: 'instagram', label: 'Instagram URL', type: 'text', placeholder: 'https://instagram.com/...' },
            { name: 'whatsapp', label: 'WhatsApp link', type: 'text', placeholder: 'https://wa.me/...' },
          ]}
          initialValues={{
            about: current.about || '',
            email: current.email || '',
            phone: current.phone || '',
            address: current.address || '',
            facebook: socials.facebook || '',
            instagram: socials.instagram || '',
            whatsapp: socials.whatsapp || '',
          }}
          onSave={handleSave}
          onClose={() => setIsEditing(false)}
        />
      )}
    </footer>
  );
}