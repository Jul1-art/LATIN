# LATIN — le film

Montage de **1 min 45 s**, en quinze plans, réunissant les **treize citations du site**, leurs traductions françaises et leurs auteurs. Chaque citation possède son propre sujet visuel : vidéos de nature, tableau historique, photographies spatiales, vidéo solaire, time-lapse réel de la Voie lactée ESO et animation du dé déjà présent. La Terre accompagne les titres d’ouverture et de fin. Deux exports partagent le même montage et la même bande-son :

- `assets/latin-intro.mp4` : paysage, 3840 × 2160, H.264/AAC, 60 images/s.
- `assets/latin-intro-mobile.mp4` : vertical, 2160 × 3840 à 60 images/s, mêmes durée et bande-son.

## Règles éditoriales à conserver

- Conserver **à l’identique les treize citations latines, leurs traductions françaises et leurs auteurs**, dans `edit.json` et `chapters.json`.
- Réserver **l’empreinte Apollo à « Veni, vidi, vici. »**, avec une seule apparition dans le film.
- Réserver **la vidéo de fleur à « Carpe diem. »**, avec une seule apparition dans le film.
- Réserver **la Terre aux titres « LATIN. » d’ouverture et de fin**.
- Maintenir un sujet distinct pour chaque citation et identifier les créations originales comme telles dans les crédits.
- Pour tout nouveau plan, utiliser des **images, vidéos ou œuvres existantes**, avec une source et une licence documentées. **Ne créer aucun nouvel objet ou décor en 3D pour le film.**

Ces règles s’appliquent aussi aux futurs changements d’images, de recadrage ou de format.

## Lecteur

Un écran noir avec un triangle central précède la lecture. Le clic sur « Lancer le film » démarre la vidéo **avec le son activé et le volume du lecteur à 100 %**, conformément aux règles des navigateurs. Les commandes permettent la lecture/pause, le déplacement dans la vidéo, le réglage du volume, la coupure du son, le plein écran et la fermeture.

Les paramètres proposent les vitesses 0,75×, 1×, 1,25× et 1,5× ainsi qu’un accès direct aux treize citations. **Les chapitres sont uniquement accessibles dans les paramètres.** Les commandes d’arrêt et de reprise depuis le début ont été retirées. La fin du film conserve une proposition de relecture ou de retour au site. La préférence de réduction des animations évite l’ouverture automatique du lecteur.

## Les treize sujets

| Citation | Sujet du plan |
| --- | --- |
| Ave ! | Rouge-gorge, vidéo de nature |
| Tu quoque, mi fili ! | La morte di Cesare, tableau de Vincenzo Camuccini |
| Alea jacta est. | Dé qui tombe et s’immobilise, création 3D |
| Veni, vidi, vici. | Empreinte Apollo, photographie NASA mise en mouvement |
| Dura lex, sed lex. | Saturne et ses anneaux, photographie de Cassini |
| Si vis pacem, para bellum. | Éruption solaire du 10 mai 2022, vidéo NASA SDO |
| Mens sana in corpore sano. | Épis de blé dans le vent, vidéo de nature |
| Errare humanum est, perseverare diabolicum. | Ruisseau qui contourne les obstacles, vidéo de nature |
| Memento mori. | Nébuleuse de l’Anneau austral, photographie JWST NIRCam |
| Omnes vulnerant, ultima necat. | Éclipse solaire totale du 21 août 2017, photographie NASA / Aubrey Gemignani |
| Carpe diem. | Fleur, vidéo de nature |
| Audacibus fortuna juvat. | Vagues et horizon, vidéo de nature |
| Ad astra per ardua. | Voie lactée au VLT, time-lapse réel 4K ESO/C. Malin |

## Sources et créations originales

Les photographies **Earth (B)** et **Moon — Apollo Astronaut Bootprint** proviennent de la collection officielle `nasa/NASA-3D-Resources`, fixée au commit `11ebb4ee043715aefbba6aeec8a61746fad67fa7`. Son README déclare explicitement : **“These assets are free and without copyright.”** Cette déclaration concerne les ressources de la collection. Le README et les images utilisés ont été inspectés. Les directives générales NASA ont été inspectées dans une capture officielle archivée ; la provenance de l’ancienne vidéo des Perséides reste conservée dans `source-files.json` pour l’historique.

Cinq ressources supplémentaires utilisées dans ce montage sont distribuées par Wikimedia Commons. Leurs fichiers et notices ont été inspectés ; `source-files.json` conserve les URL, empreintes SHA-256 et révisions précises des notices :

