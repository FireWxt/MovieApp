export function moviePopup(movie) {
    // Supprime une popup existante
    const oldPopup = document.getElementById('movie-popup');
    if (oldPopup) oldPopup.remove();

    // Overlay avec fond transparent et flou
    const overlay = document.createElement('div');
    overlay.id = 'movie-popup';
    overlay.style.position = 'fixed';
    overlay.style.top = 0;
    overlay.style.left = 0;
    overlay.style.width = '100vw';
    overlay.style.height = '100vh';
    overlay.style.background = 'rgba(0,0,0,0.7)';
    overlay.style.backdropFilter = 'blur(4px)';
    overlay.style.display = 'flex';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.zIndex = 1000;

    // Popup centrale en flex
    const popup = document.createElement('div');
    popup.style.background = 'rgba(35,35,35,0.95)';
    popup.style.color = '#fff';
    popup.style.padding = '0';
    popup.style.borderRadius = '18px';
    popup.style.maxWidth = '700px';
    popup.style.width = '95%';
    popup.style.boxShadow = '0 8px 32px rgba(0,0,0,0.7)';
    popup.style.position = 'relative';
    popup.style.display = 'flex';
    popup.style.overflow = 'hidden';
    popup.style.flexDirection = 'row';

    // Image à gauche
    const img = document.createElement('img');
    img.src = movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : 'https://via.placeholder.com/220x330?text=No+Image';
    img.alt = movie.title || movie.name || "Titre inconnu";
    img.style.width = '220px';
    img.style.height = '330px';
    img.style.objectFit = 'cover';
    img.style.borderRadius = '18px 0 0 18px';
    img.style.flexShrink = '0';
    img.style.background = '#111';

    // Contenu à droite
    const content = document.createElement('div');
    content.style.padding = '32px 28px';
    content.style.display = 'flex';
    content.style.flexDirection = 'column';
    content.style.justifyContent = 'center';
    content.style.alignItems = 'flex-start';
    content.style.flex = '1';

    // Titre
    const title = document.createElement('h2');
    title.textContent = movie.title || movie.name || "Titre inconnu";
    title.style.margin = '0 0 18px 0';
    title.style.fontSize = '1.5rem';
    title.style.color = '#fff';

    // Description
    const desc = document.createElement('p');
    desc.textContent = movie.overview || "Aucune description disponible.";
    desc.style.fontSize = '1rem';
    desc.style.color = '#ccc';
    desc.style.marginBottom = '24px';
    desc.style.lineHeight = '1.5';

    const closeBtn = document.createElement('button');
    closeBtn.textContent = "Fermer";
    closeBtn.style.background = '#e50914';
    closeBtn.style.color = '#fff';
    closeBtn.style.border = 'none';
    closeBtn.style.padding = '10px 28px';
    closeBtn.style.borderRadius = '20px';
    closeBtn.style.cursor = 'pointer';
    closeBtn.style.fontWeight = '600';
    closeBtn.style.alignSelf = 'flex-end';
    closeBtn.onclick = () => overlay.remove();


    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    const isFavorite = favorites.some(fav => fav.id === movie.id);

    let favBtn;
    if (!isFavorite) {  
        favBtn = document.createElement('button');
        favBtn.textContent = "Ajouter aux favoris";
        favBtn.style.background = '#e50914';
        favBtn.style.color = '#fff';
        favBtn.style.border = 'none';
        favBtn.style.padding = '10px 28px';
        favBtn.style.borderRadius = '20px';
        favBtn.onclick = () => {
            addToFavorites(movie);
            overlay.remove();
        }
    } else {
        favBtn = document.createElement('button');
        favBtn.textContent = "Retirer des favoris";
        favBtn.style.background = '#e50914';
        favBtn.style.color = '#fff';
        favBtn.style.border = 'none';
        favBtn.style.padding = '10px 28px';
        favBtn.style.borderRadius = '20px';
        favBtn.onclick = () => {
            removeFromFavorites(movie.id);
            overlay.remove();
        }
    }

    content.appendChild(title);
    content.appendChild(desc);
    content.appendChild(closeBtn);
    content.appendChild(favBtn);

    popup.appendChild(img);
    popup.appendChild(content);
    overlay.appendChild(popup);
    document.body.appendChild(overlay);

    // --- RESPONSIVE ---
    const style = document.createElement('style');
    style.textContent = `
    @media (max-width: 600px) {
      #movie-popup > div {
        flex-direction: column !important;
        max-width: 95vw !important;
        width: 98vw !important;
        min-width: 0 !important;
      }
      #movie-popup img {
        width: 100% !important;
        height: 200px !important;
        border-radius: 18px 18px 0 0 !important;
      }
      #movie-popup > div > div {
        padding: 18px 12px !important;
      }
    }
    `;
    document.head.appendChild(style);
}

function addToFavorites(movie) {
    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    if (!favorites.some(fav => fav.id === movie.id)) {
        favorites.push(movie);
        localStorage.setItem('favorites', JSON.stringify(favorites));
        console.log(`${movie.title || movie.name} a été ajouté à vos favoris !`);
    } else {
        console.log(`${movie.title || movie.name} est déjà dans vos favoris.`);
    }
}


function removeFromFavorites(movieId) {
    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    favorites = favorites.filter(movie => movie.id !== movieId);
    localStorage.setItem('favorites', JSON.stringify(favorites));
    console.log("Film retiré de vos favoris.");
}