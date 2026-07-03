// CT-2: these represent the ACTIVE RETURN-FILING CYCLE, not the calendar year
// in progress. As of the 2026 filing season, returns being prepared/filed are
// for FY 2025-26, assessed in AY 2026-27 — so this pair is correct and internally
// consistent (AY = FY + 1) for the tax calculator, checklists and contact schema.
// NOTE: the compliance-calendar heading also reads from CONTACT_INFO.financialYear
// (via these). When the FY 2026-27 calendar dataset lands (audit CT-1), decouple
// the calendar's "current year" label from this filing-cycle constant rather than
// bumping this to 'FY 2026-27' (which would mislabel the FY 2025-26 tax tools).
export const CURRENT_FY = 'FY 2025-26';
export const CURRENT_AY = 'AY 2026-27';

export const getCopyrightYear = (): number => {
  return new Date().getFullYear();
};
