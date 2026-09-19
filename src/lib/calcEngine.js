// ============================================================
// CalcFlow Calculation Engine
// Pure functions, separated from UI. Reusable across platforms.
// ============================================================

// ---------- Expression Evaluator ----------
function tokenize(expr) {
  const s = expr.replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-').replace(/,/g, '');
  const tokens = [];
  let i = 0;
  while (i < s.length) {
    const c = s[i];
    if (c === ' ') { i++; continue; }
    if (/[0-9.]/.test(c)) {
      let num = '';
      while (i < s.length && /[0-9.]/.test(s[i])) num += s[i++];
      if (s[i] === 'e' || s[i] === 'E') {
        num += s[i++];
        if (s[i] === '+' || s[i] === '-') num += s[i++];
        while (i < s.length && /[0-9]/.test(s[i])) num += s[i++];
      }
      tokens.push({ t: 'num', v: parseFloat(num) });
      continue;
    }
    if ('+-*/()%^'.includes(c)) { tokens.push({ t: 'op', v: c }); i++; continue; }
    throw new Error('Invalid character: ' + c);
  }
  return tokens;
}

function createParser(tokens) {
  let pos = 0;
  const peek = () => tokens[pos];
  const next = () => tokens[pos++];

  function parsePrimary() {
    const t = peek();
    if (!t) throw new Error('Unexpected end');
    if (t.t === 'num') { next(); return { value: t.v, isPercent: false }; }
    if (t.v === '(') {
      next();
      const inner = parseExpression();
      if (!peek() || peek().v !== ')') throw new Error('Missing closing parenthesis');
      next();
      return { value: inner, isPercent: false };
    }
    throw new Error('Unexpected token');
  }

  function parsePostfix() {
    let r = parsePrimary();
    let isPercent = false;
    while (peek() && peek().v === '%') { next(); isPercent = true; }
    return { value: r.value, isPercent };
  }

  function parseUnary() {
    const t = peek();
    if (t && (t.v === '-' || t.v === '+')) {
      next();
      const r = parseUnary();
      return { value: t.v === '-' ? -r.value : r.value, isPercent: r.isPercent };
    }
    return parsePostfix();
  }

  function parsePower() {
    let l = parseUnary();
    if (peek() && peek().v === '^') {
      next();
      const r = parsePower();
      return { value: Math.pow(l.value, r.value), isPercent: false };
    }
    return l;
  }

  function parseTerm() {
    let l = parsePower();
    let v = l.value;
    let termPercent = l.isPercent;
    while (peek() && (peek().v === '*' || peek().v === '/')) {
      const op = next().v;
      let r = parsePower();
      if (r.isPercent) r.value = r.value / 100;
      if (op === '*' && r.value === 0 && v === 0) v = 0;
      else if (op === '/' && r.value === 0) throw new Error('Cannot divide by zero');
      v = op === '*' ? v * r.value : v / r.value;
      termPercent = false;
    }
    return { value: v, isPercent: termPercent };
  }

  function parseExpression() {
    let l = parseTerm();
    let v = l.value;
    if (l.isPercent) v = v / 100;
    while (peek() && (peek().v === '+' || peek().v === '-')) {
      const op = next().v;
      let r = parseTerm();
      let actualR = r.isPercent ? (v * r.value / 100) : r.value;
      v = op === '+' ? v + actualR : v - actualR;
    }
    return v;
  }

  return { parseExpression };
}

export function evaluateExpression(expr) {
  if (!expr || !expr.trim()) return { value: null, error: 'Please enter a calculation.' };
  try {
    const tokens = tokenize(expr);
    if (tokens.length === 0) return { value: null, error: 'Please enter a calculation.' };
    const parser = createParser(tokens);
    const result = parser.parseExpression();
    if (!isFinite(result)) return { value: null, error: 'This calculation is not possible.' };
    return { value: result, error: null };
  } catch (e) {
    return { value: null, error: 'Please check your calculation and try again.' };
  }
}

