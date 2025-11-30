
export const TAX_CONFIG = {
  meta: {
    financialYear: "FY 2025-26",
    assessmentYear: "AY 2026-27",
    description: "Updated as per Finance Bill 2025"
  },
  stdDeduction: {
    new: 75000,
    old: 50000
  },
  limits: {
    d80c: 150000,
    d80tta: 10000,
    d80ttb: 50000,
    nps: 50000,
    hra_house_loan: 200000, // Max interest on self-occupied property
  },
  rebate87A: {
    new: { limit: 1200000, type: "marginal" }, // Marginal relief applies
    old: { limit: 500000, amount: 12500, type: "fixed" }
  },
  surcharge: {
    slabs: [
      { min: 5000000, rate: 0.10 },
      { min: 10000000, rate: 0.15 },
      { min: 20000000, rate: 0.25 },
      { min: 50000000, rate: 0.25 } // Note: Capped at 25% for New Regime usually, adjusted in logic if needed
    ],
    oldRegimeHighRate: 0.37 // 37% for income > 5Cr in Old Regime
  },
  slabs: {
    new: [
      { upto: 400000, rate: 0, label: "0 - 4 Lakhs" },
      { upto: 800000, rate: 0.05, label: "4 - 8 Lakhs" },
      { upto: 1200000, rate: 0.10, label: "8 - 12 Lakhs" },
      { upto: 1600000, rate: 0.15, label: "12 - 16 Lakhs" },
      { upto: 2000000, rate: 0.20, label: "16 - 20 Lakhs" },
      { upto: 2400000, rate: 0.25, label: "20 - 24 Lakhs" },
      { upto: Infinity, rate: 0.30, label: "Above 24 Lakhs" }
    ],
    old: {
      rates: [
        { upto: 250000, rate: 0 }, // Basic Exemption handled via logic based on age
        { upto: 500000, rate: 0.05 },
        { upto: 1000000, rate: 0.20 },
        { upto: Infinity, rate: 0.30 }
      ],
      exemptions: {
        below60: 250000,
        "60to80": 300000,
        above80: 500000
      }
    }
  },
  cess: 0.04
};
