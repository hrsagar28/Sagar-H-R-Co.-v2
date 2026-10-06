import React, { Suspense, lazy } from 'react';
import { useParams } from 'react-router-dom';
import RdPageSkeleton from '../components/redesign/RdPageSkeleton';
import NotFound from './NotFound';

// /resources/:tool — one page per Resources tool, each loaded on its own so a
// visitor downloads only the tool they open.

const TOOLS: Record<string, React.LazyExoticComponent<React.FC>> = {
  'income-tax-calculator': lazy(() => import('./ResourceTools/IncomeTaxCalculator')),
  'hra-calculator': lazy(() => import('./ResourceTools/HRACalculator')),
  'capital-gains-calculator': lazy(() => import('./ResourceTools/CapitalGainsCalculator')),
  'gst-calculator': lazy(() => import('./ResourceTools/GSTCalculator')),
  'tds-tcs-rates': lazy(() => import('./ResourceTools/TDSRates')),
  'due-dates': lazy(() => import('./ResourceTools/DueDates')),
  'section-finder': lazy(() => import('./ResourceTools/SectionFinder')),
};

const ResourceTool: React.FC = () => {
  const { tool } = useParams<{ tool: string }>();
  const Page = tool ? TOOLS[tool] : undefined;

  if (!Page) {
    return (
      <NotFound
        title="Tool not found"
        intro="There is no tool at this address. The full list is on the Resources page."
        description="This Resources page does not exist."
      />
    );
  }

  return (
    <Suspense fallback={<RdPageSkeleton />}>
      <Page />
    </Suspense>
  );
};

export default ResourceTool;
