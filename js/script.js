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

// No-symbol mode variables
let noSymbolMode = false;
let maxChars = 7; // Default with symbol

// Rapid click detection variables
let clickTimer = null;
let rapidClickCount = 0;
const RAPID_CLICK_DELAY = 300;
const RAPID_CLICK_THRESHOLD = 3;

// Long press variables (ONLY FOR MOBILE)
let longPressTimer = null;
let longPressActive = false;
let longPressInterval = null;
let longPressSpeed = 200;
const LONG_PRESS_DELAY = 3000;
const MIN_SPEED = 50;
const SPEED_INCREMENT = 15;

// Mobile long press for no-symbol mode (2 seconds)
let noSymbolLongPressTimer = null;
const NO_SYMBOL_LONG_PRESS_DELAY = 2000; // 2 seconds

// Numpad * long press variables
let numpadLongPressActive = false;
let numpadLongPressInterval = null;
let numpadLongPressSpeed = 200;

// Number key double-click tracking
let numberKeyTimers = {};
let numberKeyPressCount = {};

// Track current animation to prevent conflicts
let currentAnimation = null;
let animationTimeout = null;

// Track touch events
let isTouching = false;
let touchMoved = false;

// Triple click detection
let tripleClickTimer = null;
let tripleClickCount = 0;
const TRIPLE_CLICK_DELAY = 300;

// Shift key state
let shiftPressed = false;

// Haptic feedback function - much softer
function triggerHaptic(pattern) {
  // Only trigger on mobile devices that support vibration
  if (navigator.vibrate && /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
    navigator.vibrate(pattern);
  }
}

function toSmallCaps(input) {
  return input.toLowerCase().split('').map(c =>
    c === ' ' ? 'ㅤ' : smallCapsMap[c] || ''
  ).join('');
}

// Switch from no-symbol mode to normal mode
function switchToNormalMode() {
  if (!isGenerated || !noSymbolMode) return;
  
  const input = document.getElementById('nameInput');
  const currentName = input.value.trim();
  
  if (currentName.length === 0 || currentName.length > 7) {
    alert(`Please enter a name with 1–7 characters to switch to normal mode.`);
    return;
  }
  
  // Switch to normal mode
  noSymbolMode = false;
  maxChars = 7;
  
  // Update input
  input.maxLength = maxChars;
  updatePlaceholder();
  updateCharCount();
  updateNoteText();
  
  // Regenerate with symbol
  baseName = `ᴳᴿᴮメ${toSmallCaps(currentName)}`;
  currentSymbol = firstGenSymbols[Math.floor(Math.random() * firstGenSymbols.length)];
  updateResult();
  updateButtonAppearance();
  
  // Reset symbol index
  symbolIndex = 0;
  clickCount = 0;
  recentSymbols = [currentSymbol];
  
  // Haptic feedback
  triggerHaptic([15]);
}

// Toggle between symbol and no-symbol mode (for empty input or manual toggle)
function toggleNoSymbolMode() {
  noSymbolMode = !noSymbolMode;
  maxChars = noSymbolMode ? 8 : 7;
  
  // Softer haptic feedback for mode toggle
  triggerHaptic([15]);
  
  // Update input maxlength
  const input = document.getElementById('nameInput');
  input.maxLength = maxChars;
  
  // Update placeholder based on mode
  updatePlaceholder();
  
  // Update character counter
  updateCharCount();
  
  // Update note text
  updateNoteText();
  
  // Update button appearance
  updateButtonAppearance();
  
  // If generated, update display
  if (isGenerated) {
    if (noSymbolMode) {
      // Show no-symbol version
      updateResultNoSymbol();
    } else {
      // Show normal version
      updateResult();
    }
  }
}

// Update button appearance based on current mode
function updateButtonAppearance() {
  const actionBtn = document.getElementById('actionBtn');
  if (!isGenerated) {
    actionBtn.innerText = '✨';
    actionBtn.classList.remove('mode-switch-btn');
  } else if (noSymbolMode && isGenerated) {
    actionBtn.innerText = '0/7';
    actionBtn.classList.add('mode-switch-btn');
  } else {
    actionBtn.innerText = '♻️';
    actionBtn.classList.remove('mode-switch-btn');
  }
}

