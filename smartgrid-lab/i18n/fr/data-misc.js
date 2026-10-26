/* FR — communication, traçages, comparaisons, extensions, références, scénarios, produits */
SG.I18D.fr.commLayers = {
  conn: { n: 'Connecteur physique', q: 'Où se branche-t-il ?', ex: 'RJ45, M12, bornier à vis 3 points, SUB-D 9, connecteur de câble solaire', note: 'Un même connecteur ne signifie pas une même interface : de nombreux fabricants sortent du RS485 ou du CAN sur un port RJ45 avec leur propre brochage. Y brancher un câble Ethernet ne fonctionne pas et peut même endommager le matériel.' },
  elec: { n: 'Interface électrique / couche physique', q: 'À quoi ressemble le signal électrique sur le fil ?', ex: '10/100BASE-TX, RS485 (différentiel 2 fils), CAN (ISO 11898-2), contacts 24 V CC, 4–20 mA, radio LoRa 868 MHz', note: 'Détermine la distance, le nombre d’équipements, la nécessité de résistances de terminaison et la présence ou non d’isolation.' },
  net: { n: 'Réseau / liaison & transport', q: 'Comment un paquet trouve-t-il l’équipement ?', ex: 'Ethernet + IP + TCP (adresse IP, port 502), bus série maître–esclave (adresse esclave), bus CAN (identifiant de message), réseau en étoile LoRaWAN', note: 'Ethernet est une technologie de réseau ; Modbus est un protocole applicatif. Ils ne sont pas au même niveau : il ne s’agit jamais de choisir « Ethernet ou Modbus ».' },
  app: { n: 'Protocole applicatif & modèle de données', q: 'Les deux côtés comprennent-ils le contenu de la même manière ?', ex: 'Modbus (registres + table des registres), MQTT (topics/charges utiles libres), OCPP, SunSpec, IEC 61850 (modèle normalisé)', note: 'Même si les deux « supportent Modbus », il faut que concordent : codes fonction, adresses des registres, types de données, ordre des mots, facteurs d’échelle, unités, et que l’équipement fournisse réellement la grandeur voulue.' }
};

