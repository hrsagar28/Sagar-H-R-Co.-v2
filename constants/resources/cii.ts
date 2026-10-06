// Cost Inflation Index, notified under s.72(8)(a) of the Income-tax Act, 2025
// (s.48 of the 1961 Act for earlier years). Base year 2001-02 = 100. The
// 2026-27 figure is Notification No. 85/2026, S.O. 3889(E) of 15 July 2026.

export const COST_INFLATION_INDEX: { year: string; index: number }[] = [
  { year: '2001-02', index: 100 },
  { year: '2002-03', index: 105 },
  { year: '2003-04', index: 109 },
  { year: '2004-05', index: 113 },
  { year: '2005-06', index: 117 },
  { year: '2006-07', index: 122 },
  { year: '2007-08', index: 129 },
  { year: '2008-09', index: 137 },
  { year: '2009-10', index: 148 },
  { year: '2010-11', index: 167 },
  { year: '2011-12', index: 184 },
  { year: '2012-13', index: 200 },
  { year: '2013-14', index: 220 },
  { year: '2014-15', index: 240 },
  { year: '2015-16', index: 254 },
  { year: '2016-17', index: 264 },
  { year: '2017-18', index: 272 },
  { year: '2018-19', index: 280 },
  { year: '2019-20', index: 289 },
  { year: '2020-21', index: 301 },
  { year: '2021-22', index: 317 },
  { year: '2022-23', index: 331 },
  { year: '2023-24', index: 348 },
  { year: '2024-25', index: 363 },
  { year: '2025-26', index: 376 },
  { year: '2026-27', index: 384 },
];

export const CII_BY_YEAR = new Map(COST_INFLATION_INDEX.map((row) => [row.year, row.index]));

/** Property is long-term when held for more than this many months (land or building). */
export const PROPERTY_LONG_TERM_MONTHS = 24;

/**
 * 23 July 2024. A sale before it was taxed at 20% with indexation (s.112 of the
 * 1961 Act as it then stood). From it, 12.5% without indexation, and for land
 * or buildings acquired before it by a resident individual or HUF, the lower of
 * that and 20% with indexation (s.112(1) proviso of the 1961 Act; s.197(3)).
 */
export const INDEXATION_CUTOFF = '2024-07-23';

/** The calculator takes sales in tax years 2024-25 to 2026-27, whose returns can still be filed, revised or updated. */
export const PROPERTY_SALE_FROM = '2024-04-01';
export const PROPERTY_SALE_TO = '2027-03-31';

/** Sales from this date fall under the Income-tax Act, 2025. */
export const NEW_ACT_FROM = '2026-04-01';

/** s.90: an asset owned before this date may use its fair market value on it (capped at stamp duty value). */
export const FMV_DATE = '2001-04-01';

/** s.78: the stamp duty value replaces the price when it is more than 110% of the price. */
export const STAMP_DUTY_TOLERANCE = 1.1;
