// ═══ CHRONIQUES D'ARKANIS — ALCHEMY SYSTEM ═══
// Inspired by Secret of Evermore's alchemy: combine 2 ingredients → spell/potion
"use strict";

var INGREDIENTS = {
  // Forest
  herbe_lune:      { name: "Herbe de Lune",     zone: "forest",  rarity: 1, color: 0x88cc88 },
  mousse_ancienne: { name: "Mousse Ancienne",    zone: "forest",  rarity: 1, color: 0x448844 },
  sève_dorée:      { name: "Sève Dorée",         zone: "forest",  rarity: 2, color: 0xddaa44 },
  // Ruins
  poudre_os:       { name: "Poudre d'Os",        zone: "ruins",   rarity: 1, color: 0xccccaa },
  éclat_rune:      { name: "Éclat de Rune",      zone: "ruins",   rarity: 2, color: 0x6688cc },
  cendre_spectrale:{ name: "Cendre Spectrale",   zone: "ruins",   rarity: 2, color: 0x8888aa },
  // Glacier
  cristal_gel:     { name: "Cristal de Gel",      zone: "glacier", rarity: 2, color: 0x88bbee },
  lichen_givré:    { name: "Lichen Givré",        zone: "glacier", rarity: 1, color: 0x99aaaa },
  larme_glacier:   { name: "Larme du Glacier",    zone: "glacier", rarity: 3, color: 0xaaddff },
  // Volcano
  soufre_pur:      { name: "Soufre Pur",          zone: "volcano", rarity: 1, color: 0xccaa22 },
  obsidienne_vive: { name: "Obsidienne Vive",     zone: "volcano", rarity: 2, color: 0x332222 },
  braise_éternelle:{ name: "Braise Éternelle",    zone: "volcano", rarity: 3, color: 0xff4400 },
  // Citadel
  éther_noir:      { name: "Éther Noir",          zone: "citadel", rarity: 3, color: 0x220044 },
  sang_cristal:    { name: "Sang Cristal",        zone: "citadel", rarity: 2, color: 0xcc2244 },
  poudre_néant:    { name: "Poudre de Néant",     zone: "citadel", rarity: 3, color: 0x111122 }
};

// Recipes: [ingredient1, ingredient2] → potion
var RECIPES = [
  // ── HEALING ──
  { a: "herbe_lune",       b: "herbe_lune",       result: { id: "potion_soin", name: "Potion de Soin", effect: "heal", power: 20, color: 0x44cc44 }},
  { a: "herbe_lune",       b: "mousse_ancienne",   result: { id: "potion_soin_m", name: "Soin Majeur", effect: "heal", power: 45, color: 0x22ee44 }},
  { a: "herbe_lune",       b: "sève_dorée",        result: { id: "elixir_vie", name: "Élixir de Vie", effect: "heal", power: 80, color: 0xeecc44 }},
  { a: "lichen_givré",     b: "herbe_lune",        result: { id: "baume_givre", name: "Baume Givré", effect: "heal", power: 35, color: 0x88ddcc }},
  
  // ── ATTACK BOOSTS ──
  { a: "poudre_os",        b: "éclat_rune",        result: { id: "rage_eryon", name: "Rage d'Eryon", effect: "atk_boost", power: 8, color: 0xcc4444 }},
  { a: "soufre_pur",       b: "braise_éternelle",  result: { id: "fury_pyrath", name: "Fureur de Pyrath", effect: "atk_boost", power: 15, color: 0xff6600 }},
  { a: "sang_cristal",     b: "poudre_os",         result: { id: "lame_sang", name: "Lame de Sang", effect: "atk_boost", power: 12, color: 0xcc2244 }},
  
  // ── DEFENSE BOOSTS ──
  { a: "mousse_ancienne",  b: "mousse_ancienne",   result: { id: "ecorce", name: "Peau d'Écorce", effect: "def_boost", power: 5, color: 0x886644 }},
  { a: "cristal_gel",      b: "lichen_givré",      result: { id: "armure_gel", name: "Armure de Gel", effect: "def_boost", power: 10, color: 0x88aaee }},
  
  // ── ELEMENTAL ──
  { a: "obsidienne_vive",  b: "soufre_pur",        result: { id: "bouclier_feu", name: "Bouclier de Feu", effect: "fire_shield", power: 0, color: 0xee4400 }},
  { a: "cristal_gel",      b: "larme_glacier",     result: { id: "lame_glace", name: "Lame de Glace", effect: "ice_blade", power: 10, color: 0x66bbee }},
  { a: "éther_noir",       b: "cendre_spectrale",  result: { id: "voile_ombre", name: "Voile d'Ombre", effect: "def_boost", power: 15, color: 0x332255 }},
  
  // ── SEAL COMPONENTS (boss preparation) ──
  { a: "sève_dorée",       b: "mousse_ancienne",   result: { id: "sceau_foret", name: "Essence Sylvestre", effect: "seal_component", power: 0, color: 0x44aa22 }},
  { a: "éclat_rune",       b: "cendre_spectrale",  result: { id: "sceau_ruine", name: "Essence Spectrale", effect: "seal_component", power: 0, color: 0x6666aa }},
  { a: "larme_glacier",    b: "cristal_gel",       result: { id: "sceau_glace", name: "Essence Glaciale", effect: "seal_component", power: 0, color: 0x88ccee }},
  { a: "braise_éternelle", b: "obsidienne_vive",   result: { id: "sceau_feu", name: "Essence Ignée", effect: "seal_component", power: 0, color: 0xee6600 }},
  { a: "éther_noir",       b: "poudre_néant",      result: { id: "sceau_ombre", name: "Essence du Néant", effect: "seal_component", power: 0, color: 0x220033 }}
];

var ALCHEMY = {
  // Try to craft from two ingredient IDs
  craft: function(idA, idB) {
    for (var i = 0; i < RECIPES.length; i++) {
      var r = RECIPES[i];
      if ((r.a === idA && r.b === idB) || (r.a === idB && r.b === idA)) {
        return r.result;
      }
    }
    return null; // no recipe
  },

  // Get all known recipes (for UI)
  getKnown: function() {
    // In SoE style, you discover recipes by trying or finding scrolls
    // For now, return all — can gate behind flags later
    return RECIPES;
  },

  // Get ingredient info
  getIngredient: function(id) {
    return INGREDIENTS[id] || null;
  }
};
