const routeWarmers = {
  contact: () => import('../Contact'),
  resources: () => import('../Resources'),
  hraCalculator: () => import('../Resources/HRACalculator'),
  gstCalculator: () => import('../Resources/GSTCalculator'),
  incomeTaxCalculator: () => import('../../components/TaxCalculator'),
} as const;

export type PrefetchRouteName = keyof typeof routeWarmers;

export const prefetchRoute = (route: PrefetchRouteName) => {
  void routeWarmers[route]();
};

export const warmContactRoute = () => {
  prefetchRoute('contact');
};
