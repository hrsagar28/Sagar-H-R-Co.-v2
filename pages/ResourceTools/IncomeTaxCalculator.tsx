import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import ToolPage from './ToolPage';
import { Announce, ChoiceField, MoneyField, Result, Row, amountEntry } from './fields';
import FormField from '../../components/redesign/FormField';
import { ADVANCE_TAX, getResourceTool, type AgeBand } from '../../constants/resources';
import {
  EMPTY_INCOME_TAX_INPUT,
  advanceTax,
  advanceTaxInterest,
  compareRegimes,
  type AdvancePayment,
  type CarriedForward,
  type IncomeTaxInput,
  type RegimeResult,
} from '../../utils/resources/incomeTax';
import { rupees } from '../../utils/resources/format';
import { dayMonth, todayIso } from '../../utils/resources/dates';
import { formatLongDate } from '../../utils/insightDates';

const TOOL = getResourceTool('income-tax-calculator')!;

type NumberKey = { [K in keyof IncomeTaxInput]: IncomeTaxInput[K] extends number ? K : never }[keyof IncomeTaxInput];

const either = (value: (result: RegimeResult) => number) => (a: RegimeResult, b: RegimeResult) =>
  value(a) !== 0 || value(b) !== 0;

/**
 * The rows of the comparison. On screen it is short; printed, the income
 * part is set out head by head down to total income, as a computation.
 */
const ROWS: {
  label: string;
  value: (result: RegimeResult) => number;
  show?: (a: RegimeResult, b: RegimeResult) => boolean;
  /** Shown only on screen, or only in print. */
  only?: 'screen' | 'print';
  /** A subtotal, set a little heavier in print. */
  sub?: boolean;
}[] = [
  { label: 'Income after deductions', value: (r) => r.normalIncome, only: 'screen' },
  {
    label: 'Capital gains at special rates',
    value: (r) => r.specialGains,
    show: (a) => a.specialGains > 0,
    only: 'screen',
  },
  { label: 'Salaries', value: (r) => r.incomeBy.salary, show: either((r) => r.incomeBy.salary), only: 'print' },
  {
    label: 'House property',
    value: (r) => r.incomeBy.houseProperty,
    show: either((r) => r.incomeBy.houseProperty),
    only: 'print',
  },
  {
    label: 'Business or profession',
    value: (r) => r.incomeBy.business,
    show: either((r) => r.incomeBy.business),
    only: 'print',
  },
  { label: 'Other sources', value: (r) => r.incomeBy.other, show: either((r) => r.incomeBy.other), only: 'print' },
  {
    label: 'Capital gains at special rates',
    value: (r) => r.incomeBy.capitalGains,
    show: either((r) => r.incomeBy.capitalGains),
    only: 'print',
  },
  { label: 'Less: losses set off', value: (r) => -r.lossesSetOff, show: either((r) => r.lossesSetOff), only: 'print' },
  { label: 'Gross total income', value: (r) => r.grossTotalIncome, only: 'print', sub: true },
  { label: 'Less: deductions', value: (r) => -r.deductions, show: either((r) => r.deductions), only: 'print' },
  { label: 'Total income, rounded to ₹10', value: (r) => r.totalIncome, only: 'print', sub: true },
  { label: 'Tax at slab rates', value: (r) => r.slabTax },
  {
    label: 'Tax on capital gains',
    value: (r) => r.specialTax,
    show: (a, b) => a.specialTax > 0 || b.specialTax > 0,
  },
  { label: 'Less: rebate', value: (r) => -r.rebate, show: (a, b) => a.rebate > 0 || b.rebate > 0 },
  { label: 'Surcharge', value: (r) => r.surcharge, show: (a, b) => a.surcharge > 0 || b.surcharge > 0 },
  { label: 'Health and education cess', value: (r) => r.cess },
  {
    label: 'Rounded to the nearest ₹10',
    value: (r) => r.roundOff,
    show: (a, b) => a.roundOff !== 0 || b.roundOff !== 0,
  },
];