// Update placeholder based on current mode
function updatePlaceholder() {
  const input = document.getElementById('nameInput');
  if (noSymbolMode) {
    input.placeholder = "Enter name (max 8 characters)";
  } else {
    input.placeholder = "Enter name (max 7 characters)";
  }
}

// Update note text based on mode
function updateNoteText() {
  const noteEl = document.querySelector('.note');
  if (noSymbolMode) {
    noteEl.textContent = 'Your generated name will have no symbol. Max 8 characters total.';
  } else {
    noteEl.textContent = 'Your generated name will include a random symbol. Max 12 characters total.';
  }
}

// Update character count display
function updateCharCount() {
  const input = document.getElementById('nameInput');
  const charCount = document.getElementById('charCount');
  charCount.textContent = `${input.value.length}/${maxChars}`;
}

// Show temporary message
function showMessage(text, duration = 1500) {
  const msg = document.getElementById('copiedMessage');
  msg.textContent = text;
  msg.style.display = 'block';
  setTimeout(() => {
    msg.style.display = 'none';
  }, duration);
}

function handleAction(event) {
  // Don't handle if long press is active or if this is a touch event that moved
  if (longPressActive || (event.type === 'click' && isTouching && touchMoved)) {
    return;
  }
  
  // Check if in no-symbol mode and generated - switch to normal mode
  if (noSymbolMode && isGenerated) {
    switchToNormalMode();
    return;
  }
  
  // Check for Shift+Click (PC - no symbol mode generation WITHOUT toggling mode)
  if (shiftPressed && !isGenerated) {
    generateWithoutSymbol();
    return;
  }
  
  if (!isGenerated) {
    generateName();
    return;
  }

  // DOUBLE CLICK
  if (event && event.detail === 2) {
    currentSymbol = firstGenSymbols[Math.floor(Math.random() * firstGenSymbols.length)];
    updateSymbolDisplay();
    applySymbolAnimation('double');
    // Softer haptic for double click
    triggerHaptic([10, 15]);
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
      updateSymbolDisplay();
      applySymbolAnimation('rapid');
      // Softer haptic for rapid clicks
      triggerHaptic([6, 6, 6]);
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
  
  updateSymbolDisplay();
  applySymbolAnimation('single');
  // Softer haptic for single click
  triggerHaptic([8]);
}

function generateName() {
  const input = document.getElementById('nameInput').value.trim();
  const currentMax = noSymbolMode ? 8 : 7;
  
  if (input.length === 0 || input.length > currentMax) {
    triggerHaptic([40]); // Softer warning
    alert(`Please enter a name with 1–${currentMax} characters.`);
    return;
  }
  
  baseName = `ᴳᴿᴮメ${toSmallCaps(input)}`;
  
  if (noSymbolMode) {
    // In no-symbol mode, generate without symbol
    currentSymbol = '';
    updateResultNoSymbol();
  } else {
    // In normal mode, generate with symbol
    currentSymbol = firstGenSymbols[Math.floor(Math.random() * firstGenSymbols.length)];
    updateResult();
  }
  
  isGenerated = true;
  updateButtonAppearance();
  
  const inputWrapper = document.querySelector('.input-wrapper');
  inputWrapper.classList.add('generated');
  
  symbolIndex = 0;
  clickCount = 0;
  recentSymbols = [];
  if (currentSymbol) {
    recentSymbols.push(currentSymbol);
  }
  
  // Softer haptic for generation
  triggerHaptic([15]);
}

// Generate without symbol - does NOT change the mode toggle
function generateWithoutSymbol() {
  const input = document.getElementById('nameInput').value.trim();
  const currentMax = 8; // Always 8 for no-symbol generation
  
  if (input.length === 0) {
    // If input is empty, toggle the mode instead
    toggleNoSymbolMode();
    return;
  }
  
  if (input.length > currentMax) {
    triggerHaptic([40]);
    alert(`Please enter a name with 1–8 characters.`);
    return;
  }
  
  // Generate without symbol but don't change the noSymbolMode variable
  baseName = `ᴳᴿᴮメ${toSmallCaps(input)}`;
  currentSymbol = '';
  noSymbolMode = true;
  maxChars = 8;
  const inputElement = document.getElementById('nameInput');
  inputElement.maxLength = maxChars;
  updatePlaceholder();
  updateNoteText();
  updateCharCount();
  
  updateResultNoSymbol();
  isGenerated = true;
  updateButtonAppearance();
  
  const inputWrapper = document.querySelector('.input-wrapper');
  inputWrapper.classList.add('generated');
  
  symbolIndex = 0;
  clickCount = 0;
  recentSymbols = [];
  
  // Softer haptic for no-symbol generation
  triggerHaptic([25, 12]);
}

// Remove symbol from current name (triple click)
function removeSymbolFromCurrent() {
  if (!isGenerated) return;
  
  // Temporarily remove symbol without changing mode
  if (currentSymbol) {
    currentSymbol = '';
    updateResult();
  }
}

function handleScroll(direction) {
  if (direction === 'down' || direction === 'right') {
    symbolIndex = (symbolIndex + 1) % symbols.length;
    currentSymbol = symbols[symbolIndex];
    updateSymbolDisplay();
    applySymbolAnimation('scrollDown');
  } else if (direction === 'up' || direction === 'left') {
    symbolIndex = (symbolIndex - 1 + symbols.length) % symbols.length;
    currentSymbol = symbols[symbolIndex];
    updateSymbolDisplay();
    applySymbolAnimation('scrollUp');
  }
}

function updateSymbolDisplay() {
  const symbolSpan = document.querySelector('#result .symbol');
  if (symbolSpan) {
    symbolSpan.textContent = currentSymbol;
  }
}

function applySymbolAnimation(animationType) {
  const symbolSpan = document.querySelector('#result .symbol');
  if (!symbolSpan || !currentSymbol) return;
  
  if (animationTimeout) {
    clearTimeout(animationTimeout);
  }
  
  if (currentAnimation) {
    symbolSpan.classList.remove(currentAnimation);
  }
  
  void symbolSpan.offsetWidth;
  
  const animationClass = {
    'single': 'click-animation',
    'scrollDown': 'scroll-down-animation',
    'scrollUp': 'scroll-up-animation',
    'double': 'double-click-animation',
    'rapid': 'rapid-click-animation',
    'longpress': 'rapid-click-animation'
  }[animationType];
  
  if (animationClass) {
    symbolSpan.classList.add(animationClass);
    currentAnimation = animationClass;
    
    animationTimeout = setTimeout(() => {
      symbolSpan.classList.remove(animationClass);
      if (currentAnimation === animationClass) {
        currentAnimation = null;
      }
      animationTimeout = null;
    }, 400);
  }
}

function updateResult() {
  const resultEl = document.getElementById('result');
  resultEl.classList.add('visible');
  resultEl.innerHTML = '';
  
  const baseSpan = document.createElement('span');
  baseSpan.className = 'base-name';
  baseSpan.textContent = baseName;
  resultEl.appendChild(baseSpan);
  
  // Only add symbol span if there's a symbol
  if (currentSymbol) {
    const symbolSpan = document.createElement('span');
    symbolSpan.className = 'symbol';
    symbolSpan.textContent = currentSymbol;
    resultEl.appendChild(symbolSpan);
  }
  
  // Store copy text for easy access
  resultEl.setAttribute('data-copy-text', baseName + (currentSymbol || ''));
}

function updateResultNoSymbol() {
  const resultEl = document.getElementById('result');
  resultEl.classList.add('visible');
  resultEl.innerHTML = '';
  
  const baseSpan = document.createElement('span');
  baseSpan.className = 'base-name';
  baseSpan.textContent = baseName;
  resultEl.appendChild(baseSpan);
  
  // Store copy text
  resultEl.setAttribute('data-copy-text', baseName);
}

function resetGenerator() {
  stopLongPress();
  stopNumpadLongPress();
  stopNoSymbolLongPress();
  
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
  
  if (animationTimeout) {
    clearTimeout(animationTimeout);
    animationTimeout = null;
  }
  
  Object.keys(numberKeyTimers).forEach(key => {
    clearTimeout(numberKeyTimers[key]);
  });
  numberKeyTimers = {};
  numberKeyPressCount = {};
  
  const resultEl = document.getElementById('result');
  resultEl.classList.remove('visible');
  resultEl.innerHTML = '';
  
  updateButtonAppearance();
  
  const inputWrapper = document.querySelector('.input-wrapper');
  inputWrapper.classList.remove('generated');
  
  document.getElementById('nameInput').value = '';
  updateCharCount();
  
  document.getElementById('nameInput').blur();
  
  isTouching = false;
  touchMoved = false;
  
  // Restore normal note text
  updateNoteText();
}

// ==================== MOBILE LONG PRESS FEATURES ====================

// Original long press for rapid scrolling (3 seconds)
function startLongPress() {
  if (!isGenerated || longPressActive) return;
  
  // Softer haptic for long press start
  triggerHaptic([30]);
  
  longPressTimer = setTimeout(() => {
    longPressActive = true;
    longPressSpeed = 200;
    
    const advanceSymbol = () => {
      symbolIndex = (symbolIndex + 1) % symbols.length;
      currentSymbol = symbols[symbolIndex];
      updateSymbolDisplay();
      applySymbolAnimation('longpress');
    };
    
    longPressInterval = setInterval(() => {
      advanceSymbol();
      longPressSpeed = Math.max(MIN_SPEED, longPressSpeed - SPEED_INCREMENT);
      clearInterval(longPressInterval);
      longPressInterval = setInterval(advanceSymbol, longPressSpeed);
    }, longPressSpeed);
    
    document.getElementById('actionBtn').style.opacity = '0.7';
    
  }, LONG_PRESS_DELAY);
}

// Long press for no-symbol mode generation (2 seconds)
function startNoSymbolLongPress(e) {
  if (isGenerated || noSymbolLongPressTimer) return;
  
  noSymbolLongPressTimer = setTimeout(() => {
    generateWithoutSymbol();
    noSymbolLongPressTimer = null;
  }, NO_SYMBOL_LONG_PRESS_DELAY);
}

function stopNoSymbolLongPress() {
  if (noSymbolLongPressTimer) {
    clearTimeout(noSymbolLongPressTimer);
    noSymbolLongPressTimer = null;
  }
}

function stopLongPress() {
  if (longPressTimer) {
    clearTimeout(longPressTimer);
    longPressTimer = null;
  }
  
  if (longPressInterval) {
    clearInterval(longPressInterval);
    longPressInterval = null;
  }
  
  if (longPressActive) {
    longPressActive = false;
    document.getElementById('actionBtn').style.opacity = '1';
    // Softer haptic for long press stop
    triggerHaptic([12]);
  }
}

// ==================== DESKTOP NUMPAD * LONG PRESS ====================

function startNumpadLongPress() {
  if (!isGenerated || numpadLongPressActive) return;
  
  numpadLongPressActive = true;
  numpadLongPressSpeed = 200;
  
  const advanceSymbol = () => {
    symbolIndex = (symbolIndex + 1) % symbols.length;
    currentSymbol = symbols[symbolIndex];
    updateSymbolDisplay();
    applySymbolAnimation('longpress');
  };
  
  numpadLongPressInterval = setInterval(() => {
    advanceSymbol();
    numpadLongPressSpeed = Math.max(MIN_SPEED, numpadLongPressSpeed - SPEED_INCREMENT);
    clearInterval(numpadLongPressInterval);
    numpadLongPressInterval = setInterval(advanceSymbol, numpadLongPressSpeed);
  }, numpadLongPressSpeed);
}

function stopNumpadLongPress() {
  if (numpadLongPressInterval) {
    clearInterval(numpadLongPressInterval);
    numpadLongPressInterval = null;
  }
  numpadLongPressActive = false;
}

// ==================== KEYBOARD SHORTCUTS ====================

document.addEventListener('keydown', (e) => {
  const input = document.getElementById('nameInput');
  const isInputFocused = document.activeElement === input;
  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  const ctrlCmdPressed = isMac ? e.metaKey : e.ctrlKey;

  // Track Shift key
  if (e.key === 'Shift') {
    shiftPressed = true;
  }

  // Alt+Enter → Toggle mode (PC) - Works before and after generation
  if (e.altKey && e.key === 'Enter') {
    e.preventDefault();
    toggleNoSymbolMode();
    return;
  }

  // 1. ENTER → Generate name (works like mouse click)
  if (e.key === 'Enter' && isInputFocused) {
    e.preventDefault();
    if (!isGenerated) {
      // Check if Shift is pressed with Enter (like Shift+Click)
      if (shiftPressed) {
        generateWithoutSymbol();
      } else {
        generateName();
      }
    } else {
      handleAction({ detail: 1 });
    }
    return;
  }

  // 2. SPACE → Focus input
  if (e.key === ' ' && !isInputFocused) {
    e.preventDefault();
    input.focus();
    return;
  }

  // 3. ESC → Reset
  if (e.key === 'Escape') {
    resetGenerator();
    return;
  }

  // 4. Ctrl/Cmd + D → Toggle theme
  if (ctrlCmdPressed && e.key === 'd') {
    e.preventDefault();
    toggleTheme();
    return;
  }

  // 5. Ctrl + C → Copy
  if (ctrlCmdPressed && e.key === 'c') {
    const resultEl = document.getElementById('result');
    if (isGenerated && resultEl.classList.contains('visible')) {
      e.preventDefault();
      let textToCopy = '';
      if (noSymbolMode) {
        textToCopy = baseName;
      } else {
        textToCopy = baseName + (currentSymbol || '');
      }
      if (textToCopy) {
        navigator.clipboard.writeText(textToCopy).then(() => {
          showCopiedMessage();
        });
      }
    }
    return;
  }

  // 6. Number keys 1-9
  if (isGenerated && !noSymbolMode && e.key >= '1' && e.key <= '9') {
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
        updateSymbolDisplay();
        applySymbolAnimation('rapid');
      } else {
        const targetIndex = num - 1;
        if (targetIndex < symbols.length) {
          symbolIndex = targetIndex;
          currentSymbol = symbols[symbolIndex];
          updateSymbolDisplay();
          applySymbolAnimation('single');
        }
      }
      
      if (recentSymbols.length >= 10) {
        recentSymbols.shift();
      }
      recentSymbols.push(currentSymbol);
      
      numberKeyPressCount[num] = 0;
      delete numberKeyTimers[num];
    }, RAPID_CLICK_DELAY);
    return;
  }

  // 7. Arrow Keys
  if (isGenerated && !noSymbolMode) {
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
  
  // 8. Numpad * ONLY
  if (e.code === 'NumpadMultiply') {
    e.preventDefault();
    if (isGenerated && !numpadLongPressActive) {
      startNumpadLongPress();
    }
    return;
  }
});

