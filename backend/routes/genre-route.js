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

router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const response = await fetch(`https://api.themoviedb.org/3/discover/movie?with_genres=${id}&include_adult=false&include_video=false&language=en-US&page=1&sort_by=popularity.desc`, options);
        const data = await response.json();
        res.json(data.results);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

export default router;