// ---------- Percentage ----------
export function calcPercentage(mode, x, y) {
  const xn = Number(x) || 0;
  const yn = Number(y) || 0;
  switch (mode) {
    case 'of': // What is X% of Y?
      return { result: (xn / 100) * yn, breakdown: [{ label: `${xn}% of ${yn}`, value: (xn / 100) * yn }] };
    case 'isWhatPct': // X is what % of Y?
      if (yn === 0) return { error: 'Cannot calculate percentage of zero.' };
      return { result: (xn / yn) * 100, breakdown: [{ label: `${xn} ÷ ${yn} × 100`, value: (xn / yn) * 100 }] };
    case 'increase': // Increase Y by X%
      return { result: yn * (1 + xn / 100), breakdown: [{ label: 'Original', value: yn }, { label: `Increase (${xn}%)`, value: yn * xn / 100 }, { label: 'Final', value: yn * (1 + xn / 100) }] };
    case 'decrease': // Decrease Y by X%
      return { result: yn * (1 - xn / 100), breakdown: [{ label: 'Original', value: yn }, { label: `Decrease (${xn}%)`, value: -(yn * xn / 100) }, { label: 'Final', value: yn * (1 - xn / 100) }] };
    case 'change': // Percentage change from X to Y
      if (xn === 0) return { error: 'Original value cannot be zero.' };
      return { result: ((yn - xn) / Math.abs(xn)) * 100, breakdown: [{ label: 'Original', value: xn }, { label: 'New', value: yn }, { label: 'Difference', value: yn - xn }, { label: 'Change', value: ((yn - xn) / Math.abs(xn)) * 100 }] };
    default:
      return { error: 'Unknown mode.' };
  }
}

// ---------- Discount ----------
export function calcDiscount(price, discountPercent, taxPercent = 0) {
  const p = Number(price) || 0;
  const d = Number(discountPercent) || 0;
  const t = Number(taxPercent) || 0;
  if (p < 0) return { error: 'Price cannot be negative.' };
  const discountAmount = p * d / 100;
  const subtotal = p - discountAmount;
  const taxAmount = subtotal * t / 100;
  const final = subtotal + taxAmount;
  return {
    result: final,
    breakdown: [
      { label: 'Original', value: p },
      { label: `Discount (${d}%)`, value: -discountAmount },
      ...(t > 0 ? [{ label: 'Subtotal', value: subtotal }] : []),
      ...(t > 0 ? [{ label: `Tax (${t}%)`, value: taxAmount }] : []),
      { label: 'Final', value: final },
    ],
    values: { discountAmount, subtotal, taxAmount, final },
  };
}

// ---------- Tax ----------
export function calcTax(price, taxPercent) {
  const p = Number(price) || 0;
  const t = Number(taxPercent) || 0;
  const taxAmount = p * t / 100;
  return {
    result: p + taxAmount,
    breakdown: [{ label: 'Price', value: p }, { label: `Tax (${t}%)`, value: taxAmount }, { label: 'Total', value: p + taxAmount }],
    values: { taxAmount, total: p + taxAmount },
  };
}

// ---------- Tip ----------
export function calcTip(amount, tipPercent, splitCount = 1, taxPercent = 0) {
  const a = Number(amount) || 0;
  const tp = Number(tipPercent) || 0;
  const sc = Math.max(1, Number(splitCount) || 1);
  const tx = Number(taxPercent) || 0;
  const taxAmount = a * tx / 100;
  const tipAmount = a * tp / 100;
  const total = a + taxAmount + tipAmount;
  return {
    result: total / sc,
    breakdown: [
      { label: 'Bill', value: a },
      ...(tx > 0 ? [{ label: `Tax (${tx}%)`, value: taxAmount }] : []),
      { label: `Tip (${tp}%)`, value: tipAmount },
      { label: 'Total', value: total },
      ...(sc > 1 ? [{ label: `Per person (${sc})`, value: total / sc }] : []),
    ],
    values: { taxAmount, tipAmount, total, perPerson: total / sc },
  };
}

