import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import ToolPage from './ToolPage';
import { Announce, ChoiceField, MoneyField, Result, Row, amountEntry } from './fields';
import FormField from '../../components/redesign/FormField';
import {
  COST_INFLATION_INDEX,
  FMV_DATE,
  INDEXATION_CUTOFF,
  PROPERTY_SALE_FROM,
  PROPERTY_SALE_TO,
  getResourceTool,
} from '../../constants/resources';
import {
  calculatePropertyGain,
  improvementYears,
  indexedAmount,
  type Improvement,
} from '../../utils/resources/capitalGains';
import { rupees } from '../../utils/resources/format';
import { todayIso } from '../../utils/resources/dates';
import { formatLongDate } from '../../utils/insightDates';

const TOOL = getResourceTool('capital-gains-calculator')!;

const defaultSaleDate = () => {
  const now = todayIso();
  return now >= PROPERTY_SALE_FROM && now <= PROPERTY_SALE_TO ? now : PROPERTY_SALE_TO;
};

const CII_YEARS = COST_INFLATION_INDEX.map((row) => row.year);
const LATEST_CII_YEAR = CII_YEARS[CII_YEARS.length - 1] ?? '2026-27';
const MAX_IMPROVEMENTS = 3;
const CUTOFF_TEXT = formatLongDate(INDEXATION_CUTOFF);

/** "₹5,00,000", or for a negative figure the label's loss form. */
const gainRow = (label: string, value: number) =>
  value < 0 ? { label: label.replace('Gain', 'Loss'), value: rupees(-value) } : { label, value: rupees(value) };

const LOSS_NOTE =
  'A capital loss can be set off only against capital gains (a long-term loss only against long-term gains), and carried forward for eight years if the return is filed by its due date.';