document.addEventListener('keyup', (e) => {
  if (e.key === 'Shift') {
    shiftPressed = false;
  }
  
  if (e.code === 'NumpadMultiply') {
    e.preventDefault();
    stopNumpadLongPress();
  }
});

// ==================== END KEYBOARD SHORTCUTS ====================

// Event Listeners
document.getElementById('nameInput').addEventListener('input', (e) => {
  const input = e.target;
  updateCharCount();
  
  // Auto-adjust max based on mode
  if (input.value.length > maxChars) {
    input.value = input.value.slice(0, maxChars);
    updateCharCount();
  }
  
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
    
    updateButtonAppearance();
    
    const inputWrapper = document.querySelector('.input-wrapper');
    inputWrapper.classList.remove('generated');
    
    // Restore normal note text
    updateNoteText();
  }
});

// Handle copy for all modes based on click
document.getElementById('result').addEventListener('click', (e) => {
  if (!isGenerated) return;
  
  const resultEl = document.getElementById('result');
  let textToCopy = '';
  
  if (noSymbolMode) {
    textToCopy = baseName;
  } else {
    textToCopy = baseName + (currentSymbol || '');
  }
  
  if (textToCopy) {
    navigator.clipboard.writeText(textToCopy).then(() => {
      showCopiedMessage();
      // Softer haptic for copy
      triggerHaptic([10]);
    });
  }
  
  // Handle triple click separately
  tripleClickCount++;
  if (tripleClickTimer) clearTimeout(tripleClickTimer);
  tripleClickTimer = setTimeout(() => {
    if (tripleClickCount >= 3) {
      removeSymbolFromCurrent();
    }
    tripleClickCount = 0;
  }, TRIPLE_CLICK_DELAY);
});

