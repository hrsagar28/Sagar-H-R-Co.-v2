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
    case 'split':        return <HeroSplit {...(props as any)} />;
    case 'folio':        return <HeroFolio {...(props as any)} />;
    case 'ledger':       return <HeroLedger {...(props as any)} />;
    case 'frontispiece': return <HeroFrontispiece {...(props as any)} />;
    case 'archive':      return <HeroArchive {...(props as any)} />;
    case 'directory':    return <HeroDirectory {...(props as any)} />;
    default:             return <HeroBasic {...(props as any)} />;
  }
}
