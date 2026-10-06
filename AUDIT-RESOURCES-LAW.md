# Resources: law check and yearly update

**Checked:** 6 October 2026, for tax year 2026-27 (Income-tax Act, 2025 and
Rules, 2026; Finance Act, 2026; GST rates after GST 2.0).
**Covers:** the Resources pages — the calculators, TDS and TCS rates, due
dates and checklists.

Each figure sits in `constants/resources/*.ts` with its source in a comment
beside it. This note records what those sources were, the readings decided
with CA Sagar, and what to recheck each year. Update it whenever a figure
changes.

## Where the figures live

| File                                | Holds                                                                                                        |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `constants/resources/incomeTax.ts`  | Slabs (both regimes), standard deduction, rebate, special rates, surcharge, cess, house property, deductions |
| `constants/resources/tds.ts`        | TDS (s.392, 393) and TCS (s.394) rows, due dates, notes                                                      |
| `constants/resources/calendar.ts`   | Due dates for the year; monthly items generated, one-off items listed                                        |
| `constants/resources/cii.ts`        | Cost Inflation Index, the 23 July 2024 date, the sale-date range, 24 months, 110% rule                       |
| `constants/resources/hra.ts`        | Rule 279: the eight cities at 50%, the ₹1 lakh landlord-PAN limit                                            |
| `constants/resources/gst.ts`        | GST rates                                                                                                    |
| `constants/resources/tools.ts`      | `RESOURCES_TAX_YEAR` and `RESOURCES_LAW_AS_AT` (the "Figures as at" date on every tool)                      |
| `constants/resources/checklists.ts` | Documents to send, with new form numbers and the old names in brackets                                       |

The calculations are in `utils/resources/`, with tests in
`utils/resources/calculators.test.ts` and `constants/resources/calendar.test.ts`.

## Readings decided (October 2026)

- **Audit extension.** CBDT Circular 7/2026: tax audit reports to 21 October
  2026 and audit-case returns to 21 November 2026. Forms 10B and 10BB (trusts)
  are covered by the 21 October date. Form 3CEB stays at 31 October; it is not
  extended. Confirmed by CA Sagar.
- **Rebate (s.156).** In the new regime, up to ₹60,000 for income up to ₹12
  lakh, with marginal relief just above. It is capped at the tax at the
  s.202(1) slab rates, so it does not reduce tax on capital gains at special
  rates. In the old regime, up to ₹12,500 up to ₹5 lakh, not against tax on
  listed equity gains (s.198(7)).
- **Surcharge.** 10% above ₹50 lakh and 15% above ₹1 crore on total income.
  The 25% and 37% bands are measured on income other than capital gains and
  dividends. Surcharge on capital-gains tax is capped at 15%, and in the new
  regime at 25% overall. Above ₹2 crore with capital gains, marginal relief
  depends on how the income is made up, so the calculator says "ask us"
  instead of giving a figure.
- **Rounding (s.516).** Total income and tax are rounded to the nearest ₹10.
- **Property sales.** More than 24 months held is long-term. From 23 July
  2024: 12.5% without indexation; a resident individual or HUF selling land or
  a building acquired before that date pays the lower of that and 20% with
  indexation (s.197(3); the s.112 proviso of the 1961 Act for 2024-25 and
  2025-26). A sale before 23 July 2024: 20% with indexation, for everyone.
  Stamp duty value replaces the price above 110% (s.78). Property owned before
  1 April 2001 may use its value on that date, and improvements before then are
  not counted (s.90).
- **Reinvestment.** Sections 82 and 86: cost of the new asset above ₹10 crore
  is not counted; s.86 is not available to someone owning more than one other
  house on the date of sale.
- **HRA (Rule 279).** 50% of salary in Mumbai, Kolkata, Delhi, Chennai,
  Hyderabad, Pune, Ahmedabad and Bengaluru from 2026-27; 40% elsewhere.
- **GST.** 5%, 18% and 40%, with special rates of 0.25%, 1.5%, 3% and 12%
  (bricks). Tobacco moved to 40% on 1 February 2026.
- **Checklists.** No passwords are asked for: "Access to the income-tax and GST
  portals — we will arrange this with you." New form numbers are given with the
  old names in brackets (Form 130 for Form 16, and so on). Both decided by CA
  Sagar.

## Open

- GST rates: recheck after the 57th GST Council meeting (reported for
  7 October 2026).

## Each year

1. **Finance Act (February, in force 1 April).** Slabs, rebate, surcharge,
   standard deduction and deduction limits in `incomeTax.ts`; TDS and TCS rows
   in `tds.ts`. Run the tests and update the expected figures that change.
2. **New tax year (1 April).** `RESOURCES_TAX_YEAR` in `tools.ts`; the year
   range and the years in the generated monthly items in `calendar.ts`; one-off
   dates for the new year; `PROPERTY_SALE_FROM` and `PROPERTY_SALE_TO` in
   `cii.ts` (keep the years whose returns can still be filed, revised or
   updated); the tax year in page text and SEO descriptions.
3. **Cost Inflation Index (usually June or July).** Add the new year to
   `cii.ts`.
4. **Extensions and circulars, as issued.** Due dates in `calendar.ts`.
5. **GST Council meetings.** Rates in `gst.ts` and the text on the GST page.
6. **Every change.** Set `RESOURCES_LAW_AS_AT` to the date checked, and update
   this note.

## Official sources read

- Income-tax Act, 2025: [s.82](https://www.incometaxindia.gov.in/w/section-82-55),
  [s.86](https://www.incometaxindia.gov.in/w/section-86-113),
  [s.197](https://www.incometaxindia.gov.in/w/section-197-78),
  [s.202](https://www.incometaxindia.gov.in/w/section-202-78),
  [s.393 (as amended in 2026)](https://www.incometaxindia.gov.in/w/section-393-6),
  [s.394 (as amended in 2026)](https://www.incometaxindia.gov.in/w/section-394-6),
  [s.516](https://www.incometaxindia.gov.in/w/section-516-3)
- Income-tax Rules, 2026: [Rule 215](https://www.incometaxindia.gov.in/w/rule-215-1),
  [Rule 218](https://www.incometaxindia.gov.in/w/rule-218-1),
  [Rule 219](https://www.incometaxindia.gov.in/w/rule-219-1),
  [Rule 237](https://www.incometaxindia.gov.in/w/rule-237-1),
  [Rule 279](https://www.incometaxindia.gov.in/w/rule-279-1)
- [PIB, Summary of Union Budget 2026-27](https://www.pib.gov.in/PressReleasePage.aspx?PRID=2221458&reg=48&lang=2)
- [PIB, 56th GST Council recommendations](https://www.pib.gov.in/PressReleasePage.aspx?PRID=2163555&reg=48&lang=2)
- Finance Act, 2026 (First Schedule, Parts I to III); CBDT Circular 7/2026;
  Notification 85/2026 (CII 384); CBIC Notification 01/2026-CT (GSTR-3B for
  March 2026).