/** The amounts listed when the estimate is printed, in the form's order. */
const ENTRY_LABELS: [NumberKey, string][] = [
  ['salary', 'Salary'],
  ['businessIncome', 'Profit from business or profession'],
  ['otherIncome', 'Interest and other income'],
  ['depositInterest', 'Of which: deposit interest'],
  ['employerNps', 'Employer’s NPS contribution'],
  ['basicAndDa', 'Basic pay and DA for the year'],
  ['letOutRent', 'Rent received from a house let out'],
  ['municipalTax', 'Municipal tax paid on it'],
  ['letOutInterest', 'Home loan interest on that house'],
  ['selfOccupiedInterest', 'Home loan interest on the house you live in'],
  ['stcgEquity', 'Short-term gains on listed shares and equity funds'],
  ['ltcgEquity', 'Long-term gains on listed shares and equity funds'],
  ['ltcgOther', 'Other long-term gains'],
  ['shortTermLoss', 'Short-term capital loss this year'],
  ['longTermLoss', 'Long-term capital loss this year'],
  ['earlierBusinessLoss', 'Business loss from earlier years'],
  ['earlierPropertyLoss', 'House property loss from earlier years'],
  ['earlierShortTermLoss', 'Short-term capital loss from earlier years'],
  ['earlierLongTermLoss', 'Long-term capital loss from earlier years'],
  ['hraExempt', 'Exempt HRA'],
  ['professionalTax', 'Professional tax paid'],
  ['investments', 'PF, PPF, life insurance, ELSS and similar'],
  ['ownNps', 'Your own NPS contribution'],
  ['healthSelf', 'Health insurance for you and your family'],
  ['healthParents', 'Health insurance for your parents'],
  ['educationLoanInterest', 'Interest on an education loan'],
  ['donations', 'Deduction for donations'],
  ['taxDeducted', 'TDS and TCS for the year'],
];

const AGE_LABEL: Record<AgeBand, string> = { below60: 'Below 60', '60to79': '60 to 79', '80plus': '80 or more' };

/** Above this, with capital gains, the surcharge and its marginal relief need working out case by case. */
const SURCHARGE_REVIEW_INCOME = 20000000;

/** Advance tax payments that can be entered. */
const MAX_PAYMENTS = 8;

/** Today, kept within the tax year, as the date of a new payment. */
const paymentDefault = (today: string) =>
  today < ADVANCE_TAX.paidFrom ? ADVANCE_TAX.paidFrom : today > ADVANCE_TAX.paidTo ? ADVANCE_TAX.paidTo : today;

/** Losses left for next year, as rows of the carry-forward table. */
const CARRIED: { key: keyof CarriedForward; label: string }[] = [
  { key: 'business', label: 'Business loss' },
  { key: 'houseProperty', label: 'House property loss' },
  { key: 'shortTermCapital', label: 'Short-term capital loss' },
  { key: 'longTermCapital', label: 'Long-term capital loss' },
];