/** Indexed cost of any amount between two years, for use outside the calculator above. */
const IndexedCostBox: React.FC = () => {
  const [amount, setAmount] = useState(0);
  const [from, setFrom] = useState('2010-11');
  const [to, setTo] = useState(LATEST_CII_YEAR);
  const result = indexedAmount(amount, from, to);
  const valid = Boolean(result) && from <= to;

  return (
    <div className="ixbox">
      <p className="lbl">Index an amount</p>
      <div className="ixrow">
        <MoneyField id="ix-amount" label="Amount" value={amount} onChange={setAmount} />
        <FormField id="ix-from" label="Paid in">
          <select id="ix-from" value={from} onChange={(event) => setFrom(event.target.value)}>
            {CII_YEARS.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </FormField>
        <FormField id="ix-to" label="Indexed to">
          <select id="ix-to" value={to} onChange={(event) => setTo(event.target.value)}>
            {CII_YEARS.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </FormField>
      </div>
      <p className="ixout" aria-live="polite">
        {!valid ? (
          'The year it is indexed to must be the same as or after the year it was paid.'
        ) : amount > 0 && result ? (
          <>
            Indexed cost <b className="tnum">{rupees(result.value)}</b>{' '}
            <span className="tnum">
              ({rupees(amount)} × {result.to} ÷ {result.from})
            </span>
          </>
        ) : (
          'Enter an amount to index it.'
        )}
      </p>
    </div>
  );
};

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
  const saleInRange = saleDate >= PROPERTY_SALE_FROM && saleDate <= PROPERTY_SALE_TO;
  // Improvements can only be for the years from the purchase to the sale; a
  // year outside them (after a date changes) shows and counts as the first.
  const years = improvementYears(purchaseDate, saleInRange ? saleDate : PROPERTY_SALE_TO);
  const firstYear = years[0] ?? LATEST_CII_YEAR;
  const counted = improvements.map((item) => (years.includes(item.year) ? item : { ...item, year: firstYear }));

  const result =
    purchaseDate && saleInRange && salePrice > 0
      ? calculatePropertyGain({
          purchaseDate,
          saleDate,
          salePrice,
          stampDutyValue,
          saleCosts,
          cost,
          improvements: counted,
          residentIndividualOrHuf: seller === 'resident',
        })
      : null;

  const updateImprovement = (index: number, change: Partial<Improvement>) =>
    setImprovements((list) => list.map((item, at) => (at === index ? { ...counted[at]!, ...change } : item)));

  // The gain the law takes as income: worked out with indexation for a sale
  // before 23 July 2024, without it otherwise (the 20% working only caps the tax).
  const taxedGain = result
    ? result.longTerm && result.basis === 'indexed'
      ? result.indexedGain
      : result.plainGain
    : 0;
  const lossShown = taxedGain < 0;
  let headline: React.ReactNode;
  let spoken = '';
  if (!saleInRange) {
    headline = <p className="sub">Enter a sale date from 1 April 2024 to 31 March 2027.</p>;
  } else if (purchaseDate && purchaseDate >= saleDate) {
    headline = <p className="sub">The purchase date must be before the sale date.</p>;
  } else if (!result) {
    headline = <p className="sub">Enter the dates, the price paid and the sale price.</p>;
  } else if (!result.longTerm) {
    const loss = result.plainGain < 0;
    headline = (
      <>
        <p className="lbl">{loss ? 'Short-term loss' : 'Short-term gain'}</p>
        <p className="big tnum">{rupees(Math.abs(result.plainGain))}</p>
        <p className="sub">
          {loss
            ? 'Held for 24 months or less.'
            : 'Held for 24 months or less, so the gain is added to your income and taxed at your slab rates.'}
        </p>
      </>
    );
    spoken = loss
      ? `Short-term loss ${rupees(-result.plainGain)}.`
      : `Short-term gain ${rupees(result.plainGain)}, taxed at slab rates.`;
  } else if (lossShown) {
    headline = (
      <>
        <p className="lbl">Long-term loss</p>
        <p className="big tnum">{rupees(-taxedGain)}</p>
        <p className="sub">No tax on this sale.</p>
      </>
    );
    spoken = `Long-term loss ${rupees(-taxedGain)}. No tax on this sale.`;
  } else {
    const noGain = result.tax === 0;
    let how: string;
    if (result.plainGain <= 0 && (result.basis === 'plain' || result.indexedGain <= 0)) {
      how = 'No gain, so no tax.';
    } else if (noGain) {
      how = 'Worked out with indexation there is no gain, so no tax.';
    } else if (result.basis === 'indexed') {
      how = `At 20% with indexation, as the sale was before ${CUTOFF_TEXT}.`;
    } else if (result.basis === 'lower') {
      how =
        result.method === 'indexed'
          ? 'At 20% with indexation, as that is lower.'
          : 'At 12.5% without indexation, as that is lower.';
    } else {
      how = 'At 12.5% without indexation.';
    }
    headline = (
      <>
        <p className="lbl">Tax on the gain</p>
        <p className="big tnum">{rupees(result.tax)}</p>
        <p className="sub">
          {how}
          {noGain ? '' : ' Before surcharge and 4% cess.'}
        </p>
      </>
    );
    spoken = `Tax on the gain ${rupees(result.tax)}. ${how}`;
  }

  const entries: [string, string][] = result
    ? [
        ['Seller', seller === 'resident' ? 'A resident individual or HUF' : 'Not a resident individual or HUF'],
        ['Date bought', formatLongDate(purchaseDate)],
        ['Date sold', formatLongDate(saleDate)],
        ...amountEntry(before2001 ? 'Cost, or value on 1 April 2001' : 'Price paid', cost),
        ...amountEntry('Sale price', salePrice),
        ...amountEntry('Stamp duty value on sale', stampDutyValue),
        ...amountEntry('Brokerage and other selling costs', saleCosts),
        ...counted.flatMap((item, index) => amountEntry(`Improvement ${index + 1}, paid in ${item.year}`, item.amount)),
      ]
    : [];

  const showPlain = result?.longTerm && result.basis !== 'indexed';
  const showIndexed = result?.longTerm && result.basis !== 'plain';
  /** Mark the working that sets the tax, when there is a choice and some tax. */
  const marked = (method: 'plain' | 'indexed') =>
    result?.basis === 'lower' && result.method === method && result.plainGain > 0 ? 'least' : undefined;

  return (
    <ToolPage
      tool={TOOL}
      law="Sales from 1 April 2024 · Section 197 of the Income-tax Act, 2025, and section 112 of the 1961 Act before it"
    >
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
              <p className="fnote" id="cg-bought-note">
                If inherited or a gift, the previous owner’s date, and their cost below.
              </p>
              <input
                id="cg-bought"
                type="date"
                max={saleDate}
                aria-describedby="cg-bought-note"
                value={purchaseDate}
                onChange={(event) => setPurchaseDate(event.target.value)}
              />
            </FormField>
            <FormField id="cg-sold" label="Date sold">
              <input
                id="cg-sold"
                type="date"
                min={PROPERTY_SALE_FROM}
                max={PROPERTY_SALE_TO}
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
            {counted.map((item, index) => (
              <div className="pair" key={index}>
                <FormField id={`cg-imp-year-${index}`} label={`Year paid (improvement ${index + 1})`}>
                  <select
                    id={`cg-imp-year-${index}`}
                    value={item.year}
                    onChange={(event) => updateImprovement(index, { year: event.target.value })}
                  >
                    {years.map((year) => (
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
                  onClick={() => setImprovements((list) => [...list, { year: firstYear, amount: 0 }])}
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

        <Result entries={entries}>
          {headline}
          {result?.longTerm && (
            <dl className="brk">
              <Row
                label={result.stampDutyUsed ? 'Stamp duty value, taken as the price' : 'Sale price'}
                value={rupees(result.consideration)}
              />
              {showPlain && (
                <>
                  <Row className={marked('plain')} {...gainRow('Gain without indexation', result.plainGain)} />
                  <Row className={marked('plain')} label="Tax at 12.5%" value={rupees(result.plainTax)} />
                </>
              )}
              {showIndexed && (
                <>
                  <Row
                    label={`Indexed cost (× ${result.saleIndex} ÷ ${result.costIndex})`}
                    value={rupees(result.indexedCost + result.indexedImprovements)}
                  />
                  <Row className={marked('indexed')} {...gainRow('Gain with indexation', result.indexedGain)} />
                  <Row className={marked('indexed')} label="Tax at 20%" value={rupees(result.indexedTax)} />
                </>
              )}
            </dl>
          )}
          {result?.longTerm && result.basis === 'plain' && (
            <p className="nudge">
              {seller === 'resident'
                ? `Bought on or after ${CUTOFF_TEXT}, so there is no 20%-with-indexation option.`
                : 'The 20%-with-indexation option is only for resident individuals and HUFs.'}
            </p>
          )}
          {lossShown && <p className="nudge">{LOSS_NOTE}</p>}
          {result && !result.newAct && (
            <p className="nudge">A sale before 1 April 2026 falls under section 112 of the Income-tax Act, 1961.</p>
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
          <p className="desc">
            Section 197 of the Income-tax Act, 2025, with sections 72, 78 and 90. For a sale before 1 April 2026, the
            same rules in sections 112, 48, 50C and 55 of the 1961 Act.
          </p>
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
          <li>A sale before {CUTOFF_TEXT} was taxed at 20% with indexation, whoever the seller.</li>
          <li>
            Indexation raises the cost by the Cost Inflation Index of the year of sale over that of the year of purchase
            (or of 2001-02, for property owned before 1 April 2001). Improvements are indexed from the year they were
            paid for.
          </li>
          <li>If the stamp duty value is more than 110% of the price, the stamp duty value is taken as the price.</li>
          <li>Surcharge, where it applies, is at most 15% on this tax, and 4% cess is added.</li>
        </ul>
      </section>

      <section className="sec band" aria-labelledby="cg-save-heading">
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
        <div className="ciiw">
          <IndexedCostBox />
          <ul className="cii">
            {[...COST_INFLATION_INDEX].reverse().map((row) => (
              <li key={row.year}>
                <span>{row.year}</span>
                <span className="tnum">{row.index}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </ToolPage>
  );
};

export default CapitalGainsCalculator;
