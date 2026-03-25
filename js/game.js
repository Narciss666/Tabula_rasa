// ═══ TABULA RASA — Phaser 3 Game ═══
"use strict";

var world = new World();
var G = {
  px: CS / 2 + 1, py: CS / 2 + 1, facing: 0, time: 0, dayT: 0.35,
  inv: [], objs: [], npcs: [], nc: {}, arcs: [], skills: [], gauges: {},
  intents: [], choiceLog: [], choices: null, ni: 0, dw: 0, tv: new Set(),
  mood: null, wth: "clear", mortal: false, mortalAsked: {},
  invOpen: false, invSel: 0, menuOpen: false, menuPage: "main",
  nearPoi: null, busy: false, mounted: null, mountSpd: 0,
  intr: null, room: null, lpi: null
};

// ── Save/Load ──
function save() {
  try {
    var d = {
      px: G.px, py: G.py, dayT: G.dayT, inv: G.inv, objs: G.objs, nc: G.nc,
      arcs: G.arcs, skills: G.skills, gauges: G.gauges, intents: G.intents,
      choiceLog: G.choiceLog, ni: G.ni, dw: G.dw, mood: G.mood, wth: G.wth,
      mortal: G.mortal, mortalAsked: G.mortalAsked, worldMods: world.mods
    };
    localStorage.setItem("tr_save", JSON.stringify(d));
  } catch (e) { }
}
function load() { try { return JSON.parse(localStorage.getItem("tr_save")) } catch (e) { return null } }

var sv = load();
if (sv) {
  G.px = sv.px || G.px; G.py = sv.py || G.py; G.dayT = sv.dayT || G.dayT;
  G.inv = sv.inv || []; G.objs = sv.objs || []; G.nc = sv.nc || {};
  G.arcs = sv.arcs || []; G.skills = sv.skills || []; G.gauges = sv.gauges || {};
  G.intents = sv.intents || []; G.choiceLog = sv.choiceLog || [];
  G.ni = sv.ni || 0; G.dw = sv.dw || 0; G.mood = sv.mood;
  G.wth = sv.wth || "clear"; G.mortal = sv.mortal || false;
  G.mortalAsked = sv.mortalAsked || {};
  if (sv.worldMods) world.mods = sv.worldMods;
}

// ── Director API ──
var API_KEY = "sk-ant-api03-dJFfnKk8gGOeOP2FXDMNpDcS0s5e0hKrsDUN7AfWz_T5tNM7BjZaUuWtjKh_WT5gplKfO_bQe9JNVFP1P-a_Iw-JIJ0UQAA";
var DSYS = 'Tu es le Directeur de Tabula Rasa. Rien n\'existe tant que le joueur ne le fait pas exister. Tu OBSERVES, tu INFERES, tu FAIS EMERGER. STYLE: 1-2 phrases FR sensorielles. Propose 2-4 choix concrets. JSON:{"narrative":"","choices":[],"gauges_create":[],"gauges_update":{},"skills_unlock":[],"intent_observed":"","tame_animal":false,"hunt_animal":false,"weather":null,"world_mood":null}';

function callDir(action, cb) {
  var inv = G.inv.length ? G.inv.map(function (o) { return o.desc }).join(",") : "rien";
  var msg = action + "\nBIOME:" + (getCurBio() || "ville") + "|INV:" + inv + "|COMP:" + G.skills.join(",") + "|JAUGES:" + JSON.stringify(G.gauges);
  fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-api-key": API_KEY, "anthropic-version": "2023-06-01", "anthropic-dangerous-direct-browser-access": "true" },
    body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 300, system: DSYS, messages: [{ role: "user", content: msg }] })
  }).then(function (r) { return r.json() }).then(function (d) {
    try { var txt = d.content[0].text; var j = JSON.parse(txt.substring(txt.indexOf("{"))); cb(j) } catch (e) { cb(null) }
  }).catch(function () { cb(null) });
}

function getCurBio() {
  var ch = world.gc(Math.floor(G.px / CH), Math.floor(G.py / CH));
  return ch.bio || "";
}

