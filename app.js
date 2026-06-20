/* ═══════════════════════════════════════════════════
   NEURA-MITRAM · app.js v7.0
   Full sentient loop · audio engine · history · mirror · void
   · Phase 5: Mind-Key Economy (Razorpay decrypt paywall)
═══════════════════════════════════════════════════ */

// ─────────────────────────────────────────────
//  ⚙ CONFIG — UPDATE THIS TO YOUR CLOUD RUN URL
// ─────────────────────────────────────────────
const API_BASE = "https://YOUR-CLOUD-RUN-URL.run.app";
// ─────────────────────────────────────────────

// ─── Global state ──────────────────────────────
let neuralSignature   = null;
let audioCtx          = null;
let activeOscillators = [];
let currentColor      = "gold";
let isAnalyzing       = false;
let loadingInterval   = null;
let breathTimeout     = null;

// Mirror mode
let mirrorQuestions = [];
let mirrorAnswers   = [];
let mirrorStep      = 0;

// Void session
let voidDuration    = 5;
let voidInterval    = null;
let voidSecondsLeft = 0;

// Phase 5 — Mind-Key Economy
let currentReadingId   = null;
let currentPriceRupees = 49;
let isDecrypting       = false;

// ─── Loading messages ───────────────────────────
const LOADING_MESSAGES = [
  "> SCANNING NEURAL SIGNATURE...",
  "> PATTERN RECOGNITION ACTIVE...",
  "> CROSS-REFERENCING MEMORY MATRIX...",
  "> CALIBRATING EMOTIONAL RESONANCE...",
  "> DISTRESS MAPPING IN PROGRESS...",
  "> SYNTHESIZING PSYCHOLOGICAL PROFILE...",
  "> DIAGNOSTIC COMPILING...",
];

// ─── Audio: distress flag → binaural beat params ─
//     base = carrier Hz, beat = beat frequency Hz
//     beat=0 → simple tone only
const DISTRESS_AUDIO = {
  insomnia:              { base: 200, beat: 2  },  // Delta ~2Hz  → deep sleep induction
  general_anxiety:       { base: 200, beat: 6  },  // Theta ~6Hz  → calming
  burnout:               { base: 210, beat: 10 },  // Alpha ~10Hz → relaxed alertness
  relationship_toxicity: { base: 180, beat: 14 },  // Beta 14Hz   → beta suppression
  grief:                 { base: 216, beat: 0  },  // 432Hz carrier → emotional processing
  loneliness:            { base: 200, beat: 7  },  // Theta
  decision_paralysis:    { base: 200, beat: 12 },  // Alpha
  physical_exhaustion:   { base: 174, beat: 0  },  // 174Hz → grounding frequency
  creative_block:        { base: 200, beat: 40 },  // Gamma 40Hz  → insight/focus
  financial_stress:      { base: 200, beat: 8  },  // Alpha
  identity_crisis:       { base: 200, beat: 6  },  // Theta
  none:                  { base: 256, beat: 0  },  // C4 neutral
};

// ─── Boot ───────────────────────────────────────
window.addEventListener("DOMContentLoaded", () => {
  initSession();
  setupListeners();
});

function initSession() {
  let sig = localStorage.getItem("neural_signature");
  const isFirstVisit = !sig;

  if (!sig) {
    sig = "NS-" + Date.now() + "-" +
      Math.random().toString(36).substring(2, 10).toUpperCase();
    localStorage.setItem("neural_signature", sig);
  }
  neuralSignature = sig;
  wakeUp();

  // First-time visitors get the plain-English explainer automatically
  if (isFirstVisit) {
    setTimeout(() => openExplainerModal(), 700);
  }
}

function setupListeners() {
  // Explainer modal
  document.getElementById("closeExplainer").onclick = () => closeExplainerModal();

  // Footer legal links
  document.getElementById("openPrivacy").onclick  = () => showModal("privacyModal");
  document.getElementById("openTerms").onclick    = () => showModal("termsModal");
  document.getElementById("closePrivacy").onclick = () => hideModal("privacyModal");
  document.getElementById("closeTerms").onclick   = () => hideModal("termsModal");
  document.getElementById("closeHistory").onclick = () => hideModal("historyModal");
  document.getElementById("closeMirror").onclick  = () => closeMirrorModal();
  document.getElementById("closeVoid").onclick    = () => closeVoidModal();

  // Ctrl+Enter to analyze
  document.getElementById("userInput").addEventListener("keydown", (e) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) analyzeThoughts();
  });

  // Mirror input — Enter key
  document.getElementById("mirrorInput").addEventListener("keydown", (e) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) mirrorNext();
  });
}

