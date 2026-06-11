const BACKEND_API_URL = "https://neuramitram-orb-engine-866055046613.us-central1.run.app/feed-mitram";

// =========================================================================
// NEURAL SIGNATURE (PERSISTENT MEMORY CORE)
// =========================================================================
let neuralSignature = localStorage.getItem("neura_signature");
if (!neuralSignature) {
    // Generate a unique anonymous ID (e.g., SUBJECT_4F9A2B)
    neuralSignature = "SUBJECT_" + Math.random().toString(36).substring(2, 8).toUpperCase();
    localStorage.setItem("neura_signature", neuralSignature);
}
console.log(`> IDENTIFIED: ${neuralSignature}`);

// =========================================================================
// SENSORY ENGINE (AUDIO)
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

        ambientOscillator.type = 'sine'; 
        ambientOscillator.frequency.setValueAtTime(220, audioCtx.currentTime); 
        ambientGainNode.gain.setValueAtTime(0.001, audioCtx.currentTime);

        ambientOscillator.connect(ambientGainNode);
        ambientGainNode.connect(audioCtx.destination);
        
        ambientOscillator.start();
    } catch (e) {
        console.error("Audio block:", e);
    }
}

function shiftAmbientAtmosphere(color) {
    if (!audioCtx) initAmbientAudio();
    if (audioCtx.state === 'suspended') audioCtx.resume();

    const now = audioCtx.currentTime;
    ambientGainNode.gain.linearRampToValueAtTime(0.04, now + 1.0); 

    switch(color.toLowerCase()) {
        case 'crimson': ambientOscillator.frequency.exponentialRampToValueAtTime(110, now + 2.5); break;
        case 'blue': ambientOscillator.frequency.exponentialRampToValueAtTime(432, now + 2.5); break;
        case 'grey': ambientOscillator.frequency.exponentialRampToValueAtTime(165, now + 2.5); break;
        case 'gold': ambientOscillator.frequency.exponentialRampToValueAtTime(528, now + 2.5); break;
        default: ambientOscillator.frequency.exponentialRampToValueAtTime(220, now + 2.5);
    }
}

// =========================================================================
// VOICE CORE (MIC)
// =========================================================================
const micBtn = document.getElementById('micBtn');
const userInput = document.getElementById('userInput');
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

if (SpeechRecognition) {
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
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
            try { recognition.start(); } catch (e) {}
        }
    });

    recognition.onstart = () => {
        isListening = true;
        micBtn.classList.add('listening-active');
        userInput.placeholder = "> LISTENING... INPUT AUDIO DATA.";
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
        userInput.placeholder = "> INPUT RAW DATA OR INITIATE VOICE LINK...";
    };

    recognition.onerror = (err) => {
        isListening = false;
        micBtn.classList.remove('listening-active');
    };
} else {
    micBtn.style.display = 'none';
}

// =========================================================================
// SYSTEM EXECUTION LOGIC (NO ADS)
// =========================================================================
document.getElementById('feedButton').addEventListener('click', async () => {
    const textInput = userInput.value.trim();
    if (!textInput) return;

    initAmbientAudio();
    if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();

    document.getElementById('feedButton').innerText = "PROCESSING_MATRIX...";
    document.getElementById('feedButton').disabled = true;
    document.getElementById('deepAnalysisText').classList.add('hidden'); // hide previous analysis

    try {
        const response = await fetch(BACKEND_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            // Injecting the unique neural signature right here
            body: JSON.stringify({ user_id: neuralSignature, user_input: textInput })
        });

        if (!response.ok) throw new Error(`HTTP_${response.status}`);
        const data = await response.json();

        // Update Orb UI via mapping
        const orbEl = document.getElementById('mitramOrb');
        const labelEl = document.getElementById('orbVibeText');
        
        orbEl.className = "quantum-core";
        orbEl.classList.add(`state-${data.orb_color}`);
        
        let status = data.distress_flag === "none" ? "BALANCED" : data.distress_flag.replace('_', ' ').toUpperCase();
        labelEl.innerText = `STATUS: ${status}`;

        shiftAmbientAtmosphere(data.orb_color);
        
        // Print directly to terminal (No Ads, No Blur)
        document.getElementById('freeOutputText').innerText = `> ${data.snappy_reaction}`;
        document.getElementById('deepAnalysisText').innerText = `>> DIAGNOSTIC: ${data.deep_analysis}`;
        document.getElementById('deepAnalysisText').classList.remove('hidden');

    } catch (err) {
        document.getElementById('freeOutputText').innerText = `> SYSTEM_ERROR: ${err.message}`;
    } finally {
        document.getElementById('feedButton').innerText = "EXECUTE_SYNC";
        document.getElementById('feedButton').disabled = false;
        userInput.value = "";
    }
});

// Modals
const pm = document.getElementById('privacyModal');
const tm = document.getElementById('termsModal');
document.getElementById('openPrivacy').addEventListener('click', () => pm.classList.remove('hidden'));
document.getElementById('openTerms').addEventListener('click', () => tm.classList.remove('hidden'));
document.getElementById('closePrivacy').addEventListener('click', () => pm.classList.add('hidden'));
document.getElementById('closeTerms').addEventListener('click', () => tm.classList.add('hidden'));
