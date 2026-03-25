// ═══ TABULA RASA — World Generation + Systems ═══
"use strict";

// ── CONFIG ──
var TW = 16, TH = 8, CH = 16, CC = 3, CS = CH * CC;
var SPD = 0.048, SPRNT = 0.082, IR = 2.2;

// ── UTILS ──
function rng(s) { return function () { s = (s * 16807 + 13) % 2147483647; return s / 2147483647 } }
function H(x, y) { var h = (x * 374761393 + y * 668265263 + 1013904223); h = (h ^ (h >> 13)) * 1274126177; return (h ^ (h >> 16)) >>> 0 }
function iso(x, y) { return { sx: (x - y) * TW, sy: (x + y) * TH } }
function gDist(gx, gy) { var cx = gx / CS, cy = gy / CS; if (cx < .4 && cy < .5) return 0; if (cx > .55) return 1; return 2 }

// District surface colors [r,g,b]
var DST = [[85, 90, 105], [75, 68, 62], [90, 78, 68]];

// ── TILE TYPES ──
// 0=void 1=sidewalk 2=road 3=building 4=grass 7=dirt 8=water 9=shore 10=bridge

// ═══ WORLD CLASS ═══
function World() {
  this.ch = {};
  this.mods = {};
}
World.prototype.k = function (a, b) { return a + "," + b };
World.prototype.isC = function (a, b) { return a >= 0 && a < CC && b >= 0 && b < CC };
World.prototype.tile = function (wx, wy) {
  var mk = wx + "," + wy;
  if (this.mods[mk] !== undefined) return this.mods[mk];
  var c = this.gc(Math.floor(wx / CH), Math.floor(wy / CH));
  var lx = ((wx % CH) + CH) % CH, ly = ((wy % CH) + CH) % CH;
  return c.t[ly] ? c.t[ly][lx] : 0;
};
World.prototype.setTile = function (wx, wy, val) { this.mods[wx + "," + wy] = val };
World.prototype.gc = function (cx, cy) {
  var k = this.k(cx, cy);
  if (this.ch[k]) return this.ch[k];
  var c = this._g(cx, cy);
  this.ch[k] = c;
  return c;
};
World.prototype.vis = function (px, py) {
  var a = Math.floor(px / CH), b = Math.floor(py / CH), o = [];
  for (var dy = -2; dy <= 2; dy++) for (var dx = -2; dx <= 2; dx++) o.push(this.gc(a + dx, b + dy));
  return o;
};
World.prototype.removeTree = function (wx, wy) {
  var ch = this.gc(Math.floor(wx / CH), Math.floor(wy / CH));
  ch.trees = ch.trees.filter(function (tr) { return Math.floor(tr.x) !== wx || Math.floor(tr.y) !== wy });
};
World.prototype.removeProp = function (wx, wy, tp) {
  var ch = this.gc(Math.floor(wx / CH), Math.floor(wy / CH));
  for (var i = ch.props.length - 1; i >= 0; i--) {
    var p = ch.props[i];
    if (Math.abs(p.x - wx) < 1 && Math.abs(p.y - wy) < 1 && (!tp || p.tp === tp)) { ch.props.splice(i, 1); return true }
  }
  return false;
};
World.prototype.addProp = function (wx, wy, tp, extra) {
  var ch = this.gc(Math.floor(wx / CH), Math.floor(wy / CH));
  var pr = { tp: tp, x: wx, y: wy };
  if (extra) for (var ek in extra) pr[ek] = extra[ek];
  ch.props.push(pr);
  return pr;
};
World.prototype.addPoi = function (wx, wy, tp, id, desc) {
  var ch = this.gc(Math.floor(wx / CH), Math.floor(wy / CH));
  ch.poi.push({ tp: tp, x: wx, y: wy, id: id, desc: desc });
};