// Tap on character counter to toggle mode
document.getElementById('charCount').addEventListener('click', (e) => {
  e.stopPropagation();
  toggleNoSymbolMode();
});

// Also add touch event for mobile
document.getElementById('charCount').addEventListener('touchstart', (e) => {
  e.stopPropagation();
  toggleNoSymbolMode();
}, { passive: true });

// Button event listeners
const actionBtn = document.getElementById('actionBtn');
actionBtn.removeAttribute('onclick');
actionBtn.addEventListener('click', handleAction);
actionBtn.addEventListener('dblclick', (e) => {
  e.preventDefault();
  stopLongPress();
  handleAction(e);
});

// MOBILE TOUCH HANDLING - Prevent context menu only
actionBtn.addEventListener('contextmenu', (e) => {
  e.preventDefault(); // Prevent browser context menu on long press
});

actionBtn.addEventListener('touchstart', (e) => {
  isTouching = true;
  touchMoved = false;
  
  // Differentiate between long press for scroll (3s) and no-symbol mode (2s)
  if (!isGenerated) {
    // Not generated yet - long press for no-symbol mode generation
    startNoSymbolLongPress(e);
  } else {
    // Already generated - long press for rapid scrolling
    startLongPress();
  }
}, { passive: true });

actionBtn.addEventListener('touchmove', (e) => {
  touchMoved = true;
  stopLongPress();
  stopNoSymbolLongPress();
});