const IncomeTaxCalculator: React.FC = () => {
  const [input, setInput] = useState<IncomeTaxInput>(EMPTY_INCOME_TAX_INPUT);
  const set = <K extends keyof IncomeTaxInput>(key: K, value: IncomeTaxInput[K]) =>
    setInput((current) => ({ ...current, [key]: value }));
  const money = (key: NumberKey) => ({ value: input[key], onChange: (value: number) => set(key, value) });
  const [payments, setPayments] = useState<AdvancePayment[]>([]);
  const [balanceDate, setBalanceDate] = useState(ADVANCE_TAX.balanceDate);
  const updatePayment = (index: number, change: Partial<AdvancePayment>) =>
    setPayments((list) => list.map((item, at) => (at === index ? { ...item, ...change } : item)));

  const { newRegime, oldRegime, better } = compareRegimes(input);
  const difference = Math.abs(newRegime.total - oldRegime.total);
  const senior = input.age !== 'below60';
  const businessProfit = input.businessIncome > 0 && !input.businessLoss;
  const carried = CARRIED.filter(({ key }) => newRegime.carriedForward[key] > 0 || oldRegime.carriedForward[key] > 0);
  // A loss alone is still something to show: how much of it is carried forward.
  const entered =
    newRegime.totalIncome > 0 ||
    oldRegime.totalIncome > 0 ||
    input.businessIncome > 0 ||
    carried.length > 0 ||
    oldRegime.houseProperty < 0;
  const lower = better === 'old' ? oldRegime : newRegime;
  const advance = advanceTax({
    tax: lower.total,
    deducted: input.taxDeducted,
    senior,
    hasBusinessIncome: businessProfit,
    presumptive: input.presumptive && businessProfit,
  });
  const today = todayIso();
  // Once a payment is added, the schedule shows what was paid and the interest.
  const interest =
    advance.due && payments.length > 0
      ? advanceTaxInterest({
          net: advance.net,
          payments,
          presumptive: input.presumptive && businessProfit,
          balanceDate,
        })
      : undefined;
  const entries: [string, string][] = entered
    ? [
        ['Age during the year', AGE_LABEL[input.age]],
        ...ENTRY_LABELS.flatMap(([key, label]) =>
          amountEntry(
            key === 'businessIncome' && input.businessLoss ? 'Loss from business or profession' : label,
            input[key],
          ),
        ),
        ...(input.governmentEmployer ? ([['Employer', 'Central or State Government']] as [string, string][]) : []),
        ...(input.parentsSenior ? ([['A parent is a senior citizen', 'Yes']] as [string, string][]) : []),
        ...(input.presumptive && businessProfit
          ? ([['Business income', 'Presumptive (section 58)']] as [string, string][])
          : []),
        ...payments.flatMap((payment) =>
          amountEntry(`Advance tax paid on ${formatLongDate(payment.date)}`, payment.amount),
        ),
        ...(interest ? ([['The rest to be paid on', formatLongDate(balanceDate)]] as [string, string][]) : []),
      ]
    : [];

  const headline = !entered
    ? 'Enter your income to compare the two regimes.'
    : difference === 0
      ? 'Both regimes come to the same tax.'
      : `The ${better} regime is lower by ${rupees(difference)}.`;

  return (
    <ToolPage
      tool={TOOL}
      law="Tax year 2026-27 · Income-tax Act, 2025 and Finance Act, 2026 · For a resident individual"
    >
      <div className="seam panel calc wide">
        <form className="cin" onSubmit={(event) => event.preventDefault()} aria-label="Income tax calculator">
          <ChoiceField<AgeBand>
            name="it-age"
            legend="Your age during the year"
            value={input.age}
            onChange={(value) => set('age', value)}
            options={(Object.keys(AGE_LABEL) as AgeBand[]).map((value) => ({ value, label: AGE_LABEL[value] }))}
          />

          <p className="lbl">Income for the year</p>
          <div className="pair">
            <MoneyField
              id="it-salary"
              label="Salary"
              note="Gross, before the standard deduction, including HRA and other allowances."
              {...money('salary')}
            />
            <MoneyField
              id="it-business"
              label={input.businessLoss ? 'Loss from business or profession' : 'Profit from business or profession'}
              {...money('businessIncome')}
              after={
                <label className="check">
                  <input
                    type="checkbox"
                    checked={input.businessLoss}
                    onChange={(event) => set('businessLoss', event.target.checked)}
                  />
                  <span>This is a loss</span>
                </label>
              }
            />
            <MoneyField id="it-other" label="Interest and other income" {...money('otherIncome')} />
            <MoneyField
              id="it-deposit"
              label={senior ? 'Of which: bank and post office deposit interest' : 'Of which: savings account interest'}
              {...money('depositInterest')}
            />
          </div>

          <details className="more">
            <summary>Employer’s NPS contribution</summary>
            <div className="pair">
              <MoneyField id="it-employer-nps" label="Employer’s contribution" {...money('employerNps')} />
              <MoneyField
                id="it-basic"
                label="Basic pay and DA for the year"
                note="The deduction is limited to a share of this."
                {...money('basicAndDa')}
              />
            </div>
            <label className="check">
              <input
                type="checkbox"
                checked={input.governmentEmployer}
                onChange={(event) => set('governmentEmployer', event.target.checked)}
              />
              <span>My employer is the Central or a State Government</span>
            </label>
          </details>

          <details className="more">
            <summary>House property</summary>
            <div className="pair">
              <MoneyField id="it-rent" label="Rent received from a house let out" {...money('letOutRent')} />
              <MoneyField id="it-municipal" label="Municipal tax paid on it" {...money('municipalTax')} />
              <MoneyField id="it-let-interest" label="Home loan interest on that house" {...money('letOutInterest')} />
              <MoneyField
                id="it-own-interest"
                label="Home loan interest on the house you live in"
                note="Old regime only, up to ₹2 lakh."
                {...money('selfOccupiedInterest')}
              />
            </div>
          </details>

          <details className="more">
            <summary>Capital gains</summary>
            <div className="pair">
              <MoneyField
                id="it-stcg"
                label="Short-term gains on listed shares and equity funds"
                note="Taxed at 20%."
                {...money('stcgEquity')}
              />
              <MoneyField
                id="it-ltcg-equity"
                label="Long-term gains on listed shares and equity funds"
                note="12.5% on the amount above ₹1.25 lakh."
                {...money('ltcgEquity')}
              />
              <MoneyField
                id="it-ltcg-other"
                label="Other long-term gains, such as property or gold"
                note="Taxed at 12.5%."
                {...money('ltcgOther')}
              />
              <MoneyField
                id="it-stcl"
                label="Short-term capital loss this year"
                note="On any asset. Reduces any of the gains above."
                {...money('shortTermLoss')}
              />
              <MoneyField
                id="it-ltcl"
                label="Long-term capital loss this year"
                note="Reduces long-term gains only."
                {...money('longTermLoss')}
              />
            </div>
            <p className="fnote">
              Short-term gains on other assets are ordinary income: add them to other income (a capital loss is not set
              off against them here). For property bought before 23 July 2024, the{' '}
              <Link to="/resources/capital-gains-calculator">capital gains calculator</Link> shows whether 20% with
              indexation is lower.
            </p>
          </details>

          <details className="more">
            <summary>Losses from earlier years</summary>
            <div className="pair">
              <MoneyField
                id="it-bf-business"
                label="Business loss"
                note="Reduces business income only. Not intraday trading."
                {...money('earlierBusinessLoss')}
              />
              <MoneyField
                id="it-bf-property"
                label="House property loss"
                note="Reduces house-property income only."
                {...money('earlierPropertyLoss')}
              />
              <MoneyField
                id="it-bf-stcl"
                label="Short-term capital loss"
                note="Reduces any capital gains."
                {...money('earlierShortTermLoss')}
              />
              <MoneyField
                id="it-bf-ltcl"
                label="Long-term capital loss"
                note="Reduces long-term gains only."
                {...money('earlierLongTermLoss')}
              />
            </div>
            <p className="fnote">
              Enter what is still available: each loss carries forward for 8 years, and business and capital losses only
              if that year’s return was filed by the due date. In the new regime, a loss that came from something it
              does not allow, such as interest on a house you live in or additional depreciation, cannot be set off
              (section 202); the calculator counts the full amount in both regimes.
            </p>
          </details>

          <details className="more">
            <summary>Deductions, if you choose the old regime</summary>
            <div className="pair">
              <MoneyField
                id="it-hra"
                label="Exempt HRA"
                note="Work it out with the HRA calculator."
                {...money('hraExempt')}
              />
              <MoneyField id="it-pt" label="Professional tax paid" {...money('professionalTax')} />
              <MoneyField
                id="it-investments"
                label="PF, PPF, life insurance, ELSS, tuition fees and similar"
                note="Up to ₹1.5 lakh (section 123)."
                {...money('investments')}
              />
              <MoneyField
                id="it-nps"
                label="Your own NPS contribution, beyond the above"
                note="Up to ₹50,000 (section 124)."
                {...money('ownNps')}
              />
              <MoneyField
                id="it-health-self"
                label="Health insurance for you and your family"
                note={senior ? 'Up to ₹50,000.' : 'Up to ₹25,000; ₹50,000 if you are a senior citizen.'}
                {...money('healthSelf')}
              />
              <MoneyField
                id="it-health-parents"
                label="Health insurance for your parents"
                note={
                  input.parentsSenior ? 'Up to ₹50,000.' : 'Up to ₹25,000; ₹50,000 if a parent is a senior citizen.'
                }
                {...money('healthParents')}
              />
              <MoneyField id="it-education" label="Interest on an education loan" {...money('educationLoanInterest')} />
              <MoneyField
                id="it-donations"
                label="Deduction for donations"
                note="The deductible amount, after the 50% or 100% rule."
                {...money('donations')}
              />
            </div>
            <label className="check">
              <input
                type="checkbox"
                checked={input.parentsSenior}
                onChange={(event) => set('parentsSenior', event.target.checked)}
              />
              <span>A parent is a senior citizen</span>
            </label>
          </details>
          <details className="more">
            <summary>TDS, TCS and advance tax</summary>
            <MoneyField
              id="it-deducted"
              label="Tax deducted or collected for the year"
              note="TDS on salary, interest, rent and so on, and TCS, as in Form 168 (formerly 26AS)."
              {...money('taxDeducted')}
            />
            <label className="check">
              <input
                type="checkbox"
                checked={input.presumptive}
                onChange={(event) => set('presumptive', event.target.checked)}
              />
              <span>My business income is on a presumptive basis (section 58, formerly 44AD or 44ADA)</span>
            </label>
            <fieldset className="fld impr">
              <legend>Advance tax paid in 2026-27</legend>
              {payments.map((payment, index) => (
                <div className="pair" key={index}>
                  <FormField id={`it-paid-date-${index}`} label={`Date paid (payment ${index + 1})`}>
                    <input
                      id={`it-paid-date-${index}`}
                      type="date"
                      min={ADVANCE_TAX.paidFrom}
                      max={ADVANCE_TAX.paidTo}
                      value={payment.date}
                      onChange={(event) => updatePayment(index, { date: event.target.value })}
                    />
                  </FormField>
                  <MoneyField
                    id={`it-paid-amount-${index}`}
                    label={`Amount (payment ${index + 1})`}
                    value={payment.amount}
                    onChange={(amount) => updatePayment(index, { amount })}
                  />
                </div>
              ))}
              <div className="impr-acts">
                {payments.length < MAX_PAYMENTS && (
                  <button
                    type="button"
                    className="link-btn"
                    onClick={() => setPayments((list) => [...list, { date: paymentDefault(today), amount: 0 }])}
                  >
                    Add a payment
                  </button>
                )}
                {payments.length > 0 && (
                  <button type="button" className="link-btn" onClick={() => setPayments((list) => list.slice(0, -1))}>
                    Remove the last one
                  </button>
                )}
              </div>
            </fieldset>
            {payments.length > 0 && (
              <FormField id="it-balance-date" label="Date the rest of the tax will be paid">
                <p className="fnote" id="it-balance-note">
                  For interest under section 424. The return is due by 31 July for most people, and by 31 October with a
                  tax audit.
                </p>
                <input
                  id="it-balance-date"
                  type="date"
                  min={ADVANCE_TAX.shortPayment.from}
                  aria-describedby="it-balance-note"
                  value={balanceDate}
                  onChange={(event) => setBalanceDate(event.target.value || ADVANCE_TAX.balanceDate)}
                />
              </FormField>
            )}
          </details>
        </form>

        <Result entries={entries}>
          <p className="lbl">Tax for 2026-27</p>
          <div className="duo">
            {[newRegime, oldRegime].map((result) => (
              <div
                key={result.regime}
                className={entered && result.regime === better && difference > 0 ? 'lower' : undefined}
              >
                <p className="rg">{result.regime === 'new' ? 'New regime' : 'Old regime'}</p>
                <p className="big tnum">{entered ? rupees(result.total) : '—'}</p>
              </div>
            ))}
          </div>
          <p className="sub">{headline}</p>

          {entered && (
            <table className="cmp">
              <caption className="vh">How the tax is worked out under each regime</caption>
              <thead>
                <tr>
                  <th scope="col">
                    <span className="vh">Item</span>
                  </th>
                  <th scope="col">New</th>
                  <th scope="col">Old</th>
                </tr>
              </thead>
              <tbody>
                {ROWS.filter((row) => !row.show || row.show(newRegime, oldRegime)).map((row) => (
                  <tr
                    key={`${row.label}-${row.only ?? 'both'}`}
                    className={
                      [row.only === 'screen' && 'sonly', row.only === 'print' && 'ponly', row.sub && 'subt']
                        .filter(Boolean)
                        .join(' ') || undefined
                    }
                  >
                    <th scope="row">{row.label}</th>
                    <td className="tnum">{rupees(row.value(newRegime))}</td>
                    <td className="tnum">{rupees(row.value(oldRegime))}</td>
                  </tr>
                ))}
                <tr className="tot">
                  <th scope="row">Total tax</th>
                  <td className="tnum">{rupees(newRegime.total)}</td>
                  <td className="tnum">{rupees(oldRegime.total)}</td>
                </tr>
              </tbody>
            </table>
          )}

          {carried.length > 0 && (
            <div className="adv">
              <p className="lbl">Losses carried forward to next year</p>
              <table className="cmp">
                <caption className="vh">Losses left to carry forward under each regime</caption>
                <thead>
                  <tr>
                    <th scope="col">
                      <span className="vh">Loss</span>
                    </th>
                    <th scope="col">New</th>
                    <th scope="col">Old</th>
                  </tr>
                </thead>
                <tbody>
                  {carried.map(({ key, label }) => (
                    <tr key={key}>
                      <th scope="row">{label}</th>
                      <td className="tnum">{rupees(newRegime.carriedForward[key])}</td>
                      <td className="tnum">{rupees(oldRegime.carriedForward[key])}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="nudge">
                Each loss can be carried forward for 8 years from the year it arose. Business and capital losses carry
                forward only if the return is filed by the due date (section 121).
              </p>
            </div>
          )}

          {entered && (
            <div className="adv">
              <p className="lbl">Advance tax, {better} regime</p>
              {advance.due && interest ? (
                <>
                  <table className="cmp four">
                    <caption className="vh">Advance tax due, paid and interest by each date</caption>
                    <thead>
                      <tr>
                        <th scope="col">
                          <span className="vh">By</span>
                        </th>
                        <th scope="col">Due</th>
                        <th scope="col">Paid</th>
                        <th scope="col">Interest</th>
                      </tr>
                    </thead>
                    <tbody>
                      {interest.instalments.map((item) => (
                        <tr key={item.date}>
                          <th scope="row">
                            {dayMonth(item.date).replace(' ', '\u00a0')}
                            {item.share < 1 && <span className="sh">{Math.round(item.share * 100)}%</span>}
                          </th>
                          <td className="tnum">{rupees(item.due)}</td>
                          <td className="tnum">{rupees(item.paid)}</td>
                          <td className="tnum">{rupees(item.interest)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <dl className="brk">
                    <Row label="Interest for deferment (section 425)" value={rupees(interest.deferment)} />
                    <Row label="Advance tax paid in the year" value={rupees(interest.paid)} />
                    <Row label="Tax still to pay" value={rupees(interest.balance)} />
                    <Row
                      label={
                        interest.shortPayment.months
                          ? `Interest for short payment (section 424), ${interest.shortPayment.months} ${interest.shortPayment.months === 1 ? 'month' : 'months'} to ${formatLongDate(balanceDate)}`
                          : 'Interest for short payment (section 424)'
                      }
                      value={rupees(interest.shortPayment.interest)}
                    />
                    <Row className="tot" label="Interest in all" value={rupees(interest.total)} />
                  </dl>
                  <p className="nudge">
                    {interest.shortPayment.months
                      ? ''
                      : 'No interest under section 424: the advance tax paid is 90% or more of the tax. '}
                    For a date still ahead, the interest is what it would be if nothing more is paid by then. Interest
                    runs on whole hundreds of rupees, and part of a month counts as a month (Rule 269). Not included:
                    the relief when capital gains or dividends arise after an instalment date (section 425(4)).
                  </p>
                </>
              ) : advance.due ? (
                <>
                  <dl className="brk">
                    {advance.instalments.map((item) => (
                      <Row
                        key={item.date}
                        className={item.date < today ? 'gone' : undefined}
                        label={`By ${dayMonth(item.date)} ${item.date.slice(0, 4)}${item.share < 1 ? `, ${Math.round(item.share * 100)}%` : ''}${item.date < today ? ' (passed)' : ''}`}
                        value={rupees(item.byThen)}
                      />
                    ))}
                  </dl>
                  <p className="nudge">
                    What should have been paid in all by each date, on {rupees(advance.net)} of tax after TDS and TCS. A
                    shortfall carries interest under sections 424 and 425: add the payments made, under TDS, TCS and
                    advance tax, to work it out.
                  </p>
                </>
              ) : (
                <p className="nudge">
                  {advance.reason === 'senior'
                    ? 'None: a resident aged 60 or more with no business or professional income does not pay advance tax.'
                    : `None: the tax after TDS and TCS is ${rupees(advance.net)}, under ₹10,000.`}
                </p>
              )}
            </div>
          )}
          {entered && (newRegime.marginalRelief > 0 || oldRegime.marginalRelief > 0) && (
            <p className="nudge">Marginal relief on surcharge has been applied.</p>
          )}
          {newRegime.specialGains > 0 &&
            Math.max(newRegime.totalIncome, oldRegime.totalIncome) > SURCHARGE_REVIEW_INCOME && (
              <p className="nudge">
                Above ₹2 crore with capital gains, the surcharge and its marginal relief depend on how the income is
                made up, so this figure may not be exact.
              </p>
            )}
          {input.employerNps > 0 && input.basicAndDa === 0 && (
            <p className="nudge">
              Enter your basic pay and DA for the year to count the employer’s NPS contribution: the deduction is a
              share of it.
            </p>
          )}
          {(newRegime.housePropertyLossNotSetOff > 0 || oldRegime.houseProperty < 0) && (
            <p className="nudge">
              In the new regime, a loss from house property does not reduce other income and is not carried forward
              (section 202). In the old regime, up to ₹2 lakh of it reduces other income, and the rest is carried
              forward.
            </p>
          )}
          {input.businessLoss && input.businessIncome > 0 && (
            <p className="nudge">
              A business loss is set off against income other than salary, including capital gains (section 109).
            </p>
          )}
          {input.businessIncome > 0 && (
            <p className="nudge">
              With business income, choosing the old regime is a standing choice: you can return to the new regime only
              once.
            </p>
          )}
          <p className="nudge">An estimate, for planning. The return is worked out from the actual documents.</p>
          <Announce
            text={
              entered ? `New regime ${rupees(newRegime.total)}. Old regime ${rupees(oldRegime.total)}. ${headline}` : ''
            }
          />
        </Result>
      </div>

      <section className="sec" aria-labelledby="it-how-heading">
        <div className="sec-h">
          <h2 id="it-how-heading">The two regimes</h2>
          <p className="desc">Section 202 of the Income-tax Act, 2025, and the Finance Act, 2026.</p>
        </div>
        <ul className="inc">
          <li>
            <h3>New regime</h3>
            <p>
              The default. Nil up to ₹4 lakh, then 5%, 10%, 15%, 20% and 25% for each ₹4 lakh, and 30% above ₹24 lakh. A
              standard deduction of ₹75,000 on salary. No tax up to ₹12 lakh of income (₹12.75 lakh of salary), through
              a rebate of up to ₹60,000, with relief just above that. Few deductions: mainly the employer’s NPS
              contribution, up to 14% of basic pay and DA.
            </p>
          </li>
          <li>
            <h3>Old regime</h3>
            <p>
              If you opt out of the new regime. Nil up to ₹2.5 lakh (₹3 lakh at 60, ₹5 lakh at 80), then 5%, 20% above
              ₹5 lakh and 30% above ₹10 lakh. A standard deduction of ₹50,000. A rebate of up to ₹12,500 up to ₹5 lakh.
              HRA, home loan interest and the deductions under sections 123 to 153 are allowed.
            </p>
          </li>
          <li>
            <h3>Under either regime</h3>
            <p>
              Capital gains on listed shares and equity funds are taxed at 20% (short-term) and 12.5% above ₹1.25 lakh
              (long-term), and other long-term gains at 12.5%. Surcharge is 10% above ₹50 lakh, 15% above ₹1 crore and
              25% above ₹2 crore (37% above ₹5 crore in the old regime), at most 15% on capital gains. Cess is 4%.
            </p>
          </li>
        </ul>
      </section>

      <section className="sec band" aria-labelledby="it-know-heading">
        <div className="sec-h">
          <h2 id="it-know-heading">Good to know</h2>
        </div>
        <ul className="needs">
          <li>
            Without business income, you choose the regime each year with your return. With business income, the old
            regime is chosen by the return due date and then continues; you can switch back only once.
          </li>
          <li>The rebate does not reduce tax on capital gains taxed at special rates in the new regime.</li>
          <li>
            This estimate is for a resident individual. It does not cover agricultural income, unabsorbed depreciation,
            the 15% surcharge cap on dividends, or alternate minimum tax.
          </li>
          <li>
            A loss from intraday share trading is a speculation loss: it is set off only against speculation profit
            (section 113), so leave it out here.
          </li>
          <li>
            Where a loss can be set off against more than one kind of income, the calculator uses the order that leaves
            the least tax.
          </li>
        </ul>
      </section>
    </ToolPage>
  );
};

export default IncomeTaxCalculator;