SG.I18D.fr.comms = {
  mbrtu: { n: 'Modbus RTU sur RS485', lv: { conn: 'Bornes à vis D+/D−/0V (ou RJ45/SUB-D selon le fabricant — vérifier le brochage)', elec: 'RS485 différentiel 2 fils, half-duplex', net: 'Bus série, 1 maître, jusqu’à 32 charges unitaires par segment (selon les émetteurs-récepteurs), adresses esclaves 1–247', app: 'Modbus RTU : codes fonction 03/04 en lecture, 06/16 en écriture ; CRC16' },
    ends: ['Automate : module RS485 (maître/client)', 'Compteurs de départ, contrôleur de groupe : port RS485 (esclave/serveur)'],
    cable: 'Paire torsadée blindée, impédance ~120 Ω, + fil 0 V commun. Topologie en guirlande ; pas de câblage en étoile ; dérivations courtes.',
    roles: 'Le maître (client) interroge à tour de rôle ; un esclave (serveur) ne répond que s’il est interrogé à sa propre adresse. Un seul maître sur le bus.',
    params: ['Adresse esclave de chaque équipement (toutes différentes)', 'Débit (par ex. 19200)', 'Parité + bits de stop (par ex. 8E1) — identiques sur tout le bus', 'Temporisation et nombre de répétitions', 'Délai entre requêtes', 'Table des registres : adresses (base 0 ou base 1 !), codes fonction, types de données (INT16/UINT32/FLOAT32), ordre des mots, facteurs d’échelle'],
    data: ['P, U, I, f, E des compteurs de départ', 'P, U, f, état du groupe'],
    extra: 'Nécessite un module RS485 pour l’automate (ou un automate à port intégré), ou une passerelle si le maître est un équipement Ethernet. Résistances de 120 Ω aux deux extrémités du bus ; polarisation en un point.',
    limits: ['Lent : chaque requête prend quelques dizaines de ms ; 10 équipements × 5 requêtes ≈ 1–2 s par cycle.', 'La longueur du bus dépend du débit (jusqu’à environ 1200 m à faible débit).'],
    errors: ['D+/D− inversés (la désignation A/B diffère selon les fabricants !)', 'Résistances de terminaison manquantes/en trop', 'Deux équipements à la même adresse', 'Mauvaise parité sur un équipement → seul cet équipement reste muet', 'Adresse de registre décalée de 1 (base 0 / base 1) → valeurs absurdes', 'FLOAT32 lu avec le mauvais ordre des mots → nombres énormes', 'Pas de 0 V commun → erreurs aléatoires', 'Deux maîtres sur un même bus'] },
  mbtcp: { n: 'Modbus TCP sur Ethernet', lv: { conn: 'RJ45 (ou M12)', net: 'Ethernet + IP + TCP, port 502 ; topologie en étoile via un commutateur', app: 'Modbus (même modèle de registres que le RTU) encapsulé dans un en-tête MBAP avec Unit ID' },
    ends: ['Automate/EMS : client', 'Centrale PCC, onduleur, PCS, variateur : serveur'],
    cable: 'Cat5e/6 blindé, ≤ 100 m par segment ; commutateur industriel 24 V CC.',
    roles: 'Le client ouvre une connexion TCP vers le serveur et envoie ses requêtes. Plusieurs clients peuvent interroger un même serveur s’il accepte assez de connexions.',
    params: ['Adresse IP, masque, passerelle par défaut (même plage, pas de doublon)', 'Port 502', 'Unit ID (souvent 1 ou 255 ; important à travers une passerelle)', 'Cycle de lecture, temporisation', 'Table des registres comme en RTU'],
    data: ['P signée au PCC, U, f', 'P PV, état, limite P (écriture)', 'P batterie, SOC, consigne (écriture)', 'Vitesse, courant, défauts du variateur'],
    extra: 'Commutateur Ethernet. Pas de passerelle si les deux côtés sont en Ethernet.',
    limits: ['Nombre de connexions TCP simultanées d’un équipement (parfois 2–4 seulement) — automate + EMS + outil de mise en service peuvent le dépasser.', 'Pas de temps réel garanti ; ne pas utiliser pour la protection.'],
    errors: ['Adresse IP en double', 'Équipement dans une autre plage IP', 'Unit ID erroné', 'Équipement doté d’un RJ45 mais n’exécutant qu’un protocole propriétaire/web, Modbus TCP non activé', 'Table des registres différente selon la version de firmware', 'Écriture continue d’une consigne dans un registre mémorisé en EEPROM → usure de la mémoire'] },
  hw: { n: 'Signaux câblés DI/DO', lv: { conn: 'Bornes à vis/à ressort sur le bornier X2', elec: '24 V CC (contact sec, PNP), ou 230 V CA après un relais', net: 'Point à point, pas de réseau', app: 'Pas de protocole : 1 fil = 1 signification (MARCHE/ARRÊT)' },
    ends: ['Équipement : contacts auxiliaires, relais de signalisation, bobines', 'Automate : DI/DO'],
    cable: '0,75–1 mm², fils repérés aux deux extrémités.',
    roles: 'Ni client ni serveur. Sens du signal fixe.',
    params: ['Logique PNP/NPN (sink/source)', 'Tension 24 V CC', 'NO ou NF (choisir NF pour les signaux devant être à sécurité positive)', 'Filtrage des entrées'],
    data: ['États OF/SD, retours des contacteurs', 'Ordre de marche variateur, bobines KA'],
    extra: 'Relais d’interface en cas de tension/courant différents ; diodes/RC d’antiparasitage.',
    limits: ['Chaque signal consomme 1 voie et 1–2 fils.'],
    errors: ['Équipement PNP sur une entrée NPN', 'Bouton d’arrêt en NO', 'DO transistor raccordée à une charge AC', 'Oubli du 0 V commun entre deux alimentations'] },
  analog: { n: 'Signaux analogiques 4–20 mA / 0–10 V / RTD', lv: { conn: 'Bornes à vis', elec: 'Boucle de courant 4–20 mA, tension 0–10 V, résistance Pt100', net: 'Point à point', app: 'Aucun : valeur = mise à l’échelle linéaire, configurée dans l’automate' },
    ends: ['Capteur/variateur', 'Module AI/AO'],
    cable: 'Câble torsadé blindé, blindage relié à une extrémité ; séparé des câbles de puissance.',
    params: ['Type de signal de chaque voie', 'Échelle (par ex. 4 mA = 0, 20 mA = 1500 W/m²)', 'Alimentation de boucle pour les équipements 2 fils', 'Filtrage'],
    data: ['Éclairement, température', 'Consigne de vitesse variateur'],
    extra: 'Isolateur de signal si les potentiels diffèrent.',
    limits: ['Une valeur par paire de fils.'], errors: ['Voie configurée en 0–10 V pour un capteur 4–20 mA', 'Blindage relié aux deux extrémités créant une boucle de masse', 'Pt100 2 fils sur un câble long → erreur de mesure'] },
  mqtt: { n: 'MQTT sur réseau IP', lv: { elec: 'Ethernet / radio', net: 'TCP/IP, port 1883 (8883 avec TLS)', app: 'MQTT publication/abonnement ; charge utile (JSON…) définie par l’intégrateur' },
    ends: ['Équipement/passerelle : client qui publie', 'Broker (sur le PC EMS ou dans le cloud)', 'EMS/tableau de bord : client abonné'],
    cable: 'Réseau IP existant.',
    roles: 'Chaque partie est cliente du broker ; pas de requête–réponse directe.',
    params: ['Adresse du broker, port, TLS, identifiants', 'Topic (par ex. lab/room/temp)', 'QoS 0/1/2, retain', 'Format de la charge utile, unités, horodatage'],
    data: ['Données des capteurs LoRaWAN après le serveur réseau', 'Envoi des données de l’EMS vers le cloud'],
    extra: 'Broker. Les automates n’ont généralement pas MQTT → pris en charge par l’EMS ou une passerelle IoT.',
    limits: ['Aucun modèle de données défini : deux systèmes « parlant MQTT » peuvent ne pas se comprendre.', 'Pas pour une commande de sécurité.'],
    errors: ['Topics incohérents', 'Charge utile sans unités', 'Données périmées non gérées après une perte de connexion'] },
  can: { n: 'CAN entre BMS et PCS', lv: { conn: 'RJ45 (brochage propre au fabricant !) ou bornes', elec: 'CAN différentiel (CAN_H/CAN_L), 250/500 kbit/s', net: 'Bus multi-maîtres, messages par identifiant, 120 Ω aux deux extrémités', app: 'Protocole batterie du fabricant (ou CANopen…) — doit figurer dans la liste de compatibilité' },
    cable: 'Câble indiqué par le fabricant (souvent un câble RJ45 au brochage spécifique).',
    roles: 'Le BMS diffuse périodiquement limites et état ; le PCS s’y conforme.',
    params: ['Débit binaire', 'Choix du « type de batterie » sur le PCS', 'Résistances de terminaison'],
    data: ['CVL, CCL, DCL', 'SOC, SOH, température, alarmes'],
    extra: 'Pas de passerelle si le protocole est le même ; sinon une passerelle dédiée du fabricant (si elle existe).',
    limits: ['Courtes distances à haut débit.'],
    errors: ['Utilisation d’un câble Ethernet ordinaire (mauvais brochage)', 'Protocole différent bien que tous deux soient « CAN »', 'Résistance de terminaison manquante'] },
  lorawan: { n: 'LoRaWAN pour les capteurs', lv: { conn: 'Antenne', elec: 'Modulation LoRa, bande 868 MHz (Europe)', net: 'Étoile : capteur → passerelle → serveur réseau (via IP)', app: 'Petites charges utiles binaires décodées par le serveur, transmises en MQTT à l’EMS' },
    ends: ['Capteurs sur pile', 'Passerelle + serveur réseau'],
    cable: 'Sans fil ; la passerelle est raccordée en Ethernet.',
    roles: 'Les capteurs émettent d’eux-mêmes ; les commandes descendantes sont très limitées.',
    params: ['Clés d’activation (OTAA : DevEUI, AppKey…)', 'Période d’émission', 'Décodeur de charge utile'],
    data: ['Température et humidité de la salle ; température de l’armoire batterie'],
    extra: 'Passerelle, serveur réseau (local ou en service).',
    limits: ['Rapport cyclique limité par la réglementation régionale', 'Latence de quelques secondes à quelques minutes → PAS pour la commande'],
    errors: ['Utiliser LoRaWAN pour le délestage', 'Mauvaise bande de fréquences régionale'] },
  ocpp: { n: 'OCPP entre borne et EMS', lv: { app: 'OCPP 1.6J ou 2.0.1 (JSON)' },
    ends: ['Borne : client (Charge Point)', 'EMS : serveur (CSMS)'],
    roles: 'La borne ouvre la connexion vers le CSMS.',
    params: ['URL du CSMS, identifiant de la borne', 'Version OCPP', 'Support du Smart Charging (SetChargingProfile)'],
    data: ['MeterValues (kW, kWh)', 'État', 'Limite de courant'],
    extra: 'Logiciel CSMS dans l’EMS.', limits: ['Toutes les bornes ne gèrent pas le smart charging.'], errors: ['Versions OCPP différentes', 'Aucune limite par défaut définie en cas de perte de connexion'] },
  gw: { n: 'Passerelle Modbus TCP ↔ RTU', lv: { conn: 'RJ45 + bornes RS485', net: 'TCP/IP ↔ bus série', app: 'Modbus : Unit ID ↔ adresse esclave' },
    ends: ['Client TCP (automate/EMS)', 'Esclaves RS485'],
    cable: 'Comme pour les deux types ci-dessus.', roles: 'La passerelle est serveur côté TCP et maître côté RS485.',
    params: ['IP de la passerelle', 'Table de correspondance des Unit ID', 'Débit/parité côté RS485', 'Temporisation (client > passerelle)'],
    data: ['Comme en Modbus RTU'], limits: ['Pas plus rapide que le bus RS485.', 'Un seul maître sur le bus RS485.'], errors: ['Temporisation du client plus courte que celle de la passerelle', 'Module RS485 de l’automate et passerelle tous deux maîtres'] },
  iec61850: { n: 'IEC 61850 (extension)', lv: { conn: 'RJ45 / fibre optique', net: 'Ethernet ; GOOSE en couche 2 (sans IP) ; MMS sur TCP/IP', app: 'Modèle de données normalisé (nœuds logiques MMXU, XCBR…), fichiers de configuration SCL' },
    ends: ['IED (relais de protection, contrôleurs de travée)', 'SCADA/passerelle de poste'],
    cable: 'Commutateurs administrables gérant VLAN/priorités ; souvent redondants (PRP/HSR).',
    params: ['Fichiers SCL (ICD/CID/SCD)', 'Outil de configuration système', 'VLAN, priorité GOOSE'],
    data: ['Mesures, états, commandes, verrouillages rapides entre relais'],
    extra: 'IED compatibles 61850, outils d’ingénierie, expertise approfondie.',
    limits: ['Complexe et coûteux pour un modèle de 80 m² n’utilisant que des équipements BT Modbus.'],
    errors: ['S’attendre à ce que des équipements « compatibles 61850 » se comprennent sans configuration SCL'],
    why: 'Pas encore nécessaire : pas de relais de protection numériques HTA ni de verrouillages rapides entre IED. À ajouter pour une formation à l’automatisation des postes.' },
  iec104: { n: 'IEC 60870-5-104 (extension)', lv: { conn: 'RJ45 / routeur', net: 'TCP/IP, port 2404', app: 'ASDU avec adresses d’objets d’information (IOA)' },
    ends: ['RTU/passerelle du micro-réseau (poste commandé)', 'SCADA du centre de conduite (poste de commande)'],
    cable: 'WAN/VPN du gestionnaire de réseau.', roles: 'Le centre est le « poste de commande ».',
    params: ['Liste de points (IOA) convenue avec le centre', 'Paramètres k, w, t1–t3', 'Sécurité (IEC 62351)'],
    data: ['P, Q au PCC ; état des disjoncteurs ; ordres de limitation de puissance'],
    extra: 'RTU ou passerelle compatible 104 ; accord avec le gestionnaire de réseau.',
    limits: ['Nécessaire uniquement si le gestionnaire de réseau exige une surveillance/commande à distance.'], errors: ['Liste de points non convenue'],
    why: 'Pas encore nécessaire : le modèle n’est pas conduit par le centre de conduite du gestionnaire de réseau.' }
};

