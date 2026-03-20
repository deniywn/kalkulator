/* ============================================================
   OPERATION REGISTRY
   Tambah fitur baru? Cukup register di sini.
   Tidak perlu ubah Calculator, Display, atau EventHandler.
   ============================================================ */
class OperationRegistry {
  constructor() { this.ops = new Map(); }
  register(name, fn) { this.ops.set(name, fn); }
  execute(name, a, b) {
    const fn = this.ops.get(name);
    if (!fn) throw new Error('Operation not found: ' + name);
    return fn(a, b);
  }
  has(name) { return this.ops.has(name); }
}

/* ============================================================
   DISPLAY
   ============================================================ */
class Display {
  constructor() {
    this.mainEl = document.getElementById('display-main');
    this.subEl  = document.getElementById('display-sub');
    this.wrapEl = document.getElementById('display-wrap');
  }
  render(val) {
    const str = String(val);
    this.mainEl.textContent = str;
    if      (str.length > 12) this.mainEl.style.fontSize = '1.5rem';
    else if (str.length >  9) this.mainEl.style.fontSize = '2rem';
    else if (str.length >  6) this.mainEl.style.fontSize = '2.6rem';
    else                       this.mainEl.style.fontSize = '';
    this.wrapEl.classList.remove('state-error');
  }
  showExpression(expr) { this.subEl.textContent = expr; }
  clearExpression()    { this.subEl.textContent = ''; }
  showError(expr) {
    this.mainEl.textContent = 'Error';
    this.mainEl.style.fontSize = '';
    this.subEl.textContent  = expr;
    this.wrapEl.classList.add('state-error');
  }
  flashResult() {
    this.mainEl.classList.remove('flash');
    void this.mainEl.offsetWidth;
    this.mainEl.classList.add('flash');
  }
}

/* ============================================================
   CALCULATOR  — state machine + koordinator
   ============================================================ */
const STATES = { IDLE:'IDLE', INPUT_A:'INPUT_A', OPERATOR_SET:'OPERATOR_SET', INPUT_B:'INPUT_B', RESULT:'RESULT', ERROR:'ERROR' };

class Calculator {
  constructor(registry, display) {
    this.registry = registry; this.display = display;
    this.operand1 = null; this.operand2 = null; this.operator = null;
    this.inputStr = '0'; this.lastOperand = null; this.lastOp = null;
    this.state = STATES.IDLE;
  }

  appendDigit(digit) {
    if (this.state === STATES.ERROR) return;
    if (this.state === STATES.RESULT) {
      this.inputStr = digit === '.' ? '0.' : digit;
      this.operand1 = null; this.operator = null;
      this.state = STATES.INPUT_A;
      this.display.clearExpression();
      this.display.render(this.inputStr); return;
    }
    if (this.state === STATES.OPERATOR_SET) {
      this.inputStr = digit === '.' ? '0.' : digit;
      this.state = STATES.INPUT_B;
      this.display.render(this.inputStr); return;
    }
    if (digit === '.' && this.inputStr.includes('.')) return;
    if (digit !== '.' && this.inputStr === '0') this.inputStr = digit;
    else this.inputStr += digit;
    if (this.state === STATES.IDLE) this.state = STATES.INPUT_A;
    this.display.render(this.inputStr);
  }

  setOperator(op) {
    if (this.state === STATES.ERROR) return;
    if (this.state === STATES.INPUT_B) {
      this._calculate(false);
      if (this.state === STATES.ERROR) return;
    }
    if ([STATES.IDLE, STATES.INPUT_A, STATES.RESULT].includes(this.state)) {
      this.operand1 = parseFloat(this.inputStr);
    }
    this.operator = op; this.state = STATES.OPERATOR_SET;
    this.display.showExpression(this._fmt(this.operand1) + ' ' + this._sym(op));
    this.display.render(this._fmt(this.operand1));
  }

  calculate() {
    if (this.state === STATES.ERROR) return;
    if (this.state === STATES.RESULT && this.lastOp && this.lastOperand !== null) {
      this.operand1 = parseFloat(this.inputStr);
      this.operator = this.lastOp; this.operand2 = this.lastOperand;
      this._exec(true); return;
    }
    if (this.state !== STATES.INPUT_B) return;
    this._calculate(true);
  }

  _calculate(show) {
    this.operand2 = parseFloat(this.inputStr);
    this.lastOperand = this.operand2; this.lastOp = this.operator;
    this._exec(show);
  }

  _exec(show) {
    const expr = this._fmt(this.operand1)+' '+this._sym(this.operator)+' '+this._fmt(this.operand2)+' =';
    try {
      let r = this.registry.execute(this.operator, this.operand1, this.operand2);
      r = parseFloat(r.toPrecision(12));
      this.inputStr = this._fmt(r);
      if (show) {
        this.display.showExpression(expr);
        this.display.render(this.inputStr);
        this.display.flashResult();
        this.state = STATES.RESULT;
      } else {
        this.operand1 = r; this.state = STATES.OPERATOR_SET;
      }
    } catch(e) {
      this.display.showError(expr); this.state = STATES.ERROR;
    }
  }

