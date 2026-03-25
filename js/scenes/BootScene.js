// ═══ CHRONIQUES D'ARKANIS — BOOT SCENE ═══
// Generates all pixel art sprites procedurally — zero external sprite dependencies
"use strict";

var BootScene = new Phaser.Class({
  Extends: Phaser.Scene,
  initialize: function() { Phaser.Scene.call(this, { key: "Boot" }); },

  preload: function() {
    var self = this;
    var bar = document.getElementById("loadbar");
    this.load.on("progress", function(v) { if (bar) bar.style.width = (v * 100) + "%"; });
    
    // Load existing audio from repo
    var ambients = ["nature","ruins","snow","volcanic","city_night","rain","storm"];
    var musics = ["mus_explore","mus_mystery","mus_solitude","mus_danger","mus_dark","mus_peace","mus_menu"];
    for (var i = 0; i < ambients.length; i++) {
      this.load.audio(ambients[i], "assets/amb_" + ambients[i] + ".wav");
    }
    for (var i = 0; i < musics.length; i++) {
      this.load.audio(musics[i], "assets/" + musics[i] + ".wav");
    }
    // SFX
    var sfx = ["pickup","choice","sfx_collect","sfx_death","sfx_craft"];
    for (var i = 0; i < sfx.length; i++) {
      var k = sfx[i];
      this.load.audio(k, "assets/" + (k.indexOf("sfx_") === 0 ? k : "sfx_" + k) + ".wav");
    }
  },

  create: function() {
    // ─── GENERATE ALL SPRITES PROCEDURALLY ───
    this._genPlayerSprite();
    this._genEnemySprites();
    this._genTileSprites();
    this._genUISprites();
    this._genNPCSprites();
    this._genEffectSprites();

    // Remove loading screen
    var el = document.getElementById("loading");
    if (el) el.style.display = "none";

    // Check for save
    var hasSave = PLAYER.load();
    if (hasSave) {
      this.scene.start("World");
    } else {
      this.scene.start("World", { showIntro: true });
    }
  },

  // ─── SPRITE GENERATORS ───

  _px: function(canvas, x, y, color, alpha) {
    var ctx = canvas.getContext("2d");
    var r = (color >> 16) & 0xff, g = (color >> 8) & 0xff, b = color & 0xff;
    ctx.fillStyle = "rgba(" + r + "," + g + "," + b + "," + (alpha || 1) + ")";
    ctx.fillRect(x, y, 1, 1);
  },

  _rect: function(canvas, x, y, w, h, color, alpha) {
    var ctx = canvas.getContext("2d");
    var r = (color >> 16) & 0xff, g = (color >> 8) & 0xff, b = color & 0xff;
    ctx.fillStyle = "rgba(" + r + "," + g + "," + b + "," + (alpha || 1) + ")";
    ctx.fillRect(x, y, w, h);
  },

  _genPlayerSprite: function() {
    // 4 frames: down, left, right, up × 2 walk frames = 8 frames
    // Each frame 16x16
    var canvas = document.createElement("canvas");
    canvas.width = 128; canvas.height = 16;
    var frames = [
      // down0, down1, left0, left1, right0, right1, up0, up1
    ];
    for (var f = 0; f < 8; f++) {
      var ox = f * 16;
      var step = f % 2;
      // Body (blue tunic)
      this._rect(canvas, ox + 5, 5, 6, 7, 0x3355aa);
      // Head
      this._rect(canvas, ox + 6, 2, 4, 4, 0xddbb88);
      // Hair
      this._rect(canvas, ox + 6, 1, 4, 2, 0x553322);
      // Legs
      var lx = step ? 1 : 0;
      this._rect(canvas, ox + 6 - lx, 12, 2, 3, 0x443322);
      this._rect(canvas, ox + 9 + lx, 12, 2, 3, 0x443322);
      // Arms
      if (f < 2) { // down
        this._rect(canvas, ox + 4, 6, 1, 4, 0xddbb88);
        this._rect(canvas, ox + 11, 6, 1, 4, 0xddbb88);
        // Eyes
        this._px(canvas, ox + 7, 3, 0x222222);
        this._px(canvas, ox + 9, 3, 0x222222);
      } else if (f < 4) { // left
        this._rect(canvas, ox + 4, 6, 1, 4, 0xddbb88);
        this._px(canvas, ox + 7, 3, 0x222222);
      } else if (f < 6) { // right
        this._rect(canvas, ox + 11, 6, 1, 4, 0xddbb88);
        this._px(canvas, ox + 9, 3, 0x222222);
      } else { // up
        this._rect(canvas, ox + 4, 6, 1, 4, 0xddbb88);
        this._rect(canvas, ox + 11, 6, 1, 4, 0xddbb88);
        this._rect(canvas, ox + 6, 1, 4, 3, 0x553322); // hair covers face
      }
    }
    this.textures.addSpriteSheet("player", canvas, { frameWidth: 16, frameHeight: 16 });
  },

  _genEnemySprites: function() {
    var self = this;
    var names = Object.keys(ENEMIES);
    for (var i = 0; i < names.length; i++) {
      var key = names[i];
      var e = ENEMIES[key];
      var canvas = document.createElement("canvas");
      canvas.width = e.w * 2; canvas.height = e.h; // 2 frames: idle, hit
      
      // Frame 0: idle
      if (e.ai === "wander" || key === "slime") {
        // Blob shape
        this._rect(canvas, 1, e.h - 8, e.w - 2, 6, e.color);
        this._rect(canvas, 2, e.h - 10, e.w - 4, 3, e.color);
        this._px(canvas, 3, e.h - 8, 0xffffff);
        this._px(canvas, e.w - 4, e.h - 8, 0xffffff);
      } else if (e.isBoss) {
        // Larger, more detailed
        this._rect(canvas, 2, 2, e.w - 4, e.h - 4, e.color);
        this._rect(canvas, 4, 0, e.w - 8, 2, e.color);
        // Eyes
        this._rect(canvas, 5, 4, 3, 2, 0xff0000);
        this._rect(canvas, e.w - 8, 4, 3, 2, 0xff0000);
        // Crown/horns for bosses
        this._px(canvas, 4, 0, 0xffcc00);
        this._px(canvas, e.w - 5, 0, 0xffcc00);
      } else {
        // Humanoid enemies
        this._rect(canvas, Math.floor(e.w / 2) - 3, 0, 6, 5, e.color); // head
        this._rect(canvas, Math.floor(e.w / 2) - 4, 5, 8, e.h - 9, e.color); // body
        this._rect(canvas, Math.floor(e.w / 2) - 2, e.h - 4, 2, 4, e.color); // legs
        this._rect(canvas, Math.floor(e.w / 2) + 1, e.h - 4, 2, 4, e.color);
        this._px(canvas, Math.floor(e.w / 2) - 1, 2, 0xff2222); // eye
        this._px(canvas, Math.floor(e.w / 2) + 1, 2, 0xff2222);
      }
      
      // Frame 1: hit flash (white tinted)
      var ctx = canvas.getContext("2d");
      var imgData = ctx.getImageData(0, 0, e.w, e.h);
      var hitData = ctx.createImageData(e.w, e.h);
      for (var p = 0; p < imgData.data.length; p += 4) {
        if (imgData.data[p + 3] > 0) {
          hitData.data[p] = Math.min(255, imgData.data[p] + 128);
          hitData.data[p + 1] = Math.min(255, imgData.data[p + 1] + 128);
          hitData.data[p + 2] = Math.min(255, imgData.data[p + 2] + 128);
          hitData.data[p + 3] = imgData.data[p + 3];
        }
      }
      ctx.putImageData(hitData, e.w, 0);
      
      this.textures.addSpriteSheet("enemy_" + key, canvas, { frameWidth: e.w, frameHeight: e.h });
    }
  },

  _genTileSprites: function() {
    var zones = Object.keys(CFG.ZONE_COLORS);
    for (var z = 0; z < zones.length; z++) {
      var zk = zones[z];
      var c = CFG.ZONE_COLORS[zk];
      var canvas = document.createElement("canvas");
      canvas.width = 64; canvas.height = 16; // 4 tiles: floor, wall, exit, special

      // Floor tile with subtle noise
      for (var py = 0; py < 16; py++) for (var px = 0; px < 16; px++) {
        var noise = ((px * 7 + py * 13 + z * 31) % 5) - 2;
        var r = ((c.ground >> 16) & 0xff) + noise;
        var g = ((c.ground >> 8) & 0xff) + noise;
        var b = (c.ground & 0xff) + noise;
        var ctx = canvas.getContext("2d");
        ctx.fillStyle = "rgb(" + Math.max(0, Math.min(255, r)) + "," + Math.max(0, Math.min(255, g)) + "," + Math.max(0, Math.min(255, b)) + ")";
        ctx.fillRect(px, py, 1, 1);
      }
      // Wall tile
      this._rect(canvas, 16, 0, 16, 16, c.wall);
      this._rect(canvas, 16, 0, 16, 2, c.accent, 0.3);
      this._rect(canvas, 16, 14, 16, 2, 0x000000, 0.2);
      // Exit tile (glowing)
      this._rect(canvas, 32, 0, 16, 16, c.ground);
      this._rect(canvas, 34, 2, 12, 12, c.accent, 0.4);
      // Water/special
      this._rect(canvas, 48, 0, 16, 16, 0x223344);
      this._rect(canvas, 50, 2, 4, 1, 0x334466, 0.5);
      this._rect(canvas, 54, 8, 6, 1, 0x334466, 0.5);

      this.textures.addSpriteSheet("tiles_" + zk, canvas, { frameWidth: 16, frameHeight: 16 });
    }
  },

  _genUISprites: function() {
    // HUD elements
    var canvas = document.createElement("canvas");
    canvas.width = 64; canvas.height = 16;
    // Heart icon
    this._px(canvas, 1, 1, 0xee2222); this._px(canvas, 2, 0, 0xee2222);
    this._px(canvas, 3, 1, 0xee2222); this._px(canvas, 4, 0, 0xee2222);
    this._px(canvas, 5, 1, 0xee2222);
    this._rect(canvas, 1, 2, 5, 2, 0xee2222);
    this._rect(canvas, 2, 4, 3, 1, 0xee2222);
    this._px(canvas, 3, 5, 0xee2222);
    // XP star
    this._px(canvas, 19, 0, 0xeecc44); this._rect(canvas, 18, 1, 3, 1, 0xeecc44);
    this._rect(canvas, 17, 2, 5, 1, 0xeecc44); this._rect(canvas, 18, 3, 3, 1, 0xeecc44);
    this._px(canvas, 17, 4, 0xeecc44); this._px(canvas, 21, 4, 0xeecc44);
    // Attack slash
    for (var s = 0; s < 8; s++) {
      this._px(canvas, 32 + s, s, 0xffffff, 0.8 - s * 0.1);
    }
    // Potion bottle
    this._rect(canvas, 50, 2, 4, 2, 0x886644);
    this._rect(canvas, 49, 4, 6, 8, 0x44cc44, 0.8);
    this._rect(canvas, 49, 4, 6, 1, 0x88ee88, 0.5);

    this.textures.addSpriteSheet("ui_icons", canvas, { frameWidth: 16, frameHeight: 16 });
  },

  _genNPCSprites: function() {
    var npcs = {
      npc_elder:    { body: 0x446644, head: 0xccaa88, hair: 0xaaaaaa, hat: 0x336633 },
      npc_merchant: { body: 0x886644, head: 0xddbb88, hair: 0x442200, hat: 0xcc8844 },
      npc_ghost:    { body: 0x6688aa, head: 0x8899aa, hair: 0x6677aa, hat: null },
      npc_hermit:   { body: 0x667788, head: 0xccaa88, hair: 0xeeeeee, hat: 0x445566 },
      npc_smith:    { body: 0x884422, head: 0xbb8866, hair: 0x332211, hat: null },
      npc_rebel:    { body: 0x553344, head: 0xddbb88, hair: 0x882222, hat: null },
      npc_save:     { body: 0x6666aa, head: 0xaabb88, hair: 0x4444aa, hat: 0x8888cc }
    };
    var keys = Object.keys(npcs);
    for (var i = 0; i < keys.length; i++) {
      var k = keys[i], n = npcs[k];
      var canvas = document.createElement("canvas");
      canvas.width = 16; canvas.height = 16;
      // Body
      this._rect(canvas, 4, 5, 8, 7, n.body);
      // Head
      this._rect(canvas, 5, 1, 6, 5, n.head);
      // Hair
      this._rect(canvas, 5, 0, 6, 2, n.hair);
      // Hat
      if (n.hat) { this._rect(canvas, 4, 0, 8, 1, n.hat); }
      // Eyes
      this._px(canvas, 6, 3, 0x222222);
      this._px(canvas, 9, 3, 0x222222);
      // Legs
      this._rect(canvas, 5, 12, 2, 3, 0x443322);
      this._rect(canvas, 9, 12, 2, 3, 0x443322);
      this.textures.addImage(k, canvas);
    }
  },

  _genEffectSprites: function() {
    // Slash effect (8 frame animation)
    var canvas = document.createElement("canvas");
    canvas.width = 128; canvas.height = 16;
    for (var f = 0; f < 8; f++) {
      var ox = f * 16;
      var alpha = 1 - f * 0.12;
      var spread = f * 2;
      var ctx = canvas.getContext("2d");
      ctx.strokeStyle = "rgba(255,255,200," + alpha + ")";
      ctx.lineWidth = 2 - f * 0.15;
      ctx.beginPath();
      ctx.arc(ox + 8, 8, 4 + spread, -0.5, 1.5);
      ctx.stroke();
    }
    this.textures.addSpriteSheet("fx_slash", canvas, { frameWidth: 16, frameHeight: 16 });

    // Ingredient sparkle
    var canvas2 = document.createElement("canvas");
    canvas2.width = 48; canvas2.height = 8;
    for (var f2 = 0; f2 < 6; f2++) {
      var ox2 = f2 * 8;
      var a2 = [0.3, 0.6, 1, 0.8, 0.5, 0.2][f2];
      this._px(canvas2, ox2 + 4, 2, 0xffff88, a2);
      this._px(canvas2, ox2 + 3, 3, 0xffff88, a2 * 0.7);
      this._px(canvas2, ox2 + 5, 3, 0xffff88, a2 * 0.7);
      this._px(canvas2, ox2 + 4, 4, 0xffff88, a2 * 0.5);
    }
    this.textures.addSpriteSheet("fx_sparkle", canvas2, { frameWidth: 8, frameHeight: 8 });
  }
});
