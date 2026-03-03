export type Division = 'East' | 'West' | 'North' | 'South';

export interface Restaurant {
  seed: number;
  name: string;
  neighborhood: string;
  division: Division;
  beliScore: number;
  beliRatings: number;
  menuItemA?: string;
  menuItemB?: string;
  address?: string;
  coordinates?: { lat: number; lng: number };
}

export const RESTAURANTS: Restaurant[] = [
  { seed: 1,  name: 'Dumpling Home',              neighborhood: 'Hayes Valley',       division: 'East',  beliScore: 8.4, beliRatings: 17461, menuItemA: 'Juicy Pork Bao (P)',                        menuItemB: 'Vegetable Bao (V)',                          address: '298 Gough St, San Francisco, CA 94102',           coordinates: { lat: 37.7754, lng: -122.4224 } },
  { seed: 2,  name: 'Yank Sing',                  neighborhood: 'Financial District',  division: 'East',  beliScore: 8.0, beliRatings: 6316,  menuItemA: 'Shrimp Dumpling (S)',                       menuItemB: 'Mushroom Dumpling (V)',                       address: '101 Spear St, San Francisco, CA 94105',           coordinates: { lat: 37.7928, lng: -122.3919 } },
  { seed: 4,  name: 'Palette Tea House',           neighborhood: "Fisherman's Wharf",  division: 'East',  beliScore: 7.7, beliRatings: 5338,  menuItemA: 'Sichuan Seafood Dumpling (S)',               menuItemB: 'Crystal Jade Vegetarian Dumpling (V)',        address: '900 North Point St, San Francisco, CA 94109',     coordinates: { lat: 37.8065, lng: -122.4215 } },
  { seed: 15, name: 'Today Food',                 neighborhood: 'Chinatown',           division: 'East',  beliScore: 7.7, beliRatings: 569,   menuItemA: 'Pork And Cabbage Dumplings (P)',             menuItemB: 'Veggie Dumplings (V)',                        address: '601 Kearny St, San Francisco, CA 94108',          coordinates: { lat: 37.7960, lng: -122.4050 } },
  { seed: 3,  name: 'Yuanbao Jiaozi',              neighborhood: 'Inner Sunset',       division: 'West',  beliScore: 8.7, beliRatings: 3638,  menuItemA: 'Napa Cabbage And Pork Dumpling (P)',         menuItemB: 'Chicken And Corn Dumpling (C)',               address: '2110 Irving St, San Francisco, CA 94122',         coordinates: { lat: 37.7637, lng: -122.4795 } },
  { seed: 9,  name: 'Dumpling Specialist',         neighborhood: 'Parkside',           division: 'West',  beliScore: 7.8, beliRatings: 316,   menuItemA: 'Shanghai Dumpling (P, S)',                   menuItemB: 'Vegetarian Potsticker (V)',                   address: '1123 Taraval St, San Francisco, CA 94116',        coordinates: { lat: 37.7432, lng: -122.4750 } },
  { seed: 10, name: 'Kingdom of Dumpling',         neighborhood: 'Parkside',           division: 'West',  beliScore: 8.1, beliRatings: 652,   menuItemA: 'Pork Dumpling With Napa Cabbage (P)',        menuItemB: 'Baby Bok Choy & Mushroom Dumplings (V)',      address: '1713 Taraval St, San Francisco, CA 94116',        coordinates: { lat: 37.7432, lng: -122.4843 } },
  { seed: 11, name: 'House of Pancakes',           neighborhood: 'Parkside',           division: 'West',  beliScore: 8.1, beliRatings: 1550,  menuItemA: 'Pork Dumpling w/ Chives (P)',                menuItemB: 'Vegetable Dumpling (V)',                      address: '937 Taraval St, San Francisco, CA 94116',         coordinates: { lat: 37.7432, lng: -122.4709 } },
  { seed: 5,  name: 'Dumpling Story',              neighborhood: 'Pacific Heights',    division: 'North', beliScore: 8.4, beliRatings: 5020,  menuItemA: 'Gong Bao Chicken Dumpling (C)',              menuItemB: 'Mongolian Beef Dumpling (B)',                  address: '2114 Fillmore St, San Francisco, CA 94115',       coordinates: { lat: 37.7893, lng: -122.4348 } },
  { seed: 7,  name: 'Good Luck Dim Sum',           neighborhood: 'Inner Richmond',     division: 'North', beliScore: 8.1, beliRatings: 1767,  menuItemA: 'Deep Fried Stuffed Dumpling (P, S)',         menuItemB: 'Shark Fin Dumpling (S)',                      address: '736 Clement St, San Francisco, CA 94118',         coordinates: { lat: 37.7820, lng: -122.4660 } },
  { seed: 14, name: 'Dumpling King',               neighborhood: 'Inner Richmond',     division: 'North', beliScore: 7.1, beliRatings: 404,   menuItemA: 'Juicy Pan Fried Kurobuta Pork Bao (P)',      menuItemB: 'Impossible Dumpling (V)',                      address: '336 Clement St, San Francisco, CA 94118',         coordinates: { lat: 37.7820, lng: -122.4568 } },
  { seed: 16, name: 'Dumpling Baby China Bistro',  neighborhood: 'Inner Richmond',     division: 'North', beliScore: 6.6, beliRatings: 227,                                                                                                                             address: '3751 Geary Blvd, San Francisco, CA 94118',        coordinates: { lat: 37.7818, lng: -122.4962 } },
  { seed: 6,  name: 'Dumpling Time',               neighborhood: 'SoMa',               division: 'South', beliScore: 7.5, beliRatings: 3936  },
  { seed: 8,  name: 'bao',                         neighborhood: 'Mission',            division: 'South', beliScore: 7.9, beliRatings: 2706  },
  { seed: 12, name: 'Dumpling Kitchen',            neighborhood: 'Castro',             division: 'South', beliScore: 7.6, beliRatings: 368   },
  { seed: 13, name: 'United Dumplings',            neighborhood: 'Bernal Heights',     division: 'South', beliScore: 7.0, beliRatings: 336   },
];

export function getRestaurantBySeed(seed: number): Restaurant {
  const r = RESTAURANTS.find(r => r.seed === seed);
  if (!r) throw new Error(`No restaurant with seed ${seed}`);
  return r;
}
