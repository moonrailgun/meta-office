import axios from 'axios';
import { AuthConfigParams } from './type';

export const endpoint = 'http://127.0.0.1:3000';

const request = axios.create({
  baseURL: endpoint,
});

export const getConfigParameters = () => {
  return request.get<AuthConfigParams>('/getConfigParameters', {
    params: {
      url: encodeURIComponent(location.href.split('#')[0]),
    },
  });
};
