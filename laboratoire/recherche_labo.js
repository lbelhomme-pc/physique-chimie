document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('sim-search-input');
    const checkboxes = document.querySelectorAll('.sidebar-filters input[type="checkbox"]');
    const cards = document.querySelectorAll('.sim-card');
    const noResultsMsg = document.getElementById('no-results');

    // 1. MOTEUR DE FILTRAGE
    function filtrerLaboratoire() {
        const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';
        
        // On récupère dynamiquement tout ce qui a la classe "filter-niveau" ou "filter-sujet"
        const niveauxCoches = Array.from(document.querySelectorAll('.filter-niveau:checked')).map(cb => cb.value.toLowerCase());
        const sujetsCoches = Array.from(document.querySelectorAll('.filter-sujet:checked')).map(cb => cb.value.toLowerCase());

        let simulationsVisibles = 0;

        cards.forEach(card => {
            const title = card.querySelector('.sim-title').textContent.toLowerCase();
            const desc = card.querySelector('.sim-desc').textContent.toLowerCase();
            
            const cardSujets = (card.getAttribute('data-sujets') || '').toLowerCase();
            const cardNiveaux = (card.getAttribute('data-niveaux') || '').toLowerCase();

            // VÉRIFICATION 1 : Texte
            const matchTexte = title.includes(searchTerm) || desc.includes(searchTerm);

            // VÉRIFICATION 2 : Sujets (Physique, Chimie ET Sous-catégories)
            // Si rien n'est coché, c'est true. Sinon on regarde si une des cases cochées est dans le data-sujets.
            const matchSujet = sujetsCoches.length === 0 || sujetsCoches.some(s => cardSujets.includes(s));

            // VÉRIFICATION 3 : Niveaux (Collège, Lycée)
            const matchNiveau = niveauxCoches.length === 0 || niveauxCoches.some(n => cardNiveaux.includes(n));

            // Si tout est bon, on affiche
            if (matchTexte && matchSujet && matchNiveau) {
                card.style.display = 'flex'; 
                simulationsVisibles++;
            } else {
                card.style.display = 'none'; 
            }
        });

        // Affichage du message d'erreur
        if (noResultsMsg) {
            if (simulationsVisibles === 0) {
                noResultsMsg.classList.remove('hidden');
            } else {
                noResultsMsg.classList.add('hidden');
            }
        }
    }

    // 2. ÉCOUTEURS D'ÉVÉNEMENTS
    if(searchInput) {
        searchInput.addEventListener('input', filtrerLaboratoire);
    }
    
    checkboxes.forEach(cb => cb.addEventListener('change', filtrerLaboratoire));

    // 3. BONUS UX : Synchronisation Parents / Enfants
    const parentCbs = document.querySelectorAll('.parent-cb');
    parentCbs.forEach(parent => {
        parent.addEventListener('change', (e) => {
            // Si on coche/décoche le parent (ex: Physique), on fait pareil pour ses enfants
            const children = e.target.closest('label').nextElementSibling.querySelectorAll('.child-cb');
            children.forEach(child => child.checked = e.target.checked);
            filtrerLaboratoire();
        });
    });

    const childCbs = document.querySelectorAll('.child-cb');
    childCbs.forEach(child => {
        child.addEventListener('change', (e) => {
            // Si on décoche un enfant, on décoche le parent automatiquement
            const parent = e.target.closest('.sub-filters').previousElementSibling.querySelector('.parent-cb');
            if (!e.target.checked) parent.checked = false;
            filtrerLaboratoire();
        });
    });

    // Lancement initial
    filtrerLaboratoire();
});