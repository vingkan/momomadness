import { readFileSync, readdirSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";

// ── Restaurant name → seed mapping ──
// Keys must match the names inside "Your votes [...]" CSV headers exactly.
const NAME_TO_SEED = {
  "Dumpling Home": 1,
  "Hon's Wun-Tun House": 2,
  "Yuanbao Jiaozi": 3,
  "Palette Tea House": 4,
  "Dumpling Story": 5,
  "Dumpling Time": 6,
  "Cinderella Bakery & Cafe": 7,
  Bao: 8,
  "Dumpling Specialist": 9,
  "Kingdom of Dumpling": 10,
  "House of Pancakes": 11,
  "Dumpling Kitchen": 12,
  "United Dumplings": 13,
  "Dumpling King": 14,
  "Today Food": 15,
  "Dumpling Baby China Bistro": 16,
};

function seedToId(seed) {
  return (seed - 1).toString().padStart(2, "0");
}

// ── CSV parsing ──

function parseCSV(filePath) {
  const raw = readFileSync(filePath, "utf-8").trim();
  const lines = raw.split("\n").map((l) => l.trim());
  const header = lines[0].split(",");

  // Extract restaurant names from "Your votes [Name]" columns
  const restaurantCols = [];
  for (let i = 0; i < header.length; i++) {
    const m = header[i].match(/^Your votes \[(.+)\]$/);
    if (m) {
      restaurantCols.push({ index: i, name: m[1] });
    }
  }

  // Parse data rows
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i]) continue;
    const cols = lines[i].split(",");
    const judge = cols[1].trim();
    const rankings = {};
    for (const rc of restaurantCols) {
      rankings[rc.name] = parseInt(cols[rc.index], 10);
    }
    rows.push({ judge, rankings });
  }

  return { restaurants: restaurantCols.map((rc) => rc.name), rows };
}

// ── Quarter assignment ──
// Q boundaries at floor(n*q/4) for q=1,2,3

function getQuarter(rowIndex, totalRows) {
  const q1 = Math.floor((totalRows * 1) / 4);
  const q2 = Math.floor((totalRows * 2) / 4);
  const q3 = Math.floor((totalRows * 3) / 4);
  if (rowIndex < q1) return 1;
  if (rowIndex < q2) return 2;
  if (rowIndex < q3) return 3;
  return 4;
}

// ── Point values by source rank vs target rank ──
// Key: "sourceRank,targetRank" → points earned by source
const PAIRWISE_POINTS = {
  "1,2": 7,
  "1,3": 13,
  "1,4": 16,
  "2,3": 5,
  "2,4": 10,
  "3,4": 3,
};

// ── Pairwise scoring for one row ──
// Returns array of { source, sourceRank, target, targetRank, pointsEarned }
// source = higher-ranked restaurant (lower rank number)
// pointsEarned = points earned by the source against the target

function computePairwise(rankings, restaurantNames) {
  // Sort restaurants by their ranking (ascending = best first)
  const sorted = [...restaurantNames].sort(
    (a, b) => rankings[a] - rankings[b],
  );
  const pairs = [];

  for (let i = 0; i < sorted.length; i++) {
    for (let j = i + 1; j < sorted.length; j++) {
      const source = sorted[i];
      const target = sorted[j];
      const sourceRank = rankings[source];
      const targetRank = rankings[target];
      const pointsEarned = PAIRWISE_POINTS[`${sourceRank},${targetRank}`] ?? 0;
      pairs.push({
        source,
        sourceRank,
        target,
        targetRank,
        pointsEarned,
      });
    }
  }

  return pairs;
}

// ── Pair key (consistent ordering by seed) ──

function pairKey(nameA, nameB) {
  const seedA = NAME_TO_SEED[nameA];
  const seedB = NAME_TO_SEED[nameB];
  if (seedA < seedB) return `${nameA}|||${nameB}`;
  return `${nameB}|||${nameA}`;
}

// ── Main ──

const votesDir = join(
  import.meta.dirname,
  "..",
  "src",
  "data",
  "votes",
);
const dataDir = join(import.meta.dirname, "..", "src", "data");

const csvFiles = readdirSync(votesDir).filter((f) => f.endsWith(".csv"));
csvFiles.sort();

const allJudgeRecords = [];

// Accumulated scores: pairKey → { names, scores: { name: [q1,q2,q3,q4] }, judgeDetails: [] }
const pairScores = {};