// ─── Modal helpers ──────────────────────────────
function showModal(id) { document.getElementById(id).classList.remove("hidden"); }
function hideModal(id) { document.getElementById(id).classList.add("hidden"); }

function openExplainerModal()  { showModal("explainerModal"); }
function closeExplainerModal() { hideModal("explainerModal"); }

// ─── Wake Up ────────────────────────────────────
async function wakeUp() {
  try {
    const res = await fetch(`${API_BASE}/wake-mitram`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ user_id: neuralSignature }),
    });
    if (!res.ok) throw new Error(`Wake status: ${res.status}`);
    const data = await res.json();
    handleWakeResponse(data);
  } catch (err) {
    setDirective("> NEURAL LINK UNSTABLE. SYSTEM AWAITING INPUT.", false);
    console.warn("Wake error:", err);
  }
}

function handleWakeResponse(data) {
  // Directive with typewriter
  setDirective("> " + data.directive, true);

  // Streak badge
  if (data.session_streak >= 2) {
    document.getElementById("streakCount").textContent = data.session_streak;
    document.getElementById("streakBadge").classList.remove("hidden");
  }

  // Pattern escalation badge
  if (data.escalation_mode) {
    document.getElementById("patternBadge").classList.remove("hidden");
  }

  // Cognitive decay handling
  if (data.decay_state === "death") {
    setTimeout(triggerDeathSequence, 800);
  } else if (data.decay_state === "critical") {
    setTimeout(() => triggerGlitch("critical"), 600);
  } else if (data.decay_state === "warning") {
    setTimeout(() => triggerGlitch("warning"), 600);
  }
}

// ─── Directive typewriter ───────────────────────
function setDirective(text, animate = false) {
  const el = document.getElementById("directiveText");
  el.classList.remove("loading-text");
  if (animate) {
    el.textContent = "";
    typewriter(el, text, 28);
  } else {
    el.textContent = text;
  }
}

function typewriter(el, text, speed = 28) {
  let i = 0;
  const fn = () => {
    if (i < text.length) {
      el.textContent += text[i++];
      setTimeout(fn, speed);
    }
  };
  fn();
}

// ─── Analyze Thoughts ───────────────────────────
async function analyzeThoughts() {
  if (isAnalyzing) return;
  const input = document.getElementById("userInput").value.trim();
  if (!input || input.length < 3) {
    setDirective("> ERROR: INPUT TOO SHORT. MINIMUM NEURAL SIGNAL REQUIRED.");
    return;
  }

  isAnalyzing = true;
  const btn = document.getElementById("feedButton");
  btn.disabled = true;

  showLoadingState();
  stopAudio();

  try {
    const res = await fetch(`${API_BASE}/feed-mitram`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ user_id: neuralSignature, user_input: input }),
    });
    if (!res.ok) throw new Error(`Feed status: ${res.status}`);
    const data = await res.json();
    handleAnalysisResponse(data);
  } catch (err) {
    hideLoadingState();
    setDirective("> CONNECTION FAILURE. QUANTUM BRIDGE UNSTABLE. TRY AGAIN.");
    console.error("Feed error:", err);
  } finally {
    isAnalyzing = false;
    btn.disabled = false;
  }
}

function handleAnalysisResponse(data) {
  hideLoadingState();

  const {
    orb_color, snappy_reaction, suggested_action,
    distress_flag, recovery_signal, urgency_level, health_impact,
    reading_id, deep_analysis_locked, deep_analysis_preview, deep_analysis,
    price_rupees,
  } = data;

  // ── Track this reading for the decrypt flow ──
  currentReadingId   = reading_id || null;
  currentPriceRupees = price_rupees || 49;

  // ── Orb ──
  setOrbState(orb_color);
  document.getElementById("orbVibeText").textContent =
    `RESONANCE: ${(orb_color || "GOLD").toUpperCase()} · IMPACT: ${health_impact > 0 ? "+" : ""}${health_impact}`;

  // ── Urgency bar ──
  showUrgencyBar(urgency_level || 1);

  // ── Snappy reaction (typed in, always free) ──
  const reactionEl = document.getElementById("freeOutputText");
  reactionEl.classList.remove("hidden");
  reactionEl.textContent = "";
  typewriter(reactionEl, `> ${snappy_reaction}`, 22);

  // ── Recovery signal ──
  if (recovery_signal && recovery_signal !== "none") {
    document.getElementById("recoveryText").textContent =
      "RECOVERY SIGNAL: " + recovery_signal.toUpperCase().replace(/_/g, " ");
    document.getElementById("recoverySignal").classList.remove("hidden");
  } else {
    document.getElementById("recoverySignal").classList.add("hidden");
  }

  // ── Deep diagnostic (locked or open) ──
  setTimeout(() => {
    renderDiagnostic({ deep_analysis_locked, deep_analysis_preview, deep_analysis });
  }, 1400);

  // ── Suggested action (always free) ──
  if (suggested_action) {
    setTimeout(() => {
      document.getElementById("actionText").textContent = suggested_action;
      document.getElementById("actionBlock").classList.remove("hidden");
    }, 2400);
  }

  // ── Share button ──
  setTimeout(() => {
    document.getElementById("shareBtn").classList.remove("hidden");
  }, 3000);

  // ── Audio ──
  playMoodAudio(distress_flag, health_impact);

  // ── Crisis protocol at urgency 4–5 ──
  if (urgency_level >= 4) {
    setTimeout(() => triggerCrisisProtocol(urgency_level, distress_flag), 4500);
  }
}

