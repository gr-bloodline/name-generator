const smallCapsMap = {
  a: 'ᴀ', b: 'ʙ', c: 'ᴄ', d: 'ᴅ', e: 'ᴇ', f: 'ꜰ',
  g: 'ɢ', h: 'ʜ', i: 'ɪ', j: 'ᴊ', k: 'ᴋ', l: 'ʟ',
  m: 'ᴍ', n: 'ɴ', o: 'ᴏ', p: 'ᴘ', q: 'ǫ', r: 'ʀ',
  s: 'ꜱ', t: 'ᴛ', u: 'ᴜ', v: 'ᴠ', w: 'ᴡ', x: 'x',
  y: 'ʏ', z: 'ᴢ',
  0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵',
  6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹'
};

const symbols = [
  '༒','☬','☆','★','❀','™','→','✿','§','۝','❖','⁂','©','‱','☞','☟','☜',
  '♬','♫','♪','ღ','†','‡','‿','╭','╯','╮','╰','₰','ヅ','ノ','ミ','ン','｠','｟',
  '〆','々','〙','〘','』','『','๓','๒','ჯ','ᚸ','ᛃ','៚','♡',
  '¤','¢','¥','£','¶','®','•','°','±','×','÷',
  '←','↑','↓','↔','↕','↨','↻','↺','⇒','⇔','⇑','⇓',
  '♠','♣','♥','♦','♭','♯',
  '☀','☁','☂','☃','☄','☉','☼','☽','☾','☿','♀','♂',
  '⚓','⚖','⚙','⚛','⚡','⚠',
  '⟡','⟠','⟢','⟣','⟤','⟁','⟦','⟧','⟨','⟩','⟪','⟫',
  '◊','◉','○','●','◌','◎','◇','◆','◈','◍','◐','◑','◒','◓','◔','◕','◖','◗',
  '◞','◟','◠','◡','◢','◣','◤','◥','◦',
  '⬱','⬰','⬸','⬹','⬺','⬻',
  '⌖','⌘','⌗','⌙','⌠','⌡','⌫','⌬','⌭','⌮','⌯','⌰'];

let currentSymbol = '';
let baseName = '';
let isGenerated = false;

function toSmallCaps(input) {
  return input.toLowerCase().split('').map(c =>
    c === ' ' ? 'ㅤ' : smallCapsMap[c] || ''
  ).join('');
}

function handleAction() {
  if (!isGenerated) {
    generateName();
  } else {
    changeSymbolWithAnimation();
  }
}

function generateName() {
  const input = document.getElementById('nameInput').value.trim();
  if (input.length === 0 || input.length > 7) {
    alert('Please enter a name with 1–7 characters.');
    return;
  }
  baseName = `ᴳᴿᴮメ${toSmallCaps(input)}`;
  currentSymbol = getRandomSymbol();
  updateResult();
  isGenerated = true;
  document.getElementById('actionBtn').innerText = '♻️';
}

function changeSymbolWithAnimation() {
  const symbolSpan = document.querySelector('#result .symbol');
  if (!symbolSpan) return;
  symbolSpan.classList.add('fade-out');
  const newSymbolSpan = symbolSpan.cloneNode(true);
  symbolSpan.parentNode.replaceChild(newSymbolSpan, symbolSpan);
  newSymbolSpan.addEventListener('animationend', () => {
    newSymbolSpan.classList.remove('fade-out');
    currentSymbol = getRandomSymbol();
    newSymbolSpan.textContent = currentSymbol;
    newSymbolSpan.classList.add('fade-in');
    newSymbolSpan.addEventListener('animationend', () => {
      newSymbolSpan.classList.remove('fade-in');
    }, { once: true });
  }, { once: true });
}

function updateResult() {
  const resultEl = document.getElementById('result');
  resultEl.style.opacity = 1;
  resultEl.innerHTML = '';
  const baseSpan = document.createElement('span');
  baseSpan.className = 'base-name';
  baseSpan.textContent = baseName;
  const symbolSpan = document.createElement('span');
  symbolSpan.className = 'symbol';
  symbolSpan.textContent = currentSymbol;
  resultEl.appendChild(baseSpan);
  resultEl.appendChild(symbolSpan);
}

function getRandomSymbol() {
  return symbols[Math.floor(Math.random() * symbols.length)];
}

function resetGenerator() {
  isGenerated = false;
  currentSymbol = '';
  baseName = '';
  document.getElementById('result').style.opacity = 0;
  document.getElementById('result').innerHTML = '';
  document.getElementById('actionBtn').innerText = '✨';
}

document.getElementById('nameInput').addEventListener('input', () => {
  const input = document.getElementById('nameInput');
  const charCount = document.getElementById('charCount');
  charCount.textContent = `${input.value.length}/7`;
  if (isGenerated) {
    resetGenerator();
  }
});

