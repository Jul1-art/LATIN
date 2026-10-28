<?php
// Fichier : compteur.php
// Permet de tracker le nombre de visites sur le site

header('Content-Type: application/json');
header("Access-Control-Allow-Origin: *");

// Fichier texte qui stockera le nombre de visiteurs
$fichier_compteur = 'visiteurs.txt';

// Si le fichier n'existe pas, on le crée en l'initialisant à 0
if (!file_exists($fichier_compteur)) {
    file_put_contents($fichier_compteur, '0');
}

// Lire la valeur actuelle (avec verrouillage pour éviter les conflits d'écriture simultanée)
$fp = fopen($fichier_compteur, 'c+');

if (flock($fp, LOCK_EX)) {
    $compte_actuel = (int) fread($fp, filesize($fichier_compteur) ?: 1);
    
    // Incrémenter le compteur
    $compte_actuel++;
    
    // Rembobiner le pointeur et écrire la nouvelle valeur
    rewind($fp);
    fwrite($fp, (string) $compte_actuel);
    
    // Tronquer le fichier au cas où la nouvelle chaîne est plus courte (peu probable ici)
    ftruncate($fp, ftell($fp));
    
    // Libérer le verrou
    flock($fp, LOCK_UN);
} else {
    // Fallback si on n'arrive pas à verrouiller
    $compte_actuel = (int) file_get_contents($fichier_compteur);
    $compte_actuel++;
    file_put_contents($fichier_compteur, (string) $compte_actuel);
}

fclose($fp);

// Retourne une réponse JSON (optionnelle, utile si on veut afficher le compteur plus tard)
echo json_encode([
    'success' => true,
    'total_visiteurs' => $compte_actuel,
    'message' => 'Visite enregistrée avec succès.'
]);
?>