// ─── Phase 5: Render the diagnostic, locked or unlocked ──
function renderDiagnostic({ deep_analysis_locked, deep_analysis_preview, deep_analysis }) {
  const wrapper    = document.getElementById("diagnosticWrapper");
  const textEl     = document.getElementById("deepAnalysisText");
  const overlay    = document.getElementById("decryptOverlay");
  const badge      = document.getElementById("decryptedBadge");
  const decryptBtn = document.getElementById("decryptBtnLabel");

  wrapper.classList.remove("hidden");
  badge.classList.add("hidden");
  textEl.classList.remove("decrypted");

  if (deep_analysis_locked) {
    textEl.textContent = `>> DIAGNOSTIC: ${deep_analysis_preview}`;
    decryptBtn.textContent = `DECRYPT DIAGNOSTIC — ₹${currentPriceRupees}`;
    overlay.classList.remove("hidden");
    document.getElementById("decryptBtn").disabled = false;
  } else {
    // No DB / fail-open path — show it straight, no paywall
    overlay.classList.add("hidden");
    textEl.textContent = "";
    typewriter(textEl, `>> DIAGNOSTIC: ${deep_analysis}`, 14);
  }
}

// ─── Phase 5: Decrypt flow ───────────────────────
async function initiateDecrypt() {
  if (isDecrypting || !currentReadingId) return;
  isDecrypting = true;

  const btn = document.getElementById("decryptBtn");
  const label = document.getElementById("decryptBtnLabel");
  const originalLabel = label.textContent;
  btn.disabled = true;
  label.textContent = "OPENING SECURE CHANNEL...";

  try {
    const orderRes = await fetch(`${API_BASE}/create-order`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id:    neuralSignature,
        reading_id: currentReadingId,
      }),
    });

    if (!orderRes.ok) {
      const err = await orderRes.json().catch(() => ({}));
      throw new Error(err.detail || `Order creation failed (${orderRes.status})`);
    }

    const order = await orderRes.json();

    const options = {
      key:         order.key_id,
      amount:      order.amount,
      currency:    order.currency,
      order_id:    order.order_id,
      name:        "Neura-Mitram",
      description: "Decrypt Psychological Diagnostic",
      theme:       { color: "#00c8ff" },
      handler: async function (response) {
        await handleDecryptSuccess(response);
      },
      modal: {
        ondismiss: function () {
          isDecrypting = false;
          btn.disabled = false;
          label.textContent = originalLabel;
        },
      },
    };

    const rzp = new Razorpay(options);
    rzp.on("payment.failed", function () {
      isDecrypting = false;
      btn.disabled = false;
      label.textContent = "PAYMENT FAILED — TRY AGAIN";
      setTimeout(() => { label.textContent = originalLabel; }, 2500);
    });

    rzp.open();
    // Reset button immediately — Razorpay's own modal takes over the wait state
    btn.disabled = false;
    label.textContent = originalLabel;
    isDecrypting = false;

  } catch (err) {
    console.error("Decrypt order error:", err);
    label.textContent = "CONNECTION FAILED — TRY AGAIN";
    btn.disabled = false;
    isDecrypting = false;
    setTimeout(() => { label.textContent = originalLabel; }, 2500);
  }
}

