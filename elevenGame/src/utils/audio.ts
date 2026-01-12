// Audio Context Singleton
let audioCtx: AudioContext | null = null;
let dealBuffer: AudioBuffer | null = null;

const initAudio = () => {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        // Load Deal Sound
        fetch('/sounds/deal-card.mp3')
            .then(res => res.arrayBuffer())
            .then(arrayBuffer => audioCtx!.decodeAudioData(arrayBuffer))
            .then(decodedAudio => {
                dealBuffer = decodedAudio;
            })
            .catch(e => console.error("Failed to load deal sound", e));
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    return audioCtx;
};

// Initialize on first interaction/load if possible, or just lazily
// We'll call initAudio in the exports or first play.

const playSound = (type: 'deal' | 'capture' | 'play') => {
    try {
        const ctx = initAudio();
        if (!ctx) return;

        const gainNode = ctx.createGain();
        gainNode.connect(ctx.destination);

        if (type === 'deal') {
            if (dealBuffer) {
                const source = ctx.createBufferSource();
                source.buffer = dealBuffer;
                gainNode.gain.value = 0.6; // Suggested volume
                source.connect(gainNode);
                source.start(0);
            } else {
                // Fallback if not loaded yet
                // Use the white noise fallback momentarily?
                // Or just try to load it now.
            }
        } else if (type === 'capture') {
            // "Magic" shimmer sound (Synth)
            const osc = ctx.createOscillator();
            osc.connect(gainNode);
            const now = ctx.currentTime;
            osc.type = 'sine';
            osc.frequency.setValueAtTime(400, now);
            osc.frequency.linearRampToValueAtTime(800, now + 0.1);
            osc.frequency.linearRampToValueAtTime(1200, now + 0.3);
            
            gainNode.gain.setValueAtTime(0.1, now);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
            
            osc.start();
            osc.stop(now + 0.5);
        } else if (type === 'play') {
             // "Tap" / "Slap" sound (Synth)
            const osc = ctx.createOscillator();
            osc.connect(gainNode);
            const now = ctx.currentTime;
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(200, now); // Lower thud
            gainNode.gain.setValueAtTime(0.3, now);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
            osc.start();
            osc.stop(now + 0.1);
        }
    } catch (e) {
        console.error("Audio error", e);
    }
};

export const audio = {
    playDeal: () => playSound('deal'),
    playCapture: () => playSound('capture'),
    playPlace: () => playSound('play'),
};