// ---------- Bill Split ----------
export function calcBillSplit(items, taxPercent = 0, tipPercent = 0, mode = 'equal', peopleCount = 2) {
  const subtotal = items.reduce((sum, it) => sum + (Number(it.amount) || 0), 0);
  const taxAmount = subtotal * (Number(taxPercent) || 0) / 100;
  const tipAmount = subtotal * (Number(tipPercent) || 0) / 100;
  const total = subtotal + taxAmount + tipAmount;
  if (mode === 'equal') {
    const pc = Math.max(1, Number(peopleCount) || 1);
    return {
      result: total / pc,
      breakdown: [
        { label: 'Subtotal', value: subtotal },
        ...(taxAmount ? [{ label: `Tax (${taxPercent}%)`, value: taxAmount }] : []),
        ...(tipAmount ? [{ label: `Tip (${tipPercent}%)`, value: tipAmount }] : []),
        { label: 'Total', value: total },
        { label: `Per person (${pc})`, value: total / pc },
      ],
      values: { subtotal, taxAmount, tipAmount, total, perPerson: total / pc },
    };
  }
  // unequal: split by proportional shares
  const shares = items.map((it) => ({
    person: it.person || '',
    amount: it.amount + (it.amount / subtotal) * (taxAmount + tipAmount),
  }));
  return { result: total, breakdown: shares, values: { subtotal, taxAmount, tipAmount, total, shares } };
}

// ---------- Salary ----------
export function calcSalary({ hourlyWage, hoursPerWeek, overtimeHours = 0, overtimeMultiplier = 1.5, weeksPerYear = 52 }) {
  const wage = Number(hourlyWage) || 0;
  const hpw = Number(hoursPerWeek) || 0;
  const ot = Number(overtimeHours) || 0;
  const otm = Number(overtimeMultiplier) || 1.5;
  const wpy = Number(weeksPerYear) || 52;
  const regularPay = wage * hpw;
  const overtimePay = wage * otm * ot;
  const weekly = regularPay + overtimePay;
  const annual = weekly * wpy;
  return {
    result: annual,
    breakdown: [
      { label: 'Regular pay / week', value: regularPay },
      { label: 'Overtime pay / week', value: overtimePay },
      { label: 'Weekly', value: weekly },
      { label: 'Daily (5-day week)', value: weekly / 5 },
      { label: 'Biweekly', value: weekly * 2 },
      { label: 'Monthly', value: annual / 12 },
      { label: 'Annual', value: annual },
    ],
    values: { hourly: wage, daily: weekly / 5, weekly, biweekly: weekly * 2, monthly: annual / 12, annual },
    assumptions: ['Estimates are gross (pre-tax).', 'Assumes 5 working days per week.', `Assumes ${wpy} paid weeks per year.`],
  };
}

// ---------- Fuel ----------
export function calcFuel({ distance, consumption, price, unit = 'metric' }) {
  const d = Number(distance) || 0;
  const c = Number(consumption) || 0;
  const p = Number(price) || 0;
  let fuelNeeded, tripCost, costPerDist, range;
  if (unit === 'metric') {
    // consumption in L/100km, distance in km, price per L
    fuelNeeded = (d / 100) * c;
    tripCost = fuelNeeded * p;
    costPerDist = d > 0 ? tripCost / d : 0;
    range = c > 0 ? (1 / c) * 100 : 0; // km per L * 100? Actually range per unit fuel
    range = c > 0 ? 100 / c : 0; // km per litre
  } else {
    // imperial: consumption in mpg, distance in miles, price per gallon
    fuelNeeded = c > 0 ? d / c : 0;
    tripCost = fuelNeeded * p;
    costPerDist = d > 0 ? tripCost / d : 0;
    range = c;
  }
  return {
    result: tripCost,
    breakdown: [
      { label: 'Distance', value: d, suffix: unit === 'metric' ? ' km' : ' mi' },
      { label: 'Fuel needed', value: fuelNeeded, suffix: unit === 'metric' ? ' L' : ' gal' },
      { label: 'Trip cost', value: tripCost },
      { label: 'Cost per ' + (unit === 'metric' ? 'km' : 'mi'), value: costPerDist },
    ],
    values: { fuelNeeded, tripCost, costPerDist, range },
  };
}

export function calcFuelComparison(vehicleA, vehicleB, annualDistance, price) {
  const a = calcFuel({ ...vehicleA, distance: annualDistance, price });
  const b = calcFuel({ ...vehicleB, distance: annualDistance, price });
  return {
    result: a.result - b.result,
    breakdown: [
      { label: 'Vehicle A annual cost', value: a.result },
      { label: 'Vehicle B annual cost', value: b.result },
      { label: 'Difference (A − B)', value: a.result - b.result },
    ],
    values: { a: a.result, b: b.result, difference: a.result - b.result },
  };
}

