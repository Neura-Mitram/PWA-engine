const BACKEND_API_URL = "https://neuramitram-orb-engine-866055046613.us-central1.run.app/feed-mitram";

let cachedAnalysisPayload = null;

// =========================================================================
// PHASE 1: AUDIO SYNTHESIS ENGINE
// =========================================================================
let audioCtx = null;
let ambientOscillator = null;
let ambientGainNode = null;

function initAmbientAudio() {
    if (audioCtx) return; 
    try {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        audioCtx = new AudioContextClass();
        ambientOscillator = audioCtx.createOscillator();
        ambientGainNode = audioCtx.createGain();

        // Create a smooth, deep sine wave
        ambientOscillator.type = 'sine'; 
        ambientOscillator.frequency.setValueAtTime(220, audioCtx.currentTime); 
        ambientGainNode.gain.setValueAtTime(0.001, audioCtx.currentTime);

        ambientOscillator.connect(ambientGainNode);
        ambientGainNode.connect(audioCtx.destination);
        
        ambientOscillator.start();
        console.log("✓ Native Ambient Synth Engine active.");
    } catch (e) {
        console.error("Web Audio API not supported on this browser:", e);
    }
}

function shiftAmbientAtmosphere(color) {
    if (!audioCtx) initAmbientAudio();
    if (audioCtx.state === 'suspended') audioCtx.resume();

    const now = audioCtx.currentTime;
    ambientGainNode.gain.linearRampToValueAtTime(0.04, now + 1.0); 

    // Smoothly shift the background frequency based on the AI orb color
    switch(color.toLowerCase()) {
        case 'crimson': ambientOscillator.frequency.exponentialRampToValueAtTime(110, now + 2.5); break;
        case 'blue': ambientOscillator.frequency.exponentialRampToValueAtTime(432, now + 2.5); break;
        case 'grey': ambientOscillator.frequency.exponentialRampToValueAtTime(165, now + 2.5); break;
        case 'gold': ambientOscillator.frequency.exponentialRampToValueAtTime(528, now + 2.5); break;
        default: ambientOscillator.frequency.exponentialRampToValueAtTime(220, now + 2.5);
    }
}

// =========================================================================
// PHASE 1: DICTATION (WEB SPEECH API) - LIVE TOGGLE
// =========================================================================
const micBtn = document.getElementById('micBtn');
const userInput = document.getElementById('userInput');
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

if (SpeechRecognition) {
    const recognition = new SpeechRecognition();
    recognition.continuous = true; // Keep listening even if user pauses
    recognition.interimResults = true; // Show words on screen in real-time
    recognition.lang = 'en-US';

    let isListening = false;
    let baseText = ""; 

    micBtn.addEventListener('click', () => {
        initAmbientAudio(); 
        if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();

        if (isListening) {
            recognition.stop();
        } else {
            baseText = userInput.value;
            if (baseText && !baseText.endsWith(' ')) baseText += ' '; 
            
            try {
                recognition.start();
            } catch (e) {
                console.error("Mic already running.");
            }
        }
    });

    recognition.onstart = () => {
        isListening = true;
        micBtn.classList.add('listening-active');
        userInput.placeholder = "Listening... speak your mind.";
    };

    recognition.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
                finalTranscript += event.results[i][0].transcript;
            } else {
                interimTranscript += event.results[i][0].transcript;
            }
        }

        if (finalTranscript) {
            baseText += finalTranscript + " ";
            userInput.value = baseText;
        } else {
            userInput.value = baseText + interimTranscript;
        }
    };

    recognition.onend = () => {
        isListening = false;
        micBtn.classList.remove('listening-active');
        userInput.placeholder = "Type a raw thought or paste a confusing text thread here...";
    };

    recognition.onerror = (err) => {
        console.error("Speech Recognition Error: ", err.error);
        isListening = false;
        micBtn.classList.remove('listening-active');
        
        if (err.error === 'not-allowed') {
            alert("Microphone access blocked. Please tap the lock icon in your browser address bar to allow it.");
        }
    };
} else {
    micBtn.style.display = 'none'; // Hide mic on unsupported legacy browsers
}

