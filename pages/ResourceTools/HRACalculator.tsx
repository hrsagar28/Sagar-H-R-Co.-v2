import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import ToolPage from './ToolPage';
import { Announce, ChoiceField, MoneyField, Result, Row } from './fields';
import FormField from '../../components/redesign/FormField';
import { HRA_FIFTY_PERCENT_CITIES, HRA_LANDLORD_PAN_RENT, getResourceTool } from '../../constants/resources';
import { calculateHra, type HraLimit } from '../../utils/resources/hra';
import { rupees } from '../../utils/resources/format';

const TOOL = getResourceTool('hra-calculator')!;

const cityList = `${HRA_FIFTY_PERCENT_CITIES.slice(0, -1).join(', ')} and ${HRA_FIFTY_PERCENT_CITIES[HRA_FIFTY_PERCENT_CITIES.length - 1]}`;

const HRACalculator: React.FC = () => {
  const [basic, setBasic] = useState(0);
  const [da, setDa] = useState(0);
  const [hra, setHra] = useState(0);
  const [rent, setRent] = useState(0);
  const [months, setMonths] = useState(12);
  const [place, setPlace] = useState<'listed' | 'elsewhere'>('elsewhere');

  const result = calculateHra({
    basic,
    da,
    hraReceived: hra,
    rentPaid: rent,
    months,
    listedCity: place === 'listed',
  });
  const share = place === 'listed' ? '50%' : '40%';
  const limitLabel: Record<HraLimit, string> = {
    received: 'HRA received',
    rent: 'Rent paid, less 10% of salary',
    salary: `${share} of salary`,
  };

  return (
    <ToolPage tool={TOOL} law="Tax year 2026-27 · Rule 279 of the Income-tax Rules, 2026">
      <div className="seam panel calc">
        <form className="cin" onSubmit={(event) => event.preventDefault()} aria-label="HRA calculator">
          <p className="lbl">Monthly amounts</p>
          <div className="pair">
            <MoneyField id="hra-basic" label="Basic pay" value={basic} onChange={setBasic} />
            <MoneyField
              id="hra-da"
              label="Dearness allowance"
              note="Only if it counts towards retirement benefits."
              value={da}
              onChange={setDa}
            />
            <MoneyField id="hra-received" label="HRA received" value={hra} onChange={setHra} />
            <MoneyField id="hra-rent" label="Rent paid" value={rent} onChange={setRent} />
          </div>
          <FormField id="hra-months" label="Months you paid rent in the tax year">
            <select id="hra-months" value={months} onChange={(event) => setMonths(Number(event.target.value))}>
              {Array.from({ length: 12 }, (_, index) => 12 - index).map((count) => (
                <option key={count} value={count}>
                  {count}
                </option>
              ))}
            </select>
          </FormField>
          <ChoiceField
            name="hra-place"
            legend="Where is the rented home?"
            value={place}
            onChange={setPlace}
            options={[
              { value: 'listed', label: 'In one of the eight cities below' },
              { value: 'elsewhere', label: 'Anywhere else, including Mysuru' },
            ]}
          />
          <p className="fnote">The eight cities: {cityList}.</p>
        </form>

        <Result>
          <p className="lbl">Exempt HRA for the year</p>
          <p className="big tnum">{rupees(result.exempt)}</p>
          <p className="sub">
            Taxable HRA: <span className="tnum">{rupees(result.taxable)}</span>
          </p>
          <dl className="brk">
            {(Object.keys(limitLabel) as HraLimit[]).map((key) => (
              <Row
                key={key}
                className={key === result.least ? 'least' : undefined}
                label={
                  <>
                    {limitLabel[key]}
                    {key === result.least && <span className="vh"> (the lowest, so this is the exemption)</span>}
                  </>
                }
                value={rupees(result.limits[key])}
              />
            ))}
          </dl>
          <p className="nudge">The lowest of the three is exempt. It counts only if you choose the old regime.</p>
          {result.rent > HRA_LANDLORD_PAN_RENT && (
            <p className="nudge">
              Your rent is more than ₹1 lakh for the year, so give your employer the landlord’s PAN with Form 124.
            </p>
          )}
          <p className="nudge">
            To see whether the old regime is worth it for you, use the{' '}
            <Link to="/resources/income-tax-calculator">income tax calculator</Link>.
          </p>
          <Announce text={`Exempt HRA ${rupees(result.exempt)} for the year. Taxable HRA ${rupees(result.taxable)}.`} />
        </Result>
      </div>

      <section className="sec" aria-labelledby="hra-how-heading">
        <div className="sec-h">
          <h2 id="hra-how-heading">How it is worked out</h2>
          <p className="desc">Schedule III of the Income-tax Act, 2025, with Rule 279.</p>
        </div>
        <ul className="needs">
          <li>
            The exemption is the lowest of: the HRA you received; the rent you paid, less 10% of your salary; and 50% of
            your salary if the home is in {cityList}, or 40% anywhere else.
          </li>
          <li>
            Salary here means basic pay, plus dearness allowance where your terms of employment count it for retirement
            benefits. Other allowances and perquisites are left out.
          </li>
          <li>Only the months you lived in the rented home count, and the rent must be for the home you live in.</li>
          <li>
            From tax year 2026-27 the 50% rate covers eight cities. Until 2025-26 it covered only Mumbai, Delhi, Kolkata
            and Chennai.
          </li>
        </ul>
      </section>

      <section className="sec" aria-labelledby="hra-know-heading">
        <div className="sec-h">
          <h2 id="hra-know-heading">Good to know</h2>
        </div>
        <ul className="needs">
          <li>
            The exemption is available only under the old regime. The new regime, which applies unless you opt out,
            allows no HRA exemption.
          </li>
          <li>
            You claim it through your employer with Form 124 (formerly 12BB), with rent receipts. The landlord’s PAN is
            needed when the rent is more than ₹1 lakh in the year.
          </li>
          <li>
            If your employer pays no HRA, a separate deduction for rent paid (section 134, formerly 80GG) may apply
            under the old regime, up to ₹5,000 a month.
          </li>
        </ul>
      </section>
    </ToolPage>
  );
};

export default HRACalculator;
