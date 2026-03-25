// ═══ CHRONIQUES D'ARKANIS — WORLD SCENE ═══
"use strict";

var WorldScene = new Phaser.Class({
  Extends: Phaser.Scene,
  initialize: function() { Phaser.Scene.call(this, { key: "World" }); },

  init: function(data) {
    this._showIntro = data && data.showIntro;
    this._introIdx = 0;
  },

  create: function() {
    var self = this;
    this.T = CFG.TILE;
    this.zoneId = PLAYER.zoneId;
    this.zone = ZONES[this.zoneId];
    this.colors = CFG.ZONE_COLORS[this.zoneId];

    // Generate zone map
    this.mapW = 20;
    this.mapH = 36;
    this.map = this._generateMap(this.zoneId);

    // ─── TILEMAP ───
    this.tileLayer = this.add.group();
    this._renderMap();

    // ─── PLAYER SPRITE ───
    this.player = this.add.sprite(PLAYER.x, PLAYER.y, "player", 0).setDepth(10);
    this.player.setOrigin(0.5, 0.75);

    // Player animations
    this.anims.create({ key: "walk_down",  frames: this.anims.generateFrameNumbers("player", { start: 0, end: 1 }), frameRate: 6, repeat: -1 });
    this.anims.create({ key: "walk_left",  frames: this.anims.generateFrameNumbers("player", { start: 2, end: 3 }), frameRate: 6, repeat: -1 });
    this.anims.create({ key: "walk_right", frames: this.anims.generateFrameNumbers("player", { start: 4, end: 5 }), frameRate: 6, repeat: -1 });
    this.anims.create({ key: "walk_up",    frames: this.anims.generateFrameNumbers("player", { start: 6, end: 7 }), frameRate: 6, repeat: -1 });

    // Slash animation
    this.anims.create({ key: "slash", frames: this.anims.generateFrameNumbers("fx_slash", { start: 0, end: 7 }), frameRate: 24, repeat: 0 });

    // ─── ENEMIES ───
    this.enemies = [];
    this._spawnEnemies();

    // ─── NPCS ───
    this.npcSprites = [];
    this._spawnNPCs();

    // ─── ITEMS ON GROUND ───
    this.groundItems = [];
    this._spawnIngredients();

    // ─── CAMERA ───
    this.cameras.main.startFollow(this.player, true, CFG.CAM_LERP, CFG.CAM_LERP);
    this.cameras.main.setBounds(0, 0, this.mapW * this.T, this.mapH * this.T);
    this.cameras.main.setBackgroundColor(this.colors.sky);

    // ─── HUD (fixed to camera) ───
    this.hud = this.add.container(0, 0).setScrollFactor(0).setDepth(100);
    this._createHUD();

    // ─── INPUT ───
    this.moveDir = { x: 0, y: 0 };
    this._setupTouch();
    this._setupKeyboard();

    // ─── ATTACK SLASH SPRITE ───
    this.slashSprite = this.add.sprite(0, 0, "fx_slash", 0).setVisible(false).setDepth(15);

    // ─── STATE ───
    this.interactCd = 0;
    this.encounterTimer = 0;
    this.msgTimer = 0;
    this.msgText = "";

    // ─── INTRO ───
    if (this._showIntro) {
      this._showIntroSequence();
    }

    // ─── MUSIC ───
    this._playMusic(this.zone.music);
  },

  update: function(time, delta) {
    if (this._introActive) return;
    if (this._dialogActive) return;
    if (this._menuOpen) return;

    var dt = delta / 1000;
    var spd = PLAYER.spd;

    // ── PLAYER MOVEMENT ──
    var dx = this.moveDir.x, dy = this.moveDir.y;
    if (this.cursors) {
      if (this.cursors.left.isDown || this.kA.isDown) dx = -1;
      else if (this.cursors.right.isDown || this.kD.isDown) dx = 1;
      if (this.cursors.up.isDown || this.kW.isDown) dy = -1;
      else if (this.cursors.down.isDown || this.kS.isDown) dy = 1;
    }

    // Normalize diagonal
    if (dx !== 0 && dy !== 0) { dx *= 0.707; dy *= 0.707; }

    var nx = PLAYER.x + dx * spd * dt;
    var ny = PLAYER.y + dy * spd * dt;

    // Collision check
    if (!this._isWall(nx, PLAYER.y)) PLAYER.x = nx;
    if (!this._isWall(PLAYER.x, ny)) PLAYER.y = ny;

    // Clamp to bounds
    PLAYER.x = Math.max(8, Math.min(this.mapW * this.T - 8, PLAYER.x));
    PLAYER.y = Math.max(8, Math.min(this.mapH * this.T - 8, PLAYER.y));

    this.player.setPosition(PLAYER.x, PLAYER.y);

    // Animation
    if (dx !== 0 || dy !== 0) {
      if (Math.abs(dx) > Math.abs(dy)) {
        this.player.play(dx < 0 ? "walk_left" : "walk_right", true);
        PLAYER.facing = dx < 0 ? 1 : 2;
      } else {
        this.player.play(dy < 0 ? "walk_up" : "walk_down", true);
        PLAYER.facing = dy < 0 ? 3 : 0;
      }
    } else {
      this.player.stop();
      this.player.setFrame(PLAYER.facing === 0 ? 0 : PLAYER.facing === 1 ? 2 : PLAYER.facing === 2 ? 4 : 6);
    }

    // Invulnerability timer
    if (PLAYER.invuln > 0) {
      PLAYER.invuln -= delta;
      this.player.setAlpha(Math.sin(time * 0.02) > 0 ? 1 : 0.3);
    } else {
      this.player.setAlpha(1);
    }

    // Attack cooldown
    if (PLAYER.attackTimer > 0) PLAYER.attackTimer -= delta;

    // ── ENEMY AI ──
    for (var i = this.enemies.length - 1; i >= 0; i--) {
      var en = this.enemies[i];
      if (en.dead) continue;
      this._updateEnemy(en, dt, delta);

      // Enemy-player collision (damage)
      var distP = Phaser.Math.Distance.Between(PLAYER.x, PLAYER.y, en.sprite.x, en.sprite.y);
      if (distP < 12 && PLAYER.invuln <= 0) {
        var dmg = PLAYER.takeDamage(en.data.atk);
        if (dmg > 0) this._showDmgNumber(PLAYER.x, PLAYER.y - 10, dmg, 0xff4444);
        if (PLAYER.hp <= 0) {
          this._playerDeath();
          return;
        }
      }
    }

    // ── CHECK EXITS ──
    var tx = Math.floor(PLAYER.x / this.T);
    var ty = Math.floor(PLAYER.y / this.T);
    var tile = this._getTile(tx, ty);
    if (tile === 2 && PLAYER.y < 8) {
      this._zoneTransition(1);
    } else if (tile === 3 && PLAYER.y > (this.mapH - 1) * this.T) {
      this._zoneTransition(-1);
    }

    // ── CHECK NPC PROXIMITY ──
    this._checkNPCProximity();

    // ── CHECK ITEM PICKUP ──
    this._checkItemPickup();

    // ── UPDATE HUD ──
    this._updateHUD();

    // ── MSG TIMER ──
    if (this.msgTimer > 0) {
      this.msgTimer -= dt;
      if (this.msgTimer <= 0 && this.msgLabel) this.msgLabel.setAlpha(0);
    }
  },

  // ═══ MAP GENERATION ═══
  _generateMap: function(zoneId) {
    var w = this.mapW, h = this.mapH;
    var map = [];
    var seed = 0;
    for (var c = 0; c < zoneId.length; c++) seed += zoneId.charCodeAt(c) * 31;
    function rng() { seed = (seed * 16807 + 13) % 2147483647; return seed / 2147483647; }

    // Fill with floor
    for (var y = 0; y < h; y++) {
      map[y] = [];
      for (var x = 0; x < w; x++) map[y][x] = 0;
    }

    // Border walls
    for (var y = 0; y < h; y++) { map[y][0] = 1; map[y][w - 1] = 1; }
    for (var x = 0; x < w; x++) { map[0][x] = 1; map[h - 1][x] = 1; }

    // Exit north (to next zone)
    var zi = ZONE_ORDER.indexOf(zoneId);
    if (zi < ZONE_ORDER.length - 1) {
      map[0][9] = 2; map[0][10] = 2;
    }
    // Exit south (to previous zone)
    if (zi > 0) {
      map[h - 1][9] = 3; map[h - 1][10] = 3;
    }

    // Random walls/obstacles (30-50 blocks)
    var nWalls = 30 + Math.floor(rng() * 20);
    for (var i = 0; i < nWalls; i++) {
      var wx = 2 + Math.floor(rng() * (w - 4));
      var wy = 4 + Math.floor(rng() * (h - 8));
      // Don't block exits or spawn area
      if (wy < 4 || wy > h - 5) continue;
      if (wx >= 8 && wx <= 11 && (wy < 4 || wy > h - 5)) continue;
      var bw = 1 + Math.floor(rng() * 3);
      var bh = 1 + Math.floor(rng() * 2);
      for (var by = wy; by < Math.min(h - 2, wy + bh); by++) {
        for (var bx = wx; bx < Math.min(w - 2, wx + bw); bx++) {
          map[by][bx] = 1;
        }
      }
    }

    // Water tiles (zone-specific)
    if (zoneId === "forest" || zoneId === "glacier") {
      var waterY = 10 + Math.floor(rng() * 10);
      for (var x = 3; x < 8; x++) map[waterY][x] = 9;
      for (var x = 3; x < 8; x++) map[waterY + 1][x] = 9;
    }

    // Boss room door (near north exit)
    if (zi < ZONE_ORDER.length) {
      map[3][9] = 7; map[3][10] = 7;
    }

    // Ensure path from south to north (simple flood fill check + carve)
    this._ensurePath(map, 10, h - 3, 10, 3, w, h);

    return map;
  },

  _ensurePath: function(map, sx, sy, ex, ey, w, h) {
    // Simple carve: walk from start to end, clearing walls
    var x = sx, y = sy;
    var maxSteps = 200;
    while ((Math.abs(x - ex) > 1 || Math.abs(y - ey) > 1) && maxSteps-- > 0) {
      if (y > ey) y--;
      else if (y < ey) y++;
      if (x > ex) x--;
      else if (x < ex) x++;
      if (x > 0 && x < w - 1 && y > 0 && y < h - 1) {
        if (map[y][x] === 1) map[y][x] = 0;
      }
    }
  },

  _renderMap: function() {
    var tileKey = "tiles_" + this.zoneId;
    for (var y = 0; y < this.mapH; y++) {
      for (var x = 0; x < this.mapW; x++) {
        var t = this.map[y][x];
        var frame = 0;
        if (t === 1) frame = 1;
        else if (t === 2 || t === 3) frame = 2;
        else if (t === 9) frame = 3;
        else if (t === 7) frame = 2; // boss door looks like exit

        var tile = this.add.image(x * this.T + 8, y * this.T + 8, tileKey, frame);
        tile.setDepth(0);
        this.tileLayer.add(tile);
      }
    }
  },

  _getTile: function(tx, ty) {
    if (ty < 0 || ty >= this.mapH || tx < 0 || tx >= this.mapW) return 1;
    return this.map[ty][tx];
  },

  _isWall: function(px, py) {
    var tx = Math.floor(px / this.T);
    var ty = Math.floor(py / this.T);
    var t = this._getTile(tx, ty);
    return t === 1 || t === 9;
  },

  // ═══ ENEMIES ═══
  _spawnEnemies: function() {
    if (!this.zone.enemies) return;
    var count = this.zone.enemies.length * 2; // spawn duplicates
    for (var i = 0; i < count; i++) {
      var etype = this.zone.enemies[i % this.zone.enemies.length];
      var edata = ENEMIES[etype];
      var ex, ey, tries = 0;
      do {
        ex = 32 + Math.random() * (this.mapW * this.T - 64);
        ey = 64 + Math.random() * (this.mapH * this.T - 128);
        tries++;
      } while (this._isWall(ex, ey) && tries < 50);

      var spr = this.add.sprite(ex, ey, "enemy_" + etype, 0).setDepth(8);
      spr.setOrigin(0.5, 0.75);
      this.enemies.push({
        sprite: spr,
        data: Object.assign({}, edata),
        hp: edata.hp,
        type: etype,
        dead: false,
        hitTimer: 0,
        dir: Math.random() * Math.PI * 2,
        moveTimer: 0,
        originX: ex,
        originY: ey
      });
    }
  },

  _updateEnemy: function(en, dt, delta) {
    if (en.hitTimer > 0) {
      en.hitTimer -= delta;
      en.sprite.setFrame(en.hitTimer > 0 ? 1 : 0);
    }

    var dist = Phaser.Math.Distance.Between(PLAYER.x, PLAYER.y, en.sprite.x, en.sprite.y);
    var ai = en.data.ai;
    var spd = en.data.spd * dt;

    if (ai === "wander") {
      en.moveTimer -= dt;
      if (en.moveTimer <= 0) {
        en.dir = Math.random() * Math.PI * 2;
        en.moveTimer = 1 + Math.random() * 2;
      }
      var nx = en.sprite.x + Math.cos(en.dir) * spd;
      var ny = en.sprite.y + Math.sin(en.dir) * spd;
      if (!this._isWall(nx, ny)) { en.sprite.x = nx; en.sprite.y = ny; }
    }
    else if (ai === "chase" || ai === "swoop") {
      if (dist < 120) {
        var ang = Math.atan2(PLAYER.y - en.sprite.y, PLAYER.x - en.sprite.x);
        var nx = en.sprite.x + Math.cos(ang) * spd;
        var ny = en.sprite.y + Math.sin(ang) * spd;
        if (!this._isWall(nx, ny)) { en.sprite.x = nx; en.sprite.y = ny; }
      } else {
        // Wander near origin
        en.moveTimer -= dt;
        if (en.moveTimer <= 0) { en.dir = Math.random() * Math.PI * 2; en.moveTimer = 2; }
        var nx2 = en.sprite.x + Math.cos(en.dir) * spd * 0.5;
        var ny2 = en.sprite.y + Math.sin(en.dir) * spd * 0.5;
        if (!this._isWall(nx2, ny2)) { en.sprite.x = nx2; en.sprite.y = ny2; }
      }
    }
    else if (ai === "guard") {
      // Stay near origin, attack if close
      if (dist < 60) {
        var ang = Math.atan2(PLAYER.y - en.sprite.y, PLAYER.x - en.sprite.x);
        en.sprite.x += Math.cos(ang) * spd * 0.8;
        en.sprite.y += Math.sin(ang) * spd * 0.8;
      } else {
        var dOrig = Phaser.Math.Distance.Between(en.sprite.x, en.sprite.y, en.originX, en.originY);
        if (dOrig > 40) {
          var ang2 = Math.atan2(en.originY - en.sprite.y, en.originX - en.sprite.x);
          en.sprite.x += Math.cos(ang2) * spd * 0.5;
          en.sprite.y += Math.sin(ang2) * spd * 0.5;
        }
      }
    }
    else if (ai === "patrol") {
      en.moveTimer -= dt;
      if (en.moveTimer <= 0) {
        en.dir = en.dir + Math.PI; // reverse
        en.moveTimer = 3;
      }
      if (dist < 80) {
        var ang = Math.atan2(PLAYER.y - en.sprite.y, PLAYER.x - en.sprite.x);
        en.dir = ang;
      }
      var nx3 = en.sprite.x + Math.cos(en.dir) * spd;
      var ny3 = en.sprite.y + Math.sin(en.dir) * spd;
      if (!this._isWall(nx3, ny3)) { en.sprite.x = nx3; en.sprite.y = ny3; }
    }
  },

  _attackEnemy: function() {
    if (PLAYER.attackTimer > 0) return;
    PLAYER.attackTimer = CFG.ATTACK_CD;

    // Slash position based on facing
    var dirs = [[0, 10], [-14, 0], [14, 0], [0, -14]];
    var d = dirs[PLAYER.facing];
    var sx = PLAYER.x + d[0], sy = PLAYER.y + d[1];

    this.slashSprite.setPosition(sx, sy).setVisible(true);
    this.slashSprite.play("slash");
    this.slashSprite.once("animationcomplete", function() { this.setVisible(false); }, this.slashSprite);

    // Check hit
    for (var i = 0; i < this.enemies.length; i++) {
      var en = this.enemies[i];
      if (en.dead) continue;
      var dist = Phaser.Math.Distance.Between(sx, sy, en.sprite.x, en.sprite.y);
      if (dist < CFG.ATTACK_RANGE) {
        var dmg = Math.max(1, PLAYER.atk - en.data.def + Math.floor(Math.random() * 3));
        // Enchantment bonus
        if (PLAYER._enchant) dmg += PLAYER._enchant.dmg;
        en.hp -= dmg;
        en.hitTimer = 200;
        this._showDmgNumber(en.sprite.x, en.sprite.y - 10, dmg, 0xffff44);

        if (en.hp <= 0) {
          this._killEnemy(en, i);
        }
      }
    }
  },

  _killEnemy: function(en, idx) {
    en.dead = true;
    // Death animation
    this.tweens.add({
      targets: en.sprite,
      alpha: 0,
      scaleX: 0,
      scaleY: 0,
      duration: 300,
      onComplete: function() { en.sprite.destroy(); }
    });
    // XP
    var leveledUp = PLAYER.addXp(en.data.xp);
    this._showMsg("+" + en.data.xp + " XP" + (leveledUp ? " — NIVEAU " + PLAYER.level + "!" : ""));
    // Crystal drop
    PLAYER.crystals += 1 + Math.floor(Math.random() * 3);
    // Boss kill
    if (en.data.isBoss) {
      PLAYER.bossKills.push(en.type);
      var zi = ZONE_ORDER.indexOf(this.zoneId);
      PLAYER.seals.push(this.zoneId);
      this._showMsg("SCEAU DE " + this.zone.name.toUpperCase() + " RESTAURÉ!");
      PLAYER.save();
    }
    // Respawn timer (non-boss)
    if (!en.data.isBoss) {
      var self = this;
      this.time.delayedCall(15000, function() {
        self._respawnEnemy(en.type);
      });
    }
  },

  _respawnEnemy: function(etype) {
    var edata = ENEMIES[etype];
    var ex, ey, tries = 0;
    do {
      ex = 32 + Math.random() * (this.mapW * this.T - 64);
      ey = 64 + Math.random() * (this.mapH * this.T - 128);
      tries++;
    } while (this._isWall(ex, ey) && tries < 50);
    var spr = this.add.sprite(ex, ey, "enemy_" + etype, 0).setDepth(8).setOrigin(0.5, 0.75);
    this.enemies.push({
      sprite: spr, data: Object.assign({}, edata), hp: edata.hp, type: etype,
      dead: false, hitTimer: 0, dir: Math.random() * Math.PI * 2, moveTimer: 0,
      originX: ex, originY: ey
    });
  },

  // ═══ NPC ═══
  _spawnNPCs: function() {
    var npcs = STORY.npcs[this.zoneId] || [];
    for (var i = 0; i < npcs.length; i++) {
      var n = npcs[i];
      var spr = this.add.image(n.x * this.T + 8, n.y * this.T + 8, n.sprite).setDepth(9);
      // Interaction indicator
      var indicator = this.add.text(n.x * this.T + 8, n.y * this.T - 4, "!", {
        fontSize: "8px", color: "#eecc44", fontFamily: "monospace"
      }).setOrigin(0.5).setDepth(11);
      this.npcSprites.push({ sprite: spr, data: n, indicator: indicator });
    }

    // Save crystal NPC
    var saveSpr = this.add.image(10 * this.T + 8, 32 * this.T + 8, "npc_save").setDepth(9);
    this.npcSprites.push({
      sprite: saveSpr,
      data: { id: "save_point", name: "Cristal de Sauvegarde", x: 10, y: 32,
        dialog: [{ cond: null, lines: ["Partie sauvegardée."] }]
      },
      indicator: this.add.text(10 * this.T + 8, 32 * this.T - 4, "✦", {
        fontSize: "8px", color: "#8888cc", fontFamily: "monospace"
      }).setOrigin(0.5).setDepth(11),
      isSave: true
    });
  },

  _checkNPCProximity: function() {
    for (var i = 0; i < this.npcSprites.length; i++) {
      var n = this.npcSprites[i];
      var dist = Phaser.Math.Distance.Between(PLAYER.x, PLAYER.y, n.sprite.x, n.sprite.y);
      n.indicator.setAlpha(dist < 30 ? 1 : 0.4);
    }
  },

  _interactNPC: function() {
    for (var i = 0; i < this.npcSprites.length; i++) {
      var n = this.npcSprites[i];
      var dist = Phaser.Math.Distance.Between(PLAYER.x, PLAYER.y, n.sprite.x, n.sprite.y);
      if (dist < 30) {
        if (n.isSave) {
          PLAYER.save();
          this._showMsg("Sauvegardé!");
          return;
        }
        // Find applicable dialog
        var dialogs = n.data.dialog;
        var chosen = dialogs[0]; // default
        for (var d = dialogs.length - 1; d >= 0; d--) {
          if (!dialogs[d].cond || PLAYER.flags[dialogs[d].cond]) {
            chosen = dialogs[d];
            break;
          }
        }
        this._showDialog(n.data.name, chosen.lines);
        return;
      }
    }
  },

  // ═══ ITEMS ═══
  _spawnIngredients: function() {
    var ings = this.zone.ingredients || [];
    for (var i = 0; i < ings.length; i++) {
      for (var n = 0; n < 3; n++) { // 3 of each per zone
        var ix, iy, tries = 0;
        do {
          ix = 16 + Math.random() * (this.mapW * this.T - 32);
          iy = 48 + Math.random() * (this.mapH * this.T - 96);
          tries++;
        } while (this._isWall(ix, iy) && tries < 50);

        var ingData = INGREDIENTS[ings[i]];
        var color = ingData ? ingData.color : 0xffffff;
        var g = this.add.graphics().setDepth(5);
        g.fillStyle(color, 0.8);
        g.fillCircle(ix, iy, 3);
        g.fillStyle(0xffffff, 0.4);
        g.fillCircle(ix - 1, iy - 1, 1);
        this.groundItems.push({ gfx: g, x: ix, y: iy, id: ings[i], name: ingData ? ingData.name : ings[i] });
      }
    }
  },

  _checkItemPickup: function() {
    for (var i = this.groundItems.length - 1; i >= 0; i--) {
      var item = this.groundItems[i];
      var dist = Phaser.Math.Distance.Between(PLAYER.x, PLAYER.y, item.x, item.y);
      if (dist < 14) {
        if (PLAYER.addItem(item.id, item.name, "ingredient", 1)) {
          item.gfx.destroy();
          this.groundItems.splice(i, 1);
          this._showMsg("+ " + item.name);
          // Respawn after 30s
          var self = this, ingId = item.id;
          this.time.delayedCall(30000, function() { self._respawnIngredient(ingId); });
        }
      }
    }
  },

  _respawnIngredient: function(id) {
    var ingData = INGREDIENTS[id];
    if (!ingData) return;
    var ix, iy, tries = 0;
    do {
      ix = 16 + Math.random() * (this.mapW * this.T - 32);
      iy = 48 + Math.random() * (this.mapH * this.T - 96);
      tries++;
    } while (this._isWall(ix, iy) && tries < 50);
    var g = this.add.graphics().setDepth(5);
    g.fillStyle(ingData.color, 0.8);
    g.fillCircle(ix, iy, 3);
    g.fillStyle(0xffffff, 0.4);
    g.fillCircle(ix - 1, iy - 1, 1);
    this.groundItems.push({ gfx: g, x: ix, y: iy, id: id, name: ingData.name });
  },

  // ═══ ZONE TRANSITIONS ═══
  _zoneTransition: function(dir) {
    var zi = ZONE_ORDER.indexOf(this.zoneId);
    var ni = zi + dir;
    if (ni < 0 || ni >= ZONE_ORDER.length) return;

    // Check boss door
    if (dir > 0) {
      var bossType = this.zone.boss;
      if (bossType && PLAYER.bossKills.indexOf(bossType) < 0) {
        // Boss not defeated — spawn boss fight
        this._spawnBoss();
        PLAYER.y = 5 * this.T;
        return;
      }
    }

    PLAYER.zoneId = ZONE_ORDER[ni];
    PLAYER.y = dir > 0 ? (this.mapH - 3) * this.T : 3 * this.T;
    PLAYER.save();
    this.scene.restart();
  },

  _spawnBoss: function() {
    var bossType = this.zone.boss;
    var edata = ENEMIES[bossType];
    var spr = this.add.sprite(10 * this.T, 5 * this.T, "enemy_" + bossType, 0).setDepth(8).setOrigin(0.5, 0.75);
    this.enemies.push({
      sprite: spr, data: Object.assign({}, edata), hp: edata.hp, type: bossType,
      dead: false, hitTimer: 0, dir: 0, moveTimer: 0,
      originX: 10 * this.T, originY: 5 * this.T
    });
    this._showMsg("— " + edata.name + " —");
  },

  // ═══ HUD ═══
  _createHUD: function() {
    var sw = CFG.WIDTH;
    // HP bar background
    this.hud.add(this.add.rectangle(4, 4, 82, 10, 0x000000, 0.6).setOrigin(0).setScrollFactor(0));
    // HP bar fill
    this.hpBar = this.add.rectangle(5, 5, 80, 8, 0xcc2222, 1).setOrigin(0).setScrollFactor(0);
    this.hud.add(this.hpBar);
    // HP text
    this.hpText = this.add.text(6, 3, "", { fontSize: "7px", color: "#ffffff", fontFamily: "monospace" }).setScrollFactor(0);
    this.hud.add(this.hpText);
    // Level
    this.lvlText = this.add.text(90, 3, "", { fontSize: "7px", color: "#eecc44", fontFamily: "monospace" }).setScrollFactor(0);
    this.hud.add(this.lvlText);
    // Zone name
    this.zoneText = this.add.text(sw / 2, 3, this.zone.name, { fontSize: "7px", color: "#aaaaaa", fontFamily: "monospace" }).setOrigin(0.5, 0).setScrollFactor(0);
    this.hud.add(this.zoneText);
    // Crystals
    this.crystalText = this.add.text(sw - 4, 3, "", { fontSize: "7px", color: "#88ccee", fontFamily: "monospace" }).setOrigin(1, 0).setScrollFactor(0);
    this.hud.add(this.crystalText);
    // Seals
    this.sealText = this.add.text(sw - 4, 12, "", { fontSize: "6px", color: "#aa88cc", fontFamily: "monospace" }).setOrigin(1, 0).setScrollFactor(0);
    this.hud.add(this.sealText);
    // Message bar
    this.msgLabel = this.add.text(sw / 2, 20, "", { fontSize: "8px", color: "#e8d8a8", fontFamily: "monospace", align: "center" }).setOrigin(0.5, 0).setScrollFactor(0).setAlpha(0);
    this.hud.add(this.msgLabel);

    // ── BOTTOM BUTTONS ──
    var sh = CFG.HEIGHT;
    // Attack button
    this.add.circle(sw - 45, sh - 55, 22, 0xcc3333, 0.4).setScrollFactor(0).setDepth(101).setInteractive()
      .on("pointerdown", function() { this._attackEnemy(); }, this);
    this.add.text(sw - 45, sh - 55, "⚔", { fontSize: "16px" }).setOrigin(0.5).setScrollFactor(0).setDepth(102);
    // Inventory button
    this.add.circle(sw - 45, sh - 100, 16, 0x446644, 0.4).setScrollFactor(0).setDepth(101).setInteractive()
      .on("pointerdown", function() { this._openMenu(); }, this);
    this.add.text(sw - 45, sh - 100, "◆", { fontSize: "12px" }).setOrigin(0.5).setScrollFactor(0).setDepth(102);
    // Interact button
    this.add.circle(sw - 90, sh - 55, 16, 0x4444aa, 0.4).setScrollFactor(0).setDepth(101).setInteractive()
      .on("pointerdown", function() { this._interactNPC(); }, this);
    this.add.text(sw - 90, sh - 55, "?", { fontSize: "12px", color: "#aabbee" }).setOrigin(0.5).setScrollFactor(0).setDepth(102);
  },

  _updateHUD: function() {
    var pct = PLAYER.hp / PLAYER.maxHp;
    this.hpBar.setSize(Math.max(0, 80 * pct), 8);
    this.hpBar.setFillStyle(pct > 0.5 ? 0x44aa44 : pct > 0.25 ? 0xccaa22 : 0xcc2222);
    this.hpText.setText(PLAYER.hp + "/" + PLAYER.maxHp);
    this.lvlText.setText("Nv." + PLAYER.level);
    this.crystalText.setText("◇" + PLAYER.crystals);
    this.sealText.setText("Sceaux: " + PLAYER.seals.length + "/5");
  },

  // ═══ DIALOG ═══
  _showDialog: function(name, lines) {
    this._dialogActive = true;
    this._dialogLines = lines;
    this._dialogIdx = 0;
    this._dialogName = name;

    var sw = CFG.WIDTH, sh = CFG.HEIGHT;
    this._dlgBg = this.add.rectangle(sw / 2, sh - 70, sw - 16, 80, 0x0a0a1a, 0.9)
      .setScrollFactor(0).setDepth(200).setStrokeStyle(1, 0x555555);
    this._dlgNameText = this.add.text(14, sh - 106, name, {
      fontSize: "8px", color: "#eecc44", fontFamily: "monospace"
    }).setScrollFactor(0).setDepth(201);
    this._dlgText = this.add.text(14, sh - 94, lines[0], {
      fontSize: "8px", color: "#cccccc", fontFamily: "monospace", wordWrap: { width: sw - 32 }, lineSpacing: 3
    }).setScrollFactor(0).setDepth(201);
    this._dlgHint = this.add.text(sw - 14, sh - 34, "▶", {
      fontSize: "8px", color: "#888888", fontFamily: "monospace"
    }).setOrigin(1, 0).setScrollFactor(0).setDepth(201);

    // Tap anywhere to advance
    this._dlgZone = this.add.zone(sw / 2, sh / 2, sw, sh).setScrollFactor(0).setDepth(199).setInteractive();
    this._dlgZone.on("pointerdown", function() { this._advanceDialog(); }, this);
  },

  _advanceDialog: function() {
    this._dialogIdx++;
    if (this._dialogIdx >= this._dialogLines.length) {
      this._closeDialog();
    } else {
      this._dlgText.setText(this._dialogLines[this._dialogIdx]);
    }
  },

  _closeDialog: function() {
    this._dialogActive = false;
    if (this._dlgBg) this._dlgBg.destroy();
    if (this._dlgNameText) this._dlgNameText.destroy();
    if (this._dlgText) this._dlgText.destroy();
    if (this._dlgHint) this._dlgHint.destroy();
    if (this._dlgZone) this._dlgZone.destroy();
  },

  // ═══ MENU (Inventory + Alchemy) ═══
  _openMenu: function() {
    if (this._menuOpen) { this._closeMenu(); return; }
    this._menuOpen = true;
    var sw = CFG.WIDTH, sh = CFG.HEIGHT;
    this._menuItems = [];

    // Background
    this._menuBg = this.add.rectangle(sw / 2, sh / 2, sw - 16, sh - 40, 0x0a0a1a, 0.95)
      .setScrollFactor(0).setDepth(300).setStrokeStyle(1, 0x555555);
    this._menuItems.push(this._menuBg);

    // Title
    var title = this.add.text(sw / 2, 28, "─ INVENTAIRE ─", {
      fontSize: "10px", color: "#c8b888", fontFamily: "monospace"
    }).setOrigin(0.5).setScrollFactor(0).setDepth(301);
    this._menuItems.push(title);

    // Stats
    var stats = "Nv." + PLAYER.level + "  PV:" + PLAYER.hp + "/" + PLAYER.maxHp +
      "  ATK:" + PLAYER.atk + "  DEF:" + PLAYER.def + "  ◇" + PLAYER.crystals;
    var statsText = this.add.text(12, 42, stats, {
      fontSize: "7px", color: "#aaaaaa", fontFamily: "monospace"
    }).setScrollFactor(0).setDepth(301);
    this._menuItems.push(statsText);

    // Ingredients
    var y = 58;
    var ingTitle = this.add.text(12, y, "Ingrédients:", {
      fontSize: "7px", color: "#88aa66", fontFamily: "monospace"
    }).setScrollFactor(0).setDepth(301);
    this._menuItems.push(ingTitle);
    y += 12;

    var ings = PLAYER.inventory.filter(function(it) { return it.type === "ingredient"; });
    if (ings.length === 0) {
      var none = this.add.text(16, y, "(vide)", { fontSize: "7px", color: "#666666", fontFamily: "monospace" }).setScrollFactor(0).setDepth(301);
      this._menuItems.push(none);
      y += 12;
    } else {
      for (var i = 0; i < ings.length; i++) {
        var it = ings[i];
        var itText = this.add.text(16, y, it.name + " ×" + it.qty, {
          fontSize: "7px", color: "#ccccaa", fontFamily: "monospace"
        }).setScrollFactor(0).setDepth(301);
        this._menuItems.push(itText);
        y += 11;
      }
    }

    // Potions
    y += 6;
    var potTitle = this.add.text(12, y, "Potions:", {
      fontSize: "7px", color: "#aa8866", fontFamily: "monospace"
    }).setScrollFactor(0).setDepth(301);
    this._menuItems.push(potTitle);
    y += 12;

    if (PLAYER.potions.length === 0) {
      var none2 = this.add.text(16, y, "(vide)", { fontSize: "7px", color: "#666666", fontFamily: "monospace" }).setScrollFactor(0).setDepth(301);
      this._menuItems.push(none2);
      y += 12;
    } else {
      for (var p = 0; p < PLAYER.potions.length; p++) {
        var pot = PLAYER.potions[p];
        var potText = this.add.text(16, y, pot.name, {
          fontSize: "7px", color: "#ddbb88", fontFamily: "monospace"
        }).setScrollFactor(0).setDepth(301).setInteractive();
        potText._potIdx = p;
        potText.on("pointerdown", function() {
          PLAYER.usePotion(this._potIdx);
          this.scene._closeMenu();
          this.scene._showMsg("Potion utilisée!");
        });
        this._menuItems.push(potText);
        y += 11;
      }
    }

    // Alchemy button
    y += 10;
    var alchBtn = this.add.text(sw / 2, y, "[ ALCHIMIE ]", {
      fontSize: "9px", color: "#cc8844", fontFamily: "monospace"
    }).setOrigin(0.5).setScrollFactor(0).setDepth(301).setInteractive();
    alchBtn.on("pointerdown", function() { this._closeMenu(); this._openAlchemy(); }, this);
    this._menuItems.push(alchBtn);

    // Close
    var closeBtn = this.add.text(sw - 20, 24, "✕", {
      fontSize: "12px", color: "#cc4444", fontFamily: "monospace"
    }).setScrollFactor(0).setDepth(302).setInteractive();
    closeBtn.on("pointerdown", function() { this._closeMenu(); }, this);
    this._menuItems.push(closeBtn);
  },

  _closeMenu: function() {
    this._menuOpen = false;
    if (this._menuItems) {
      for (var i = 0; i < this._menuItems.length; i++) this._menuItems[i].destroy();
    }
    this._menuItems = [];
  },

  // ═══ ALCHEMY SCREEN ═══
  _openAlchemy: function() {
    this._menuOpen = true;
    var sw = CFG.WIDTH, sh = CFG.HEIGHT;
    this._menuItems = [];
    this._alchSel = [null, null];

    var bg = this.add.rectangle(sw / 2, sh / 2, sw - 16, sh - 40, 0x0a0a1a, 0.95)
      .setScrollFactor(0).setDepth(300).setStrokeStyle(1, 0x885522);
    this._menuItems.push(bg);

    var title = this.add.text(sw / 2, 28, "─ ALCHIMIE ─", {
      fontSize: "10px", color: "#cc8844", fontFamily: "monospace"
    }).setOrigin(0.5).setScrollFactor(0).setDepth(301);
    this._menuItems.push(title);

    var hint = this.add.text(sw / 2, 42, "Choisis 2 ingrédients", {
      fontSize: "7px", color: "#888866", fontFamily: "monospace"
    }).setOrigin(0.5).setScrollFactor(0).setDepth(301);
    this._menuItems.push(hint);

    var ings = PLAYER.inventory.filter(function(it) { return it.type === "ingredient"; });
    var y = 58;
    var self = this;
    for (var i = 0; i < ings.length; i++) {
      var it = ings[i];
      var itText = this.add.text(16, y, "○ " + it.name + " ×" + it.qty, {
        fontSize: "7px", color: "#ccccaa", fontFamily: "monospace"
      }).setScrollFactor(0).setDepth(301).setInteractive();
      itText._ingId = it.id;
      itText._ingName = it.name;
      itText.on("pointerdown", function() { self._selectIngredient(this._ingId, this); });
      this._menuItems.push(itText);
      y += 12;
    }

    // Result area
    this._alchResult = this.add.text(sw / 2, sh - 80, "", {
      fontSize: "8px", color: "#eecc44", fontFamily: "monospace"
    }).setOrigin(0.5).setScrollFactor(0).setDepth(301);
    this._menuItems.push(this._alchResult);

    // Craft button (hidden until 2 selected)
    this._alchCraft = this.add.text(sw / 2, sh - 60, "[ COMBINER ]", {
      fontSize: "9px", color: "#44aa44", fontFamily: "monospace"
    }).setOrigin(0.5).setScrollFactor(0).setDepth(301).setInteractive().setAlpha(0);
    this._alchCraft.on("pointerdown", function() { self._doCraft(); });
    this._menuItems.push(this._alchCraft);

    // Close
    var closeBtn = this.add.text(sw - 20, 24, "✕", {
      fontSize: "12px", color: "#cc4444", fontFamily: "monospace"
    }).setScrollFactor(0).setDepth(302).setInteractive();
    closeBtn.on("pointerdown", function() { this._closeMenu(); }, this);
    this._menuItems.push(closeBtn);
  },

  _selectIngredient: function(id, label) {
    if (!this._alchSel[0]) {
      this._alchSel[0] = id;
      label.setColor("#eecc44");
      label.setText("● " + label._ingName + " ×" + PLAYER.hasItem(id) );
    } else if (!this._alchSel[1] && (id !== this._alchSel[0] || PLAYER.hasItem(id, 2))) {
      this._alchSel[1] = id;
      label.setColor("#eecc44");
      // Preview result
      var result = ALCHEMY.craft(this._alchSel[0], this._alchSel[1]);
      if (result) {
        this._alchResult.setText("→ " + result.name);
        this._alchCraft.setAlpha(1);
      } else {
        this._alchResult.setText("Pas de recette connue.");
        this._alchSel = [null, null];
      }
    }
  },

  _doCraft: function() {
    if (!this._alchSel[0] || !this._alchSel[1]) return;
    var result = ALCHEMY.craft(this._alchSel[0], this._alchSel[1]);
    if (!result) return;
    if (!PLAYER.hasItem(this._alchSel[0]) || !PLAYER.hasItem(this._alchSel[1])) return;
    PLAYER.removeItem(this._alchSel[0]);
    PLAYER.removeItem(this._alchSel[1]);
    PLAYER.addPotion(Object.assign({}, result));
    this._closeMenu();
    this._showMsg("Créé: " + result.name + "!");
  },

  // ═══ INTRO SEQUENCE ═══
  _showIntroSequence: function() {
    this._introActive = true;
    var self = this;
    var sw = CFG.WIDTH, sh = CFG.HEIGHT;
    this._introBg = this.add.rectangle(sw / 2, sh / 2, sw, sh, 0x000000, 1).setScrollFactor(0).setDepth(500);
    this._introText = this.add.text(sw / 2, sh / 2, STORY.intro[0], {
      fontSize: "10px", color: "#c8b888", fontFamily: "'Courier New',monospace",
      align: "center", wordWrap: { width: sw - 40 }, lineSpacing: 6
    }).setOrigin(0.5).setScrollFactor(0).setDepth(501).setAlpha(0);

    this.tweens.add({ targets: this._introText, alpha: 1, duration: 800 });

    this._introZone = this.add.zone(sw / 2, sh / 2, sw, sh).setScrollFactor(0).setDepth(499).setInteractive();
    this._introZone.on("pointerdown", function() { self._advanceIntro(); });
  },

  _advanceIntro: function() {
    this._introIdx++;
    if (this._introIdx >= STORY.intro.length) {
      this._introActive = false;
      this.tweens.add({ targets: [this._introBg, this._introText], alpha: 0, duration: 600,
        onComplete: function() {
          this._introBg.destroy(); this._introText.destroy(); this._introZone.destroy();
        }, callbackScope: this
      });
    } else {
      this._introText.setText(STORY.intro[this._introIdx]);
      this._introText.setAlpha(0);
      this.tweens.add({ targets: this._introText, alpha: 1, duration: 500 });
    }
  },

  // ═══ INPUT ═══
  _setupTouch: function() {
    var self = this;
    var joyBase = { x: 65, y: CFG.HEIGHT - 80 };
    var joyR = 40;

    // Virtual joystick zone (left half of screen)
    this.input.on("pointermove", function(ptr) {
      if (ptr.isDown && ptr.x < CFG.WIDTH * 0.5) {
        var dx = ptr.x - joyBase.x;
        var dy = ptr.y - joyBase.y;
        var dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 5) {
          self.moveDir.x = dx / Math.max(dist, joyR);
          self.moveDir.y = dy / Math.max(dist, joyR);
        }
      }
    });
    this.input.on("pointerup", function(ptr) {
      if (ptr.x < CFG.WIDTH * 0.5) {
        self.moveDir.x = 0;
        self.moveDir.y = 0;
      }
    });

    // Draw joystick visual
    var joyGfx = this.add.graphics().setScrollFactor(0).setDepth(100).setAlpha(0.25);
    joyGfx.lineStyle(1, 0xffffff, 0.3);
    joyGfx.strokeCircle(joyBase.x, joyBase.y, joyR);
    joyGfx.fillStyle(0xffffff, 0.15);
    joyGfx.fillCircle(joyBase.x, joyBase.y, 12);
  },

  _setupKeyboard: function() {
    this.cursors = this.input.keyboard.createCursorKeys();
    this.kW = this.input.keyboard.addKey("W");
    this.kA = this.input.keyboard.addKey("A");
    this.kS = this.input.keyboard.addKey("S");
    this.kD = this.input.keyboard.addKey("D");
    this.kE = this.input.keyboard.addKey("E");
    this.kI = this.input.keyboard.addKey("I");
    this.kSPACE = this.input.keyboard.addKey("SPACE");

    this.kSPACE.on("down", function() { this._attackEnemy(); }, this);
    this.kE.on("down", function() { this._interactNPC(); }, this);
    this.kI.on("down", function() { this._openMenu(); }, this);
  },

  // ═══ UTILITIES ═══
  _showMsg: function(txt) {
    this.msgTimer = 3;
    if (this.msgLabel) { this.msgLabel.setText(txt).setAlpha(1); }
  },

  _showDmgNumber: function(x, y, val, color) {
    var hex = "#" + color.toString(16).padStart(6, "0");
    var txt = this.add.text(x, y, "-" + val, {
      fontSize: "8px", color: hex, fontFamily: "monospace", fontStyle: "bold"
    }).setOrigin(0.5).setDepth(50);
    this.tweens.add({ targets: txt, y: y - 20, alpha: 0, duration: 800,
      onComplete: function() { txt.destroy(); }
    });
  },

  _playerDeath: function() {
    this._showMsg("Tu as été vaincu...");
    PLAYER.hp = Math.floor(PLAYER.maxHp * 0.5);
    PLAYER.y = (this.mapH - 4) * this.T;
    PLAYER.save();
    this.time.delayedCall(1500, function() { this.scene.restart(); }, [], this);
  },

  _playMusic: function(key) {
    if (this._currentMusic) this._currentMusic.stop();
    try {
      this._currentMusic = this.sound.add(key, { loop: true, volume: 0.15 });
      this._currentMusic.play();
    } catch(e) {}
  }
});