SG.I18D.fr.traces = {
  P_PV: { n: 'Puissance PV (P_PV)', kind: 'Mesure', steps: [
    { t: 'Le générateur PV produit une puissance DC selon l’éclairement.' },
    { t: 'L’onduleur mesure courant/tension AC de sortie avec ses capteurs internes et calcule P (kW). C’est le point de MESURE.' },
    { t: 'La valeur se trouve dans les registres Modbus de l’onduleur (selon sa table des registres ou SunSpec — à vérifier). Elle transite par le câble Ethernet jusqu’au commutateur.' },
    { t: 'L’automate (client Modbus TCP) la lit chaque seconde : code fonction 03, type de données et facteur d’échelle selon la table des registres ; contrôle de temporisation.' },
    { t: 'L’EMS lit la valeur dans l’automate (l’automate est serveur) pour calculer le bilan et décider de la limite PV.' },
    { t: 'L’IHM affiche P_PV avec la qualité de la donnée (bonne / communication perdue).' } ] },
  P_GRID: { n: 'Puissance réseau au PCC (P_GRID)', kind: 'Mesure', steps: [
    { t: 'Le courant de chaque phase traverse un TC 50/5 A.' },
    { t: 'La centrale reçoit le courant secondaire 5 A + la tension mesurée en direct, multiplie par le rapport du TC et calcule P signée (+ soutirage).' },
    { t: 'Modbus TCP : automate client → centrale serveur, port 502. (Si RTU choisi : via le bus RS485 vers le module RS485.)' },
    { t: 'L’automate lit un FLOAT32, vérifie l’ordre des mots, positionne un indicateur de validité.' },
    { t: 'L’EMS l’utilise pour empêcher l’injection et contrôler la limite de soutirage.' },
    { t: 'L’IHM l’affiche et change de couleur en cas de dépassement.' } ] },
  SOC: { n: 'État de charge de la batterie (SOC)', kind: 'Mesure', steps: [
    { t: 'Cellules de la batterie.' },
    { t: 'Le BMS mesure tensions de cellule, courant et température, et ESTIME le SOC (non mesurable directement).' },
    { t: 'Le BMS envoie SOC + limites CCL/DCL par CAN (protocole du fabricant).' },
    { t: 'Le PCS relaie le SOC dans un registre Modbus TCP.' },
    { t: 'L’automate le lit et le compare aux SOC min/max.' },
    { t: 'Affichage du SOC et des limites.' } ] },
  P_RL: { n: 'Puissance de la charge résistive (P_RL)', kind: 'Mesure', steps: [
    { t: 'Le compteur mesure le départ en direct (sans TC).' },
    { t: 'Modbus RTU : le module RS485 de l’automate (maître) interroge l’adresse 11 ; 19200 8E1.' },
    { t: 'Le module transmet la valeur à l’UC via le bus du rack.' },
    { t: 'Affichage. En cas de temporisation dépassée → valeur « estimée » = nombre de gradins × puissance d’un gradin.' } ] },
  CMD_M1: { n: 'Chaîne de commande : l’IHM démarre le moteur M1', kind: 'Commande', steps: [
    { t: 'L’opérateur appuie sur « Marche M1 » (commutateur sur Distance).' },
    { t: 'L’IHM écrit un bit de demande dans l’automate (jamais directement dans le variateur).' },
    { t: 'L’automate vérifie les conditions : SEL_REMOTE = 1, KS_OK = 1, QF_M1_OF = 1, KM_M1_FB = 1, VFD_FLT = 0, jeu de barres sous tension, réserve de puissance suffisante (en îlotage).' },
    { t: 'Conditions remplies → DO VFD_RUN = 1 (24 V PNP) vers la DI1 du variateur ; l’AO fixe la vitesse.' },
    { t: 'Le variateur accélère selon sa rampe ; le moteur tourne.' },
    { t: 'Relais R2 « en marche » → DI VFD_RUN_FB. Modbus TCP fournit vitesse/courant réels.' },
    { t: 'L’IHM affiche « En marche ». Sans retour au bout de 3 s → l’automate annule l’ordre et signale « M1 ne démarre pas ».' } ] },
  CMD_SHED: { n: 'Chaîne de commande : délestage d’un gradin', kind: 'Commande', steps: [
    { t: 'La puissance soutirée dépasse la limite (ou en îlotage : la P batterie dépasse la puissance du PCS).' },
    { t: 'L’automate la lit et la filtre sur 5 s pour ne pas réagir aux fluctuations brèves.' },
    { t: 'L’automate retombe la DO KM_RL3_CMD (gradin le moins prioritaire).' },
    { t: 'Le relais d’interface KA retombe.' },
    { t: 'La bobine 230 V CA n’est plus alimentée → le contacteur s’ouvre → le gradin est coupé.' },
    { t: 'Le retour KM_RL3_FB = 0 confirme ; le compteur PM-RL baisse.' },
    { t: 'Événement « Gradin 3 délesté » dans le journal.' } ] }
};

