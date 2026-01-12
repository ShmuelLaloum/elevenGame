const playSound = (type: 'deal' | 'capture' | 'play') => {
    
    try {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContext) return;
        
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.connect(gain);
        gain.connect(ctx.destination);

        if (type === 'capture') {
            osc.frequency.setValueAtTime(600, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(1000, ctx.currentTime + 0.1);
            gain.gain.setValueAtTime(0.1, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
            osc.start();
            osc.stop(ctx.currentTime + 0.1);
        } else if (type === 'play') {
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(300, ctx.currentTime);
            gain.gain.setValueAtTime(0.05, ctx.currentTime);
            gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.05);
            osc.start();
            osc.stop(ctx.currentTime + 0.05);
        }
    } catch (e) {
        console.error("Audio error", e);
    }
};

export const audio = {
    playDeal: () => playSound('play'),
    playCapture: () => playSound('capture'),
    playPlace: () => playSound('play'),
};
