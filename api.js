import * as popup from "./popUp.js";

const options = {
  method: "GET",
  headers: {
    accept: "application/json",
    Authorization:
      "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI2NzZjMmE2NTlmOTEyMTIxMjc0NDA2ZmIzMzNmNDE1ZSIsIm5iZiI6MTc0NDM2NTA0Ni42MTc5OTk4LCJzdWIiOiI2N2Y4ZTVmNjdmNzBhYzFhMjFkOTM5MzYiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.oz0I7aaM8_A5m7PQz8R1rM_-e5YvcbhT8kFjHa0dL6s"
  }
};

export async function getGenres() {
  try {
    const response = await fetch(
      "https://api.themoviedb.org/3/genre/movie/list?language=en",
      options
    );

    const data = await response.json();
    console.log(data);
    return data.genres;
  } catch (error) {
    console.log(error.message);
  }
}


export async function searchMovies(query) {
    try {
        const response = await fetch(
            `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(query)}&language=fr-FR&page=1&include_adult=false`,
            options
        );
        const data = await response.json();
        return data.results;
    } catch (err) {
        console.error(err);
        return [];
    }
}

export async function getMovieCredits(movieId) {
    const response = await fetch(`https://api.themoviedb.org/3/movie/${movieId}/credits?language=en-US`, options);
    return await response.json();
}


export async function getTrendingMovies() {
    try {
        const response = await fetch('https://api.themoviedb.org/3/discover/movie?include_adult=false&include_video=false&language=en-US&page=1&sort_by=popularity.desc', options);
        const data = await response.json();
        const movies = data.results;

        const moviesList = document.getElementById('movies-list');
        moviesList.innerHTML = "";

        const favorites = JSON.parse(localStorage.getItem('favorites')) || [];

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
            div.onclick = async () => {
                const credits = await getMovieCredits(movie.id);
                popup.moviePopup(movie, credits);
            };
        });
    } catch (err) {
        console.error(err);
    }
}

export async function getMoviesByGenre(genreId) {
    try {
        const response = await fetch(`https://api.themoviedb.org/3/discover/movie?with_genres=${genreId}&include_adult=false&include_video=false&language=en-US&page=1&sort_by=popularity.desc`, options);
        const data = await response.json();
        const movies = data.results;

        const moviesList = document.getElementById('movies-list');
        moviesList.innerHTML = "";

        const favorites = JSON.parse(localStorage.getItem('favorites')) || [];

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
            div.onclick = async () => {
                const credits = await getMovieCredits(movie.id);
                popup.moviePopup(movie, credits);
            };
        });
    } catch (err) {
        console.error(err);
    }
}