SG.I18D.fr.compare = [
  { n: 'Relais d’interface, relais de protection, relais de sécurité', cols: ['', 'Relais d’interface (KA)', 'Relais de protection (découplage)', 'Relais de sécurité (KS)'],
    rows: [
      ['Question à laquelle il répond', 'Transmettre un ordre MARCHE/ARRÊT', 'Le réseau est-il normal ? Faut-il séparer ?', 'Un arrêt d’urgence est-il demandé ? Le circuit de sécurité est-il sain ?'],
      ['Entrée', 'Bobine 24 V CC depuis la DO de l’automate', 'Tension (et/ou courant) mesurée en direct', 'Contacts NF double canal de l’arrêt d’urgence, des portes…'],
      ['Sortie', 'Contact commandant une bobine de contacteur 230 V CA', 'Ordre de déclenchement vers KM-PCC/MX', 'Contacts de sécurité coupant KM-M1, STO du variateur'],
      ['Autosurveillance', 'Non', 'Chien de garde interne', 'Oui (redondance, détection des courts-circuits et des contacts soudés)'],
      ['Certification', 'Non', 'Selon les règles de raccordement', 'PL/SIL (ISO 13849-1 / IEC 62061)'],
      ['Dans le modèle', 'KA1… pour KM-PCC, KM-GEN, KM-RL, démarrage à distance', 'RLY-DEC', 'KS pour le moteur M1']
    ] },
  { n: 'Disjoncteur, contacteur, sectionneur, interrupteur-sectionneur', cols: ['', 'Disjoncteur', 'Contacteur', 'Sectionneur', 'Interrupteur-sectionneur'],
    rows: [
      ['Coupe le courant de charge normal', 'Oui', 'Oui (conçu pour cela)', 'NON', 'Oui'],
      ['Déclenche seul sur court-circuit/surcharge', 'Oui', 'Non', 'Non', 'Non'],
      ['Manœuvres fréquentes', 'Non (peu de manœuvres)', 'Oui (10⁵–10⁶ manœuvres)', 'Non', 'Occasionnellement'],
      ['Sectionnement de sécurité', 'Oui si marqué « apte au sectionnement »', 'Non', 'Oui', 'Oui'],
      ['Commande à distance', 'Uniquement avec MX/MN (ouverture) et commande motorisée (fermeture)', 'Oui (bobine)', 'Non', 'Uniquement les modèles motorisés'],
      ['Dans le modèle', 'QF0, QF-…', 'KM-PCC, KM-GEN, KM-M1, KM-RL', 'Côté DC du PV (sectionneur DC)', 'QS0']
    ] },
  { n: 'Automate, RTU, IED, IHM, SCADA, EMS', cols: ['', 'Automate', 'RTU', 'IED', 'IHM', 'SCADA', 'EMS'],
    rows: [
      ['Rôle principal', 'Logique de commande temps réel', 'Collecte et transmission vers un centre distant', 'Protection/commande de travée dans un poste', 'Exploitation locale', 'Supervision globale, historique, alarmes', 'Optimisation énergétique, consignes'],
      ['Emplacement', 'Armoire de commande', 'Site distant', 'Travée de poste', 'Porte d’armoire', 'PC/serveur', 'PC/serveur/cloud'],
      ['Protocoles typiques', 'Modbus, propriétaires', 'IEC 104, DNP3', 'IEC 61850', 'Pilote automate', 'Nombreux', 'Modbus, OCPP, MQTT'],
      ['Si cet équipement est perdu', 'Perte de l’automatisme', 'Le centre perd la supervision', 'Perte de la protection de travée', 'Les boutons câblés restent', 'Perte de l’historique', 'Perte de l’optimisation, l’automate applique les règles de repli'],
      ['Dans le modèle', 'Oui', 'Pas encore nécessaire', 'Pas encore (relais de découplage simple)', 'Oui', 'Oui (PC)', 'Oui (même PC)']
    ] },
  { n: 'BMS, PCS, onduleur PV', cols: ['', 'BMS', 'PCS', 'Onduleur PV'],
    rows: [
      ['Conversion de puissance', 'Non', 'Oui, bidirectionnelle DC↔AC', 'Oui, unidirectionnelle DC→AC'],
      ['Décide', 'Des limites de sécurité de la batterie', 'Exécute la consigne dans les limites', 'Extrait la puissance maximale (MPPT) dans les limites'],
      ['Forme le réseau', '—', 'S’il est formeur de réseau', 'Généralement non (suiveur de réseau)'],
      ['Communication principale', 'CAN vers le PCS', 'Modbus TCP vers l’automate/l’EMS + CAN vers le BMS', 'Modbus TCP/SunSpec vers l’automate/l’EMS']
    ] },
  { n: 'Mesure, protection, commande', cols: ['', 'Mesure', 'Protection', 'Commande'],
    rows: [
      ['Objectif', 'Connaître les valeurs (supervision, énergie)', 'Éliminer les défauts vite, automatiquement, de façon indépendante', 'Amener l’installation dans l’état souhaité'],
      ['Échelle de temps', 'Secondes', 'Millisecondes', 'Centaines de ms – secondes'],
      ['Dépend de l’automate/la communication', 'Généralement', 'NE DOIT PAS en dépendre', 'Oui'],
      ['Exemples', 'PM-PCC, PM-RL', 'QF-RL, relais de découplage, KS', 'Délestage par l’automate, charge batterie par l’EMS']
    ] },
  { n: 'Suiveur de réseau et formeur de réseau', cols: ['', 'Suiveur de réseau', 'Formeur de réseau'],
    rows: [
      ['Comportement', 'Source de courant suivant U/f existants', 'Source de tension : impose U et f'],
      ['À la perte du réseau', 'Arrête l’injection (anti-îlotage)', 'Peut continuer d’alimenter le micro-réseau séparé'],
      ['Équilibre de puissance', 'Assuré par le réseau (ou la source formeuse)', 'Absorbe/fournit automatiquement l’écart dans ses limites'],
      ['Dans le modèle', 'Onduleur PV', 'PCS (si choisi) ou groupe électrogène']
    ] },
  { n: 'Inversion de sources et marche en parallèle', cols: ['', 'Inversion de sources (ouverture avant fermeture)', 'Parallèle (fermeture avant ouverture / continue)'],
    rows: [
      ['Deux sources AC raccordées ensemble au jeu de barres', 'Jamais', 'Oui'],
      ['Synchronisation nécessaire', 'Non (fermeture sur jeu de barres hors tension)', 'Obligatoire (U, f, angle de phase)'],
      ['Coupure des charges', 'Oui, brève', 'Non'],
      ['Dans le modèle', 'Réseau ↔ groupe (autorisé)', 'Groupe–réseau : VERROUILLÉ ; PCS–groupe uniquement avec synchronisation']
    ] },
  { n: 'Perte du réseau et capacité d’alimentation de secours', cols: ['', 'PV raccordé au réseau seul', 'PCS formeur de réseau + organe de séparation', 'Groupe + inversion de sources'],
    rows: [
      ['À la perte du réseau', 'Coupure (même en plein soleil)', 'Îlotage, charges prioritaires alimentées', 'Coupure de quelques secondes → le groupe alimente'],
      ['Durée d’alimentation', '0', 'Selon le SOC', 'Selon le carburant'],
      ['Conditions', '—', 'KM-PCC, relais de découplage, ASI de commande, liaison à la terre en îlotage', 'Verrouillage, ASI de commande']
    ] }
];