async function handleDecryptSuccess(razorpayResponse) {
  const textEl     = document.getElementById("deepAnalysisText");
  const overlay    = document.getElementById("decryptOverlay");
  const wrapper    = document.getElementById("diagnosticWrapper");
  const badge      = document.getElementById("decryptedBadge");
  const label      = document.getElementById("decryptBtnLabel");

  label.textContent = "VERIFYING PAYMENT...";

  try {
    const res = await fetch(`${API_BASE}/verify-payment`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id:             neuralSignature,
        reading_id:          currentReadingId,
        razorpay_order_id:   razorpayResponse.razorpay_order_id,
        razorpay_payment_id: razorpayResponse.razorpay_payment_id,
        razorpay_signature:  razorpayResponse.razorpay_signature,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || "Verification failed");
    }

    const data = await res.json();

    // ── Reveal ──
    overlay.classList.add("hidden");
    textEl.classList.add("decrypted");
    textEl.textContent = "";
    typewriter(textEl, `>> DIAGNOSTIC: ${data.deep_analysis}`, 12);

    badge.classList.remove("hidden");
    wrapper.classList.add("reveal-flash");
    setTimeout(() => wrapper.classList.remove("reveal-flash"), 950);

    playDecryptSuccessSound();

  } catch (err) {
    console.error("Verify payment error:", err);
    label.textContent = "VERIFICATION FAILED — CONTACT SUPPORT IF CHARGED";
    document.getElementById("decryptBtn").disabled = false;
  }
}

function playDecryptSuccessSound() {
  const ctx = getAudioCtx();
  const now = ctx.currentTime;
  // Quick ascending 3-note arpeggio — C5, E5, G5
  const notes = [523.25, 659.25, 783.99];
  notes.forEach((freq, i) => {
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    const start = now + i * 0.09;
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(0.10, start + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, start + 0.35);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(start);
    osc.stop(start + 0.4);
  });
}

// ─── Orb State ──────────────────────────────────
function setOrbState(color) {
  const orb = document.getElementById("mitramOrb");
  const validColors = ["gold", "blue", "crimson", "grey"];
  const c = validColors.includes(color) ? color : "gold";
  orb.className = `quantum-core state-${c}`;
  currentColor = c;
  updateWaveColor(c);
}

function updateWaveColor(color) {
  const map = {
    gold:    "rgba(245,200,66,0.28)",
    blue:    "rgba(0,191,255,0.28)",
    crimson: "rgba(224,24,60,0.28)",
    grey:    "rgba(136,153,170,0.18)",
  };
  document.querySelectorAll(".nexus-wave").forEach(w => {
    w.style.borderColor = map[color] || map.gold;
  });
}

// ─── Urgency bar ────────────────────────────────
function showUrgencyBar(level) {
  const l = Math.min(Math.max(Math.round(level), 1), 5);
  document.getElementById("urgencyBarFill").className = `urgency-bar-fill u${l}`;
  document.getElementById("urgencyValue").textContent = `${l}/5`;
  document.getElementById("urgencyRow").classList.remove("hidden");
}

// ─── Loading state ──────────────────────────────
function showLoadingState() {
  let idx = 0;
  const el = document.getElementById("directiveText");

  // Hide all output zones
  ["freeOutputText","diagnosticWrapper","actionBlock","shareBtn",
   "urgencyRow","recoverySignal"].forEach(id => {
    document.getElementById(id).classList.add("hidden");
  });

  el.classList.add("loading-text");
  el.textContent = LOADING_MESSAGES[0];

  loadingInterval = setInterval(() => {
    idx = (idx + 1) % LOADING_MESSAGES.length;
    el.textContent = LOADING_MESSAGES[idx];
  }, 880);

  // Speed up orb breathing
  document.getElementById("mitramOrb").style.animationDuration = "1s";
}

function hideLoadingState() {
  if (loadingInterval) { clearInterval(loadingInterval); loadingInterval = null; }
  document.getElementById("directiveText").classList.remove("loading-text");
  document.getElementById("mitramOrb").style.animationDuration = "3.2s";
}

// ─── Audio Engine ────────────────────────────────
function getAudioCtx() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === "suspended") audioCtx.resume();
  return audioCtx;
}

function stopAudio() {
  const now = audioCtx ? audioCtx.currentTime : 0;
  activeOscillators.forEach(({ osc, gain }) => {
    try {
      gain.gain.setTargetAtTime(0, now, 0.4);
      setTimeout(() => { try { osc.stop(); } catch (_) {} }, 600);
    } catch (_) {}
  });
  activeOscillators = [];
}

function playMoodAudio(distressFlag, healthImpact) {
  const ctx     = getAudioCtx();
  const params  = DISTRESS_AUDIO[distressFlag] || DISTRESS_AUDIO.none;
  // Volume scales gently with health_impact magnitude, capped so it's never harsh
  const volume  = Math.min(0.055 + Math.abs(healthImpact || 0) * 0.005, 0.14);

  if (params.beat === 0) {
    playSingleTone(ctx, params.base * 2, volume);
  } else {
    playBinaural(ctx, params.base * 2, params.beat, volume);
  }
}

