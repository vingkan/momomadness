export type Division = 'East' | 'West' | 'North' | 'South';

export interface Restaurant {
  seed: number;
  name: string;
  neighborhood: string;
  division: Division;
  beliScore: number;
  beliRatings: number;
}

export const RESTAURANTS: Restaurant[] = [
  { seed: 1,  name: 'Dumpling Home',           neighborhood: 'Hayes Valley',       division: 'East',  beliScore: 8.4, beliRatings: 17461 },
  { seed: 2,  name: 'Yank Sing',               neighborhood: 'Financial District',  division: 'East',  beliScore: 8.0, beliRatings: 6316  },
  { seed: 4,  name: 'Palette Tea House',        neighborhood: "Fisherman's Wharf",  division: 'East',  beliScore: 7.7, beliRatings: 5338  },
  { seed: 15, name: 'Today Food',              neighborhood: 'Chinatown',           division: 'East',  beliScore: 7.7, beliRatings: 569   },
  { seed: 3,  name: 'Yuanbao Jiaozi',           neighborhood: 'Inner Sunset',       division: 'West',  beliScore: 8.7, beliRatings: 3638  },
  { seed: 9,  name: 'Dumpling Specialist',      neighborhood: 'Parkside',           division: 'West',  beliScore: 7.8, beliRatings: 316   },
  { seed: 10, name: 'Kingdom of Dumpling',      neighborhood: 'Parkside',           division: 'West',  beliScore: 8.1, beliRatings: 652   },
  { seed: 11, name: 'House of Pancakes',        neighborhood: 'Parkside',           division: 'West',  beliScore: 8.1, beliRatings: 1550  },
  { seed: 5,  name: 'Dumpling Story',           neighborhood: 'Pacific Heights',    division: 'North', beliScore: 8.4, beliRatings: 5020  },
  { seed: 7,  name: 'Good Luck Dim Sum',        neighborhood: 'Inner Richmond',     division: 'North', beliScore: 8.1, beliRatings: 1767  },
  { seed: 14, name: 'Dumpling King',            neighborhood: 'Inner Richmond',     division: 'North', beliScore: 7.1, beliRatings: 404   },
  { seed: 16, name: 'Dumpling Baby China Bistro', neighborhood: 'Inner Richmond',  division: 'North', beliScore: 6.6, beliRatings: 227   },
  { seed: 6,  name: 'Dumpling Time',            neighborhood: 'SoMa',               division: 'South', beliScore: 7.5, beliRatings: 3936  },
  { seed: 8,  name: 'bao',                      neighborhood: 'Mission',            division: 'South', beliScore: 7.9, beliRatings: 2706  },
  { seed: 12, name: 'Dumpling Kitchen',         neighborhood: 'Castro',             division: 'South', beliScore: 7.6, beliRatings: 368   },
  { seed: 13, name: 'United Dumplings',         neighborhood: 'Bernal Heights',     division: 'South', beliScore: 7.0, beliRatings: 336   },
];

export function getRestaurantBySeed(seed: number): Restaurant {
  const r = RESTAURANTS.find(r => r.seed === seed);
  if (!r) throw new Error(`No restaurant with seed ${seed}`);
  return r;
}