SG.I18D.fr.extensions = [
  { n: 'Transformateur de tension (TT)', need: 'Pas encore nécessaire', why: 'À 400 V, centrales et relais mesurent la tension en direct. Un TT est nécessaire pour un raccordement HTA ou si un appareil n’a qu’une entrée 100/110 V.' },
  { n: 'Relais de protection à maximum de courant séparé (50/51)', need: 'Pas encore nécessaire', why: 'Les disjoncteurs BT ont une protection intégrée. Un relais séparé est nécessaire avec des disjoncteurs HTA ou des protections complexes (directionnelle, différentielle).' },
  { n: 'Relais de découplage', need: 'Nécessaire si l’îlotage est activé', why: 'L’organe de séparation au PCC doit être commandé par une protection dédiée. Seuils selon les règles de raccordement.' },
  { n: 'RTU', need: 'Pas encore nécessaire', why: 'Aucun centre de conduite ne doit superviser le modèle. Automate + SCADA suffisent.' },
  { n: 'IEC 61850', need: 'Extension', why: 'Utile pour former à l’automatisation des postes ; nécessite des IED et des outils de configuration SCL.' },
  { n: 'IEC 60870-5-104', need: 'Extension', why: 'Pour échanger avec le SCADA du gestionnaire de réseau.' },
  { n: 'DMS/ADMS', need: 'Hors périmètre', why: 'Logiciel du gestionnaire de réseau pour conduire le réseau de distribution.' },
  { n: 'Synchronisation temporelle précise (PTP)', need: 'Pas encore nécessaire', why: 'Le NTP (ms) suffit pour le journal d’événements. Le PTP est nécessaire pour les PMU, les Sampled Values, l’enregistrement synchronisé des défauts.' },
  { n: 'Synchroniseur / partage de charge du groupe', need: 'Extension', why: 'Uniquement pour une inversion de sources sans coupure ou la marche en parallèle.' },
  { n: 'Pare-feu/routeur industriel', need: 'Nécessaire en cas de raccordement externe', why: 'Quand l’EMS envoie des données vers le cloud ou pour l’accès à distance : séparer le réseau de commande (IEC 62443).' }
];

SG.I18D.fr.refs = [
  { g: 'Installations BT & tableaux', items: [['IEC 60364 (parties 4-41, 4-43, 5-52, 5-53…)', 'Installations électriques BT : protection contre les chocs, surintensités, choix des câbles, appareillage'], ['NF C 15-100 (France)', 'Norme française d’installation BT — vérifier l’édition en vigueur'], ['IEC 61439-1/-2', 'Ensembles d’appareillage BT'], ['IEC 60529', 'Degrés de protection IP']] },
  { g: 'Appareillage & protection', items: [['IEC 60947-2', 'Disjoncteurs industriels'], ['IEC 60898-1', 'Disjoncteurs domestiques'], ['IEC 60947-3', 'Interrupteurs, interrupteurs-sectionneurs'], ['IEC 60947-4-1', 'Contacteurs et démarreurs de moteurs'], ['IEC 60947-6-1', 'Matériels de connexion de transfert (ATSE)'], ['IEC 61643-11 / IEC 61643-31', 'Parafoudres AC / DC-PV'], ['IEC 60269-6', 'Fusibles gPV']] },
  { g: 'Mesure', items: [['IEC 61869-2', 'Transformateurs de courant'], ['IEC 61557-12', 'Dispositifs de mesure et de surveillance des performances (PMD)'], ['IEC 62053-21/-22', 'Compteurs d’énergie électrique']] },
  { g: 'PV, stockage, raccordement au réseau', items: [['IEC 60364-7-712', 'Installations PV'], ['UTE C 15-712-1 / -3 (France)', 'Guides d’installation PV / stockage par batterie — vérifier l’édition'], ['IEC 62109-1/-2', 'Sécurité des convertisseurs PV'], ['IEC 62116', 'Essai anti-îlotage des onduleurs'], ['EN 50549-1', 'Exigences pour les installations de production raccordées en BT (Europe)'], ['VDE-AR-N 4105', 'Règles de raccordement BT (Allemagne) — exemple'], ['IEC 62619 / IEC 62933', 'Sécurité des batteries lithium industrielles / systèmes de stockage d’énergie'], ['Règles du gestionnaire de réseau local (par ex. Enedis en France)', 'Seuils de la protection de découplage, conditions d’injection, procédures']] },
  { g: 'Machines, groupes, VE', items: [['IEC 60034-1 / 60034-30-1', 'Moteurs / classes de rendement IE'], ['IEC 61800-5-2', 'Fonctions de sécurité des variateurs (STO)'], ['ISO 8528', 'Groupes électrogènes'], ['IEC 61851-1 / IEC 62196', 'Recharge VE mode 3 / connecteurs']] },
  { g: 'Commande & sécurité machine', items: [['IEC 61131-2 / -3', 'Automates : matériel / langages de programmation'], ['IEC 60204-1', 'Équipement électrique des machines'], ['ISO 13849-1 / IEC 62061', 'Sécurité fonctionnelle (PL / SIL)'], ['ISO 13850 / IEC 60947-5-5', 'Arrêt d’urgence'], ['IEC 62443', 'Cybersécurité des systèmes de commande']] },
  { g: 'Communication', items: [['Modbus Application Protocol & Modbus over Serial Line', 'Spécifications officielles Modbus'], ['SunSpec Information Models', 'Tables de registres normalisées pour onduleurs/batteries'], ['MQTT (OASIS)', 'Spécification MQTT'], ['OCPP', 'Open Charge Alliance'], ['LoRaWAN', 'LoRa Alliance'], ['CAN / CANopen', 'CAN in Automation'], ['IEC 61850 / IEC 60870-5-104', 'Automatisation des postes / téléconduite'], ['IEEE 1588', 'Synchronisation temporelle précise PTP']] },
  { g: 'Fabricants (exemples pour consulter les fiches techniques)', items: [['Schneider Electric', 'Acti9, TeSys, Compact NSX, PowerLogic, Altivar, Modicon, Harmony — consulter la fiche technique de chaque référence'], ['Autres fabricants', 'ABB, Siemens, Phoenix Contact, Wago, SMA, Fronius, Victron… — le système n’est pas limité à une marque']] }
];