function playSingleTone(ctx, freq, vol) {
  const osc  = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type              = "sine";
  osc.frequency.value   = freq;
  gain.gain.setValueAtTime(0, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(vol, ctx.currentTime + 1.8);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  activeOscillators.push({ osc, gain });
}

function playBinaural(ctx, baseFreq, beatFreq, vol) {
  // Binaural beats require stereo: left and right at different frequencies
  const merger = ctx.createChannelMerger(2);

  const oscL  = ctx.createOscillator();
  const gainL = ctx.createGain();
  oscL.type            = "sine";
  oscL.frequency.value = baseFreq;
  gainL.gain.setValueAtTime(0, ctx.currentTime);
  gainL.gain.linearRampToValueAtTime(vol, ctx.currentTime + 1.8);
  oscL.connect(gainL);
  gainL.connect(merger, 0, 0); // left channel

  const oscR  = ctx.createOscillator();
  const gainR = ctx.createGain();
  oscR.type            = "sine";
  oscR.frequency.value = baseFreq + beatFreq;
  gainR.gain.setValueAtTime(0, ctx.currentTime);
  gainR.gain.linearRampToValueAtTime(vol, ctx.currentTime + 1.8);
  oscR.connect(gainR);
  gainR.connect(merger, 0, 1); // right channel

  merger.connect(ctx.destination);
  oscL.start();
  oscR.start();

  activeOscillators.push({ osc: oscL, gain: gainL });
  activeOscillators.push({ osc: oscR, gain: gainR });
}

// ─── Voice Input ────────────────────────────────
function startVoiceInput() {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) {
    setDirective("> VOICE MODULE UNAVAILABLE IN THIS BROWSER. USE TEXT INPUT.");
    return;
  }

  const micBtn = document.getElementById("micBtn");
  const input  = document.getElementById("userInput");
  const rec    = new SR();
  rec.continuous     = false;
  rec.lang           = "en-IN";
  rec.interimResults = true;

  rec.onstart = () => {
    micBtn.classList.add("listening");
    setDirective("> NEURAL LINK ACTIVE. SPEAK NOW...");
  };

  rec.onresult = (e) => {
    const transcript = Array.from(e.results).map(r => r[0].transcript).join("");
    input.value = transcript;
  };

  rec.onend = () => {
    micBtn.classList.remove("listening");
    setDirective("> INPUT CAPTURED. READY TO ANALYZE.", false);
  };

  rec.onerror = () => {
    micBtn.classList.remove("listening");
    setDirective("> VOICE CAPTURE FAILED. SWITCH TO TEXT INPUT.");
  };

  rec.start();
}

// ─── History Modal ───────────────────────────────
async function openHistoryModal() {
  showModal("historyModal");
  document.getElementById("historyChart").innerHTML =
    `<p style="font-family:var(--font-hud);font-size:10px;color:var(--cyan-dim);padding:28px;text-align:center;letter-spacing:2px;">LOADING TIMELINE...</p>`;
  document.getElementById("historyList").innerHTML = "";

  try {
    const res = await fetch(`${API_BASE}/get-history`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ user_id: neuralSignature, limit: 30 }),
    });
    const data = await res.json();
    renderHistoryChart(data.history || []);
    renderHistoryList(data.history || []);
  } catch (err) {
    document.getElementById("historyChart").innerHTML =
      `<p style="color:var(--crimson);padding:28px;text-align:center;font-family:var(--font-hud);font-size:10px;">TIMELINE FETCH FAILED.</p>`;
  }
}

