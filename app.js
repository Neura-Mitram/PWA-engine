// Connected directly to your live Google Cloud Run Server
const BACKEND_API_URL = "https://neuramitram-orb-engine-866055046613.us-central1.run.app/feed-mitram";

let cachedAnalysisPayload = null;

// Handle Form Submission Events
document.getElementById('feedButton').addEventListener('click', async () => {
    const textInput = document.getElementById('userInput').value.trim();
    if (!textInput) return;

    document.getElementById('feedButton').innerText = "Digesting thought...";
    document.getElementById('feedButton').disabled = true;

    try {
        const response = await fetch(BACKEND_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                user_id: "anonymous_web_user", 
                user_input: textInput
            })
        });

        const data = await response.json();
        cachedAnalysisPayload = data;

        // Visual Updates
        updateOrbVisualEngine(data.orb_color, data.distress_flag);
        document.getElementById('freeOutputText').innerText = data.snappy_reaction;

        // Reset Gated View
        document.getElementById('gatedContainer').classList.remove('hidden');
        document.getElementById('analysisLockOverlay').classList.remove('hidden');
        document.getElementById('deepAnalysisText').classList.add('blurred-content');
        document.getElementById('deepAnalysisText').innerText = data.deep_analysis;

    } catch (err) {
        console.error("API error:", err);
        document.getElementById('freeOutputText').innerText = "Your mind is currently cloudy. Please try feeding me again.";
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

// Rewarded Ads Logic
window.googletag = window.googletag || { cmd: [] };
googletag.cmd.push(() => {
    // IMPORTANT: Replace 'YOUR_AD_UNIT_ID' once you generate the rewarded unit in AdSense
    const adSlot = googletag.defineOutOfPageSlot(
        '/8182434254987808/YOUR_AD_UNIT_ID', 
        googletag.enums.OutOfPageFormat.REWARDED
    );
    
    if (adSlot) {
        adSlot.addService(googletag.pubads());
        
        googletag.pubads().addEventListener('rewardedSlotReady', (event) => {
            const adButton = document.getElementById('adButton');
            adButton.style.display = 'block';
            adButton.onclick = () => event.makeRewardedVisible();
        });

        googletag.pubads().addEventListener('rewardedSlotGranted', () => {
            document.getElementById('analysisLockOverlay').classList.add('hidden');
            document.getElementById('deepAnalysisText').classList.remove('blurred-content');
        });

        googletag.enableServices();
    }
});