SG.I18D.fr.scenarios = {
  'pv-surplus': { n: 'Le PV alimente les charges, l’excédent charge la batterie', steps: [
    { t: 'Midi, fort éclairement. Charges : départ prioritaire + 1 gradin résistif. Batterie à 55 %, pas encore de consigne (0 kW).' },
    { t: 'La centrale PCC mesure une P_GRID négative : l’excédent PV part vers le réseau. L’onduleur mesure P_PV. Le PCS indique un SOC de 55 %.' },
    { t: 'L’automate (client Modbus TCP) lit la centrale PCC, l’onduleur et le PCS via le commutateur chaque seconde. L’EMS lit ces valeurs dans l’automate.' },
    { t: 'L’EMS calcule : excédent = P_PV − P_charges > 0 et SOC < SOC max → consigne de charge = −min(excédent, P_PCS, limite de charge CCL du BMS).' },
    { t: 'L’automate vérifie que la consigne est dans ±P_PCS puis écrit PCS_PSET en Modbus TCP. Le PCS commence à charger en respectant la CCL envoyée par le BMS via CAN.' },
    { t: 'Le PCS indique une P_BAT négative (charge) ; la centrale PCC indique P_GRID ≈ 0. Deux mesures indépendantes confirment l’effet de l’ordre.' },
    { t: 'IHM : flèches PV → charges et PV → batterie ; SOC en hausse ; état « Charge ».' } ],
    pseudo: `TOUTES LES 1 s :
  excedent = P_PV - P_CHARGES
  SI excedent > 0 ET SOC < SOC_MAX :
      P_BAT_SET = -MIN(excedent, P_PCS, CCL_BMS)
  SINON SI excedent < 0 ET SOC > SOC_MIN :
      P_BAT_SET = MIN(-excedent, P_PCS, DCL_BMS)
  SINON : P_BAT_SET = 0
  ÉCRIRE PCS_PSET (seulement si l’écart > 0,2 kW — éviter les écritures continues)` },
  'pv-drop': { n: 'Baisse du PV, compensée par la batterie ou le réseau', steps: [
    { t: 'Passage nuageux : l’éclairement chute de 85 % à 25 % en quelques secondes.' },
    { t: 'L’onduleur produit aussitôt moins (physique). Le réseau compense instantanément l’écart car il est la source de référence — P_GRID augmente.' },
    { t: 'Au cycle de lecture suivant, l’automate/l’EMS voient P_PV baisser et P_GRID positive (soutirage).' },
    { t: 'EMS : déficit = P_charges − P_PV > 0, SOC 60 % > SOC min → décharge de la batterie jusqu’à P_PCS ; le reste vient du réseau.' },
    { t: 'L’automate écrit la consigne de décharge dans le PCS.' },
    { t: 'Le PCS indique une P_BAT positive ; P_GRID redescend au déficit restant (si charges > PV + P_PCS).' },
    { t: 'IHM : batterie « Décharge », le réseau fournit le reste. Aucune alarme — c’est le fonctionnement normal.' } ],
    note: 'En fonctionnement couplé, l’équilibre instantané est toujours assuré par le RÉSEAU ; l’EMS ne fait que changer qui fournit au bout de quelques secondes. En îlotage, le PCS formeur de réseau doit compenser lui-même instantanément.',
    pseudo: `SI P_PV baisse :
  (physique) le réseau compense immédiatement
  EMS au cycle suivant : deficit = P_CHARGES - P_PV
  SI SOC > SOC_MIN : P_BAT_SET = MIN(deficit, P_PCS, DCL)
  P_GRID = deficit - P_BAT  (naturellement)` },
  'soc-limit': { n: 'La batterie atteint sa limite de SOC', steps: [
    { t: 'Excédent PV, la batterie charge et le SOC approche du SOC max.' },
    { t: 'Le BMS/PCS indiquent SOC = SOC max (le BMS peut aussi réduire la CCL quand la batterie est presque pleine).' },
    { t: 'L’automate lit le SOC dans le PCS (Modbus TCP).' },
    { t: 'L’EMS arrête la charge. L’excédent part vers le réseau. Si la limite d’injection est dépassée (ou si l’injection est interdite) → l’EMS doit LIMITER le PV.' },
    { t: 'L’automate écrit PV_PLIM_SET (limite en %) dans l’onduleur. Ce n’est possible que si la table des registres autorise l’écriture — actuellement « informations insuffisantes ».' },
    { t: 'P_GRID revient à ≥ −limite d’injection. L’onduleur indique l’état « puissance limitée ».' },
    { t: 'IHM : « Batterie pleine — PV limité ». Le soir : quand SOC = SOC min, l’EMS arrête la décharge ; les charges sont entièrement alimentées par le réseau.' } ],
    pseudo: `SI SOC >= SOC_MAX : P_BAT_SET = MIN(P_BAT_SET, 0)   // charge interdite
SI SOC <= SOC_MIN : P_BAT_SET = MAX(P_BAT_SET, 0)   // décharge interdite
injection = -P_GRID
SI injection > LIMITE_INJECTION : PV_PLIM = P_PV - (injection - LIMITE_INJECTION)` },
  'shed': { n: 'Hausse des charges — délestage des charges non prioritaires', steps: [
    { t: 'Le soir, batterie au SOC min (pas de décharge possible). Charges : prioritaires + moteur + 3 gradins résistifs + recharge VE.' },
    { t: 'Centrale PCC : la puissance soutirée dépasse la LIMITE DE SOUTIRAGE fixée par l’EMS.' },
    { t: 'L’automate lit P_GRID, filtrée sur 5 s.' },
    { t: 'Ordre de délestage : (1) réduire le VE au courant minimal via OCPP, (2) couper les gradins résistifs à partir du gradin 3. Les charges prioritaires et le moteur ne sont pas coupés.' },
    { t: 'L’EMS envoie une limite de 6 A à la borne (OCPP). L’automate retire l’ordre KM_RL3 → KA retombe → le contacteur s’ouvre.' },
    { t: 'KM_RL3_FB = 0 ; PM-RL baisse ; P_GRID est revérifiée. Toujours en dépassement → gradin suivant.' },
    { t: 'IHM : « Gradins 3 et 2 délestés ; VE limité à 6 A ». Relestage quand la marge ≥ puissance d’un gradin + 0,5 kW pendant 60 s.' } ],
    pseudo: `SI P_GRID > LIMITE_SOUTIRAGE PENDANT 5 s :
  SI VE_A > 6 : VE_A = 6         (OCPP)
  SINON SI gradins_RL_actifs : couper le gradin RL le plus haut
  SINON : arrêter le VE
SI P_GRID < LIMITE_SOUTIRAGE - (P_GRADIN + 0,5) PENDANT 60 s :
  relester dans l’ordre inverse` },
  'motor': { n: 'Démarrage / arrêt du moteur', steps: [
    { t: 'L’opérateur appuie sur « Marche M1 » sur l’IHM. Commutateur L/D sur Distance.' },
    { t: 'L’automate reçoit le bit de demande de l’IHM.' },
    { t: 'L’automate lit les conditions : SEL_REMOTE, KS_OK, QF_M1_OF, KM_M1_FB, VFD_FLT.' },
    { t: 'Toutes remplies → autorisé. (En îlotage : vérifier aussi la réserve de puissance du PCS ≥ P du moteur.)' },
    { t: 'DO VFD_RUN = 1 → DI1 du variateur ; AO 0–10 V fixe la vitesse à 100 %. Le variateur accélère sur une rampe de 5 s (courant ≈ In, pas 6–8 In).' },
    { t: 'Relais R2 « en marche » → VFD_RUN_FB = 1 en moins de 3 s → confirmé. Sinon (par ex. entrées du variateur configurées en NPN) → l’automate annule l’ordre et signale « M1 ne démarre pas ».' },
    { t: 'IHM : « M1 en marche — 100 % — x A ». Arrêt : IHM « Arrêt » → DO = 0 → le variateur décélère → VFD_RUN_FB = 0. Arrêt d’urgence : KS coupe STO + KM-M1, sans passer par l’automate.' } ],
    pseudo: `SUR IHM_MARCHE_M1 :
  SI SEL_REMOTE ET KS_OK ET QF_M1_OF ET KM_M1_FB ET NON VFD_FLT
     ET (MODE <> ILOTAGE OU RESERVE_PCS >= P_M1) :
       VFD_RUN := 1 ; T_FB := 0
  SINON : signaler "Conditions non remplies : <condition manquante>"
SI VFD_RUN ET NON VFD_RUN_FB ET T_FB > 3 s :
  VFD_RUN := 0 ; ALARME "M1 ne démarre pas"` },
  'commloss': { n: 'Perte de communication avec une centrale ou l’onduleur', steps: [
    { t: 'Batterie pleine, PV limité pour respecter la limite d’injection. Le câble Ethernet de l’onduleur est débranché.' },
    { t: 'L’automate ne reçoit pas de réponse dans le délai (par ex. 3 × 1 s) → indicateur COMM_INV_LOST.' },
    { t: 'Plus aucun signal ne peut atteindre l’onduleur — l’automate ne peut pas écrire de nouvelle limite.' },
    { t: 'La décision a été conçue à l’avance : (a) l’onduleur possède un réglage « repli en cas de perte de communication » (par ex. 0 % ou une limite sûre) — vérifier que l’onduleur le permet ; (b) sinon l’automate pourrait ouvrir QF-PV/un contacteur — dans cette architecture QF-PV n’a pas de mécanisme de commande → impossible.' },
    { t: 'Perte de la centrale PCC à la place : l’EMS perd P_GRID → maintient la batterie à 0 kW (pas de pilotage « à l’aveugle »).' },
    { t: 'Retour : la valeur sur l’IHM passe à l’état « invalide » (l’ancienne valeur n’est pas conservée comme si elle était encore juste).' },
    { t: 'IHM : alarme « Communication PM-PCC perdue » horodatée ; inscrite au journal. Au rétablissement, l’EMS reprend après 10 s de stabilité.' } ],
    pseudo: `POUR CHAQUE équipement :
  SI pas de réponse 3 fois de suite : COMM_LOST[i] := 1 ; valeur := INVALIDE
SI COMM_LOST[PM_PCC] : P_BAT_SET := 0
SI COMM_LOST[INV] ET limitation PV nécessaire : (repli de l’onduleur) + ALARME` },
  'gridloss': { n: 'Perte du réseau', steps: [
    { t: 'Le réseau est perdu (défaut côté gestionnaire de réseau).' },
    { t: 'Le relais de découplage voit U/f hors seuils en quelques centaines de ms (selon les réglages réglementaires).' },
    { t: 'L’onduleur PV et le PCS (suiveurs de réseau) détectent la perte du réseau par leur fonction anti-îlotage et cessent d’injecter. Le jeu de barres est hors tension.' },
    { t: 'Le relais ouvre DIRECTEMENT (câblé) KM-PCC et signale DEC_TRIP à l’automate. L’automate reste alimenté grâce à l’ASI.' },
    null,
    { t: 'Le PCS (formeur de réseau) passe à la formation de U/f. Automate : mode ÎLOTAGE → limite les charges à P_PCS : coupe le VE et les gradins résistifs ; vérifie P_M1 + P_prioritaires ≤ P_PCS.' },
    null,
    { t: 'L’onduleur PV voit un réseau stable (formé par le PCS) → se reconnecte après sa temporisation ; le PCS équilibre : P_PCS = P_charges − P_PV. Excédent PV → le PCS augmente légèrement la fréquence pour que l’onduleur se bride lui-même (P(f)) — vérifier que le couple d’équipements le permet.' },
    { t: 'Aucune action de puissance : attente du retour du réseau.' },
    { t: 'KM_PCC_FB = 0 confirme la séparation ; le PCS indique le mode « formeur de réseau » ; U, f mesurés par le PCS.' },
    { t: 'Aucun retour — les charges ne sont pas alimentées.' },
    { t: 'IHM : voyant « ÎLOTAGE », message « Perte du réseau — îlotage », SOC en baisse, autonomie restante estimée.' },
    null ],
    pseudo: `[Protection, hors automate] RLY_DEC : SI U/f hors seuils > t : ouvrir KM_PCC
[Automate] SUR DEC_TRIP :
  MODE := ILOTAGE
  VE := ARRÊT ; couper tous les gradins RL
  SI P_PRIORITAIRES + P_M1 > P_PCS : arrêter M1
  Le PCS passe de lui-même en formeur de réseau (selon sa configuration)` },
  'genstart': { n: 'Démarrage du groupe et inversion de sources', steps: [
    { t: 'En îlotage, la nuit, le SOC descend jusqu’à SOC min + 5 %.' },
    { t: 'Réseau perdu, jeu de barres hors tension (pas de fonction d’îlotage). L’automate reste alimenté grâce à l’ASI.' },
    { t: 'L’automate détecte la condition (SOC bas ou perte du réseau > 5 s).' },
    { t: 'DO GEN_START → KA3 → contact sec vers le contrôleur de groupe.' },
    null, null,
    { t: 'KM_GEN_FB = 1 ; GEN_DATA (RS485) fournit P, U, f. L’automate limite le PV pour que le groupe reste au-dessus de sa charge minimale et ne subisse jamais de retour de puissance.' },
    { t: 'IHM : « Groupe en marche », heures de fonctionnement, niveau de carburant (si disponible).' } ],
    note: 'La marche en parallèle groupe–réseau est VERROUILLÉE dans cette architecture : elle exige un synchroniseur, une protection de retour de puissance (32), une protection de découplage dédiée au groupe et un accord avec le gestionnaire de réseau.',
    pseudo: `SI (MODE = ILOTAGE ET SOC <= SOC_MIN + 5) OU (PERTE_RESEAU > 5 s ET pas_ilotage) :
  GEN_START := 1
SUR GEN_READY ET NON KM_PCC_FB :
  SI synchro_dispo : attendre SYNC_OK ; KM_GEN := 1
  SINON : PCS_STOP ; attendre jeu_de_barres_hors_tension ; KM_GEN := 1 ; PCS_START(GFL)
VERROUILLAGE : KM_GEN et KM_PCC jamais = 1 simultanément (mécanique + électrique + automate)` },
  'gridback': { n: 'Retour du réseau', steps: [
    { t: 'La tension réseau revient côté réseau de KM-PCC.' },
    null,
    { t: 'DEC_TRIP revient à la normale → automate.' },
    null, null,
    { t: 'KM_PCC_FB = 1 ; la centrale PCC mesure P_GRID. L’onduleur PV se reconnecte après sa propre temporisation.' },
    { t: 'IHM : voyant « Réseau » ; les charges non prioritaires sont relestées une à une.' } ],
    pseudo: `SI RESEAU_OK en continu >= T_ATTENTE :
  SI MODE = GROUPE : KM_GEN := 0 ; attendre KM_GEN_FB = 0
  SI MODE = ILOTAGE ET NON PCS_RESYNC : PCS_STOP
  KM_PCC := 1  (uniquement si KM_GEN_FB = 0)
  relester les charges dans l’ordre` },
  'fault': { n: 'Défaut sur un départ et isolement', steps: [
    { t: 'Court-circuit sur le câble vers le banc de charge résistif.' },
    { t: 'Le déclencheur magnétique de QF-RL détecte le courant de défaut (plusieurs fois In).' },
    { t: 'SANS passer par l’automate : la protection est intégrée au disjoncteur et agit en quelques ms.' },
    { t: 'Sélectivité : seul QF-RL déclenche, QF0 reste fermé (vérifier les tableaux de sélectivité du fabricant). En ÎLOTAGE : le courant de court-circuit est limité par le PCS (souvent 1–2 × In seulement) → le déclencheur magnétique peut NE PAS agir — la protection en îlotage doit être vérifiée séparément.' },
    { t: 'QF-RL s’ouvre → le départ est isolé. Le reste continue de fonctionner.' },
    { t: 'Contact SD → QF_RL_SD = 1 → automate. L’automate verrouille les ordres KM-RL (pas de refermeture automatique).' },
    { t: 'IHM : alarme « QF-RL déclenché ». L’opérateur contrôle, répare, referme QF-RL SUR PLACE, puis acquitte l’alarme.' } ],
    pseudo: `[Protection] QF-RL déclenche de lui-même si I > seuil magnétique (sans logiciel)
[Automate] SUR QF_RL_SD :
  KM_RL_CMD[*] := 0 ; VERROU_RL := 1 ; ALARME
  VERROU_RL n’est levé que si QF_RL_SD = 0 ET PB_RESET` },
  'parallel': { n: 'Marche en parallèle groupe–réseau' }
};

