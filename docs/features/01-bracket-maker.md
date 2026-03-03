# Bracket Maker

We are hosting Momo Madness, a bracket tournament between 16 Asian dumpling restaurants in San Francisco modeled after the famous college basketball tournament March Madness.

Our first project is to create the landing page and bracket maker on the website for users to predict who will win each matchup of the tournament and share their bracket.

## Requirements

- The landing page is a scrollable multi-section page; clicking "Create Your Bracket" replaces it with the bracket view
  - **Hero section** (100vh): Momo Madness logo, title, subtitle, "Create Your Bracket" CTA button, and a pulsing chevron arrow at the bottom to draw the user below the fold
  - **Restaurant map section** (100vh): full-bleed interactive map of San Francisco showing the location of each restaurant with a colored marker per division (East=burnt orange, West=gold, North=blue, South=green); clicking a marker shows the restaurant name and neighborhood; built with Leaflet + CartoDB DarkMatter (no-labels) tiles — free, no API key required, minimal dark style
  - More sections will be added below the map in future iterations
  - The button should say "Continue Your Bracket" if the user has a saved bracket, otherwise "Create Your Bracket"
  - The site is a single page at `/momomadness/` — there is no separate bracket URL
- Derive the design system, colors, and fonts from the design of the logo and mascot
  - Look at `public/assets/logo/logo.png` for the logo
  - Look at `public/assets/mascot/mascot-dribble.png` for the mascot
- Design all pages on the website to be mobile responsive
  - Users should be able to use this website on desktops of all sizes, tablets, and mobile phones
- In the bracket maker, present the bracket of all 16 teams from `docs/data/restaurants.csv`
  - The CSV file has the following columns for each restaurant:
    - Seed: Seeding in the tournament
    - Restaurant: Name of the restaurant
    - Neighborhood: Area in San Francisco where the restaurant is
    - Division: Which of the four divisions in the brack the restaurant is in: North, East, South, or West
    - Beli Score: Score out of 10 on the Beli app (rough indicator of quality)
    - Beli Ratings: Number of ratings on the Beli app (rough indicator of popularity)
    - Address: Street address of the restaurant (collected but not yet displayed in the UI)
    - Menu Item A: First representative dish entered for the tournament
    - Menu Item B: Second representative dish entered for the tournament
- Display the bracket according to the tournament structure:
  - The tournament is split up into four divisions: North, East, South, and West
  - The tournament has four rounds: round of 16, quarterfinals (division finals), semifinals, and finals
  - The round of 16 and quarterfinals are played within each of the four divisions
  - In any matchup, the higher seed is positioned on the top and the lower see is positioned on the bottom
  - In the round of 16, the highest seed in each division plays against the lowest seed in the division and the remaining two teams in that division play against each other
  - In the quarterfinals, the winners of the round of 16 matches in each division play against each other
  - In the semifinals, the winner of the East division plays against the winner of the South and the winner of the West plays against the winner of the North
  - In the finals, the winners of the semifinals play against each other
  - This means that the tournament bracket is structured with the East (top) and South (bottom) on the left side and the West (top) and North (bottom) on the right side
  - The finals will be in the middle of the tournament bracket
- Allow the user to complete their bracket by choosing which restaurants they think will win each match up
  - In each matchup, the user will pick a winner
  - Choosing a winner will advance them to the next round in the bracket
  - When the user clicks on a matchup, a modal should pop up that shows the two restaurants in a matchup:
    - The higher-seeded team should be on the left and the lower-seeded team should be on the right
    - Display other information from the CSV about the restaurants to help the user decide
    - Show each restaurant's two competing menu items below their stats; each menu item displays small ingredient emoji icons derived from the parenthetical code in the item name (P=🐷 Pork, C=🐔 Chicken, V=🥦 Vegetarian, S=🦐 Seafood, B=🐄 Beef)
    - If a restaurant's menu items have not been entered yet, show "Menu Item TBD" with a ❓ icon in place of each missing item
    - Show buttons for each restaurant to pick that restaurant as the winner
    - On iOS, a synthetic click fires at the tap coordinates after the modal opens, which can accidentally select the card closest to the tap point; guard against this by ignoring card clicks that arrive within 350 ms of the modal mounting
    - Once a user picks the winner for a matchup, close the model, show an animation that highlights the next match in the bracket so that the user will click that one
    - Highlight the next matchup in the same round, do not start highlighting the match in the next round until all matches in the previous round have a winner picked
  - If the user has not yet picked a winner for the matchups before a certain matchup, then they will not be able to choose a winner for that matchup until they do so
  - The user must pick winners for all matches in the tournament before they can share their bracket
  - The bracket maker should show the user their progress so that they understand they have to pick a winner for all matches
  - Once a user is satisfied with their bracket, a modal should pop up for them to share their bracket, with a "Share" button that copies the URL
  - This experience should also be mobile responsive, allowing the user to horizontally and vertically scroll around the tournament bracket
    - Large enough screens should be able to fit the whole bracket
  - Users will submit the URL to their bracket outside the website, which is how we will freeze their predictions in time
    - This way, even if they change their bracket later, we will know their original predictions
- Generate a unique link to the user's bracket
  - Store the user's bracket choices in memory and in `localStorage`
  - Auto-save the user's choices to `localStorage`
  - Allow sharing a bracket by URL params
  - Since there are 16 teams and four rounds, there are exactly 15 matches to pick winners for (8 in round 1, 4 in round 2, 2 in round 3, 1 in round 4)
  - This means the entire bracket can be represented as a 15-bit binary number
    - The bits represent the matchups ordered from top-to-bottom, then left-to-right in the tournament bracket, with the finals being the last bit
    - A value of 0 represents the higher-seeded restaurant winning and 1 represents the lower-seeded restaurant winning that matchup
  - When sharing a bracket link, encode the 15-bit number as a 3-character base-36 string (digits 0–9 and letters A–Z) and save it as a URL param called `choices`, like this: `?choices=PA7`
    - `36^3 = 46,656 > 2^15 = 32,768`, so 3 base-36 characters are sufficient to represent any bracket
    - Encode: interpret the 15-bit string as a base-2 integer, convert to base-36 uppercase, left-pad with `'0'` to length 3
    - Decode: parse as base-36 integer, convert to binary string, left-pad to 15 bits
    - For backward compatibility, if a `choices` param is 5 or more characters, treat it as the legacy 15-character binary string format
- Allow users to come back to their own bracket and view brackets from other users
  - If the `choices` param is present in the URL on load, skip the landing page and go straight to the bracket view with that bracket populated; if it differs from the user's saved bracket, show them the option to view their own bracket
  - When the `choices` param is not set, show the landing page first; clicking the button loads the user's saved bracket if any, otherwise an empty bracket
  - Include a button that allows the user to clear their bracket
