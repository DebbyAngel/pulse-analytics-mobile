# Pulse Analytics Atelier mobile app

Expo Router app for the Pulse Analytics Atelier shop. It uses the existing Supabase project and the existing Next.js API at `https://www.pulsetechanalytics.com`; it does not create another backend.

## Local setup

1. Copy `.env.example` to `.env` and set the Supabase project URL and public anon key from the web deployment. These are public client values; never add the Paystack secret, Supabase service-role key, or Mailgun credentials here.
2. Run `npm install`, then `npx expo start`.

The product catalog and account data load directly from Supabase with the anon key and its existing row-level policies. Checkout posts to the existing `/api/checkout` route with a Supabase access token; Paystack initialization, order writes, verification, and confirmation mail stay on the server. The shopping bag is stored on-device until checkout.

## Google OAuth

The app uses the deep link `pulseanalytics://auth/callback`. Add this exact URL to **Supabase Dashboard → Authentication → URL Configuration → Redirect URLs**. Keep the existing web callback URLs as they are. Google still redirects to the Supabase provider callback shown in Authentication → Providers → Google.

## EAS builds

`eas.json` has a `preview` profile that produces an Android APK and an iOS simulator build. Run `npx eas-cli@latest login` with the Expo account that owns the supplied project, then `npx eas-cli@latest build --platform android --profile preview` and repeat for `ios`.

Configure `EXPO_PUBLIC_API_URL`, `EXPO_PUBLIC_SUPABASE_URL`, and `EXPO_PUBLIC_SUPABASE_ANON_KEY` in the EAS `preview` environment before building.
