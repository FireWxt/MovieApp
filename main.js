import * as api from "./api.js";

function getFavorites() {
    const favorites = localStorage.getItem('favorites');
    return favorites ? JSON.parse(favorites) : [];
}

document.addEventListener("DOMContentLoaded", async () => {
    api.getTrendingMovies();

    const genres = await api.getGenres();
    const genresContainer = document.querySelector('.genre-buttons');
    genres.forEach(genre => {
        const btn = document.createElement('button');
        btn.className = "genre";
        btn.textContent = genre.name;
        btn.dataset.genreId = genre.id;
        genresContainer.appendChild(btn);
    });


    const favbtn = document.createElement('button');
    favbtn.className = "favorites";
    favbtn.textContent = "🎬 Voir mes favoris"
    genresContainer.appendChild(favbtn);

                  genresContainer.addEventListener("click", async (event) => {
            if (event.target.classList.contains('genre')) {
                document.querySelectorAll('.genre').forEach(btn => btn.classList.remove('selected'));
                event.target.classList.add('selected');
                const genreId = event.target.dataset.genreId;
                await api.getMoviesByGenre(genreId);
            } else if (event.target.classList.contains('favorites')) {
                document.querySelectorAll('.genre').forEach(btn => btn.classList.remove('selected'));
                // Appel de getFavorites ici :
                const favorites = getFavorites();
                const moviesList = document.getElementById('movies-list');
                moviesList.innerHTML = "";
                if (favorites.length === 0) {
                    moviesList.innerHTML = "<div style='color:#fff;text-align:center;'>Aucun favori pour le moment.</div>";
                } else {
                    favorites.forEach(movie => {
                        const div = document.createElement('div');
                        div.className = "movie-card";
                        const img = document.createElement('img');
                        img.src = movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : 'https://via.placeholder.com/150';
                        img.alt = movie.title || movie.name || "Titre inconnu";
                        const title = document.createElement('h3');
                        title.className = "movie-title";
                        title.textContent = movie.title || movie.name || "Titre inconnu";
                        const releaseDate = document.createElement('p');
                        releaseDate.className = "release-date";
                        releaseDate.textContent = `Release Date: ${movie.release_date}`;
                        div.appendChild(img);
                        div.appendChild(title);
                        div.appendChild(releaseDate);
                        moviesList.appendChild(div);
                        // Si tu veux la popup sur les favoris aussi :
                        div.onclick = () => import('./popUp.js').then(mod => mod.moviePopup(movie));
                    });
                }
            }
    });
});