export interface Quote {
  id: number;
  latin: string;
  translation: string;
  author: string;
  icon: string;
  category: 'life' | 'courage' | 'wisdom';
  numeral: string;
}

export interface FilmChapter {
  start: number;
  end: number;
  latin: string;
  translation: string;
  author: string;
}

export type CategoryFilter = 'all' | 'life' | 'courage' | 'wisdom';
