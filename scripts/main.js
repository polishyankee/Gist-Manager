function authenticateUser() {
  axios.post('/login')
    .then(function (response) {
      // handle success
      console.log(response);
    })
    .catch(function (error) {
      // handle error
      console.log('error');
    })
    .finally(function () {
      // always executed
    })
}

$(document).on('load', function () {
  $('#auth_user').on("click", authenticateUser)
  $("#load_all_gits").click()
  $("#load_gits_filter").click()
});