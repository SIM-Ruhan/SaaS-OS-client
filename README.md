# ShopOS client

The JavaScript Next.js site contains the seller workspace, storefronts, checkout, and platform administration. The Expo app is in `mobile/`. Both apps use the same ShopOS API and MongoDB-backed Better Auth accounts.

## Run locally

1. Install Node.js 22.13 or later. Start the server using its README and keep it running on port `8000`.
2. Run `cp .env.example .env.local`. Use the same `MONGODB_URI`, `MONGODB_DB`, and `SHOPOS_PROXY_SECRET` in both projects. Keep the sample localhost URLs for local development.
3. Generate `BETTER_AUTH_SECRET` with `openssl rand -hex 32`. The server README explains the shared proxy secret and the separate integration encryption key.
4. Run `npm ci` and `npm run dev` in this directory. Open `http://localhost:3000`, choose **Start selling**, and create a store.
5. Add an in-stock product, open the storefront, add the product to the cart, and select **Cash on delivery**. Open **Orders** in the seller dashboard to manage fulfillment.

Existing Phase 1 accounts, stores, products, and orders use their existing database. Keep `BETTER_AUTH_SECRET` and `SHOPOS_PROXY_SECRET` stable when upgrading. Creating a store activates the signed-in seller account automatically. Open an existing order in **Orders** and choose **Get guest tracking link** to generate a signed receipt link.

## Main routes

| Area | Routes |
| --- | --- |
| Seller account and stores | `/login`, `/registration`, `/dashboard/seller`, `/dashboard/seller/create-shop` |
| Catalog and orders | `/dashboard/products`, `/dashboard/products/new`, `/dashboard/orders` |
| Growth | `/dashboard/landing-pages`, `/dashboard/marketing`, `/dashboard/analytics`, `/dashboard/research`, `/dashboard/affiliates` |
| Configuration | `/dashboard/settings`, `/dashboard/settings/payments`, `/dashboard/settings/couriers`, `/dashboard/settings/integrations`, `/dashboard/settings/billing` |
| Storefront | `/shops`, `/shops/[shopSlug]`, `/shops/[shopSlug]/products`, `/shops/[shopSlug]/cart`, `/shops/[shopSlug]/account`, `/shops/[shopSlug]/p/[pageSlug]` |
| Platform administration | `/admin` |

The store selector adds `?shop=your-store` to dashboard URLs. The store owner can configure credentials. Manager and support accounts gain access by verifying the email used to add them to the team. Set `RESEND_API_KEY` and `EMAIL_FROM` on the client for verification emails. Google login also needs `CLIENT_ID`, `CLIENT_SECRET`, and the authorized callback `https://your-client.example/api/auth/callback/google`.

## Deploy to Vercel

1. Deploy the separate server project first. Verify its public `/health` endpoint.
2. Import the client folder as a separate **Next.js** project. The directory containing this README and `package.json` is the project root. Use Node.js 22.x or 24.x and leave the Next.js build command at its default.
3. Add the values from `.env.example` in the project's environment settings. `BETTER_AUTH_URL` is the public client origin, `SHOPOS_SERVER_URL` is the public Express origin, and `SHOPOS_PROXY_SECRET` must match the API project. Add the same database settings to both projects. Keep these values in server-side environment variables.
4. Deploy the client and update the API's `CLIENT_URL` if the assigned client URL changed. Test registration, store creation, a COD order, and then each connected provider with test credentials. Use an environment-specific database and auth origin for previews.

To route wildcard subdomains, add the wildcard domain to the client project, follow its DNS and certificate setup, and set `SHOPOS_ROOT_DOMAIN` in both projects. For a custom hostname, enable `ENABLE_CUSTOM_DOMAINS=true` in the client, add the domain in **Store settings**, and complete the Vercel and ShopOS DNS checks. Storefront navigation works through the public hostname. Customer sign-in uses the canonical client origin when following the storefront's account links, and guest checkout also works on a custom hostname.

## Checks

Run `npm run lint` and `npm run build` from this directory. See `mobile/README.md` to run the Expo app.
