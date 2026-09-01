const experience = document.querySelector('.experience');
const openButton = document.querySelector('.open-letter');
const closeButton = document.querySelector('.close-letter');
const letterStage = document.querySelector('.letter-stage');
const music = document.querySelector('#background-music');
const audioControl = document.querySelector('.audio-control');
const audioToggle = document.querySelector('.audio-toggle');
const audioIcon = document.querySelector('.audio-icon');
const volume = document.querySelector('#volume');
const secretSeal = document.querySelector('.seal--letter');
const secretMessage = document.querySelector('.secret-message');
const puzzle = document.querySelector('.name-puzzle');
const puzzleAnswer = document.querySelector('.name-puzzle__answer');
const puzzleLetters = document.querySelector('.name-puzzle__letters');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const recipientName = 'SHEYLAMARIE';
let secretTimer;
let animationTimers = [];
let isTransitioning = false;
let puzzleSolved = false;
let availableLetters = [];
let selectedLetters = [];

function getValue(object, path) {
  return path.split('.').reduce((value, key) => value?.[key], object);
}

function renderContent(content) {
  document.querySelectorAll('[data-content]').forEach((element) => {
    const value = getValue(content, element.dataset.content);
    if (typeof value === 'string') element.textContent = value;
  });

  const body = document.querySelector('#letter-body');
  const greeting = document.createElement('p');
  const greetingText = document.createElement('strong');
  greetingText.textContent = content.letter.greeting;
  greeting.append(greetingText);
  body.append(greeting);

  content.letter.paragraphs.forEach((text) => {
    const paragraph = document.createElement('p');
    paragraph.textContent = text;
    body.append(paragraph);
  });

  const promise = document.createElement('p');
  promise.className = 'letter__promise';
  promise.textContent = content.letter.promise;
  body.append(promise);
  prepareWritingEffect();
  resetPuzzle();
}

function shuffleLetters() {
  const letters = [...recipientName].map((letter, id) => ({ letter, id }));
  do {
    for (let index = letters.length - 1; index > 0; index -= 1) {
      const randomIndex = Math.floor(Math.random() * (index + 1));
      [letters[index], letters[randomIndex]] = [letters[randomIndex], letters[index]];
    }
  } while (letters.map(({ letter }) => letter).join('') === recipientName);
  return letters;
}

function createLetterButton(item, selected = false) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = `name-puzzle__letter${selected ? ' is-selected' : ''}`;
  button.textContent = item.letter;
  button.setAttribute('aria-label', selected
    ? `Quitar letra ${item.letter}`
    : `Colocar letra ${item.letter}`);
  button.addEventListener('click', () => selected ? removeLetter(item.id) : selectLetter(item.id));
  return button;
}

function renderPuzzle() {
  puzzleAnswer.replaceChildren();
  selectedLetters.forEach((item, index) => {
    if (index === 6) {
      const separator = document.createElement('span');
      separator.className = 'name-puzzle__space';
      separator.setAttribute('aria-hidden', 'true');
      puzzleAnswer.append(separator);
    }
    puzzleAnswer.append(createLetterButton(item, true));
  });

  const emptySlots = recipientName.length - selectedLetters.length;
  for (let index = 0; index < emptySlots; index += 1) {
    const slot = document.createElement('span');
    slot.className = 'name-puzzle__slot';
    slot.setAttribute('aria-hidden', 'true');
    puzzleAnswer.append(slot);
  }

  puzzleLetters.replaceChildren(...availableLetters.map((item) => createLetterButton(item)));
}

function selectLetter(id) {
  if (puzzleSolved) return;
  const index = availableLetters.findIndex((item) => item.id === id);
  selectedLetters.push(...availableLetters.splice(index, 1));
  renderPuzzle();
  if (selectedLetters.map(({ letter }) => letter).join('') === recipientName) solvePuzzle();
}

function removeLetter(id) {
  if (puzzleSolved) return;
  const index = selectedLetters.findIndex((item) => item.id === id);
  availableLetters.push(...selectedLetters.splice(index, 1));
  renderPuzzle();
}

