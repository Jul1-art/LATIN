# LATIN — le film

Montage de **1 min 45 s**, en quinze plans, réunissant les **treize citations du site**, leurs traductions françaises et leurs auteurs. Les images proviennent exclusivement de ressources NASA : Terre, Lune, surface lunaire et cartes stellaires. Deux exports partagent le même montage et la même bande-son :

- `assets/latin-intro.mp4` : paysage, 1280 × 720, H.264/AAC, 24 images/s.
- `assets/latin-intro-mobile.mp4` : vertical, 720 × 1280, mêmes durée et bande-son.

## Lecteur

Un écran noir avec un triangle central précède la lecture. Le clic sur « Lancer le film » démarre la vidéo **avec le son activé et le volume du lecteur à 100 %**, conformément aux règles des navigateurs. Les commandes permettent la lecture/pause, le déplacement dans la vidéo, le réglage du volume, la coupure du son, le plein écran et la fermeture.

Les paramètres proposent les vitesses 0,75×, 1×, 1,25× et 1,5× ainsi qu’un accès direct aux treize citations. **Les chapitres sont uniquement accessibles dans les paramètres.** Les commandes d’arrêt et de reprise depuis le début ont été retirées. La fin du film conserve une proposition de relecture ou de retour au site. La préférence de réduction des animations évite l’ouverture automatique du lecteur.

## Images NASA

Le film associe des **images fixes NASA mises en mouvement** et des **extraits vidéo d’une visualisation satellitaire NASA Goddard** :

- **Earth (B)** : image de la Terre sur fond noir, distribuée par la collection officielle `nasa/NASA-3D-Resources`.
- **Moon** : disque lunaire complet ; il s’agit d’une image de la Lune, pas d’une carte équirectangulaire.
- **Moon — Apollo Crater** et **Moon — Apollo Astronaut Bootprint** : cratère lunaire et photographie d’une empreinte d’astronaute sur le sol lunaire, issus de la même collection. La notice du dossier n’indique pas de mission plus précise pour le cratère.
- **Hipparcos Star Map** et **Tycho Star Map** : cartes scientifiques du ciel fondées sur ces catalogues stellaires, distribuées par la collection NASA. Elles représentent des données astronomiques ; ce ne sont pas des photographies Hubble de nébuleuses.
- **Lights of Human Activity Shine in NASA’s Image of Earth at Night** : visualisation NASA Goddard de 2017 de l’éclairage terrestre à partir d’images satellitaires. Les extraits utilisés restent dans les premières 6,5 secondes du fichier miroir, exclusivement consacrées à ce média NASA.

Les images de la collection officielle sont fixées au commit `11ebb4ee043715aefbba6aeec8a61746fad67fa7`. Son README déclare explicitement : **“These assets are free and without copyright.”** Cette déclaration concerne les ressources de la collection. Le README officiel et les images ont été inspectés. Les directives de réutilisation NASA sont indiquées dans les crédits ; leur page externe n’a pas été directement consultée depuis cet environnement.

## Musique

**Adventure**, Rafael Krux / CinematicWaves.com, collection FreePD Music, **CC0**. La piste est prolongée par un fondu croisé de quatre secondes, puis normalisée et fondue en entrée/sortie pour accompagner les 105 secondes du film. Licence et provenance dans `music/`. Le son des vidéos sources n’est pas utilisé.

Les auteurs, liens et licences sont détaillés dans [la page des crédits](../media-credits.html). Les déclarations de provenance de la vidéo NASA et la licence musicale ont été inspectées dans les dépôts GitHub épinglés cités.

## Reproduire le montage

Prérequis : Python 3.11+ avec sa bibliothèque standard, FFmpeg avec libx264/AAC/libwebp/drawtext/zoompan/perspective/xfade/acrossfade et Fontconfig avec Liberation Sans/Serif. Aucune dépendance Python supplémentaire ni installation de Blender n’est nécessaire. Les fichiers sources sont téléchargés depuis des commits GitHub précis ; leurs empreintes SHA-256 sont vérifiées avant utilisation.

Depuis la racine du dépôt :

```sh
python3 film/prepare_sources.py
python3 film/build_film.py film/edit.json film/render/landscape
python3 film/build_film.py film/edit.json film/render/portrait --portrait
```

`source-files.json` fixe les URL, les empreintes et les notices de licence. `edit.json` documente les quinze plans, leurs extraits, les ralentis, les mouvements, les titres et la musique. `chapters.json` contient les treize citations et les repères de navigation du lecteur. Les sources brutes et exports de travail sont ignorés par Git. Le script refuse d’écraser une sortie existante.

`depth_motion.py` applique aux plans des rotations autour des axes X/Y et une projection perspective, avec déplacement en profondeur et dérive lente. Les plans se raccordent par des fondus de **0,65 seconde**. Cet effet projette des surfaces vidéo ou photographiques ; il ne reconstruit pas la géométrie physique des scènes NASA. Les citations sont composées au-dessus de ces mouvements pour rester lisibles.

Les exports comprennent des recadrages adaptés au format, une colorimétrie modérée, les citations et leurs traductions, et le mixage musical. La durée complète des pistes vidéo et audio est contrôlée à l’export. Les deux fichiers finaux sont livrés directement dans `assets/` ; les scripts ne sont pas nécessaires pour regarder le film.
