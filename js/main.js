// ═══ CHRONIQUES D'ARKANIS — MAIN ═══
"use strict";

var _pw = Math.min(window.innerWidth, CFG.WIDTH);
var _ph = Math.min(window.innerHeight, CFG.HEIGHT);

var game = new Phaser.Game({
  type: Phaser.CANVAS,  // Canvas mode = lighter on Mali GPU
  width: _pw,
  height: _ph,
  backgroundColor: "#0a0a12",
  parent: document.body,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  input: {
    activePointers: 3
  },
  fps: {
    target: CFG.FPS,
    forceSetTimeOut: true  // More reliable on low-end Android
  },
  render: {
    antialias: false,
    pixelArt: true,
    clearBeforeRender: false,
    roundPixels: true
  },
  scene: [BootScene, WorldScene, CombatScene, DialogScene]
});

// Prevent pull-to-refresh on mobile
document.addEventListener("touchmove", function(e) { e.preventDefault(); }, { passive: false });