function solvePuzzle() {
  puzzleSolved = true;
  puzzle.classList.add('is-solved');
  window.setTimeout(() => {
    puzzle.classList.add('is-addressed');
    openButton.disabled = false;
    openButton.focus({ preventScroll: true });
  }, reducedMotion ? 0 : 1250);
}

function resetPuzzle() {
  puzzleSolved = false;
  selectedLetters = [];
  availableLetters = shuffleLetters();
  puzzle.classList.remove('is-solved', 'is-addressed');
  openButton.disabled = true;
  renderPuzzle();
}

function prepareWritingEffect() {
  document.querySelectorAll('.writing-text').forEach((container) => {
    const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
    const textNodes = [];
    while (walker.nextNode()) textNodes.push(walker.currentNode);

    textNodes.forEach((node) => {
      if (!node.textContent.trim()) return;
      const fragment = document.createDocumentFragment();
      [...node.textContent].forEach((character) => {
        const span = document.createElement('span');
        span.className = 'written-character';
        span.textContent = character;
        fragment.append(span);
      });
      node.replaceWith(fragment);
    });
  });
}

function clearWritingTimers() {
  animationTimers.forEach(window.clearTimeout);
  animationTimers = [];
}

function animateWriting(show) {
  clearWritingTimers();
  const characters = [...document.querySelectorAll('.written-character')];
  const ordered = show ? characters : characters.reverse();
  const duration = reducedMotion ? 0 : show ? 6500 : 1400;
  const interval = duration / Math.max(ordered.length, 1);

  ordered.forEach((character, index) => {
    const timer = window.setTimeout(() => character.classList.toggle('is-written', show), index * interval);
    animationTimers.push(timer);
  });
  return duration;
}

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
  if (isTransitioning || !puzzleSolved) return;
  isTransitioning = true;
  openButton.setAttribute('aria-expanded', 'true');
  experience.classList.add('is-opening');
  audioControl.hidden = false;
  requestAnimationFrame(() => audioControl.classList.add('is-visible'));
  playMusic();

  window.setTimeout(() => {
    experience.classList.add('is-open');
    letterStage.setAttribute('aria-hidden', 'false');
    requestAnimationFrame(() => window.setTimeout(() => {
      experience.classList.add('is-revealed');
      animateWriting(true);
      letterStage.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' });
      isTransitioning = false;
    }, reducedMotion ? 0 : 80));
  }, reducedMotion ? 0 : 1150);
}

function closeLetter() {
  if (isTransitioning) return;
  isTransitioning = true;
  secretMessage.classList.remove('is-visible');
  const writingDuration = animateWriting(false);

  window.setTimeout(() => {
    resetPuzzle();
    experience.classList.remove('is-revealed', 'is-open', 'is-opening');
    letterStage.setAttribute('aria-hidden', 'true');
    openButton.setAttribute('aria-expanded', 'false');
    audioControl.classList.remove('is-visible');
    music.pause();
    window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' });
    window.setTimeout(() => {
      audioControl.hidden = true;
      isTransitioning = false;
      puzzleLetters.querySelector('button')?.focus({ preventScroll: true });
    }, reducedMotion ? 0 : 900);
  }, writingDuration);
}

openButton.addEventListener('click', openLetter);
closeButton.addEventListener('click', closeLetter);
audioToggle.addEventListener('click', () => {
  if (music.paused) playMusic();
  else music.pause();
});
volume.addEventListener('input', () => { music.volume = Number(volume.value); });
music.addEventListener('pause', () => updateAudioButton(false));
music.addEventListener('play', () => updateAudioButton(true));

secretSeal.addEventListener('click', () => {
  window.clearTimeout(secretTimer);
  secretMessage.classList.add('is-visible');
  secretTimer = window.setTimeout(() => secretMessage.classList.remove('is-visible'), 3500);
});

fetch('content.json')
  .then((response) => {
    if (!response.ok) throw new Error(`No se pudo cargar content.json (${response.status})`);
    return response.json();
  })
  .then(renderContent)
  .catch((error) => {
    console.error(error);
    openButton.disabled = true;
    openButton.querySelector('span').textContent = 'Carta no disponible';
  });
