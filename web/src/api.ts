import axios from 'axios';

export const endpoint = 'http://127.0.0.1:3000';

export const request = axios.create({
  baseURL: endpoint,
});