document.getElementById('result').addEventListener('click', () => {
  if (isGenerated) {
    const textToCopy = baseName + currentSymbol;
    navigator.clipboard.writeText(textToCopy).then(() => {
      showCopiedMessage();
    });
  }
});

function copyInvisible() {
  const invisible = 'ㅤ';
  navigator.clipboard.writeText(invisible).then(() => {
    showCopiedMessage();
  });
}

function showCopiedMessage() {
  const msg = document.getElementById('copiedMessage');
  msg.style.display = 'block';
  setTimeout(() => {
    msg.style.display = 'none';
  }, 1500);
}

function toggleTheme() {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  if (isDark) {
    document.documentElement.removeAttribute('data-theme');
    document.querySelector('.theme-icon').textContent = '🌞';
  } else {
    document.documentElement.setAttribute('data-theme', 'dark');
    document.querySelector('.theme-icon').textContent = '🌙';
  }
}

(function applySystemTheme() {
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  if (prefersDark) {
    document.documentElement.setAttribute('data-theme', 'dark');
    document.querySelector('.theme-icon').textContent = '🌙';
  } else {
    document.documentElement.removeAttribute('data-theme');
    document.querySelector('.theme-icon').textContent = '🌞';
  }
})();

window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
  if (e.matches) {
    document.documentElement.setAttribute('data-theme', 'dark');
    document.querySelector('.theme-icon').textContent = '🌙';
  } else {
    document.documentElement.removeAttribute('data-theme');
    document.querySelector('.theme-icon').textContent = '🌞';
  }
});

const inputField = document.getElementById('nameInput');
const charCount = document.getElementById('charCount');

inputField.addEventListener('beforeinput', (e) => {
  const value = inputField.value;
  if (value.length >= 7 && e.inputType !== 'deleteContentBackward') {
    charCount.classList.add('limit-warning');
    if (navigator.vibrate) navigator.vibrate(100);
    setTimeout(() => {
      charCount.classList.remove('limit-warning');
    }, 300);
  }
});

// Enhanced Popup Functionality
async function showLocalizedPopup() {
  const popupDismissed = localStorage.getItem('popupDismissed');
  const now = new Date().getTime();
  
  if (popupDismissed && now - parseInt(popupDismissed) < 24 * 60 * 60 * 1000) {
    return;
  }

  document.getElementById('welcomePopup').style.display = 'flex';
  document.getElementById('loadingText').textContent = 'Checking your region...';

  let isBangladesh = false;
  try {
    const response = await fetch('https://ipinfo.io/json?token=8035bb17c7c15a');
    const data = await response.json();
    isBangladesh = (data.country === 'BD');
  } catch (error) {
    isBangladesh = Intl.DateTimeFormat().resolvedOptions().timeZone.includes('Dhaka') || 
                   navigator.language.includes('bn');
  }

  showPopupContent(isBangladesh);
}

function showPopupContent(isBangladesh) {
  const messages = {
    title: isBangladesh ? '📢 নাম পরিবর্তন নোটিস 🚨' : '📢 Rename notice 🚨',
    content: isBangladesh ? 
      'টুল ব্যবহার করে নাম সেট করো,<br>তারপর লিডার/অফিসারকে দেখিয়ে<br>কনফার্ম করেই নাম পরিবর্তন চূড়ান্ত করো।' : 
      'Set the name using the tool,<br>then show it to the leader/officer<br>and confirm before finalizing.',
    disableText: isBangladesh ? '২৪ ঘন্টার জন্য দেখাবেন না' : 'Hide for 24 hours'
  };

  document.getElementById('popupMessage').innerHTML = `
    <h3 style="margin-bottom: 1rem; color: #ff4d4d; font-size: 1.4rem; text-shadow: 0 0 10px rgba(255, 0, 0, 0.5), 0 0 20px rgba(255, 77, 77, 0.3);">
      ${messages.title}
    </h3>
    <p style="line-height: 1.6; margin-bottom: 1.5rem; font-size: 1.1rem; color: white; text-shadow: 0 0 8px rgba(0, 0, 0, 0.8);">
      ${messages.content}
    </p>
  `;
  
  document.getElementById('disableText').textContent = messages.disableText;
  document.querySelector('.popup-footer').style.display = 'flex';
}

document.getElementById('closePopup').addEventListener('click', function(e) {
  const popup = document.getElementById('welcomePopup');
  const rect = popup.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;
  
  popup.style.setProperty('--mouse-x', mouseX + 'px');
  popup.style.setProperty('--mouse-y', mouseY + 'px');
  
  popup.style.animation = 'holeVanish 0.5s forwards';
  
  setTimeout(() => {
    popup.style.display = 'none';
    
    if (document.getElementById('dontShowAgain').checked) {
      localStorage.setItem('popupDismissed', new Date().getTime());
    }
  }, 500);
});

document.addEventListener('DOMContentLoaded', showLocalizedPopup);