(function () {
  'use strict';

  const display = document.getElementById('display');
  const expression = document.getElementById('expression');

  let currentInput = '0';
  let previousInput = '';
  let operator = null;
  let shouldResetInput = false;
  let lastResult = null;

  function formatNumber(str) {
    if (str === 'Error') return str;
    const num = parseFloat(str);
    if (isNaN(num)) return '0';
    if (str.includes('.') && str.endsWith('.')) return str;
    if (str.includes('.') && str.endsWith('0') && !shouldResetInput) return str;
    if (Math.abs(num) >= 1e12) return num.toExponential(4);
    return str;
  }

  function updateDisplay() {
    display.textContent = formatNumber(currentInput);
  }

  function getOperatorSymbol(op) {
    const symbols = { '/': '\u00f7', '*': '\u00d7', '-': '\u2212', '+': '+' };
    return symbols[op] || op;
  }

  function updateExpression() {
    if (previousInput && operator) {
      expression.textContent = formatNumber(previousInput) + ' ' + getOperatorSymbol(operator);
    } else {
      expression.textContent = '';
    }
  }

  function calculate(a, op, b) {
    const numA = parseFloat(a);
    const numB = parseFloat(b);
    if (isNaN(numA) || isNaN(numB)) return 'Error';
    let result;
    switch (op) {
      case '+': result = numA + numB; break;
      case '-': result = numA - numB; break;
      case '*': result = numA * numB; break;
      case '/':
        if (numB === 0) return 'Error';
        result = numA / numB;
        break;
      default: return 'Error';
    }
    const rounded = parseFloat(result.toPrecision(12));
    return String(rounded);
  }

  function clearActiveOperator() {
    document.querySelectorAll('.btn.op').forEach(function (b) {
      b.classList.remove('active');
    });
  }

  function setActiveOperator(op) {
    clearActiveOperator();
    if (!op) return;
    document.querySelectorAll('.btn.op').forEach(function (b) {
      if (b.dataset.value === op) b.classList.add('active');
    });
  }

  function inputDigit(digit) {
    if (currentInput === 'Error') currentInput = '0';
    if (shouldResetInput) {
      currentInput = digit;
      shouldResetInput = false;
      clearActiveOperator();
    } else {
      if (currentInput === '0' && digit !== '0') {
        currentInput = digit;
      } else if (currentInput === '0' && digit === '0') {
        // stay at 0
      } else {
        if (currentInput.replace(/[^0-9]/g, '').length >= 15) return;
        currentInput = currentInput + digit;
      }
    }
    updateDisplay();
  }

  function inputDecimal() {
    if (shouldResetInput) {
      currentInput = '0.';
      shouldResetInput = false;
      clearActiveOperator();
    } else if (!currentInput.includes('.')) {
      currentInput = currentInput + '.';
    }
    updateDisplay();
  }

  function handleOperator(nextOp) {
    if (currentInput === 'Error') {
      currentInput = '0';
      previousInput = '';
      operator = null;
    }

    if (previousInput && operator && !shouldResetInput) {
      const result = calculate(previousInput, operator, currentInput);
      currentInput = result;
      previousInput = result;
      updateDisplay();
    } else {
      previousInput = currentInput;
    }

    operator = nextOp;
    shouldResetInput = true;
    lastResult = null;
    setActiveOperator(nextOp);
    updateExpression();
  }

  function handleEquals() {
    if (currentInput === 'Error') return;

    if (operator && previousInput) {
      const result = calculate(previousInput, operator, currentInput);
      expression.textContent = formatNumber(previousInput) + ' ' + getOperatorSymbol(operator) + ' ' + formatNumber(currentInput) + ' =';
      currentInput = result;
      previousInput = '';
      operator = null;
      shouldResetInput = true;
      lastResult = result;
      clearActiveOperator();
      updateDisplay();
    }
  }

  function handleClear() {
    currentInput = '0';
    previousInput = '';
    operator = null;
    shouldResetInput = false;
    lastResult = null;
    clearActiveOperator();
    updateDisplay();
    updateExpression();
  }

  function handleBackspace() {
    if (shouldResetInput || currentInput === 'Error') {
      currentInput = '0';
      shouldResetInput = false;
    } else if (currentInput.length === 1 || (currentInput.length === 2 && currentInput.startsWith('-'))) {
      currentInput = '0';
    } else {
      currentInput = currentInput.slice(0, -1);
    }
    updateDisplay();
  }

  function handlePercent() {
    if (currentInput === 'Error') return;
    const num = parseFloat(currentInput);
    if (isNaN(num)) return;
    currentInput = String(parseFloat((num / 100).toPrecision(12)));
    shouldResetInput = true;
    updateDisplay();
  }

  // Button clicks
  document.querySelector('.buttons').addEventListener('click', function (e) {
    const btn = e.target.closest('.btn');
    if (!btn) return;
    const action = btn.dataset.action;

    switch (action) {
      case 'digit': inputDigit(btn.dataset.value); break;
      case 'decimal': inputDecimal(); break;
      case 'operator': handleOperator(btn.dataset.value); break;
      case 'equals': handleEquals(); break;
      case 'clear': handleClear(); break;
      case 'backspace': handleBackspace(); break;
      case 'percent': handlePercent(); break;
    }
  });

  // Keyboard support
  document.addEventListener('keydown', function (e) {
    if (e.key >= '0' && e.key <= '9') {
      inputDigit(e.key);
    } else if (e.key === '.') {
      inputDecimal();
    } else if (e.key === '+' || e.key === '-') {
      handleOperator(e.key);
    } else if (e.key === '*') {
      handleOperator('*');
    } else if (e.key === '/') {
      e.preventDefault();
      handleOperator('/');
    } else if (e.key === 'Enter' || e.key === '=') {
      handleEquals();
    } else if (e.key === 'Escape' || e.key === 'c' || e.key === 'C') {
      handleClear();
    } else if (e.key === 'Backspace' || e.key === 'Delete') {
      handleBackspace();
    } else if (e.key === '%') {
      handlePercent();
    }
  });

  updateDisplay();
})();
