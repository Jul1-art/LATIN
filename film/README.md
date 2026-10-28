# Film d’introduction — préparation

Le lecteur MP4, le script de montage et la musique sont préparés. Le film final n’est pas encore produit : les séquences d’archives de Rome et leurs droits doivent être vérifiés et téléchargés. Internet Archive et Wikimedia sont actuellement bloqués par la configuration réseau de l’environnement.

Ces fichiers ne sont pas chargés par le site. L’introduction actuelle reste active jusqu’à l’intégration du véritable film.

## Contenu

- `intro-player.js` : lecteur plein écran pour un MP4 réel, avec lecture silencieuse automatique, activation du son, pause, relecture, crédits et sortie à la fin du film. Le clavier, la réduction des mouvements et les erreurs de chargement sont pris en charge.
- `build_film.py` : export H.264/AAC, 1280 × 720 à 24 images/s, recadrage, fondus entre plans, titres et mixage musical. Le rendu a été vérifié avec des mires internes ; aucun de ces médias de test n’est inclus ici.
- `music/adventure.mp3` : « Adventure », Rafael Krux / CinematicWaves.com, collection FreePD Music. Licence CC0 ; provenance et empreinte SHA-256 dans `music/provenance.json`, texte de licence dans `music/LICENSE.txt`.

Le lecteur a été vérifié dans Chromium avec un MP4 de test : lecture au-delà de six secondes, son activable, pause, fin automatique, relecture, clavier et retour propre en cas de média manquant.

## Terminer le montage

1. Activer les accès réseau préparés dans l’environnement : `archive.org`, `*.archive.org`, `commons.wikimedia.org`, `upload.wikimedia.org`.
2. Sélectionner des vidéos d’archives réellement réutilisables. Pour chaque extrait, conserver l’auteur, la source, la licence ou preuve de domaine public, les timecodes et les modifications.
3. Compléter une copie de `manifest.example.json`. Exécuter depuis la racine du dépôt, avec Python 3, FFmpeg (libx264, AAC, drawtext, xfade, libwebp) et Fontconfig :

   ```sh
   python3 film/build_film.py film/manifest.json /tmp/latin-film-export
   ```

   Le script refuse de produire un film sans au moins trois extraits et leurs métadonnées de provenance. Il refuse aussi d’écraser une sortie existante.

4. Vérifier le véritable montage et les crédits, puis copier le MP4 et son affiche dans `assets/latin-intro.mp4` et `assets/latin-intro-poster.webp`.
5. Préparer `media-credits.html`, remplacer `intro.js` par le lecteur préparé et actualiser la version des assets dans `index.html`. Le lecteur conserve les événements `latin:intro-reveal` et `latin:intro-finished` utilisés par `motion.js`.
6. Vérifier le fichier final sur ordinateur et mobile avant publication.
