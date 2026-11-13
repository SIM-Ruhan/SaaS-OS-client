# ShopOS mobile

Expo JavaScript app for iOS and Android. Browse stores, choose product variants, manage your cart, check out, and track orders. Sellers can view store metrics and manage order status from the same account.

1. Run `cp .env.example .env` and set `EXPO_PUBLIC_SHOPOS_URL` to the reachable **Next.js client** origin. Use the deployed HTTPS URL on a physical phone.
2. Run `npm ci` and `npm start`. Select an emulator, simulator, or compatible Expo Go device. Online payments open the selected provider's checkout in the device browser.
3. For a web preview, run `npm run web`. If the preview runs on a different origin, add that exact origin to `MOBILE_WEB_ORIGINS` on the Next.js client and restart or redeploy it. The mobile app uses the same Better Auth sessions as the web client.
4. `npx expo export --platform all` builds the JavaScript bundles for web, Android and iOS. For app store distribution, configure your own bundle identifiers in `app.json` and use your Expo and store signing accounts.
