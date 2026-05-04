import React from 'react';
import type { PageHeroProps } from './types';
import { HeroBasic } from './HeroBasic';
import { HeroSplit } from './HeroSplit';
import { HeroFolio } from './HeroFolio';
import { HeroLedger } from './HeroLedger';
import { HeroFrontispiece } from './HeroFrontispiece';
import { HeroArchive } from './HeroArchive';
import { HeroDirectory } from './HeroDirectory';

export function PageHero(props: PageHeroProps) {
  switch (props.variant) {
    case 'split':
      return <HeroSplit {...props} />;
    case 'folio':
      return <HeroFolio {...props} />;
    case 'ledger':
      return <HeroLedger {...props} />;
    case 'frontispiece':
      return <HeroFrontispiece {...props} />;
    case 'archive':
      return <HeroArchive {...props} />;
    case 'directory':
      return <HeroDirectory {...props} />;
    default:
      return <HeroBasic {...props} />;
  }
}