for (const csvFile of csvFiles) {
  const filePath = join(votesDir, csvFile);
  const { restaurants, rows } = parseCSV(filePath);
  const totalRows = rows.length;

  for (let rowIdx = 0; rowIdx < totalRows; rowIdx++) {
    const { judge, rankings } = rows[rowIdx];
    const quarter = getQuarter(rowIdx, totalRows);
    const pairs = computePairwise(rankings, restaurants);

    // Judge record
    allJudgeRecords.push({
      judge,
      file: csvFile,
      quarter,
      pairwise: pairs,
    });

    // Accumulate into pair scores
    for (const p of pairs) {
      const key = pairKey(p.source, p.target);
      if (!pairScores[key]) {
        const [nameA, nameB] = key.split("|||");
        pairScores[key] = {
          pair: [nameA, nameB],
          scores: {
            [nameA]: [0, 0, 0, 0],
            [nameB]: [0, 0, 0, 0],
          },
          judgeDetails: [],
        };
      }

      const entry = pairScores[key];
      const qi = quarter - 1; // 0-indexed

      // Source (higher ranked) earns points
      entry.scores[p.source][qi] += p.pointsEarned;
      // Target (lower ranked) earns 0 — no addition needed

      entry.judgeDetails.push({
        file: csvFile,
        judge,
        quarter,
        source: p.source,
        sourceRank: p.sourceRank,
        target: p.target,
        targetRank: p.targetRank,
        pointsEarned: p.pointsEarned,
      });
    }
  }
}

// Build scores output with seed/ID info and totals
const scoresOutput = Object.values(pairScores).map((entry) => {
  const [nameA, nameB] = entry.pair;
  const seedA = NAME_TO_SEED[nameA];
  const seedB = NAME_TO_SEED[nameB];
  const totalA = entry.scores[nameA].reduce((a, b) => a + b, 0);
  const totalB = entry.scores[nameB].reduce((a, b) => a + b, 0);

  return {
    pair: entry.pair,
    pairSeeds: [seedA, seedB],
    pairIds: [seedToId(seedA), seedToId(seedB)],
    scores: entry.scores,
    totalScores: {
      [nameA]: totalA,
      [nameB]: totalB,
    },
    judgeDetails: entry.judgeDetails,
  };
});

// Sort by first seed then second seed for consistent output
scoresOutput.sort(
  (a, b) => a.pairSeeds[0] - b.pairSeeds[0] || a.pairSeeds[1] - b.pairSeeds[1],
);

writeFileSync(
  join(dataDir, "judges.json"),
  JSON.stringify(allJudgeRecords, null, 2) + "\n",
);
writeFileSync(
  join(dataDir, "scores.json"),
  JSON.stringify(scoresOutput, null, 2) + "\n",
);

console.log(`Processed ${csvFiles.length} file(s), ${allJudgeRecords.length} judge rows`);
console.log(`Generated ${scoresOutput.length} pairwise score records`);
console.log(`Output: src/data/judges.json, src/data/scores.json`);

// ════════════════════════════════════════════════════════════════════
// Bracket scoring — processes brackets.csv using results from results.ts
// ════════════════════════════════════════════════════════════════════

// ── Match definitions (mirrors src/data/bracket.ts MATCHES) ──

const MATCHES = [
  { index: 0, round: "r16", topSlot: { seed: 5 }, bottomSlot: { seed: 16 }, prerequisites: [] },
  { index: 1, round: "r16", topSlot: { seed: 7 }, bottomSlot: { seed: 14 }, prerequisites: [] },
  { index: 2, round: "r16", topSlot: { seed: 3 }, bottomSlot: { seed: 11 }, prerequisites: [] },
  { index: 3, round: "r16", topSlot: { seed: 9 }, bottomSlot: { seed: 10 }, prerequisites: [] },
  { index: 4, round: "qf", topSlot: { matchIndex: 0, pick: 0 }, bottomSlot: { matchIndex: 1, pick: 0 }, prerequisites: [0, 1] },
  { index: 5, round: "qf", topSlot: { matchIndex: 2, pick: 0 }, bottomSlot: { matchIndex: 3, pick: 0 }, prerequisites: [2, 3] },
  { index: 6, round: "sf", topSlot: { matchIndex: 4, pick: 0 }, bottomSlot: { matchIndex: 5, pick: 0 }, prerequisites: [4, 5] },
  { index: 7, round: "sf", topSlot: { matchIndex: 8, pick: 0 }, bottomSlot: { matchIndex: 9, pick: 0 }, prerequisites: [8, 9] },
  { index: 8, round: "qf", topSlot: { matchIndex: 10, pick: 0 }, bottomSlot: { matchIndex: 11, pick: 0 }, prerequisites: [10, 11] },
  { index: 9, round: "qf", topSlot: { matchIndex: 12, pick: 0 }, bottomSlot: { matchIndex: 13, pick: 0 }, prerequisites: [12, 13] },
  { index: 10, round: "r16", topSlot: { seed: 1 }, bottomSlot: { seed: 15 }, prerequisites: [] },
  { index: 11, round: "r16", topSlot: { seed: 2 }, bottomSlot: { seed: 4 }, prerequisites: [] },
  { index: 12, round: "r16", topSlot: { seed: 6 }, bottomSlot: { seed: 13 }, prerequisites: [] },
  { index: 13, round: "r16", topSlot: { seed: 8 }, bottomSlot: { seed: 12 }, prerequisites: [] },
  { index: 14, round: "final", topSlot: { matchIndex: 6, pick: 0 }, bottomSlot: { matchIndex: 7, pick: 0 }, prerequisites: [6, 7] },
];

