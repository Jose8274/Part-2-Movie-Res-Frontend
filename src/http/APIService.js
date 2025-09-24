import axios from 'axios';
// Change the API_URL to the correct location of the backend API before deploying the app
export const API_URL = 'https://yourPythonAnywhereName.pythonanywhere.com'


export class APIService {
  constructor() { }

  getMovie(param_pk) {
    const url = `${API_URL}/api/movies/${param_pk}`;
    let jwtToken = localStorage.getItem('access');
    const headers = {Authorization: `JWT ${jwtToken}`};
    return axios.get(url, {headers: headers});
  }

  getMovieList() {
    const url = `${API_URL}/api/movies/`;
    let jwtToken = localStorage.getItem('access');
    const headers = {Authorization: `JWT ${jwtToken}`};
    return axios.get(url, {headers: headers});
  }

  addNewMovie(movie){
    const url = `${API_URL}/api/movies/`;
    let jwtToken = localStorage.getItem('access');
    const headers = {Authorization: `JWT ${jwtToken}`};
    return axios.post(url, movie, {headers: headers});
  }

  updateMovie(formData){
    const url = `${API_URL}/api/movies/${formData.get("pk")}`;
    let jwtToken = localStorage.getItem('access');
    const headers = {Authorization: `JWT ${jwtToken}`};
    return axios.put(url, formData, {headers: headers});
  }

  deleteMovie(movie_Pk){
    const url = `${API_URL}/api/movies/${movie_Pk}`;
    let jwtToken = localStorage.getItem('access');
    const headers = {Authorization: `JWT ${jwtToken}`};
    return axios.delete(url, {headers: headers});
  }

  authenticateLogin(credentials) {
    const url = `${API_URL}/api/`;
    return axios.post(url, credentials);
  }

  registerUser(credentials) {
     const url = `${API_URL}/register/`;
     credentials.customusername = credentials.username
     return axios.post(url, credentials);
  }
}
