import express from 'express';
import fetch from 'node-fetch';

const router = express.Router();

const options = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI2NzZjMmE2NTlmOTEyMTIxMjc0NDA2ZmIzMzNmNDE1ZSIsIm5iZiI6MTc0NDM2NTA0Ni42MTc5OTk4LCJzdWIiOiI2N2Y4ZTVmNjdmNzBhYzFhMjFkOTM5MzYiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.oz0I7aaM8_A5m7PQz8R1rM_-e5YvcbhT8kFjHa0dL6s'
  }
};

router.get('/search', async (req, res) => {
    const { query } = req.query;
    try {
        const response = await fetch(`https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(query)}&language=fr-FR&page=1&include_adult=false`, options);
        const data = await response.json();
        res.json(data.results);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.get('/:id/credits', async (req, res) => {
    const { id } = req.params;
    try {
        const response = await fetch(`https://api.themoviedb.org/3/movie/${id}/credits?language=en-US`, options);
        const data = await response.json();
        res.json(data);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

export default router;