const ROUND_POINTS = { r16: 1, qf: 2, sf: 4, final: 8 };
const ROUND_ORDER = { r16: 0, qf: 1, sf: 2, final: 3 };

// Mid-tournament replacements: seed → { replacementSeed, startingInRound }
const REPLACEMENTS = { 9: { replacementSeed: 11, startingInRound: "sf" } };

// ── Parse RESULTS from results.ts ──

function parseResultsTs() {
  const resultsPath = join(dataDir, "results.ts");
  const src = readFileSync(resultsPath, "utf-8");

  const results = [];
  // Match each object in the RESULTS array
  const re = /\{\s*matchId:\s*["']([^"']+)["'],\s*matchIndex:\s*(\d+),\s*topScore:\s*\[([^\]]+)\],\s*bottomScore:\s*\[([^\]]+)\],\s*recap:\s*/g;
  let m;
  while ((m = re.exec(src)) !== null) {
    results.push({
      matchId: m[1],
      matchIndex: parseInt(m[2], 10),
      topScore: m[3].split(",").map((s) => parseInt(s.trim(), 10)),
      bottomScore: m[4].split(",").map((s) => parseInt(s.trim(), 10)),
    });
  }
  return results;
}

const RESULTS_DATA = parseResultsTs();

function getResultByIdx(matchIndex) {
  return RESULTS_DATA.find((r) => r.matchIndex === matchIndex) ?? null;
}

function resultTotalScore(quarters) {
  return quarters.reduce((a, b) => a + b, 0);
}

function getResultWinnerJS(result) {
  return resultTotalScore(result.topScore) >= resultTotalScore(result.bottomScore) ? 0 : 1;
}

// ── Slot resolution (mirrors bracket.ts resolveSlot) ──

function resolveSlotWithChoices(slot, choices) {
  if ("seed" in slot) return slot.seed;
  const { matchIndex } = slot;
  const choice = choices[matchIndex];
  if (choice === null) return null;
  const match = MATCHES[matchIndex];
  const winningSlot = choice === 0 ? match.topSlot : match.bottomSlot;
  return resolveSlotWithChoices(winningSlot, choices);
}

function resolveSlotWithResults(slot, forRound) {
  if ("seed" in slot) {
    let seed = slot.seed;
    if (forRound && REPLACEMENTS[seed] && ROUND_ORDER[forRound] >= ROUND_ORDER[REPLACEMENTS[seed].startingInRound]) {
      seed = REPLACEMENTS[seed].replacementSeed;
    }
    return seed;
  }
  const { matchIndex } = slot;
  const result = getResultByIdx(matchIndex);
  if (!result) return null;
  const winner = getResultWinnerJS(result);
  const match = MATCHES[matchIndex];
  const winningSlot = winner === 0 ? match.topSlot : match.bottomSlot;
  return resolveSlotWithResults(winningSlot, forRound);
}

// ── Decode choices (mirrors bracket.ts decodeChoices) ──

function decodeChoicesJS(param) {
  const result = Array(15).fill(null);
  if (param.length <= 4) {
    const num = parseInt(param, 36);
    if (isNaN(num)) return result;
    const binaryStr = num.toString(2).padStart(15, "0");
    const bits = binaryStr.length > 15 ? binaryStr.slice(-15) : binaryStr;
    for (let i = 0; i < 15; i++) {
      if (bits[i] === "0") result[i] = 0;
      else if (bits[i] === "1") result[i] = 1;
    }
  } else {
    for (let i = 0; i < 15 && i < param.length; i++) {
      const c = param[i];
      if (c === "0") result[i] = 0;
      else if (c === "1") result[i] = 1;
    }
  }
  return result;
}

