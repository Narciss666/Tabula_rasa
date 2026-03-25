// ═══ CHRONIQUES D'ARKANIS — CONFIG ═══
"use strict";

var CFG = {
  // Display - optimized for Blackview A50
  WIDTH: 360,
  HEIGHT: 640,
  TILE: 16,           // 16x16 pixel art tiles
  FPS: 30,

  // Player
  PLAYER_SPEED: 80,   // px/s
  ATTACK_RANGE: 24,
  ATTACK_CD: 400,     // ms
  DASH_SPEED: 200,
  DASH_DUR: 150,      // ms
  INVULN_DUR: 500,    // ms after hit

  // Camera
  CAM_LERP: 0.08,

  // Combat
  XP_TABLE: [0, 30, 80, 160, 280, 450, 700, 1050, 1500, 2100],
  LEVEL_STATS: [
    { hp: 30, atk: 5, def: 2, spd: 80 },
    { hp: 38, atk: 7, def: 3, spd: 82 },
    { hp: 48, atk: 9, def: 4, spd: 84 },
    { hp: 60, atk: 12, def: 5, spd: 86 },
    { hp: 74, atk: 15, def: 7, spd: 88 },
    { hp: 90, atk: 19, def: 9, spd: 90 },
    { hp: 108, atk: 23, def: 11, spd: 92 },
    { hp: 128, atk: 28, def: 14, spd: 94 },
    { hp: 150, atk: 34, def: 17, spd: 96 },
    { hp: 180, atk: 40, def: 20, spd: 100 }
  ],

  // Colors per zone (palette)
  ZONE_COLORS: {
    forest:  { ground: 0x2a4a1a, wall: 0x1a3a0a, accent: 0x4a8a2a, sky: 0x1a2a0a },
    ruins:   { ground: 0x3a3228, wall: 0x2a2218, accent: 0x8a7a5a, sky: 0x1a1812 },
    glacier: { ground: 0x4a5a6a, wall: 0x3a4a5a, accent: 0x8aaace, sky: 0x2a3a4a },
    volcano: { ground: 0x3a1a0a, wall: 0x2a0a00, accent: 0xea5a1a, sky: 0x1a0a00 },
    citadel: { ground: 0x2a2a3a, wall: 0x1a1a2a, accent: 0x8a6aaa, sky: 0x0a0a1a }
  },

  // API (Claude) — will be set by player if they want AI dialogues
  API_KEY: null,
  AI_MODEL: "claude-sonnet-4-20250514"
};

