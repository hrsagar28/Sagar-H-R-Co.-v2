import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import ToolPage from './ToolPage';
import { Announce, ChoiceField, MoneyField, Result } from './fields';
import { getResourceTool, type AgeBand } from '../../constants/resources';
import {
  EMPTY_INCOME_TAX_INPUT,
  compareRegimes,
  type IncomeTaxInput,
  type RegimeResult,
} from '../../utils/resources/incomeTax';
import { rupees } from '../../utils/resources/format';

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
];

const IncomeTaxCalculator: React.FC = () => {
  const [input, setInput] = useState<IncomeTaxInput>(EMPTY_INCOME_TAX_INPUT);
  const set = <K extends keyof IncomeTaxInput>(key: K, value: IncomeTaxInput[K]) =>
    setInput((current) => ({ ...current, [key]: value }));
  const money = (key: NumberKey) => ({ value: input[key], onChange: (value: number) => set(key, value) });

  const { newRegime, oldRegime, better } = compareRegimes(input);
  const difference = Math.abs(newRegime.total - oldRegime.total);
  const senior = input.age !== 'below60';
  const entered = newRegime.totalIncome > 0 || oldRegime.totalIncome > 0;

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
            options={[
              { value: 'below60', label: 'Below 60' },
              { value: '60to79', label: '60 to 79' },
              { value: '80plus', label: '80 or more' },
            ]}
          />

          <p className="lbl">Income for the year</p>
          <div className="pair">
            <MoneyField
              id="it-salary"
              label="Salary"
              note="Gross, before the standard deduction, including HRA and other allowances."
              {...money('salary')}
            />
            <MoneyField id="it-business" label="Profit from business or profession" {...money('businessIncome')} />
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
        </form>

        <Result>
          <p className="lbl">Tax for 2026-27</p>
          <div className="duo">
            {[newRegime, oldRegime].map((result) => (
              <div
                key={result.regime}
                className={entered && result.regime === better && difference > 0 ? 'lower' : undefined}
              >
                <p className="rg">{result.regime === 'new' ? 'New regime' : 'Old regime'}</p>
                <p className="big tnum">{rupees(result.total)}</p>
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

          {entered && (newRegime.marginalRelief > 0 || oldRegime.marginalRelief > 0) && (
            <p className="nudge">Marginal relief on surcharge has been applied.</p>
          )}
          {newRegime.housePropertyLossNotSetOff > 0 && (
            <p className="nudge">
              A loss of {rupees(newRegime.housePropertyLossNotSetOff)} from house property does not reduce other income
              in the new regime
              {oldRegime.housePropertyLossNotSetOff > 0
                ? `, and ${rupees(oldRegime.housePropertyLossNotSetOff)} of it is beyond the ₹2 lakh allowed in the old`
                : ''}
              . It can be carried forward against house-property income.
            </p>
          )}
          {input.businessIncome > 0 && (
            <p className="nudge">
              With business income, choosing the old regime is a standing choice: you can return to the new regime only
              once.
            </p>
          )}
          <p className="nudge">
            An estimate. For your return, <Link to="/contact?subject=income-tax#write">send us your documents</Link> and
            we will work it out.
          </p>
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
              By opting out. Nil up to ₹2.5 lakh (₹3 lakh at 60, ₹5 lakh at 80), then 5%, 20% above ₹5 lakh and 30%
              above ₹10 lakh. A standard deduction of ₹50,000. A rebate of up to ₹12,500 up to ₹5 lakh. HRA, home loan
              interest and the deductions under sections 123 to 153 are allowed.
            </p>
          </li>
          <li>
            <h3>Both</h3>
            <p>
              Capital gains on listed shares and equity funds are taxed at 20% (short-term) and 12.5% above ₹1.25 lakh
              (long-term), and other long-term gains at 12.5%. Surcharge is 10% above ₹50 lakh, 15% above ₹1 crore and
              25% above ₹2 crore (37% above ₹5 crore in the old regime), at most 15% on capital gains. Cess is 4%.
            </p>
          </li>
        </ul>
      </section>

      <section className="sec" aria-labelledby="it-know-heading">
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
            the 15% surcharge cap on dividends, or alternate minimum tax.
          </li>
        </ul>
      </section>
    </ToolPage>
  );
};

export default IncomeTaxCalculator;
