# Séquences originales LATIN

Ces sept vidéos originales sont conservées dans le dépôt. Le montage actuel utilise le dé, la dague, la bougie et le cadran solaire. Les monolithes, le bouclier et la traversée Tycho appartiennent à une version précédente : ils ont été remplacés respectivement par Saturne, le Soleil SDO et les Piliers de la Création JWST. Le montage principal n’a pas besoin de Blender pour lire ou assembler les quatre séquences actives.

| Séquence | Citation | Fabrication |
|---|---|---|
| `dice/dice.mp4` | Alea jacta est. | Dé en ivoire, points creusés, chute et stabilisation, éclairage de studio. |
| `still-lifes/tu-quoque.mp4` | Tu quoque, mi fili ! | Dague et ombre sur une pierre claire. |
| `still-lifes/dura-lex.mp4` | Dura lex, sed lex. | Monolithes de pierre sombre. |
| `still-lifes/si-vis-pacem.mp4` | Si vis pacem, para bellum. | Bouclier de bronze. |
| `still-lifes/memento-mori.mp4` | Memento mori. | Bougie dont la flamme diminue. |
| `sundial/sundial.mp4` | Omnes vulnerant, ultima necat. | Cadran solaire avec ombre physiquement projetée et animée. |
| `starfield/star-flight.mp4` | Ad astra per ardua. | Parcours en profondeur à partir de points lumineux de la carte NASA Tycho. |

Les six scènes d’objets sont des illustrations 3D originales créées pour ce projet, sans modèle ou texture tiers. Elles ne sont pas des archives ni des reconstitutions historiques documentaires. Les poses rendues sont interpolées à 24 images/s ; les fichiers de provenance indiquent les résolutions et cadences sources. Le cadran est une illustration et n’est pas étalonné pour une latitude réelle.

La traversée stellaire réutilise les directions et couleurs échantillonnées dans la carte NASA. Les profondeurs et le déplacement de la caméra sont artistiques ; ils ne représentent pas des distances stellaires mesurées. La source et son empreinte sont indiquées dans `starfield/provenance.json` et `../source-files.json`.

## Reproduire les scènes

Les MP4 présents sont les sources vérifiées du montage livré. Pour expérimenter, copier un dossier dans `film/render/` avant de lancer ses scripts : les outils de création peuvent remplacer leurs propres images, vidéos et fichiers de provenance. La commande d’assemblage `build_film.py`, elle, refuse d’écraser un export existant.

Prérequis optionnels : Blender 4.3+, FFmpeg avec `minterpolate`, et la police DejaVu Serif pour le cadran solaire. Le chemin de police du cadran correspond à Debian/Ubuntu. Les scripts limitent leur usage du processeur à deux threads.

```sh
# Depuis une copie du dossier dice
blender -b -t 2 --python create_scene.py -- --render
python3 encode_clip.py

# Depuis une copie du dossier sundial
bash render.sh

# Depuis une copie du dossier still-lifes
blender -b -t 2 --python create_still_lifes.py -- render
python3 create_still_lifes.py encode
```

Pour la traversée stellaire, Python avec NumPy et Pillow suffit, en plus de FFmpeg. Depuis la racine du dépôt, après `python3 film/prepare_sources.py` :

```sh
python3 film/generated/starfield/render_starfield.py film/sources/tycho-stars.jpg film/render/new-star-flight.mp4
```

Ce script préserve un fichier de sortie déjà présent. Les vidéos finales du site restent dans `../../assets/` et leurs sources éditoriales dans `../edit.json`.