actionBtn.addEventListener('touchend', (e) => {
  if (!touchMoved && !longPressActive && !noSymbolLongPressTimer) {
    // Simple tap - handle normal click
    handleAction({ type: 'click', detail: 1 });
  }
  stopLongPress();
  stopNoSymbolLongPress();
  isTouching = false;
  touchMoved = false;
});

actionBtn.addEventListener('touchcancel', (e) => {
  stopLongPress();
  stopNoSymbolLongPress();
  isTouching = false;
  touchMoved = false;
});

// Mobile: Triple tap on input to toggle mode (no message)
const nameInput = document.getElementById('nameInput');
let inputTapCount = 0;
let inputTapTimer = null;

nameInput.addEventListener('touchstart', (e) => {
  inputTapCount++;
  
  if (inputTapTimer) {
    clearTimeout(inputTapTimer);
  }
  
  inputTapTimer = setTimeout(() => {
    if (inputTapCount >= 3) {
      // Triple tap detected - toggle silently
      e.preventDefault();
      toggleNoSymbolMode();
    }
    inputTapCount = 0;
  }, TRIPLE_CLICK_DELAY);
});

// Mobile: Hold spacebar on keyboard to toggle mode (no message)
let spaceHoldTimer = null;
let spaceHoldActive = false;

