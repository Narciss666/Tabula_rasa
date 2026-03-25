// ═══ CHRONIQUES D'ARKANIS — COMBAT SCENE ═══
// Reserved for future dedicated combat transitions (boss arenas, etc.)
// Currently, all combat happens inline in WorldScene (action-RPG style)
"use strict";

var CombatScene = new Phaser.Class({
  Extends: Phaser.Scene,
  initialize: function() { Phaser.Scene.call(this, { key: "Combat" }); },
  create: function() {
    // Future: dedicated boss arena with phase transitions
    // For now, redirect back to world
    this.scene.start("World");
  }
});
