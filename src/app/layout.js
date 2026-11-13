import '@fontsource-variable/dm-sans';
import '@fontsource-variable/manrope';
import './globals.css';
import { MotionRoot } from '@/components/shopos/ui';

export const metadata = {
  title: { default: 'ShopOS | Commerce for independent sellers', template: '%s | ShopOS' },
  description:
    'Open your online store, manage products and delivery, and grow your business with ShopOS.',
  icons: { icon: '/brand.svg' },
};
export const viewport = { themeColor: '#f5f6f0', width: 'device-width', initialScale: 1 };
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <a className="skip-link" href="#main-content">
          Skip to content
        </a>
        <MotionRoot>{children}</MotionRoot>
      </body>
    </html>
  );
}