function renderHistoryChart(entries) {
  const chartEl = document.getElementById("historyChart");
  if (!entries.length) {
    chartEl.innerHTML =
      `<p style="color:var(--text-dim);padding:28px;text-align:center;font-family:var(--font-hud);font-size:10px;letter-spacing:2px;">NO DATA YET. START JOURNALING.</p>`;
    return;
  }

  const W = 580, H = 110, PAD = 14;
  const colors = { gold:"#f5c842", blue:"#00bfff", crimson:"#e0183c", grey:"#8899aa" };
  const n      = entries.length;
  const stepX  = n > 1 ? (W - PAD * 2) / (n - 1) : 0;

  const pts = entries.map((e, i) => ({
    x: PAD + i * stepX,
    y: PAD + (1 - ((e.health_impact || 0) + 10) / 20) * (H - PAD * 2),
    c: colors[e.orb_color] || "#8899aa",
  }));

  const polyline = pts.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
  const midY     = PAD + (H - PAD * 2) / 2;
  const dots     = pts.map(p =>
    `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="4"
      fill="${p.c}" stroke="rgba(0,0,0,0.4)" stroke-width="1"/>`
  ).join("");

  chartEl.innerHTML = `
    <svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg"
      style="width:100%;display:block;border-radius:4px;background:rgba(0,0,0,0.28)">
      <line x1="${PAD}" y1="${midY}" x2="${W-PAD}" y2="${midY}"
        stroke="rgba(255,255,255,0.07)" stroke-width="1" stroke-dasharray="5 4"/>
      <polyline points="${polyline}"
        fill="none" stroke="rgba(0,200,255,0.25)" stroke-width="1.5"/>
      ${dots}
      <text x="${PAD}" y="${H-5}"
        fill="rgba(192,216,232,0.25)" font-family="Orbitron,monospace" font-size="7"
        letter-spacing="2">MOOD HISTORY (health impact)</text>
    </svg>`;
}

function renderHistoryList(entries) {
  const listEl   = document.getElementById("historyList");
  if (!entries.length) { listEl.innerHTML = ""; return; }

  const dotClass = { gold:"dot-gold", blue:"dot-blue", crimson:"dot-crimson", grey:"dot-grey" };
  const recent   = [...entries].reverse().slice(0, 20);

  listEl.innerHTML = recent.map(e => {
    const ts = e.timestamp
      ? new Date(e.timestamp).toLocaleString("en-IN", {
          month:"short", day:"numeric", hour:"2-digit", minute:"2-digit"
        })
      : "–";
    const flag = (e.distress_flag && e.distress_flag !== "none")
      ? e.distress_flag.replace(/_/g, " ")
      : (e.recovery_signal && e.recovery_signal !== "none"
          ? "✓ " + e.recovery_signal.replace(/_/g, " ")
          : "–");
    const impact   = e.health_impact;
    const impClass = impact > 0 ? "impact-pos" : impact < 0 ? "impact-neg" : "impact-neu";
    const impText  = (impact !== undefined && impact !== null)
      ? (impact > 0 ? "+" : "") + impact
      : "–";

    return `
      <div class="history-entry">
        <div class="history-color-dot ${dotClass[e.orb_color] || "dot-grey"}"></div>
        <div class="history-entry-info">
          <div class="history-entry-time">${ts}</div>
          <div class="history-entry-flag">${flag}</div>
        </div>
        <span class="history-impact ${impClass}">${impText}</span>
      </div>`;
  }).join("");
}

// ─── Mirror Mode ─────────────────────────────────
async function openMirrorModal() {
  mirrorQuestions = [];
  mirrorAnswers   = [];
  mirrorStep      = 0;

  showModal("mirrorModal");
  document.getElementById("mirrorLoading").classList.remove("hidden");
  document.getElementById("mirrorQuestions").classList.add("hidden");

  try {
    const res = await fetch(`${API_BASE}/mirror-session`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ user_id: neuralSignature }),
    });
    const data = await res.json();
    mirrorQuestions = data.questions || [];

    if (mirrorQuestions.length) {
      document.getElementById("mirrorLoading").classList.add("hidden");
      document.getElementById("mirrorQuestions").classList.remove("hidden");
      showMirrorQuestion(0);
    }
  } catch (err) {
    document.getElementById("mirrorLoading").innerHTML =
      `<p style="color:var(--crimson);font-family:var(--font-hud);font-size:10px;text-align:center;">MIRROR SESSION FAILED.</p>`;
  }
}

function showMirrorQuestion(idx) {
  document.getElementById("mirrorQuestion").textContent = `> ${mirrorQuestions[idx]}`;
  document.getElementById("mirrorInput").value = "";
  document.getElementById("mirrorStep").textContent = idx + 1;
  document.getElementById("mirrorNextBtn").textContent =
    idx < mirrorQuestions.length - 1 ? "NEXT →" : "ANALYZE →";
  document.getElementById("mirrorInput").focus();
}

async function mirrorNext() {
  const answer = document.getElementById("mirrorInput").value.trim();
  if (!answer) return;

  mirrorAnswers.push(
    `Q${mirrorStep + 1}: ${mirrorQuestions[mirrorStep]}\nA: ${answer}`
  );
  mirrorStep++;

  if (mirrorStep < mirrorQuestions.length) {
    showMirrorQuestion(mirrorStep);
  } else {
    closeMirrorModal();
    const combined = mirrorAnswers.join("\n\n");
    document.getElementById("userInput").value = combined;
    await analyzeThoughts();
  }
}

