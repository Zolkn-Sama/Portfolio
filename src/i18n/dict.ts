export type Lang = 'fr' | 'en'

export type Ui = {
  status: string
  prompt: string
  searchPlaceholder: string
  searchAria: string
  run: string
  suggestions: string
  unknownTitle: string
  close: string
  theme: string
  themeDark: string
  themeLight: string
  lang: string
  breach: string[]
  decrypting: string
  wipe: string[]
  closing: string
  quickAccessTitle: string
  footerNote: string
  tronBoard: string
  tronKills: string
  tronSelf: string
  scrollHint: string
  downloadCv: string
  viewCv: string
  stack: string
  copy: string
  copied: string
  share: string
  linkCopied: string
  helpIntro: string
  // GitHub
  ghLoading: string
  ghRateLimit: string
  ghError: string
  ghRepos: string
  ghFollowers: string
  ghSince: string
  ghFork: string
  ghOpenProfile: string
  ghNoDescription: string
  // Rails latéraux
  railSystem: string
  railLog: string
  railLogEmpty: string
  railRoute: string
  railUptime: string
  railLocalTime: string
  railNone: string
  railAvailability: string
  railGhIdle: string
  games: {
    play: string
    close: string
    score: string
    best: string
    wave: string
    boss: string
    lives: string
    start: string
    restart: string
    gameOver: string
    victory: string
    leaderboard: string
    leaderboardLocal: string
    leaderboardMine: string
    leaderboardEmpty: string
    enterName: string
    save: string
    controls: string
    rules: string
    sound: string
    mission: string
    report: string
    console: string
    scoring: string
    formation: string
    enemies: string
    salvo: string
    fired: string
    hits: string
    accuracy: string
    kills: string
    bestCombo: string
    blocked: string
    landed: string
    topSpeed: string
    threat: string
    threatCalm: string
    threatRaised: string
    threatCritical: string
    host: string
    session: string
    standby: string
    invadersScoring: { label: string; value: string }[]
    intrusionScoring: { label: string; value: string }[]
    attackProgress: string
    targets: string
    offline: string
    invadersName: string
    invadersRules: string
    intrusionName: string
    intrusionInput: string
    intrusionRules: string
    integrity: string
    progress: string
    wpm: string
    breachRepelled: string
    systemDown: string
    paused: string
  }
}

