<template>
  <div class="container-fluid">
    <div class="row align-items-center justify-content-center">
      <div class="col col-12 align-items-center justify-content-center">
        <blockquote>
          Welcome {{ validUserName }}!
          <footer><small><em>&mdash; Every great film should seem new every time you see it.- Roger Ebert</em></small></footer>
        </blockquote>
      </div>

      <!-- success banners -->
      <div class="col-12 col-md-10 col-lg-10 col-12 align-items-center justify-content-center">
        <div class="alert alert-success" v-if="showMsg === 'new'" :value="true">New movie has been added.</div>
        <div class="alert alert-success" v-if="showMsg === 'update'" :value="true">Movie information has been updated.</div>
        <div class="alert alert-success" v-if="showMsg === 'deleted'" :value="true">Selected Movie has been deleted.</div>
      </div>
    </div>

    <!--Mobile device view-->
    <div class="d-md-none" id="collapsable-card" style="width: 80%">
      <button v-if="this.authenticated === 'true'" type="button" class="btn btn-primary" @click="addNewMovie">
        <font-awesome-icon icon="plus"/>
      </button>

      <div class="card" v-for="movie in movies" v-bind:key="movie">
        <div class="card-header" :id="'heading' + movie.name">
          <button class="btn btn-link collapsed" data-bs-toggle="collapse"
                  :data-bs-target="'#collapse' + movie.pk"
                  aria-expanded="true" :aria-controls="'collapse' + movie.pk">
            <h6 style="color: #0275d8; float: left">{{ movie.name }}</h6>
          </button>
        </div>

        <div :id="'collapse' + movie.pk" class="collapse" :aria-labelledby="'heading' + movie.pk" data-bs-parent="#collapsable-card">
          <div class="card-body">
            <p><b>Name:</b> {{ movie.name }}</p>
            <p><b>Description:</b>{{ movie.description }}</p>

            <div v-if="movie.movie_image" class="movie-image">
              <p><img :src="`${URL}${movie.movie_image}`" alt="Movie Picture" class="img-thumbnail"/></p>
            </div>
            <div v-else class="movie-image">
              <img :src="require('@/assets/movie_logo.jpg')" class="img-fluid" alt="Responsive image"/>
            </div>

            <p><b>Year:</b> {{ movie.year }}</p>
            <p><b>Rating:</b> {{ movie.rating }}</p>

            <div v-if="this.authenticated === 'true'" class="btn-group">
              <button @click="updateMovie(movie)" style="background-color: transparent; padding: 5;">
                <font-awesome-icon icon="pencil"/>
              </button>
              <button @click="deleteMovie(movie)" style="background-color: transparent; padding: 5;">
                <font-awesome-icon icon="trash"/>
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>

    <!--non-Mobile device view-->
    <!-- Data table - only allow update/delete when authenticated user -->
    <div class="row align-items-center justify-content-center">
      <div class="col col-12 col-md-10 d-none d-xl-block d-lg-block d-md-block">
        <table class="table table-hover" style="overflow-y: auto" :headers="headers">
          <thead>
            <tr>
              <th scope="col">Name</th>
              <th scope="col">Description</th>
              <th scope="col">Image</th>
              <th scope="col">Year</th>
              <th scope="col">Rating</th>
              <th v-if="this.authenticated === 'true'" scope="col">Update</th>
              <th v-if="this.authenticated === 'true'" scope="col">Delete</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="movie in movies" v-bind:key="movie">
              <th scope="row">{{ movie.name }}</th>
              <td>{{ movie.description }}</td>
              <td>
                <div v-if="movie.movie_image" class="movie-image">
                  <p><img :src="`${URL}${movie.movie_image}`" alt="Movie Picture" class="img-thumbnail"/></p>
                </div>
                <div v-else class="movie-image">
                  <img :src="require('@/assets/movie_logo.jpg')" class="img-fluid" alt="Responsive image"/>
                </div>
              </td>
              <td>{{ movie.year }}</td>
              <td>{{ movie.rating }}</td>
              <td v-if="this.authenticated === 'true'" @click="updateMovie(movie)">
                <button style="background-color: transparent; padding: 0;">
                  <font-awesome-icon icon="pencil"/>
                </button>
              </td>
              <td v-if="this.authenticated === 'true'" @click="deleteMovie(movie)">
                <button style="background-color: transparent; padding: 0;">
                  <font-awesome-icon icon="trash"/>
                </button>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Only allow add of movie when authenticated user -->
        <div class="text-end" v-if="this.authenticated === 'true'">
          <button class="btn btn-primary" @click="addNewMovie">
            <font-awesome-icon icon="plus"/> Add new movie
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import router from "../router";
  import { API_URL, APIService } from "../http/APIService";
  const apiService = new APIService();

  export default {
    name: "MovieList",
    data() {
      return {
        movies: [],
        URL: API_URL,
        headers: [],
        showMsg: "",
        authenticated: localStorage.getItem("isAuthenticated"),
        validUserName: "Guest",
      };
    },
    mounted() {
      // read any banner message from route param
      if (this.$route.params.msg) {
        this.showMsg = this.$route.params.msg;
      }
      // set user name if logged in
      if (localStorage.getItem("isAuthenticated") &&
          JSON.parse(localStorage.getItem("isAuthenticated")) === true) {
        this.validUserName = JSON.parse(localStorage.getItem("log_user"));
      }
      this.getMovies();
    },
    methods: {
      getMovies() {
        apiService.getMovieList().then(response => {
          this.movies = response.data;
        }).catch(error => {
          if (error.response && error.response.status === 401) {
            router.push("/auth");
          } else {
            this.showMsg = "error";
          }
        });
      },
      addNewMovie() {
        if (localStorage.getItem("isAuthenticated") &&
            JSON.parse(localStorage.getItem("isAuthenticated")) === true) {
          router.push('/movie-create');
        } else {
          router.push("/auth");
        }
      },
      updateMovie(movie) { router.push("/movie-create/" + movie.pk); },
      deleteMovie(movie) {
        if (confirm("Do you really want to delete?")) {
          apiService.deleteMovie(movie.pk).then(response => {
            if (response.status === 204) {
              router.push('/movie-list/deleted/')
              this.getMovies()
            }
          }).catch(error => {
            if (error.response.status === 401) {
              router.push("/auth");
            } else if (error.response.status === 400) {
              this.showMsg = "error";
            } else {
              this.showMsg = "error";
            }
          });
        }
      }
    }
  };
</script>

<style>
  button {
    padding: 1rem;
    border: 0;
    cursor: pointer;
  }
  .movie-image img {
    max-width: 100px;
    max-height: 100px;
    border-radius: 5px;
    margin-bottom: 10px;
    object-fit: cover;
  }
</style>