// =========================================================================
// CORE APPLICATION LOGIC
// =========================================================================
document.getElementById('feedButton').addEventListener('click', async () => {
    const textInput = userInput.value.trim();
    if (!textInput) return;

    // Wake audio on click if user didn't use the mic first
    initAmbientAudio();
    if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();

    document.getElementById('feedButton').innerText = "Digesting thought...";
    document.getElementById('feedButton').disabled = true;

    try {
        console.log("Sending thought payload to backend cloud architecture...");
        const response = await fetch(BACKEND_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                user_id: "anonymous_web_user", 
                user_input: textInput
            })
        });

        if (!response.ok) {
            const errorPayload = await response.json().catch(() => ({}));
            throw new Error(errorPayload.detail || `Server returned HTTP Status Code ${response.status}`);
        }

        const data = await response.json();
        cachedAnalysisPayload = data;

        console.log("--- NEURA-MITRAM ENGINE RUNTIME RESPONSE ---");
        console.log("AI State Mapping Evaluation:", data);
        console.log("Database Telemetry Status:", data.db_status);
        console.log("--------------------------------------------");

        // Visual & Audio Layout Mutations
        updateOrbVisualEngine(data.orb_color, data.distress_flag);
        shiftAmbientAtmosphere(data.orb_color); // Adjust the background music
        
        document.getElementById('freeOutputText').innerText = data.snappy_reaction;

        // Manage Gated Blocks
        document.getElementById('gatedContainer').classList.remove('hidden');
        document.getElementById('analysisLockOverlay').classList.remove('hidden');
        document.getElementById('deepAnalysisText').classList.add('blurred-content');
        document.getElementById('deepAnalysisText').innerText = data.deep_analysis;
        document.getElementById('adButton').style.display = 'block';

    } catch (err) {
        console.error("⛔ CRITICAL PIPELINE EXCEPTION CAUGHT:", err.message);
        document.getElementById('freeOutputText').innerText = `Error: ${err.message}`;
    } finally {
        document.getElementById('feedButton').innerText = "Feed Mitram";
        document.getElementById('feedButton').disabled = false;
        userInput.value = "";
    }
});

function updateOrbVisualEngine(color, flag) {
    const orbEl = document.getElementById('mitramOrb');
    const labelEl = document.getElementById('orbVibeText');

    orbEl.className = "mitram-orb";
    orbEl.classList.add(`state-${color}`);

    if (flag === "none") labelEl.innerText = "Core Status: Balanced";
    else labelEl.innerText = `Core Status: ${flag.replace('_', ' ').toUpperCase()}`;
}

// =========================================================================
// MONETIZATION & UNLOCK LOGIC (Google AdSense)
// =========================================================================
window.googletag = window.googletag || { cmd: [] };
googletag.cmd.push(() => {
    const adSlot = googletag.defineOutOfPageSlot(
        '/8182434254987808/YOUR_AD_UNIT_ID', 
        googletag.enums.OutOfPageFormat.REWARDED
    );
    
    if (adSlot) {
        adSlot.addService(googletag.pubads());
        
        googletag.pubads().addEventListener('rewardedSlotReady', (event) => {
            const adButton = document.getElementById('adButton');
            adButton.onclick = () => event.makeRewardedVisible();
        });

        googletag.pubads().addEventListener('rewardedSlotGranted', () => {
            document.getElementById('analysisLockOverlay').classList.add('hidden');
            document.getElementById('deepAnalysisText').classList.remove('blurred-content');
        });

        googletag.enableServices();
    }
});

// Fallback unlock button (runs instantly if Ads haven't loaded)
document.getElementById('adButton').addEventListener('click', (e) => {
    if (e.target.onclick === null) {
        document.getElementById('adButton').innerText = "Unlocking Neural Pathways...";
        setTimeout(() => {
            document.getElementById('analysisLockOverlay').classList.add('hidden');
            document.getElementById('deepAnalysisText').classList.remove('blurred-content');
            document.getElementById('adButton').style.display = 'none';
        }, 2000); 
    }
});

// =========================================================================
// LEGAL MODALS LOGIC
// =========================================================================
const privacyModal = document.getElementById('privacyModal');
const termsModal = document.getElementById('termsModal');

document.getElementById('openPrivacy').addEventListener('click', () => privacyModal.classList.remove('hidden'));
document.getElementById('openTerms').addEventListener('click', () => termsModal.classList.remove('hidden'));
document.getElementById('closePrivacy').addEventListener('click', () => privacyModal.classList.add('hidden'));
document.getElementById('closeTerms').addEventListener('click', () => termsModal.classList.add('hidden'));

window.addEventListener('click', (e) => {
    if (e.target === privacyModal) privacyModal.classList.add('hidden');
    if (e.target === termsModal) termsModal.classList.add('hidden');
});
