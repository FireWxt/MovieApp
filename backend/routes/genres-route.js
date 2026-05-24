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

router.get('/', async (req, res) => {
  try {
    const response = await fetch('https://api.themoviedb.org/3/genre/movie/list?language=en', options);
    const data = await response.json();
    res.json(data.genres);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
