import axios from 'axios';

const api = axios.create({
  baseURL: 'https://node-api-box.herokuapp.com',
});

export default api;