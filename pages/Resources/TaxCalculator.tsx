
import React from 'react';
import TaxCalculatorComponent from '../../components/TaxCalculator';

/**
 * TaxCalculator Page
 * 
 * This page serves as a wrapper for the core TaxCalculator component.
 * All logic is centralized in @/components/TaxCalculator.
 */
const TaxCalculator: React.FC = () => {
  return (
    <div className="w-full">
      <TaxCalculatorComponent />
    </div>
  );
};

export default TaxCalculator;