// ═══ CHUNK GENERATION ═══
World.prototype._g = function (cx, cy) {
  var t = [], sd = H(cx, cy), rand = rng(sd), ox = cx * CH, oy = cy * CH;
  var bl = [], lamps = [], poi = [], trees = [], props = [], vehs = [];
  for (var i = 0; i < CH; i++) { t[i] = []; for (var j = 0; j < CH; j++) t[i][j] = 0 }

  var bio = "";

  if (this.isC(cx, cy)) {
    // ═══ CITY ═══
    bio = "city";
    // Fill with sidewalk
    for (var ly = 0; ly < CH; ly++) for (var lx = 0; lx < CH; lx++) t[ly][lx] = 1;
    // Roads every 4 tiles
    for (var ly = 0; ly < CH; ly++) for (var lx = 0; lx < CH; lx++) {
      var gx = ox + lx, gy = oy + ly;
      if (gx % 5 === 0 || gy % 5 === 0) t[ly][lx] = 2;
    }
    // Buildings in blocks
    for (var by2 = 1; by2 < CH - 1; by2 += 5) for (var bx2 = 1; bx2 < CH - 1; bx2 += 5) {
      var gx = ox + bx2, gy = oy + by2;
      if (gx % 5 === 0 || gy % 5 === 0) continue;
      if (rand() < 0.15) {
        // Park
        for (var dy = 0; dy < 3; dy++) for (var dx = 0; dx < 3; dx++) {
          if (bx2 + dx < CH && by2 + dy < CH) {
            t[by2 + dy][bx2 + dx] = 4;
            if (rand() < .18) trees.push({ x: gx + dx, y: gy + dy });
          }
        }
        poi.push({ tp: "bench", x: gx + 1.5, y: gy + 1.5, id: "b" + gx + "_" + gy });
        continue;
      }
      var di = gDist(gx, gy);
      var dc = Math.sqrt((gx + 1.5 - CS / 2) * (gx + 1.5 - CS / 2) + (gy + 1.5 - CS / 2) * (gy + 1.5 - CS / 2)) / (CS / 2);
      var hM = di === 0 ? 1.2 : di === 1 ? 0.7 : 0.5;
      var mH2 = (dc < .2 ? 200 : dc < .4 ? 140 : dc < .6 ? 100 : dc < .8 ? 65 : 45) * hM;
      var bw = 2 + Math.floor(rand() * 2), bd = 2 + Math.floor(rand() * 2);
      if (bw > 3) bw = 3; if (bd > 3) bd = 3;
      var h = 20 + rand() * (mH2 - 20);
      for (var dy = 0; dy < bd && by2 + dy < CH; dy++)
        for (var dx = 0; dx < bw && bx2 + dx < CH; dx++)
          t[by2 + dy][bx2 + dx] = 3;
      bl.push({ x: gx, y: gy, w: bw, d: bd, h: h, di: di, flr: Math.ceil(h / 20) });
      // Door
      poi.push({ tp: "door", x: gx + bw / 2, y: gy + bd, id: "d" + gx + "_" + gy });
      // Lamp
      if (rand() < .4) lamps.push({ x: gx - 0.5, y: gy + bd / 2 });
    }
    // Vehicles
    if (rand() < .3) {
      var vx = ox + 5 * Math.floor(rand() * 3), vy = oy + Math.floor(rand() * CH);
      vehs.push({ x: vx + 0.5, y: vy + 0.5, dir: Math.floor(rand() * 4), color: Math.floor(rand() * 5) });
    }
  } else {
    // ═══ WILDERNESS ═══
    var dist = Math.sqrt(cx * cx + cy * cy);
    var br = rng(H(cx >> 1, cy >> 1));
    var angle = Math.atan2(cy, cx);
    var north = angle < -0.5, south = angle > 0.5, east = cx > Math.abs(cy), west = cx < -Math.abs(cy);

    if (dist < 4) {
      bio = br() < .25 ? "forest" : br() < .45 ? "field" : br() < .65 ? "hills" : br() < .8 ? "river" : "meadow";
    } else if (dist < 7) {
      if (north) bio = br() < .25 ? "forest" : br() < .45 ? "hills" : br() < .6 ? "moor" : br() < .75 ? "river" : "tundra";
      else if (south) bio = br() < .2 ? "farmland" : br() < .4 ? "field" : br() < .55 ? "river" : br() < .7 ? "meadow" : "jungle";
      else if (east) bio = br() < .25 ? "coast" : br() < .45 ? "marsh" : br() < .6 ? "field" : br() < .8 ? "river" : "swamp";
      else bio = br() < .25 ? "hills" : br() < .45 ? "forest" : br() < .6 ? "mountain" : br() < .75 ? "canyon" : "moor";
    } else {
      if (north) bio = br() < .2 ? "tundra" : br() < .4 ? "snow" : br() < .55 ? "mountain" : br() < .7 ? "forest" : "glacier";
      else if (south) bio = br() < .2 ? "desert" : br() < .4 ? "jungle" : br() < .55 ? "savanna" : br() < .7 ? "volcanic" : "steppe";
      else if (east) bio = br() < .25 ? "coast" : br() < .4 ? "marsh" : br() < .55 ? "lake" : br() < .7 ? "swamp" : "field";
      else bio = br() < .2 ? "mountain" : br() < .4 ? "canyon" : br() < .55 ? "forest" : br() < .7 ? "ruins" : "hills";
    }

    // Base terrain
    for (var ly = 0; ly < CH; ly++) for (var lx = 0; lx < CH; lx++) {
      var gx = ox + lx, gy = oy + ly;
      if ((gx >= 0 && gx < 2) || (gy >= 0 && gy < 2)) { t[ly][lx] = 1; continue }
      if (bio === "river" || bio === "swamp" || bio === "marsh") {
        var rc = CH / 2 + Math.sin(ly * .4 + cx) * 3 + (bio !== "river" ? Math.sin(ly * .8) * 2 : 0);
        var width = bio === "marsh" ? 4 : bio === "swamp" ? 3.5 : 2.5;
        if (Math.abs(lx - rc) < width) { t[ly][lx] = 8; continue }
        if (Math.abs(lx - rc) < width + 1) { t[ly][lx] = 9; continue }
      }
      if (bio === "coast") { if (lx > CH - 4) { t[ly][lx] = 8; continue } if (lx > CH - 5) { t[ly][lx] = 9; continue } }
      if (bio === "lake") {
        var lkd = Math.sqrt((lx - CH / 2) * (lx - CH / 2) + (ly - CH / 2) * (ly - CH / 2));
        if (lkd < 5) { t[ly][lx] = 8; continue } if (lkd < 6) { t[ly][lx] = 9; continue }
        t[ly][lx] = 4; continue;
      }
      if (bio === "glacier") { var gld = Math.sqrt((lx - CH / 2) * (lx - CH / 2) + (ly - CH * .3) * (ly - CH * .3)); if (gld < 6) { t[ly][lx] = 8; continue } t[ly][lx] = 4; continue }
      if (bio === "volcanic") { var lava = (Math.sin(lx * .6 + cy) * Math.cos(ly * .5 + cx)) > .6; if (lava) { t[ly][lx] = 8; continue } t[ly][lx] = 7; continue }
      if (bio === "canyon") { var cwall = Math.abs(lx - CH / 2 - Math.sin(ly * .3 + cx) * 2); if (cwall < 2) { t[ly][lx] = 7; continue } if (cwall < 3) { t[ly][lx] = 9; continue } t[ly][lx] = 4; continue }
      if (bio === "desert" || bio === "steppe") { t[ly][lx] = 7; continue }
      if (bio === "snow" || bio === "tundra") { t[ly][lx] = 4; continue }
      t[ly][lx] = 4;
    }

    // Bridge
    if ((bio === "river" || bio === "swamp" || bio === "marsh") && rand() < .4) {
      var bridgeY = (CH / 2 + (rand() * 6 - 3)) | 0;
      for (var lx = 0; lx < CH; lx++)
        if (t[bridgeY] && (t[bridgeY][lx] === 8 || t[bridgeY][lx] === 9)) {
          t[bridgeY][lx] = 10;
          if (bridgeY + 1 < CH && (t[bridgeY + 1][lx] === 8 || t[bridgeY + 1][lx] === 9)) t[bridgeY + 1][lx] = 10;
        }
    }

    // Trees
    var dn = { forest: 0.24, jungle: 0.32, swamp: 0.14, hills: 0.08, field: 0.02, farmland: 0.03, mountain: 0.04, moor: 0.02, snow: 0.05, marsh: 0.06, coast: 0.01, desert: 0, tundra: 0.01, canyon: 0, steppe: 0.01, savanna: 0.04, volcanic: 0, glacier: 0, lake: 0.05, meadow: 0.02, ruins: 0.08 }[bio] || 0.06;
    for (var ly = 0; ly < CH; ly++) for (var lx = 0; lx < CH; lx++)
      if (t[ly][lx] === 4 && rand() < dn) trees.push({ x: ox + lx, y: oy + ly });

    // Rural structures
    if (rand() < .12 && bio !== "desert" && bio !== "volcanic" && bio !== "glacier") {
      var sx2 = 3 + Math.floor(rand() * 8), sy2 = 3 + Math.floor(rand() * 8);
      if (bio === "farmland" || bio === "field" || bio === "meadow") {
        // Farm
        for (var dy = 0; dy < 3; dy++) for (var dx = 0; dx < 4; dx++) if (sy2 + dy < CH && sx2 + dx < CH) t[sy2 + dy][sx2 + dx] = 3;
        bl.push({ x: ox + sx2, y: oy + sy2, w: 4, d: 3, h: 25, di: -1, flr: 1, rural: true });
        poi.push({ tp: "door", x: ox + sx2 + 2, y: oy + sy2 + 3.3, id: "farm" + cx + "_" + cy, desc: "ferme" });
      } else {
        // Cabin
        for (var dy = 0; dy < 2; dy++) for (var dx = 0; dx < 2; dx++) if (sy2 + dy < CH && sx2 + dx < CH) t[sy2 + dy][sx2 + dx] = 3;
        bl.push({ x: ox + sx2, y: oy + sy2, w: 2, d: 2, h: 18, di: -1, flr: 1, rural: true });
        poi.push({ tp: "door", x: ox + sx2 + 1, y: oy + sy2 + 2.3, id: "cab" + cx + "_" + cy, desc: "cabane isolée" });
      }
    }

    // Props
    for (var ly = 0; ly < CH; ly += 2) for (var lx = 0; lx < CH; lx += 2) {
      if (t[ly] && (t[ly][lx] !== 4 && t[ly][lx] !== 7)) continue;
      var gx = ox + lx, gy = oy + ly; var r2 = rng(H(gx, gy) + 222); var roll = r2();
      if (bio === "hills" && roll < .08) props.push({ tp: "rock", x: gx + r2(), y: gy + r2() });
      else if (bio === "mountain" && roll < .12) props.push({ tp: "rock", x: gx + r2(), y: gy + r2() });
      else if ((bio === "field" || bio === "meadow") && roll < .1) props.push({ tp: "flower", x: gx + r2(), y: gy + r2() });
      else if (bio === "forest" && roll < .04) props.push({ tp: "mush", x: gx + r2(), y: gy + r2() });
      else if (bio === "forest" && roll < .07) props.push({ tp: "berry", x: gx + r2(), y: gy + r2() });
      else if (bio === "forest" && roll < .1) props.push({ tp: "stick", x: gx + r2(), y: gy + r2() });
      else if (bio === "jungle" && roll < .06) props.push({ tp: "vine", x: gx + r2(), y: gy + r2() });
      else if ((bio === "swamp" || bio === "marsh") && roll < .06) props.push({ tp: "reed", x: gx + r2(), y: gy + r2() });
      else if ((bio === "desert" || bio === "steppe") && roll < .03) props.push({ tp: "cactus", x: gx + r2(), y: gy + r2() });
      else if (bio === "desert" && roll < .05) props.push({ tp: "skull", x: gx + r2(), y: gy + r2() });
      else if ((bio === "snow" || bio === "tundra" || bio === "glacier") && roll < .04) props.push({ tp: "snowpile", x: gx + r2(), y: gy + r2() });
      else if (bio === "coast" && roll < .06 && t[ly][lx] === 4) props.push({ tp: "shell", x: gx + r2(), y: gy + r2() });
      else if (bio === "farmland" && roll < .04) props.push({ tp: "stick", x: gx + r2(), y: gy + r2() });
      else if (bio === "canyon" && roll < .1) props.push({ tp: "rock", x: gx + r2(), y: gy + r2() });
      else if (bio === "savanna" && roll < .02) props.push({ tp: "termite", x: gx + r2(), y: gy + r2() });
      else if (bio === "volcanic" && roll < .04) props.push({ tp: "obsidian", x: gx + r2(), y: gy + r2() });
      else if (bio === "ruins" && roll < .08) props.push({ tp: "wall", x: gx + .5, y: gy + .5 });
      else if (bio === "ruins" && roll < .12) props.push({ tp: "pillar", x: gx + .5, y: gy + .5 });
      else if (bio === "lake" && roll < .05 && t[ly][lx] === 4) props.push({ tp: "reed", x: gx + r2(), y: gy + r2() });
      else if ((bio === "swamp" || bio === "marsh" || bio === "lake") && roll < .08) props.push({ tp: "clay", x: gx + r2(), y: gy + r2() });
      else if (bio === "river" && roll < .04 && t[ly][lx] === 9) props.push({ tp: "clay", x: gx + r2(), y: gy + r2() });
    }

    // Collectible resources
    var collectables = { flower: "fleurs", mush: "champignons", shell: "coquillages", reed: "roseaux", berry: "baies", rock: "pierre", vine: "liane", stick: "bâton", obsidian: "obsidienne", clay: "argile" };
    for (var pi2 = 0; pi2 < props.length; pi2++) {
      var pr2 = props[pi2];
      if (collectables[pr2.tp] && rand() < .4) {
        poi.push({ tp: "resource", x: pr2.x, y: pr2.y, id: "r" + cx + "_" + cy + "_" + pi2, desc: collectables[pr2.tp], rtp: pr2.tp });
      }
    }

    // Animals
    var ANIMAL_DEFS = {
      bird: { spd: 0.015, flee: 3, shy: 6, meat: 0, fly: 1, tame: 0 },
      deer: { spd: 0.02, flee: 5, shy: 8, meat: 1, fly: 0, tame: 0 },
      rabbit: { spd: 0.025, flee: 4, shy: 5, meat: 1, fly: 0, tame: 0.3 },
      frog: { spd: 0.008, flee: 2, shy: 3, meat: 0, fly: 0, tame: 0 },
      parrot: { spd: 0.01, flee: 3, shy: 5, meat: 0, fly: 1, tame: 0.2 },
      snake: { spd: 0.012, flee: 2, shy: 4, meat: 0, fly: 0, tame: 0, hostile: 1 },
      gazelle: { spd: 0.03, flee: 6, shy: 9, meat: 1, fly: 0, tame: 0 },
      wolf: { spd: 0.02, flee: 3, shy: 5, meat: 1, fly: 0, tame: 0.1, hostile: 1 },
      horse: { spd: 0.025, flee: 4, shy: 6, meat: 0, fly: 0, tame: 0.4 },
      eagle: { spd: 0.015, flee: 4, shy: 7, meat: 0, fly: 1, tame: 0 },
      cow: { spd: 0.005, flee: 1, shy: 3, meat: 1, fly: 0, tame: 0.6 },
      chicken: { spd: 0.01, flee: 2, shy: 3, meat: 1, fly: 0, tame: 0.5 }
    };
    function pushAnimal(tp2, ax, ay) {
      var def = ANIMAL_DEFS[tp2] || { spd: 0.01, flee: 3, shy: 5 };
      props.push({
        tp: tp2, x: ax, y: ay, vx: 0, vy: 0, ai: "idle", aiT: 0, homeX: ax, homeY: ay,
        fleeT: 0, tameP: 0, spd: def.spd, fleeDist: def.flee, shyDist: def.shy,
        canMeat: def.meat, canFly: def.fly, canTame: def.tame, hostile: def.hostile || 0, isAnimal: 1
      });
      poi.push({ tp: "animal", x: ax, y: ay, id: "a" + cx + "_" + cy + "_" + props.length, desc: tp2, aIdx: props.length - 1 });
    }
    if (bio !== "desert" && bio !== "volcanic" && bio !== "glacier") {
      if (rand() < .15) pushAnimal("bird", ox + rand() * CH, oy + rand() * CH);
      if (rand() < .1 && (bio === "forest" || bio === "meadow")) pushAnimal("deer", ox + 3 + rand() * 10, oy + 3 + rand() * 10);
      if (rand() < .08 && bio !== "snow" && bio !== "tundra") pushAnimal("rabbit", ox + rand() * CH, oy + rand() * CH);
      if ((bio === "swamp" || bio === "marsh" || bio === "lake") && rand() < .15) pushAnimal("frog", ox + rand() * CH, oy + rand() * CH);
      if (bio === "jungle" && rand() < .12) pushAnimal("parrot", ox + rand() * CH, oy + rand() * CH);
      if (bio === "jungle" && rand() < .08) pushAnimal("snake", ox + rand() * CH, oy + rand() * CH);
      if (bio === "savanna" && rand() < .1) pushAnimal("gazelle", ox + rand() * CH, oy + rand() * CH);
      if (bio === "tundra" && rand() < .06) pushAnimal("wolf", ox + rand() * CH, oy + rand() * CH);
      if (bio === "steppe" && rand() < .08) pushAnimal("horse", ox + rand() * CH, oy + rand() * CH);
    }
    if ((bio === "mountain" || bio === "canyon") && rand() < .08) pushAnimal("eagle", ox + rand() * CH, oy + rand() * CH);

    // Campfire clearing
    if (rand() < .08) {
      var cfx = ox + 3 + Math.floor(rand() * 10), cfy = oy + 3 + Math.floor(rand() * 10);
      props.push({ tp: "campfire", x: cfx + .5, y: cfy + .5 });
      poi.push({ tp: "clearing", x: cfx, y: cfy, id: "cf" + cx + "_" + cy, desc: "restes de feu" });
    }
  }

  return { t: t, bl: bl, lamps: lamps, poi: poi, trees: trees, props: props, vehs: vehs, cx: cx, cy: cy, bio: bio };
};

