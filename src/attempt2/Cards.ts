export type Suit = "h" | "d" | "c" | "s";
export type Rank =
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "9"
  | "10"
  | "j"
  | "k"
  | "q"
  | "a";

export interface Card {
  rank: Rank;
  suit: Suit;
}

const FULL_DECK: Card[] = [
  { rank: "2", suit: "h" },
  { rank: "3", suit: "h" },
  { rank: "4", suit: "h" },
  { rank: "5", suit: "h" },
  { rank: "6", suit: "h" },
  { rank: "7", suit: "h" },
  { rank: "8", suit: "h" },
  { rank: "9", suit: "h" },
  { rank: "10", suit: "h" },
  { rank: "j", suit: "h" },
  { rank: "q", suit: "h" },
  { rank: "k", suit: "h" },
  { rank: "a", suit: "h" },

  { rank: "2", suit: "d" },
  { rank: "3", suit: "d" },
  { rank: "4", suit: "d" },
  { rank: "5", suit: "d" },
  { rank: "6", suit: "d" },
  { rank: "7", suit: "d" },
  { rank: "8", suit: "d" },
  { rank: "9", suit: "d" },
  { rank: "10", suit: "d" },
  { rank: "j", suit: "d" },
  { rank: "q", suit: "d" },
  { rank: "k", suit: "d" },
  { rank: "a", suit: "d" },

  { rank: "2", suit: "c" },
  { rank: "3", suit: "c" },
  { rank: "4", suit: "c" },
  { rank: "5", suit: "c" },
  { rank: "6", suit: "c" },
  { rank: "7", suit: "c" },
  { rank: "8", suit: "c" },
  { rank: "9", suit: "c" },
  { rank: "10", suit: "c" },
  { rank: "j", suit: "c" },
  { rank: "q", suit: "c" },
  { rank: "k", suit: "c" },
  { rank: "a", suit: "c" },

  { rank: "2", suit: "s" },
  { rank: "3", suit: "s" },
  { rank: "4", suit: "s" },
  { rank: "5", suit: "s" },
  { rank: "6", suit: "s" },
  { rank: "7", suit: "s" },
  { rank: "8", suit: "s" },
  { rank: "9", suit: "s" },
  { rank: "10", suit: "s" },
  { rank: "j", suit: "s" },
  { rank: "q", suit: "s" },
  { rank: "k", suit: "s" },
  { rank: "a", suit: "s" },
] as const;

export function getDeck(numPlayers: number): Card[] {
  if (numPlayers === 3) {
    return [...FULL_DECK].filter(
      (card) => !(card.rank === "2" && card.suit === "d")
    );
  } else if (numPlayers === 4) {
    return [...FULL_DECK];
  } else if (numPlayers === 5) {
    return [...FULL_DECK].filter(
      (card) => !(card.rank === "2" && card.suit === "c")
    );
  } else {
    throw new Error("only supports 3-5 players");
  }
}

export function cardFromString(userString: string): Card | undefined {
  const trimmed = userString.trim().toLowerCase();
  const suit = trimmed[0] as Suit;
  const rank = trimmed.slice(1) as Card["rank"];
  const suitValid =
    suit === "h" || suit === "d" || suit === "c" || suit === "s";
  const rankValid =
    rank === "10" ||
    rank === "j" ||
    rank === "q" ||
    rank === "k" ||
    rank === "a" ||
    (rank.length === 1 && rank >= "2" && rank <= "9");
  if (suitValid && rankValid) {
    return {
      rank: rank,
      suit: suit,
    };
  }

  console.log(`Invalid card string. suit: ${suit}. rank ${rank}`);
  return undefined;
}

export function rankToValue(rank: Rank): number {
  switch (rank) {
    case "2":
      return 2;
    case "3":
      return 3;
    case "4":
      return 4;
    case "5":
      return 5;
    case "6":
      return 6;
    case "7":
      return 7;
    case "8":
      return 8;
    case "9":
      return 9;
    case "10":
      return 10;
    case "j":
      return 11;
    case "q":
      return 12;
    case "k":
      return 13;
    case "a":
      return 14;
  }
}