// ═══ ENEMY TEMPLATES ═══
var ENEMIES = {
  // Zone 1: Forêt Ancestrale
  slime:      { name: "Gelée", hp: 12, atk: 3, def: 1, spd: 30, xp: 5, w: 12, h: 10, color: 0x44aa44, ai: "wander" },
  wolf:       { name: "Loup noir", hp: 22, atk: 7, def: 2, spd: 55, xp: 12, w: 14, h: 12, color: 0x555566, ai: "chase" },
  treant:     { name: "Sylvain", hp: 40, atk: 10, def: 6, spd: 20, xp: 25, w: 16, h: 20, color: 0x3a6a2a, ai: "guard" },
  // Zone 2: Ruines d'Eryon
  skeleton:   { name: "Squelette", hp: 18, atk: 8, def: 3, spd: 45, xp: 15, w: 12, h: 16, color: 0xccccaa, ai: "patrol" },
  specter:    { name: "Spectre", hp: 15, atk: 12, def: 1, spd: 60, xp: 20, w: 14, h: 16, color: 0x6688aa, ai: "chase" },
  golem:      { name: "Golem", hp: 60, atk: 14, def: 10, spd: 15, xp: 40, w: 18, h: 22, color: 0x887766, ai: "guard" },
  // Zone 3: Glacier d'Aelvar
  ice_bat:    { name: "Chauve-gel", hp: 14, atk: 9, def: 2, spd: 70, xp: 18, w: 14, h: 10, color: 0x88bbdd, ai: "swoop" },
  frost_bear: { name: "Ours givré", hp: 50, atk: 16, def: 8, spd: 25, xp: 35, w: 18, h: 18, color: 0xaabbcc, ai: "charge" },
  // Zone 4: Volcan de Pyrath
  fire_imp:   { name: "Diablotin", hp: 20, atk: 14, def: 3, spd: 65, xp: 22, w: 10, h: 14, color: 0xee6622, ai: "chase" },
  lava_worm:  { name: "Ver magma", hp: 45, atk: 18, def: 6, spd: 35, xp: 38, w: 16, h: 12, color: 0xcc3300, ai: "burrow" },
  // Zone 5: Citadelle d'Arkanis
  dark_knight:{ name: "Chevalier noir", hp: 55, atk: 20, def: 12, spd: 40, xp: 45, w: 14, h: 18, color: 0x332244, ai: "duel" },
  
  // BOSS
  boss_treant:{ name: "Ancien Sylvain", hp: 120, atk: 16, def: 8, spd: 18, xp: 100, w: 24, h: 28, color: 0x2a5a1a, ai: "boss_tree", isBoss: true },
  boss_lich:  { name: "Liche d'Eryon", hp: 150, atk: 22, def: 6, spd: 35, xp: 150, w: 16, h: 22, color: 0x4466aa, ai: "boss_lich", isBoss: true },
  boss_wyrm:  { name: "Wyrm de glace", hp: 200, atk: 26, def: 10, spd: 30, xp: 200, w: 28, h: 20, color: 0x6699cc, ai: "boss_wyrm", isBoss: true },
  boss_ifrit: { name: "Ifrit", hp: 250, atk: 30, def: 12, spd: 45, xp: 300, w: 22, h: 26, color: 0xdd4400, ai: "boss_ifrit", isBoss: true },
  boss_king:  { name: "Roi d'Arkanis", hp: 350, atk: 35, def: 15, spd: 50, xp: 500, w: 16, h: 20, color: 0x220044, ai: "boss_king", isBoss: true }
};

// ═══ ZONE MAP LAYOUTS ═══
// Each zone: 20x36 tiles (320x576 px, fits 360x640 with HUD)
// 0=floor, 1=wall, 2=exit_north, 3=exit_south, 4=npc, 5=chest, 6=save, 7=boss_door, 8=ingredient, 9=water
var ZONES = {
  forest: {
    name: "Forêt Ancestrale",
    music: "mus_explore",
    ambient: "nature",
    enemies: ["slime", "slime", "wolf", "slime"],
    boss: "boss_treant",
    ingredients: ["herbe_lune", "mousse_ancienne", "sève_dorée"],
    map: null  // generated procedurally
  },
  ruins: {
    name: "Ruines d'Eryon",
    music: "mus_mystery",
    ambient: "ruins",
    enemies: ["skeleton", "skeleton", "specter", "golem"],
    boss: "boss_lich",
    ingredients: ["poudre_os", "éclat_rune", "cendre_spectrale"],
    map: null
  },
  glacier: {
    name: "Glacier d'Aelvar",
    music: "mus_solitude",
    ambient: "snow",
    enemies: ["ice_bat", "ice_bat", "frost_bear"],
    boss: "boss_wyrm",
    ingredients: ["cristal_gel", "lichen_givré", "larme_glacier"],
    map: null
  },
  volcano: {
    name: "Volcan de Pyrath",
    music: "mus_danger",
    ambient: "volcanic",
    enemies: ["fire_imp", "fire_imp", "lava_worm"],
    boss: "boss_ifrit",
    ingredients: ["soufre_pur", "obsidienne_vive", "braise_éternelle"],
    map: null
  },
  citadel: {
    name: "Citadelle d'Arkanis",
    music: "mus_dark",
    ambient: "city_night",
    enemies: ["dark_knight", "specter", "dark_knight"],
    boss: "boss_king",
    ingredients: ["éther_noir", "sang_cristal", "poudre_néant"],
    map: null
  }
};

var ZONE_ORDER = ["forest", "ruins", "glacier", "volcano", "citadel"];