// ---------- Loan ----------
export function calcLoan({ principal, annualRate, years, frequency = 'monthly' }) {
  const p = Number(principal) || 0;
  const r = (Number(annualRate) || 0) / 100;
  const n = Number(years) || 0;
  const periodsPerYear = frequency === 'biweekly' ? 26 : 12;
  const ratePerPeriod = r / periodsPerYear;
  const totalPeriods = n * periodsPerYear;
  let payment, totalPaid, totalInterest;
  if (ratePerPeriod === 0) {
    payment = p / totalPeriods;
  } else {
    payment = p * (ratePerPeriod * Math.pow(1 + ratePerPeriod, totalPeriods)) / (Math.pow(1 + ratePerPeriod, totalPeriods) - 1);
  }
  totalPaid = payment * totalPeriods;
  totalInterest = totalPaid - p;
  // amortization
  const schedule = [];
  let balance = p;
  for (let i = 1; i <= Math.min(totalPeriods, 360); i++) {
    const interest = balance * ratePerPeriod;
    const principalPart = payment - interest;
    balance -= principalPart;
    schedule.push({ period: i, payment, interest, principal: principalPart, balance: Math.max(0, balance) });
  }
  return {
    result: payment,
    breakdown: [
      { label: 'Loan amount', value: p },
      { label: `Payment (${frequency})`, value: payment },
      { label: 'Total paid', value: totalPaid },
      { label: 'Total interest', value: totalInterest },
    ],
    values: { payment, totalPaid, totalInterest, schedule, totalPeriods, periodsPerYear },
  };
}

export function calcExtraPayment(loan, extraPerMonth) {
  const base = calcLoan(loan);
  const extra = Number(extraPerMonth) || 0;
  const p = Number(loan.principal) || 0;
  const ratePerPeriod = ((Number(loan.annualRate) || 0) / 100) / 12;
  const basePayment = base.values.payment;
  const newPayment = basePayment + extra;
  let balance = p;
  let months = 0;
  let totalInterest = 0;
  while (balance > 0.01 && months < 1000) {
    const interest = balance * ratePerPeriod;
    const principalPart = Math.min(newPayment - interest, balance);
    totalInterest += interest;
    balance -= principalPart;
    months++;
  }
  const baseMonths = base.values.totalPeriods;
  const baseInterest = base.values.totalInterest;
  const monthsSaved = baseMonths - months;
  const interestSaved = baseInterest - totalInterest;
  return {
    result: monthsSaved,
    breakdown: [
      { label: 'Original term', value: baseMonths, suffix: ' months' },
      { label: 'New term', value: months, suffix: ' months' },
      { label: 'Time saved', value: monthsSaved, suffix: ' months' },
      { label: 'Original interest', value: baseInterest },
      { label: 'New interest', value: totalInterest },
      { label: 'Interest saved', value: interestSaved },
    ],
    values: { monthsSaved, interestSaved, newTerm: months, newInterest: totalInterest },
  };
}

// ---------- Savings ----------
export function calcSavings({ starting, monthly, annualRate, years, compounding = 'monthly' }) {
  const start = Number(starting) || 0;
  const monthlyContribution = Number(monthly) || 0;
  const rate = (Number(annualRate) || 0) / 100;
  const n = Number(years) || 0;
  const periodsPerYear = compounding === 'weekly' ? 52 : compounding === 'quarterly' ? 4 : compounding === 'annually' ? 1 : 12;
  const ratePerPeriod = rate / periodsPerYear;
  const totalPeriods = n * periodsPerYear;
  const contributionPerPeriod = monthlyContribution * 12 / periodsPerYear;
  let balance = start;
  const chartData = [{ month: 0, balance: start, contributions: start, interest: 0 }];
  for (let i = 1; i <= totalPeriods; i++) {
    balance = balance * (1 + ratePerPeriod) + contributionPerPeriod;
    const contributions = start + contributionPerPeriod * i;
    const interest = balance - contributions;
    if (i % Math.max(1, Math.floor(periodsPerYear / 12)) === 0 || i === totalPeriods) {
      chartData.push({ month: Math.round(i / periodsPerYear * 12), balance, contributions, interest });
    }
  }
  const totalContributions = start + contributionPerPeriod * totalPeriods;
  const interestEarned = balance - totalContributions;
  return {
    result: balance,
    breakdown: [
      { label: 'Starting balance', value: start },
      { label: 'Total contributions', value: totalContributions },
      { label: 'Interest earned', value: interestEarned },
      { label: 'Final balance', value: balance },
    ],
    values: { balance, totalContributions, interestEarned, chartData },
  };
}

