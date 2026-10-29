# Séquences originales LATIN

Ces sept vidéos originales sont conservées dans le dépôt. **Seul le dé est encore utilisé par le montage actuel.** La dague, la bougie et le cadran solaire ont été remplacés par le tableau de Camuccini, la nébuleuse de l’Anneau austral et une photographie d’éclipse. Les monolithes et le bouclier avaient déjà été remplacés par Saturne et le Soleil SDO. Pour « Ad astra per ardua. », la traversée Tycho, l’image des Piliers de la Création et les anciennes observations de météores NASA/MSFC ont cédé la place au time-lapse réel de la Voie lactée **Yepun to the Universe**, crédité **ESO/C. Malin (christophmalin.com)**. Ses sources et sa licence CC BY 4.0 figurent dans [`../README.md`](../README.md).

**Pour tout nouveau visuel du film, utiliser une image, une vidéo ou une œuvre existante dont la source et la licence sont documentées. Ne créer aucun nouvel objet ou décor en 3D.** L’amélioration actuelle réanime le dé déjà présent, sans ajouter de maillage, de plateau ou de lumière. Les autres scènes ci-dessous restent des archives.

| Séquence conservée | Citation de la version d’origine | Fabrication |
|---|---|---|
| `dice/dice.mp4` | Alea jacta est. | Dé en ivoire existant, points creusés, lancer, rotations, rebonds et stabilisation sur le plateau en ardoise. |
| `still-lifes/tu-quoque.mp4` | Tu quoque, mi fili ! | Dague et ombre sur une pierre claire. |
| `still-lifes/dura-lex.mp4` | Dura lex, sed lex. | Monolithes de pierre sombre. |
| `still-lifes/si-vis-pacem.mp4` | Si vis pacem, para bellum. | Bouclier de bronze. |
| `still-lifes/memento-mori.mp4` | Memento mori. | Bougie dont la flamme diminue. |
| `sundial/sundial.mp4` | Omnes vulnerant, ultima necat. | Cadran solaire avec ombre physiquement projetée et animée. |
| `starfield/star-flight.mp4` | Ad astra per ardua. | Parcours en profondeur à partir de points lumineux de la carte NASA Tycho, conservé en archive. |

## Le dé réanimé

Le dé garde son maillage en ivoire à points creusés, le plateau et les éclairages du projet. Le mouvement comprend une phase en vol, des rotations sur plusieurs axes, des contacts à **1,00, 1,72 et 2,15 secondes**, puis un balancement amorti jusqu’à **3,35 secondes**. Le dé et la caméra sont ensuite immobiles. Cette trajectoire est une animation artistique avec arcs balistiques et appui calculé sur le maillage à chaque pose, **pas une simulation Bullet**.

Le rendu est nativement en **1920 × 1080**. La trajectoire est calculée à **60 Hz** ; `--render-step 2` rend une pose sur deux pendant le mouvement, soit **30 images/s**, puis ajoute exactement la pose finale : les indices `1, 3, …, 201, 202` donnent **102 images PNG**. Les poses actives utilisent quatre échantillons EEVEE et la pose finale tenue en utilise seize. L’encodage donne **399 images à 60 images/s, soit 6,65 secondes**, par duplication de cadence et maintien de la pose finale. Il n’utilise **aucune interpolation optique**. La source 1080p est agrandie dans le film 4K ; ce n’est pas un rendu natif 4K/60.

Le fichier livré et les scripts de reproduction se trouvent dans `dice/`. `provenance.json` décrit la source et son encodage ; le rendu de travail produit aussi `motion-verification.json` avec les poses, les réglages et la garde au sol.

## Reproduire le dé et remplacer son plan

Prérequis : Blender **4.3.2 EEVEE Next**, Python 3 et FFmpeg/FFprobe avec libx264. Le film livré se lit et s’assemble sans Blender ; cet outil est nécessaire uniquement pour refaire les images du dé. Depuis la racine du dépôt, utiliser de nouveaux dossiers sous `film/render/`, qui est ignoré par Git :

```sh
mkdir -p /tmp/latin-blender-cache/mesa
XDG_CACHE_HOME=/tmp/latin-blender-cache \
MESA_SHADER_CACHE_DIR=/tmp/latin-blender-cache/mesa \
LP_NUM_THREADS=4 blender -b -t 4 \
  --python film/generated/dice/create_scene.py -- \
  --output film/render/new-dice --render
python3 film/generated/dice/encode_clip.py --output film/render/new-dice
python3 film/prepare_sources.py
python3 film/replace_dice_shot.py film/render/new-film --source film/render/new-dice/dice.mp4
```

Le script Blender accepte `--output`, `--width`, `--height`, `--samples`, `--threads` et `--render-step` ; les valeurs par défaut correspondent au rendu décrit ci-dessus. `--frames 1 61 104 130 202` permet de vérifier quelques poses avant un rendu complet. Les images, la scène et les rapports sont écrits dans le dossier de travail choisi. L’encodeur refuse de remplacer un `dice.mp4` existant sans `--overwrite`.

Le remplacement local produit `latin-intro.mp4` et `latin-intro-mobile.mp4` sans reconstruire le film entier. Il reprend les exports 4K/60 d’un commit Git épinglé, reconstruit les raccords du plan et réencode seulement les groupes d’images H.264 qui l’encadrent, soit environ douze secondes. Les images encodées et leurs horodatages hors de cette fenêtre sont conservés et vérifiés. Tous les paquets AAC de la musique restent identiques ; les citations et les autres recettes de plans sont contrôlées. Les résultats sont consignés dans `verification-landscape.json` et `verification-portrait.json`. Le script refuse d’écraser une vidéo finale existante.

## Archives des autres scènes

Les six scènes d’objets d’origine sont des illustrations 3D du projet, sans modèle ou texture tiers. Elles ne sont pas des archives historiques ni des reconstitutions documentaires. Les anciennes séquences, hors dé réanimé ci-dessus, emploient des poses interpolées à 24 images/s ; leurs fichiers de provenance indiquent les résolutions et cadences sources. Le cadran est une illustration et n’est pas étalonné pour une latitude réelle.

Les commandes suivantes concernent uniquement les archives. Copier le dossier concerné dans `film/render/` avant de les lancer, car ces scripts peuvent remplacer leurs images, vidéos et notices. Ils nécessitent Blender 4.3+, FFmpeg avec `minterpolate` et, pour le cadran, la police DejaVu Serif au chemin Debian/Ubuntu prévu. Ces anciens scripts limitent leur usage du processeur à deux threads.

```sh
# Depuis une copie du dossier sundial
bash render.sh

# Depuis une copie du dossier still-lifes
blender -b -t 2 --python create_still_lifes.py -- render
python3 create_still_lifes.py encode
```

La traversée stellaire archivée réutilise les directions et couleurs échantillonnées dans la carte NASA Tycho. Les profondeurs et le déplacement de la caméra sont artistiques ; ils ne représentent pas des distances stellaires mesurées. La source et son empreinte figurent dans `starfield/provenance.json` et `../source-files.json`. Sa reconstruction nécessite Python avec NumPy et Pillow, en plus de FFmpeg, après préparation des sources :

```sh
python3 film/generated/starfield/render_starfield.py film/sources/tycho-stars.jpg film/render/new-star-flight.mp4
```

Ce dernier script préserve une sortie déjà présente. Les vidéos finales du site restent dans `../../assets/` et leurs sources éditoriales dans `../edit.json`.