function closeMirrorModal() {
  hideModal("mirrorModal");
}

// ─── Void Session ────────────────────────────────
function openVoidModal() {
  clearVoidSession();
  showModal("voidModal");
  document.getElementById("voidSetup").classList.remove("hidden");
  document.getElementById("voidRunning").classList.add("hidden");
}

function selectDuration(btn) {
  document.querySelectorAll(".duration-btn").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
  voidDuration = parseInt(btn.dataset.minutes);
}

function startVoidSession() {
  document.getElementById("voidSetup").classList.add("hidden");
  document.getElementById("voidRunning").classList.remove("hidden");
  document.getElementById("voidInput").value = "";
  document.getElementById("voidInput").focus();

  voidSecondsLeft = voidDuration * 60;
  updateVoidTimer();

  voidInterval = setInterval(() => {
    voidSecondsLeft--;
    updateVoidTimer();

    const text = document.getElementById("voidInput").value;
    const wc   = text.trim() ? text.trim().split(/\s+/).length : 0;
    document.getElementById("voidWordCount").textContent =
      `${wc} word${wc !== 1 ? "s" : ""}`;

    if (voidSecondsLeft <= 0) {
      clearInterval(voidInterval);
      voidInterval = null;
      endVoidSession();
    }
  }, 1000);
}

function updateVoidTimer() {
  const m = String(Math.floor(voidSecondsLeft / 60)).padStart(2, "0");
  const s = String(voidSecondsLeft % 60).padStart(2, "0");
  document.getElementById("voidTimer").textContent = `${m}:${s}`;
}

async function endVoidSession() {
  const text = document.getElementById("voidInput").value.trim();
  closeVoidModal();
  if (text && text.length >= 3) {
    document.getElementById("userInput").value = text;
    await analyzeThoughts();
  }
}

function closeVoidModal() {
  clearVoidSession();
  hideModal("voidModal");
}

function clearVoidSession() {
  if (voidInterval) { clearInterval(voidInterval); voidInterval = null; }
}

// ─── Share Card ──────────────────────────────────
function generateShareCard() {
  const canvas = document.getElementById("shareCanvas");
  const ctx    = canvas.getContext("2d");
  canvas.width  = 800;
  canvas.height = 440;

  // Background
  const bg = ctx.createLinearGradient(0, 0, 800, 440);
  bg.addColorStop(0, "#06060f");
  bg.addColorStop(1, "#0d0d22");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, 800, 440);

  // Grid
  ctx.strokeStyle = "rgba(0,200,255,0.05)";
  ctx.lineWidth   = 1;
  for (let x = 0; x < 800; x += 40) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 440); ctx.stroke();
  }
  for (let y = 0; y < 440; y += 40) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(800, y); ctx.stroke();
  }

  // Border
  ctx.strokeStyle = "rgba(0,200,255,0.28)";
  ctx.lineWidth   = 1;
  ctx.strokeRect(16, 16, 768, 408);

  // Orb glow blob
  const orbGlows = {
    gold:    ["#f5c842", "rgba(245,200,66,0.45)"],
    blue:    ["#00bfff", "rgba(0,191,255,0.45)"],
    crimson: ["#e0183c", "rgba(224,24,60,0.45)"],
    grey:    ["#8899aa", "rgba(136,153,170,0.3)"],
  };
  const [innerC, outerC] = orbGlows[currentColor] || orbGlows.gold;

  const radial = ctx.createRadialGradient(120, 220, 0, 120, 220, 90);
  radial.addColorStop(0, innerC);
  radial.addColorStop(0.6, outerC);
  radial.addColorStop(1, "transparent");
  ctx.fillStyle = radial;
  ctx.beginPath();
  ctx.arc(120, 220, 90, 0, Math.PI * 2);
  ctx.fill();

  // Logo text
  ctx.fillStyle = "rgba(0,200,255,0.88)";
  ctx.font      = "bold 16px 'Courier New', monospace";
  ctx.fillText("NEURA-MITRAM // EMOTIONAL AURA REPORT", 220, 76);

  // Horizontal rule
  ctx.strokeStyle = "rgba(0,200,255,0.18)";
  ctx.lineWidth   = 1;
  ctx.beginPath(); ctx.moveTo(220, 88); ctx.lineTo(760, 88); ctx.stroke();

  // Snappy reaction
  const snappy = document.getElementById("freeOutputText").textContent
    .replace(/^>\s*/, "").trim();
  ctx.fillStyle = "#ffffff";
  ctx.font      = "15px 'Courier New', monospace";
  const afterSnappy = wrapCanvasText(ctx, snappy, 220, 120, 520, 24);

  // Deep analysis — only include real text if decrypted, otherwise a teaser line
  const diagnosticEl = document.getElementById("deepAnalysisText");
  const isUnlocked    = diagnosticEl.classList.contains("decrypted");
  const analysis = isUnlocked
    ? diagnosticEl.textContent.replace(/^>>?\s*(DIAGNOSTIC:?\s*)?/i, "").trim()
    : "🔒 Deep diagnostic locked — decrypt yours at neuramitram.space";
  ctx.fillStyle = "rgba(192,216,232,0.65)";
  ctx.font      = "12px 'Courier New', monospace";
  wrapCanvasText(ctx, analysis, 220, afterSnappy + 14, 520, 20);

  // Footer
  ctx.fillStyle = "rgba(0,200,255,0.35)";
  ctx.font      = "10px 'Courier New', monospace";
  ctx.fillText("neuramitram.space", 220, 410);
  ctx.fillText(new Date().toLocaleDateString("en-IN"), 640, 410);

  // Download
  const link    = document.createElement("a");
  link.download = `mitram-aura-${Date.now()}.png`;
  link.href     = canvas.toDataURL("image/png");
  link.click();
}

