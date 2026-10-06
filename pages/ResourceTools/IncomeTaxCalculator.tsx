import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import ToolPage from './ToolPage';
import { Announce, ChoiceField, MoneyField, Result, Row, amountEntry } from './fields';
import { getResourceTool, type AgeBand } from '../../constants/resources';
import {
  EMPTY_INCOME_TAX_INPUT,
  advanceTax,
  compareRegimes,
  type IncomeTaxInput,
  type RegimeResult,
} from '../../utils/resources/incomeTax';
import { rupees } from '../../utils/resources/format';
import { dayMonth, todayIso } from '../../utils/resources/dates';

const TOOL = getResourceTool('income-tax-calculator')!;

type NumberKey = { [K in keyof IncomeTaxInput]: IncomeTaxInput[K] extends number ? K : never }[keyof IncomeTaxInput];

const ROWS: {
  label: string;
  value: (result: RegimeResult) => number;
  show?: (a: RegimeResult, b: RegimeResult) => boolean;
}[] = [
  { label: 'Income after deductions', value: (r) => r.normalIncome },
  { label: 'Capital gains at special rates', value: (r) => r.specialGains, show: (a) => a.specialGains > 0 },
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

/** What happens to a house-property loss (s.109, s.110, s.202(2)(b)(ii)). */
const propertyLossNote = (neu: RegimeResult, old: RegimeResult) => {
  const carry = 'carried forward against house-property income for up to 8 years.';
  const inNew = neu.housePropertyLossNotSetOff;
  const inOld = old.housePropertyLossNotSetOff;
  if (inNew && inOld) {
    return `A loss of ${rupees(inNew)} from house property does not reduce other income in the new regime. In the old regime, where the set-off is limited to ₹2 lakh, ${rupees(inOld)} is left. What is left is ${carry}`;
  }
  if (inNew) {
    return `A loss of ${rupees(inNew)} from house property does not reduce other income in the new regime; in the old regime it does. In the new regime it is ${carry}`;
  }
  return `In the old regime, where the set-off is limited to ₹2 lakh, ${rupees(inOld)} of the loss from house property is left. It is ${carry}`;
};

/** What happens to a business loss (s.109, s.112, s.121). */
const businessLossNote = (neu: RegimeResult, old: RegimeResult) => {
  const rule = 'A business loss is set off against income other than salary, including capital gains (section 109).';
  const inNew = neu.businessLossNotSetOff;
  const inOld = old.businessLossNotSetOff;
  if (!inNew && !inOld) return rule;
  const left = inNew === inOld ? rupees(inNew) : `${rupees(inNew)} in the new regime and ${rupees(inOld)} in the old`;
  return `${rule} What it cannot reduce this year, ${left}, is carried forward against business income for up to 8 years, if the return is filed by the due date.`;
};

const IncomeTaxCalculator: React.FC = () => {
  const [input, setInput] = useState<IncomeTaxInput>(EMPTY_INCOME_TAX_INPUT);
  const set = <K extends keyof IncomeTaxInput>(key: K, value: IncomeTaxInput[K]) =>
    setInput((current) => ({ ...current, [key]: value }));
  const money = (key: NumberKey) => ({ value: input[key], onChange: (value: number) => set(key, value) });

  const { newRegime, oldRegime, better } = compareRegimes(input);
  const difference = Math.abs(newRegime.total - oldRegime.total);
  const senior = input.age !== 'below60';
  const businessProfit = input.businessIncome > 0 && !input.businessLoss;
  // A loss alone is still something to show: how much of it is carried forward.
  const entered =
    newRegime.totalIncome > 0 ||
    oldRegime.totalIncome > 0 ||
    input.businessIncome > 0 ||
    newRegime.housePropertyLossNotSetOff > 0 ||
    oldRegime.housePropertyLossNotSetOff > 0;
  const lower = better === 'old' ? oldRegime : newRegime;
  const advance = advanceTax({
    tax: lower.total,
    deducted: input.taxDeducted,
    senior,
    hasBusinessIncome: businessProfit,
    presumptive: input.presumptive && businessProfit,
  });
  const today = todayIso();
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
            </div>
            <p className="fnote">
              Short-term gains on other assets are ordinary income: add them to other income. For property bought before
              23 July 2024, the <Link to="/resources/capital-gains-calculator">capital gains calculator</Link> shows
              whether 20% with indexation is lower.
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
                  <tr key={row.label}>
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

          {entered && (
            <div className="adv">
              <p className="lbl">Advance tax, {better} regime</p>
              {advance.due ? (
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
                    shortfall carries interest under sections 424 and 425.
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
          {(newRegime.housePropertyLossNotSetOff > 0 || oldRegime.housePropertyLossNotSetOff > 0) && (
            <p className="nudge">{propertyLossNote(newRegime, oldRegime)}</p>
          )}
          {input.businessLoss && input.businessIncome > 0 && (
            <p className="nudge">{businessLossNote(newRegime, oldRegime)}</p>
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
            This estimate is for a resident individual. It does not cover agricultural income, losses brought forward,
            capital losses, the 15% surcharge cap on dividends, or alternate minimum tax.
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