// ═══ PHASER SCENE ═══
var GameScene = new Phaser.Class({
  Extends: Phaser.Scene,
  initialize: function () { Phaser.Scene.call(this, "game") },

  create: function () {
    var self = this;
    this.gfx = this.add.graphics();
    this.uiGfx = this.add.graphics().setScrollFactor(0).setDepth(1000);
    this.uiText = this.add.text(0, 0, "", { fontSize: "11px", fontFamily: "monospace", color: "#c8c0b4" }).setScrollFactor(0).setDepth(1001);

    // Camera
    this.cameras.main.setBackgroundColor("#060610");

    // Input
    this.cursors = this.input.keyboard.createCursorKeys();
    this.keys = this.input.keyboard.addKeys("W,A,S,D,E,I,B,M,ESC,SPACE,ONE,TWO,THREE,FOUR");

    // Joystick state
    this.joyActive = false;
    this.joyX = 0; this.joyY = 0;
    this.joyBase = { x: 70, y: this.scale.height - 90 };
    this.joyRadius = 40;
    this.joyPointer = null;

    // Interact button
    this.btnBase = { x: this.scale.width - 55, y: this.scale.height - 70 };
    this.btnRadius = 30;

    // Touch input
    this.input.on("pointerdown", function (ptr) {
      var dx = ptr.x - self.joyBase.x, dy = ptr.y - self.joyBase.y;
      if (Math.sqrt(dx * dx + dy * dy) < self.joyRadius * 2) {
        self.joyActive = true; self.joyPointer = ptr.id;
      }
      var bx = ptr.x - self.btnBase.x, by = ptr.y - self.btnBase.y;
      if (Math.sqrt(bx * bx + by * by) < self.btnRadius * 1.5) {
        doInteract();
      }
    });
    this.input.on("pointermove", function (ptr) {
      if (self.joyActive && ptr.id === self.joyPointer) {
        var dx = ptr.x - self.joyBase.x, dy = ptr.y - self.joyBase.y;
        var d = Math.sqrt(dx * dx + dy * dy);
        if (d > self.joyRadius) { dx = dx / d * self.joyRadius; dy = dy / d * self.joyRadius }
        self.joyX = dx / self.joyRadius;
        self.joyY = dy / self.joyRadius;
      }
    });
    this.input.on("pointerup", function (ptr) {
      if (ptr.id === self.joyPointer) {
        self.joyActive = false; self.joyX = 0; self.joyY = 0; self.joyPointer = null;
      }
    });

    // Resize handler
    this.scale.on("resize", function (sz) {
      self.joyBase = { x: 70, y: sz.height - 90 };
      self.btnBase = { x: sz.width - 55, y: sz.height - 70 };
    });

    // Narrative
    this.narrative = null;
    this.narrText = this.add.text(0, 0, "", {
      fontSize: "11px", fontFamily: "'Courier New',monospace", color: "#c8c0b4",
      wordWrap: { width: this.scale.width - 40 }, lineSpacing: 3
    }).setScrollFactor(0).setDepth(1002).setAlpha(0);

    this.lastInteract = 0;
    this.biomeLabel = "";
    this.biomeLabelT = 0;
  },

  update: function (time, delta) {
    var dt = delta / 16.67; // normalize to ~60fps
    G.time = time / 1000;
    var sw = this.scale.width, sh = this.scale.height;

    // Day cycle
    G.dayT = (G.dayT + 0.00001 * dt) % 1;
    var hr = G.dayT * 24;
    var dL = hr < 5 ? 0.15 : hr < 7 ? 0.15 + (hr - 5) / 2 * 0.85 : hr > 20 ? 1 - (hr - 20) / 4 * 0.85 : hr > 19 ? 1 - (hr - 19) * 0.15 : 1;

    // ── INPUT ──
    var mx = 0, my = 0;
    if (!G.invOpen && !G.menuOpen && !G.intr) {
      // Keyboard (iso mapping)
      if (this.keys.W.isDown || this.cursors.up.isDown) { mx--; my-- }
      if (this.keys.S.isDown || this.cursors.down.isDown) { mx++; my++ }
      if (this.keys.A.isDown || this.cursors.left.isDown) { mx--; my++ }
      if (this.keys.D.isDown || this.cursors.right.isDown) { mx++; my-- }
      // Joystick (convert screen → iso)
      if (this.joyActive && (Math.abs(this.joyX) > 0.15 || Math.abs(this.joyY) > 0.15)) {
        mx += (this.joyX + this.joyY) * 0.7;
        my += (-this.joyX + this.joyY) * 0.7;
      }
    }

    // Keyboard shortcuts
    if (Phaser.Input.Keyboard.JustDown(this.keys.I)) { G.invOpen = !G.invOpen; G.invSel = 0 }
    if (Phaser.Input.Keyboard.JustDown(this.keys.ESC)) {
      if (G.menuOpen) G.menuOpen = false;
      else if (G.invOpen) G.invOpen = false;
      else if (G.intr) { G.intr = null; G.room = null }
      else { G.menuOpen = true; G.menuPage = "main" }
    }
    if (Phaser.Input.Keyboard.JustDown(this.keys.E) || Phaser.Input.Keyboard.JustDown(this.keys.SPACE)) doInteract();

    // ── MOVEMENT ──
    var moving = mx !== 0 || my !== 0;
    if (moving) {
      var spd = G.mounted ? G.mountSpd : SPD;
      var ln = Math.sqrt(mx * mx + my * my);
      var dx2 = mx / ln * spd * dt, dy2 = my / ln * spd * dt;
      // Swimming
      var curTile = world.tile(Math.floor(G.px), Math.floor(G.py));
      if (curTile === 8) { dx2 *= 0.35; dy2 *= 0.35 }
      // Collision
      var nextTile = world.tile(Math.floor(G.px + dx2), Math.floor(G.py + dy2));
      if (nextTile !== 3) { G.px += dx2; G.py += dy2 }
      else {
        if (world.tile(Math.floor(G.px + dx2), Math.floor(G.py)) !== 3) G.px += dx2;
        if (world.tile(Math.floor(G.px), Math.floor(G.py + dy2)) !== 3) G.py += dy2;
      }
      G.dw += spd * dt;
      G.tv.add((G.px | 0) + "," + (G.py | 0));
      // Facing
      if (mx > 0 && my > 0) G.facing = 0;
      else if (mx > 0 && my < 0) G.facing = 3;
      else if (mx < 0 && my > 0) G.facing = 1;
      else if (mx < 0 && my < 0) G.facing = 2;
    }

    // Nearest POI
    G.nearPoi = null; var nd = IR;
    var visChunks = world.vis(G.px, G.py);
    for (var ci = 0; ci < visChunks.length; ci++) {
      var ch = visChunks[ci];
      for (var pi = 0; pi < ch.poi.length; pi++) {
        var p = ch.poi[pi];
        var d = Math.sqrt((p.x - G.px) * (p.x - G.px) + (p.y - G.py) * (p.y - G.py));
        if (d < nd) { nd = d; G.nearPoi = p }
      }
    }

    // Biome label
    var bio = getCurBio();
    if (bio && bio !== this.lastBio) {
      this.lastBio = bio;
      this.biomeLabel = BIOME_NAMES[bio] || "";
      this.biomeLabelT = G.time;
    }

    // ── CAMERA ──
    var camTarget = iso(G.px, G.py);
    this.cameras.main.scrollX += (camTarget.sx - sw / 2 - this.cameras.main.scrollX) * 0.08 * dt;
    this.cameras.main.scrollY += (camTarget.sy - sh / 2 - this.cameras.main.scrollY) * 0.08 * dt;

    // ── RENDER WORLD ──
    var gfx = this.gfx;
    gfx.clear();

    var camX = this.cameras.main.scrollX;
    var camY = this.cameras.main.scrollY;
    var viewL = camX - 60, viewR = camX + sw + 60;
    var viewT = camY - 60, viewB = camY + sh + 120;

    // Tiles
    for (var ci = 0; ci < visChunks.length; ci++) {
      var ch = visChunks[ci];
      for (var ly = 0; ly < CH; ly++) for (var lx = 0; lx < CH; lx++) {
        var gx = ch.cx * CH + lx, gy = ch.cy * CH + ly;
        var tile = world.tile(gx, gy);
        if (tile === 0) continue;
        var p = iso(gx, gy);
        if (p.sx < viewL || p.sx > viewR || p.sy < viewT || p.sy > viewB) continue;

        // Get color with biome tint
        var col = TILE_COLORS[tile] || 0x202020;
        if (BIOME_TINTS[ch.bio] && BIOME_TINTS[ch.bio][tile]) col = BIOME_TINTS[ch.bio][tile];

        // Apply day/night
        var r = ((col >> 16) & 0xff) * dL | 0;
        var g = ((col >> 8) & 0xff) * dL | 0;
        var b = (col & 0xff) * dL | 0;

        // Draw isometric diamond
        gfx.fillStyle((r << 16) | (g << 8) | b, 1);
        gfx.fillTriangle(p.sx, p.sy - TH, p.sx + TW, p.sy, p.sx, p.sy + TH);
        gfx.fillTriangle(p.sx, p.sy - TH, p.sx - TW, p.sy, p.sx, p.sy + TH);

        // Water shimmer
        if (tile === 8) {
          var wa = 0.05 + Math.sin(G.time * 2 + gx * 0.7 + gy * 0.5) * 0.03;
          gfx.fillStyle(0x3060a0, wa);
          gfx.fillTriangle(p.sx, p.sy - TH, p.sx + TW, p.sy, p.sx, p.sy + TH);
          gfx.fillTriangle(p.sx, p.sy - TH, p.sx - TW, p.sy, p.sx, p.sy + TH);
        }
      }

      // Buildings
      for (var bi = 0; bi < ch.bl.length; bi++) {
        var bld = ch.bl[bi];
        var bp = iso(bld.x, bld.y);
        if (bp.sx < viewL - 100 || bp.sx > viewR + 100) continue;
        var br2 = iso(bld.x + bld.w, bld.y + bld.d);
        var m = 0.6 + dL * 0.4;
        var sc = bld.rural ? [110, 85, 55] : DST[bld.di] || [80, 80, 90];
        var fr = (sc[0] * m | 0), fg = (sc[1] * m | 0), fb = (sc[2] * m | 0);
        var dr = (sc[0] * m * 0.7 | 0), dg = (sc[1] * m * 0.7 | 0), db = (sc[2] * m * 0.7 | 0);

        var tl = iso(bld.x, bld.y), tr = iso(bld.x + bld.w, bld.y);
        var bl2 = iso(bld.x, bld.y + bld.d), front = iso(bld.x + bld.w, bld.y + bld.d);
        var h = bld.h * (TH / 15); // scale height with tile size

        // Top face
        gfx.fillStyle((fr << 16) | (fg << 8) | fb, 1);
        gfx.fillTriangle(tl.sx, tl.sy - h, tr.sx, tr.sy - h, front.sx, front.sy - h);
        gfx.fillTriangle(tl.sx, tl.sy - h, bl2.sx, bl2.sy - h, front.sx, front.sy - h);

        // Right face
        gfx.fillStyle((dr << 16) | (dg << 8) | db, 1);
        gfx.beginPath();
        gfx.moveTo(front.sx, front.sy - h); gfx.lineTo(tr.sx, tr.sy - h);
        gfx.lineTo(tr.sx, tr.sy); gfx.lineTo(front.sx, front.sy);
        gfx.closePath(); gfx.fillPath();

        // Left face
        var lr = (dr * 0.8 | 0), lg2 = (dg * 0.8 | 0), lb = (db * 0.8 | 0);
        gfx.fillStyle((lr << 16) | (lg2 << 8) | lb, 1);
        gfx.beginPath();
        gfx.moveTo(front.sx, front.sy - h); gfx.lineTo(bl2.sx, bl2.sy - h);
        gfx.lineTo(bl2.sx, bl2.sy); gfx.lineTo(front.sx, front.sy);
        gfx.closePath(); gfx.fillPath();

        // Windows (night)
        if (dL < 0.7) {
          var winCol = 0xffc840;
          var wAlpha = (0.7 - dL) * 0.8;
          gfx.fillStyle(winCol, wAlpha);
          // Right face windows
          for (var wy = 0; wy < bld.flr && wy < 6; wy++) {
            var wyp = front.sy - h + (wy + 0.3) * h / bld.flr;
            if (Math.random() < 0.4) {
              gfx.fillRect(front.sx - 3, wyp, 2, 2);
              gfx.fillRect(front.sx - 7, wyp, 2, 2);
            }
          }
        }
      }

      // Trees
      for (var ti = 0; ti < ch.trees.length; ti++) {
        var tr2 = ch.trees[ti];
        var tp = iso(tr2.x + 0.5, tr2.y + 0.5);
        if (tp.sx < viewL || tp.sx > viewR || tp.sy < viewT || tp.sy > viewB) continue;
        var m = 0.6 + dL * 0.4;
        // Trunk
        gfx.fillStyle(((60 * m | 0) << 16) | ((42 * m | 0) << 8) | (25 * m | 0), 1);
        gfx.fillRect(tp.sx - 1, tp.sy - 8, 2, 8);
        // Canopy
        var isBio = ch.bio;
        var cr2 = isBio === "jungle" ? 25 : isBio === "snow" || isBio === "tundra" ? 60 : 30;
        var cg = isBio === "jungle" ? 70 : isBio === "snow" || isBio === "tundra" ? 80 : 58;
        var cb2 = isBio === "jungle" ? 18 : isBio === "snow" || isBio === "tundra" ? 70 : 22;
        gfx.fillStyle(((cr2 * m | 0) << 16) | ((cg * m | 0) << 8) | (cb2 * m | 0), 1);
        gfx.fillCircle(tp.sx, tp.sy - 12, 5);
        gfx.fillCircle(tp.sx - 2, tp.sy - 10, 4);
        gfx.fillCircle(tp.sx + 2, tp.sy - 10, 4);
      }

      // Props
      for (var pi2 = 0; pi2 < ch.props.length; pi2++) {
        var pr = ch.props[pi2];
        var pp = iso(pr.x, pr.y);
        if (pp.sx < viewL || pp.sx > viewR || pp.sy < viewT || pp.sy > viewB) continue;
        var m = 0.6 + dL * 0.4;
        drawPropPhaser(gfx, pr, pp, m, G.time);
      }
    }

    // ── PLAYER ──
    var playerP = iso(G.px, G.py);
    var curTile2 = world.tile(Math.floor(G.px), Math.floor(G.py));
    var inWater = curTile2 === 8;
    var pm = 0.6 + dL * 0.4;
    var bob = moving ? Math.abs(Math.sin(G.time * 8)) * 2 : 0;

    if (inWater) {
      // Water overlay
      gfx.fillStyle(0x2040a0, 0.35);
      gfx.fillEllipse(playerP.sx, playerP.sy, 16, 6);
      // Only draw upper body
      gfx.fillStyle(0x343640, 1);
      gfx.fillRect(playerP.sx - 3, playerP.sy - 14 - bob, 6, 8);
      gfx.fillStyle(0xc8beb4, 1);
      gfx.fillCircle(playerP.sx, playerP.sy - 16 - bob, 3);
    } else {
      // Shadow
      gfx.fillStyle(0x000000, 0.12);
      gfx.fillEllipse(playerP.sx, playerP.sy + 1, 8, 3);
      // Legs
      var leg = moving ? Math.sin(G.time * 10) * 2 : 0;
      gfx.lineStyle(1.5, 0x222230, 1);
      gfx.lineBetween(playerP.sx - 1, playerP.sy - 6 - bob, playerP.sx - 2 - leg, playerP.sy);
      gfx.lineBetween(playerP.sx + 1, playerP.sy - 6 - bob, playerP.sx + 2 + leg, playerP.sy);
      // Body
      gfx.fillStyle(0x343640, 1);
      gfx.fillRect(playerP.sx - 3, playerP.sy - 15 - bob, 6, 9);
      // Arms
      var arm = moving ? Math.sin(G.time * 10 + 1) * 1.5 : 0;
      gfx.lineStyle(1.2, 0x343640, 1);
      gfx.lineBetween(playerP.sx - 3, playerP.sy - 13 - bob, playerP.sx - 5 - arm, playerP.sy - 8 - bob);
      gfx.lineBetween(playerP.sx + 3, playerP.sy - 13 - bob, playerP.sx + 5 + arm, playerP.sy - 8 - bob);
      // Head
      gfx.fillStyle(0xc8beb4, 1);
      gfx.fillCircle(playerP.sx, playerP.sy - 18 - bob, 3);
      gfx.fillStyle(0x222028, 1);
      gfx.fillCircle(playerP.sx, playerP.sy - 19 - bob, 3);// hair
    }

    // ── UI ──
    var ui = this.uiGfx;
    ui.clear();

    // Joystick
    ui.fillStyle(0x444466, 0.15);
    ui.fillCircle(this.joyBase.x, this.joyBase.y, this.joyRadius);
    ui.lineStyle(1, 0x666688, 0.2);
    ui.strokeCircle(this.joyBase.x, this.joyBase.y, this.joyRadius);
    if (this.joyActive) {
      ui.fillStyle(0xaaaacc, 0.25);
      ui.fillCircle(this.joyBase.x + this.joyX * this.joyRadius, this.joyBase.y + this.joyY * this.joyRadius, 14);
    }

    // Interact button
    var hasNear = !!G.nearPoi;
    var pulse = hasNear ? 0.55 + Math.sin(G.time * 3) * 0.15 : 0.1;
    ui.fillStyle(hasNear ? 0xffd866 : 0x444444, pulse * 0.5);
    ui.fillCircle(this.btnBase.x, this.btnBase.y, hasNear ? this.btnRadius : this.btnRadius - 4);
    ui.lineStyle(1.5, hasNear ? 0xffcc44 : 0x555555, hasNear ? 0.5 : 0.15);
    ui.strokeCircle(this.btnBase.x, this.btnBase.y, hasNear ? this.btnRadius : this.btnRadius - 4);

    // Button label
    this.uiText.setPosition(this.btnBase.x, this.btnBase.y - 4);
    this.uiText.setOrigin(0.5).setFontSize(hasNear ? 16 : 14);
    this.uiText.setText(hasNear ? "?" : "·");
    this.uiText.setAlpha(hasNear ? 0.8 : 0.3);

    // Nearby POI label
    if (G.nearPoi) {
      var label = G.nearPoi.desc || G.nearPoi.tp;
      var poiLabel = this.add.text ? null : null; // reuse text
      // Draw with uiGfx text
    }

    // Biome label
    if (this.biomeLabel && G.time - this.biomeLabelT < 4) {
      var ba = G.time - this.biomeLabelT;
      var alpha = ba < 1 ? ba : ba > 3 ? 4 - ba : 1;
      // Draw centered biome name
      ui.fillStyle(0xc8c0b4, alpha * 0.25);
      // Simple rectangle as backdrop
      var bw2 = this.biomeLabel.length * 6;
      ui.fillRect(sw / 2 - bw2, sh * 0.15 - 8, bw2 * 2, 16);
    }

    // Inventory count
    if (G.inv.length > 0) {
      ui.fillStyle(0xc8c0b4, 0.4);
      ui.fillRect(10, 8, 30, 18);
      ui.lineStyle(0.5, 0xc8c0b4, 0.2);
      ui.strokeRect(10, 8, 30, 18);
    }

    // Menu hamburger
    ui.fillStyle(0xc8c0b4, 0.25);
    ui.fillRect(sw - 30, 10, 16, 2);
    ui.fillRect(sw - 30, 15, 16, 2);
    ui.fillRect(sw - 30, 20, 16, 2);

    // Narrative display
    if (this.narrative) {
      this.narrText.setAlpha(0.7);
      this.narrText.setPosition(20, sh - 100);
      this.narrText.setText(this.narrative);
      this.narrText.setWordWrapWidth(sw - 40);
    } else {
      this.narrText.setAlpha(0);
    }

    // Gauges
    var gy2 = 35;
    var gaugeKeys = Object.keys(G.gauges);
    for (var gi = 0; gi < gaugeKeys.length; gi++) {
      var gk = gaugeKeys[gi];
      var gv = G.gauges[gk];
      var pct = Math.max(0, gv.val / gv.max);
      ui.fillStyle(0x222233, 0.3);
      ui.fillRect(10, gy2, 60, 6);
      ui.fillStyle(pct > 0.5 ? 0x508040 : pct > 0.2 ? 0xa09030 : 0xa03030, 0.5);
      ui.fillRect(10, gy2, 60 * pct, 6);
      gy2 += 10;
    }

    // Gauge decay
    if (G.gauges.faim) G.gauges.faim.val = Math.max(0, G.gauges.faim.val - dt * 0.0008);
    if (G.gauges.soif) G.gauges.soif.val = Math.max(0, G.gauges.soif.val - dt * 0.001);

    // Save periodically
    if (Math.floor(G.time) % 10 === 0) save();
  }
});

