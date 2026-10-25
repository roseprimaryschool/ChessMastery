import React, { useState } from 'react';
import { Color } from 'chess.js';
import {
  BookOpen,
  Search,
  Play,
  Sparkles,
  Swords,
  ChevronRight,
  TrendingUp,
  UserCheck,
  Compass,
} from 'lucide-react';

export interface OpeningInfo {
  name: string;
  eco: string;
  category: '1.e4' | '1.d4' | 'gambits' | 'flank';
  moves: string[];
  fen: string;
  description: string;
  keyIdea: string;
  whiteWinRate: number; // e.g. 38%
  drawRate: number; // e.g. 33%
  blackWinRate: number; // e.g. 29%
  plansWhite: string[];
  plansBlack: string[];
  famousPlayers: string[];
  variations: { name: string; moves: string[] }[];
}

export const FAMOUS_OPENINGS: OpeningInfo[] = [
  // 1.E4 OPEN GAMES
  {
    name: "Ruy Lopez (Spanish Opening)",
    eco: "C60",
    category: "1.e4",
    moves: ["e4", "e5", "Nf3", "Nc6", "Bb5"],
    fen: "r1bqkbnr/pppp1ppp/2n5/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3",
    description: "The undisputed king of classical openings. White puts long-term positional pressure on Black's central anchor knight on c6.",
    keyIdea: "White prepares c3 and d4 to build a towering pawn center, while Black chooses between the solid Berlin Defense or dynamic Marshall Attack.",
    whiteWinRate: 39,
    drawRate: 34,
    blackWinRate: 27,
    plansWhite: ["Castle kingside rapidly", "Play c3 followed by d4 center strike", "Transfer knight to f5 via d2-f1-g3"],
    plansBlack: ["Solidify e5 pawn with ...d6 or ...a6", "Counterattack on the queenside with ...b5", "Challenge White bishop with ...Bc5 or ...Be7"],
    famousPlayers: ["Garry Kasparov", "Bobby Fischer", "Magnus Carlsen"],
    variations: [
      { name: "Berlin Defense", moves: ["e4", "e5", "Nf3", "Nc6", "Bb5", "Nf6"] },
      { name: "Morphy Defense", moves: ["e4", "e5", "Nf3", "Nc6", "Bb5", "a6"] },
    ],
  },
  {
    name: "Sicilian Defense (Najdorf Variation)",
    eco: "B90",
    category: "1.e4",
    moves: ["e4", "c5", "Nf3", "d6", "d4", "cxd4", "Nxd4", "Nf6", "Nc3", "a6"],
    fen: "rnbqkb1r/1p2pppp/p2p1n2/8/3NP3/2N5/PPP2PPP/R1BQKB1R w KQkq - 0 6",
    description: "The most combative and deeply analyzed opening in chess history. Black fights asymmetrically for the full point from move one.",
    keyIdea: "With 5...a6, Black controls b5, prepares queenside expansion with ...b5, and keeps maximum flexibility for central counter-strikes.",
    whiteWinRate: 38,
    drawRate: 31,
    blackWinRate: 31,
    plansWhite: ["Launch kingside pawn storms with f4, g4, h4 (English Attack)", "Control d5 outpost", "Target the backward d6 pawn"],
    plansBlack: ["Seize open c-file with rooks", "Expand with ...b5 and ...Bb7", "Counter in the center with ...e5 or ...d5"],
    famousPlayers: ["Bobby Fischer", "Garry Kasparov", "Hikaru Nakamura"],
    variations: [
      { name: "English Attack", moves: ["Be3", "e5", "Nb3", "Be6", "f3"] },
      { name: "Adams Attack", moves: ["h3", "e5", "Nde2", "h5"] },
    ],
  },
  {
    name: "Italian Game (Giuoco Piano)",
    eco: "C50",
    category: "1.e4",
    moves: ["e4", "e5", "Nf3", "Nc6", "Bc4", "Bc5"],
    fen: "r1bqk1nr/pppp1ppp/2n5/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4",
    description: "A harmonious classical system aimed directly at Black's sensitive f7 square, highly favored by world champions for strategic depth.",
    keyIdea: "White develops pieces actively and chooses between the slow, positional Giuoco Pianissimo (d3) or the sharp c3-d4 center break.",
    whiteWinRate: 37,
    drawRate: 36,
    blackWinRate: 27,
    plansWhite: ["Play c3 and d4 to seize center", "Maneuver knight to f5 via d2-f1-g3", "Pin f6 knight with Bg5"],
    plansBlack: ["Keep king safe with early castling", "Counter in the center with ...d6 and ...a6", "Neutralize c4 bishop with ...Be6"],
    famousPlayers: ["Magnus Carlsen", "Fabiano Caruana", "Viswanathan Anand"],
    variations: [
      { name: "Giuoco Pianissimo", moves: ["c3", "Nf6", "d3", "d6"] },
      { name: "Main Line d4", moves: ["c3", "Nf6", "d4", "exd4"] },
    ],
  },
  {
    name: "French Defense (Classical & Winawer)",
    eco: "C10",
    category: "1.e4",
    moves: ["e4", "e6", "d4", "d5", "Nc3", "Nf6"],
    fen: "rnbqkb1r/ppp2ppp/4pn2/3p4/3PP3/2N5/PPP2PPP/R1BQKBNR w KQkq - 2 4",
    description: "A solid, counter-punching opening where Black creates an immovable pawn chain and counterattacks White's central foundation.",
    keyIdea: "Black accepts a cramped light-squared bishop in return for relentless pressure on White's d4 and e5 pawn wedges.",
    whiteWinRate: 40,
    drawRate: 33,
    blackWinRate: 27,
    plansWhite: ["Lock the center with e5 and attack kingside", "Post knight on f3 or d4", "Exploit Black passive c8 bishop"],
    plansBlack: ["Strike the base of the chain with ...c5", "Undermine e5 with ...f6", "Activate queenside via ...Qb6"],
    famousPlayers: ["Mikhail Botvinnik", "Viktor Korchnoi", "Ian Nepomniachtchi"],
    variations: [
      { name: "Winawer Variation", moves: ["e4", "e6", "d4", "d5", "Nc3", "Bb4"] },
      { name: "Tarrasch Variation", moves: ["e4", "e6", "d4", "d5", "Nd2"] },
    ],
  },
  {
    name: "Caro-Kann Defense",
    eco: "B12",
    category: "1.e4",
    moves: ["e4", "c6", "d4", "d5", "Nc3", "dxe4", "Nxe4"],
    fen: "rnbqkbnr/pp2pppp/2p5/8/3PN3/8/PPP2PPP/R1BQKBNR b KQkq - 0 4",
    description: "The fortress defense. Highly favored for its ironclad pawn structure and complete lack of weaknesses.",
    keyIdea: "Unlike the French Defense, Black frees the c8 bishop before locking the pawn chain with ...e6, resulting in a rock-solid endgame.",
    whiteWinRate: 36,
    drawRate: 38,
    blackWinRate: 26,
    plansWhite: ["Gain space with Advance Variation (e5)", "Trade knights and castle queenside", "Target kingside dark squares"],
    plansBlack: ["Develop bishop to f5 or g4 smoothly", "Form unbreakable triangle c6-d5-e6", "Target White overextended pawns in the endgame"],
    famousPlayers: ["Anatoly Karpov", "Alireza Firouzja", "Ding Liren"],
    variations: [
      { name: "Classical Bf5", moves: ["Bf5", "Ng3", "Bg6", "h4", "h6"] },
      { name: "Advance Variation", moves: ["e4", "c6", "d4", "d5", "e5", "Bf5"] },
    ],
  },
  {
    name: "Scandinavian Defense (Center Counter)",
    eco: "B01",
    category: "1.e4",
    moves: ["e4", "d5", "exd5", "Qxd5", "Nc3", "Qa5"],
    fen: "rnb1kbnr/ppp1pppp/8/q7/8/2N5/PPPP1PPP/R1BQKBNR w KQkq - 2 4",
    description: "An immediate confrontation on move one that forces White to make choices and removes White's e4 pawn from the board.",
    keyIdea: "Black Queen retreats gracefully to a5 or d6, setting up a solid Caro-Kann-like pawn shell with ...c6 and ...e6.",
    whiteWinRate: 41,
    drawRate: 31,
    blackWinRate: 28,
    plansWhite: ["Gain rapid development with Nc3, d4, and Nf3", "Post bishops on c4 and d2", "Prevent Black from equalizing"],
    plansBlack: ["Tuck Queen to safety", "Build solid center with ...c6 and ...Bf5", "Pressure White d4 pawn with ...Nc6 or ...Rd8"],
    famousPlayers: ["Magnus Carlsen", "Bent Larsen"],
    variations: [
      { name: "Modern Nf6", moves: ["e4", "d5", "exd5", "Nf6"] },
      { name: "Gubinsky-Melts 3...Qd6", moves: ["e4", "d5", "exd5", "Qxd5", "Nc3", "Qd6"] },
    ],
  },

  // 1.D4 CLOSED GAMES
  {
    name: "Queen's Gambit Declined",
    eco: "D30",
    category: "1.d4",
    moves: ["d4", "d5", "c4", "e6", "Nc3", "Nf6"],
    fen: "rnbqkb1r/ppp2ppp/4pn2/3p4/2PP4/2N5/PP2PPPP/R1BQKBNR w KQkq - 2 4",
    description: "The timeless benchmark of chess strategy. Featured in world championship matches for over a century.",
    keyIdea: "Black stoutly defends d5 with pawns. White applies pin pressure on f6 with Bg5 and strives for central dominance.",
    whiteWinRate: 38,
    drawRate: 39,
    blackWinRate: 23,
    plansWhite: ["Pin the f6 knight with Bg5", "Generate central pressure on d5", "Castle queenside in the Exchange variation"],
    plansBlack: ["Break out with ...c5 or ...e5", "Exchange pieces to alleviate cramped space", "Castle to safety quickly"],
    famousPlayers: ["Jose Raul Capablanca", "Garry Kasparov", "Vladimir Kramnik"],
    variations: [
      { name: "Tartakower Defense", moves: ["Bg5", "Be7", "e3", "h6", "Bh4", "b6"] },
      { name: "Exchange Variation", moves: ["cxd5", "exd5", "Bg5", "c6"] },
    ],
  },
  {
    name: "Queen's Gambit Accepted",
    eco: "D20",
    category: "1.d4",
    moves: ["d4", "d5", "c4", "dxc4", "Nf3", "Nf6"],
    fen: "rnbqkb1r/ppp1pppp/5n2/8/2pP4/5N2/PP2PPPP/RNBQKB1R w KQkq - 2 4",
    description: "Black temporarily accepts the pawn sacrifice to avoid cramped positions and strike quickly against White's center.",
    keyIdea: "Black does not try to cling to the c4 pawn (which would be fatal), but instead plays ...c5 and ...e6 for rapid piece activity.",
    whiteWinRate: 39,
    drawRate: 36,
    blackWinRate: 25,
    plansWhite: ["Regain c4 pawn with e3 and Bxc4", "Centralize rooks on d1 and c1", "Push e4 to control the center"],
    plansBlack: ["Strike White center with ...c5", "Fianchetto queenside bishop to b7", "Challenge White isolated queen pawn"],
    famousPlayers: ["Viswanathan Anand", "Mikhail Tal", "Levon Aronian"],
    variations: [
      { name: "Classical Line", moves: ["e3", "e6", "Bxc4", "c5", "O-O", "a6"] },
    ],
  },
  {
    name: "King's Indian Defense",
    eco: "E60",
    category: "1.d4",
    moves: ["d4", "Nf6", "c4", "g6", "Nc3", "Bg7", "e4", "d6"],
    fen: "rnbqk2r/ppp1ppbp/3p1np1/8/2PPP3/2N5/PP3PPP/R1BQKBNR w KQkq - 0 5",
    description: "The ultimate weapon for aggressive players seeking unbalanced positions and vicious kingside checkmating attacks.",
    keyIdea: "Black allows White to construct a massive center, then locks the position with ...e5 and storms White's king with ...f5 and ...g5!",
    whiteWinRate: 40,
    drawRate: 29,
    blackWinRate: 31,
    plansWhite: ["Break open the queenside with c5 and b4", "Invade Black queenside via the c-file", "Keep kingside defended"],
    plansBlack: ["Lock center with ...e5 and push ...f5", "Sacrifice pieces to breach White king safety", "Use dark-squared monster bishop on g7"],
    famousPlayers: ["Garry Kasparov", "Bobby Fischer", "Hikaru Nakamura"],
    variations: [
      { name: "Classical Mar del Plata", moves: ["Nf3", "O-O", "Be2", "e5", "O-O", "Nc6", "d5", "Ne7"] },
      { name: "Sämisch Variation", moves: ["f3", "O-O", "Be3", "e5"] },
    ],
  },
  {
    name: "Nimzo-Indian Defense",
    eco: "E20",
    category: "1.d4",
    moves: ["d4", "Nf6", "c4", "e6", "Nc3", "Bb4"],
    fen: "rnbqk2r/pppp1ppp/4pn2/8/1bPP4/2N5/PP2PPPP/R1BQKBNR w KQkq - 2 4",
    description: "Hypermodern masterpiece invented by Aron Nimzowitsch. Black pins White's knight to dominate the crucial e4 square.",
    keyIdea: "Black often trades the bishop for the knight on c3 (Bxc3+), inflicting doubled pawns on White and targeting them relentlessly.",
    whiteWinRate: 36,
    drawRate: 42,
    blackWinRate: 22,
    plansWhite: ["Preserve two bishops advantage", "Straighten pawn structure or push e4", "Attack on kingside with f3 and e4"],
    plansBlack: ["Inflict doubled c-pawns on White", "Blockade the dark squares with ...d6 and ...e5", "Centralize pieces around d5 and e4"],
    famousPlayers: ["Magnus Carlsen", "Vladimir Kramnik", "Anatoly Karpov"],
    variations: [
      { name: "Rubinstein System", moves: ["e3", "O-O", "Bd3", "d5"] },
      { name: "Classical 4.Qc2", moves: ["Qc2", "O-O", "a3", "Bxc3+"] },
    ],
  },
  {
    name: "Slav Defense",
    eco: "D10",
    category: "1.d4",
    moves: ["d4", "d5", "c4", "c6", "Nf3", "Nf6"],
    fen: "rnbqkb1r/pp2pppp/2p2n2/3p4/2PP4/5N2/PP2PPPP/RNBQKB1R w KQkq - 2 4",
    description: "One of the most theoretically sound defenses against 1.d4, offering exceptional structural resilience.",
    keyIdea: "Supporting d5 with ...c6 instead of ...e6 leaves the c8 bishop free to develop to f5 or g4, avoiding the classic French/QGD passive bishop.",
    whiteWinRate: 37,
    drawRate: 41,
    blackWinRate: 22,
    plansWhite: ["Exchange on d5 or push c5 to restrict Black", "Place bishop on f4 or g5", "Pressure queenside with Qb3"],
    plansBlack: ["Develop light-square bishop to f5", "Solidify center with ...e6 and ...Nbd7", "Prepare counter-strike ...c5"],
    famousPlayers: ["Viswanathan Anand", "Vladimir Kramnik", "Vassily Smyslov"],
    variations: [
      { name: "Chebanenko Slav", moves: ["Nc3", "a6"] },
      { name: "Semi-Slav", moves: ["Nc3", "e6", "e3", "Nbd7"] },
    ],
  },
  {
    name: "London System",
    eco: "D02",
    category: "1.d4",
    moves: ["d4", "d5", "Bf4", "Nf6", "e3", "c5"],
    fen: "rnbqkb1r/pp2pppp/5n2/2pp4/3P1B2/4P3/PPP2PPP/RN1QKBNR w KQkq - 0 4",
    description: "The modern universal setup. Highly practical, incredibly solid, and nearly immune to tactical traps.",
    keyIdea: "White develops the dark-squared bishop outside the pawn chain before locking the center with e3 and c3, forming an impenetrable pyramid.",
    whiteWinRate: 38,
    drawRate: 37,
    blackWinRate: 25,
    plansWhite: ["Build the c3-d4-e3 pyramid", "Post knight on e5 and attack kingside", "Centralize rooks and queen"],
    plansBlack: ["Attack White bishop with ...Nh5", "Apply pressure on b2 and d4 with ...Qb6", "Strike center with ...c5 and ...Nc6"],
    famousPlayers: ["Magnus Carlsen", "Ding Liren", "Gata Kamsky"],
    variations: [
      { name: "Accelerated London", moves: ["d4", "Nf6", "Bf4", "g6", "e3", "Bg7"] },
    ],
  },
  {
    name: "Grünfeld Defense",
    eco: "D80",
    category: "1.d4",
    moves: ["d4", "Nf6", "c4", "g6", "Nc3", "d5"],
    fen: "rnbqkb1r/ppp1pp1p/5np1/3p4/2PP4/2N5/PP2PPPP/R1BQKBNR w KQkq - 0 4",
    description: "The favorite weapon of Kasparov and Svidler. Black invites White to occupy the entire center, then tears it to shreds.",
    keyIdea: "Black gives up the d5 pawn in the Exchange variation (cxd5 Nxd5 e4 Nxc3 bxc3), then relentlessly fires ...c5, ...Bg7, and ...Nc6 at White's d4 center.",
    whiteWinRate: 39,
    drawRate: 35,
    blackWinRate: 26,
    plansWhite: ["Defend the central pawn roller d4-e4", "Advance pawns to choke Black piece activity", "Create kingside mating threats"],
    plansBlack: ["Demolish White d4 pawn with ...c5 and ...Bg7", "Pin White knights with ...Bg4", "Seize open c-file with rooks"],
    famousPlayers: ["Garry Kasparov", "Peter Svidler", "Maxime Vachier-Lagrave"],
    variations: [
      { name: "Exchange Variation", moves: ["cxd5", "Nxd5", "e4", "Nxc3", "bxc3", "Bg7"] },
    ],
  },

  // GAMBITS & TRAPS
  {
    name: "Evans Gambit",
    eco: "C51",
    category: "gambits",
    moves: ["e4", "e5", "Nf3", "Nc6", "Bc4", "Bc5", "b4"],
    fen: "r1bqk1nr/pppp1ppp/2n5/2b1p3/1PB1P3/5N2/P1PP1PPP/RNBQK2R b KQkq - 0 4",
    description: "The golden age romantic gambit! White sacrifices the b4 pawn to gain lightning-fast piece mobilization and center domination.",
    keyIdea: "By sacrificing the b4 pawn, White gains tempo with c3 and d4, opening lines for Ba3 and Qb3 directly against Black's king.",
    whiteWinRate: 43,
    drawRate: 22,
    blackWinRate: 35,
    plansWhite: ["Follow up with c3 and d4", "Attack f7 weakness with Qb3", "Trap the Black king in the center"],
    plansBlack: ["Accept the gambit with ...Bxb4 and defend accurately", "Counter with ...d6 or ...Nf6", "Return the pawn with ...d5 to untangle"],
    famousPlayers: ["Paul Morphy", "Adolf Anderssen", "Garry Kasparov"],
    variations: [
      { name: "Accepted Bxb4", moves: ["Bxb4", "c3", "Ba5", "d4"] },
      { name: "Declined Bb6", moves: ["Bb6", "a4", "a6"] },
    ],
  },
  {
    name: "King's Gambit",
    eco: "C30",
    category: "gambits",
    moves: ["e4", "e5", "f4", "exf4", "Nf3"],
    fen: "rnbqkbnr/pppp1ppp/8/8/4Pp2/5N2/PPPP2PP/RNBQKB1R b KQkq - 1 3",
    description: "One of the oldest and most daring openings in existence. White offers the f-pawn on move two to blast open the f-file.",
    keyIdea: "White sacrifices the f-pawn to demolish Black's central presence, open the f-file for the rook, and target f7.",
    whiteWinRate: 41,
    drawRate: 20,
    blackWinRate: 39,
    plansWhite: ["Seize center with d4", "Develop bishop to c4 aiming at f7", "Castle kingside and attack down open f-file"],
    plansBlack: ["Hold gambit pawn with ...g5", "Counter-strike in center with ...d5 (Falkbeer)", "Develop smoothly with ...Nf6 and ...Be7"],
    famousPlayers: ["Boris Spassky", "Mikhail Tal", "David Bronstein"],
    variations: [
      { name: "King's Knight Gambit", moves: ["Nf3", "g5", "h4", "g4", "Ne5"] },
      { name: "Falkbeer Counter-Gambit", moves: ["d5", "exd5", "e4"] },
    ],
  },

  // FLANK & HYPERMODERN
  {
    name: "English Opening",
    eco: "A10",
    category: "flank",
    moves: ["c4", "e5", "Nc3", "Nf6", "g3", "d5"],
    fen: "rnbqkb1r/ppp2ppp/5n2/3pp3/2P5/2N3P1/PP1PPP1P/R1BQKBNR w KQkq - 0 4",
    description: "A sophisticated flank opening where White controls the center from the wing with c4, often transposing into rich pawn structures.",
    keyIdea: "White exerts pressure on d5 and controls the light squares, keeping supreme flexibility while avoiding early symmetric pawn confrontations.",
    whiteWinRate: 39,
    drawRate: 38,
    blackWinRate: 23,
    plansWhite: ["Fianchetto king bishop to g2", "Expand on the queenside with a3, Rb1, and b4", "Exert iron control over d5"],
    plansBlack: ["Occupying center with ...e5 or ...d5", "Forming reversed Sicilian setups", "Countering on kingside with ...f5"],
    famousPlayers: ["Mikhail Botvinnik", "Garry Kasparov", "Magnus Carlsen"],
    variations: [
      { name: "Reversed Sicilian", moves: ["c4", "e5", "Nc3", "Nf6", "Nf3", "Nc6"] },
      { name: "Symmetrical English", moves: ["c4", "c5", "Nc3", "Nc6"] },
    ],
  },
  {
    name: "Réti Opening",
    eco: "A04",
    category: "flank",
    moves: ["Nf3", "d5", "c4", "c6", "g3", "Nf6"],
    fen: "rnbqkb1r/pp2pppp/2p2n2/3p4/2P5/5NP1/PP1PPP1P/RNBQKB1R w KQkq - 1 4",
    description: "Pioneered by Richard Réti. White avoids occupying the center with pawns immediately, instead chipping away from both flanks.",
    keyIdea: "White develops pieces behind pawns (Nf3, g3, Bg2) and challenges Black's center with c4, aiming to undermine overextended enemy pawns.",
    whiteWinRate: 38,
    drawRate: 41,
    blackWinRate: 21,
    plansWhite: ["Double fianchetto with Bg2 and Bb2", "Strike Black center with c4 and d3", "Transfer play to an endgame with superior piece activity"],
    plansBlack: ["Erect solid pawn fortress with ...c6 and ...e6", "Develop pieces naturally with ...Bf5 or ...Bg4", "Prevent White from claiming central space"],
    famousPlayers: ["Richard Réti", "Vladimir Kramnik", "Hikaru Nakamura"],
    variations: [
      { name: "Double Fianchetto", moves: ["Bg2", "Bf5", "O-O", "e6", "b3"] },
    ],
  },
  {
    name: "Dutch Defense",
    eco: "A80",
    category: "flank",
    moves: ["d4", "f5", "g3", "Nf6", "Bg2", "e6"],
    fen: "rnbqkb1r/pppp2pp/4pn2/5p2/3P4/6P1/PPP1PPBP/RNBQK1NR w KQkq - 0 4",
    description: "An uncompromising counter-attack against 1.d4. Black immediately claims space on the kingside with 1...f5.",
    keyIdea: "Black seeks an unbalanced battle, controlling e4 and preparing to launch a direct kingside assault with ...Qe8-h5, ...g5, and ...f4.",
    whiteWinRate: 41,
    drawRate: 31,
    blackWinRate: 28,
    plansWhite: ["Fianchetto bishop to g2 to contest the long diagonal", "Target weaknesses created on Black e6 and e7", "Expand in center with e4"],
    plansBlack: ["Occupy e4 outpost with knight", "Swing Queen to h5 for kingside attack", "Play the Leningrad (...g6) or Stonewall (...d5)"],
    famousPlayers: ["Hikaru Nakamura", "Simon Williams", "Bent Larsen"],
    variations: [
      { name: "Leningrad Dutch", moves: ["d4", "f5", "g3", "Nf6", "Bg2", "g6"] },
      { name: "Stonewall Dutch", moves: ["d4", "f5", "g3", "e6", "Bg2", "d5", "Nf3", "Bd6"] },
    ],
  },
];

