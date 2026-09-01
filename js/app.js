const experience = document.querySelector('.experience');
const openButton = document.querySelector('.open-letter');
const letterStage = document.querySelector('.letter-stage');
const music = document.querySelector('#background-music');
const audioControl = document.querySelector('.audio-control');
const audioToggle = document.querySelector('.audio-toggle');
const audioIcon = document.querySelector('.audio-icon');
const volume = document.querySelector('#volume');
const secretSeal = document.querySelector('.seal--letter');
const secretMessage = document.querySelector('.secret-message');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let secretTimer;

function updateAudioButton(isPlaying) {
  audioToggle.setAttribute('aria-pressed', String(isPlaying));
  audioToggle.setAttribute('aria-label', isPlaying ? 'Pausar música' : 'Reproducir música');
  audioIcon.textContent = isPlaying ? 'Ⅱ' : '▶';
}

async function playMusic() {
  music.volume = Number(volume.value);
  try {
    await music.play();
    updateAudioButton(true);
  } catch {
    updateAudioButton(false);
  }
}

function openLetter() {
  openButton.setAttribute('aria-expanded', 'true');
  experience.classList.add('is-opening');
  audioControl.hidden = false;
  requestAnimationFrame(() => audioControl.classList.add('is-visible'));
  playMusic();

  const openingDelay = reducedMotion ? 0 : 1150;
  const revealDelay = reducedMotion ? 20 : 80;
  window.setTimeout(() => {
    experience.classList.add('is-open');
    letterStage.setAttribute('aria-hidden', 'false');
    requestAnimationFrame(() => window.setTimeout(() => {
      experience.classList.add('is-revealed');
      letterStage.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' });
    }, revealDelay));
  }, openingDelay);
}

openButton.addEventListener('click', openLetter, { once: true });
audioToggle.addEventListener('click', () => {
  if (music.paused) playMusic();
  else { music.pause(); updateAudioButton(false); }
});
volume.addEventListener('input', () => { music.volume = Number(volume.value); });
music.addEventListener('pause', () => updateAudioButton(false));
music.addEventListener('play', () => updateAudioButton(true));

secretSeal.addEventListener('click', () => {
  window.clearTimeout(secretTimer);
  secretMessage.classList.add('is-visible');
  secretTimer = window.setTimeout(() => secretMessage.classList.remove('is-visible'), 3500);
});
