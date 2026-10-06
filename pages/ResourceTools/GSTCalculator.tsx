import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import ToolPage from './ToolPage';
import { Announce, ChoiceField, MoneyField, Result, Row } from './fields';
import FormField from '../../components/redesign/FormField';
import { GST_MAIN_RATES, GST_OTHER_RATES, getResourceTool } from '../../constants/resources';
import { calculateGst, type GstDirection, type SupplyPlace } from '../../utils/resources/gst';
import { cleanAmount, rupeesPaise } from '../../utils/resources/format';

const TOOL = getResourceTool('gst-calculator')!;

const RATE_OPTIONS = [
  ...GST_MAIN_RATES.map((rate) => ({ value: String(rate), label: `${rate}%` })),
  { value: 'other', label: 'Other' },
];

const GSTCalculator: React.FC = () => {
  const [amount, setAmount] = useState(0);
  const [direction, setDirection] = useState<GstDirection>('add');
  const [rateChoice, setRateChoice] = useState('18');
  const [otherRate, setOtherRate] = useState('3');
  const [place, setPlace] = useState<SupplyPlace>('same-state');

  const rate = rateChoice === 'other' ? Math.min(100, Number(otherRate) || 0) : Number(rateChoice);
  const result = calculateGst(amount, rate, direction, place);
  const sameState = place === 'same-state';

  return (
    <ToolPage tool={TOOL} law="GST rates in force from 22 September 2025, including the changes from 1 February 2026">
      <div className="seam panel calc">
        <form className="cin" onSubmit={(event) => event.preventDefault()} aria-label="GST calculator">
          <MoneyField id="gst-amount" label="Amount" value={amount} onChange={setAmount} />
          <ChoiceField
            name="gst-direction"
            legend="The amount is"
            value={direction}
            onChange={setDirection}
            options={[
              { value: 'add', label: 'Before GST' },
              { value: 'remove', label: 'Including GST' },
            ]}
          />
          <ChoiceField
            name="gst-rate"
            legend="GST rate"
            value={rateChoice}
            onChange={setRateChoice}
            options={RATE_OPTIONS}
          />
          {rateChoice === 'other' && (
            <FormField id="gst-other-rate" label="Rate in per cent">
              <input
                id="gst-other-rate"
                inputMode="decimal"
                autoComplete="off"
                value={otherRate}
                onChange={(event) => setOtherRate(cleanAmount(event.target.value))}
              />
            </FormField>
          )}
          <ChoiceField
            name="gst-place"
            legend="The buyer is"
            value={place}
            onChange={setPlace}
            options={[
              { value: 'same-state', label: 'In the same state' },
              { value: 'other-state', label: 'In another state, or an SEZ unit' },
            ]}
          />
        </form>

        <Result>
          <p className="lbl">{direction === 'add' ? 'Price including GST' : 'Price before GST'}</p>
          <p className="big tnum">{rupeesPaise(direction === 'add' ? result.total : result.taxable)}</p>
          <dl className="brk">
            <Row label="Value before GST" value={rupeesPaise(result.taxable)} />
            {sameState ? (
              <>
                <Row label={`CGST at ${rate / 2}%`} value={rupeesPaise(result.cgst)} />
                <Row label={`SGST at ${rate / 2}%`} value={rupeesPaise(result.sgst)} />
              </>
            ) : (
              <Row label={`IGST at ${rate}%`} value={rupeesPaise(result.igst)} />
            )}
            <Row className="tot" label="Total GST" value={rupeesPaise(result.gst)} />
            <Row className="tot" label="Price including GST" value={rupeesPaise(result.total)} />
          </dl>
          <p className="nudge">
            Unsure of the rate for your goods or services? <Link to="/contact?subject=gst#write">Ask us</Link>.
          </p>
          <Announce
            text={`GST ${rupeesPaise(result.gst)}. Price before GST ${rupeesPaise(result.taxable)}, including GST ${rupeesPaise(result.total)}.`}
          />
        </Result>
      </div>

      <section className="sec" aria-labelledby="gst-rates-heading">
        <div className="sec-h">
          <h2 id="gst-rates-heading">The rates</h2>
          <p className="desc">The rate depends on the goods or service, by its HSN or SAC code.</p>
        </div>
        <ul className="needs">
          <li>
            <b>5%</b> for many everyday goods and services, and <b>18%</b> as the standard rate, since 22 September
            2025. Most items at the old 12% and 28% rates moved to these.
          </li>
          <li>
            <b>40%</b> for luxury and sin goods. Tobacco products and pan masala moved to 40% on 1 February 2026 (bidis
            to 18%), and compensation cess ended.
          </li>
          <li>
            A few special rates remain:{' '}
            {GST_OTHER_RATES.map((item, index) => (
              <React.Fragment key={item.rate}>
                {index > 0 && (index === GST_OTHER_RATES.length - 1 ? ' and ' : ', ')}
                <b>{item.rate}%</b> for {item.label}
              </React.Fragment>
            ))}
            .
          </li>
          <li>Some goods and services are exempt or nil-rated.</li>
        </ul>
      </section>

      <section className="sec" aria-labelledby="gst-split-heading">
        <div className="sec-h">
          <h2 id="gst-split-heading">CGST, SGST or IGST</h2>
        </div>
        <ul className="needs">
          <li>Within a state, the tax is split equally into CGST and SGST: 18% is charged as 9% CGST and 9% SGST.</li>
          <li>
            In a Union territory without its own legislature, such as Chandigarh or Ladakh, it is CGST and UTGST
            instead.
          </li>
          <li>
            Between states, on imports, and on supplies to or by an SEZ unit, it is charged as IGST at the full rate.
            Exports are zero-rated.
          </li>
        </ul>
      </section>
    </ToolPage>
  );
};

export default GSTCalculator;
