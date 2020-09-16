var express = require('express');
const { response } = require('express');
const axios = require("axios");
const router = express.Router();



router.get('/', function(req, res){
   res.render('git_auth');
});

router.get('/dashboard', function(req, res){
   res.render('dashboard', { code: req.query.code })
});

router.post('/get_access_github', function(req, res){
   axios.post('https://github.com/login/oauth/access_token', 
   {
         client_id: req.body.client_id,
         client_secret: req.body.client_secret,
         code: req.body.code
   })
  .then(function (response) {
   res.send(response.data);
  })
  .catch(function (error) {
   res.send(error);
 })
});

router.post('/github_get_gists', function(req, res){
   let filter = req.body.filter
   let token = req.body.token
   if(filter == "") {
      axios.get('https://api.github.com/gists', 
      {
         headers: generateHeadersWithToken(token)
      })
      .then(function (response) {
         res.send(response.data);
      })
      .catch(function (error) {
         res.send(error);
      })
   }
   else {

   }
});

router.post('/github_save_gist', function(req, res){
   let token = req.body.token
   axios.post('https://api.github.com/gists', { 
      "description": req.body.description,
      files: req.body.files
   },
   {
      headers: generateHeadersWithToken(token)
   })
   .then(function (response) {
      res.send(response.data);
   })
   .catch(function (error) {
       res.send(error);
   })
});

router.post('/github_edit_gist', function(req, res){
   let token = req.body.token
   axios.get('https://api.github.com/gists', 
   {},
   {
       headers: generateHeadersWithToken(token)
   })
   .then(function (response) {
      res.send(response.data);
   })
   .catch(function (error) {
       res.send(error);
   })
});

router.post(('/github_delete_gist'), function(req, res) {
   let gistId = req.body.gist_id
   let token = req.body.token
   axios.delete(('https://api.github.com/gists/'+ gistId), 
   {
      headers: generateHeadersWithToken(token),
      data: {
         gist_id: gistId
      }
   })
   .then(function (response) {
      res.send(response.data);
   })
   .catch(function (error) {
       res.send(error);
   })
})

router.post(('/github_update_gist'), function(req, res) {
   let gistId = req.body.gist_id
   let token = req.body.token

   axios.patch(('https://api.github.com/gists/'+ gistId), 
   {
      gist_id: gistId,
      "description": req.body.description,
      files: req.body.files
   },
   {
      headers: generateHeadersWithToken(token),
   })
   .then(function (response) {
      res.send(response.data);
   })
   .catch(function (error) {
       res.send(error);
   })
})

function generateHeadersWithToken(token) {
   return {
      "Authorization": ("token " + token),
      "Accept": "application/vnd.github.v3+json"
    }
}
module.exports = router;