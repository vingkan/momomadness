export type Division = "East" | "West" | "North" | "South";

export interface Restaurant {
  seed: number;
  name: string;
  neighborhood: string;
  division: Division;
  beliRatings: number;
  infatuationScore?: number;
  infatuationLink?: string;
  menuItemA?: string;
  menuItemB?: string;
  address?: string;
  coordinates?: { lat: number; lng: number };
  substitutedFor?: string;
  replacedBy?: {
    replacementSeed: number;
    startingInRound: 'r16' | 'qf' | 'sf' | 'final';
  };
}

export const RESTAURANTS: Restaurant[] = [
  {
    seed: 1,
    name: "Dumpling Home",
    neighborhood: "Hayes Valley",
    division: "East",
    beliRatings: 17461,
    infatuationScore: 8.8,
    infatuationLink:
      "https://www.theinfatuation.com/san-francisco/reviews/dumpling-home",
    menuItemA: "Juicy Pork Bao (P)",
    menuItemB: "Vegetable Bao (V)",
    address: "298 Gough St, San Francisco, CA 94102",
    coordinates: { lat: 37.7754, lng: -122.4224 },
  },
  {
    seed: 2,
    name: "Hon's Wun-Tun House",
    neighborhood: "Chinatown",
    division: "East",
    beliRatings: 2634,
    infatuationScore: 8.3,
    infatuationLink:
      "https://www.theinfatuation.com/san-francisco/reviews/hons-wun-tun-house",
    menuItemA: "Pan-Fried Pork Soup Dumpling (P)",
    menuItemB: "Vegetarian Dumpling (V)",
    address: "733 Washington St, San Francisco, CA 94108",
    coordinates: { lat: 37.7951, lng: -122.4061 },
    substitutedFor: "Yank Sing",
  },
  {
    seed: 4,
    name: "Palette Tea House",
    neighborhood: "Fisherman's Wharf",
    division: "East",
    beliRatings: 5338,
    infatuationScore: 8.2,
    infatuationLink:
      "https://www.theinfatuation.com/san-francisco/reviews/palette-tea-house",
    menuItemA: "Sichuan Seafood Dumpling (S)",
    menuItemB: "Crystal Jade Vegetarian Dumpling (V)",
    address: "900 North Point St, San Francisco, CA 94109",
    coordinates: { lat: 37.8065, lng: -122.4215 },
  },
  {
    seed: 15,
    name: "Today Food",
    neighborhood: "Chinatown",
    division: "East",
    beliRatings: 569,
    infatuationScore: 8.2,
    infatuationLink:
      "https://www.theinfatuation.com/san-francisco/reviews/today-food",
    menuItemA: "Pork And Cabbage Dumplings (P)",
    menuItemB: "Veggie Dumplings (V)",
    address: "601 Kearny St, San Francisco, CA 94108",
    coordinates: { lat: 37.7936, lng: -122.4047 },
  },
  {
    seed: 3,
    name: "Yuanbao Jiaozi",
    neighborhood: "Inner Sunset",
    division: "West",
    beliRatings: 3638,
    infatuationScore: 9.2,
    infatuationLink:
      "https://www.theinfatuation.com/san-francisco/reviews/yuanbao-jiaozi",
    menuItemA: "Shitake Mushroom and Sole Fish Dumpling (F)",
    menuItemB: "Chicken And Corn Dumpling (C)",
    address: "2110 Irving St, San Francisco, CA 94122",
    coordinates: { lat: 37.7637, lng: -122.4795 },
  },
  {
    seed: 9,
    name: "Dumpling Specialist",
    neighborhood: "Parkside",
    division: "West",
    beliRatings: 316,
    infatuationScore: 8.4,
    infatuationLink:
      "https://www.theinfatuation.com/san-francisco/reviews/dumpling-specialist",
    menuItemA: "Shanghai Dumpling (P, S)",
    menuItemB: "Vegetarian Potsticker (V)",
    address: "1123 Taraval St, San Francisco, CA 94116",
    coordinates: { lat: 37.7432, lng: -122.475 },
    replacedBy: { replacementSeed: 11, startingInRound: 'sf' },
  },
  {
    seed: 10,
    name: "Kingdom of Dumpling",
    neighborhood: "Parkside",
    division: "West",
    beliRatings: 652,
    infatuationScore: 8.0,
    infatuationLink:
      "https://www.theinfatuation.com/san-francisco/reviews/kingdom-of-dumpling",
    menuItemA: "Lamb Dumpling with Chinese Vegetable (L)",
    menuItemB: "Baby Bok Choy & Mushroom Dumplings (V)",
    address: "1713 Taraval St, San Francisco, CA 94116",
    coordinates: { lat: 37.7432, lng: -122.4843 },
  },
  {
    seed: 11,
    name: "House of Pancakes",
    neighborhood: "Parkside",
    division: "West",
    beliRatings: 1550,
    infatuationScore: 7.9,
    infatuationLink:
      "https://www.theinfatuation.com/san-francisco/reviews/house-of-pancakes",
    menuItemA: "Pork Dumpling w/ Chives (P)",
    menuItemB: "Vegetable Potsticker (V)",
    address: "937 Taraval St, San Francisco, CA 94116",
    coordinates: { lat: 37.7432, lng: -122.4709 },
  },
  {
    seed: 5,
    name: "Dumpling Story",
    neighborhood: "Pacific Heights",
    division: "North",
    beliRatings: 5020,
    infatuationScore: 8.4,
    infatuationLink:
      "https://www.theinfatuation.com/san-francisco/reviews/dumpling-story",
    menuItemA: "Gong Bao Chicken Dumpling (C)",
    menuItemB: "Mongolian Beef Dumpling (B)",
    address: "2114 Fillmore St, San Francisco, CA 94115",
    coordinates: { lat: 37.7893, lng: -122.4348 },
  },
  {
    seed: 7,
    name: "Cinderella Bakery & Cafe",
    neighborhood: "Inner Richmond",
    division: "North",
    beliRatings: 2047,
    infatuationScore: 8.3,
    infatuationLink:
      "https://www.theinfatuation.com/san-francisco/reviews/cinderella-bakery-cafe",
    menuItemA: "Pan Fried Chicken Pelmeni (C)",
    menuItemB: "Potato Vareniki (V)",
    address: "436 Balboa St, San Francisco, CA 94118",
    coordinates: { lat: 37.7775, lng: -122.4612 },
    substitutedFor: "Good Luck Dim Sum",
  },
  {
    seed: 14,
    name: "Dumpling King",
    neighborhood: "Inner Richmond",
    division: "North",
    beliRatings: 404,
    infatuationScore: 8.3,
    infatuationLink:
      "https://www.theinfatuation.com/san-francisco/reviews/dumpling-king-clement-st",
    menuItemA: "Juicy Pan Fried Kurobuta Pork Bao (P)",
    menuItemB: "Impossible Dumpling (V)",
    address: "336 Clement St, San Francisco, CA 94118",
    coordinates: { lat: 37.782, lng: -122.4568 },
  },
  {
    seed: 16,
    name: "Dumpling Baby China Bistro",
    neighborhood: "Inner Richmond",
    division: "North",
    beliRatings: 227,
    infatuationLink:
      "https://www.theinfatuation.com/san-francisco/reviews/dumpling-baby",
    menuItemA: "Dumplings in Chili Oil Sauce (C)",
    menuItemB: "Vegetable Potsticker (V)",
    address: "3751 Geary Blvd, San Francisco, CA 94118",
    coordinates: { lat: 37.7811, lng: -122.4599 },
  },
  {
    seed: 6,
    name: "Dumpling Time",
    neighborhood: "SoMa",
    division: "South",
    beliRatings: 3936,
    infatuationScore: 7.9,
    infatuationLink:
      "https://www.theinfatuation.com/san-francisco/reviews/dumpling-time",
    menuItemA: "Boiled Lamb Dumpling (L)",
    menuItemB: "Boiled Vegetable Dumpling (V)",
    address: "11 Division St, San Francisco, CA 94103",
    coordinates: { lat: 37.7692, lng: -122.4107 },
  },
  {
    seed: 8,
    name: "Bao",
    neighborhood: "Mission",
    division: "South",
    beliRatings: 2706,
    menuItemA: "Bi Feng Tang Har Gow (S)",
    menuItemB: "Pan Fried Vegetarian Pot Sticker (V)",
    address: "590 Valencia St, San Francisco, CA 94110",
    coordinates: { lat: 37.7634, lng: -122.4217 },
  },
  {
    seed: 12,
    name: "Dumpling Kitchen",
    neighborhood: "Castro",
    division: "South",
    beliRatings: 368,
    infatuationLink:
      "https://www.theinfatuation.com/san-francisco/reviews/dumpling-kitchen-castro",
    menuItemA: "Pork & Napa Cabbage Potsticker (P)",
    menuItemB: "Vegetarian Potsticker (V)",
    address: "544 Castro St, San Francisco, CA 94114",
    coordinates: { lat: 37.7607, lng: -122.435 },
  },
  {
    seed: 13,
    name: "United Dumplings",
    neighborhood: "Bernal Heights",
    division: "South",
    beliRatings: 336,
    infatuationScore: 7.7,
    infatuationLink:
      "https://www.theinfatuation.com/san-francisco/reviews/united-dumplings",
    menuItemA: "Korean BBQ Beef Dumplings (B)",
    menuItemB: "Vegetarian Dumpling (V)",
    address: "525 Cortland Ave, San Francisco, CA 94110",
    coordinates: { lat: 37.7394, lng: -122.4168 },
  },
];

export function getRestaurantBySeed(seed: number): Restaurant {
  const r = RESTAURANTS.find((r) => r.seed === seed);
  if (!r) throw new Error(`No restaurant with seed ${seed}`);
  return r;
}
