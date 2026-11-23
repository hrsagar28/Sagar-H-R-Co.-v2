import React, { useState } from 'react';
import ToolPage from './ToolPage';
import { Announce, ChoiceField, MoneyField, Result, Row, amountEntry } from './fields';
import FormField from '../../components/redesign/FormField';
import {
  FAMILY_AREA_LABEL,
  FAMILY_LEASE_DUTY,
  LEASE_SLABS,
  MAX_YEARLY_INCREASE,
  RESIDENTIAL_SHORT_LEASE_CAP,
  STAMP_DUTY_LAW_AS_AT,
  getResourceTool,
  type FamilyArea,
} from '../../constants/resources';
import { calculateRentStampDuty, type AgreementKind, type PropertyUse } from '../../utils/resources/stampDuty';
import { cleanAmount, rupees } from '../../utils/resources/format';

const TOOL = getResourceTool('rent-agreement-stamp-duty')!;

const termLabel = (months: number) => {
  const years = Math.floor(months / 12);
  const rest = months % 12;
  const parts = [
    years > 0 ? `${years} ${years === 1 ? 'year' : 'years'}` : '',
    rest > 0 ? `${rest} ${rest === 1 ? 'month' : 'months'}` : '',
  ].filter(Boolean);
  return parts.join(' ') || 'Nil';
};

/** Up to two digits as typed, stopping at anything else (1.5 is 1, not 15), without leading zeros. */
const wholeNumber = (text: string) => (/^\d*/.exec(text)?.[0] ?? '').replace(/^0+(?=\d)/, '').slice(0, 2);

