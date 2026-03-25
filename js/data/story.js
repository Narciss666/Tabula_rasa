// ═══ CHRONIQUES D'ARKANIS — STORY DATA ═══
"use strict";

var STORY = {
  intro: [
    "Le monde d'Arkanis se meurt.",
    "Les cinq Sceaux qui maintenaient l'équilibre\nse brisent un à un.",
    "Tu es le dernier Alchimiste.\nSeul ton art peut les restaurer.",
    "Traverse les cinq domaines.\nVaincs leurs gardiens.\nForge les Sceaux.",
    "Le temps presse."
  ],

  // NPC dialogues per zone — fixed scenario
  npcs: {
    forest: [
      {
        id: "elder",
        name: "Ancien Vert",
        sprite: "npc_elder",
        x: 10, y: 28,
        dialog: [
          { cond: null, lines: [
            "Jeune alchimiste... les arbres murmurent ton nom.",
            "Le Sylvain ancestral garde le premier Sceau,\nau cœur de la forêt.",
            "Cueille l'Herbe de Lune et la Mousse Ancienne.\nElles te protégeront."
          ]},
          { cond: "boss_forest_dead", lines: [
            "Le Sceau de la Forêt est restauré.\nLes arbres respirent à nouveau.",
            "Les Ruines d'Eryon t'attendent au nord.\nLà-bas, les morts ne dorment plus."
          ]}
        ]
      },
      {
        id: "merchant",
        name: "Marchand itinérant",
        sprite: "npc_merchant",
        x: 5, y: 20,
        dialog: [
          { cond: null, lines: [
            "Hé! Tu cherches des ingrédients?\nJ'en échange contre des cristaux.",
            "Reviens quand tu auras vaincu\nquelques monstres."
          ]}
        ]
      }
    ],
    ruins: [
      {
        id: "ghost",
        name: "Esprit d'Eryon",
        sprite: "npc_ghost",
        x: 12, y: 25,
        dialog: [
          { cond: null, lines: [
            "Je fus le dernier roi d'Eryon...\navant que la Liche ne me prenne tout.",
            "La Poudre d'Os et les Éclats de Rune\nsont la clé pour briser sa garde.",
            "Méfie-toi des spectres.\nIls traversent les murs."
          ]}
        ]
      }
    ],
    glacier: [
      {
        id: "hermit",
        name: "Ermite des glaces",
        sprite: "npc_hermit",
        x: 8, y: 30,
        dialog: [
          { cond: null, lines: [
            "Le froid ici n'est pas naturel.\nC'est le souffle du Wyrm.",
            "Le Cristal de Gel concentre son pouvoir.\nRetourne-le contre lui."
          ]}
        ]
      }
    ],
    volcano: [
      {
        id: "smith",
        name: "Forgeron maudit",
        sprite: "npc_smith",
        x: 14, y: 22,
        dialog: [
          { cond: null, lines: [
            "L'Ifrit a consumé ma forge...\nmais pas mon savoir.",
            "L'Obsidienne Vive absorbe les flammes.\nMélange-la au Soufre Pur."
          ]}
        ]
      }
    ],
    citadel: [
      {
        id: "rebel",
        name: "Résistante",
        sprite: "npc_rebel",
        x: 6, y: 18,
        dialog: [
          { cond: null, lines: [
            "Le Roi n'est plus humain.\nL'Éther Noir l'a corrompu.",
            "Quatre Sceaux restaurés...\nil ne reste que le sien.",
            "Tout Arkanis compte sur toi."
          ]}
        ]
      }
    ]
  },

  // Quest flags
  flags: {},

  // AI dialogue system prompt (for hybrid mode)
  aiSystem: "Tu es un PNJ dans Chroniques d'Arkanis, un JRPG médiéval-fantastique. " +
    "Le joueur est le dernier Alchimiste, cherchant à restaurer 5 Sceaux. " +
    "Réponds en 1-2 phrases, en français, dans le style du personnage. " +
    "Reste dans l'univers. Pas de méta. JSON: {\"line\":\"...\",\"hint\":\"...\"|null}",

  // Ending
  ending: [
    "Les cinq Sceaux brillent à nouveau.",
    "L'équilibre d'Arkanis est restauré.",
    "Mais dans l'ombre, quelque chose remue...",
    "Le dernier Alchimiste sait que\nce n'est qu'un sursis.",
    "FIN — Merci d'avoir joué."
  ]
};
