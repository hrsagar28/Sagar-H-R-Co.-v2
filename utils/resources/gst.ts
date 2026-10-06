import { toPaise } from './format';

export type GstDirection = 'add' | 'remove';
export type SupplyPlace = 'same-state' | 'other-state';

export interface GstResult {
  /** Value before GST. */
  taxable: number;
  gst: number;
  total: number;
  cgst: number;
  sgst: number;
  igst: number;
}

/**
 * GST on an amount at a rate in per cent. "add" treats the amount as the price
 * before GST; "remove" treats it as the price including GST. Within a state
 * the tax is split equally into CGST and SGST (CGST + UTGST in a Union
 * territory without a legislature); otherwise it is IGST.
 */
export const calculateGst = (
  amount: number,
  ratePercent: number,
  direction: GstDirection,
  place: SupplyPlace,
): GstResult => {
  const rate = ratePercent / 100;
  const taxable = toPaise(direction === 'add' ? amount : amount / (1 + rate));
  const gst = toPaise(direction === 'add' ? amount * rate : amount - taxable);
  const total = toPaise(taxable + gst);
  if (place === 'other-state') {
    return { taxable, gst, total, cgst: 0, sgst: 0, igst: gst };
  }
  const cgst = toPaise(gst / 2);
  return { taxable, gst, total, cgst, sgst: toPaise(gst - cgst), igst: 0 };
};
