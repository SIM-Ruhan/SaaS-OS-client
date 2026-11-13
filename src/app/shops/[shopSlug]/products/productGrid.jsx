'use client';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useCart } from '../../shopComponents/cartContext';
export default function ProductGrid({ products }) {
  const { addItem } = useCart();
  return (
    <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4">
      {products.map((item, index) => (
        <motion.article
          key={item.id}
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: Math.min(index * 0.04, 0.3) }}
          className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
        >
          <div className="relative aspect-square overflow-hidden bg-emerald-50">
            {item.imageUrl ? (
              <Image
                src={item.imageUrl}
                alt={item.name}
                fill
                unoptimized
                sizes="(max-width: 700px) 50vw, 25vw"
                className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
              />
            ) : (
              <div className="flex h-full items-center justify-center p-5 text-center text-emerald-800">
                {item.name}
              </div>
            )}
          </div>
          <div className="p-3 sm:p-5">
            <p className="text-xs uppercase tracking-wide text-emerald-700">
              {item.category || 'Collection'}
            </p>
            <h2 className="mt-1 font-semibold">{item.name}</h2>
            <p className="mt-2 text-sm text-slate-600">
              ৳{item.price} · {item.stock} available
            </p>
            <button
              disabled={!item.stock}
              onClick={() => addItem(item)}
              className="mt-4 w-full rounded-xl bg-emerald-800 px-3 py-2.5 text-sm text-white transition hover:bg-emerald-700 disabled:opacity-40"
            >
              {item.stock ? 'Add to cart' : 'Sold out'}
            </button>
          </div>
        </motion.article>
      ))}
    </div>
  );
}