// ---------- Profit / Margin ----------
export function calcProfit({ cost, sellingPrice }) {
  const c = Number(cost) || 0;
  const s = Number(sellingPrice) || 0;
  if (s < c) return { error: 'Selling price is lower than cost. This is a loss.' };
  const profit = s - c;
  const markup = c > 0 ? (profit / c) * 100 : 0;
  const margin = s > 0 ? (profit / s) * 100 : 0;
  return {
    result: profit,
    breakdown: [
      { label: 'Cost', value: c },
      { label: 'Selling price', value: s },
      { label: 'Profit', value: profit },
      { label: 'Markup %', value: markup, suffix: '%' },
      { label: 'Margin %', value: margin, suffix: '%' },
    ],
    values: { profit, markup, margin },
    explanation: 'Markup is profit relative to cost. Margin is profit relative to selling price.',
  };
}

// ---------- Work Hours ----------
export function calcWorkHours(shifts) {
  let totalMinutes = 0;
  let totalBreakMinutes = 0;
  const dayResults = shifts.map((shift) => {
    if (!shift.start || !shift.end) return null;
    const [sh, sm] = shift.start.split(':').map(Number);
    const [eh, em] = shift.end.split(':').map(Number);
    let startMin = sh * 60 + sm;
    let endMin = eh * 60 + em;
    if (endMin < startMin) endMin += 24 * 60; // overnight
    const breakMin = Number(shift.break) || 0;
    const workMin = endMin - startMin - breakMin;
    totalMinutes += workMin;
    totalBreakMinutes += breakMin;
    return { day: shift.day || '', hours: workMin / 60, break: breakMin / 60 };
  }).filter(Boolean);
  const totalHours = totalMinutes / 60;
  return {
    result: totalHours,
    breakdown: [
      ...dayResults.map((d) => ({ label: d.day || 'Shift', value: d.hours, suffix: ' h' })),
      { label: 'Total break time', value: totalBreakMinutes / 60, suffix: ' h' },
      { label: 'Total hours', value: totalHours, suffix: ' h' },
    ],
    values: { totalHours, totalBreakMinutes, dayResults },
  };
}

// ---------- Date / Time ----------
export function calcDateDiff(start, end) {
  if (!start || !end) return { error: 'Please select both dates.' };
  let s = new Date(start);
  let e = new Date(end);
  if (s > e) { const t = s; s = e; e = t; }
  const ms = e - s;
  const days = Math.floor(ms / 86400000);
  const weeks = Math.floor(days / 7);
  const months = (e.getFullYear() - s.getFullYear()) * 12 + (e.getMonth() - s.getMonth());
  const years = months / 12;
  // working days (exclude Sat/Sun)
  let workingDays = 0;
  let cursor = new Date(s);
  while (cursor <= e) {
    const dow = cursor.getDay();
    if (dow !== 0 && dow !== 6) workingDays++;
    cursor.setDate(cursor.getDate() + 1);
  }
  return {
    result: days,
    breakdown: [
      { label: 'Days', value: days },
      { label: 'Weeks', value: weeks },
      { label: 'Months', value: months },
      { label: 'Years', value: years.toFixed(1) },
      { label: 'Working days', value: workingDays },
    ],
    values: { days, weeks, months, workingDays },
  };
}

export function calcDateAdd(baseDate, daysToAdd) {
  if (!baseDate) return { error: 'Please select a date.' };
  const d = new Date(baseDate);
  d.setDate(d.getDate() + Number(daysToAdd) || 0);
  return { result: d.toISOString().split('T')[0], breakdown: [{ label: 'Result', value: d.toLocaleDateString() }] };
}

