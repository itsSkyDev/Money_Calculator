// All functions return estimates. Amounts are in INR; annual rates are percentages.
export const emi = (p, annualRate, months) => { if (p <= 0 || months <= 0) return 0; const r = annualRate / 1200; if (r === 0) return p / months; const f = Math.pow(1 + r, months); return p * r * f / (f - 1); };
export const sip = (monthly, annualRate, months) => { if (monthly <= 0 || months <= 0) return 0; const r = annualRate / 1200; if (r === 0) return monthly * months; return monthly * (Math.pow(1 + r, months) - 1) / r; };
export const lumpsum = (p, annualRate, years) => p > 0 && years > 0 ? p * Math.pow(1 + annualRate / 100, years) : 0;
export const fd = (p, annualRate, years, n = 4) => p > 0 && years > 0 ? p * Math.pow(1 + annualRate / (100 * n), n * years) : 0;
export const rd = (monthly, annualRate, months) => { if (monthly <= 0 || months <= 0) return 0; const q = annualRate / 400, mr = Math.pow(1 + q, 1 / 3) - 1; let total = 0; for (let i = 0; i < months; i++)total += monthly * Math.pow(1 + mr, months - i - 1); return total; };
// PPF illustration: yearly deposits at year-end with annual compounding.
// Actual PPF interest uses eligible monthly balances and is credited annually.
export const ppf = (yearlyContribution, annualRate, years) => { if (yearlyContribution <= 0 || years <= 0) return 0; const r = annualRate / 100; if (r === 0) return yearlyContribution * years; return yearlyContribution * (Math.pow(1 + r, years) - 1) / r; };
export const gstBreakdown = (amount, gstRate, mode = 'exclusive') => { const rate = gstRate / 100; const base = mode === 'inclusive' ? amount / (1 + rate) : amount; const tax = mode === 'inclusive' ? amount - base : amount * rate; return { base, tax, cgst: tax / 2, sgst: tax / 2, igst: tax, total: base + tax }; };
export const savingsFutureValue = (monthly, annualRate, months) => { if (monthly <= 0 || months <= 0) return 0; const r = Math.pow(1 + annualRate / 100, 1 / 12) - 1; if (r === 0) return monthly * months; return monthly * (Math.pow(1 + r, months) - 1) / r; };
// Salary estimator. PF is calculated on entered basic salary; tax/TDS and PT are entered by the user.
export const salaryBreakdown = ({ basic = 0, hra = 0, allowance = 0, pfRate = 0, pt = 0, tds = 0, other = 0 }) => { const gross = basic + hra + allowance; const pf = basic * pfRate / 100; const deductions = pf + pt + tds + other; return { gross, pf, pt, tds, other, deductions, net: gross - deductions }; };
 