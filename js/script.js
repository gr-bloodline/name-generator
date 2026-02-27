// Small caps mapping
const smallCapsMap = {
  a: 'ᴀ', b: 'ʙ', c: 'ᴄ', d: 'ᴅ', e: 'ᴇ', f: 'ꜰ',
  g: 'ɢ', h: 'ʜ', i: 'ɪ', j: 'ᴊ', k: 'ᴋ', l: 'ʟ',
  m: 'ᴍ', n: 'ɴ', o: 'ᴏ', p: 'ᴘ', q: 'ǫ', r: 'ʀ',
  s: 'ꜱ', t: 'ᴛ', u: 'ᴜ', v: 'ᴠ', w: 'ᴡ', x: 'x',
  y: 'ʏ', z: 'ᴢ',
  0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵',
  6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹'
};

// Full symbols array
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
  '⌖','⌘','⌗','⌙','⌠','⌡','⌫','⌬','⌭','⌮','⌯','⌰'
];

// Special symbols for FIRST generation and DOUBLE CLICK
const firstGenSymbols = [
  '❖', '〆', '々', '⟡', '⟠', '⌭', '⌮', '⌰', '☃', '☂', 
  '☁', '☼', '⁂', 'ヅ', 'ミ', '¤', '♡', '⚖', '៚', '⌫', '⌘'
];

let currentSymbol = '';
let baseName = '';
let isGenerated = false;
let symbolIndex = 0;
let clickCount = 0;
let recentSymbols = [];

// Rapid click detection variables
let clickTimer = null;
let rapidClickCount = 0;
const RAPID_CLICK_DELAY = 300;
const RAPID_CLICK_THRESHOLD = 3;

// Track current animation to prevent conflicts
let currentAnimation = null;

function toSmallCaps(input) {
  return input.toLowerCase().split('').map(c =>
    c === ' ' ? 'ㅤ' : smallCapsMap[c] || ''
  ).join('');
}

function handleAction(event) {
  if (!isGenerated) {
    generateName();
    return;
  }

  // DOUBLE CLICK
  if (event && event.detail === 2) {
    currentSymbol = firstGenSymbols[Math.floor(Math.random() * firstGenSymbols.length)];
    applySymbolAnimation('double');
    return;
  }

  // For single clicks, handle rapid click detection
  rapidClickCount++;
  
  if (clickTimer) {
    clearTimeout(clickTimer);
  }
  
  clickTimer = setTimeout(() => {
    if (rapidClickCount >= RAPID_CLICK_THRESHOLD) {
      // RAPID CLICKS
      for (let i = 0; i < rapidClickCount; i++) {
        symbolIndex = (symbolIndex + 1) % symbols.length;
      }
      currentSymbol = symbols[symbolIndex];
      applySymbolAnimation('rapid');
    } else {
      // SINGLE CLICK
      handleSingleClick();
    }
    
    rapidClickCount = 0;
  }, RAPID_CLICK_DELAY);
}

function handleSingleClick() {
  clickCount++;
  
  // 🎲 LUCKY CLICK: Every 5th click
  if (clickCount % 5 === 0) {
    currentSymbol = symbols[Math.floor(Math.random() * symbols.length)];
  }
  // Recent random: After 10 clicks, every 10th click
  else if (clickCount > 10 && clickCount % 10 === 1 && recentSymbols.length >= 10) {
    currentSymbol = recentSymbols[Math.floor(Math.random() * recentSymbols.length)];
  } else {
    // Normal sequential
    currentSymbol = symbols[symbolIndex];
    symbolIndex = (symbolIndex + 1) % symbols.length;
  }
  
  // Track recent symbols
  if (recentSymbols.length >= 10) {
    recentSymbols.shift();
  }
  recentSymbols.push(currentSymbol);
  
  // Apply SINGLE CLICK animation
  applySymbolAnimation('single');
}

function generateName() {
  const input = document.getElementById('nameInput').value.trim();
  if (input.length === 0 || input.length > 7) {
    alert('Please enter a name with 1–7 characters.');
    return;
  }
  baseName = `ᴳᴿᴮメ${toSmallCaps(input)}`;
  
  currentSymbol = firstGenSymbols[Math.floor(Math.random() * firstGenSymbols.length)];
  
  updateResult();
  isGenerated = true;
  document.getElementById('actionBtn').innerText = '♻️';
  
  const inputWrapper = document.querySelector('.input-wrapper');
  inputWrapper.classList.add('generated');
  
  symbolIndex = 0;
  clickCount = 0;
  recentSymbols = [];
  recentSymbols.push(currentSymbol);
}

