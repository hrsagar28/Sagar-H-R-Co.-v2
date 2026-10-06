// GST rates in force on 6 October 2026. From 22 September 2025 (56th GST
// Council; Notification 9/2025-Central Tax (Rate)) goods and services moved to
// 5% and 18%, with 40% for luxury and sin goods. Tobacco and pan masala moved
// from 28% plus cess to 40% (bidis 18%) on 1 February 2026 (Notification
// 19/2025-CT(R)), and compensation cess ended. A few special rates remain.
// The 57th GST Council meeting was reported for 7 October 2026: recheck before
// relying on these after that date.

export const GST_MAIN_RATES = [5, 18, 40];

export const GST_OTHER_RATES: { rate: number; label: string }[] = [
  { rate: 0.25, label: 'rough diamonds and rough precious stones' },
  { rate: 1.5, label: 'cut and polished diamonds' },
  { rate: 3, label: 'gold, silver, platinum and jewellery' },
  { rate: 12, label: 'bricks and earthen roof tiles' },
];
