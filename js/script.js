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

// Click detection variables
let clickTimer = null;
let lastClickTime = 0;
const DOUBLE_CLICK_DELAY = 300;
const RAPID_CLICK_DELAY = 300;
const RAPID_CLICK_THRESHOLD = 3;
let rapidClickCount = 0;

// Long press variables
let longPressTimer = null;
let isLongPressing = false;
const LONG_PRESS_DELAY = 3000; // 3 seconds
let longPressInterval = null;
let longPressSpeed = 100; // Initial speed (ms per symbol change)
const MIN_SPEED = 30; // Maximum speed (minimum ms)
const SPEED_INCREMENT = 10; // Speed increase per cycle

// Number key double-click tracking
let numberKeyTimers = {};
let numberKeyPressCount = {};

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

  const currentTime = new Date().getTime();
  const timeSinceLastClick = currentTime - lastClickTime;
  
  // Clear existing timers
  if (clickTimer) {
    clearTimeout(clickTimer);
    clickTimer = null;
  }

  // Check for double click
  if (timeSinceLastClick < DOUBLE_CLICK_DELAY) {
    // This is a double click
    handleDoubleClick();
    lastClickTime = 0; // Reset to prevent triple click detection
    return;
  }

  // Single click - start timer to check for rapid clicks
  lastClickTime = currentTime;
  rapidClickCount++;
  
  clickTimer = setTimeout(() => {
    if (rapidClickCount >= RAPID_CLICK_THRESHOLD) {
      // RAPID CLICKS
      handleRapidClicks(rapidClickCount);
    } else {
      // SINGLE CLICK
      handleSingleClick();
    }
    
    rapidClickCount = 0;
    clickTimer = null;
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
  updateRecentSymbols(currentSymbol);
  
  // Apply SINGLE CLICK animation
  applySymbolAnimation('single');
}

function handleDoubleClick() {
  currentSymbol = firstGenSymbols[Math.floor(Math.random() * firstGenSymbols.length)];
  updateRecentSymbols(currentSymbol);
  applySymbolAnimation('double');
}

function handleRapidClicks(count) {
  for (let i = 0; i < count; i++) {
    symbolIndex = (symbolIndex + 1) % symbols.length;
  }
  currentSymbol = symbols[symbolIndex];
  updateRecentSymbols(currentSymbol);
  applySymbolAnimation('rapid');
}

function updateRecentSymbols(symbol) {
  if (recentSymbols.length >= 10) {
    recentSymbols.shift();
  }
  recentSymbols.push(symbol);
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
  updateRecentSymbols(currentSymbol);
}

function applySymbolAnimation(animationType) {
  const symbolSpan = document.querySelector('#result .symbol');
  if (!symbolSpan) return;
  
  if (currentAnimation) {
    symbolSpan.classList.remove(currentAnimation);
  }
  
  symbolSpan.textContent = currentSymbol;
  
  // Force reflow to restart animation
  void symbolSpan.offsetWidth;
  
  const animationClass = {
    'single': 'click-animation',
    'scrollDown': 'scroll-down-animation',
    'scrollUp': 'scroll-up-animation',
    'double': 'double-click-animation',
    'rapid': 'rapid-click-animation',
    'longPress': 'long-press-animation'
  }[animationType];
  
  if (animationClass) {
    symbolSpan.classList.add(animationClass);
    currentAnimation = animationClass;
    
    // Only remove non-longPress animations automatically
    if (animationType !== 'longPress') {
      setTimeout(() => {
        symbolSpan.classList.remove(animationClass);
        if (currentAnimation === animationClass) {
          currentAnimation = null;
        }
      }, 500);
    }
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
  
  // Clear all timers
  if (clickTimer) {
    clearTimeout(clickTimer);
    clickTimer = null;
  }
  stopLongPress();
  
  // Clear all number key timers
  Object.keys(numberKeyTimers).forEach(key => {
    clearTimeout(numberKeyTimers[key]);
  });
  numberKeyTimers = {};
  numberKeyPressCount = {};
  
  const resultEl = document.getElementById('result');
  resultEl.classList.remove('visible');
  resultEl.innerHTML = '';
  
  document.getElementById('actionBtn').innerText = '✨';
  
  const inputWrapper = document.querySelector('.input-wrapper');
  inputWrapper.classList.remove('generated');
  
  document.getElementById('nameInput').value = '';
  document.getElementById('charCount').textContent = '0/7';
  
  // Remove focus from input box
  document.getElementById('nameInput').blur();
}

// ==================== LONG PRESS FUNCTIONALITY ====================

function startLongPress() {
  if (!isGenerated || isLongPressing) return;
  
  isLongPressing = true;
  longPressSpeed = 100; // Reset speed
  
  // NO INDICATOR SHOWN - Removed completely
  
  // Start rapid symbol change
  longPressInterval = setInterval(() => {
    symbolIndex = (symbolIndex + 1) % symbols.length;
    currentSymbol = symbols[symbolIndex];
    applySymbolAnimation('longPress');
    updateRecentSymbols(currentSymbol);
    
    // Gradually increase speed
    longPressSpeed = Math.max(MIN_SPEED, longPressSpeed - SPEED_INCREMENT);
    
    // Clear and reset interval with new speed
    clearInterval(longPressInterval);
    longPressInterval = setInterval(() => {
      symbolIndex = (symbolIndex + 1) % symbols.length;
      currentSymbol = symbols[symbolIndex];
      applySymbolAnimation('longPress');
      updateRecentSymbols(currentSymbol);
    }, longPressSpeed);
    
  }, longPressSpeed);
}

function stopLongPress() {
  if (longPressInterval) {
    clearInterval(longPressInterval);
    longPressInterval = null;
  }
  
  if (longPressTimer) {
    clearTimeout(longPressTimer);
    longPressTimer = null;
  }
  
  if (isLongPressing) {
    isLongPressing = false;
    
    // NO INDICATOR TO HIDE - Removed completely
    
    // Remove long press animation
    const symbolSpan = document.querySelector('#result .symbol');
    if (symbolSpan && currentAnimation === 'long-press-animation') {
      symbolSpan.classList.remove('long-press-animation');
      currentAnimation = null;
    }
  }
}

// REMOVED: showLongPressIndicator function
// REMOVED: hideLongPressIndicator function

// ==================== EVENT LISTENERS FOR LONG PRESS ====================

// For mobile: touch events
const actionBtn = document.getElementById('actionBtn');
actionBtn.addEventListener('touchstart', (e) => {
  e.preventDefault();
  if (!isGenerated) return;
  
  longPressTimer = setTimeout(() => {
    startLongPress();
  }, LONG_PRESS_DELAY);
});

actionBtn.addEventListener('touchend', (e) => {
  e.preventDefault();
  if (longPressTimer) {
    clearTimeout(longPressTimer);
    longPressTimer = null;
  }
  stopLongPress();
});

actionBtn.addEventListener('touchcancel', (e) => {
  e.preventDefault();
  if (longPressTimer) {
    clearTimeout(longPressTimer);
    longPressTimer = null;
  }
  stopLongPress();
});

// For desktop: mouse down/up
actionBtn.addEventListener('mousedown', (e) => {
  if (!isGenerated) return;
  
  longPressTimer = setTimeout(() => {
    startLongPress();
  }, LONG_PRESS_DELAY);
});

actionBtn.addEventListener('mouseup', (e) => {
  if (longPressTimer) {
    clearTimeout(longPressTimer);
    longPressTimer = null;
  }
  stopLongPress();
});

actionBtn.addEventListener('mouseleave', (e) => {
  // Stop if mouse leaves button while pressing
  if (longPressTimer) {
    clearTimeout(longPressTimer);
    longPressTimer = null;
  }
  stopLongPress();
});

// ==================== KEYBOARD SHORTCUTS ====================

document.addEventListener('keydown', (e) => {
  const input = document.getElementById('nameInput');
  const isInputFocused = document.activeElement === input;
  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  const ctrlCmdPressed = isMac ? e.metaKey : e.ctrlKey;

  // SPECIAL HANDLING FOR NUMPAD STAR KEY - Always prevent it from typing
  if (e.key === '*' && e.code === 'NumpadMultiply') {
    e.preventDefault(); // Always prevent numpad star from being typed
    
    // Only trigger long press if generated
    if (isGenerated && !isLongPressing) {
      startLongPress();
    }
    return;
  }

  // 1. ENTER → Generate name (only if input box is selected)
  if (e.key === 'Enter' && isInputFocused) {
    e.preventDefault();
    if (!isGenerated) {
      generateName();
    } else {
      // If already generated, treat as single click to cycle
      handleAction({ detail: 1 });
    }
    return;
  }

  // 2. SPACE → For selecting input box
  if (e.key === ' ' && !isInputFocused) {
    e.preventDefault();
    input.focus();
    return;
  }

  // 3. ESC → Reset/Clear everything
  if (e.key === 'Escape') {
    resetGenerator();
    return;
  }

  // 4. Ctrl/Cmd + D → Toggle dark/light theme
  if (ctrlCmdPressed && e.key === 'd') {
    e.preventDefault();
    toggleTheme();
    return;
  }

  // 5. Ctrl + C → Copy output/result
  if (ctrlCmdPressed && e.key === 'c') {
    const resultEl = document.getElementById('result');
    if (isGenerated && resultEl.classList.contains('visible')) {
      e.preventDefault();
      const textToCopy = baseName + currentSymbol;
      navigator.clipboard.writeText(textToCopy).then(() => {
        showCopiedMessage();
      });
    }
    return;
  }

  // 6. Number keys 1-9 (only when generated and NOT typing in input)
  if (isGenerated && !isInputFocused && e.key >= '1' && e.key <= '9') {
    e.preventDefault();
    const num = parseInt(e.key);
    
    if (!numberKeyPressCount[num]) {
      numberKeyPressCount[num] = 0;
    }
    
    if (numberKeyTimers[num]) {
      clearTimeout(numberKeyTimers[num]);
    }
    
    numberKeyPressCount[num]++;
    
    numberKeyTimers[num] = setTimeout(() => {
      const pressCount = numberKeyPressCount[num];
      
      if (pressCount >= 2) {
        for (let i = 0; i < num; i++) {
          symbolIndex = (symbolIndex + 1) % symbols.length;
        }
        currentSymbol = symbols[symbolIndex];
        applySymbolAnimation('rapid');
      } else {
        const targetIndex = num - 1;
        if (targetIndex < symbols.length) {
          symbolIndex = targetIndex;
          currentSymbol = symbols[symbolIndex];
          applySymbolAnimation('single');
        }
      }
      
      updateRecentSymbols(currentSymbol);
      
      numberKeyPressCount[num] = 0;
      delete numberKeyTimers[num];
    }, RAPID_CLICK_DELAY);
    return;
  }

  // 7. Arrow Keys (only when generated)
  if (isGenerated) {
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
      e.preventDefault();
      handleScroll('down');
      return;
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
      e.preventDefault();
      handleScroll('up');
      return;
    }
  }
});

document.addEventListener('keyup', (e) => {
  // Stop long press on numpad * key release
  if (e.key === '*' && e.code === 'NumpadMultiply' && isLongPressing) {
    e.preventDefault();
    stopLongPress();
  }
});

// Prevent default arrow key scrolling when generated
document.addEventListener('keydown', (e) => {
  if (isGenerated && (e.key.startsWith('Arrow'))) {
    e.preventDefault();
  }
}, { passive: false });

// ==================== END KEYBOARD SHORTCUTS ====================

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
