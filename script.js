'use strict';

const quotes = [
    { latin: "Tu quoque, mi fili !", translation: "Toi aussi, mon fils !", author: "Jules César, 44 av. J.-C.", icon: "account_balance" },
    { latin: "Memento mori.", translation: "Souviens-toi que tu vas mourir.", author: "Tradition Stoïcienne", icon: "hourglass_empty" },
    { latin: "Alea jacta est.", translation: "Le sort en est jeté.", author: "Jules César, 49 av. J.-C.", icon: "swords" },
    { latin: "Carpe diem.", translation: "Cueille le jour.", author: "Horace, 23 av. J.-C.", icon: "local_florist" },
    { latin: "Dura lex, sed lex.", translation: "La loi est dure, mais c'est la loi.", author: "Maxime Juridique", icon: "gavel" },
    { latin: "Mens sana in corpore sano.", translation: "Un esprit sain dans un corps sain.", author: "Juvénal, Ier-IIe siècle", icon: "self_improvement" },
    { latin: "Si vis pacem, para bellum.", translation: "Si tu veux la paix, prépare la guerre.", author: "Végèce, IVe siècle", icon: "shield" },
    { latin: "Errare humanum est, perseverare diabolicum.", translation: "L'erreur est humaine, persévérer est diabolique.", author: "Sénèque (attribué)", icon: "psychology_alt" },
    { latin: "Veni, vidi, vici.", translation: "Je suis venu, j'ai vu, j'ai vaincu.", author: "Jules César, 47 av. J.-C.", icon: "emoji_events" },
    { latin: "Ave !", translation: "Salut ! / Je te salue !", author: "Salutation Romaine", icon: "waving_hand" },
    { latin: "Omnes vulnerant, ultima necat.", translation: "Toutes blessent, la dernière tue.", author: "Inscription de cadran solaire", icon: "watch" },
    { latin: "Audacibus fortuna juvat.", translation: "La fortune sourit aux audacieux.", author: "Virgile, Ier siècle av. J.-C.", icon: "monetization_on" },
    { latin: "Ad astra per ardua.", translation: "Vers les étoiles à travers les difficultés.", author: "Devise latine", icon: "stars" }
];

const categories = ['wisdom', 'life', 'courage', 'life', 'wisdom', 'life', 'wisdom', 'wisdom', 'courage', 'life', 'life', 'courage', 'courage'];
const numerals = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII'];

const list = document.querySelector('#quote-list');
const search = document.querySelector('#quote-search');
const reader = document.querySelector('#reader');
let activeFilter = 'all';
let selectedQuote = 0;
let returnFocus = null;
let closingReader = false;
let readerEntrance = null;
let contentEntrance = null;
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

function normalized(text) {
  return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('fr');
}

function renderQuotes() {
  const term = normalized(search.value.trim());
  list.replaceChildren();
  quotes.forEach((quote, index) => {
    if (activeFilter !== 'all' && categories[index] !== activeFilter) return;
    if (!normalized(`${quote.latin} ${quote.translation} ${quote.author}`).includes(term)) return;
    const item = document.createElement('li');
    item.className = 'quote-item';
    const button = document.createElement('button');
    button.className = 'quote-row';
    button.dataset.index = index;
    button.innerHTML = `
      <span class="quote-number" aria-hidden="true">${numerals[index]}</span>
      <span class="quote-latin">${quote.latin}</span>
      <span class="quote-info"><span class="quote-translation">${quote.translation}</span></span>
      <span class="row-arrow" aria-hidden="true"><svg class="icon"><use href="#icon-diagonal"/></svg></span>`;
    button.addEventListener('click', () => openQuote(index));
    item.append(button);
    list.append(item);
  });
  const count = list.children.length;
  document.querySelector('#empty-state').hidden = count !== 0;
  document.querySelector('#result-count').textContent = `${count} citation${count > 1 ? 's' : ''} à découvrir`;
}