document.addEventListener('keydown', (e) => {
  if (e.key === ' ' && e.target === nameInput) {
    // Spacebar held in input
    if (!spaceHoldActive) {
      spaceHoldActive = true;
      spaceHoldTimer = setTimeout(() => {
        toggleNoSymbolMode();
        spaceHoldActive = false;
      }, 500); // Half second hold
    }
  }
});

document.addEventListener('keyup', (e) => {
  if (e.key === ' ') {
    if (spaceHoldTimer) {
      clearTimeout(spaceHoldTimer);
      spaceHoldTimer = null;
    }
    spaceHoldActive = false;
  }
});

function copyInvisible() {
  const invisible = 'ㅤ';
  navigator.clipboard.writeText(invisible).then(() => {
    showCopiedMessage();
    triggerHaptic([10]);
  });
}

function showCopiedMessage() {
  const msg = document.getElementById('copiedMessage');
  msg.textContent = 'Copied!';
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
const charCountEl = document.getElementById('charCount');

inputField.addEventListener('beforeinput', (e) => {
  const value = inputField.value;
  const currentMax = noSymbolMode ? 8 : 7;
  
  if (value.length >= currentMax && e.inputType !== 'deleteContentBackward') {
    charCountEl.classList.add('limit-warning');
    // Softer haptic for limit warning
    triggerHaptic([40]);
    setTimeout(() => {
      charCountEl.classList.remove('limit-warning');
    }, 300);
  }
});

// Scroll wheel functionality (desktop only)
actionBtn.addEventListener('wheel', (e) => {
  e.preventDefault();
  
  if (!isGenerated) {
    return;
  }
  
  if (clickTimer) {
    clearTimeout(clickTimer);
    rapidClickCount = 0;
  }
  
  stopLongPress();
  stopNumpadLongPress();
  
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

// Initialize placeholder and note text on page load
document.addEventListener('DOMContentLoaded', () => {
  updatePlaceholder();
  updateNoteText();
});
