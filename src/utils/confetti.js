import confetti from 'canvas-confetti';

const PALETTE = ['#D97706', '#F59E0B', '#FB923C', '#65A30D', '#FEF3C7'];

export function fireCelebration() {
  const defaults = {
    colors: PALETTE,
    disableForReducedMotion: true,
    zIndex: 100,
  };

  confetti({
    ...defaults,
    particleCount: 90,
    spread: 75,
    startVelocity: 42,
    origin: { x: 0.5, y: 0.35 },
    scalar: 0.9,
  });

  setTimeout(() => {
    confetti({
      ...defaults,
      particleCount: 50,
      spread: 110,
      startVelocity: 32,
      origin: { x: 0.5, y: 0.3 },
      scalar: 0.75,
      shapes: ['circle'],
    });
  }, 220);
}
