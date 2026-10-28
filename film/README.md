# LATIN — le film

Montage de **1 min 45 s**, en quinze plans, réunissant les **treize citations du site**, leurs traductions françaises et leurs auteurs. Deux exports partagent le même montage et la même bande-son :

- `assets/latin-intro.mp4` : paysage, 1280 × 720, H.264/AAC, 24 images/s.
- `assets/latin-intro-mobile.mp4` : vertical, 720 × 1280, mêmes durée et bande-son.

## Lecteur

Un écran noir avec un triangle central précède la lecture. Le clic sur « Lancer le film » démarre la vidéo **avec le son activé**, conformément aux règles des navigateurs. Les commandes permettent la lecture/pause, l’arrêt, la reprise depuis le début, le déplacement dans la vidéo, le réglage du volume, la coupure du son, le plein écran et la fermeture.

Le menu propose les vitesses 0,75×, 1×, 1,25× et 1,5× ainsi qu’un accès direct aux treize citations. Sur mobile, l’arrêt et la reprise depuis le début se trouvent dans les réglages. La fin du film propose une relecture ou le retour au site. La préférence de réduction des animations évite l’ouverture automatique du lecteur.

## Images et musique

Le film associe des **photographies et reproductions artistiques animées par recadrage et zoom**, de vraies séquences filmées de nature, et une visualisation NASA :

- Colisée : photographie de Klaus Berdiin Jensen, déclarée dans le domaine public par la notice du miroir utilisé.
- Colonne dorique des Propylées, à Athènes : photographie de Jebulon, CC0.
- Décor de Pompéi : reproduction de Geremia Discanno datée de 1882, domaine public.
- *L’École d’Athènes* de Raphaël (1509–1511) et *La Naissance de Vénus* de Botticelli (1485) : reproductions d’œuvres du domaine public.
- Portrait de marbre : illustration originale générée par IA pour LATIN ; elle ne documente pas une sculpture antique réelle.
- Fleur : vidéo de la collection officielle MDN Interactive Examples, CC0.
- Vagues et champ de blé : vidéos déclarées dans le domaine public par le README du miroir `tanersener/ffmpeg-video-slideshow-scripts` ; elles ne sont pas présentées comme des fichiers CC0 vérifiés auprès de Pixabay.
- Terre et Nil la nuit : visualisation NASA Goddard de 2017. Seules les premières 6,464 secondes du fichier miroir sont utilisées, exclusivement issues du média NASA. Aucun plan urbain de New York n’est repris.

Les photographies et œuvres sont identifiées avec leurs lieux et dates réels : Athènes et les œuvres de la Renaissance ne sont pas présentées comme des archives filmées de Rome.

Musique : **Adventure**, Rafael Krux / CinematicWaves.com, collection FreePD Music, CC0. La piste est prolongée par un fondu croisé de quatre secondes, puis normalisée et fondue en entrée/sortie. Licence et provenance dans `music/`. Les sons des vidéos sources et la musique du montage miroir sont retirés.

Les auteurs, liens et licences sont détaillés dans [la page des crédits](../media-credits.html). Les déclarations de licence ont été inspectées dans les dépôts GitHub épinglés. Les pages originales Wikimedia, Flickr, Pixabay et NASA sont fournies en référence ; elles n’ont pas toutes été directement consultées depuis cet environnement.

## Reproduire le montage

Prérequis : Python 3.11+, FFmpeg avec libx264/AAC/libwebp/drawtext/zoompan/xfade/acrossfade et Fontconfig avec Liberation Sans/Serif. Les fichiers sources sont téléchargés depuis des commits GitHub précis ; leurs empreintes SHA-256 sont vérifiées avant utilisation.

Depuis la racine du dépôt :

```sh
python3 film/prepare_sources.py
python3 film/build_film.py film/edit.json film/render/landscape
python3 film/build_film.py film/edit.json film/render/portrait --portrait
```

`source-files.json` fixe les URL, les empreintes et les notices de licence. `edit.json` documente les quinze plans, leurs extraits, les ralentis, les animations d’images, les titres et la musique. `chapters.json` contient les treize citations et les repères de navigation du lecteur. Les sources brutes et exports de travail sont ignorés par Git. Le script refuse d’écraser une sortie existante.

Les exports comprennent des recadrages adaptés au format, des mouvements lents sur les images fixes, une colorimétrie modérée, des fondus entre les plans, les citations et leurs traductions, et le mixage musical. Les deux fichiers finaux sont livrés directement dans `assets/` ; les scripts ne sont pas nécessaires pour regarder le film.
