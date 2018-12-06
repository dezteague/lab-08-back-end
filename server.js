'use strict';

// app dependiencies
const express = require('express');
const superagent = require('superagent');
const cors = require('cors');
const pg = require('pg');

// get proect enviroment variables
require('dotenv').config();

// app constants
const PORT = process.env.PORT;
const app = express();

//handle errors
function handleError(err, res) {
    console.error(err);
    if (res) res.status(500).send('sorry, something broke.');
  }

//--------------------------TABLE CONFIG--------------------
const client = new pg.client(process.env.DATABASE_UR);
client.connect();
client.on('error', err => console.error(err));

// app middleware
app.use(cors());

// -------------------------LOCATION-------------------------
//Referencing the data from the json files that will include longitude and latitude
function Location(query, res) {
  this.search_query = query;
  this.formatted_query = res.body.results[0].formatted_address;
  this.latitude = res.body.results[0].geometry.location.lat;
  this.longitude = res.body.results[0].geometry.location.lng;
}

app.get('/location', (getLocation);

// helper function
// function searchToLatLng(query) {
//   const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${query}&key=${process.env.GEOCODE_API_KEY}`; return superagent
//   //return superagent.get(url) compare line below
//     .get(url)
//     .then(res => {
//       return new Location(query, res);
//     })
//     .catch(error => handleError(error));
// }

// -------------------------WEATHER-------------------------
function Weather(day) {
  this.forecast = day.summary;
  this.time = new Date(day.time * 1000).toDateString();
}
app.get('/weather', getWeather);

// helper function
function getWeather(req, res) {
  const url = `https://api.darksky.net/forecast/${process.env.WEATHER_API_KEY}/${req.query.data.latitude},${req.query.data.longitude}`;
  superagent.get(url)
    .then(result => {
      const weatherSummaries = result.body.daily.data.map(day => {
        return new Weather(day);
      });
      res.send(weatherSummaries);
    })
    .catch(error => handleError(error));
}

// the client will recieve an error message upon status error 500
function handleError(err, res) {
  console.error(err);
  if (res) res.satus(500).send('Sorry, something broke');
}

app.listen(PORT, () => {
  console.log(`listening on ${PORT}`);
});

// -------------------------YELP-------------------------
function Yelp(items) {
  this.name = items.name;
  this.url = items.url;
  this.image_url = items.image_url;
  this.rating = items.rating;
  this.price = items.price;
}
app.get('/yelp', getReview);

// helper function
function getReview(req, res) {
  const url = `https://api.yelp.com/v3/businesses/search?location=${req.query.data.search_query}/${req.query.data.latitude},${req.query.data.longitude}`
  superagent.get(url)
    .set('Authorization', `Bearer ${process.env.YELP_API_KEY}`)
    .then(result => {
      const getReview = result.body.businesses.map(item => {
        return new Yelp(item);
      });
      res.send(getReview);
    })
    .catch(error => handleError(error));
}
// -------------------------MOVIES-------------------------
function Movie(movie) {
  this.title= movie.title;
  this.image_url = 'https://image.tmdb.org/t/p/w370_and_h556_bestv2/' + movie.poster_path;
  this.overview= movie.overview;
  this.popularity = movie.popularity;
  this.average_votes= movie.average_votes;
  this.total_votes = movie.total_votes;
  this.released_on = movie.released_on;
}

app.get('/movies', getMovie)

function getMovie(req, res) {
  const url = `https://api.themoviedb.org/3/search/movie?api_key=${process.env.MOVIE_API_KEY}&query=${req.query.data.search_query}`;
  superagent.get(url)
    .then (result => {
      const movieSummaries = result.body.results.map(movie => {
        return new Movie(movie);
      });
      res.send(movieSummaries);
    })
    .catch(error => handleError(error))
}