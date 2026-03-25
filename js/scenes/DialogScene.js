// ═══ CHRONIQUES D'ARKANIS — DIALOG SCENE (AI HYBRID) ═══
// Overlay scene for AI-powered NPC dialogues
// Falls back to fixed text if no API key is set
"use strict";

var DialogScene = new Phaser.Class({
  Extends: Phaser.Scene,
  initialize: function() { Phaser.Scene.call(this, { key: "Dialog" }); },

  init: function(data) {
    this.npcName = data.name || "???";
    this.npcContext = data.context || "";
    this.callback = data.callback || null;
  },

  create: function() {
    if (!CFG.API_KEY) {
      // No API key — skip AI dialogue
      if (this.callback) this.callback(null);
      this.scene.stop();
      return;
    }

    var self = this;
    var sw = CFG.WIDTH, sh = CFG.HEIGHT;

    // Semi-transparent overlay
    this.add.rectangle(sw / 2, sh / 2, sw, sh, 0x000000, 0.5).setDepth(0);

    // Dialog box
    this.add.rectangle(sw / 2, sh - 70, sw - 16, 80, 0x0a0a1a, 0.95)
      .setDepth(1).setStrokeStyle(1, 0x555555);

    this.nameText = this.add.text(14, sh - 106, this.npcName, {
      fontSize: "8px", color: "#eecc44", fontFamily: "monospace"
    }).setDepth(2);

    this.lineText = this.add.text(14, sh - 92, "...", {
      fontSize: "8px", color: "#cccccc", fontFamily: "monospace",
      wordWrap: { width: sw - 32 }, lineSpacing: 3
    }).setDepth(2);

    // Call Claude API
    this._callAI();
  },

  _callAI: function() {
    var self = this;
    var zone = ZONES[PLAYER.zoneId];
    var prompt = "Tu parles au joueur dans la zone: " + zone.name +
      ". Niveau du joueur: " + PLAYER.level +
      ". Sceaux restaurés: " + PLAYER.seals.length + "/5." +
      " " + this.npcContext;

    fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": CFG.API_KEY,
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-direct-browser-access": "true"
      },
      body: JSON.stringify({
        model: CFG.AI_MODEL,
        max_tokens: 150,
        system: STORY.aiSystem,
        messages: [{ role: "user", content: prompt }]
      })
    }).then(function(r) { return r.json(); })
    .then(function(d) {
      try {
        var text = d.content[0].text;
        var parsed = JSON.parse(text.substring(text.indexOf("{")));
        self.lineText.setText(parsed.line || "...");
      } catch(e) {
        self.lineText.setText(d.content[0].text || "...");
      }
    }).catch(function() {
      self.lineText.setText("(Le vent emporte les mots...)");
    });

    // Tap to close
    this.input.on("pointerdown", function() {
      if (self.callback) self.callback(null);
      self.scene.stop();
    });
  }
});
