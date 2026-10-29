# LATIN — le film

Montage de **1 min 45 s**, en quinze plans, réunissant les **treize citations du site**, leurs traductions françaises et leurs auteurs. Chaque citation possède son propre sujet visuel : vidéos de nature, scènes d’objets originales en 3D, photographies NASA et traversée stellaire interprétée. La Terre accompagne les titres d’ouverture et de fin. Deux exports partagent le même montage et la même bande-son :

- `assets/latin-intro.mp4` : paysage, 1280 × 720, H.264/AAC, 24 images/s.
- `assets/latin-intro-mobile.mp4` : vertical, 720 × 1280, mêmes durée et bande-son.

## Règles éditoriales à conserver

- Conserver **à l’identique les treize citations latines, leurs traductions françaises et leurs auteurs**, dans `edit.json` et `chapters.json`.
- Réserver **l’empreinte Apollo à « Veni, vidi, vici. »**, avec une seule apparition dans le film.
- Réserver **la vidéo de fleur à « Carpe diem. »**, avec une seule apparition dans le film.
- Réserver **la Terre aux titres « LATIN. » d’ouverture et de fin**.
- Maintenir un sujet distinct pour chaque citation et identifier les créations originales comme telles dans les crédits.

Ces règles s’appliquent aussi aux futurs changements d’images, de recadrage ou de format.

## Lecteur

Un écran noir avec un triangle central précède la lecture. Le clic sur « Lancer le film » démarre la vidéo **avec le son activé et le volume du lecteur à 100 %**, conformément aux règles des navigateurs. Les commandes permettent la lecture/pause, le déplacement dans la vidéo, le réglage du volume, la coupure du son, le plein écran et la fermeture.

Les paramètres proposent les vitesses 0,75×, 1×, 1,25× et 1,5× ainsi qu’un accès direct aux treize citations. **Les chapitres sont uniquement accessibles dans les paramètres.** Les commandes d’arrêt et de reprise depuis le début ont été retirées. La fin du film conserve une proposition de relecture ou de retour au site. La préférence de réduction des animations évite l’ouverture automatique du lecteur.

## Les treize sujets

| Citation | Sujet du plan |
| --- | --- |
| Ave ! | Rouge-gorge, vidéo de nature |
| Tu quoque, mi fili ! | Dague et ombre sur pierre, création 3D |
| Alea jacta est. | Dé qui tombe et s’immobilise, création 3D |
| Veni, vidi, vici. | Empreinte Apollo, photographie NASA mise en mouvement |
| Dura lex, sed lex. | Monolithes de pierre sombre, création 3D |
| Si vis pacem, para bellum. | Bouclier de bronze, création 3D |
| Mens sana in corpore sano. | Épis de blé dans le vent, vidéo de nature |
| Errare humanum est, perseverare diabolicum. | Ruisseau qui contourne les obstacles, vidéo de nature |
| Memento mori. | Bougie dont la flamme s’amenuise, création 3D |
| Omnes vulnerant, ultima necat. | Cadran solaire et ombre mobile, création 3D |
| Carpe diem. | Fleur, vidéo de nature |
| Audacibus fortuna juvat. | Vagues et horizon, vidéo de nature |
| Ad astra per ardua. | Traversée stellaire originale fondée sur la carte NASA Tycho |

## Sources et créations originales

Les photographies **Earth (B)** et **Moon — Apollo Astronaut Bootprint**, ainsi que la **Tycho Star Map**, proviennent de la collection officielle `nasa/NASA-3D-Resources`, fixée au commit `11ebb4ee043715aefbba6aeec8a61746fad67fa7`. Son README déclare explicitement : **“These assets are free and without copyright.”** Cette déclaration concerne les ressources de la collection. Le README et les images utilisés ont été inspectés. Les directives NASA figurent dans les crédits comme référence ; leur page externe n’a pas été directement consultée depuis cet environnement.

