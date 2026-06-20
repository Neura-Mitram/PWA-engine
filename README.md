# PWA-engine

The frontend of **Neura-Mitram** — a pure HTML/CSS/JS cyberpunk terminal UI.
No build step, no framework, no bundler. Deployed as a static site
(Cloudflare Pages) at [neuramitram.space](https://neuramitram.space).

## Stack
- Vanilla HTML / CSS / JS (zero dependencies)
- Web Speech API (voice input)
- Web Audio API (binaural-beat ambient audio engine + decrypt success chime)
- Canvas API (share card generation)
- Razorpay Checkout.js (Phase 5 — Mind-Key Economy paywall)
- PWA manifest (installable on mobile home screen)

## File Map

| File | Purpose |
|---|---|
| `index.html` | All markup — terminal, modals, crisis overlay, decrypt UI |
| `style.css` | Full cyberpunk theme, animations, responsive layout, paywall styling |
| `app.js` | All logic — API calls, audio engine, sentient loop, history chart, Mirror Mode, Void Session, Razorpay decrypt flow |
| `manifest.json` | PWA install config |
| `icons/` | App icons (192px, 512px) — **placeholders included, swap with your real logo** |

## ⚠️ Required Setup Before Deploy

Open `app.js` and change line 9:

```js
const API_BASE = "https://YOUR-CLOUD-RUN-URL.run.app";
```

Replace with your live `orb-engine-core` Cloud Run service URL. The frontend
will not work without this — including the Phase 5 paywall, which calls
`/create-order` and `/verify-payment` on that same base URL.

## Local Preview

No build step needed. Just serve the folder:

```bash
git clone https://github.com/Neura-Mitram/PWA-engine.git
cd PWA-engine
python3 -m http.server 8000
# open http://localhost:8000
```

Or just open `index.html` directly in a browser (voice input requires
`https://` or `localhost` due to browser security — file:// won't work for mic).

Note: Razorpay test-mode checkout works fine on `localhost`, so you can test
the full Phase 5 flow before deploying.

## Deploy to Cloudflare Pages

1. Push this repo to GitHub.
2. Cloudflare Dashboard → Workers & Pages → Create → Pages → Connect to Git.
3. Select the `PWA-engine` repo.
4. Build settings:
   - **Build command:** (leave empty)
   - **Build output directory:** `/`
5. Deploy. Add your custom domain (`neuramitram.space`) under
   Custom Domains once deployed.

## Replacing the Icons

The included `icons/icon-192.png` and `icons/icon-512.png` are placeholder
orb graphics matching the brand. To use your real logo:

1. Export your logo as a square PNG at 192×192 and 512×512.
2. Replace the files in `icons/` keeping the same filenames.
3. No other changes needed — `manifest.json` already points to them.

## Features in This Build

- Cyberpunk terminal UI with breathing Quantum Core orb (4 states)
- Voice input (Web Speech API) + typewriter text rendering
- Binaural-beat ambient audio mapped to 11 distress types
- Sentient Loop: daily directive, 24h/48h/7-day decay states with glitch sequences
- Session streak tracking + pattern escalation detection
- Urgency intensity bar + recovery signal badges
- Neural Timeline modal — SVG mood chart + scrollable history list
- Mirror Mode — AI-generated reflective Q&A flow
- Void Session — timed free-write with word count
- Crisis Protocol overlay with guided breathing (triggers at urgency 4–5)
- Shareable "Aura Card" PNG export (Canvas API)
- Installable as a PWA on mobile
- **Phase 5 — Mind-Key Economy:** the deep diagnostic renders as blurred,
  scrambled "ciphertext" with a glowing `DECRYPT DIAGNOSTIC — ₹49` button.
  Tapping it opens Razorpay's native checkout modal. On successful payment,
  the backend verifies the signature and releases the real text, which
  unblurs with a gold reveal-flash and a 3-note success chime.

## How the Phase 5 UI Flow Works

1. `/feed-mitram` returns `deep_analysis_locked: true` plus a scrambled
   `deep_analysis_preview` (same shape/length as the real text, but
   unreadable). The free `snappy_reaction` and `suggested_action` fields
   are unaffected.
2. The preview renders with a CSS `blur()` filter and a `🔒 DECRYPT
   DIAGNOSTIC — ₹{price}` button overlaid on top.
3. Tapping the button calls `/create-order`, then opens Razorpay Checkout
   using the returned `order_id` and publishable `key_id`.
4. On successful payment, Razorpay's `handler` callback fires with a
   payment ID + signature, which gets sent to `/verify-payment`.
5. Once verified server-side, the real `deep_analysis` text is returned,
   the blur is removed, a gold flash animation plays, and a short rising
   chime confirms the unlock.
6. If the user dismisses the Razorpay modal or payment fails, the button
   resets cleanly with no charge and no broken state.

## Notes

- All state is stored in `localStorage` (`neural_signature`) — anonymous,
  device-only, no login required.
- This frontend expects the exact JSON response shape produced by
  `orb-engine-core`'s `/feed-mitram`, `/wake-mitram`, `/get-history`,
  `/mirror-session`, `/create-order`, and `/verify-payment` endpoints. If
  you change the backend schema, update the corresponding handlers in
  `app.js`.
- The share card generator checks whether the diagnostic has actually been
  decrypted before including its text in the exported PNG — it will never
  leak the scrambled preview or pull text before payment is verified.

