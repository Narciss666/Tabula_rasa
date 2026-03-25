// ═══ CHRONIQUES D'ARKANIS — PLAYER SYSTEM ═══
"use strict";

var PLAYER = {
  // Core stats
  level: 1,
  xp: 0,
  hp: 30,
  maxHp: 30,
  atk: 5,
  def: 2,
  spd: 80,

  // Position
  x: 160,
  y: 500,
  zoneId: "forest",
  facing: 0,  // 0=down 1=left 2=right 3=up

  // State
  invuln: 0,
  attackTimer: 0,
  dashTimer: 0,
  isDashing: false,
  isAttacking: false,

  // Inventory
  inventory: [],    // { id, name, qty, type:"ingredient"|"potion"|"key" }
  potions: [],      // crafted potions/spells
  maxInv: 20,
  crystals: 0,      // currency

  // Progress
  seals: [],        // restored seals
  bossKills: [],    // boss IDs defeated
  flags: {},        // story flags
  chestsOpened: [],

  // ─── METHODS ───

  addXp: function(amount) {
    this.xp += amount;
    var next = CFG.XP_TABLE[this.level];
    if (next && this.xp >= next && this.level < 10) {
      this.level++;
      var s = CFG.LEVEL_STATS[this.level - 1];
      this.maxHp = s.hp;
      this.hp = s.hp;  // full heal on level up
      this.atk = s.atk;
      this.def = s.def;
      this.spd = s.spd;
      return true; // level up!
    }
    return false;
  },

  takeDamage: function(raw) {
    if (this.invuln > 0) return 0;
    var dmg = Math.max(1, raw - this.def);
    this.hp = Math.max(0, this.hp - dmg);
    this.invuln = CFG.INVULN_DUR;
    return dmg;
  },

  heal: function(amount) {
    this.hp = Math.min(this.maxHp, this.hp + amount);
  },

  addItem: function(id, name, type, qty) {
    qty = qty || 1;
    for (var i = 0; i < this.inventory.length; i++) {
      if (this.inventory[i].id === id) {
        this.inventory[i].qty += qty;
        return true;
      }
    }
    if (this.inventory.length < this.maxInv) {
      this.inventory.push({ id: id, name: name, type: type, qty: qty });
      return true;
    }
    return false; // full
  },

  removeItem: function(id, qty) {
    qty = qty || 1;
    for (var i = 0; i < this.inventory.length; i++) {
      if (this.inventory[i].id === id) {
        this.inventory[i].qty -= qty;
        if (this.inventory[i].qty <= 0) this.inventory.splice(i, 1);
        return true;
      }
    }
    return false;
  },

  hasItem: function(id, qty) {
    qty = qty || 1;
    for (var i = 0; i < this.inventory.length; i++) {
      if (this.inventory[i].id === id && this.inventory[i].qty >= qty) return true;
    }
    return false;
  },

  addPotion: function(potion) {
    this.potions.push(potion);
  },

  usePotion: function(idx) {
    if (idx < 0 || idx >= this.potions.length) return null;
    var p = this.potions[idx];
    if (p.effect === "heal") this.heal(p.power);
    else if (p.effect === "atk_boost") this._boost = { stat: "atk", val: p.power, dur: 10000 };
    else if (p.effect === "def_boost") this._boost = { stat: "def", val: p.power, dur: 10000 };
    else if (p.effect === "fire_shield") this._shield = { type: "fire", dur: 15000 };
    else if (p.effect === "ice_blade") this._enchant = { type: "ice", dur: 12000, dmg: p.power };
    this.potions.splice(idx, 1);
    return p;
  },

  // Save/Load
  save: function() {
    try {
      localStorage.setItem("arkanis_save", JSON.stringify({
        level: this.level, xp: this.xp, hp: this.hp, maxHp: this.maxHp,
        atk: this.atk, def: this.def, spd: this.spd,
        x: this.x, y: this.y, zoneId: this.zoneId,
        inventory: this.inventory, potions: this.potions,
        crystals: this.crystals, seals: this.seals,
        bossKills: this.bossKills, flags: this.flags,
        chestsOpened: this.chestsOpened
      }));
    } catch(e) {}
  },

  load: function() {
    try {
      var d = JSON.parse(localStorage.getItem("arkanis_save"));
      if (!d) return false;
      for (var k in d) if (this.hasOwnProperty(k)) this[k] = d[k];
      return true;
    } catch(e) { return false; }
  },

  reset: function() {
    this.level = 1; this.xp = 0;
    var s = CFG.LEVEL_STATS[0];
    this.hp = s.hp; this.maxHp = s.hp; this.atk = s.atk; this.def = s.def; this.spd = s.spd;
    this.x = 160; this.y = 500; this.zoneId = "forest";
    this.inventory = []; this.potions = []; this.crystals = 0;
    this.seals = []; this.bossKills = []; this.flags = {}; this.chestsOpened = [];
    this.invuln = 0; this.attackTimer = 0; this.dashTimer = 0;
    this.isDashing = false; this.isAttacking = false;
    this._boost = null; this._shield = null; this._enchant = null;
  }
};