function handleScroll(direction) {
  if (direction === 'down') {
    symbolIndex = (symbolIndex + 1) % symbols.length;
    currentSymbol = symbols[symbolIndex];
    applySymbolAnimation('scrollDown');
  } else if (direction === 'up') {
    symbolIndex = (symbolIndex - 1 + symbols.length) % symbols.length;
    currentSymbol = symbols[symbolIndex];
    applySymbolAnimation('scrollUp');
  }
}

function applySymbolAnimation(animationType) {
  const symbolSpan = document.querySelector('#result .symbol');
  if (!symbolSpan) return;
  
  if (currentAnimation) {
    symbolSpan.classList.remove(currentAnimation);
  }
  
  symbolSpan.textContent = currentSymbol;
  
  void symbolSpan.offsetWidth;
  
  const animationClass = {
    'single': 'click-animation',
    'scrollDown': 'scroll-down-animation',
    'scrollUp': 'scroll-up-animation',
    'double': 'double-click-animation',
    'rapid': 'rapid-click-animation'
  }[animationType];
  
  if (animationClass) {
    symbolSpan.classList.add(animationClass);
    currentAnimation = animationClass;
    
    setTimeout(() => {
      symbolSpan.classList.remove(animationClass);
      if (currentAnimation === animationClass) {
        currentAnimation = null;
      }
    }, 500);
  }
}

function updateResult() {
  const resultEl = document.getElementById('result');
  resultEl.classList.add('visible');
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

function resetGenerator() {
  isGenerated = false;
  currentSymbol = '';
  baseName = '';
  symbolIndex = 0;
  clickCount = 0;
  recentSymbols = [];
  
  if (clickTimer) {
    clearTimeout(clickTimer);
    rapidClickCount = 0;
  }
  
  const resultEl = document.getElementById('result');
  resultEl.classList.remove('visible');
  resultEl.innerHTML = '';
  
  document.getElementById('actionBtn').innerText = '✨';
  
  const inputWrapper = document.querySelector('.input-wrapper');
  inputWrapper.classList.remove('generated');
  
  document.getElementById('nameInput').value = '';
  document.getElementById('charCount').textContent = '0/7';
}

// Event Listeners
document.getElementById('nameInput').addEventListener('input', () => {
  const input = document.getElementById('nameInput');
  const charCount = document.getElementById('charCount');
  charCount.textContent = `${input.value.length}/7`;
  
  if (isGenerated && input.value === '') {
    resetGenerator();
  } else if (isGenerated && input.value.length > 0) {
    isGenerated = false;
    currentSymbol = '';
    baseName = '';
    symbolIndex = 0;
    clickCount = 0;
    recentSymbols = [];
    
    const resultEl = document.getElementById('result');
    resultEl.classList.remove('visible');
    resultEl.innerHTML = '';
    
    document.getElementById('actionBtn').innerText = '✨';
    
    const inputWrapper = document.querySelector('.input-wrapper');
    inputWrapper.classList.remove('generated');
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

// Scroll wheel functionality
const actionBtn = document.getElementById('actionBtn');

actionBtn.addEventListener('wheel', (e) => {
  e.preventDefault();
  
  if (!isGenerated) {
    return;
  }
  
  if (clickTimer) {
    clearTimeout(clickTimer);
    rapidClickCount = 0;
  }
  
  if (e.deltaY < 0) {
    handleScroll('up');
  } else {
    handleScroll('down');
  }
});

// Popup Functionality
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
    <h3 style="margin-bottom: 1rem; color: #ff4d4d; font-size: 1.4rem;">
      ${messages.title}
    </h3>
    <p style="line-height: 1.6; margin-bottom: 1.5rem; font-size: 1.1rem;">
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

// Credit click
const creditName = document.getElementById('creditName');

creditName.addEventListener('click', () => {
  navigator.clipboard.writeText("3281874036").then(() => {
    creditName.classList.add('clicked');
    setTimeout(() => {
      creditName.classList.remove('clicked');
    }, 300);
  });
});