function openQuote(index) {
  if (closingReader) return;
  selectedQuote = (index + quotes.length) % quotes.length;
  const quote = quotes[selectedQuote];
  document.querySelector('#reader-latin').textContent = quote.latin;
  document.querySelector('#reader-translation').textContent = quote.translation;
  document.querySelector('#reader-author').textContent = quote.author;
  document.querySelector('#reader-position').textContent = `${String(selectedQuote + 1).padStart(2, '0')} / 13`;
  document.querySelector('#copy-status').textContent = '';
  if (!reader.open) {
    returnFocus = document.activeElement;
    reader.showModal();
    document.body.classList.add('reader-open');
    if (!reduceMotion.matches && typeof reader.animate === 'function') {
      readerEntrance?.cancel();
      readerEntrance = reader.animate([
        { clipPath: 'inset(100% 0 0 0)' },
        { clipPath: 'inset(0% 0 0 0)' }
      ], { duration: 650, easing: 'cubic-bezier(.16, 1, .3, 1)' });
    }
  }
  reader.scrollTop = 0;
  if (!reduceMotion.matches && typeof reader.animate === 'function') {
    contentEntrance?.cancel();
    contentEntrance = document.querySelector('.reader-content').animate([
      { opacity: 0, transform: 'translateY(24px)' },
      { opacity: 1, transform: 'translateY(0)' }
    ], { duration: 650, easing: 'cubic-bezier(.16, 1, .3, 1)' });
  }
}

async function closeReader() {
  if (closingReader || !reader.open) return;
  closingReader = true;
  readerEntrance?.cancel();
  contentEntrance?.cancel();
  if (!reduceMotion.matches && typeof reader.animate === 'function') {
    const exit = reader.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 220, fill: 'forwards' });
    try { await exit.finished; } catch { /* Motion preferences may change during the transition. */ }
    reader.close();
    exit.cancel();
  } else {
    reader.close();
  }
  closingReader = false;
}

reduceMotion.addEventListener('change', () => {
  if (reduceMotion.matches) {
    readerEntrance?.cancel();
    contentEntrance?.cancel();
    reader.getAnimations().forEach(animation => animation.finish());
  }
});

function randomQuote() {
  const offset = 1 + Math.floor(Math.random() * (quotes.length - 1));
  openQuote(selectedQuote + offset);
}

document.querySelectorAll('[data-random]').forEach(button => button.addEventListener('click', randomQuote));
document.querySelectorAll('[data-quote]').forEach(button => button.addEventListener('click', () => openQuote(Number(button.dataset.quote))));
document.querySelectorAll('.filter').forEach(button => button.addEventListener('click', () => {
  activeFilter = button.dataset.filter;
  document.querySelectorAll('.filter').forEach(filter => {
    const active = filter === button;
    filter.classList.toggle('is-active', active);
    filter.setAttribute('aria-pressed', String(active));
  });
  renderQuotes();
}));
search.addEventListener('input', renderQuotes);
document.querySelector('.reader-close').addEventListener('click', closeReader);
reader.addEventListener('cancel', event => {
  event.preventDefault();
  closeReader();
});
reader.addEventListener('close', () => {
  document.body.classList.remove('reader-open');
  if (returnFocus?.isConnected) returnFocus.focus({ preventScroll: true });
});
document.querySelector('#previous-quote').addEventListener('click', () => openQuote(selectedQuote - 1));
document.querySelector('#next-quote').addEventListener('click', () => openQuote(selectedQuote + 1));
reader.addEventListener('keydown', event => {
  if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
    event.preventDefault();
    openQuote(selectedQuote + (event.key === 'ArrowLeft' ? -1 : 1));
  }
});
document.querySelector('#copy-quote').addEventListener('click', async () => {
  const index = selectedQuote;
  const quote = quotes[index];
  let message;
  try {
    await navigator.clipboard.writeText(`${quote.latin}\n${quote.translation}\n— ${quote.author}`);
    message = 'Citation copiée.';
  } catch {
    message = 'La copie est indisponible. Vous pouvez sélectionner le texte.';
  }
  if (reader.open && selectedQuote === index) document.querySelector('#copy-status').textContent = message;
});

renderQuotes();
// Le site peut aussi être consulté sans serveur PHP.
fetch('compteur.php', { cache: 'no-store' }).then(response => {
  if (response.headers.get('content-type')?.includes('application/json')) return response.json();
}).catch(() => {});
