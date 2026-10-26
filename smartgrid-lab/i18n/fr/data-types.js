/* FR — surcouche des types d’équipement (params/confusions/accessories/compat alignés par indice sur data/types.js) */
SG.I18D.fr.types = {};
Object.assign(SG.I18D.fr.types, {
grid: {
  name: 'Réseau public de distribution', group: 'Sources',
  func: 'Référence de tension et de fréquence en fonctionnement couplé ; absorbe ou fournit l’écart entre la production interne et les charges.',
  principle: 'Le réseau a une puissance de court-circuit très élevée par rapport au modèle, il maintient donc U et f presque constants. Les onduleurs suiveurs de réseau s’appuient sur cette référence.',
  notdo: 'Ne garantit pas la continuité : à la perte du réseau, toute source suiveuse de réseau doit s’arrêter.',
  confusions: [['PCC', 'Le réseau est la source extérieure ; le {{pcc|PCC}} est le point frontière où l’on mesure et sépare.']],
  ports: { power: 'Bornes du câble d’alimentation 3P+N (+PE selon le {{slt|schéma de liaison à la terre}}).' },
  accessories: ['Convention de raccordement et prescriptions techniques du gestionnaire de réseau en cas de production raccordée.'],
  compat: ['Tension/nombre de phases/fréquence nominales.', 'Courant de court-circuit au PCC ({{icu|Icc}}) — fourni par le gestionnaire de réseau.', 'Puissance de raccordement/souscrite.', 'Injection autorisée ou non, et jusqu’à quelle limite.'],
  params: [
    { n: 'Tension nominale', m: 'Tension composée (phase–phase) et simple (phase–neutre).', i: 'Fixe le calibre de tous les équipements raccordés au jeu de barres.', h: 'Selon le réseau local.', e: '400 V phase–phase / 230 V phase–N, 3P+N.', c: 'Tolérance admise du réseau (par ex. ±10 %).' },
    { n: 'Fréquence', m: 'Fréquence nominale.', i: 'Les équipements doivent être prévus pour exactement 50 ou 60 Hz.', h: 'Selon le réseau.', e: '50 Hz.', c: 'Plage de fréquence acceptée par l’onduleur/le relais de découplage.' },
    { n: 'Puissance de raccordement', m: 'Puissance maximale autorisée en soutirage.', i: 'Limite de soutirage → délestage nécessaire en cas de dépassement.', h: 'Contrat/compteur.', e: '36 kVA (hypothèse).', c: 'Limite d’injection, le cas échéant.' },
    { n: 'Courant de court-circuit au PCC', m: 'Plus fort courant de défaut possible au point de raccordement.', i: 'Fixe le pouvoir de coupure (Icu/Ics) du disjoncteur général et des disjoncteurs en aval.', h: 'Demander au gestionnaire de réseau ou calculer à partir du transformateur et des câbles.', e: 'Pas encore de donnée — laissé vide volontairement.', c: 'Ne doit pas être supposé ; sans cette valeur, impossible de conclure sur l’adéquation des disjoncteurs.' }
  ],
  example: {
    ok: { t: 'Contrat 36 kVA triphasé', d: 'Suffisant pour la charge totale maximale ≈ 17 kW VE compris, avec marge pendant la charge de la batterie à 5 kW.' },
    ko: { t: 'Raccordement monophasé 9 kVA', d: 'Ne peut pas alimenter le moteur, le groupe et le PCS triphasés de l’architecture de référence ; toute la conception devrait passer en monophasé.' }
  }
},
isect: {
  name: 'Interrupteur-sectionneur', group: 'Appareillage & protection',
  func: 'Isole toute l’installation du réseau pour intervenir en sécurité (condamnation par cadenas – consignation) et peut couper le courant de charge normal.',
  principle: 'Contacts mécaniques avec une distance d’isolement suffisante et une indication de position fiable (« coupure pleinement apparente »). Manœuvre manuelle, généralement par poignée rotative cadenassable.',
  notdo: 'Ne détecte pas et ne coupe pas de lui-même les surcharges ou courts-circuits. Pas de commande à distance (sauf versions motorisées).',
  confusions: [['Disjoncteur', 'Le disjoncteur déclenche de lui-même sur défaut ; l’interrupteur-sectionneur non.'], ['Sectionneur', 'Un sectionneur simple ne doit pas être manœuvré en charge ; l’interrupteur-sectionneur oui (selon la catégorie AC-22/AC-23).']],
  ports: { power: 'Entrée/sortie de puissance 4 pôles (3P+N).', ctrl: 'En option : contact auxiliaire de position.' },
  accessories: ['Poignée rotative cadenassable (consignation).', 'Contact auxiliaire si l’automate doit connaître la position.', 'Cache-bornes.'],
  compat: ['Courant assigné ≥ courant maximal.', 'Nombre de pôles (coupure du neutre selon le {{slt|schéma de liaison à la terre}}).', 'Tenue au courant de courte durée (Icw) ou protection par l’appareil amont.'],
  params: [
    { n: 'Courant assigné d’emploi', m: 'Courant de charge que l’appareil peut commuter en permanence.', i: 'Doit être ≥ Ib de toute l’installation.', h: 'Ib déduit de la puissance de raccordement.', e: '63 A (préliminaire pour 36 kVA ≈ 52 A).', c: 'Catégorie d’emploi AC-22A/AC-23A.' },
    { n: 'Nombre de pôles', m: 'Nombre de conducteurs coupés.', i: '4P si le neutre est coupé.', h: 'Selon le schéma de liaison à la terre et la réglementation.', e: '4P.', c: 'Exigences de coupure du neutre de la réglementation applicable.' },
    { n: 'Courant de courte durée admissible', m: 'Courant de court-circuit supporté brièvement sans dommage.', i: 'Coordination avec la protection amont.', h: 'D’après l’Icc au PCC et les tableaux de coordination.', e: 'Vérifier la fiche technique.', c: 'Tableau de coordination avec le fusible/disjoncteur amont.' }
  ],
  example: {
    ok: { t: 'Interrupteur-sectionneur 4P 63 A, poignée rotative cadenassable', d: 'Isole tout le tableau pour la maintenance ; Ib ≈ 52 A < 63 A.' },
    ko: { t: 'Sectionneur-fusible sans pouvoir de coupure en charge', d: 'Si un opérateur l’ouvre en charge, un arc se forme — acceptable uniquement avec une procédure de coupure préalable et un verrouillage.' }
  },
  brands: 'Exemples de gammes à consulter : Schneider Acti9 iSW / Compact INS, ABB OT, Socomec Sirco… — vérifier la fiche technique.'
},
breaker: {
  name: 'Disjoncteur basse tension', group: 'Appareillage & protection',
  func: 'Protège les câbles et équipements en aval contre les surcharges et courts-circuits en déclenchant DE LUI-MÊME ; permet la manœuvre manuelle.',
  principle: 'Le déclencheur thermique (ou électronique long retard) réagit aux surcharges avec un temps dépendant du courant ; le déclencheur magnétique (instantané) réagit immédiatement au court-circuit. La chambre de coupure éteint l’arc.',
  notdo: 'Pas fait pour des manœuvres fréquentes (endurance mécanique inférieure à un contacteur). Ne se referme pas tout seul. Avoir un port de communication ≠ être pilotable : la fermeture à distance exige une commande motorisée.',
  confusions: [['Contacteur', 'Le contacteur manœuvre des centaines de milliers de fois sur ordre mais ne se protège pas.'], ['Relais de protection', 'Le relais ne fait que mesurer et ordonner ; le disjoncteur est l’organe qui coupe le courant.'], ['DDR', 'La protection différentielle est une autre fonction ; elle peut être intégrée (disjoncteur différentiel) ou ajoutée par un bloc Vigi.']],
  ports: { power: 'Entrée (amont) et sortie (aval) selon le nombre de pôles.', ctrl: 'Selon les auxiliaires : OF (état), SD (signal défaut), MX/MN (déclenchement à distance), commande motorisée (fermeture/ouverture à distance).', comm: 'Certaines gammes électroniques ont un module de communication — lecture seule des données/états, il ne permet pas à lui seul la fermeture à distance.' },
  accessories: ['{{of_sd|Contact OF}} pour que l’automate connaisse l’état ouvert/fermé.', '{{of_sd|Contact SD}} pour distinguer « ouvert manuellement » de « déclenché ».', '{{mx_mn|Bobine MX}} si un déclenchement à distance est nécessaire (relais de découplage, arrêt d’urgence).', '{{motor_op|Commande motorisée}} si la FERMETURE à distance est nécessaire.', 'Bloc {{ddr|DDR}} ou disjoncteur différentiel si une protection différentielle est requise.'],
  compat: ['In ≥ Ib et coordonné avec l’Iz du câble ({{in_ib_iz|Ib ≤ In ≤ Iz}}).', 'Pouvoir de coupure Icu/Ics ≥ Icc au point d’installation.', 'Courbe adaptée au courant d’appel de la charge.', 'Calibre DC si installé sur un circuit DC (polarité, tension DC).', 'Sélectivité avec le disjoncteur amont.', 'Auxiliaires compatibles avec la gamme (montage gauche/droite, nombre maximal).'],
  params: [
    { n: 'Courant assigné', m: 'Courant que le disjoncteur supporte en permanence sans déclencher.', i: 'Choisir In ≥ Ib, et In ≤ Iz du câble.', h: 'Ib = P / (√3·U·cos φ) en triphasé ; prendre le calibre normalisé suivant ; puis vérifier le câble.', e: 'Départ PV 5 kW : Ib ≈ 7,2 A → 10 ou 16 A selon la recommandation de l’onduleur.', c: 'Protection AC maximale recommandée dans la notice de l’onduleur ; déclassement selon la température d’armoire.' },
    { n: 'Courbe de déclenchement', m: 'Seuil magnétique par rapport à In.', i: 'Moteurs en démarrage direct et transformateurs : C/D ; charges électroniques : généralement C.', h: 'D’après le courant de démarrage/d’appel de la charge.', e: 'Départ résistif : C.', c: 'Courant d’appel des alimentations, onduleurs, variateurs.' },
    { n: 'Pouvoir de coupure', m: 'Courant de court-circuit maximal pouvant être coupé.', i: 'Doit être ≥ Icc au point d’installation, ou utiliser la filiation selon les tableaux du fabricant.', h: 'D’après l’Icc au PCC (gestionnaire de réseau) et l’impédance des câbles.', e: 'Pas encore d’Icc → « informations insuffisantes ».', c: 'Norme de référence : IEC 60898-1 (Icn) ou IEC 60947-2 (Icu/Ics).' },
    { n: 'Nombre de pôles', m: 'Nombre de conducteurs protégés/coupés.', i: '1P+N, 3P, 4P selon la charge et le schéma de liaison à la terre.', h: 'Selon le nombre de phases de la charge et l’exigence de coupure du neutre.', e: 'VE monophasé : 1P+N ; PCS triphasé : 4P.', c: 'En DC : pôles en série pour atteindre la tension DC assignée.' },
    { n: 'Coupure AC/DC', m: 'Un disjoncteur AC n’est pas garanti pour couper du DC.', i: 'Les circuits DC batterie/PV exigent des appareils prévus pour le DC.', h: 'Selon l’emplacement.', e: 'Côté AC de l’onduleur : disjoncteur AC.', c: 'Marquage du calibre DC et polarité dans la fiche technique.' },
    { n: 'Auxiliaires fonctionnels', m: 'Contacts, déclencheurs, commandes motorisées à ajouter.', i: 'Détermine ce que l’automate peut lire/commander.', h: 'D’après la liste E/S et les fonctions souhaitées.', e: 'OF + SD sur chaque départ ; MX sur le disjoncteur général.', c: 'Tension de la bobine MX (24 V CC ? 230 V CA ?) compatible avec l’alimentation de commande.' }
  ],
  example: {
    ok: { t: 'Départ de charge résistive 6 kW triphasé', d: 'Ib = 6000 / (√3 × 400 × 1) ≈ 8,7 A → In 10 A courbe C, 4P, plus OF+SD. Il reste à vérifier le câble (Iz), l’Icc et la sélectivité — ce site ne conclut pas.' },
    ko: { t: 'Disjoncteur « avec Modbus » pour que l’automate le referme après un défaut', d: 'Le port de communication ne fait que lire l’état/les mesures. Sans commande motorisée, l’automate ne peut pas fermer le disjoncteur. De plus, refermer automatiquement après un déclenchement sur court-circuit est dangereux — une personne doit d’abord vérifier.' }
  },
  brands: 'Exemples de gammes à consulter : Schneider Acti9 (disjoncteurs modulaires, auxiliaires iOF/iSD/iMX), Compact NSX (boîtier moulé) ; ABB, Siemens, Hager, Legrand… — vérifier la fiche technique et le catalogue d’auxiliaires.'
},
contactor: {
  name: 'Contacteur', group: 'Appareillage & protection',
  func: 'Commute un circuit de puissance sur ordre électrique (bobine), permettant à l’automate de piloter sources ou charges.',
  principle: 'La bobine crée une force magnétique qui ferme les contacts principaux ; bobine hors tension → un ressort les ouvre. Les contacts auxiliaires suivent les contacts principaux pour le retour d’état.',
  notdo: 'Ne protège pas contre les surcharges/courts-circuits ; nécessite un disjoncteur ou un fusible en amont. N’assure pas le sectionnement de sécurité.',
  confusions: [['Disjoncteur', 'Le disjoncteur protège ; le contacteur commande.'], ['Relais d’interface', 'Même principe, mais un relais d’interface ne coupe que des courants de signal (quelques A).']],
  ports: { power: 'Contacts principaux 3P ou 4P (1/L1… 2/T1…).', ctrl: 'Bobine A1–A2 (24 V CC ou 230 V CA), contacts auxiliaires NO/NF (13–14, 21–22) pour le retour d’état.' },
  accessories: ['Bloc de contacts auxiliaires pour le retour d’état.', 'Antiparasite de bobine (RC/varistance/diode) pour protéger la sortie de commande.', 'Verrouillage mécanique si une paire de contacteurs sert d’inverseur de sources.', 'Contact miroir si utilisé dans un circuit de sécurité.'],
  compat: ['Courant assigné selon la bonne {{ac_cat|catégorie d’emploi}} (AC-1, AC-3, DC-1…).', 'Tension de bobine compatible avec l’alimentation de commande ; puissance de bobine compatible avec la sortie ou le relais d’interface.', 'Nombre de pôles (coupure du N pour l’inversion de sources/l’îlotage).', 'Assez de contacts auxiliaires pour retour d’état + verrouillage.'],
  params: [
    { n: 'Courant assigné selon la catégorie d’emploi', m: 'Courant maximal commuté selon le type de charge.', u: 'A (AC-1/AC-3)', i: 'Charges résistives : AC-1 ; moteurs : AC-3.', h: 'Ib du départ + type de charge.', e: 'Gradin résistif 2 kW : Ib ≈ 2,9 A, AC-1 → le plus petit contacteur suffit.', c: 'Endurance électrique au nombre de manœuvres prévu.' },
    { n: 'Tension et puissance de bobine', m: 'Tension de commande de la bobine ; puissance d’appel et de maintien.', i: 'Détermine s’il faut un relais d’interface.', h: 'Selon l’alimentation de commande de l’armoire.', e: 'Bobine 230 V CA → KA nécessaire car la DO de l’automate est un transistor 24 V CC.', c: 'Courant d’appel de la bobine face au pouvoir du contact du KA.' },
    { n: 'Nombre de pôles', m: 'Nombre de contacts principaux.', i: 'Un contacteur de séparation du réseau nécessite généralement 4P.', h: 'Selon le schéma de liaison à la terre dans les deux modes.', e: 'KM-PCC : 4P.', c: 'Règles de coupure du neutre en îlotage.' },
    { n: 'Contacts auxiliaires', m: 'Nombre de NO/NF auxiliaires.', i: 'Au moins 1 NO pour le retour vers l’automate.', h: 'D’après la liste E/S et les verrouillages.', e: '1 NO de retour + 1 NF de verrouillage.', c: 'Courant des contacts auxiliaires en 24 V CC (fiabilité à faible courant).' }
  ],
  example: {
    ok: { t: 'KM-RL1 : gradin de charge résistive 2 kW', d: 'AC-1, 3P, bobine 230 V CA via le relais d’interface KA, 1 NO de retour vers une DI.' },
    ko: { t: 'Contacteur AC utilisé pour couper un circuit batterie 200 V DC', d: 'Un calibre AC ne garantit pas l’extinction d’un arc DC. Côté DC, utiliser les appareils prévus pour le DC indiqués par le fabricant de la batterie.' }
  },
  brands: 'Exemples de gammes à consulter : Schneider TeSys (D/Deca), Acti9 iCT (modulaire) ; ABB AF, Siemens SIRIUS… — vérifier la fiche technique.'
},
decrelay: {
  name: 'Relais de protection de découplage', group: 'Appareillage & protection',
  func: 'Surveille U et f côté réseau du PCC ; hors seuils (perte du réseau, sur/sous-tension, sur/sous-fréquence), il ordonne l’ouverture de l’organe de séparation, empêchant le micro-réseau d’alimenter un réseau en défaut.',
  principle: 'Mesure la tension en direct à 400 V (sans TT), calcule U, f et éventuellement df/dt ; compare aux seuils et temporisations ; actionne ses contacts de déclenchement. Possède un chien de garde interne et un contact de défaut.',
  notdo: 'Ne coupe pas le courant lui-même (c’est KM-PCC/un disjoncteur qui le fait). Pas de protection contre les surintensités. Ne décide pas de l’îlotage — il ne fait que séparer.',
  confusions: [['Relais d’interface', 'Un relais d’interface ne mesure rien.'], ['Relais de sécurité', 'Le relais de sécurité protège les personnes contre la machine (arrêt d’urgence), il ne surveille pas le réseau.'], ['Automate', 'L’automate peut lire U/f sur une centrale de mesure, mais la fonction de découplage doit être assurée par un appareil de protection dédié (ou une fonction certifiée intégrée à l’onduleur) selon les règles de raccordement.']],
  ports: { meas: 'Entrées tension L1-L2-L3-N (via un disjoncteur protégeant le circuit de mesure).', aux: 'Alimentation auxiliaire (souvent 24 V CC ou 230 V CA — à vérifier).', ctrl: 'Sorties relais de déclenchement (vers la bobine de KM-PCC et/ou MX), contacts d’état/défaut vers l’automate.' },
  accessories: ['Petit disjoncteur protégeant le circuit de mesure de tension.', 'Alimentation auxiliaire secourue (ASI) pour que le relais fonctionne à la perte du réseau.', 'Certification conforme aux règles de raccordement (par ex. EN 50549-1 ou règles nationales) — à vérifier.'],
  compat: ['Seuils/temporisations réglés selon les règles de raccordement locales — pas pris sur ce site.', 'Contact de déclenchement capable de couper le courant de bobine de KM-PCC, ou via relais d’interface.', 'Comportement sûr en cas de perte de l’alimentation auxiliaire (sécurité positive : séparation).'],
  params: [
    { n: 'Tension mesurée', m: 'Plage de tension d’entrée de mesure.', i: 'Mesure directe à 400 V ; la HTA exige un TT.', h: 'Selon le point de raccordement.', e: '400 V 3P+N en direct.', c: 'Type de raccordement (3P+N ou 3P sans N).' },
    { n: 'Fonctions de protection', m: 'Seuils {{ansi|ANSI}} disponibles.', i: 'Doit inclure toutes les fonctions exigées par la réglementation.', h: 'D’après les règles de raccordement.', e: '27, 59, 81O/U, éventuellement 59N, df/dt — à vérifier.', c: 'Seuils fixés par le gestionnaire de réseau.' },
    { n: 'Alimentation auxiliaire', m: 'Tension et consommation de l’alimentation du relais.', i: 'S’il est alimenté par le réseau qu’il surveille, perte du réseau = perte du relais → ASI/sécurité positive nécessaire.', h: 'Selon l’alimentation de commande.', e: '24 V CC depuis un départ secouru par l’ASI.', c: 'Comportement à la perte de l’alimentation auxiliaire.' },
    { n: 'Sortie de déclenchement', m: 'Type et calibre des contacts de sortie.', i: 'Peut-elle piloter directement la bobine de KM-PCC ?', h: 'Comparer au courant de bobine.', e: 'Vérifier la fiche technique.', c: 'NO ou NF, logique de sécurité positive.' }
  ],
  example: {
    ok: { t: 'Relais de découplage 400 V alimenté en 24 V CC, sortie de déclenchement vers KM-PCC et MX', d: '24 V CC pris après l’ASI → le relais agit encore à la perte du réseau ; contact d’état vers l’automate pour journaliser l’événement.' },
    ko: { t: 'Utiliser l’automate pour lire la fréquence sur une centrale Modbus et séparer', d: 'Le temps de réponse dépend du cycle de lecture et de la communication, sans certification. Ne remplace pas la protection de découplage réglementaire.' }
  },
  brands: 'De nombreux fabricants proposent des relais de découplage/VFR (par ex. Schneider Easergy pour la HTA, divers fabricants pour la BT) — choisir dans la liste acceptée par le gestionnaire de réseau ; vérifier la fiche technique.'
},
ct: {
  name: 'Transformateur de courant (TC)', group: 'Mesure',
  func: 'Permet à une centrale de mesurer de forts courants en les transformant en un faible courant (ou une tension) secondaire isolé.',
  principle: 'Le conducteur primaire traverse le tore ; courant secondaire = courant primaire / rapport. Les types 1 A/5 A sont des sources de courant : un secondaire ouvert produit des tensions dangereuses. Les types mV (333 mV) ou Rogowski sont plus sûrs mais ne fonctionnent qu’avec des centrales compatibles.',
  notdo: 'Ne mesure pas la tension ; un TC seul ne donne pas la puissance. N’assure aucune protection.',
  confusions: [['Transformateur de tension (TT)', 'Le TT abaisse la haute tension à 100 V ; inutile à 400 V.'], ['TC de protection', 'Un TC de mesure sature tôt (protégeant la centrale) ; un TC de protection (5P…) reste précis aux courants de défaut.']],
  ports: { power: 'Primaire : câble/barre traversant (sens P1→P2 correct).', meas: 'Secondaire S1–S2 vers la centrale via des bornes de court-circuitage.' },
  accessories: ['Borniers d’essai/de court-circuitage TC.', 'Fils secondaires de section suffisante pour la charge en VA.', 'Mise à la terre d’un point du secondaire (selon instructions).'],
  compat: ['Type de sortie (5 A / 1 A / 333 mV) IDENTIQUE au type d’entrée de la centrale.', 'Rapport adapté à la plage de courant (précis entre 20 et 120 % de In).', 'Classe de précision de la chaîne TC + centrale.', 'Passage suffisant pour le câble.', 'Sens de montage correct (sens inversé → signe de puissance faux).'],
  params: [
    { n: 'Rapport de transformation', m: 'Courant primaire assigné / courant secondaire.', i: 'Le courant de service doit se situer dans la plage précise.', h: 'D’après le plus grand Ib au point de mesure.', e: '50/5 A pour le PCC (Ib max ≈ 52 A — envisager 60/5).', c: 'Rapport correctement paramétré dans la centrale.' },
    { n: 'Classe de précision', m: 'Erreur de rapport et de phase.', i: 'La chaîne de mesure n’est pas plus précise que son maillon le plus faible.', h: 'Selon l’usage (surveillance/énergie).', e: 'Cl. 0,5 ou 1.', c: 'Puissance de précision VA ≥ charge des fils + centrale.' },
    { n: 'Type de sortie', m: '5 A, 1 A, 333 mV, Rogowski.', i: 'Doit correspondre à la centrale.', h: 'Selon la centrale choisie.', e: '5 A.', c: 'L’incompatibilité la plus fréquente.' },
    { n: 'Puissance de précision', m: 'Charge secondaire maximale conservant la classe de précision.', i: 'Les fils longs augmentent la charge.', h: 'Impédance des fils + entrée de la centrale.', e: 'Vérifier la fiche technique.', c: '' }
  ],
  example: {
    ok: { t: '3 × TC 50/5 A Cl. 0,5 + centrale à entrée 5 A', d: 'Type de sortie compatible ; rapport paramétré dans la centrale = 10.' },
    ko: { t: 'TC à sortie 333 mV avec une centrale n’ayant que des entrées 5 A', d: 'Signal beaucoup trop faible ; la centrale lit presque 0. Être tous deux des « TC » ne signifie pas être compatibles.' }
  },
  brands: 'Exemples de gammes à consulter : Schneider PowerLogic TC, Socomec, Circutor… — vérifier la fiche technique.'
},
meter: {
  name: 'Centrale de mesure', group: 'Mesure',
  func: 'Mesure U, I, P, Q, S, cos φ, f et l’énergie en un point et les fournit à l’automate/l’EMS par communication.',
  principle: 'Échantillonne la tension (mesure directe) et le courant (via TC ou en direct ≤ 63 A pour les modèles à mesure directe) et calcule les grandeurs. Le signe de la puissance dépend du sens des TC et de la configuration.',
  notdo: 'Ne protège pas, ne coupe pas. Les valeurs transmises ont un retard (cycle de lecture) et ne servent pas à la protection rapide.',
  confusions: [['Compteur de facturation', 'Un compteur de facturation (MID/IEC 62053) sert à facturer ; un appareil de surveillance (IEC 61557-12) fournit plus de grandeurs.'], ['Relais de protection', 'Le relais mesure aussi, mais son but est un déclenchement rapide et certifié.']],
  ports: { meas: 'Entrées tension V1-V2-V3-VN (via disjoncteur/fusibles), entrées courant I1-I3 (S1/S2) ou bornes de mesure directe.', aux: 'Alimentation (autoalimentée par le circuit de mesure ou séparée).', comm: 'RS485 (Modbus RTU) ou Ethernet (Modbus TCP) selon le modèle.', ctrl: 'Selon le modèle : sorties impulsions, DI/DO.' },
  accessories: ['TC (si pas de mesure directe).', 'Disjoncteur/fusibles protégeant le circuit de mesure de tension.', 'Résistance de terminaison RS485 si en bout de bus.', 'Table des registres du fabricant.'],
  compat: ['Type de réseau (3P4W, 3P3W, 1P2W).', 'Entrée courant compatible avec le TC (5 A/1 A/mV).', 'Port de communication compatible avec l’automate (RS485 ou Ethernet) — sinon une passerelle est nécessaire.', 'Protocole et table des registres contenant toutes les grandeurs utiles (par ex. P signée par phase).', 'Type de données (FLOAT32, INT32…) et ordre des mots gérés par l’automate.'],
  params: [
    { n: 'Type de raccordement et tension', m: 'Réseaux mesurables et plage de tension.', i: 'Doit correspondre à l’installation.', h: 'Selon le point de mesure.', e: '400 V 3P4W.', c: '' },
    { n: 'Entrée courant', m: 'Via TC (5 A/1 A/mV) ou en direct.', i: 'Détermine si des TC sont nécessaires.', h: 'Ib au point de mesure : > 63 A, on utilise généralement des TC.', e: 'PCC : TC 5 A ; petits départs : mesure directe.', c: 'Courant maximal en mesure directe.' },
    { n: 'Classe de précision', m: 'Classe de précision puissance/énergie.', i: 'Surveillance : 1 ou 0,5S.', h: 'Selon l’usage.', e: 'Cl. 0,5S (hypothèse).', c: 'Selon IEC 61557-12 ou IEC 62053.' },
    { n: 'Communication', m: 'Port, protocole, rôle.', i: 'Détermine comment l’automate lit les valeurs.', h: 'Selon l’architecture de communication.', e: 'PCC : Modbus TCP (serveur) ; départs : Modbus RTU (esclave).', c: 'Nombre maximal de connexions TCP simultanées ; fréquence de mise à jour.' },
    { n: 'Convention de signe', m: 'Quel signe correspond au soutirage/à l’injection.', i: 'Signe faux → l’EMS charge la batterie quand il faudrait la décharger.', h: 'Configuration + sens des TC.', e: 'PCC : P > 0 = soutirage au réseau.', c: 'Essai avec une charge connue lors de la mise en service.' }
  ],
  example: {
    ok: { t: 'Centrale PCC Ethernet Modbus TCP + 3 TC 5 A', d: 'L’automate (client) lit la P totale signée chaque seconde ; l’EMS la lit aussi via le commutateur si la centrale accepte ≥ 2 connexions.' },
    ko: { t: 'Centrale uniquement RS485, automate uniquement Ethernet', d: 'Tous deux « Modbus », mais interfaces physiques différentes → module RS485 pour l’automate ou passerelle Modbus TCP/RTU nécessaire.' }
  },
  brands: 'Exemples de gammes à consulter : Schneider PowerLogic PM5000 / iEM3000, Siemens SENTRON PAC, Janitza, Socomec Diris… — ports et protocoles varient selon le modèle ; vérifier la fiche technique.'
},
busbar: {
  name: 'Jeu de barres AC principal', group: 'Distribution',
  func: 'Point de raccordement commun de toutes les sources et de tous les départs du tableau principal.',
  principle: 'Conducteur en cuivre dimensionné pour le courant total ; la loi de Kirchhoff s’y applique : puissance entrante totale = puissance sortante totale (pertes négligées).',
  notdo: 'Ne mesure pas, ne protège pas.',
  confusions: [['PCC', 'Le PCC est la frontière avec le réseau ; le jeu de barres est le point de distribution interne.']],
  ports: { power: 'Points de raccordement des départs (arrivées des sources, départs des charges).' },
  accessories: ['Supports isolants, écrans IP2X.', 'Peigne/répartiteur en cas d’appareillage modulaire.'],
  compat: ['Courant assigné ≥ courant maximal possible (y compris plusieurs sources alimentant simultanément).', 'Icw/Ipk ≥ courant de court-circuit.', 'Selon IEC 61439 lorsqu’il est intégré à un tableau.'],
  params: [
    { n: 'Courant assigné', m: 'Courant permanent admissible.', i: 'Prendre en compte le cas réseau + PV + batterie alimentant ensemble les charges.', h: 'Somme des sources pouvant débiter simultanément.', e: '63 A (préliminaire).', c: 'Température à l’intérieur du tableau.' },
    { n: 'Tenue au court-circuit', m: 'Capacité à supporter les efforts électrodynamiques et thermiques d’un court-circuit.', i: 'Dépend de l’Icc au PCC.', h: 'D’après l’Icc.', e: 'Données insuffisantes.', c: 'Système de jeu de barres testé selon IEC 61439.' }
  ],
  example: { ok: { t: 'Répartiteur 4P 63 A', d: 'Suffisant pour le modèle de labo si l’Icc convient.' }, ko: { t: 'Jeu de barres 40 A', d: 'Un réseau 36 kVA + 5 kW de PV peuvent alimenter 17 kW de charges + 5 kW de charge batterie → le courant peut dépasser 40 A.' } }
}
});
Object.assign(SG.I18D.fr.types, {
pvarray: {
  name: 'Générateur PV / simulateur PV', group: 'Sources',
  func: 'Produit une puissance DC à partir de l’éclairement. En laboratoire, il peut être remplacé par une source DC programmable émulant la courbe I-V (simulateur PV) pour des essais reproductibles.',
  principle: 'Chaque module a une courbe I–V ; la tension à vide Voc augmente par temps froid. Les modules sont mis en série en chaînes (strings) pour atteindre la tension d’entrée de l’onduleur.',
  notdo: 'Ne régule pas sa propre puissance ; l’onduleur fixe le point de fonctionnement.',
  confusions: [['Alimentation DC de laboratoire ordinaire', 'Une source DC à tension fixe n’a pas de caractéristique I-V de type PV ; le MPPT peut osciller. Il faut un vrai simulateur PV.']],
  ports: { power: 'Câbles DC + / − (connecteurs PV, par ex. compatibles MC4 — ne pas mélanger les marques).' },
  accessories: ['Câble solaire DC, connecteurs de même type/marque des deux côtés.', 'Structure de support et mise à la terre du châssis (si modules réels).'],
  compat: ['Voc de la chaîne à la température minimale < tension DC maximale de l’onduleur.', 'Vmp de la chaîne dans la plage MPPT à toutes les températures.', 'Isc ≤ courant de court-circuit maximal d’entrée de l’onduleur.'],
  params: [
    { n: 'Puissance crête', m: 'Puissance aux conditions d’essai normalisées (STC).', u: 'kWc', i: 'Ratio DC/AC par rapport à l’onduleur (généralement 1,0–1,3).', h: 'Selon les objectifs d’essai.', e: '6 kWc pour un onduleur de 5 kW.', c: '' },
    { n: 'Modules en série', m: 'Nombre de modules par chaîne.', u: 'modules', i: 'Fixe la tension de la chaîne.', h: 'D’après Voc, Vmp et les plages de l’onduleur.', e: '14 modules.', c: 'Calculer Voc à Tmin.' },
    { n: 'Tension à vide d’un module', m: 'Aux STC (25 °C).', i: 'Donnée d’entrée du calcul de Voc de la chaîne.', h: 'Fiche technique du module.', e: '41,5 V (hypothèse).', c: '' },
    { n: 'Coefficient de température de Voc', m: 'Variation de Voc avec la température.', i: 'Froid → Voc plus élevée.', h: 'Fiche technique du module.', e: '−0,28 %/°C (hypothèse).', c: '' },
    { n: 'Température minimale du site', m: 'Température de cellule la plus basse prévue.', i: 'Cas de tension maximale.', h: 'Données climatiques (en intérieur : température de la salle).', e: '−10 °C (si installé à l’extérieur).', c: '' }
  ],
  example: {
    ok: { t: '14 modules × 41,5 V, Tmin −10 °C', d: 'Voc,max = 14 × 41,5 × (1 + 0,0028 × 35) ≈ 638 V < 1000 V ; Vmp dans la plage MPPT supposée 200–800 V.' },
    ko: { t: '25 modules en série', d: 'Voc,max ≈ 1139 V > 1000 V → dépasse la tension DC maximale et peut détruire l’onduleur.' }
  }
},
pvdcbox: {
  name: 'Coffret de protection DC PV', group: 'Appareillage & protection',
  func: 'Isole le côté DC pour la maintenance, protège les chaînes contre les courants inverses (avec plusieurs chaînes en parallèle) et limite les surtensions transitoires côté DC.',
  principle: 'Un arc DC ne s’éteint pas de lui-même au passage par zéro comme en AC → les appareils doivent être prévus pour le DC à la bonne tension. Les fusibles gPV (IEC 60269-6) ne sont nécessaires qu’à partir de 3 chaînes en parallèle (ou selon la réglementation).',
  notdo: 'Ne remplace pas le disjoncteur AC côté réseau ; pas de protection contre les chocs côté AC.',
  confusions: [['Disjoncteur AC', 'Un calibre AC ne signifie pas pouvoir couper 600 V DC.']],
  ports: { power: 'Entrée DC depuis la chaîne, sortie DC vers l’onduleur.', ctrl: 'En option : contact de défaut du parafoudre.' },
  accessories: ['Parafoudre DC de type PV.', 'Étiquette d’avertissement « DC – reste sous tension après coupure AC ».'],
  compat: ['Tension DC assignée ≥ Voc,max de la chaîne.', 'Courant ≥ 1,25 × Isc (selon la réglementation).', 'Nombre de chaînes → fusibles nécessaires ou non.'],
  params: [
    { n: 'Tension DC assignée', m: 'Tension DC maximale que l’appareil peut couper/supporter.', i: '≥ Voc,max calculée à Tmin.', h: 'D’après le calcul de la chaîne.', e: '≥ 638 V → choisir un modèle 1000 V DC.', c: 'Câblage des pôles en série pour atteindre Udc.' },
    { n: 'Courant DC assigné', m: '', i: '≥ courant de chaîne avec un coefficient de sécurité.', h: 'Isc × coefficient réglementaire.', e: 'À vérifier selon les règles PV applicables.', c: '' },
    { n: 'Parafoudre DC', m: 'Ucpv, In, Up.', i: 'Up < tenue aux chocs de l’onduleur.', h: 'Selon l’analyse du risque foudre.', e: 'À vérifier.', c: '' }
  ],
  example: { ok: { t: 'Sectionneur DC 1000 V + parafoudre PV, 1 chaîne', d: 'Une seule chaîne → pas de fusibles de chaîne (à vérifier selon la réglementation).' }, ko: { t: 'Utiliser un disjoncteur AC 230 V comme sectionneur DC', d: 'Pas prévu pour 600 V DC ; un arc peut se maintenir.' } }
},
pvinv: {
  name: 'Onduleur photovoltaïque raccordé au réseau', group: 'Sources',
  func: 'Convertit le DC du PV en AC synchronisé avec le réseau, suit le point de puissance maximale et accepte des ordres de limitation de puissance.',
  principle: 'Le {{mppt|MPPT}} fixe la tension DC optimale ; l’étage onduleur injecte un courant en phase avec la tension du réseau ({{gfl|suiveur de réseau}}). {{anti_isl|Anti-îlotage}} intégré : perte du réseau → arrêt de l’injection dans le délai requis.',
  notdo: 'Ne forme généralement PAS le réseau : pas d’alimentation à la perte du réseau sans source formeuse. Ne charge pas directement une batterie (sauf onduleurs hybrides).',
  confusions: [['PCS', 'Le PCS est un convertisseur bidirectionnel pour la batterie ; l’onduleur PV est unidirectionnel DC→AC.'], ['BMS', 'Le BMS gère la batterie et ne convertit aucune puissance.']],
  ports: { power: 'Entrée DC (MPPT), sortie AC 3P+N+PE.', comm: 'Ethernet (Modbus TCP/SunSpec, web) et/ou RS485 — selon le modèle.', ctrl: 'Selon le modèle : entrée de limitation de puissance, relais de défaut.' },
  accessories: ['Disjoncteur AC selon la recommandation du fabricant.', 'DDR si exigé (type A ou B selon l’onduleur).', 'Coffret DC.', 'Table des registres/modèles SunSpec pris en charge.'],
  compat: ['Tension/nombre de phases AC.', 'Plage MPPT et Vdc,max par rapport à la chaîne PV.', 'Capacité à recevoir une consigne de limitation P par communication (registre inscriptible, temps de réponse).', 'Fonctionnement sur un réseau formé par le PCS en îlotage (plage de fréquence, écrêtage P(f)) — vérifier la liste de compatibilité du fabricant du PCS.', 'Certification de raccordement selon le lieu d’installation.'],
  params: [
    { n: 'Puissance AC assignée', m: 'Puissance maximale côté AC.', i: 'Courant AC et choix du disjoncteur de départ.', h: 'D’après Pdc et les objectifs.', e: '5 kW, 3P.', c: 'kVA maximum en fourniture de Q.' },
    { n: 'Tension DC maximale', m: 'Limite absolue d’entrée.', i: 'La Voc,max de la chaîne doit être inférieure.', h: 'Fiche technique.', e: '1000 V (hypothèse).', c: '' },
    { n: 'Plage MPPT', m: 'Tension DC de fonctionnement optimal.', i: 'La Vmp de la chaîne doit s’y trouver.', h: 'Fiche technique.', e: '200–800 V (hypothèse).', c: 'Nombre de MPPT, courant par MPPT.' },
    { n: 'Communication', m: 'Port, protocole, grandeurs en lecture/écriture.', i: 'Détermine si l’EMS peut limiter le PV.', h: 'Fiche technique + table des registres.', e: 'Modbus TCP — table des registres : PAS ENCORE DISPONIBLE.', c: 'Le registre de limitation P est-il mémorisé (éviter d’user l’EEPROM par des écritures continues) ?' },
    { n: 'Mode réseau', m: 'Suiveur/formeur de réseau, P(f), Q(U).', i: 'Îlotage avec un PCS formeur de réseau.', h: 'Fiche technique.', e: 'Suiveur de réseau, avec P(f) (hypothèse).', c: 'Liste de compatibilité « couplage AC » du fabricant du PCS.' },
    { n: 'Environnement & installation', m: 'IP, température, refroidissement, bruit.', i: 'Fixation murale hors armoire, dégagements de ventilation.', h: 'Fiche technique.', e: 'IP65 mural (courant, à vérifier).', c: '' }
  ],
  example: {
    ok: { t: 'Onduleur 5 kW 3P, MPPT 200–800 V, Modbus TCP avec table des registres', d: 'La chaîne de 14 modules est dans la plage ; l’EMS peut écrire la limite P lorsqu’il faut empêcher l’injection.' },
    ko: { t: 'Onduleur avec seulement un port RS485 et un protocole propriétaire', d: 'Le port physique peut être raccordé via une passerelle, mais si le protocole n’est pas publié, l’automate/l’EMS ne peuvent ni lire ni écrire.' }
  },
  brands: 'Exemples à consulter : SMA, Fronius, Huawei, SolarEdge, Schneider (Conext)… — le support SunSpec/Modbus varie selon le modèle ; vérifier la fiche technique.'
},
battery: {
  name: 'Batterie de stockage', group: 'Stockage',
  func: 'Stocke l’énergie en DC ; fournit/absorbe de la puissance via le PCS.',
  principle: 'Cellules LFP (lithium fer phosphate) en série/parallèle formant des modules, avec contacteur DC et fusibles internes, surveillées par le BMS.',
  notdo: 'Ne se raccorde pas seule à l’AC ; ne décide pas seule de la charge/décharge.',
  confusions: [['BMS', 'La batterie stocke, le BMS gère ; souvent un même produit mais des fonctions différentes.']],
  ports: { power: 'Bornes DC + / − (haute tension ou 48 V selon le système).', comm: 'Port BMS (CAN/RS485) — voir BMS.' },
  accessories: ['Protection DC (fusibles/disjoncteur DC) selon le fabricant.', 'Ventilation/température du local, distances de sécurité incendie.'],
  compat: ['Plage de tension batterie dans la plage DC du PCS.', 'Courant continu de charge/décharge ≥ puissance du PCS / tension.', 'Couple batterie–PCS présent dans la liste de compatibilité.'],
  params: [
    { n: 'Capacité', m: 'Énergie nominale (et utile).', i: 'Autonomie en îlotage.', h: 'Puissance des charges × durée souhaitée.', e: '10 kWh.', c: 'Capacité utile entre SOC min/max.' },
    { n: 'Tension nominale / plage', m: '', i: 'Doit correspondre au PCS.', h: 'Fiche technique.', e: '200 V (hypothèse).', c: '' },
    { n: 'Courant continu de charge/décharge', m: '', i: 'Limite la puissance réelle.', h: 'P = U × I.', e: '25 A → 5 kW à 200 V.', c: 'Réduit selon la température/le SOC (calculé par le BMS).' },
    { n: 'Limites de SOC d’exploitation', m: 'SOC min/max appliqués par l’EMS.', i: 'Réserve pour l’îlotage.', h: 'Stratégie d’exploitation.', e: '20 % / 90 %.', c: '' }
  ],
  example: { ok: { t: 'Batterie LFP 10 kWh, 200 V, 25 A en continu', d: 'Suffisant pour un PCS de 5 kW (5000/200 = 25 A).' }, ko: { t: 'Batterie 48 V pour un PCS haute tension', d: 'Les plages de tension DC ne correspondent pas — raccordement impossible.' } }
},
bms: {
  name: 'Système de gestion de batterie', group: 'Stockage',
  func: 'Maintient la batterie dans sa zone de sécurité : mesure les tensions de cellule, la température et le courant ; calcule SOC/SOH ; équilibre ; ouvre le contacteur DC en cas de dépassement ; envoie les limites de charge/décharge au PCS.',
  principle: 'Cartes de mesure sur chaque module + contrôleur maître. Envoie en continu {{bms_lim|CVL/CCL/DCL}} et le SOC au PCS par {{can|CAN}} ou RS485 selon le protocole du fabricant.',
  notdo: 'Ne convertit pas la puissance, ne pilote pas le réseau, n’est pas un EMS.',
  confusions: [['PCS', 'Le PCS charge/décharge ; le BMS autorise/limite.'], ['EMS', 'L’EMS décide de la stratégie (quand charger) ; le BMS protège la batterie.']],
  ports: { comm: 'CAN ou RS485 vers le PCS (obligatoire) ; éventuellement un port de supervision.', ctrl: 'Contact de défaut, entrée d’arrêt d’urgence selon le modèle.', aux: 'Alimentation par la batterie ou externe.' },
  accessories: ['Câble de communication au brochage indiqué par le fabricant.', 'Résistance de terminaison CAN.'],
  compat: ['Protocole BMS↔PCS reconnu par les deux fabricants (liste de compatibilité).', 'Brochage RJ45 du port CAN (aucun standard commun).', 'Débit CAN (par ex. 250/500 kbit/s).'],
  params: [
    { n: 'Protocole vers le PCS', m: 'Jeu de messages compris par le PCS.', i: 'Incompatible → le PCS refuse de charger/décharger.', h: 'Liste de compatibilité du PCS.', e: 'CAN, protocole constructeur — NON VÉRIFIÉ.', c: 'Versions de firmware des deux côtés.' },
    { n: 'Grandeurs fournies', m: 'SOC, SOH, T, U cellule min/max, alarmes.', i: 'L’EMS a besoin d’un SOC fiable.', h: 'Documentation du protocole.', e: 'SOC relayé par le PCS en Modbus TCP.', c: '' }
  ],
  example: { ok: { t: 'Batterie et PCS tous deux dans la liste de compatibilité officielle', d: 'Le PCS reçoit les limites CCL/DCL et réduit lui-même la puissance quand la batterie est froide.' }, ko: { t: 'Même port CAN RJ45 mais protocole différent', d: 'Le PCS signale « BMS communication lost » et ne décharge pas — des ports identiques ne signifient pas compatibilité.' } }
},
pcs: {
  name: 'Convertisseur de puissance batterie', group: 'Stockage',
  func: 'Charge et décharge la batterie côté AC selon une consigne ; s’il est formeur de réseau, il forme le réseau en îlotage.',
  principle: 'Pont IGBT bidirectionnel. Mode {{gfl|suiveur de réseau}} : régulation de courant selon la consigne P/Q. Mode {{gfm|formeur de réseau}} : maintient U et f, la puissance s’équilibre d’elle-même avec la charge.',
  notdo: 'Ne remplace pas le BMS (pas de surveillance des cellules). Un modèle suiveur de réseau ne peut pas alimenter à la perte du réseau.',
  confusions: [['Onduleur PV', 'Unidirectionnel, MPPT ; le PCS est bidirectionnel avec la batterie.'], ['BMS', 'Le BMS protège la batterie, le PCS convertit la puissance.'], ['ASI', 'Une ASI online passe toujours par le convertisseur ; un PCS de micro-réseau change de mode à la perte du réseau (éventuellement avec une coupure).']],
  ports: { power: 'DC batterie, AC 3P+N+PE.', comm: 'CAN/RS485 vers le BMS ; Ethernet (Modbus TCP) vers l’automate/l’EMS.', ctrl: 'Selon le modèle : entrée de validation, relais d’état, sortie de démarrage groupe.' },
  accessories: ['Disjoncteur AC, protection DC.', 'Un capteur de courant au PCC peut être nécessaire pour la fonction zéro injection du fabricant.', 'Relais N–PE interne ou externe en îlotage (schéma de liaison à la terre) — à vérifier.'],
  compat: ['Plage de tension DC compatible avec la batterie.', 'Protocole BMS.', 'Formeur de réseau si l’îlotage est souhaité ; capacité de surcharge brève pour le démarrage du moteur.', 'Temps de basculement en îlotage.', 'Capacité de resynchronisation au réseau.', 'Fonctionnement avec un onduleur PV en couplage AC (P(f)).'],
  params: [
    { n: 'Puissance assignée', m: 'Puissance continue de charge/décharge.', i: 'Limite la compensation des charges et la charge maximale en îlotage.', h: 'D’après les charges prioritaires + moteur.', e: '5 kW 3P.', c: 'Surcharge brève (par ex. pendant quelques secondes).' },
    { n: 'Formeur de réseau', m: 'Capacité à former le réseau.', u: 'oui/non', i: 'Obligatoire pour l’îlotage sur batterie.', h: 'Fiche technique.', e: 'Oui (hypothèse).', c: 'Un accessoire de commutation séparé est-il nécessaire ?' },
    { n: 'Temps de basculement', m: 'Temps entre la perte du réseau et le rétablissement en îlotage.', i: 'Les charges sensibles (PC) peuvent redémarrer.', h: 'Fiche technique.', e: 'Vérifier la fiche technique.', c: '' },
    { n: 'Communication EMS', m: 'Lecture de P, SOC ; écriture de la consigne P, du mode.', i: 'Pilotage par l’EMS.', h: 'Table des registres.', e: 'Modbus TCP (hypothèse).', c: 'Chien de garde : comportement en cas de perte de consigne.' }
  ],
  example: { ok: { t: 'PCS 5 kW formeur de réseau + batterie dans la liste de compatibilité', d: 'Permet les scénarios de perte du réseau et d’îlotage.' }, ko: { t: 'PCS suiveur de réseau avec « mode îlotage » activé', d: 'Pas de source formeuse → le scénario d’îlotage est verrouillé.' } },
  brands: 'Exemples à consulter : Schneider (Conext XW), Victron, SMA (Sunny Island), Studer… — capacité de formation de réseau et listes de batteries compatibles différentes ; vérifier la fiche technique.'
},
genset: {
  name: 'Groupe électrogène', group: 'Sources',
  func: 'Source de secours formeuse de réseau quand le réseau est perdu et que la batterie ne suffit pas.',
  principle: 'Un moteur entraîne un alternateur synchrone ; l’AVR maintient la tension, le régulateur de vitesse la fréquence. Réponse lente aux grands échelons de charge.',
  notdo: 'Ne peut pas absorber de puissance (retour de puissance dangereux). Ne doit pas fonctionner en parallèle avec le réseau sans synchroniseur, protections et convention de raccordement.',
  confusions: [['Source formeuse sur batterie', 'Les deux forment le réseau ; le groupe est plus lent mais fournit de l’énergie sur la durée.']],
  ports: { power: 'Sortie 3P+N.', ctrl: 'Liaison avec le contrôleur de groupe.' },
  accessories: ['Contrôleur de groupe.', 'Évacuation des gaz et ventilation (dans un local de 80 m² : installer à l’extérieur ou utiliser une source émulée).', 'Batterie de démarrage et chargeur.'],
  compat: ['kVA ≥ charges prioritaires + courant de démarrage du moteur.', 'Pas de marche en parallèle avec le réseau dans l’architecture de référence.', 'Limiter le PV quand le groupe fonctionne (charge minimale, retour de puissance).'],
  params: [
    { n: 'Puissance apparente', m: '', u: 'kVA @ cos φ 0,8', i: 'Courant et choix du disjoncteur.', h: 'Charge maximale sur groupe.', e: '10 kVA / 8 kW.', c: 'Régime PRP/ESP (ISO 8528).' },
    { n: 'Charge minimale recommandée', m: '', i: 'Il faut limiter le PV/la charge de la batterie.', h: 'Instructions du fabricant.', e: '30 % (hypothèse).', c: '' },
    { n: 'Emplacement', m: '', i: 'Un groupe diesel ne doit pas être placé dans un laboratoire fermé.', h: 'Règles de sécurité incendie et d’échappement.', e: 'À l’extérieur, ou remplacé par une source émulée.', c: '' }
  ],
  example: { ok: { t: 'Groupe 10 kVA 3P + contrôleur avec démarrage à distance', d: 'Suffisant pour les charges prioritaires + un moteur de 2,2 kW via le variateur.' }, ko: { t: 'Groupe 3 kVA pour une charge de 6 kW', d: 'Surcharge → chute de tension/fréquence, le groupe s’arrête pour se protéger.' } }
},
genctrl: {
  name: 'Contrôleur de groupe électrogène', group: 'Commande',
  func: 'Démarre/arrête le groupe, surveille et protège moteur et alternateur, transmet l’état à l’automate.',
  principle: 'Reçoit un ordre de « démarrage à distance » (contact sec) ou démarre automatiquement à la perte du réseau (AMF). Mesure U, f, I du groupe ; signale « prêt à prendre la charge » une fois stable.',
  notdo: 'Les modèles de base ne synchronisent pas et ne partagent pas la charge. Ne remplace pas l’automate dans la logique d’inversion de sources du micro-réseau, sauf configuration en ce sens.',
  confusions: [['Automate', 'Le contrôleur de groupe ne pilote que le groupe ; l’automate coordonne l’ensemble.'], ['Synchroniseur', 'La fonction ANSI 25 n’existe que sur les contrôleurs évolués ou des appareils séparés.']],
  ports: { ctrl: 'DI de démarrage à distance, DO « en marche/prêt » et « alarme générale », éventuellement une sortie de fermeture du contacteur groupe.', comm: 'RS485 Modbus RTU (courant) ou Ethernet selon le modèle.', aux: '12/24 V CC depuis la batterie de démarrage.' },
  accessories: ['Table des registres.', 'Relais d’interface si l’entrée de démarrage à distance exige un contact sec.'],
  compat: ['Entrée de démarrage à distance : contact sec ou tension 12/24 V — comparer avec la sortie de l’automate.', 'L’alimentation du contrôleur (batterie du groupe) diffère de celle de l’armoire → utiliser un contact sec pour isoler.', 'Fonction de synchronisation si un basculement sans coupure est souhaité.'],
  params: [
    { n: 'Fonctions', m: 'Marche/arrêt, AMF, synchronisation, partage de charge.', i: 'Détermine les scénarios autorisés.', h: 'Fiche technique.', e: 'Démarrage à distance + Modbus ; SANS synchronisation (hypothèse).', c: '' },
    { n: 'Communication', m: '', i: 'L’automate lit P, U, f.', h: 'Fiche technique.', e: 'RS485 Modbus RTU, adresse 1.', c: 'Débit/parité.' }
  ],
  example: { ok: { t: 'Contrôleur de groupe avec entrée de démarrage à distance sur contact sec', d: 'L’automate ferme KA3 → le groupe démarre ; le contrôleur signale « prêt » par une DO → l’automate autorise la fermeture de KM-GEN.' }, ko: { t: 'Raccorder directement une DO 24 V CC de l’automate à une entrée de démarrage alimentée par la batterie 12 V du groupe', d: 'Deux alimentations différentes peuvent provoquer des courants de circulation/des dégâts ; utiliser un relais d’interface.' } }
},
vfd: {
  name: 'Variateur de vitesse', group: 'Charge moteur',
  func: 'Règle la vitesse du moteur, assure un démarrage progressif (réduit le courant de démarrage — important en îlotage) et la protection thermique du moteur.',
  principle: 'Redresseur → bus continu → onduleur MLI. Reçoit l’ordre de marche par DI ou communication, la vitesse par AI ou communication. Dispose d’une fonction {{sto|STO}}.',
  notdo: 'Ce n’est pas un organe de sectionnement ; la STO ne met pas le moteur hors tension (la tension reste présente). Ne remplace pas le disjoncteur amont protégeant le câble.',
  confusions: [['Démarreur progressif', 'Un démarreur progressif réduit seulement le courant de démarrage, il ne règle pas la vitesse.'], ['Contacteur', 'Le contacteur commute l’alimentation ; le variateur règle vitesse et couple.']],
  ports: { power: 'Entrée L1-L2-L3, sortie U-V-W vers le moteur (câble blindé contre les perturbations).', ctrl: 'DI marche/arrêt/réarmement, AI de vitesse, relais défaut/en marche, STO double canal.', comm: 'Modbus RTU intégré ou Ethernet (selon le modèle/la carte option).' },
  accessories: ['Disjoncteur ou fusibles selon les instructions du fabricant.', 'Filtre CEM, inductance de ligne si nécessaire.', 'Câble moteur blindé avec reprise de blindage à 360°.', 'Carte de communication si Ethernet souhaité.'],
  compat: ['Puissance et courant ≥ ceux du moteur.', 'Alimentation 3P 400 V.', 'Type de DI (PNP/NPN) compatible avec la DO de l’automate.', 'AI 0–10 V ou 4–20 mA compatible avec l’AO de l’automate.', 'Courant de fuite haute fréquence → type de DDR adapté (selon le fabricant).'],
  params: [
    { n: 'Puissance / courant assignés', m: '', i: '≥ moteur, attention au service sévère/normal.', h: 'Plaque signalétique du moteur.', e: '2,2 kW, 400 V.', c: '' },
    { n: 'E/S de commande', m: 'Nombre de DI/AI/relais, logique PNP/NPN.', i: 'Interfaçage avec l’automate.', h: 'Fiche technique.', e: 'DI 24 V PNP, AI 0–10 V, relais R1 de défaut.', c: '' },
    { n: 'STO', m: 'Niveau de sécurité SIL/PL.', i: 'Arrêt d’urgence sans contacteur séparé (selon l’évaluation).', h: 'Analyse de risques.', e: 'Oui (hypothèse).', c: 'Câblée depuis le relais de sécurité.' },
    { n: 'Dissipation thermique', m: 'Pertes thermiques dans l’armoire.', i: 'Dimensionnement de la ventilation d’armoire.', h: 'Fiche technique.', e: '~3 % de la puissance (estimation).', c: '' }
  ],
  example: { ok: { t: 'Variateur 2,2 kW, DI PNP, STO', d: 'L’automate envoie une DO PNP 24 V vers la DI de marche ; AO 0–10 V pour la vitesse ; relais « en marche » vers une DI.' }, ko: { t: 'Entrées du variateur configurées en NPN, automate en PNP', d: 'Le variateur ignore l’ordre de marche alors que la LED de la DO est allumée. Reconfigurer la logique des DI ou changer de module.' } },
  brands: 'Exemples à consulter : Schneider Altivar, ABB ACS, Siemens SINAMICS, Danfoss… — vérifier la fiche technique.'
},
motor: {
  name: 'Moteur asynchrone', group: 'Charge moteur',
  func: 'Charge moteur représentative (ventilateur/pompe) pour étudier le démarrage, le courant d’appel, la variation de vitesse et l’arrêt d’urgence.',
  principle: 'Un champ tournant entraîne le rotor ; en démarrage direct le courant atteint 6–8 × In, via variateur il reste proche de In.',
  notdo: '—',
  ports: { power: 'U-V-W + PE.', meas: 'En option : PTC/PT100 dans les enroulements.' },
  accessories: ['Charge mécanique (ventilateur, frein à poudre) pour une puissance réelle.'],
  compat: ['Couplage étoile/triangle compatible avec 400 V.', 'Adapté à l’alimentation par variateur (isolation).'],
  params: [
    { n: 'Puissance mécanique', m: '', i: 'Choix du variateur/de la protection.', h: 'Plaque signalétique.', e: '2,2 kW.', c: '' },
    { n: 'Courant assigné', m: '', i: 'Réglage de la protection thermique dans le variateur.', h: 'Plaque signalétique.', e: '≈ 4,7 A sous 400 V (estimation).', c: '' },
    { n: 'Rendement, cos φ', m: '', i: 'Puissance électrique absorbée.', h: 'Plaque signalétique/classe IE.', e: 'η 0,85 ; cos φ 0,82.', c: '' }
  ],
  example: { ok: { t: 'Moteur 2,2 kW 400 V Δ', d: 'Variateur 2,2 kW.' }, ko: { t: 'Moteur 230/400 V couplé en Δ sur un réseau 400 V', d: 'Chaque enroulement reçoit 400 V au lieu de 230 V → enroulements grillés. Coupler en Y.' } }
},
loadbank: {
  name: 'Banc de charge résistif réglable', group: 'Charges',
  func: 'Charge délestable, réglable par gradins, pour tester l’équilibre de puissance.',
  principle: 'Gradins résistifs (cos φ = 1), chacun commuté par son propre contacteur.',
  notdo: 'Pas de réglage fin (sauf avec un gradateur à thyristors).',
  ports: { power: 'Entrée 3P par gradin.' },
  accessories: ['Un contacteur par gradin.', 'Ventilation : toute la puissance devient chaleur dans la salle !'],
  compat: ['Chaleur dans une salle de 80 m² : 6 kW de chaleur exigent ventilation/climatisation.', 'Contacteurs AC-1.'],
  params: [
    { n: 'Nombre de gradins × puissance', m: '', i: 'Finesse du délestage.', h: 'Scénario d’essai.', e: '3 × 2 kW.', c: '' },
    { n: 'Chaleur dégagée', m: '', i: 'Système de ventilation.', h: '= puissance.', e: '6 kW.', c: 'Capteur de surchauffe.' }
  ],
  example: { ok: { t: '3 gradins de 2 kW, 3P, avec ventilateur et thermomètre', d: 'Assez fin pour observer chaque étape de délestage.' }, ko: { t: 'Charge de 6 kW dans une armoire fermée', d: 'Surchauffe, dégâts sur les équipements voisins.' } }
},
genericload: {
  name: 'Départ charges prioritaires', group: 'Charges',
  func: 'Charges à maintenir autant que possible (éclairage, prises d’instruments de mesure, PC SCADA…).',
  principle: 'Jamais délestées ; réalimentées en premier en îlotage.',
  notdo: '—',
  ports: { power: 'Entrée 3P+N ou 1P+N.' },
  accessories: ['DDR 30 mA pour les prises (selon la réglementation).'],
  compat: ['Total des charges prioritaires < puissance du PCS en îlotage.'],
  params: [{ n: 'Puissance', m: '', i: 'Dimensionnement du PCS/du groupe.', h: 'Inventaire des équipements.', e: '1,5 kW.', c: '' }],
  example: { ok: { t: 'Charges prioritaires 1,5 kW', d: '< 5 kW du PCS en îlotage.' }, ko: { t: 'Regrouper la charge résistive avec les charges prioritaires', d: 'En îlotage, la puissance du PCS est dépassée et il ne reste rien à délester.' } }
},
evse: {
  name: 'Borne de recharge VE AC', group: 'Charges',
  func: 'Recharge les véhicules électriques ; le courant de recharge peut être limité sur ordre de l’EMS (charge pilotable).',
  principle: 'Indique au véhicule le courant maximal par le signal PWM Control Pilot (IEC 61851-1) ; le véhicule s’adapte. Reçoit les limites par {{ocpp|OCPP}} ou Modbus selon la borne.',
  notdo: 'Ne peut pas descendre sous le courant minimal (généralement 6 A selon IEC 61851) — elle peut seulement suspendre la recharge.',
  confusions: [['Prise ordinaire', 'Aucune communication avec le véhicule, aucune limitation de courant.']],
  ports: { power: 'Entrée AC 1P+N ou 3P+N.', comm: 'Ethernet/4G (OCPP), éventuellement Modbus.', ctrl: 'Selon la borne : entrée de validation/réduction de puissance.' },
  accessories: ['DDR type A + détection DC 6 mA, ou type B (selon la borne et la réglementation).', 'Disjoncteur dédié.'],
  compat: ['Version OCPP et support du smart charging.', 'L’EMS dispose-t-il d’un CSMS/serveur OCPP ?'],
  params: [
    { n: 'Puissance', m: '', i: 'Impact fort sur l’équilibre de puissance.', h: '', e: '7,4 kW 1P 32 A.', c: '' },
    { n: 'Protocole', m: '', i: 'Limitation du courant par l’EMS.', h: '', e: 'OCPP 1.6J (hypothèse).', c: 'SetChargingProfile pris en charge ?' }
  ],
  example: { ok: { t: 'Borne OCPP + EMS avec CSMS', d: 'L’EMS limite à 16 A quand la charge augmente.' }, ko: { t: 'Borne sans communication', d: 'Ne peut qu’être coupée complètement par un contacteur → le véhicule peut signaler un défaut.' } }
},
spd: {
  name: 'Parafoudre AC', group: 'Appareillage & protection',
  func: 'Limite les surtensions transitoires sur le jeu de barres AC.',
  principle: 'Varistances/éclateurs écoulant le courant de choc vers le PE.',
  notdo: 'Ne protège pas contre les surtensions durables (400 V sur une phase), ne remplace pas la mise à la terre.',
  confusions: [['Relais de surtension', 'Un relais 59 détecte une surtension durable et ordonne un déclenchement.']],
  ports: { power: 'L1-L2-L3-N + PE.', ctrl: 'Contact de signalisation de défaut.' },
  accessories: ['Protection de déconnexion (disjoncteur/fusible) selon le fabricant.', 'Liaison courte vers le PE.'],
  compat: ['Uc adaptée au schéma de liaison à la terre.', 'Up < tenue aux chocs des équipements.'],
  params: [{ n: 'Type', m: '', i: '', h: 'Analyse du risque foudre.', e: 'Type 2.', c: '' }],
  example: { ok: { t: 'Parafoudre type 2 avec contact de signalisation', d: 'L’automate signale quand il faut le remplacer.' }, ko: { t: 'Parafoudre sans protection de déconnexion', d: 'S’il défaille en court-circuit, rien ne déclenche.' } }
},
psu: {
  name: 'Alimentation 24 V CC', group: 'Auxiliaires',
  func: 'Fournit l’alimentation de commande de l’automate, des E/S, relais, commutateur, IHM et capteurs.',
  principle: 'Alimentation à découpage avec limitation de courant ; un contact DC-OK signale une tension de sortie normale.',
  notdo: 'Ne tient pas une coupure AC (temps de maintien de quelques dizaines de ms) → une ASI est nécessaire si la commande doit survivre à la perte du réseau.',
  confusions: [['ASI', 'Une ASI dispose d’une réserve d’énergie.']],
  ports: { power: 'Entrée 230 V CA (L, N, PE).', aux: 'Sortie +24 V / 0 V.', ctrl: 'Contact DC-OK.' },
  accessories: ['Disjoncteur côté AC.', 'Distribution 24 V avec protection de chaque départ.'],
  compat: ['Courant total ≤ ~80 % du calibre (marge).', 'Courant d’appel des charges capacitives.', 'Courant suffisant pour faire déclencher la protection des départs 24 V (ou protection électronique).'],
  params: [
    { n: 'Courant de sortie assigné', m: '', i: '≥ consommation totale / 0,8.', h: 'Additionner la consommation de chaque équipement (tableau de la page Choix).', e: '10 A (240 W).', c: 'Déclassement en température.' },
    { n: 'Contact DC-OK', m: '', i: 'Surveillance de l’alimentation.', h: '', e: 'Oui (hypothèse).', c: '' }
  ],
  example: { ok: { t: 'Alimentation 10 A pour une charge ≈ 4,5 A', d: 'Taux de charge ≈ 45 %, marge pour les extensions.' }, ko: { t: 'Alimentation 2,5 A', d: 'Consommation totale > 2,5 A → chute de tension, l’automate redémarre quand de nombreux relais se ferment.' } }
}
});
Object.assign(SG.I18D.fr.types, {
dcups: {
  name: 'ASI 24 V CC', group: 'Auxiliaires',
  func: 'Maintient le 24 V CC de l’automate, du relais de découplage, du commutateur et de l’IHM pendant la perte du réseau, pour gérer l’inversion de sources et journaliser les événements.',
  principle: 'Module placé après l’alimentation ; à la perte de sa sortie, il bascule sur batterie/supercondensateur et transmet son état à l’automate.',
  notdo: 'N’alimente pas les charges de puissance.',
  confusions: [['PCS', 'Le PCS alimente les charges AC ; la DC-UPS n’alimente que la commande.']],
  ports: { aux: 'Entrée 24 V depuis l’alimentation, sortie 24 V secourue, port batterie.', ctrl: 'Contacts « sur batterie » et « batterie faible ».' },
  accessories: ['Batterie adaptée, fusible batterie.'],
  compat: ['Courant de sortie ≥ charge secourue.', 'Autonomie ≥ temps d’inversion de sources + démarrage du groupe + marge.'],
  params: [{ n: 'Autonomie', m: '', u: 'min', i: '', h: 'Charge secourue × durée.', e: '30 min à 4 A (hypothèse).', c: '' }],
  example: { ok: { t: 'DC-UPS 10 A + batterie 7 Ah', d: 'Maintient la commande pendant la perte du réseau et le démarrage du groupe.' }, ko: { t: 'Pas d’ASI, automate alimenté par le réseau', d: 'Perte du réseau → automate éteint → personne ne ferme KM-GEN, pas de journal.' } }
},
dcdist: {
  name: 'Distribution & protection 24 V CC', group: 'Auxiliaires',
  func: 'Répartit le 24 V en départs protégés individuellement : automate, E/S, bobines de relais, communication, équipements terrain.',
  principle: 'La protection électronique par voie détecte les surintensités même lorsque l’alimentation limite son courant (un disjoncteur ordinaire peut ne pas déclencher).',
  notdo: '—',
  ports: { aux: 'Entrée 24 V, départs 24 V ; 0 V commun.', ctrl: 'Contact de défaut de voie.' },
  accessories: ['Borniers 0 V/24 V.'],
  compat: ['Courant total des départs.', 'Caractéristique de déclenchement adaptée au courant de l’alimentation.'],
  params: [{ n: 'Nombre de voies', m: '', u: 'voies', i: '', h: 'Groupes de charges.', e: '4–8 voies.', c: '' }],
  example: { ok: { t: 'Départ séparé pour les bobines de relais', d: 'Un court-circuit sur le câblage terrain ne fait pas tomber l’automate.' }, ko: { t: 'Un fusible commun', d: 'Le défaut d’un seul capteur supprime toute la commande.' } }
},
plc: {
  name: 'Automate programmable industriel (UC)', group: 'Commande',
  func: 'Exécute la logique de commande : verrouillages, séquences de démarrage/d’inversion de sources, délestage, gestion des alarmes, échanges avec les équipements, l’IHM et l’EMS.',
  principle: 'Cycle de scrutation : lecture des E/S → exécution du programme (IEC 61131-3 : LD, ST, FBD…) → écriture des sorties. Client Modbus (lit les équipements) et éventuellement serveur (pour la lecture par l’IHM/l’EMS).',
  notdo: 'Ne remplace pas les protections électriques (surintensités, découplage). Un automate standard n’est pas un équipement de sécurité (l’arrêt d’urgence passe par un relais de sécurité ou un automate de sécurité certifié).',
  confusions: [['RTU', 'Collecte et transmet vers un centre distant (IEC 104/DNP3), peu de logique.'], ['IED', 'Dispositif électronique intelligent de poste, généralement un relais de protection.'], ['IHM', 'Écran d’exploitation, n’exécute pas la logique de commande principale.'], ['SCADA/EMS', 'Logiciels de supervision et d’optimisation de niveau supérieur ; émettent des consignes, l’automate exécute.']],
  ports: { aux: '24 V CC.', ctrl: 'Bus interne vers les modules E/S.', comm: 'Ethernet (1–2 ports RJ45), éventuellement un port série RS485 intégré.' },
  accessories: ['Modules E/S, modules de communication.', 'Logiciel de programmation.', 'Pile RTC/carte mémoire.'],
  compat: ['Nombre maximal de modules d’extension.', 'Nombre de connexions Modbus TCP client/serveur simultanées.', 'RS485 intégré ou non.', 'Support des protocoles nécessaires (Modbus ; MQTT et OCPP sont rarement dans l’automate → pris en charge par l’EMS).'],
  params: [
    { n: 'Ports Ethernet', m: 'Nombre de ports, commutateur intégré, protocoles.', u: 'ports', i: 'Nombre d’équipements raccordés directement.', h: 'Fiche technique.', e: '1 port → un commutateur est nécessaire.', c: 'Nombre maximal de connexions TCP.' },
    { n: 'Ports série', m: 'RS485 intégré/module.', u: 'ports', i: 'Lecture des équipements Modbus RTU.', h: 'Fiche technique.', e: 'Non intégré → module RS485.', c: '' },
    { n: 'Capacité d’extension E/S', m: '', u: 'modules', i: 'Selon la liste E/S + 20 % de réserve.', h: 'Liste E/S.', e: 'Voir la page Liste E/S.', c: '' },
    { n: 'Alimentation et consommation', m: '', i: 'Alimentation 24 V.', h: 'Fiche technique.', e: '≈ 10 W (hypothèse).', c: '' }
  ],
  example: { ok: { t: 'Automate avec 1 port Ethernet + module RS485 + commutateur 8 ports', d: 'Lit la centrale PCC/l’onduleur/le PCS/le variateur en Modbus TCP, le groupe et les compteurs de départ en Modbus RTU.' }, ko: { t: 'Automate réalisant l’arrêt d’urgence avec une DI et une DO', d: 'Ne satisfait pas les exigences de sécurité ; une DO collée empêcherait d’arrêter le moteur.' } },
  brands: 'Exemples à consulter : Schneider Modicon M221/M241/M251, Siemens S7-1200, Wago, Phoenix Contact PLCnext… — vérifier la fiche technique.'
},
dimod: {
  name: 'Module d’entrées TOR', group: 'Commande',
  func: 'Lit des états MARCHE/ARRÊT : contacts auxiliaires de disjoncteurs/contacteurs, boutons-poussoirs, signaux de défaut.',
  principle: 'Entrées 24 V CC de type sink (lisent +24 V, pour capteurs PNP) ou source ; avec filtrage.',
  notdo: 'Ne lit pas de valeurs continues.', confusions: [['AI', 'Une AI lit des valeurs continues.']],
  ports: { ctrl: 'Bornes d’entrée + commun (COM).', aux: 'Alimentation 24 V des entrées.' },
  accessories: ['Borniers, repères.'], compat: ['Type {{pnp|PNP/NPN}}.', 'Tension 24 V CC.', 'Nombre de voies + réserve.'],
  params: [{ n: 'Nombre de voies', m: '', u: 'voies', i: '', h: 'Liste E/S.', e: '16 voies/module.', c: '' }, { n: 'Logique', m: '', u: 'sink/source', i: 'Compatible avec les équipements.', h: '', e: 'Sink (pour PNP).', c: '' }],
  example: { ok: { t: 'DI 16 voies sink 24 V CC', d: 'Lit les contacts auxiliaires (contacts secs) alimentés en +24 V.' }, ko: { t: 'Capteur NPN sur une entrée sink', d: 'L’état ne peut pas être lu.' } }
},
domod: {
  name: 'Module de sorties TOR', group: 'Commande',
  func: 'Émet des ordres MARCHE/ARRÊT : relais d’interface, ordre de marche du variateur, voyants.',
  principle: 'Sorties transistor PNP 24 V CC 0,5 A (rapides, longue durée de vie) ou relais (coupent quelques A en AC/DC, plus lentes).',
  notdo: 'Un transistor ne commute pas de charge AC et manque de courant pour les grosses bobines de contacteur.', confusions: [['Relais d’interface', 'Le KA est placé après la DO pour commuter un circuit plus puissant ou d’une autre tension.']],
  ports: { ctrl: 'Bornes de sortie + alimentation de groupe.', aux: '24 V pour le groupe de sorties.' },
  accessories: ['Relais d’interface pour les charges 230 V CA.', 'Diode/RC d’antiparasitage pour charges inductives.'],
  compat: ['Type de sortie (transistor/relais) selon la tension de charge.', 'Courant par voie et courant total du groupe.'],
  params: [{ n: 'Nombre de voies', m: '', u: 'voies', i: '', h: 'Liste E/S.', e: '16 voies/module.', c: '' }, { n: 'Type de sortie', m: '', i: 'Un KA est-il nécessaire ?', h: '', e: 'Transistor PNP 0,5 A.', c: 'Courant total du groupe.' }],
  example: { ok: { t: 'DO transistor → KA (bobine 24 V CC, 20 mA)', d: 'Le KA commande la bobine 230 V CA du contacteur.' }, ko: { t: 'DO transistor raccordée directement à une bobine de contacteur 230 V CA', d: 'Un transistor ne sert qu’en DC — incompatible.' } }
},
aimod: {
  name: 'Module d’E/S analogiques', group: 'Commande',
  func: 'Lit les capteurs 4–20 mA/0–10 V/RTD et émet le signal de consigne de vitesse.',
  principle: 'CAN/CNA de résolution 12–16 bits ; chaque voie est configurée pour son type de signal.',
  notdo: '—',
  ports: { ctrl: 'Bornes AI, AO, commun analogique.', aux: '24 V (alimentation de boucle pour capteurs 2 fils le cas échéant).' },
  accessories: ['Câble blindé, blindage relié à une extrémité.'], compat: ['Type de signal de chaque voie.', 'Alimentation de boucle 4–20 mA 2 fils.', 'Les RTD exigent des voies RTD dédiées.'],
  params: [{ n: 'Nombre de voies AI/AO', m: '', u: 'voies', i: '', h: 'Liste E/S.', e: '4 AI + 2 AO.', c: '' }, { n: 'Type de signal', m: '', i: '', h: '', e: '4–20 mA, 0–10 V, Pt100.', c: '' }],
  example: { ok: { t: 'AI 4–20 mA pour un capteur d’éclairement 2 fils', d: 'Le module alimente la boucle, ou une alimentation 24 V est câblée en série.' }, ko: { t: 'Voie configurée en 0–10 V pour un capteur 4–20 mA', d: 'Mesures totalement fausses.' } }
},
commmod: {
  name: 'Module de communication RS485', group: 'Communication',
  func: 'Permet à l’automate d’être maître Modbus RTU sur un bus RS485.',
  principle: 'Émetteur-récepteur RS485 isolé ; l’automate interroge chaque esclave à tour de rôle.',
  notdo: 'Ne convertit pas vers Ethernet pour d’autres équipements.', confusions: [['Passerelle', 'Une passerelle permet à des équipements Ethernet de lire le bus RS485.']],
  ports: { comm: 'D+ / D− / 0V commun (bornes ou RJ45/SUB-D selon le fabricant).' },
  accessories: ['Résistances de terminaison 120 Ω et de polarisation.', 'Câble paire torsadée blindé.'], compat: ['Brochage du connecteur.', 'Isolation.', 'Mode 2 fils.'],
  params: [{ n: 'Débits pris en charge', m: '', u: 'bauds', i: '', h: '', e: '9600–115200.', c: '' }],
  example: { ok: { t: 'Module RS485 isolé + 3 esclaves', d: 'Bus 19200 8E1, adresses 1, 11, 12.' }, ko: { t: 'Deux connecteurs RJ45 au brochage différent', d: 'D+/D− inversés ou sur les mauvaises broches → aucune réponse.' } }
},
relayint: {
  name: 'Relais d’interface', group: 'Commande',
  func: 'Isole et amplifie : une DO 24 V CC de l’automate commande un circuit 230 V CA (bobine de contacteur), ou fournit un contact sec à un équipement d’une autre alimentation (groupe).',
  principle: 'Bobine 24 V CC + contacts 230 V CA / quelques A ; avec LED et diode.',
  notdo: 'Ne mesure pas, ne protège pas, ce n’est pas un relais de sécurité.', confusions: [['Relais de protection', 'Un relais de protection mesure et décide lui-même du déclenchement.'], ['Relais de sécurité', 'Un relais de sécurité s’autosurveille et est certifié PL/SIL.']],
  ports: { ctrl: 'Bobine A1-A2 (depuis la DO), contact 11-14 (vers l’équipement).' },
  accessories: ['Embase.'], compat: ['Courant du contact ≥ courant d’appel de la bobine du contacteur.', 'Bobine 24 V CC adaptée à la DO.'],
  params: [{ n: 'Calibre des contacts', m: '', u: 'A @ V', i: '', h: '', e: '6 A 250 V CA (courant, à vérifier).', c: '' }],
  example: { ok: { t: 'KA pour KM-PCC, KM-GEN, KM-RL', d: 'Chaque contacteur 230 V CA via un KA.' }, ko: { t: 'Utiliser un KA pour l’arrêt d’urgence', d: 'Aucune surveillance des défauts — utiliser un relais de sécurité.' } }
},
safetyrelay: {
  name: 'Relais de sécurité', group: 'Sécurité',
  func: 'Réalise la fonction d’arrêt d’urgence : surveille un arrêt d’urgence double canal, coupe KM-M1 et la STO du variateur, n’autorise le redémarrage qu’après un réarmement volontaire.',
  principle: 'Canaux redondants + autotest ; détection des courts-circuits entre canaux ; contacts liés mécaniquement.',
  notdo: 'Ne surveille pas le réseau, ne remplace pas les protections électriques.', confusions: [['Relais de protection', 'Protège l’installation électrique.'], ['Relais d’interface', 'Sans autotest.']],
  ports: { ctrl: 'Entrées S11-S12/S21-S22 depuis l’arrêt d’urgence, bouton de réarmement, sorties de sécurité 13-14/23-24, sortie d’état vers l’automate.', aux: '24 V CC.' },
  accessories: ['Bouton d’arrêt d’urgence à deux contacts NF.', 'Bouton de réarmement.'], compat: ['PL/SIL conforme à l’analyse de risques.', 'Courant des contacts de sécurité adapté à la bobine de KM-M1.'],
  params: [{ n: 'Niveau de sécurité', m: '', u: 'PL / SIL', i: '', h: 'Analyse de risques (ISO 12100, ISO 13849-1).', e: 'Évaluation nécessaire.', c: '' }],
  example: { ok: { t: 'Arrêt d’urgence 2 canaux → KS → KM-M1 + STO', d: 'Arrêt de catégorie 0/1 selon IEC 60204-1 (évaluation nécessaire).' }, ko: { t: 'Arrêt d’urgence câblé uniquement sur une DI de l’automate', d: 'Défaut logiciel/sortie collée → arrêt impossible.' } }
},
estop: {
  name: 'Bouton d’arrêt d’urgence', group: 'Sécurité',
  func: 'Permet à l’opérateur d’arrêter immédiatement un danger.', principle: 'Contacts NF à ouverture forcée, à accrochage, déverrouillage par rotation/traction.',
  notdo: 'Ne coupe pas l’alimentation de toute l’installation (sauf conception spécifique) ; ne remplace pas le sectionnement.', confusions: [['Bouton d’arrêt', 'Le bouton d’arrêt est un arrêt d’exploitation normal.']],
  ports: { ctrl: '2 contacts NF vers le relais de sécurité.' }, accessories: ['Collerette jaune.'], compat: ['IEC 60947-5-5, ISO 13850.'],
  params: [{ n: 'Nombre de contacts NF', m: '', i: '', h: '', e: '2 NF.', c: '' }],
  example: { ok: { t: 'Boutons sur la porte de l’armoire et près du moteur', d: 'Câblés en série sur les deux canaux.' }, ko: { t: 'Bouton NO', d: 'Un fil coupé passe inaperçu.' } }
},
opanel: {
  name: 'Face avant : boutons, voyants, commutateurs', group: 'Commande',
  func: 'Commande locale en mode Local, sélection Auto/Manu et Local/Distance, voyants.',
  principle: 'Contacts vers des DI, voyants depuis des DO.', notdo: '—', confusions: [['IHM', 'L’IHM est un écran ; les boutons câblés fonctionnent même si l’IHM est en panne.']],
  ports: { ctrl: 'Contacts et voyants 24 V CC.' }, accessories: ['Repères.'], compat: ['Voyants LED 24 V CC ; courant < capacité de la DO.'],
  params: [{ n: 'Liste', m: '', i: '', h: '', e: 'Commutateur A/M, commutateur L/D, Marche/Arrêt M1, Réarmement, 3 voyants.', c: '' }],
  example: { ok: { t: 'Bouton d’arrêt NF', d: 'Fil coupé = arrêt (sécurité positive).' }, ko: { t: 'Arrêt NO', d: 'Fil coupé → le bouton d’arrêt n’a plus d’effet.' } }
},
switch: {
  name: 'Commutateur Ethernet industriel', group: 'Communication',
  func: 'Relie en étoile l’automate, l’IHM, l’EMS, les centrales de mesure, l’onduleur, le PCS, le variateur…',
  principle: 'Transfère les trames Ethernet selon l’adresse MAC. Ne traite pas les protocoles applicatifs.',
  notdo: 'Ne convertit pas le Modbus RTU en TCP ; ne fait pas se « comprendre » deux équipements.', confusions: [['Passerelle', 'Une passerelle convertit les protocoles.'], ['Routeur', 'Un routeur relie deux réseaux IP différents.']],
  ports: { comm: 'N ports RJ45 (10/100), éventuellement des ports fibre.', aux: '24 V CC (éventuellement deux entrées redondantes).' },
  accessories: ['Câble Cat5e/6 blindé pour environnement industriel.'], compat: ['Nombre de ports ≥ équipements + réserve.', 'Administrable si VLAN/segmentation réseau nécessaires.', 'Alimentation 24 V.'],
  params: [{ n: 'Nombre de ports', m: '', u: 'ports', i: '', h: 'Compter les équipements Ethernet (page Choix).', e: '8 ports.', c: '' }, { n: 'Administrable / non administrable', m: '', i: '', h: '', e: 'Un modèle non administrable suffit pour une première version.', c: 'En cas de raccordement au réseau d’entreprise → séparer par un pare-feu.' }],
  example: { ok: { t: 'Commutateur 8 ports 24 V CC sur rail DIN', d: '7 équipements + 1 de réserve — juste ; envisager 16 ports.' }, ko: { t: 'Commutateur de bureau en 230 V CA', d: 'Perte du réseau → perte du réseau de communication, même si l’automate est sur ASI.' } }
},
gateway: {
  name: 'Passerelle Modbus TCP ↔ RTU', group: 'Communication',
  func: 'Permet à un client Ethernet (EMS, automate) de lire des équipements RS485.',
  principle: 'Reçoit une requête Modbus TCP, la convertit en trame RTU avec adresse = Unit ID, puis renvoie la réponse.',
  notdo: 'Ne modifie pas la table des registres ; ne rend pas le bus RS485 plus rapide.', confusions: [['Commutateur', 'Un commutateur ne convertit pas les protocoles.']],
  ports: { comm: 'Ethernet RJ45 + RS485.', aux: '24 V CC.' }, compat: ['Temporisation du client > durée du cycle d’interrogation du bus.', 'Un seul maître sur le bus RS485.'],
  params: [{ n: 'Mode', m: '', i: '', h: '', e: 'Transparent TCP→RTU.', c: '' }],
  example: { ok: { t: 'L’EMS lit les compteurs de départ via la passerelle', d: 'Quand l’automate n’a pas de port RS485.' }, ko: { t: 'Module RS485 de l’automate et passerelle tous deux maîtres sur le même bus', d: 'Deux maîtres → collisions de trames.' } }
},
hmi: {
  name: 'Pupitre IHM', group: 'Supervision',
  func: 'Affiche le synoptique, les valeurs et les alarmes ; envoie les ordres d’exploitation à l’automate.',
  principle: 'Lit/écrit les variables (tags) de l’automate via Ethernet ; n’exécute pas de logique de commande.', notdo: 'Ne remplace pas l’arrêt d’urgence ; ne pilote pas directement les équipements terrain.',
  confusions: [['SCADA', 'Le SCADA est un logiciel à l’échelle de l’installation, multi-écrans, avec un historique long.']],
  ports: { comm: 'Ethernet.', aux: '24 V CC.' }, compat: ['Pilote de communication avec l’automate (Modbus TCP ou protocole constructeur).'],
  params: [{ n: 'Taille', m: '', u: 'pouces', i: '', h: '', e: '7–10 pouces.', c: '' }],
  example: { ok: { t: 'IHM sur la porte de l’armoire, Modbus TCP avec l’automate', d: '' }, ko: { t: 'IHM écrivant directement dans les registres du variateur', d: 'Contourne les vérifications de l’automate.' } }
},
ems: {
  name: 'SCADA / EMS (PC)', group: 'Supervision',
  func: 'Historique, rapports, optimisation des flux d’énergie (consigne batterie, limite PV, planification VE), passerelle cloud (MQTT), serveur OCPP.',
  principle: 'Lit les données de l’automate (et éventuellement directement des équipements) ; écrit les consignes dans l’automate ; l’automate vérifie les limites avant de les transmettre.',
  notdo: 'N’assure pas les verrouillages de sécurité ; la perte du PC ne doit pas rendre l’installation dangereuse.', confusions: [['Automate', 'L’automate est temps réel, proche des équipements.'], ['DMS', 'Le DMS du gestionnaire de réseau.']],
  ports: { comm: 'Ethernet.', aux: '230 V CA (charges prioritaires) ou 24 V (PC industriel).' }, accessories: ['Logiciel SCADA/EMS, base de données.'], compat: ['Pilotes Modbus TCP, OCPP, MQTT.'],
  params: [{ n: 'Logiciel', m: '', i: '', h: '', e: 'SCADA + EMS à règles.', c: '' }],
  example: { ok: { t: 'L’EMS écrit P_bat_set dans l’automate', d: 'L’automate la limite à ±5 kW et selon le SOC.' }, ko: { t: 'L’EMS écrit directement dans le PCS pendant que l’automate le pilote', d: 'Deux sources d’ordres → conflit.' } }
},
pyrano: {
  name: 'Capteur d’éclairement', group: 'Mesure',
  func: 'Mesure l’éclairement pour évaluer la performance du PV.', principle: 'Sortie 4–20 mA proportionnelle aux W/m².',
  ports: { meas: 'Boucle 4–20 mA 2 fils.' }, compat: ['AI 4–20 mA.'],
  params: [{ n: 'Plage de mesure', m: '', i: '', h: '', e: '0–1500 W/m² ↔ 4–20 mA.', c: '' }],
  example: { ok: { t: 'Capteur 4–20 mA 2 fils', d: '' }, ko: { t: 'Sortie Modbus', d: 'Nécessite un port RS485.' } }
},
lora: {
  name: 'Passerelle LoRaWAN + capteurs', group: 'Communication',
  func: 'Capteurs sans fil sur pile (température/humidité de la salle, température d’armoire) pour la supervision.',
  principle: 'Les capteurs envoient de petits paquets toutes les quelques minutes ; le serveur réseau les décode et les publie en MQTT vers l’EMS.',
  notdo: 'Pas pour la commande ni la protection.', confusions: [['Wi-Fi', 'Large bande passante, forte consommation.']],
  ports: { comm: 'Antenne, Ethernet.' }, accessories: ['Serveur réseau (LNS).'], compat: ['Bande de fréquences régionale (EU868, AS923…).'],
  params: [{ n: 'Bande de fréquences', m: '', i: '', h: 'Réglementation régionale.', e: 'EU868 (France) — à vérifier.', c: '' }],
  example: { ok: { t: 'Température de la salle toutes les 5 minutes', d: '' }, ko: { t: 'Ordre de délestage via LoRaWAN', d: 'Latence et rapport cyclique non garantis.' } }
},
cabinet: {
  name: 'Enveloppe, rail DIN, goulottes, ventilation, borniers, barre PE', group: 'Tableau électrique',
  func: 'Abrite et protège les équipements ; sépare les zones puissance/commande/communication ; dissipe la chaleur.',
  principle: 'Selon IEC 61439 (ensembles) et les guides d’installation ; séparer les signaux bas niveau des câbles de puissance.',
  compat: ['Pertes thermiques ≤ capacité de dissipation.', 'IP selon l’environnement.'],
  params: [{ n: 'Pertes thermiques', m: '', i: 'Ventilateur/filtre.', h: 'Somme des pertes.', e: 'Variateur + alimentation + relais ≈ 150 W (estimation).', c: '' }],
  example: { ok: { t: 'Armoire de commande séparée', d: 'Réduit les perturbations.' }, ko: { t: 'Câble RS485 dans la même goulotte que le câble moteur du variateur', d: 'Les perturbations provoquent des erreurs de communication.' } }
}
});