const RentStampDutyCalculator: React.FC = () => {
  const [kind, setKind] = useState<AgreementKind>('lease');
  const [use, setUse] = useState<PropertyUse>('residential');
  const [termChoice, setTermChoice] = useState('11');
  const [otherYears, setOtherYears] = useState('');
  const [otherMonths, setOtherMonths] = useState('');
  const [rent, setRent] = useState(0);
  const [escalation, setEscalation] = useState('');
  const [deposit, setDeposit] = useState(0);
  const [other, setOther] = useState(0);
  const [toFamily, setToFamily] = useState<'no' | 'yes'>('no');
  const [area, setArea] = useState<FamilyArea>('city');

  // Typed years and months are added as they stand (18 months is 1 year 6),
  // so a term is never changed behind the visitor's back.
  const months =
    termChoice === 'other' ? (Number(otherYears) || 0) * 12 + (Number(otherMonths) || 0) : Number(termChoice);
  const multiYear = months > 12;
  const family = kind === 'lease' && toFamily === 'yes' ? area : null;
  const escalationRate = Math.min(MAX_YEARLY_INCREASE, Number(escalation) || 0);
  const result = calculateRentStampDuty({
    kind,
    use,
    months,
    monthlyRent: rent,
    escalation: multiYear ? escalationRate : 0,
    deposit,
    otherAdvance: other,
    family,
  });
  const entered = rent + deposit + other > 0 || family !== null;

  const entries: [string, string][] = entered
    ? [
        ['Agreement', kind === 'lease' ? 'Lease or rent agreement' : 'Leave and licence'],
        ['Property', use === 'residential' ? 'Residential' : 'Commercial or industrial'],
        ['Term', termLabel(months)],
        ...amountEntry('Rent, a month', rent),
        ...(multiYear && escalationRate > 0 ? [['Yearly increase', `${escalationRate}%`] as [string, string]] : []),
        ...amountEntry('Security deposit', deposit),
        ...amountEntry('Premium, fine or advance rent', other),
        ...(family ? [['Lease to a close family member', FAMILY_AREA_LABEL[family]] as [string, string]] : []),
      ]
    : [];

  const slabLabel = LEASE_SLABS.find((slab) => slab.slab === result.slab)?.label;

  return (
    <ToolPage
      tool={TOOL}
      law="Article 30 (lease) and Article 32-A (leave and licence), Karnataka Stamp Act, 1957"
      asAt={STAMP_DUTY_LAW_AS_AT}
    >
      <div className="seam panel calc">
        <form className="cin" onSubmit={(event) => event.preventDefault()} aria-label="Stamp duty calculator">
          <ChoiceField
            name="sd-kind"
            legend="The agreement is a"
            value={kind}
            onChange={setKind}
            options={[
              { value: 'lease', label: 'Lease or rent agreement' },
              { value: 'licence', label: 'Leave and licence' },
            ]}
          />
          <ChoiceField
            name="sd-use"
            legend="The property is"
            value={use}
            onChange={setUse}
            options={[
              { value: 'residential', label: 'Residential' },
              { value: 'commercial', label: 'Commercial or industrial' },
            ]}
          />
          <ChoiceField
            name="sd-term"
            legend="Term of the agreement"
            value={termChoice}
            onChange={setTermChoice}
            options={[
              { value: '11', label: '11 months' },
              { value: '12', label: '1 year' },
              { value: '36', label: '3 years' },
              { value: '60', label: '5 years' },
              { value: 'other', label: 'Other' },
            ]}
          />
          {termChoice === 'other' && (
            <div className="pair">
              <FormField id="sd-years" label="Term, years">
                <input
                  id="sd-years"
                  inputMode="numeric"
                  autoComplete="off"
                  value={otherYears}
                  onChange={(event) => setOtherYears(wholeNumber(event.target.value))}
                />
              </FormField>
              <FormField id="sd-months" label="Term, months">
                <input
                  id="sd-months"
                  inputMode="numeric"
                  autoComplete="off"
                  value={otherMonths}
                  onChange={(event) => setOtherMonths(wholeNumber(event.target.value))}
                />
              </FormField>
            </div>
          )}
          <div className="pair">
            <MoneyField
              id="sd-rent"
              label="Rent, a month"
              note={multiYear ? 'The first year’s rent.' : undefined}
              value={rent}
              onChange={setRent}
            />
            {multiYear && (
              <FormField id="sd-escalation" label={`Yearly increase in rent, % (up to ${MAX_YEARLY_INCREASE})`}>
                <input
                  id="sd-escalation"
                  inputMode="decimal"
                  autoComplete="off"
                  value={escalation}
                  placeholder="0"
                  onChange={(event) => {
                    const next = cleanAmount(event.target.value, 3);
                    setEscalation(Number(next) > MAX_YEARLY_INCREASE ? String(MAX_YEARLY_INCREASE) : next);
                  }}
                />
              </FormField>
            )}
            <MoneyField
              id="sd-deposit"
              label="Security deposit"
              note="Refundable or adjustable, it is counted."
              value={deposit}
              onChange={setDeposit}
            />
            <MoneyField
              id="sd-other"
              label="Premium, fine or advance rent"
              note="Any other amount paid for the lease, not the deposit above."
              value={other}
              onChange={setOther}
            />
          </div>
          {kind === 'lease' && (
            <ChoiceField
              name="sd-family"
              legend="Is the tenant the owner’s spouse, parent, child, brother or sister?"
              value={toFamily}
              onChange={setToFamily}
              options={[
                { value: 'no', label: 'No' },
                { value: 'yes', label: 'Yes' },
              ]}
            />
          )}
          {family !== null && (
            <ChoiceField
              name="sd-area"
              legend="Where is the property?"
              value={area}
              onChange={setArea}
              options={(Object.keys(FAMILY_AREA_LABEL) as FamilyArea[]).map((key) => ({
                value: key,
                label: FAMILY_AREA_LABEL[key],
              }))}
            />
          )}
        </form>

        <Result entries={entries}>
          <p className="lbl">Stamp duty</p>
          <p className="big tnum">{entered && result.computed ? rupees(result.duty) : '—'}</p>
          {entered && result.computed && slabLabel && (
            <p className="sub">
              {slabLabel}
              {result.basis !== 'family' && <>, at {result.rate}%</>}
            </p>
          )}
          {entered && result.computed && result.basis !== 'family' && (
            <dl className="brk">
              <Row
                label={months <= 12 ? 'Rent for the term' : 'Average annual rent'}
                value={rupees(result.averageAnnualRent)}
              />
              {deposit > 0 && <Row label="Security deposit" value={rupees(deposit)} />}
              {other > 0 && <Row label="Premium, fine or advance rent" value={rupees(other)} />}
              <Row label="Amount the duty is charged on" value={rupees(result.chargeable)} />
              <Row label={`${result.rate}% of it`} value={rupees(Math.ceil((result.chargeable * result.rate) / 100))} />
            </dl>
          )}
          {entered && result.basis === 'capped' && (
            <p className="nudge">
              A residential agreement for up to a year pays at most {rupees(RESIDENTIAL_SHORT_LEASE_CAP)}.
            </p>
          )}
          {entered && result.basis === 'minimum' && (
            <p className="nudge">This is the least a leave and licence agreement of this term pays.</p>
          )}
          {result.basis === 'family' && family && (
            <p className="nudge">
              A lease to a close family member pays a fixed duty of {rupees(FAMILY_LEASE_DUTY[family])} where the
              property is, whatever the rent and the term. This can be more than the ordinary duty on a short lease.
            </p>
          )}
          {entered && result.computed && result.mustRegister && (
            <p className="nudge">
              A lease for more than a year must be registered with the Sub-Registrar, and the registration fee is
              payable on top.
            </p>
          )}
          {!result.computed && months > 0 && (
            <p className="nudge">
              Beyond 30 years the duty is the same as on a sale deed, on the market value of the property where it is
              higher. That needs the guidance value, so this calculator stops at 30 years.
            </p>
          )}
          {months === 0 && <p className="nudge">Enter the term of the agreement in years and months.</p>}
          <Announce
            text={
              entered && result.computed
                ? `Stamp duty ${rupees(result.duty)}.`
                : months > 0 && !result.computed
                  ? 'Over 30 years: not worked out here.'
                  : ''
            }
          />
        </Result>
      </div>

      <section className="sec" aria-labelledby="sd-how-heading">
        <div className="sec-h">
          <h2 id="sd-how-heading">How it is worked out</h2>
          <p className="desc">Article 30 of the Schedule to the Karnataka Stamp Act, 1957.</p>
        </div>
        <ul className="needs">
          <li>
            The duty is charged on the average annual rent plus the security deposit, any premium or fine, and any rent
            paid in advance. The Act counts the deposit whether it is refundable or adjusted against the rent.
          </li>
          <li>
            The average annual rent is the rent for the whole term divided by the number of years. With a yearly
            increase, it is the average, not the first year’s rent. For a term of up to a year, it is the rent for the
            term.
          </li>
          <li>
            Up to a year: 0.5%, at most {rupees(RESIDENTIAL_SHORT_LEASE_CAP)} for a residential property, with no limit
            for a commercial one. Over a year, the same for both: 1% up to 10 years, 2% up to 20, 3% up to 30.
          </li>
          <li>The rate is applied for every ₹100 or part of it, so the amount is rounded up to the next ₹100.</li>
        </ul>
      </section>

      <section className="sec band" aria-labelledby="sd-know-heading">
        <div className="sec-h">
          <h2 id="sd-know-heading">Good to know</h2>
        </div>
        <ul className="needs">
          <li>
            Unless the agreement says otherwise, the tenant pays the stamp duty. It is paid before or when the agreement
            is signed, by e-stamp, such as the digital e-stamp on Kaveri 2.0.
          </li>
          <li>
            An agreement that is not stamped enough can be impounded when it is produced, and a penalty is charged on
            top of the duty short paid.
          </li>
          <li>
            A leave and licence agreement pays the same rates, with a minimum duty of ₹50 to ₹300 depending on the term,
            except a residential one for up to a year.
          </li>
          <li>
            If an agreement to lease was stamped as a lease, the lease signed under it later pays no more than ₹50.
          </li>
        </ul>
      </section>
    </ToolPage>
  );
};

export default RentStampDutyCalculator;
