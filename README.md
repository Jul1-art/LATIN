# LATIN

Site de découverte des citations latines et film d’introduction.

## Développement

Avec Node.js installé, depuis la racine du dépôt :

```sh
node scripts/serve.cjs
```

Le serveur utilise le port 8000 et prend en charge HTTP Range, nécessaire pour avancer et reculer dans les vidéos. `LATIN_PORT` et `LATIN_HOST` permettent de changer le port et l’interface réseau. Ce serveur est destiné aux fichiers statiques ; les statistiques PHP nécessitent un serveur PHP séparé.

Le film, ses sources, ses crédits et les commandes de reconstruction sont documentés dans [film/README.md](film/README.md).