// ---------- Unit Conversion ----------
export const UNIT_CATEGORIES = {
  length: {
    label: 'Length',
    base: 'm',
    units: {
      mm: { label: 'Millimeter', factor: 0.001 },
      cm: { label: 'Centimeter', factor: 0.01 },
      m: { label: 'Meter', factor: 1 },
      km: { label: 'Kilometer', factor: 1000 },
      in: { label: 'Inch', factor: 0.0254 },
      ft: { label: 'Foot', factor: 0.3048 },
      yd: { label: 'Yard', factor: 0.9144 },
      mi: { label: 'Mile', factor: 1609.344 },
    },
  },
  area: {
    label: 'Area',
    base: 'm2',
    units: {
      mm2: { label: 'Square Millimeter', factor: 0.000001 },
      cm2: { label: 'Square Centimeter', factor: 0.0001 },
      m2: { label: 'Square Meter', factor: 1 },
      ha: { label: 'Hectare', factor: 10000 },
      km2: { label: 'Square Kilometer', factor: 1000000 },
      in2: { label: 'Square Inch', factor: 0.00064516 },
      ft2: { label: 'Square Foot', factor: 0.092903 },
      yd2: { label: 'Square Yard', factor: 0.836127 },
      acre: { label: 'Acre', factor: 4046.86 },
    },
  },
  weight: {
    label: 'Weight',
    base: 'kg',
    units: {
      mg: { label: 'Milligram', factor: 0.000001 },
      g: { label: 'Gram', factor: 0.001 },
      kg: { label: 'Kilogram', factor: 1 },
      t: { label: 'Tonne', factor: 1000 },
      oz: { label: 'Ounce', factor: 0.0283495 },
      lb: { label: 'Pound', factor: 0.453592 },
      st: { label: 'Stone', factor: 6.35029 },
    },
  },
  volume: {
    label: 'Volume',
    base: 'L',
    units: {
      ml: { label: 'Milliliter', factor: 0.001 },
      L: { label: 'Liter', factor: 1 },
      m3: { label: 'Cubic Meter', factor: 1000 },
      tsp: { label: 'Teaspoon', factor: 0.00492892 },
      tbsp: { label: 'Tablespoon', factor: 0.0147868 },
      cup: { label: 'Cup', factor: 0.236588 },
      pt: { label: 'Pint', factor: 0.473176 },
      qt: { label: 'Quart', factor: 0.946353 },
      gal: { label: 'Gallon (US)', factor: 3.78541 },
      galUK: { label: 'Gallon (UK)', factor: 4.54609 },
    },
  },
  speed: {
    label: 'Speed',
    base: 'm/s',
    units: {
      mps: { label: 'Meter/second', factor: 1 },
      kph: { label: 'Kilometer/hour', factor: 0.277778 },
      mph: { label: 'Mile/hour', factor: 0.44704 },
      fps: { label: 'Foot/second', factor: 0.3048 },
      knot: { label: 'Knot', factor: 0.514444 },
    },
  },
  pressure: {
    label: 'Pressure',
    base: 'Pa',
    units: {
      Pa: { label: 'Pascal', factor: 1 },
      kPa: { label: 'Kilopascal', factor: 1000 },
      MPa: { label: 'Megapascal', factor: 1000000 },
      bar: { label: 'Bar', factor: 100000 },
      psi: { label: 'PSI', factor: 6894.76 },
      atm: { label: 'Atmosphere', factor: 101325 },
      mmHg: { label: 'mm of Mercury', factor: 133.322 },
    },
  },
  energy: {
    label: 'Energy',
    base: 'J',
    units: {
      J: { label: 'Joule', factor: 1 },
      kJ: { label: 'Kilojoule', factor: 1000 },
      cal: { label: 'Calorie', factor: 4.184 },
      kcal: { label: 'Kilocalorie', factor: 4184 },
      Wh: { label: 'Watt-hour', factor: 3600 },
      kWh: { label: 'Kilowatt-hour', factor: 3600000 },
      BTU: { label: 'BTU', factor: 1055.06 },
    },
  },
  power: {
    label: 'Power',
    base: 'W',
    units: {
      mW: { label: 'Milliwatt', factor: 0.001 },
      W: { label: 'Watt', factor: 1 },
      kW: { label: 'Kilowatt', factor: 1000 },
      MW: { label: 'Megawatt', factor: 1000000 },
      hp: { label: 'Horsepower', factor: 745.7 },
    },
  },
  force: {
    label: 'Force',
    base: 'N',
    units: {
      N: { label: 'Newton', factor: 1 },
      kN: { label: 'Kilonewton', factor: 1000 },
      lbf: { label: 'Pound-force', factor: 4.44822 },
      kgf: { label: 'Kilogram-force', factor: 9.80665 },
    },
  },
  data: {
    label: 'Data',
    base: 'B',
    units: {
      B: { label: 'Byte', factor: 1 },
      KB: { label: 'Kilobyte', factor: 1024 },
      MB: { label: 'Megabyte', factor: 1048576 },
      GB: { label: 'Gigabyte', factor: 1073741824 },
      TB: { label: 'Terabyte', factor: 1099511627776 },
    },
  },
  time: {
    label: 'Time',
    base: 's',
    units: {
      ms: { label: 'Millisecond', factor: 0.001 },
      s: { label: 'Second', factor: 1 },
      min: { label: 'Minute', factor: 60 },
      h: { label: 'Hour', factor: 3600 },
      day: { label: 'Day', factor: 86400 },
      week: { label: 'Week', factor: 604800 },
      year: { label: 'Year', factor: 31557600 },
    },
  },
};