// ── Bracket scoring ──

function isUserSlotViableJS(slot, choices, forRound) {
  if ("seed" in slot) return true;
  const { matchIndex } = slot;
  const result = getResultByIdx(matchIndex);
  if (!result) {
    const pick = choices[matchIndex];
    if (pick === null) return true;
    const pickedSlot = pick === 0 ? MATCHES[matchIndex].topSlot : MATCHES[matchIndex].bottomSlot;
    return isUserSlotViableJS(pickedSlot, choices, forRound);
  }
  const winner = getResultWinnerJS(result);
  const match = MATCHES[matchIndex];
  const actualWinnerSlot = winner === 0 ? match.topSlot : match.bottomSlot;
  const actualWinnerSeed = resolveSlotWithResults(actualWinnerSlot, forRound);
  const userPick = choices[matchIndex];
  if (userPick === null) return false;
  const userWinnerSlot = userPick === 0 ? match.topSlot : match.bottomSlot;
  const userWinnerSeed = resolveSlotWithChoices(userWinnerSlot, choices);
  if (actualWinnerSeed === null || userWinnerSeed === null) return false;
  return actualWinnerSeed === userWinnerSeed;
}

function scoreBracketJS(encoded) {
  const choices = decodeChoicesJS(encoded);
  let current = 0;
  let max = 0;
  let wins = 0;
  let losses = 0;

  for (const match of MATCHES) {
    const points = ROUND_POINTS[match.round];
    const result = getResultByIdx(match.index);

    if (result) {
      const resultWinner = getResultWinnerJS(result);
      const actualWinnerSlot = resultWinner === 0 ? match.topSlot : match.bottomSlot;
      const actualWinnerSeed = resolveSlotWithResults(actualWinnerSlot, match.round);

      const userPick = choices[match.index];
      if (userPick !== null) {
        const userWinnerSlot = userPick === 0 ? match.topSlot : match.bottomSlot;
        const userWinnerSeed = resolveSlotWithChoices(userWinnerSlot, choices);

        if (actualWinnerSeed !== null && userWinnerSeed !== null && actualWinnerSeed === userWinnerSeed) {
          current += points;
          wins++;
        } else {
          losses++;
        }
      }
    } else {
      // No result — check max eligibility
      if (match.round === "r16") {
        if (choices[match.index] !== null) max += points;
      } else {
        const topSlot = match.topSlot;
        const bottomSlot = match.bottomSlot;

        let topViable = isUserSlotViableJS(topSlot, choices, match.round);
        let bottomViable = isUserSlotViableJS(bottomSlot, choices, match.round);

        const userPick = choices[match.index];
        if (userPick !== null) {
          const viable = userPick === 0 ? topViable : bottomViable;
          if (viable) max += points;
        }
      }
    }
  }

  max += current;
  return { score: current, maxScore: max, wins, losses };
}

// ── Process brackets.csv ──

const bracketsPath = join(dataDir, "brackets.csv");
if (existsSync(bracketsPath)) {
  const bracketRaw = readFileSync(bracketsPath, "utf-8").trim();
  const bracketLines = bracketRaw.split("\n").map((l) => l.trim());

  const bracketEntries = [];
  for (let i = 1; i < bracketLines.length; i++) {
    if (!bracketLines[i]) continue;
    const cols = bracketLines[i].split(",");
    const timestamp = cols[0].trim();
    const name = cols[1].trim();
    const url = cols[2].trim();

    // Extract encoded choices from URL
    const urlObj = new URL(url);
    const encoded = urlObj.searchParams.get("choices");
    if (!encoded) continue;

    const { score, maxScore, wins, losses } = scoreBracketJS(encoded);

    bracketEntries.push({
      name,
      timestamp,
      encoded,
      url,
      score,
      maxScore,
      wins,
      losses,
    });
  }

  // Sort: score desc, maxScore desc, timestamp asc
  bracketEntries.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (b.maxScore !== a.maxScore) return b.maxScore - a.maxScore;
    return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
  });

  writeFileSync(
    join(dataDir, "brackets.json"),
    JSON.stringify(bracketEntries, null, 2) + "\n",
  );

  console.log(`Scored ${bracketEntries.length} brackets from brackets.csv`);
  console.log(`Output: src/data/brackets.json`);
} else {
  console.log("No brackets.csv found, skipping bracket scoring");
}
