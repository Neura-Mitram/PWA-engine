# PWA-engine
# 🔮 Neura-Mitram PWA

This repository contains the lightning-fast, Progressive Web App (PWA) frontend for **Neura-Mitram** (Your Neural Friend). 

It is designed to be deployed on **Cloudflare Pages** for global edge-caching, ensuring the app loads instantly for users across the US, UK, and India. The UI features a procedurally generated CSS "Mind Orb" that acts as the visual manifestation of the user's subconscious, interacting dynamically with our Google Cloud Run AI backend.

---

## ⚡ Technical Stack

* **Architecture:** Progressive Web App (PWA) / Vanilla SPA
* **Styling:** Pure CSS3 (Zero external libraries to ensure <1 second load times)
* **Animation:** CSS Keyframes & Radial Gradients (No heavy WebGL or 3D assets)
* **Monetization API:** Google Publisher Tag (GPT) for Web Rewarded Video Ads
* **Deployment System:** Cloudflare Pages (Global Edge Network)

---

## 📂 File Matrix

* `index.html` - The structural application shell, typography links, and Google AdSense integrations.
* `style.css` - Contains the procedural fluid mechanics and keyframes that power the breathing "Mitram Orb", as well as the dark-mode app aesthetic.
* `app.js` - The client-side logic engine. It handles user inputs, fetches data from the Cloud Run API, dynamically manipulates the CSS orb states, and manages the Google Rewarded Ad verification callbacks.
* `manifest.json` *(Upcoming)* - Required PWA metadata to allow users to "Install" the website to their mobile home screens.

---

## 🚀 Deployment & Configuration

This project is built for zero-configuration deployments via **Cloudflare Pages**.

### 1. Link the API
Before deploying, you must link this frontend to your active AI backend. 
Open `app.js` and update Line 2 with your live Google Cloud Run URL:
```javascript
const BACKEND_API_URL = "[https://your-cloud-run-url-here.run.app/feed-mitram](https://your-cloud-run-url-here.run.app/feed-mitram)";
