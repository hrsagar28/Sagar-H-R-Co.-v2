import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import ToolPage from './ToolPage';
import { Announce, ChoiceField, MoneyField, Result, Row } from './fields';
import FormField from '../../components/redesign/FormField';
import { COST_INFLATION_INDEX, FMV_DATE, INDEXATION_CUTOFF, getResourceTool } from '../../constants/resources';
import { calculatePropertyGain, type Improvement } from '../../utils/resources/capitalGains';
import { rupees } from '../../utils/resources/format';
import { formatLongDate } from '../../utils/insightDates';

const TOOL = getResourceTool('capital-gains-calculator')!;

const SALE_FROM = '2026-04-01';
const SALE_TO = '2027-03-31';
const today = () => new Date().toISOString().slice(0, 10);
const defaultSaleDate = () => {
  const now = today();
  return now >= SALE_FROM && now <= SALE_TO ? now : SALE_FROM;
};

const YEARS = COST_INFLATION_INDEX.map((row) => row.year);
const MAX_IMPROVEMENTS = 3;

const CapitalGainsCalculator: React.FC = () => {
  const [seller, setSeller] = useState<'resident' | 'other'>('resident');
  const [purchaseDate, setPurchaseDate] = useState('');
  const [saleDate, setSaleDate] = useState(defaultSaleDate);
  const [cost, setCost] = useState(0);
  const [salePrice, setSalePrice] = useState(0);
  const [stampDutyValue, setStampDutyValue] = useState(0);
  const [saleCosts, setSaleCosts] = useState(0);
  const [improvements, setImprovements] = useState<Improvement[]>([]);

  const before2001 = Boolean(purchaseDate) && purchaseDate < FMV_DATE;
  const saleInRange = saleDate >= SALE_FROM && saleDate <= SALE_TO;
  const result =
    purchaseDate && saleInRange && salePrice > 0
      ? calculatePropertyGain({
          purchaseDate,
          saleDate,
          salePrice,
          stampDutyValue,
          saleCosts,
          cost,
          improvements,
          residentIndividualOrHuf: seller === 'resident',
        })
      : null;

  const updateImprovement = (index: number, change: Partial<Improvement>) =>
    setImprovements((list) => list.map((item, at) => (at === index ? { ...item, ...change } : item)));

  let headline: React.ReactNode;
  let spoken = '';
  if (!saleInRange) {
    headline = <p className="sub">Enter a sale date in tax year 2026-27, from 1 April 2026 to 31 March 2027.</p>;
  } else if (purchaseDate && purchaseDate >= saleDate) {
    headline = <p className="sub">The purchase date must be before the sale date.</p>;
  } else if (!result) {
    headline = <p className="sub">Enter the dates, the price paid and the sale price.</p>;
  } else if (!result.longTerm) {
    headline = (
      <>
        <p className="lbl">Short-term gain</p>
        <p className="big tnum">{rupees(Math.max(0, result.plainGain))}</p>
        <p className="sub">
          Held for 24 months or less, so the gain is added to your income and taxed at your slab rates.
        </p>
      </>
    );
    spoken = `Short-term gain ${rupees(Math.max(0, result.plainGain))}, taxed at slab rates.`;
  } else {
    headline = (
      <>
        <p className="lbl">Tax on the gain</p>
        <p className="big tnum">{rupees(result.tax)}</p>
        <p className="sub">
          {result.plainGain <= 0 && result.indexedGain <= 0
            ? 'No gain, so no tax.'
            : result.method === 'indexed'
              ? 'At 20% with indexation, as that is lower.'
              : result.comparisonAvailable
                ? 'At 12.5% without indexation, as that is lower.'
                : 'At 12.5% without indexation.'}{' '}
          Before surcharge and 4% cess.
        </p>
      </>
    );
    spoken = `Tax on the gain ${rupees(result.tax)}, before surcharge and cess.`;
  }

  return (
    <ToolPage tool={TOOL} law="Tax year 2026-27 · Section 197 of the Income-tax Act, 2025">
      <div className="seam panel calc">
        <form className="cin" onSubmit={(event) => event.preventDefault()} aria-label="Capital gains calculator">
          <ChoiceField
            name="cg-seller"
            legend="Who is selling?"
            value={seller}
            onChange={setSeller}
            options={[
              { value: 'resident', label: 'A resident individual or HUF' },
              { value: 'other', label: 'Anyone else' },
            ]}
          />
          <div className="pair">
            <FormField id="cg-bought" label="Date bought">
              <input
                id="cg-bought"
                type="date"
                max={saleDate}
                value={purchaseDate}
                onChange={(event) => setPurchaseDate(event.target.value)}
              />
            </FormField>
            <FormField id="cg-sold" label="Date sold">
              <input
                id="cg-sold"
                type="date"
                min={SALE_FROM}
                max={SALE_TO}
                value={saleDate}
                onChange={(event) => setSaleDate(event.target.value)}
              />
            </FormField>
            <MoneyField
              id="cg-cost"
              label={before2001 ? 'Cost, or value on 1 April 2001' : 'Price paid'}
              note={
                before2001
                  ? 'You may use its value on 1 April 2001, but not more than its stamp duty value on that date.'
                  : undefined
              }
              value={cost}
              onChange={setCost}
            />
            <MoneyField id="cg-sale" label="Sale price" value={salePrice} onChange={setSalePrice} />
            <MoneyField
              id="cg-sdv"
              label="Stamp duty value on sale"
              note="Leave blank if it is not more than the price."
              value={stampDutyValue}
              onChange={setStampDutyValue}
            />
            <MoneyField
              id="cg-costs"
              label="Brokerage and other selling costs"
              value={saleCosts}
              onChange={setSaleCosts}
            />
          </div>

          <fieldset className="fld impr">
            <legend>Improvements, such as an added floor</legend>
            {improvements.map((item, index) => (
              <div className="pair" key={index}>
                <FormField id={`cg-imp-year-${index}`} label={`Year paid (improvement ${index + 1})`}>
                  <select
                    id={`cg-imp-year-${index}`}
                    value={item.year}
                    onChange={(event) => updateImprovement(index, { year: event.target.value })}
                  >
                    {YEARS.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </FormField>
                <MoneyField
                  id={`cg-imp-amount-${index}`}
                  label={`Amount (improvement ${index + 1})`}
                  value={item.amount}
                  onChange={(amount) => updateImprovement(index, { amount })}
                />
              </div>
            ))}
            <div className="impr-acts">
              {improvements.length < MAX_IMPROVEMENTS && (
                <button
                  type="button"
                  className="link-btn"
                  onClick={() => setImprovements((list) => [...list, { year: '2015-16', amount: 0 }])}
                >
                  Add an improvement
                </button>
              )}
              {improvements.length > 0 && (
                <button type="button" className="link-btn" onClick={() => setImprovements((list) => list.slice(0, -1))}>
                  Remove the last one
                </button>
              )}
            </div>
          </fieldset>
        </form>

        <Result>
          {headline}
          {result?.longTerm && (
            <dl className="brk">
              <Row
                label={result.stampDutyUsed ? 'Stamp duty value, taken as the price' : 'Sale price'}
                value={rupees(result.consideration)}
              />
              <Row
                className={result.method === 'plain' ? 'least' : undefined}
                label="Gain without indexation"
                value={rupees(result.plainGain)}
              />
              <Row
                className={result.method === 'plain' ? 'least' : undefined}
                label="Tax at 12.5%"
                value={rupees(result.plainTax)}
              />
              {result.comparisonAvailable && (
                <>
                  <Row
                    label={`Indexed cost (× ${result.saleIndex} ÷ ${result.costIndex})`}
                    value={rupees(result.indexedCost + result.indexedImprovements)}
                  />
                  <Row
                    className={result.method === 'indexed' ? 'least' : undefined}
                    label="Gain with indexation"
                    value={rupees(result.indexedGain)}
                  />
                  <Row
                    className={result.method === 'indexed' ? 'least' : undefined}
                    label="Tax at 20%"
                    value={rupees(result.indexedTax)}
                  />
                </>
              )}
            </dl>
          )}
          {result?.longTerm && !result.comparisonAvailable && (
            <p className="nudge">
              {seller === 'resident'
                ? `Bought on or after ${formatLongDate(INDEXATION_CUTOFF)}, so there is no 20%-with-indexation option.`
                : 'The 20%-with-indexation option is only for resident individuals and HUFs.'}
            </p>
          )}
          <p className="nudge">
            Planning to reinvest, or selling with others? <Link to="/contact?subject=income-tax#write">Ask us</Link> to
            work out the exemption and the TDS.
          </p>
          <Announce text={spoken} />
        </Result>
      </div>

      <section className="sec" aria-labelledby="cg-how-heading">
        <div className="sec-h">
          <h2 id="cg-how-heading">How it is worked out</h2>
          <p className="desc">Section 197 of the Income-tax Act, 2025, with sections 72, 78 and 90.</p>
        </div>
        <ul className="needs">
          <li>
            Land or a building held for more than 24 months is long-term. The gain is taxed at 12.5%, without
            indexation.
          </li>
          <li>
            A resident individual or HUF selling land or a building bought before 23 July 2024 pays the lower of that
            and 20% of the gain worked out with indexation. Nothing has to be chosen; the lower figure applies.
          </li>
          <li>
            Indexation raises the cost by the Cost Inflation Index of the year of sale over that of the year of purchase
            (or of 2001-02, for property owned before 1 April 2001). Improvements are indexed from the year they were
            paid for.
          </li>
          <li>If the stamp duty value is more than 110% of the price, the stamp duty value is taken as the price.</li>
          <li>Surcharge, where it applies, is at most 15% on this tax, and 4% cess is added.</li>
        </ul>
      </section>

      <section className="sec" aria-labelledby="cg-save-heading">
        <div className="sec-h">
          <h2 id="cg-save-heading">Saving tax by reinvesting</h2>
        </div>
        <ul className="needs">
          <li>
            <b>A residential house sold, and another bought or built</b> (section 82, formerly 54): within one year
            before or two years after the sale, or built within three years. Two houses can be covered once in a
            lifetime if the gain is not more than ₹2 crore. Cost above ₹10 crore is not counted.
          </li>
          <li>
            <b>Any other long-term asset, such as a plot, and a house bought or built</b> (section 86, formerly 54F):
            exempt in proportion to the net sale price invested, with the same ₹10 crore limit. Not available if you own
            more than one other house on the date of sale.
          </li>
          <li>
            Money not yet reinvested by the return due date goes into a capital gains deposit account, or that part of
            the exemption is lost.
          </li>
          <li>
            <b>Bonds</b> (section 85, formerly 54EC): the gain on land or a building invested within six months, up to
            ₹50 lakh, locked in for five years.
          </li>
          <li>
            The buyer deducts 1% TDS if the price or stamp duty value is ₹50 lakh or more. When the seller is a
            non-resident, buyers usually deduct on the full price unless the seller first obtains a lower deduction
            certificate (Form 128).
          </li>
        </ul>
      </section>

      <section className="sec" aria-labelledby="cg-cii-heading">
        <div className="sec-h">
          <h2 id="cg-cii-heading">Cost Inflation Index</h2>
          <p className="desc">
            Notified under section 72 of the Income-tax Act, 2025, and earlier under section 48 of the 1961 Act. 2001-02
            is the base year.
          </p>
        </div>
        <ul className="cii">
          {[...COST_INFLATION_INDEX].reverse().map((row) => (
            <li key={row.year}>
              <span>{row.year}</span>
              <span className="tnum">{row.index}</span>
            </li>
          ))}
        </ul>
      </section>
    </ToolPage>
  );
};

export default CapitalGainsCalculator;