export const ui: Record<Lang, Ui> = {
  fr: {
    status: 'EN LIGNE',
    prompt: 'visiteur@landrecy:~$',
    searchPlaceholder: 'Astuce : tapez / pour naviguer.',
    searchAria: 'Barre de commande : naviguer dans le portfolio',
    run: 'Exécuter',
    suggestions: 'Suggestions',
    unknownTitle: 'Commande inconnue',
    close: 'Fermer le panneau',
    theme: 'Thème',
    themeDark: 'Sombre',
    themeLight: 'Clair',
    lang: 'Langue',
    breach: [
      '$ nmap -sS portfolio.landrecy.dev',
      '$ exploit --target /var/data/profile',
      '> contournement du pare-feu ............ OK',
      '> déchiffrement du bloc mémoire ....... OK',
      '> ACCÈS AUTORISÉ',
    ],
    decrypting: 'DÉCHIFFREMENT…',
    wipe: [
      '$ history -c',
      '> effacement du tampon ............... OK',
      '> purge des traces ................... OK',
      '> SESSION FERMÉE',
    ],
    closing: 'FERMETURE…',
    quickAccessTitle: 'Accès rapide',
    footerNote: 'Aucun système n’a réellement été piraté durant la conception de ce site.',
    tronBoard: 'Duels',
    tronKills: 'élim.',
    tronSelf: 'sorties',
    scrollHint: 'Résultat ci-dessous',
    downloadCv: 'Télécharger',
    viewCv: 'Ouvrir',
    stack: 'Stack',
    copy: 'Copier',
    copied: 'Copié',
    share: 'Copier le lien',
    linkCopied: 'Lien copié',
    helpIntro: 'Commandes disponibles :',
    ghLoading: 'Interrogation de l’API GitHub…',
    ghRateLimit: 'GitHub limite les requêtes anonymes à 60 par heure. Réessaie dans un moment.',
    ghError: 'Impossible de joindre GitHub pour l’instant.',
    ghRepos: 'dépôts publics',
    ghFollowers: 'abonnés',
    ghSince: 'sur GitHub depuis',
    ghFork: 'fork',
    ghOpenProfile: 'Ouvrir le profil GitHub',
    ghNoDescription: 'Pas de description.',
    railSystem: 'système',
    railLog: 'journal',
    railLogEmpty: 'Aucune requête pour l’instant.',
    railRoute: 'route',
    railUptime: 'session',
    railLocalTime: 'heure locale',
    railNone: 'aucune',
    railAvailability: 'zone',
    railGhIdle: 'Charger mes dépôts →',
    games: {
      play: 'Jouer',
      close: 'Quitter',
      score: 'Score',
      best: 'Record',
      wave: 'Vague',
      boss: 'Boss',
      lives: 'Vies',
      start: 'Commencer',
      restart: 'Rejouer',
      gameOver: 'Partie terminée',
      victory: 'Victoire',
      leaderboard: 'Classement',
      leaderboardLocal: 'Le tableau est livré avec le site ; tes parties restent dans ce navigateur.',
      leaderboardMine: 'toi',
      leaderboardEmpty: 'Aucun score pour l’instant.',
      enterName: 'Tes initiales',
      save: 'Enregistrer',
      controls: 'Commandes',
      rules: 'Règles',
      sound: 'Son',
      mission: 'Mission',
      report: 'Relevé',
      console: 'Console',
      scoring: 'Barème',
      formation: 'Formation',
      enemies: 'ennemis',
      salvo: 'tirs simultanés',
      fired: 'Tirs',
      hits: 'Touches',
      accuracy: 'Précision',
      kills: 'Abattus',
      bestCombo: 'Meilleur combo',
      blocked: 'Bloquées',
      landed: 'Passées',
      topSpeed: 'Pointe',
      threat: 'Menace',
      threatCalm: 'nominale',
      threatRaised: 'élevée',
      threatCritical: 'critique',
      host: 'hôte',
      session: 'session',
      standby: 'en attente',
      invadersScoring: [
        { label: 'ennemi', value: '100 × combo' },
        { label: 'combo', value: '+0,15 / touche' },
        { label: 'sans touche', value: 'combo perdu en 1,6 s' },
        { label: 'vague rapide', value: 'bonus de temps' },
        { label: 'dégât', value: '−150 et 1 vie' },
        { label: 'boss', value: '2 500' },
      ],
      intrusionScoring: [
        { label: 'commande', value: '10 / caractère' },
        { label: 'frappe rapide', value: 'jusqu’à ×3' },
        { label: 'commande passée', value: '−poids en intégrité' },
        { label: 'attaque 100 %', value: 'système perdu' },
        { label: 'survie', value: '10 / point restant' },
      ],
      attackProgress: 'Attaque',
      targets: 'À bloquer',
      offline: 'hors ligne',
      invadersName: 'Space Invader',
      invadersRules:
        'Trois vagues puis un boss. Chaque ennemi abattu rapporte des points, un multiplicateur récompense la vitesse, et chaque dégât subi en coûte.',
      intrusionName: 'Cyber Breach',
      intrusionInput: 'Nom de l’outil à bloquer',
      intrusionRules:
        'Des processus hostiles descendent vers ton pare-feu. Tape leur nom pour les neutraliser : plus tu tapes vite, plus le multiplicateur monte.',
      integrity: 'Intégrité',
      progress: 'Progression',
      wpm: 'mots/min',
      breachRepelled: 'Intrusion repoussée',
      systemDown: 'Système compromis',
      paused: 'En pause',
    },
  },
  en: {
    status: 'ONLINE',
    prompt: 'visitor@landrecy:~$',
    searchPlaceholder: 'Tip: type / to navigate.',
    searchAria: 'Command bar: navigate the portfolio',
    run: 'Run',
    suggestions: 'Suggestions',
    unknownTitle: 'Unknown command',
    close: 'Close panel',
    theme: 'Theme',
    themeDark: 'Dark',
    themeLight: 'Light',
    lang: 'Language',
    breach: [
      '$ nmap -sS portfolio.landrecy.dev',
      '$ exploit --target /var/data/profile',
      '> firewall bypass .................... OK',
      '> memory block decryption ........... OK',
      '> ACCESS GRANTED',
    ],
    decrypting: 'DECRYPTING…',
    wipe: [
      '$ history -c',
      '> buffer wipe ........................ OK',
      '> trace purge ........................ OK',
      '> SESSION CLOSED',
    ],
    closing: 'CLOSING…',
    quickAccessTitle: 'Quick access',
    footerNote: 'No system was actually hacked in the making of this website.',
    tronBoard: 'Duels',
    tronKills: 'kills',
    tronSelf: 'crashes',
    scrollHint: 'Result below',
    downloadCv: 'Download',
    viewCv: 'Open',
    stack: 'Stack',
    copy: 'Copy',
    copied: 'Copied',
    share: 'Copy link',
    linkCopied: 'Link copied',
    helpIntro: 'Available commands:',
    ghLoading: 'Querying the GitHub API…',
    ghRateLimit: 'GitHub caps anonymous requests at 60 per hour. Try again shortly.',
    ghError: 'Can’t reach GitHub right now.',
    ghRepos: 'public repos',
    ghFollowers: 'followers',
    ghSince: 'on GitHub since',
    ghFork: 'fork',
    ghOpenProfile: 'Open GitHub profile',
    ghNoDescription: 'No description.',
    railSystem: 'system',
    railLog: 'log',
    railLogEmpty: 'No request yet.',
    railRoute: 'route',
    railUptime: 'session',
    railLocalTime: 'local time',
    railNone: 'none',
    railAvailability: 'area',
    railGhIdle: 'Load my repositories →',
    games: {
      play: 'Play',
      close: 'Quit',
      score: 'Score',
      best: 'Best',
      wave: 'Wave',
      boss: 'Boss',
      lives: 'Lives',
      start: 'Start',
      restart: 'Play again',
      gameOver: 'Game over',
      victory: 'Victory',
      leaderboard: 'Leaderboard',
      leaderboardLocal: 'The board ships with the site; your own runs stay in this browser.',
      leaderboardMine: 'you',
      leaderboardEmpty: 'No score yet.',
      enterName: 'Your initials',
      save: 'Save',
      controls: 'Controls',
      rules: 'Rules',
      sound: 'Sound',
      mission: 'Mission',
      report: 'Report',
      console: 'Console',
      scoring: 'Scoring',
      formation: 'Formation',
      enemies: 'enemies',
      salvo: 'concurrent shots',
      fired: 'Shots',
      hits: 'Hits',
      accuracy: 'Accuracy',
      kills: 'Kills',
      bestCombo: 'Best combo',
      blocked: 'Blocked',
      landed: 'Landed',
      topSpeed: 'Peak',
      threat: 'Threat',
      threatCalm: 'nominal',
      threatRaised: 'raised',
      threatCritical: 'critical',
      host: 'host',
      session: 'session',
      standby: 'standby',
      invadersScoring: [
        { label: 'kill', value: '100 × combo' },
        { label: 'combo', value: '+0.15 / hit' },
        { label: 'no hit', value: 'combo lost after 1.6 s' },
        { label: 'fast wave', value: 'time bonus' },
        { label: 'damage', value: '−150 and 1 life' },
        { label: 'boss', value: '2,500' },
      ],
      intrusionScoring: [
        { label: 'command', value: '10 / character' },
        { label: 'fast typing', value: 'up to ×3' },
        { label: 'landed command', value: '−weight in integrity' },
        { label: 'attack 100%', value: 'system lost' },
        { label: 'survival', value: '10 / point left' },
      ],
      attackProgress: 'Attack',
      targets: 'To block',
      offline: 'offline',
      invadersName: 'Space Invader',
      invadersRules:
        'Three waves, then a boss. Every kill scores, a multiplier rewards speed, and every hit you take costs you.',
      intrusionName: 'Cyber Breach',
      intrusionInput: 'Name of the tool to block',
      intrusionRules:
        'Hostile processes descend towards your firewall. Type their name to neutralise them: the faster you type, the higher the multiplier.',
      integrity: 'Integrity',
      progress: 'Progress',
      wpm: 'wpm',
      breachRepelled: 'Breach repelled',
      systemDown: 'System compromised',
      paused: 'Paused',
    },
  },
}