// ── PROP RENDERER ──
function drawPropPhaser(gfx, pr, p, m, time) {
  if (pr.tp === "rock") {
    gfx.fillStyle(((65 * m | 0) << 16) | ((62 * m | 0) << 8) | (58 * m | 0), 1);
    gfx.fillCircle(p.sx, p.sy - 2, 3);
    gfx.fillCircle(p.sx + 2, p.sy - 1, 2);
  } else if (pr.tp === "flower") {
    gfx.fillStyle(0x30600a, m);
    gfx.fillRect(p.sx, p.sy - 4, 1, 4);
    var fc = [0xdd4466, 0xeeaa33, 0x8844cc, 0xee6688][((p.sx * 7 + p.sy * 13) & 3)];
    gfx.fillStyle(fc, m * 0.8);
    gfx.fillCircle(p.sx, p.sy - 5, 2);
  } else if (pr.tp === "mush") {
    gfx.fillStyle(((60 * m | 0) << 16) | ((45 * m | 0) << 8) | (30 * m | 0), 1);
    gfx.fillRect(p.sx, p.sy - 3, 1, 3);
    gfx.fillStyle(((140 * m | 0) << 16) | ((45 * m | 0) << 8) | (35 * m | 0), 1);
    gfx.fillEllipse(p.sx, p.sy - 4, 4, 2);
  } else if (pr.tp === "berry") {
    gfx.fillStyle(((30 * m | 0) << 16) | ((65 * m | 0) << 8) | (20 * m | 0), 1);
    gfx.fillEllipse(p.sx, p.sy - 3, 6, 4);
    gfx.fillStyle(((160 * m | 0) << 16) | ((30 * m | 0) << 8) | (40 * m | 0), 1);
    gfx.fillCircle(p.sx - 1, p.sy - 3, 1); gfx.fillCircle(p.sx + 1, p.sy - 4, 1);
  } else if (pr.tp === "cactus") {
    gfx.fillStyle(((35 * m | 0) << 16) | ((70 * m | 0) << 8) | (28 * m | 0), 1);
    gfx.fillRect(p.sx - 1, p.sy - 10, 2, 10);
    gfx.fillRect(p.sx - 4, p.sy - 7, 3, 1.5);
    gfx.fillRect(p.sx + 2, p.sy - 5, 3, 1.5);
  } else if (pr.tp === "stick") {
    gfx.lineStyle(1, ((65 * m | 0) << 16) | ((45 * m | 0) << 8) | (25 * m | 0), 1);
    gfx.lineBetween(p.sx - 4, p.sy, p.sx + 3, p.sy - 2);
  } else if (pr.tp === "campfire") {
    gfx.fillStyle(0x222218, 0.4 * m);
    gfx.fillEllipse(p.sx, p.sy, 6, 3);
    // Stones
    gfx.fillStyle(((50 * m | 0) << 16) | ((48 * m | 0) << 8) | (44 * m | 0), 1);
    for (var ci = 0; ci < 5; ci++) { var a = ci / 5 * Math.PI * 2; gfx.fillCircle(p.sx + Math.cos(a) * 4, p.sy + Math.sin(a) * 1.5, 1) }
  } else if (pr.tp === "fireActive") {
    gfx.fillStyle(0x222218, 0.4 * m);
    gfx.fillEllipse(p.sx, p.sy, 6, 3);
    // Flames
    var ff = time * 6;
    gfx.fillStyle(0xffb428, 0.6 + Math.sin(ff) * 0.1);
    gfx.fillTriangle(p.sx - 2, p.sy, p.sx, p.sy - 8 - Math.sin(ff) * 2, p.sx + 2, p.sy);
    gfx.fillStyle(0xff6414, 0.4);
    gfx.fillTriangle(p.sx, p.sy, p.sx + 1, p.sy - 6 - Math.sin(ff + 2) * 1.5, p.sx + 3, p.sy);
    // Glow
    gfx.fillStyle(0xff9030, 0.04);
    gfx.fillCircle(p.sx, p.sy - 3, 20);
  } else if (pr.isAnimal) {
    // Animal rendering
    var ac = {
      bird: 0x705030, deer: 0x906838, rabbit: 0x908068, frog: 0x308028,
      parrot: 0x28b032, snake: 0x3c5a28, gazelle: 0xb49664, wolf: 0x504b46,
      horse: 0x6e5032, eagle: 0x372818, cow: 0x8a7a6a, chicken: 0xc8b488
    }[pr.tp] || 0x666666;
    var ar = ((ac >> 16) & 0xff) * m | 0, ag = ((ac >> 8) & 0xff) * m | 0, ab2 = (ac & 0xff) * m | 0;
    gfx.fillStyle((ar << 16) | (ag << 8) | ab2, 1);
    if (pr.tp === "bird" || pr.tp === "parrot" || pr.tp === "eagle") {
      gfx.fillEllipse(p.sx, p.sy - 3, 3, 2);
    } else if (pr.tp === "frog") {
      gfx.fillEllipse(p.sx, p.sy - 1, 3, 2);
    } else if (pr.tp === "snake") {
      gfx.lineStyle(1.5, (ar << 16) | (ag << 8) | ab2, 1);
      gfx.lineBetween(p.sx - 3, p.sy, p.sx + 4, p.sy - 1);
    } else {
      // Quadruped body
      gfx.fillEllipse(p.sx, p.sy - 3, 5, 3);
      gfx.fillCircle(p.sx + 3, p.sy - 4, 2);// head
      // Legs
      gfx.lineStyle(0.8, (ar * 0.7 << 16) | (ag * 0.7 << 8) | (ab2 * 0.7), 1);
      gfx.lineBetween(p.sx - 2, p.sy - 1, p.sx - 2, p.sy + 2);
      gfx.lineBetween(p.sx + 1, p.sy - 1, p.sx + 1, p.sy + 2);
    }
  } else if (pr.tp === "blockWood") {
    gfx.fillStyle(((70 * m | 0) << 16) | ((48 * m | 0) << 8) | (28 * m | 0), 1);
    gfx.fillRect(p.sx - TW * 0.4, p.sy - 8, TW * 0.8, 8);
    gfx.fillStyle(((55 * m | 0) << 16) | ((38 * m | 0) << 8) | (20 * m | 0), 1);
    gfx.fillRect(p.sx - TW * 0.4, p.sy - 8, TW * 0.8, 3);
  } else if (pr.tp === "blockStone") {
    gfx.fillStyle(((65 * m | 0) << 16) | ((62 * m | 0) << 8) | (58 * m | 0), 1);
    gfx.fillRect(p.sx - TW * 0.4, p.sy - 8, TW * 0.8, 8);
    gfx.fillStyle(((50 * m | 0) << 16) | ((48 * m | 0) << 8) | (45 * m | 0), 1);
    gfx.fillRect(p.sx - TW * 0.4, p.sy - 8, TW * 0.8, 3);
  }
}