function wrapCanvasText(ctx, text, x, y, maxW, lineH) {
  const words = text.split(" ");
  let line = "";
  let curY = y;
  for (let n = 0; n < words.length; n++) {
    const test = line + words[n] + " ";
    if (ctx.measureText(test).width > maxW && n > 0) {
      ctx.fillText(line.trim(), x, curY);
      line = words[n] + " ";
      curY += lineH;
    } else {
      line = test;
    }
  }
  ctx.fillText(line.trim(), x, curY);
  return curY + lineH;
}

// ─── Crisis Protocol ─────────────────────────────
function triggerCrisisProtocol(urgencyLevel, distressFlag) {
  const overlay = document.getElementById("crisisOverlay");
  const flagStr = distressFlag ? distressFlag.replace(/_/g, " ") : "";

  document.getElementById("crisisText").textContent =
    urgencyLevel === 5
      ? "Critical signal. Your system is in overload. What you're carrying is real — and it's too much to carry alone."
      : `Elevated distress${flagStr ? " (" + flagStr + ")" : ""} detected across multiple sessions. Pause. Ground yourself. You don't need to solve it right now.`;

  overlay.classList.remove("hidden");
  runBreathGuide();
}

function runBreathGuide() {
  const labels  = ["BREATHE IN", "HOLD", "BREATHE OUT", "HOLD"];
  const timings = [4000, 4000, 4000, 4000];
  let phase = 0;

  const step = () => {
    const el = document.getElementById("breathLabel");
    if (el) el.textContent = labels[phase];
    const t = timings[phase];
    phase = (phase + 1) % labels.length;
    breathTimeout = setTimeout(step, t);
  };
  step();
}

function closeCrisisOverlay() {
  document.getElementById("crisisOverlay").classList.add("hidden");
  if (breathTimeout) { clearTimeout(breathTimeout); breathTimeout = null; }
}

// ─── Decay Sequences ─────────────────────────────
function triggerGlitch(severity) {
  const el     = document.getElementById("mainTerminal");
  const cycles = severity === "critical" ? 10 : 4;
  let count    = 0;

  const tick = setInterval(() => {
    el.classList.toggle("glitch-active");
    count++;
    if (count >= cycles * 2) {
      clearInterval(tick);
      el.classList.remove("glitch-active");
      if (severity === "critical") {
        setDirective(
          "> COGNITIVE DECAY DETECTED. NEURAL PATHWAYS DEGRADING. INPUT REQUIRED TO STABILIZE.",
          true
        );
      }
    }
  }, 75);
}

function triggerDeathSequence() {
  const orb = document.getElementById("mitramOrb");
  orb.className = "quantum-core state-grey";

  const el  = document.getElementById("mainTerminal");
  let count = 0;

  const tick = setInterval(() => {
    el.classList.toggle("glitch-active");
    count++;
    if (count >= 32) {
      clearInterval(tick);
      el.classList.remove("glitch-active");
      setDirective(
        "> SYSTEM CRITICAL — 7+ DAYS OF ABSENCE. PERFORM EMERGENCY NEURAL DUMP TO RESTORE FUNCTION.",
        true
      );
      document.getElementById("userInput").placeholder =
        "> EMERGENCY INPUT REQUIRED. SPEAK EVERYTHING.";
    }
  }, 55);
}
