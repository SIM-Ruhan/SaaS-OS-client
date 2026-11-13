
'use client';

const steps = [
  {
    number: '01',
    title: 'Create your store',
    body: 'Pick a name, choose your currency and language and get a live website on your own subdomain in under two minutes — no design work required to start.',
  },
  {
    number: '02',
    title: 'Add your products',
    body: 'List one product by hand or bulk-upload a CSV with photos, variants and stock. Prices, sizes and colors are ready to sell the moment you publish.',
  },
  {
    number: '03',
    title: 'Connect payments & courier',
    body: 'Turn on bKash, Nagad or SSLCommerz alongside Cash on Delivery and link a courier like Pathao or RedX so every order gets a tracking number automatically.',
  },
  {
    number: '04',
    title: 'Launch and start selling',
    body: 'Share your website link, build a landing page for an ad campaign — your dashboard tracks every sale as it comes.',
  },
];

export default function HowItWorks() {
  return (
    <section className="px-6 py-10">
      <div className="w-[95%] mx-auto">
        {/* Intro */}
        <div className="mb-16 max-w-xl">
          <h2 className="font-serif text-[2.75rem] leading-[1.1] text-[#1B2027]">
            From a store name to your first order, in one afternoon.
          </h2>
          <p className="mt-4 text-[1.0625rem] leading-relaxed text-[#1B2027]/70">
            Every seller on ShopOS goes through the same four steps.
            None of them need a developer.
          </p>
        </div>

        {/* Steps */}
        <ol className="relative flex flex-col gap-14 md:flex-row md:gap-0">
          {/* Connecting thread */}
          <div
            className="absolute left-4 top-2 h-[calc(100%-2rem)] w-px bg-[#DEDAD1] md:left-0 md:right-0 md:top-2 md:h-px md:w-auto"
            aria-hidden="true"
          />
          {steps.map((step, i) => (
            <li
              key={step.number}
              className="relative flex gap-5 md:flex-1 md:flex-col md:gap-6 md:px-6 md:first:pl-0 md:last:pr-0"
            >
              <span
                className="relative z-10 flex h-8 w-8 flex-none items-center justify-center rounded-full bg-[#F7F6F3] font-sans text-sm font-medium text-[#C6862E] ring-1 ring-[#C6862E]/40 md:h-9 md:w-9"
              >
                {step.number}
              </span>
              <div className="pt-0.5">
                <h3 className="font-sans text-lg font-semibold text-[#1B2027]">
                  {step.title}
                </h3>
                <p className="mt-2 text-[15px] leading-relaxed text-[#1B2027]/65">
                  {step.body}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}