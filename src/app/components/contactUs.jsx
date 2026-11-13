"use client";

import Link from 'next/link';
import React, { useState } from 'react';
import {
  BiEnvelope,
  BiPhone,
  BiMap,
  BiSend,
  BiLogoInstagram,
} from 'react-icons/bi';
import {
  BiLogoLinkedin,
  BiLogoGithub,
  BiLogoFacebook,
  BiLogoWhatsapp,
} from 'react-icons/bi';

const contactInfo = [
  { icon: BiEnvelope, label: 'Email', value: 'zakaria.rupto@gmail.com', href: 'mailto:zakaria.rupto@gmail.com' },
  { icon: BiPhone, label: 'Phone', value: '+8801614524135', href: 'tel:+8801614524135' },
  { icon: BiMap, label: 'Location', value: 'Dhaka, Bangladesh', href: null },
];

const socialLinks = [
  { icon: BiLogoLinkedin, href: 'https://www.linkedin.com/company/innogen-digital/posts/?feedView=all', label: 'LinkedIn' },
  { icon: BiLogoInstagram, href: 'https://www.instagram.com/innogen.digital', label: 'GitHub' },
  { icon: BiLogoFacebook, href: 'https://www.facebook.com/innogendigital', label: 'Facebook' },
  { icon: BiLogoWhatsapp, href: 'https://wa.me/8801614524135', label: 'WhatsApp' },
];

const WEB3FORMS_ACCESS_KEY = '8567eddd-f1ee-413e-89c1-b3829ab43b09';

// Cleaned up FloatingField label classes to avoid SSR/Client class string mismatches
const FloatingField = ({ id, name, label, type = 'text', required = false, value, onChange }) => (
  <div className="relative">
    <input
      type={type}
      id={id}
      name={name}
      required={required}
      value={value}
      onChange={onChange}
      placeholder=" "
      className="peer w-full bg-white border border-gray-200 rounded-lg px-4 pt-5 pb-2 text-sm text-gray-900 placeholder-transparent outline-none transition-colors focus:border-red-400 focus:ring-1 focus:ring-red-100"
    />
    <label
      htmlFor={id}
      className="absolute left-4 top-1.5 text-[11px] text-gray-500 transition-all duration-200 pointer-events-none peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-400 peer-focus:top-1.5 peer-focus:text-[11px] peer-focus:text-red-500"
    >
      {label}
    </label>
  </div>
);

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [status, setStatus] = useState('idle'); // idle | sending | success | error

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('sending');

    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          access_key: WEB3FORMS_ACCESS_KEY,
          ...formData,
        }),
      });

      const result = await res.json();

      if (result.success) {
        setStatus('success');
        setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
      } else {
        setStatus('error');
      }
    } catch (err) {
      setStatus('error');
    }
  };

  return (
    <section id="contact" className="relative overflow-hidden py-10">
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section header */}
        <div className="text-center mb-14 sm:mb-16">
          <p className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.2em] uppercase text-green-700">
            <span className="w-6 h-px bg-green-300" />
            Get In Touch
            <span className="w-6 h-px bg-green-300" />
          </p>
          <h2 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-gray-900">
            Contact <em className="text-[#30794b] not-italic">Us</em>
          </h2>
        </div>

        <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-10 lg:gap-16 items-start">

          {/* Contact info */}
          <div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900">Let&apos;s Work Together</h3>
            <p className="mt-3 text-sm sm:text-base text-gray-600 leading-relaxed max-w-md">
              Feel free to reach out for web development projects, collaborations, freelance work,
              or any creative ideas. I&apos;ll get back to you as soon as possible.
            </p>

            <div className="mt-8 space-y-5">
              {contactInfo.map((item) => {
                const Wrapper = item.href ? 'a' : 'div';
                return (
                  <div key={item.label} className="flex items-center gap-4">
                    <div className="w-11 h-11 shrink-0 rounded-xl bg-white border border-green-100 shadow-sm flex items-center justify-center text-green-800 text-xl">
                      <item.icon />
                    </div>
                    <div>
                      <span className="block text-xs font-semibold uppercase tracking-wide text-gray-400">
                        {item.label}
                      </span>
                      <Wrapper
                        {...(item.href ? { href: item.href } : {})}
                        className="text-sm sm:text-base font-medium text-gray-800 hover:text-green-600 transition-colors"
                      >
                        {item.value}
                      </Wrapper>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Social media */}
            <div className="mt-10 flex items-center gap-3">
              {socialLinks.map((social) => (
                <Link
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="w-10 h-10 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-500 text-lg hover:bg-green-50 hover:text-green-700 transition-colors"
                >
                  <social.icon />
                </Link>
              ))}
            </div>
          </div>

          {/* Contact form */}
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-2xl shadow-xl border border-red-100 p-6 sm:p-8 space-y-5"
          >
            <div className="grid sm:grid-cols-2 gap-5">
              <FloatingField
                id="fname"
                name="name"
                label="Full Name"
                required
                value={formData.name}
                onChange={handleChange}
              />
              <FloatingField
                id="femail"
                name="email"
                type="email"
                label="Email Address"
                required
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-5">
              <FloatingField
                id="fphone"
                name="phone"
                label="Phone Number"
                value={formData.phone}
                onChange={handleChange}
              />
              <FloatingField
                id="fsubject"
                name="subject"
                label="Subject"
                value={formData.subject}
                onChange={handleChange}
              />
            </div>

            <div className="relative">
              <textarea
                id="fmessage"
                name="message"
                required
                rows={5}
                placeholder=" "
                value={formData.message}
                onChange={handleChange}
                className="peer w-full bg-white border border-gray-200 rounded-lg px-4 pt-5 pb-2 text-sm text-gray-900 placeholder-transparent outline-none transition-colors focus:border-red-400 focus:ring-1 focus:ring-red-100 resize-none"
              />
              <label
                htmlFor="fmessage"
                className="absolute left-4 top-1.5 text-[11px] text-gray-500 transition-all duration-200 pointer-events-none peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-400 peer-focus:top-1.5 peer-focus:text-[11px] peer-focus:text-red-500"
              >
                Your Message
              </label>
            </div>

            <button
              type="submit"
              disabled={status === 'sending'}
              className="w-full inline-flex items-center justify-center gap-3 px-6 py-3.5 rounded-lg bg-gradient-to-b from-green-600 via-green-700 to-green-800 text-white font-bold shadow-[0_8px_18px_rgba(0,0,0,0.25)] border border-green-900 transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_12px_24px_rgba(0,0,0,0.35)] active:scale-95 disabled:opacity-60 disabled:hover:scale-100"
            >
              <span>{status === 'sending' ? 'Sending...' : 'Send Message'}</span>
              <BiSend className="text-lg" />
            </button>

            {status === 'success' && (
              <p className="text-sm text-emerald-600 text-center">
                Thanks! Your message has been sent — I&apos;ll get back to you soon.
              </p>
            )}
            {status === 'error' && (
              <p className="text-sm text-red-500 text-center">
                Something went wrong. Please try again or email me directly.
              </p>
            )}
          </form>
        </div>
      </div>
    </section>
  );
};

export default Contact;