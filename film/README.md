# LATIN — le film

Montage de **20,6 secondes**, intégré à l’introduction du site, avec une bande musicale et deux exports :

- `assets/latin-intro.mp4` : paysage, 1280 × 720, H.264/AAC, 24 images/s.
- `assets/latin-intro-mobile.mp4` : vertical, 720 × 1280, mêmes durée et bande-son.

Le lecteur démarre sans son pour respecter les règles des navigateurs. « Activer le son » lance la bande musicale après une action de l’utilisateur. Pause, relecture, crédits, fin automatique et bouton « Passer » sont disponibles. La préférence de réduction des animations désactive le lancement automatique.

## Images et musique

Les séquences d’archives montrent **New York en 1941**, jamais présentée comme Rome. Les images de la Terre la nuit sont une **visualisation NASA**. Elles accompagnent les idées des citations latines, avec deux séquences de nature issues de la collection CC0 de MDN.

Les extraits d’archives proviennent d’un fichier réellement hébergé sur GitHub, dont les notices citent *Arteries of New York City* (Encyclopaedia Britannica Films / Prelinger Archives) et NASA Goddard. Leurs statuts de réutilisation sont documentés dans les notices de ce miroir ; les pages originales d’Internet Archive n’ont pas été directement consultées depuis cet environnement.

Musique : **Adventure**, Rafael Krux / CinematicWaves.com, collection FreePD Music, CC0. Licence et provenance dans `music/`.

Tous les auteurs, liens, licences et transformations sont détaillés dans [la page des crédits](../media-credits.html). Aucun son des vidéos sources ni la musique du montage miroir n’est utilisé.

## Reproduire le montage

Prérequis : Python 3.11+, FFmpeg avec libx264/AAC/libwebp/drawtext/xfade et Fontconfig avec Liberation Sans/Serif. Les sources sont téléchargées depuis leurs fichiers GitHub publics, à des commits précis ; leurs empreintes SHA-256 sont vérifiées avant utilisation.

Depuis la racine du dépôt :

```sh
python3 film/prepare_sources.py
python3 film/build_film.py film/edit.json film/render/landscape
python3 film/build_film.py film/edit.json film/render/portrait --portrait
```

`source-files.json` fixe les URL et les empreintes. `edit.json` documente les plans, leurs timecodes, les ralentis, les titres et la musique. Les sources brutes et exports de travail sont ignorés par Git. Le script refuse d’écraser une sortie existante.

L’export comprend un triptyque d’archives, un recadrage adapté au format, des ralentis documentés, une colorimétrie modérée, des fondus, les titres et un mixage musical normalisé avec fondu d’entrée/sortie. Les deux fichiers finaux sont livrés directement dans `assets/` ; les scripts ne sont pas nécessaires pour regarder le film.