// ── BIOME DISPLAY NAMES ──
var BIOME_NAMES = {
  city: "VILLE", forest: "FORÊT", field: "CHAMPS", hills: "COLLINES", river: "RIVIÈRE",
  swamp: "MARÉCAGE", moor: "LANDE", mountain: "MONTAGNE", desert: "DÉSERT", coast: "CÔTE",
  snow: "NEIGE", marsh: "MARAIS", farmland: "FERMES", jungle: "JUNGLE", tundra: "TOUNDRA",
  canyon: "CANYON", lake: "LAC", glacier: "GLACIER", volcanic: "VOLCANIQUE", meadow: "PRAIRIE",
  steppe: "STEPPE", savanna: "SAVANE", ruins: "RUINES"
};

// ── TILE COLORS ──
var TILE_COLORS = {
  0: 0x0a0a18, 1: 0x707888, 2: 0x505868, 3: 0x303040,
  4: 0x3a6830, 7: 0x6a5a3a, 8: 0x2a4a7a, 9: 0x4a6a3a, 10: 0x6a5a3a
};

// ── BIOME TINTS ──
var BIOME_TINTS = {
  snow: { 4: 0xb8c0d0, 7: 0xa0a8b8 }, tundra: { 4: 0x8090a0, 7: 0x707880 },
  desert: { 7: 0xc0a878 }, steppe: { 7: 0xa89868 }, savanna: { 4: 0x88a048, 7: 0xb09858 },
  jungle: { 4: 0x286828 }, volcanic: { 7: 0x3a2a2a, 8: 0x8a2a0a },
  glacier: { 4: 0x90a8c0, 8: 0x6080b0 }, meadow: { 4: 0x50a040 },
  ruins: { 4: 0x506848 }
};

