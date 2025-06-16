import * as api from "./api.js";


let currentGenreId = null;
let showingFavorites = false;

function getFavorites() {
    const favorites = localStorage.getItem('favorites');
    return favorites ? JSON.parse(favorites) : [];
}

function renderMovies(movies) {
    const favorites = getFavorites();
    const moviesList = document.getElementById('movies-list');
    moviesList.innerHTML = "";
    if (!movies || movies.length === 0) {
        moviesList.innerHTML = "<div style='color:#fff;text-align:center;'>Aucun film à afficher.</div>";
        return;
    }
    movies.forEach(movie => {
        const div = document.createElement('div');
        div.className = "movie-card";

        if (favorites.some(fav => fav.id === movie.id)) {
            const badge = document.createElement('span');
            badge.className = "favorite-badge";
            badge.innerHTML = "★";
            div.appendChild(badge);
        }

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

        div.onclick = () => import('./popUp.js').then(mod => mod.moviePopup(movie));
    });
}

function showFavorites() {
    showingFavorites = true;
    currentGenreId = null;
    const favorites = getFavorites();
    renderMovies(favorites);
}
export function updateCurrentMoviesList() {
    if (showingFavorites) {
        showFavorites();
    } else if (currentGenreId) {
        api.getMoviesByGenre(currentGenreId);
    } else {
        api.getTrendingMovies();
    }
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
    favbtn.textContent = "🎬 Mes favoris";
    genresContainer.appendChild(favbtn);

    genresContainer.addEventListener("click", async (event) => {
        if (event.target.classList.contains('genre')) {
            document.querySelectorAll('.genre').forEach(btn => btn.classList.remove('selected'));
            event.target.classList.add('selected');
            showingFavorites = false;
            currentGenreId = event.target.dataset.genreId;
            await api.getMoviesByGenre(currentGenreId);
        } else if (event.target.classList.contains('favorites')) {
            document.querySelectorAll('.genre').forEach(btn => btn.classList.remove('selected'));
            showFavorites();
        }
    });
});

window.updateCurrentMoviesList = updateCurrentMoviesList;