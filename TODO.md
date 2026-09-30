# London Road Car Sales: work list

Source: audit of the v0 build against the spec. Tick items off as they are done (`[x]`).
Work top to bottom. Do not start a phase until the previous one builds cleanly.
Do not create or edit `.env` files. Add any new variable to the "Env vars" list at the bottom instead.

Status at audit: public site only (about 40% of spec). No admin, no API routes, no Firestore rules,
no Resend, no Cloudinary SDK, no JSON-LD. `npm run build` passes only because type errors are ignored.

---

## Phase A: fix what exists

- [x] A1. `lib/auth.ts`: deny when `ADMIN_EMAILS` is empty (currently any signed-in Firebase user is admin).
- [x] A2. `lib/cloudinary.ts`: add `import "server-only"` (or split server helpers from the public cloud-name helper).
- [x] A3. `lib/vehicles.ts` and `lib/firebase/admin.ts`: in production, throw if Firebase Admin is not configured instead of silently serving `lib/mock-data.ts`. Keep the mock fallback for local dev only.
- [x] A4. `next.config.mjs`: remove `typescript.ignoreBuildErrors`.
- [x] A5. Fix the 2 TS errors in `components/stock-filters.tsx` (lines ~99 and ~117, `string | null` passed as `string`).
- [x] A6. `app/layout.tsx`: remove `generator: 'v0.app'`; point icons at the real files in `public/` (`icon.svg`, `apple-icon.png`, etc.).
- [x] A7. (Done: next upgraded to 16.3.8, critical cleared. Remaining 4 high + 2 moderate are firebase client/grpc and uuid transitive deps; npm only offers a downgrade to firebase 9, so left alone. Recheck later.) Run `npm audit`, upgrade what is safe. Pick ONE package manager: delete the unused lockfile and fix the odd `packageManager` field in `package.json`.
- [x] A8. `git init`, sensible `.gitignore` (keep `.env*`, `.next`, `node_modules` out), first commit.
- [x] A9. `lib/business.ts`: build footer hours from `business.hours` (footer is hardcoded); fix or remove the misleading `isOpenLabel()`.

## Phase B: build what is missing

- [x] B1. `firestore.rules`: deny all client read/write. Add `firebase.json` reference if needed. Deploy is a manual step for Steve.
- [x] B2. Admin auth: `/admin/login` (Firebase client sign-in), server action or route that exchanges the ID token for a `__session` cookie (`createSessionCookie`), logout, and a guard in `app/admin/layout.tsx`.
- [x] B3. Shared helper `requireAdmin()` built on `getAdminSession()`. EVERY admin server action and API route calls it first (verify the token/session, check `ADMIN_EMAILS`).
- [ ] B4. Admin stock list (`/admin`): all vehicles incl. drafts, status badges, quick status change (draft / available / reserved / sold).
- [ ] B5. Admin add/edit vehicle form using `lib/validations/vehicle.ts`. Reg is admin-only. Server actions call `requireAdmin()`, then `revalidatePath` for `/`, `/stock`, `/stock/[slug]`, the three landing pages and the sitemap.
- [ ] B6. `/api/cloudinary/sign`: admin-protected, signs an upload for folder `vehicles/{vehicleId}` with incoming transformation max 2000px width. Uploads go browser to Cloudinary directly, never through Next.js.
- [ ] B7. Admin image manager: multi-upload (phone camera friendly), reorder, set cover, remove.
- [ ] B8. Delete vehicle: `requireAdmin()`, delete the Cloudinary images for `vehicles/{id}`, delete the doc, revalidate.
- [ ] B9. Install `next-cloudinary` and switch `components/vehicle-image.tsx` to it (currently builds URLs by hand).
- [ ] B10. Enquiries: install `resend`; send from `enquiries@londonroadcarsales.uk`, reply-to the customer, to `BUSINESS_EMAIL`. Keep the Firestore copy. Add rate limiting and max lengths in `lib/validations/enquiry.ts`. Return an error if the email fails; never report success when nothing was sent or stored.
- [ ] B11. DVLA reg lookup in the admin form (server-side call, `DVLA_API_KEY`); hide the button when the key is missing. Prefill make, year, fuel, colour, MOT expiry.

## Phase C: SEO and schema

- [ ] C1. AutoDealer JSON-LD site-wide (layout) using `lib/business.ts`.
- [ ] C2. Car/Vehicle + Offer JSON-LD on `/stock/[slug]` (price, currency GBP, availability from status, mileage, fuel, etc.). Never include the reg.
- [ ] C3. `alternates.canonical` on every page (non-www, built from `business.siteUrl`). Confirm the www to non-www redirect in Vercel domain settings.
- [ ] C4. Sold vehicles: `robots: { index: false }` once `soldAt` is more than 30 days ago. Consider dropping them from the sitemap at the same point.
- [ ] C5. Vehicle page Open Graph: absolute image URL (Cloudinary or site URL + path), add twitter card.
- [ ] C6. `robots.ts`: disallow `/admin` and `/api`. Add `robots: noindex` on admin pages.
- [ ] C7. Review metadata on the three landing pages and all other pages (title, description, British English).

## Phase D: admin usability on a phone

- [ ] D1. Check every admin screen at 375px width: big touch targets, no horizontal scroll, single-column forms, sticky save button.
- [ ] D2. Image upload works from the phone camera and gallery, with progress and clear errors.
- [ ] D3. Status can be changed in one or two taps from the list.

## Phase E: content to confirm with the client (cannot be guessed)

- [ ] E1. Real phone and WhatsApp numbers (currently `01476 000 000`).
- [ ] E2. Legal name, company number, VAT number, ICO number (currently placeholders).
- [ ] E3. Business email (currently `tywebster@hotmail.co.uk`: confirm it is right).
- [ ] E4. Exact map pin for the address.
- [ ] E5. Check prices are shown in full everywhere, with VAT status on vans and commercials, and no admin fees anywhere.
- [ ] E6. Replace mock stock and the `public/vehicles/*` placeholder images with real data.

## Phase F: pre-launch checks

- [ ] F1. `npx tsc --noEmit` clean and `npm run build` clean with type checking on.
- [ ] F2. Grep the built output and public pages to confirm `reg` never appears.
- [ ] F3. Try every admin action and API route while logged out and while logged in as a non-allowlisted user: all must be refused.
- [ ] F4. Test an enquiry end to end (email arrives, reply-to correct, Firestore doc written).
- [ ] F5. Validate JSON-LD (Rich Results Test), check sitemap and robots on the deployed URL.
- [ ] F6. Footer credit link to https://webfuzsion.co.uk is present and followed (no `nofollow`).
- [ ] F7. Set all env vars in Vercel and confirm the site fails loudly, not silently, if one is missing.

---

## Env vars

Server: `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`, `ADMIN_EMAILS`,
`CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, `RESEND_API_KEY`, `BUSINESS_EMAIL`, `DVLA_API_KEY` (optional)

Public: `NEXT_PUBLIC_FIREBASE_API_KEY`, `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`, `NEXT_PUBLIC_FIREBASE_PROJECT_ID`,
`NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`, `NEXT_PUBLIC_SITE_URL`
