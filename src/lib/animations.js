/**
 * Burst confetti particles from the center of the screen
 */
export function burstConfetti(count = 50) {
  const colors = ["#5a3ea1", "#e07bb5", "#2d9e4e", "#f0a500"];

  for (let i = 0; i < count; i++) {
    const particle = document.createElement("div");
    particle.className = "confetti";

    const color = colors[Math.floor(Math.random() * colors.length)];
    const angle = Math.random() * Math.PI * 2;
    const velocity = 5 + Math.random() * 10;
    const tx = Math.cos(angle) * velocity * 100;
    const ty = Math.sin(angle) * velocity * 100;

    particle.style.cssText = `
      left: 50%;
      top: 50%;
      background-color: ${color};
      --tx: ${tx}px;
      --ty: ${ty}px;
    `;

    document.body.appendChild(particle);
    setTimeout(() => particle.remove(), 3000);
  }
}

/**
 * Animate a number from 0 to final value (for score display)
 */
export function animateCounter(element, finalValue, duration = 800) {
  const startValue = 0;
  const startTime = Date.now();

  function update() {
    const elapsed = Date.now() - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const current = Math.round(startValue + (finalValue - startValue) * progress);
    element.textContent = current;

    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }

  update();
}