export function convertUnit(category, fromUnit, toUnit, value) {
  const cat = UNIT_CATEGORIES[category];
  if (!cat) return { error: 'Unknown category.' };
  const from = cat.units[fromUnit];
  const to = cat.units[toUnit];
  if (!from || !to) return { error: 'Unknown unit.' };
  const v = Number(value) || 0;
  const baseValue = v * from.factor;
  const result = baseValue / to.factor;
  return {
    result,
    breakdown: [{ label: `${v} ${from.label}`, value: result, suffix: ` ${to.label}` }],
    values: { result },
  };
}

export function convertTemperature(from, to, value) {
  const v = Number(value) || 0;
  let celsius;
  switch (from) {
    case 'C': celsius = v; break;
    case 'F': celsius = (v - 32) * 5 / 9; break;
    case 'K': celsius = v - 273.15; break;
    default: return { error: 'Unknown unit.' };
  }
  let result;
  switch (to) {
    case 'C': result = celsius; break;
    case 'F': result = celsius * 9 / 5 + 32; break;
    case 'K': result = celsius + 273.15; break;
    default: return { error: 'Unknown unit.' };
  }
  return { result, breakdown: [{ label: `${v}°${from}`, value: result, suffix: `°${to}` }], values: { result } };
}

// ---------- Shopping / Unit Price ----------
export function calcUnitPrice(price, quantity, unit) {
  const p = Number(price) || 0;
  const q = Number(quantity) || 0;
  if (q === 0) return { error: 'Quantity cannot be zero.' };
  return { result: p / q, breakdown: [{ label: `Price per ${unit}`, value: p / q }], values: { unitPrice: p / q } };
}

export function compareProducts(products) {
  // products: [{ name, price, quantity, unit }]
  const normalized = products.map((p) => ({
    ...p,
    unitPrice: (Number(p.price) || 0) / (Number(p.quantity) || 1),
  }));
  const sorted = [...normalized].sort((a, b) => a.unitPrice - b.unitPrice);
  const cheapest = sorted[0];
  const breakdown = normalized.map((p) => ({
    label: p.name || 'Product',
    value: p.unitPrice,
    suffix: ` / ${p.unit || 'unit'}`,
  }));
  const diff = sorted.length > 1 ? sorted[sorted.length - 1].unitPrice - sorted[0].unitPrice : 0;
  return {
    result: cheapest?.unitPrice || 0,
    breakdown: [...breakdown, { label: 'Difference (highest − lowest)', value: diff }],
    values: { normalized, cheapest, diff },
  };
}