interface OpeningExplorerProps {
  onLoadOpening: (opening: OpeningInfo, playAsColor?: Color) => void;
  onAnalyzeOpening?: (opening: OpeningInfo) => void;
}

export const OpeningExplorer: React.FC<OpeningExplorerProps> = ({
  onLoadOpening,
  onAnalyzeOpening,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeOpeningModal, setActiveOpeningModal] = useState<OpeningInfo | null>(null);

  const filteredOpenings = FAMOUS_OPENINGS.filter((op) => {
    const matchesSearch =
      op.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      op.eco.toLowerCase().includes(searchQuery.toLowerCase()) ||
      op.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'all' || op.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="max-w-[1560px] mx-auto px-4 lg:px-8 py-6">
      {/* Header Banner */}
      <div className="mb-6 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Compass className="w-6 h-6 text-emerald-400" />
            <h1 className="text-xl font-bold text-white tracking-tight">Grandmaster Opening Repertoire</h1>
          </div>
          <p className="text-xs text-slate-400 max-w-3xl leading-relaxed">
            Master 18 legendary opening systems. Inspect grandmaster win rates, typical middlegame plans, key variations, and immediately practice against the bot or analyze engine lines.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search opening or ECO..."
            className="w-full pl-9 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        {[
          { id: 'all', label: `All Openings (${FAMOUS_OPENINGS.length})` },
          { id: '1.e4', label: '1.e4 Open Games (6)' },
          { id: '1.d4', label: '1.d4 Closed Games (7)' },
          { id: 'gambits', label: 'Gambits & Traps (2)' },
          { id: 'flank', label: 'Flank & Hypermodern (3)' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedCategory(tab.id)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
              selectedCategory === tab.id
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-850/70 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Openings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredOpenings.map((op) => (
          <div
            key={op.name}
            className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 shadow-xl flex flex-col justify-between transition-all group"
          >
            <div>
              {/* Top Row: ECO & Moves */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-mono font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-2 py-0.5 rounded">
                  {op.eco}
                </span>
                <span className="text-[11px] font-mono text-slate-400 truncate max-w-[200px]">
                  {op.moves.join(' ')}
                </span>
              </div>

              <h2 className="text-base font-bold text-white mb-1.5 group-hover:text-emerald-300 transition-colors">
                {op.name}
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed mb-3 line-clamp-2">
                {op.description}
              </p>

              {/* Master Win Rates Bar */}
              <div className="mb-4 bg-slate-850/80 p-2.5 rounded-xl border border-slate-800">
                <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1 font-mono">
                  <span>White Win {op.whiteWinRate}%</span>
                  <span>Draw {op.drawRate}%</span>
                  <span>Black Win {op.blackWinRate}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full overflow-hidden flex">
                  <div className="bg-slate-200 h-full" style={{ width: `${op.whiteWinRate}%` }} />
                  <div className="bg-slate-600 h-full" style={{ width: `${op.drawRate}%` }} />
                  <div className="bg-cyan-500 h-full" style={{ width: `${op.blackWinRate}%` }} />
                </div>
              </div>

              {/* Strategic takeaway */}
              <div className="p-3 bg-slate-800/50 border border-slate-800 rounded-lg text-xs text-slate-300 mb-4">
                <span className="font-semibold text-slate-200 block mb-0.5">Core Idea:</span>
                <p className="text-[11px] text-slate-300 leading-relaxed">{op.keyIdea}</p>
              </div>

              {/* Famous Players */}
              <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mb-4">
                <UserCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="truncate">Champions: {op.famousPlayers.join(', ')}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => onLoadOpening(op, 'w')}
                  className="py-2 px-3 bg-slate-800 hover:bg-emerald-600 text-white font-semibold text-xs rounded-lg border border-slate-700 hover:border-emerald-500 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Play className="w-3 h-3 fill-current" />
                  Play as White
                </button>
                <button
                  onClick={() => onLoadOpening(op, 'b')}
                  className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs rounded-lg border border-slate-700 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Swords className="w-3 h-3 text-cyan-400" />
                  Play as Black
                </button>
              </div>

              {onAnalyzeOpening && (
                <button
                  onClick={() => onAnalyzeOpening(op)}
                  className="w-full py-1.5 text-[11px] text-emerald-400 hover:text-emerald-300 bg-emerald-950/20 hover:bg-emerald-950/40 border border-emerald-900/40 rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Sparkles className="w-3 h-3" />
                  Explore in Engine Analysis
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
