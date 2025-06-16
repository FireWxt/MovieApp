export function moviePopup(movie, credits) {
    const oldPopup = document.getElementById('movie-popup');
    if (oldPopup) oldPopup.remove();

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

    const popup = document.createElement('div');
    popup.style.background = 'rgba(35,35,35,0.95)';
    popup.style.color = '#fff';
    popup.style.padding = '0';
    popup.style.borderRadius = '9px';
    popup.style.maxWidth = '800px';
    popup.style.width = '95%';
    popup.style.maxHeight = '95vh';
    popup.style.overflow = 'hidden';
    popup.style.boxShadow = '0 8px 32px rgba(0,0,0,0.7)';
    popup.style.position = 'relative';
    popup.style.display = 'flex';
    popup.style.flexDirection = 'row';


    const img = document.createElement('img');
    img.src = movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : 'https://via.placeholder.com/220x330?text=No+Image';
    img.alt = movie.title || movie.name || "Titre inconnu";
    img.style.width = '220px';
    img.style.height = '330px';
    img.style.objectFit = 'cover';
    img.style.borderRadius = '18px 0 0 18px';
    img.style.flexShrink = '0';
    img.style.background = '#111';
    img.style.margin = '32px 0 32px 32px';

    const content = document.createElement('div');
    content.style.padding = '32px 28px';
    content.style.display = 'flex';
    content.style.flexDirection = 'column';
    content.style.alignItems = 'flex-start';
    content.style.flex = '1';
    content.style.overflowY = 'auto';
    content.style.maxHeight = '95vh';


    const title = document.createElement('h2');
    title.textContent = movie.title || movie.name || "Titre inconnu";
    title.style.margin = '0 0 18px 0';
    title.style.fontSize = '1.5rem';
    title.style.color = '#fff';

    const release = document.createElement('p');
    release.style.color = '#b3b3b3';
    release.style.margin = '0 0 8px 0';
    release.textContent = "Date de sortie : " + (movie.release_date || "Non renseignée");

    let genresText = "";
    if (movie.genres && movie.genres.length > 0) {
        genresText = movie.genres.map(g => g.name).join(', ');
    } else if (movie.genre_ids && window.GENRES_LIST) {
        genresText = movie.genre_ids.map(id => window.GENRES_LIST[id]).filter(Boolean).join(', ');
    }
    const genresElem = document.createElement('p');
    genresElem.innerHTML = `<b>Genres : ${genresText || "Non renseigné"}</b>`;
    genresElem.style.margin = '0 0 18px 0';
    genresElem.style.color = '#fff';

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
            updateCurrentMoviesList();
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
            updateCurrentMoviesList();
        }
    }

    // Ajout des infos principales
    content.appendChild(title);
    content.appendChild(release);
    content.appendChild(genresElem);
    content.appendChild(desc);

    // Réalisateurs
    if (credits) {
        const directors = credits.crew.filter(person => person.job === "Director").map(person => person.name);
        if (directors.length) {
            const dirElem = document.createElement('p');
            dirElem.style.color = '#eed3a7';
            dirElem.style.fontWeight = "bold";
            dirElem.textContent = "Réalisation : " + directors.join(', ');
            content.appendChild(dirElem);
        }
    }

    // Crew unique (une carte par personne, tous les rôles listés)
    if (credits && credits.crew && credits.crew.length > 0) {
        const crewTitle = document.createElement('h3');
        crewTitle.textContent = "Équipe technique :";
        crewTitle.style.margin = "24px 0 8px 0";
        crewTitle.style.fontSize = "1.1rem";
        crewTitle.style.color = "#ff9800";
        content.appendChild(crewTitle);

        // Regroupement par personne
        const crewMap = {};
        credits.crew.forEach(person => {
            if (!crewMap[person.id]) {
                crewMap[person.id] = {
                    ...person,
                    jobs: [person.job]
                };
            } else {
                crewMap[person.id].jobs.push(person.job);
            }
        });

        const crewList = document.createElement('div');
        crewList.style.display = "flex";
        crewList.style.flexWrap = "wrap";
        crewList.style.gap = "14px";
        crewList.style.marginBottom = "18px";

        Object.values(crewMap).forEach(person => {
            const crewCard = document.createElement('div');
            crewCard.style.display = "flex";
            crewCard.style.flexDirection = "column";
            crewCard.style.alignItems = "center";
            crewCard.style.width = "70px";

            const photo = document.createElement('img');
            photo.src = person.profile_path && person.profile_path !== null
                ? `https://image.tmdb.org/t/p/w185${person.profile_path}`
                : "https://via.placeholder.com/70x100?text=No+Photo";
            photo.onerror = () => {
                photo.src = "https://i0.wp.com/sbcf.fr/wp-content/uploads/2018/03/sbcf-default-avatar.png?w=300&ssl=1";
            };
            photo.alt = person.name;
            photo.style.width = "70px";
            photo.style.height = "100px";
            photo.style.objectFit = "cover";
            photo.style.borderRadius = "8px";
            photo.style.background = "#222";

            const name = document.createElement('span');
            name.textContent = person.name;
            name.style.fontSize = "0.85em";
            name.style.color = "#fff";
            name.style.textAlign = "center";
            name.style.marginTop = "4px";
            name.style.fontWeight = "bold";

            const jobs = document.createElement('span');
            jobs.textContent = person.jobs.join(', ');
            jobs.style.fontSize = "0.75em";
            jobs.style.color = "#b3b3b3";
            jobs.style.textAlign = "center";

            crewCard.appendChild(photo);
            crewCard.appendChild(name);
            crewCard.appendChild(jobs);
            crewList.appendChild(crewCard);
        });

        content.appendChild(crewList);
    }

    content.appendChild(closeBtn);
    content.appendChild(favBtn);

    popup.appendChild(img);
    popup.appendChild(content);
    overlay.appendChild(popup);
    document.body.appendChild(overlay);
    popup.scrollTop = 0;
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