// ---------- Construction ----------
export function calcFlooring({ length, width, wastePercent, pricePerUnit, unit = 'ft' }) {
  const l = Number(length) || 0;
  const w = Number(width) || 0;
  const waste = Number(wastePercent) || 0;
  const price = Number(pricePerUnit) || 0;
  const area = l * w;
  const wasteArea = area * waste / 100;
  const required = area + wasteArea;
  const cost = required * price;
  return {
    result: cost,
    breakdown: [
      { label: 'Area', value: area, suffix: ` ${unit}²` },
      { label: `Waste (${waste}%)`, value: wasteArea, suffix: ` ${unit}²` },
      { label: 'Required material', value: required, suffix: ` ${unit}²` },
      { label: 'Estimated cost', value: cost },
    ],
    values: { area, wasteArea, required, cost },
  };
}

export function calcPaint({ length, width, height, doors, windows, coverage, coats = 1, pricePerL }) {
  const l = Number(length) || 0;
  const w = Number(width) || 0;
  const h = Number(height) || 0;
  const doorArea = (Number(doors) || 0) * 1.8;
  const windowArea = (Number(windows) || 0) * 1.5;
  const wallArea = 2 * (l + w) * h;
  const paintableArea = Math.max(0, wallArea - doorArea - windowArea);
  const cov = Number(coverage) || 10;
  const coatsN = Number(coats) || 1;
  const litres = (paintableArea * coatsN) / cov;
  const cost = litres * (Number(pricePerL) || 0);
  return {
    result: litres,
    breakdown: [
      { label: 'Wall area', value: wallArea, suffix: ' m²' },
      { label: 'Doors/windows', value: doorArea + windowArea, suffix: ' m²' },
      { label: 'Paintable area', value: paintableArea, suffix: ' m²' },
      { label: 'Paint needed', value: litres, suffix: ' L' },
      { label: 'Estimated cost', value: cost },
    ],
    values: { paintableArea, litres, cost },
  };
}

export function calcConcrete({ length, width, depth, unit = 'metric' }) {
  const l = Number(length) || 0;
  const w = Number(width) || 0;
  const d = Number(depth) || 0;
  const volume = l * w * d;
  return {
    result: volume,
    breakdown: [{ label: 'Volume', value: volume, suffix: unit === 'metric' ? ' m³' : ' ft³' }],
    values: { volume },
  };
}

// ---------- Engineering ----------
export function calcOhmsLaw({ voltage, current, resistance, power }) {
  const v = voltage !== '' ? Number(voltage) : null;
  const i = current !== '' ? Number(current) : null;
  const r = resistance !== '' ? Number(resistance) : null;
  const p = power !== '' ? Number(power) : null;
  let result = {};
  if (v !== null && i !== null) {
    result = { resistance: v / i, power: v * i };
  } else if (v !== null && r !== null) {
    result = { current: v / r, power: (v * v) / r };
  } else if (i !== null && r !== null) {
    result = { voltage: i * r, power: i * i * r };
  } else if (p !== null && v !== null) {
    result = { current: p / v, resistance: (v * v) / p };
  } else if (p !== null && i !== null) {
    result = { voltage: p / i, resistance: p / (i * i) };
  } else {
    return { error: 'Please enter any two values.' };
  }
  return {
    result: Object.values(result)[0],
    breakdown: Object.entries(result).map(([k, val]) => ({ label: k.charAt(0).toUpperCase() + k.slice(1), value: val, suffix: k === 'voltage' ? ' V' : k === 'current' ? ' A' : k === 'resistance' ? ' Ω' : ' W' })),
    values: result,
  };
}

export function calcForce(mass, acceleration) {
  const m = Number(mass) || 0;
  const a = Number(acceleration) || 0;
  return { result: m * a, breakdown: [{ label: 'Force (F = m × a)', value: m * a, suffix: ' N' }], values: { force: m * a } };
}

export function calcTorque(force, distance) {
  const f = Number(force) || 0;
  const d = Number(distance) || 0;
  return { result: f * d, breakdown: [{ label: 'Torque (τ = F × r)', value: f * d, suffix: ' N·m' }], values: { torque: f * d } };
}

export function calcPowerEngineering(force, velocity) {
  const f = Number(force) || 0;
  const v = Number(velocity) || 0;
  return { result: f * v, breakdown: [{ label: 'Power (P = F × v)', value: f * v, suffix: ' W' }], values: { power: f * v } };
}