- **Saturn during Equinox — Cassini PIA11141** : NASA / JPL / Space Science Institute. La [notice Commons](https://commons.wikimedia.org/w/index.php?title=File:Saturn_during_Equinox.jpg&oldid=1281661591) classe cette image dans le domaine public NASA (`PD-USGov-NASA`).
- **Solar X1.5 flare — May 10, 2022, SDO AIA 304 PSF (SVS5005)** : NASA Scientific Visualization Studio ; Tom Bridgman (Global Science and Technology, Inc.), Scott Wiessinger (KBR Wyle Services, LLC), Laurence Schuler et Ian Jones (ADNET Systems, Inc.). La [notice Commons](https://commons.wikimedia.org/w/index.php?title=File:Solar_X1_5_flare_-_May_10,_2022_(SVS5005_-_20220510_FlareX15_AIA304_PSF_2048p30).webm&oldid=1065571301) indique le domaine public NASA. Le film emploie un extrait du transcodage Commons 1080 × 1080 de cette vidéo, sans son source.
- **La morte di Cesare** : Vincenzo Camuccini (1771–1844). La [notice Commons](https://commons.wikimedia.org/w/index.php?title=File:Vincenzo_Camuccini_-_La_morte_di_Cesare.jpg&oldid=1042602578) identifie une reproduction fidèle d’un tableau dans le domaine public (`PD-Art`, `PD-old-100-expired`). Cette œuvre historique accompagne « Tu quoque, mi fili ! » ; elle n’est pas un enregistrement de l’événement.
- **Southern Ring Nebula — JWST NIRCam (NGC 3132)** : NASA / ESA / CSA / STScI. La [notice Commons](https://commons.wikimedia.org/w/index.php?title=File:Southern_Ring_Nebula_by_Webb_Telescope_(2022).jpg&oldid=911295671) classe cette photographie télescopique dans le domaine public NASA. Elle accompagne « Memento mori. ».
- **Total solar eclipse above Madras, Oregon — 21 August 2017** : NASA / Aubrey Gemignani, diffusion NASA Goddard Space Flight Center. Cette photographie accompagne « Omnes vulnerant, ultima necat. ». Sa [notice Commons vérifiée](https://commons.wikimedia.org/w/index.php?title=File:2017_Total_Solar_Eclipse_(35909952653).jpg&oldid=1085795581) indique précisément la licence **[CC BY 2.0](https://creativecommons.org/licenses/by/2.0/)**. Adaptations pour le film : recadrage, léger mouvement de caméra, colorimétrie et superposition de la citation et de sa traduction. La source, le crédit et la licence sont conservés dans les crédits du site.

Les plans de Camuccini, de l’Anneau austral et de l’éclipse utilisent ces images existantes avec de légers mouvements et recadrages en deux dimensions. Aucun objet, décor ou phénomène n’a été reconstruit pour ces plans.

Les pages NASA/JPL, SVS et Webb indiquées comme sources originales par Commons n’ont pas été directement consultées depuis cet environnement. Les affirmations de licence ci-dessus reposent sur les notices Commons inspectées.

La vidéo **Yepun to the Universe** accompagne « Ad astra per ardua. ». Ce véritable time-lapse panoramique de la Voie lactée a été filmé au VLT, à Paranal. Crédit intégral : **ESO/C. Malin (christophmalin.com)**. La [notice officielle](https://www.eso.org/public/videos/uhd-cm-vlt2014-3/) décrit les prises de vues réelles et propose le fichier H.264 natif **3840 × 2160 à 25 images/s**. L’empreinte SHA-256 publiée par ESO a été vérifiée après téléchargement. La [politique officielle ESO](https://www.eso.org/public/copyright/), inspectée, place ces vidéos sous **CC BY 4.0** et autorise leur adaptation avec attribution visible.

L’extrait de **2 à 12,25 secondes** reçoit un recadrage, une colorimétrie et les textes existants. Les exports sont à **60 images/s par conversion de cadence**, sans prétendre à une captation native à 60 images/s. Aucun objet ou ciel 3D n’est ajouté. Les autres plans gardent leur rendu original à 24 images/s, agrandi pour l’export 4K ; leur détail natif n’augmente pas. Le portrait est un recadrage de la source paysage. Les treize citations, traductions, auteurs, durées et la musique continue sont identiques.

Les vidéos **Robin Bird**, **Wheat Field** et **Waves** proviennent du dépôt miroir `tanersener/ffmpeg-video-slideshow-scripts`, fixé au commit `91d766eb231566215f66204a34bcc2b7221c2648`. Son README nomme ces trois vidéos et les déclare dans le domaine public, séparément de la licence du logiciel. Les pages primaires Pixabay n’ont pas été directement consultées ; les notices conservent cette distinction. Les vidéos **flower** et **stream-of-water** sont distribuées par MDN, au commit `13024db581b08fae11a0ca229497198b9b0534e7`, sous **CC0-1.0**.

Le **dé déjà présent**, qui accompagne « Alea jacta est. », est la seule animation d’objet originale encore utilisée dans ce montage. Il reste crédité comme une création Blender du projet. Les anciens plans de dague, bougie, cadran solaire, monolithes, bouclier et traversée Tycho sont conservés dans le dépôt pour les versions antérieures et ne sont plus utilisés dans le film actuel.

Les vidéos générées, leurs scripts et leurs notices de provenance sont versionnés dans [`generated/`](generated/README.md). Les auteurs, liens et licences de l’ensemble des médias figurent dans [la page des crédits](../media-credits.html) et dans `source-files.json`.

## Musique

**Adventure**, Rafael Krux / CinematicWaves.com, collection FreePD Music, **CC0**. Le montage prolonge une phrase orchestrale intérieure, entre **44 et 68 secondes** du morceau, avec un fondu croisé de **quatre secondes à puissance constante**. Un ajustement de tempo de moins de 0,3 %, sans changement de hauteur, cale cette extension sur les **105 secondes complètes**. La conclusion naturelle du morceau n’intervient qu’à la fin du film : aucune fin de piste ni reprise de son introduction n’est placée au milieu. Le mixage reçoit une normalisation du volume et des fondus d’entrée et de sortie. Le son des vidéos sources n’est pas utilisé. La musique et sa licence ont été inspectées dans le dépôt GitHub épinglé indiqué dans `music/provenance.json`.

## Reproduire le montage

L’assemblage principal nécessite **Python 3.11+ et sa bibliothèque standard**, FFmpeg/FFprobe avec libx264, AAC, libwebp et les filtres drawtext, zoompan, perspective, xfade, acrossfade, atempo, minterpolate, curves et vignette, ainsi que Fontconfig avec Liberation Sans/Serif. Les vidéos générées sont déjà incluses dans `generated/` : **Blender, NumPy et Pillow ne sont pas nécessaires pour assembler le film**. Les sources externes proviennent de commits GitHub précis, de fichiers Commons documentés ou du catalogue vidéo officiel ESO (les sources des versions antérieures restent documentées) ; leurs empreintes SHA-256 sont vérifiées avant utilisation.

Depuis la racine du dépôt :

```sh
python3 film/prepare_sources.py
python3 film/build_film.py film/edit.json film/render/landscape
python3 film/build_film.py film/edit.json film/render/portrait --portrait
```

`source-files.json` fixe les URL, les empreintes et les notices de licence des ressources externes. `edit.json` documente les quinze plans, leurs extraits, les ralentis, les mouvements, les titres et la musique. `chapters.json` contient les treize citations et les repères de navigation du lecteur. Les sources téléchargées et exports de travail sont ignorés par Git ; les vidéos originales générées et leurs scripts sont versionnés. `build_film.py` refuse d’écraser une sortie finale existante.

L’animation du dé est déjà incluse. Les scripts des créations antérieures sont conservés à titre d’archive dans [`generated/README.md`](generated/README.md) ; ils ne doivent pas servir à ajouter de nouveaux objets ou décors en 3D au film.

Les vidéos conservent leur mouvement natif, avec les ralentis et interpolations indiqués dans `edit.json`. `depth_motion.py` applique à certains plans photographiques NASA des rotations autour des axes X/Y et une projection perspective, avec déplacement en profondeur et dérive lente. Cet effet anime des plans photographiques et ne reconstruit pas leur géométrie physique. Les quinze plans se raccordent par des fondus de **0,65 seconde** ; les citations sont composées au-dessus pour rester lisibles.

Les exports comprennent des recadrages adaptés au format, une colorimétrie modérée, les citations et leurs traductions, et le mixage musical. La durée complète des pistes vidéo et audio est contrôlée à l’export. Les deux fichiers finaux sont livrés directement dans `assets/` ; les scripts ne sont pas nécessaires pour regarder le film.