// ── CRAFT RECIPES ──
var RECIPES = [
  ["pierre", "pierre", "silex tranchant", "🔪", "tool,sharp"],
  ["pierre", "bâton", "outil en pierre", "⛏", "tool,heavy"],
  ["bâton", "roseau", "canne à pêche", "🎣", "tool,fishing"],
  ["bâton", "liane", "arc rudimentaire", "🏹", "weapon,ranged"],
  ["bâton", "bâton", "torche éteinte", "🪵", "tool,fire"],
  ["silex", "bois", "feu de camp", "🔥", "fire,light"],
  ["silex", "torche", "torche allumée", "🔦", "tool,light"],
  ["pierre", "liane", "fronde", "🪢", "weapon,ranged"],
  ["roseau", "roseau", "panier tressé", "🧺", "container"],
  ["champignon", "bâton", "brochette crue", "🍢", "food,raw"],
  ["baie", "feuille", "cataplasme", "🩹", "medicine"],
  ["coquillage", "liane", "collier", "📿", "decoration,trade"],
  ["obsidienne", "bâton", "lance d'obsidienne", "🗡", "weapon,sharp"],
  ["bois", "bois", "planche", "🪵", "material,build"],
  ["planche", "planche", "abri", "🏗", "structure"]
];

function findRecipe(a, b) {
  var ad = a.desc.toLowerCase(), bd = b.desc.toLowerCase();
  for (var i = 0; i < RECIPES.length; i++) {
    var r = RECIPES[i];
    if ((ad.indexOf(r[0]) >= 0 && bd.indexOf(r[1]) >= 0) || (ad.indexOf(r[1]) >= 0 && bd.indexOf(r[0]) >= 0)) return r;
  }
  return null;
}

// ── RESOURCE GLYPHS ──
var RES_GLYPH = { flower: "🌸", mush: "🍄", berry: "🫐", shell: "🐚", reed: "🌿", rock: "🪨", vine: "🌱", stick: "🪵", obsidian: "⬛", clay: "🧱", crop: "🌾" };
var RES_TAGS = { berry: "food", mush: "food", crop: "food" };
