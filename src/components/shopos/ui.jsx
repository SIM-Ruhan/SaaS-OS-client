'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion, MotionConfig, useReducedMotion } from 'framer-motion';
import {
  FiAlertCircle,
  FiArrowUpRight,
  FiCheck,
  FiInbox,
  FiLoader,
  FiShoppingBag,
} from 'react-icons/fi';

export function MotionRoot({ children }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
export function Rise({ children, className = '', delay = 0, ...props }) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduced ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, delay, ease: [0.22, 1, 0.36, 1] }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
export function Brand({ href = '/', light = false }) {
  return (
    <Link href={href} className={`brand${light ? ' brand-light' : ''}`} aria-label="ShopOS home">
      <Image src="/brand.svg" alt="" width={36} height={36} priority />
      <span>
        Shop<span>OS</span>
      </span>
    </Link>
  );
}
export function Button({ children, href, tone = 'primary', className = '', ...props }) {
  const classes = `button button-${tone} ${className}`;
  return href ? (
    <Link href={href} className={classes} {...props}>
      {children}
    </Link>
  ) : (
    <button className={classes} type="button" {...props}>
      {children}
    </button>
  );
}
export function IconButton({ icon: Icon, label, ...props }) {
  return (
    <button type="button" className="icon-button" aria-label={label} title={label} {...props}>
      <Icon aria-hidden="true" />
    </button>
  );
}
export function Heading({ eyebrow, title, description, actions }) {
  return (
    <header className="page-heading">
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1>{title}</h1>
        {description && <p className="lede">{description}</p>}
      </div>
      {actions && <div className="row page-actions">{actions}</div>}
    </header>
  );
}
export function Field({ label, hint, children, ...props }) {
  return (
    <label className="field">
      <span>{label}</span>
      {children || <input {...props} />}
      {hint && <small>{hint}</small>}
    </label>
  );
}
export function Toggle({ children, ...props }) {
  return (
    <label className="toggle">
      <input type="checkbox" {...props} />
      <span>{children}</span>
    </label>
  );
}
export function Notice({ children, tone = 'info' }) {
  if (!children) return null;
  const Icon = tone === 'success' ? FiCheck : FiAlertCircle;
  return (
    <div className={`notice notice-${tone}`} role={tone === 'error' ? 'alert' : 'status'}>
      <Icon aria-hidden="true" />
      <span>{children}</span>
    </div>
  );
}
export function Loading({ label = 'Loading…' }) {
  return (
    <p role="status" className="loading">
      <FiLoader aria-hidden="true" />
      {label}
    </p>
  );
}
export function Empty({ title = 'Nothing here yet', description, children, icon: Icon = FiInbox }) {
  return (
    <div className="empty">
      <span className="empty-icon">
        <Icon aria-hidden="true" />
      </span>
      <h3>{title}</h3>
      {description && <p>{description}</p>}
      {children}
    </div>
  );
}
export function Status({ value }) {
  const text = String(value || 'draft').replaceAll('_', ' ');
  const color = [
    'active',
    'paid',
    'published',
    'delivered',
    'verified',
    'connected',
    'lifetime',
  ].includes(value)
    ? 'green'
    : ['cancelled', 'suspended', 'failed', 'hidden', 'refund_due', 'returned'].includes(value)
      ? 'red'
      : ['pending', 'review', 'cod_pending', 'trialing', 'past_due'].includes(value)
        ? 'amber'
        : 'grey';
  return (
    <span className={`status status-${color}`}>
      <span aria-hidden="true" />
      {text}
    </span>
  );
}
export function Table({ columns, rows, render, empty = 'No records yet' }) {
  if (!rows.length) return <Empty title={empty} />;
  return (
    <div className="table-wrap" tabIndex={0} role="region" aria-label="Scrollable table">
      <table>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column} scope="col">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>{render(row)}</tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
export function ProductImage({
  src,
  alt = '',
  priority = false,
  className = '',
  sizes = '(max-width: 700px) 100vw, 400px',
}) {
  return (
    <div className={`product-image ${className}`}>
      {src && /^(https?:\/\/|\/(?!\/))/.test(src) ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          unoptimized={src.startsWith('http')}
        />
      ) : (
        <FiShoppingBag aria-hidden="true" />
      )}
    </div>
  );
}
export function External({ href, children }) {
  return (
    <a href={href} target="_blank" rel="noreferrer" className="external">
      {children}
      <FiArrowUpRight aria-hidden="true" />
    </a>
  );
}