/* Catalogue produits : seul le texte vietnamien est traduit ; les citations des documents constructeurs restent telles que publiées */
SG.I18D.fr.products = {
  'sma-stp5-3av-40': { role: 'Onduleur PV triphasé raccordé au réseau, suiveur de réseau',
    specs: { comm: { v: ['Modbus TCP (SMA Modbus / SunSpec Modbus, port 502)'], ref: 'Equipment + Configuring the Modbus Function (Modbus désactivé par défaut, port 502)' } },
    iface: 'DC : connecteurs SUNCLIX ; AC : connecteur AC ; Ethernet RJ45 (Speedwire), RS485, WLAN',
    notes: ['La table des registres « Modbus® parameters and measured values » est citée dans la notice (www.SMA-Solar.com) mais aucun lien précis n’est encore disponible → droit d’écriture de la limite P : données manquantes.', 'La notice recommande un pare-feu/VPN lorsque Modbus est activé.'],
    software: [{ n: 'Interface de configuration de l’onduleur (web / application SMA)', role: 'Activer Modbus, régler l’IP, jeu de données pays', lic: 'À vérifier' }] },
  'se-atv320u22n4b': { role: 'Variateur 2,2 kW, triphasé 380–500 V',
    notes: ['La capacité de surcharge en % du courant n’est pas indiquée dans la fiche technique (seulement un surcouple de 170–200 %) → vérifier dans le catalogue/la notice.', 'Ethernet uniquement via une carte optionnelle → l’automate le lit en Modbus RTU ou une carte est ajoutée.'],
    software: [{ n: 'SoMove (configuration du variateur)', role: 'Réglage des paramètres, chargement/sauvegarde de la configuration', lic: 'À vérifier' }] },
  'se-pm5560': { role: 'Centrale de mesure, Ethernet + RS485',
    notes: ['Nécessite 3 TC à sortie 1 A ou 5 A (aucun TC vérifié dans le catalogue pour l’instant).', 'Table des registres : document Schneider séparé — pas encore de lien.'],
    software: [{ n: 'Configuration par l’afficheur / la page web intégrée', role: 'Rapport TC, type de réseau, IP', lic: 'À vérifier' }] },
  'se-iem3155': { role: 'Compteur d’énergie 63 A direct, Modbus RTU', notes: ['RS485 uniquement : lecture directe en Modbus TCP impossible.'] },
  'se-tm221ce24t': { role: 'Automate 24 E/S, Ethernet + série',
    notes: ['Analogique 4–20 mA, Pt100 et AO nécessitent des modules d’extension (aucun module vérifié dans le catalogue pour l’instant).', 'Le port RS485 intégré n’est pas isolé — envisager un isolateur pour les bus longs.'],
    software: [{ n: 'EcoStruxure Machine Expert – Basic', role: 'Programmation de l’automate M221', lic: 'À vérifier' }] },
  'se-hmist6400': { role: 'Écran tactile 7", 2 × Ethernet, 24 V CC',
    software: [{ n: 'Logiciel de conception d’écrans Harmony ST6', role: 'Conception des écrans IHM', lic: 'À vérifier' }] },
  'se-abls1a24100': { role: 'Alimentation 24 V CC 10 A',
    notes: ['Pas de contact DC-OK dans la fiche technique → PSU_OK ne peut pas être remonté sur une DI (module de surveillance séparé ou autre alimentation nécessaire).'] },
  'se-tcsesu083fn0': { role: 'Commutateur non administrable 8 ports',
    discontinued: 'Arrêt de commercialisation — production arrêtée le 15 oct. 2021, fin de service le 31 août 2026 (fiche technique p. 1)' }
};
