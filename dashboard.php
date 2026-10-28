<?php
// dashboard.php - Interface d'administration pour afficher les statistiques

$fichier_compteur = 'visiteurs.txt';
$compte = 0;

if (file_exists($fichier_compteur)) {
    $compte = (int) file_get_contents($fichier_compteur);
}

// Extraction du <head> de index.html pour hériter exactement de la configuration Tailwind et des polices
$index_path = __DIR__ . '/index.html';
$head_content = "";
if (file_exists($index_path)) {
    $index_content = file_get_contents($index_path);
    if (preg_match('/<head>(.*?)<\/head>/s', $index_content, $matches)) {
        // Supprime la balise titre originale pour injecter la nôtre
        $head_content = preg_replace('/<title>.*?<\/title>/s', '', $matches[1]);
    }
}
?>
<!DOCTYPE html>
<html class="dark" lang="fr">
<head>
    <meta charset="utf-8">
    <meta content="width=device-width, initial-scale=1.0" name="viewport">
    <title>Dashboard - SENTENTIAE</title>
    <?php echo $head_content; ?>
</head>

<body id="theme-body" class="bg-surface-dim text-on-surface h-screen w-screen flex flex-col antialiased overflow-hidden transition-colors duration-500">
    
    <!-- Background Ambient & Particules -->
    <div class="fixed inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(181,154,69,0.04)_0%,_transparent_70%)] pointer-events-none z-0"></div>

    <!-- Topbar minimaliste -->
    <header class="flex fixed top-0 left-0 right-0 z-40 h-14 bg-stone-900/95 backdrop-blur-md border-b border-stone-800 shadow-[0_4px_20px_rgba(0,0,0,0.5)] items-center px-6 transition-transform duration-500">
        <div class="flex-1 flex items-center gap-3">
            <i class="fas fa-scroll text-[#b59a45] text-base opacity-80"></i>
            <span class="font-headline-md chiseled-text uppercase tracking-[0.2em] text-stone-200 text-sm font-bold">LATIN</span>
            <span class="text-[#b59a45]/40 text-[9px] font-label-caps tracking-widest">— Dashboard</span>
        </div>
        <div class="flex-1 flex items-center justify-end gap-2">
            <a href="index.html" class="flex flex-col items-center gap-1 px-3 py-1 text-stone-500 hover:text-stone-300 rounded-md transition-all group">
                <span class="material-symbols-outlined text-sm group-hover:-translate-x-1 transition-transform">arrow_back</span>
                <span class="text-[8px] font-label-caps tracking-[0.2em] uppercase">Retour au site</span>
            </a>
        </div>
    </header>

    <!-- Contenu Principal -->
    <main class="flex-1 flex flex-col items-center justify-center p-6 relative z-10">
        
        <div class="rounded-[2rem] border border-[#b59a45]/20 bg-[#16140c]/80 backdrop-blur-xl p-12 md:p-24 flex flex-col items-center justify-center relative overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] text-center group transition-all duration-700 hover:border-[#b59a45]/40 hover:shadow-[0_20px_60px_rgba(181,154,69,0.1)] w-full max-w-2xl">
            
            <!-- Ornements de carte (Angles) -->
            <div class="absolute top-6 left-6 w-8 h-px bg-[#b59a45]/30"></div>
            <div class="absolute top-6 left-6 w-px h-8 bg-[#b59a45]/30"></div>
            <div class="absolute bottom-6 right-6 w-8 h-px bg-[#b59a45]/30"></div>
            <div class="absolute bottom-6 right-6 w-px h-8 bg-[#b59a45]/30"></div>
            
            <!-- Filigrane d'arrière-plan -->
            <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[20rem] font-headline-display text-[#b59a45] opacity-[0.02] group-hover:scale-105 transition-all duration-1000 select-none">V</div>

            <!-- Header carte -->
            <span class="inline-block font-label-caps text-[#b59a45]/60 tracking-[0.6em] text-[10px] md:text-xs uppercase mb-10 border-b border-[#b59a45]/20 pb-2 relative z-10">
                Statistiques Globales
            </span>
            
            <!-- Compteur -->
            <h2 class="font-headline-display chiseled-text text-[#d4af37] text-6xl md:text-[7rem] tracking-widest leading-none drop-shadow-[0_0_30px_rgba(212,175,55,0.2)] mb-6 group-hover:scale-105 transition-transform duration-700 relative z-10">
                <?php echo number_format($compte, 0, ',', ' '); ?>
            </h2>
            
            <!-- Séparateur -->
            <div class="flex items-center gap-3 w-40 opacity-60 my-6 relative z-10">
                <div class="flex-1 h-px bg-gradient-to-r from-transparent to-[#b59a45]"></div>
                <div class="w-1.5 h-1.5 rotate-45 bg-[#b59a45]"></div>
                <div class="flex-1 h-px bg-gradient-to-l from-transparent to-[#b59a45]"></div>
            </div>

            <!-- Sous-titre -->
            <p class="font-serif text-on-surface-variant text-lg md:text-xl italic relative z-10">
                « <span class="text-[#b59a45]/80">Visiteurs uniques enregistrés</span> »
            </p>
        </div>

    </main>

</body>
</html>
