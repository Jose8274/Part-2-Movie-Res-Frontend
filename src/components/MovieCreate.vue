<template>
  <div class="container-fluid">
    <div class="row align-items-center justify-content-center">
      <div class=" col align-items-center">
        <div class="row align-items-center justify-content-center">
          <div class="col col-12 col-sm-10 col-md-10 col-lg-6">
            <div class="alert alert-danger shadow" role="alert" v-if="showMsg === 'error'">
              Please verify Movie Information
            </div>
            <div class="alert alert-danger shadow" role="alert" v-if="showMsg === 'requestError'">
              Please verify Movie Information - data formatted incorrectly
            </div>
          </div>
        </div>

        <div class="row align-items-center justify-content-center">
          <div class="col col-12 col-sm-10 col-md-10 col-lg-6 align-items-center">
            <div class="card">
              <div class="card-header">{{pageTitle}}</div>
              <div class="card-body">
                <form ref="form">
                  <div class="container-fluid">
                    <div class="form-group row justify-content-around py-2">
                      <label class="col-5">Name</label>
                      <div class="col col-7">
                        <input v-model="movie.name" type="text" class="form-control-sm form-control">
                      </div>
                    </div>

                    <div class="form-group row justify-content-around py-2">
                      <label class="col-5">Description</label>
                      <div class="col col-7">
                        <input v-model="movie.description" type="text" class="form-control-sm form-control">
                      </div>
                    </div>

                    <div class="form-group row justify-content-around py-2">
                      <label class="col-5">Year</label>
                      <div class="col col-7">
                        <input v-model="movie.year" type="text" class="form-control-sm form-control">
                      </div>
                    </div>

                    <div class="form-group row justify-content-around py-2">
                      <label class="col-5">Rating</label>
                      <div class="col col-7">
                        <input v-model="movie.rating" type="text" class="form-control-sm form-control">
                      </div>
                    </div>

                    <!-- Movie image -->
                    <div class="form-group">
                      <div v-if="isUpdate"><label>Update Movie Image</label></div>
                      <div v-else><label>Choose Movie Image</label></div>
                      <input type="file" @change="handleFileUpload" class="form-control" />
                    </div>

                    <div v-if="isUpdate">
                      <div v-if="!movieUpdated">
                        <!-- movie image -->
                        <div v-if="movie.movie_image" class="movie-image">
                          <img :src="`${URL}${movie.movie_image}`" alt="Movie Picture" class="img-thumbnail" />
                        </div>
                        <div v-else class="movie-image">
                          <img :src="require('@/assets/movie_logo.jpg')" class="img-fluid" alt="Responsive image"/>
                        </div>
                      </div>
                    </div>

                    <div class="row justify-content-around">
                      <div v-if="!isUpdate" type="button" class="btn btn-primary col-4" @click="createMovie">Save</div>
                      <div v-if="isUpdate" type="button" class="btn btn-primary col-4" @click="updateMovie">Update</div>
                      <div type="button" class="btn btn-secondary col-4" @click="cancelOperation">Cancel</div>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script>
  import router from '../router';
  import {APIService} from '../http/APIService';
  import { API_URL } from "../http/APIService";
  const apiService = new APIService();

  export default {
    //prevent user from accessing this page if not authorized
    beforeCreate() {
      if (localStorage.getItem("isAuthenticated") &&
          JSON.parse(localStorage.getItem("isAuthenticated")) === true ){
        this.authenticated = true
      } else {
        this.authenticated = false
      }
      if(this.authenticated===false){ router.push("/auth"); }
    },
    data() {
      return {
        showError: false,
        movie: {},
        URL: API_URL,
        movieUpdated: false,
        pageTitle: "Add New Movie",
        isUpdate: false,
        showMsg: '',
        authenticated: false
      };
    },
    methods: {
      handleFileUpload(event) {
        this.movie.movie_image = event.target.files[0]; // Attach the new image file
        this.movieUpdated=true;
      },

      createMovie() {
        const formData = new FormData();
        this.buildFormData(formData)
        apiService.addNewMovie(formData).then(response => {
          if (response.status === 201) {
            this.movie = response.data;
            this.showMsg = "";
            router.push('/movie-list/new');
          } else {
            this.showMsg = "error";
          }
        }).catch(error => {
          if (error.response.status === 401) {
            router.push("/auth");
          } else if (error.response.status === 400) {
            this.showMsg = "requestError";
          } else {
            this.showMsg = "error";
          }
        });
      },

      buildFormData(formData){
        if(this.isUpdate) { // update existing movie
          formData.append("pk", this.movie.pk);
          // Check if a movie image is provided and add it to the formData
          if (this.movie.movie_image && this.movieUpdated) {
            formData.append("movie_image", this.movie.movie_image);
          }
        } else { // create movie - no pk yet
          if (this.movie.movie_image) {
            formData.append("movie_image", this.movie.movie_image);
          }
        }
        formData.append("name", this.movie.name);
        formData.append("description", this.movie.description);
        formData.append("year", this.movie.year);
        formData.append("rating", this.movie.rating);
        formData.append("director", this.movie.director);
      },

      cancelOperation(){ router.push("/movie-list"); },

      updateMovie() {
        const formData = new FormData();
        this.buildFormData(formData);
        apiService.updateMovie(formData).then(response => {
          if (response.status === 200) {
            this.movie = response.data;
            router.push('/movie-list/update');
          } else {
            this.showMsg = "error";
          }
        }).catch(error => {
          if (error.response.status === 401) {
            router.push("/auth");
          } else if (error.response.status === 400) {
            this.showMsg = "requestError";
          } else {
            this.showMsg = "error";
          }
        });
      },
    },

    mounted() {
      if (this.$route.params.pk) {
        this.pageTitle = "Edit Movie";
        this.isUpdate = true;
        apiService.getMovie(this.$route.params.pk).then(response => {
          this.movie = response.data;
        }).catch(error => {
          if (error.response.status === 401) {
            router.push("/auth");
          } else {
            this.showMsg = "error";
            router.push("/auth");
          }
        });
      }
    },
  }
</script>

<style>
  .movie-image img {
    max-width: 200px;
    border-radius: 10px;
    margin-bottom: 20px;
  }
</style>
