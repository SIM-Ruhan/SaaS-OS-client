import { betterAuth } from 'better-auth';
import { mongodbAdapter } from 'better-auth/adapters/mongodb';
import { bearer } from 'better-auth/plugins';
import clientPromise from './mongodb';

const client = await clientPromise;
const db = client.db(process.env.MONGODB_DB || 'shopOS');
async function verificationMail({ user, url }) {
  const result = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM,
      to: [user.email],
      subject: 'Verify your ShopOS email',
      text: `Verify your email: ${url}`,
    }),
    signal: AbortSignal.timeout(10_000),
  });
  if (!result.ok) throw new Error('Could not send the verification email');
}
const mail = !!(process.env.RESEND_API_KEY && process.env.EMAIL_FROM);
export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:3000',
  database: mongodbAdapter(db, { client }),
  trustedOrigins: (process.env.MOBILE_WEB_ORIGINS || '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean),
  plugins: [bearer({ requireSignature: true })],
  emailAndPassword: { enabled: true, minPasswordLength: 8 },
  emailVerification: mail ? { sendOnSignUp: true, sendVerificationEmail: verificationMail } : undefined,
  socialProviders:
    process.env.CLIENT_ID && process.env.CLIENT_SECRET
      ? { google: { clientId: process.env.CLIENT_ID, clientSecret: process.env.CLIENT_SECRET } }
      : {},
  user: {
    additionalFields: {
      role: { type: 'string', defaultValue: 'user', input: false },
      shopSlug: { type: 'string', required: false, input: true },
      plan: { type: 'string', required: false, defaultValue: 'free', input: false },
      phone: { type: 'string', required: false, input: true },
      address: { type: 'string', required: false, input: true },
      isBlocked: { type: 'boolean', required: false, defaultValue: false, input: false },
    },
  },
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          if (!user.shopSlug) return;
          const shop = await db.collection('shops').findOne({ slug: user.shopSlug });
          if (shop)
            await db
              .collection('shopCustomers')
              .updateOne(
                { userId: user.id, shopSlug: shop.slug },
                { $setOnInsert: { sellerId: shop.ownerId, registeredAt: new Date() } },
                { upsert: true },
              );
        },
      },
    },
  },
});