// ── INTERACTION ──
function doInteract() {
  if (G.busy || G.time - (G.lastIT || 0) < 1) return;
  G.lastIT = G.time;

  var p = G.nearPoi;
  if (!p) return;

  if (p.tp === "resource") {
    // Collect resource
    var glyph = RES_GLYPH[p.rtp] || "·";
    var tags = RES_TAGS[p.rtp] || "";
    G.inv.push({ desc: p.desc, glyph: glyph, id: p.id, tags: tags });
    // Remove POI
    var chunks = world.vis(G.px, G.py);
    for (var i = 0; i < chunks.length; i++) chunks[i].poi = chunks[i].poi.filter(function (pp) { return pp.id !== p.id });
    showNarrative("Cueilli: " + p.desc);
    save();
    return;
  }

  if (p.tp === "object") {
    var obj = G.objs.find(function (o) { return o.id === p.id });
    if (obj && obj.pickable) {
      G.inv.push({ desc: obj.desc, glyph: obj.glyph || "?", id: obj.id });
      G.objs = G.objs.filter(function (o) { return o.id !== p.id });
      var chunks = world.vis(G.px, G.py);
      for (var i = 0; i < chunks.length; i++) chunks[i].poi = chunks[i].poi.filter(function (pp) { return pp.id !== p.id });
      showNarrative("Ramassé: " + obj.desc);
      save();
      return;
    }
  }

  // Ask Director
  G.busy = true;
  var desc = p.desc || p.tp;
  var action = "Le joueur interagit avec: " + desc;
  if (p.tp === "door") action = "Le joueur ouvre une porte.";
  if (p.tp === "animal") action = "Le joueur s'approche d'un " + p.desc + " sauvage.";

  callDir(action, function (r) {
    G.busy = false;
    if (r) {
      if (r.narrative) showNarrative(r.narrative);
      if (r.choices && r.choices.length >= 2) { G.choices = r.choices.slice(0, 4) }
      if (r.gauges_create) {
        for (var i = 0; i < r.gauges_create.length; i++) {
          var gn = r.gauges_create[i];
          if (!G.gauges[gn]) G.gauges[gn] = { val: 70, max: 100, born: G.time };
        }
      }
      if (r.gauges_update) { for (var gk in r.gauges_update) if (G.gauges[gk]) G.gauges[gk].val = Math.max(0, Math.min(100, G.gauges[gk].val + r.gauges_update[gk])) }
      if (r.skills_unlock) { for (var i = 0; i < r.skills_unlock.length; i++) if (G.skills.indexOf(r.skills_unlock[i]) < 0) G.skills.push(r.skills_unlock[i]) }
      if (r.intent_observed) G.intents.push(r.intent_observed);
      if (r.weather) G.wth = r.weather;
    } else {
      showNarrative("...");
    }
    save();
  });
}

var _narrTimeout = null;
function showNarrative(text) {
  if (_narrTimeout) clearTimeout(_narrTimeout);
  // Access scene to show narrative
  var scene = game.scene.getScene("game");
  if (scene) {
    scene.narrative = text;
    _narrTimeout = setTimeout(function () { scene.narrative = null }, 5000);
  }
}

// ═══ PHASER CONFIG ═══
var game = new Phaser.Game({
  type: Phaser.AUTO,
  width: window.innerWidth,
  height: window.innerHeight,
  backgroundColor: "#060610",
  scene: [GameScene],
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  input: { activePointers: 3 },
  render: { antialias: false, pixelArt: true }
});