  clear() {
    this.operand1=null;this.operand2=null;this.operator=null;
    this.inputStr='0';this.lastOperand=null;this.lastOp=null;
    this.state=STATES.IDLE;
    this.display.render('0');this.display.clearExpression();
  }

  clearEntry() {
    if (this.state===STATES.ERROR||this.state===STATES.RESULT){this.clear();return;}
    if (this.state===STATES.IDLE||this.state===STATES.OPERATOR_SET) return;
    this.inputStr = (this.inputStr.length<=1||(this.inputStr.length===2&&this.inputStr[0]==='-'))
      ? '0' : this.inputStr.slice(0,-1);
    this.display.render(this.inputStr);
  }

  _fmt(n) {
    if (n===null||n===undefined) return '0';
    if (Math.abs(n)>=1e15||(n!==0&&Math.abs(n)<1e-10)) return n.toExponential(4);
    const s = String(n);
    return s;
  }

  _sym(op) { return {'+':'+','-':'−','*':'×','/':'÷'}[op]||op; }
}

/* ============================================================
   EVENT HANDLER
   ============================================================ */
class EventHandler {
  constructor(calc) { this.calc = calc; this._activeOp = null; }

  bindButtons() {
    document.querySelectorAll('[data-action]').forEach(btn => {
      btn.addEventListener('click', e => {
        this._handle(e.currentTarget);
        this._ripple(e);
      });
    });
  }

  bindKeyboard() {
    document.addEventListener('keydown', e => {
      const k = e.key;
      if (k>='0'&&k<='9')              { this._flash(k);   this.calc.appendDigit(k); }
      else if (k==='.')                 { this._flash('.');  this.calc.appendDigit('.'); }
      else if (k==='+')                 { this._flash('+');  this.calc.setOperator('+'); }
      else if (k==='-')                 { this._flash('-');  this.calc.setOperator('-'); }
      else if (k==='*')                 { this._flash('*');  this.calc.setOperator('*'); }
      else if (k==='/')                 { e.preventDefault();this._flash('/'); this.calc.setOperator('/'); }
      else if (k==='Enter'||k==='=')    { this._flash('=');  this.calc.calculate(); }
      else if (k==='Backspace')         { this._flash('ce'); this.calc.clearEntry(); }
      else if (k==='Escape')            { this._flash('c');  this.calc.clear(); }
    });
  }

  _handle(btn) {
    const {action,val} = btn.dataset;
    if (action==='operator') this._setActiveOp(btn);
    else if (action==='calculate'||action==='clear') this._setActiveOp(null);
    switch(action) {
      case 'digit':    this.calc.appendDigit(val); break;
      case 'operator': this.calc.setOperator(val); break;
      case 'calculate':this.calc.calculate();      break;
      case 'clear':    this.calc.clear();          break;
      case 'entry':    this.calc.clearEntry();     break;
    }
  }

  _setActiveOp(btn) {
    if (this._activeOp) this._activeOp.classList.remove('active-op');
    this._activeOp = btn;
    if (btn) btn.classList.add('active-op');
  }

  _flash(key) {
    const sel = key==='c'?'[data-action="clear"]':key==='ce'?'[data-action="entry"]':key==='='?'[data-action="calculate"]':`[data-val="${key}"]`;
    const el = document.querySelector(sel);
    if (!el) return;
    el.classList.add('key-press');
    setTimeout(()=>el.classList.remove('key-press'),120);
  }

  _ripple(e) {
    const btn=e.currentTarget, r=document.createElement('span');
    const rect=btn.getBoundingClientRect(), size=Math.max(rect.width,rect.height);
    r.className='ripple';
    r.style.cssText=`width:${size}px;height:${size}px;left:${e.clientX-rect.left-size/2}px;top:${e.clientY-rect.top-size/2}px`;
    btn.appendChild(r);
    setTimeout(()=>r.remove(),500);
  }
}

/* ============================================================
   BOOTSTRAP
   Operasi didaftarkan dari BasicOps (ops/basicOps.js).
   Untuk menambah operasi baru: buat file di ops/, daftarkan di sini.
   Tidak perlu ubah Calculator, Display, atau EventHandler.
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  const registry = new OperationRegistry();

  // Daftarkan operasi dasar dari ops/basicOps.js
  registry.register('+', BasicOps.add);
  registry.register('-', BasicOps.subtract);
  registry.register('*', BasicOps.multiply);
  registry.register('/', BasicOps.divide);

  // Contoh cara daftarkan operasi lanjutan nanti:
  // registry.register('%', ExtendedOps.percent);
  // registry.register('sin', TrigOps.sin);

  const display = new Display();
  const calc    = new Calculator(registry, display);
  const handler = new EventHandler(calc);
  handler.bindButtons();
  handler.bindKeyboard();
});