Les vidéos **Robin Bird**, **Wheat Field** et **Waves** proviennent du dépôt miroir `tanersener/ffmpeg-video-slideshow-scripts`, fixé au commit `91d766eb231566215f66204a34bcc2b7221c2648`. Son README nomme ces trois vidéos et les déclare dans le domaine public, séparément de la licence du logiciel. Les pages primaires Pixabay n’ont pas été directement consultées ; les notices conservent cette distinction. Les vidéos **flower** et **stream-of-water** sont distribuées par MDN, au commit `13024db581b08fae11a0ca229497198b9b0534e7`, sous **CC0-1.0**.

Les **six scènes d’objets en 3D** — dague, dé, monolithes, bouclier, bougie et cadran solaire — sont des animations originales créées pour LATIN avec Blender. Leurs formes, matériaux, lumières et mouvements sont générés par les scripts du projet. Elles sont créditées comme créations originales, et non comme images d’archives ou reproductions d’objets historiques identifiés.

La **traversée stellaire** est une visualisation originale produite en Python à partir des directions et couleurs échantillonnées dans la carte NASA Tycho. Les profondeurs attribuées aux étoiles, le déplacement de la caméra et les effets optiques sont artistiques. Le plan ne représente ni des distances stellaires mesurées ni un enregistrement de voyage spatial. Sa provenance est détaillée dans `generated/starfield/provenance.json`.

Les vidéos générées, leurs scripts et leurs notices de provenance sont versionnés dans [`generated/`](generated/README.md). Les auteurs, liens et licences de l’ensemble des médias figurent dans [la page des crédits](../media-credits.html) et dans `source-files.json`.

## Musique

**Adventure**, Rafael Krux / CinematicWaves.com, collection FreePD Music, **CC0**. La piste est prolongée par un fondu croisé de quatre secondes, puis normalisée et fondue en entrée/sortie pour couvrir les **105 secondes complètes**. Le son des vidéos sources n’est pas utilisé. La musique et sa licence ont été inspectées dans le dépôt GitHub épinglé indiqué dans `music/provenance.json`.

## Reproduire le montage

L’assemblage principal nécessite **Python 3.11+ et sa bibliothèque standard**, FFmpeg/FFprobe avec libx264, AAC, libwebp et les filtres drawtext, zoompan, perspective, xfade, acrossfade, minterpolate et vignette, ainsi que Fontconfig avec Liberation Sans/Serif. Les vidéos générées sont déjà incluses dans `generated/` : **Blender, NumPy et Pillow ne sont pas nécessaires pour assembler le film**. Les sources externes sont téléchargées depuis des commits GitHub précis ; leurs empreintes SHA-256 sont vérifiées avant utilisation.

Depuis la racine du dépôt :

```sh
python3 film/prepare_sources.py
python3 film/build_film.py film/edit.json film/render/landscape
python3 film/build_film.py film/edit.json film/render/portrait --portrait
```

`source-files.json` fixe les URL, les empreintes et les notices de licence des ressources externes. `edit.json` documente les quinze plans, leurs extraits, les ralentis, les mouvements, les titres et la musique. `chapters.json` contient les treize citations et les repères de navigation du lecteur. Les sources téléchargées et exports de travail sont ignorés par Git ; les vidéos originales générées et leurs scripts sont versionnés. `build_film.py` refuse d’écraser une sortie finale existante.

La régénération des six scènes d’objets est facultative et nécessite **Blender** ; celle de la traversée stellaire nécessite **NumPy, Pillow et FFmpeg**. Les commandes et dépendances propres à chaque création sont décrites dans [`generated/README.md`](generated/README.md).

Les vidéos conservent leur mouvement natif, avec les ralentis et interpolations indiqués dans `edit.json`. `depth_motion.py` applique aux photographies NASA des rotations autour des axes X/Y et une projection perspective, avec déplacement en profondeur et dérive lente. Cet effet anime des plans photographiques et ne reconstruit pas leur géométrie physique. Les quinze plans se raccordent par des fondus de **0,65 seconde** ; les citations sont composées au-dessus pour rester lisibles.

Les exports comprennent des recadrages adaptés au format, une colorimétrie modérée, les citations et leurs traductions, et le mixage musical. La durée complète des pistes vidéo et audio est contrôlée à l’export. Les deux fichiers finaux sont livrés directement dans `assets/` ; les scripts ne sont pas nécessaires pour regarder le film.
