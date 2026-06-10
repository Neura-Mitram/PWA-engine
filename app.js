const BACKEND_API_URL = "https://neuramitram-orb-engine-866055046613.us-central1.run.app/feed-mitram";

let cachedAnalysisPayload = null;

document.getElementById('feedButton').addEventListener('click', async () => {
    const textInput = document.getElementById('userInput').value.trim();
    if (!textInput) return;

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

        // Deep response logging check
        if (!response.ok) {
            const errorPayload = await response.json().catch(() => ({}));
            throw new Error(errorPayload.detail || `Server returned HTTP Status Code ${response.status}`);
        }

        const data = await response.json();
        cachedAnalysisPayload = data;

        // Print the active database synchronization logs straight to the developer window
        console.log("--- NEURA-MITRAM ENGINE RUNTIME RESPONSE ---");
        console.log("AI State Mapping Evaluation:", data);
        console.log("Database Telemetry Status:", data.db_status);
        console.log("--------------------------------------------");

        // Visual Layout Mutations
        updateOrbVisualEngine(data.orb_color, data.distress_flag);
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
        document.getElementById('userInput').value = "";
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
