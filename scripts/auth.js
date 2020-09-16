$(document).ready(function() {
    $('#auth_button').click(function() {
        let client_id = $("#github_id").val()
        let redirect_uri = "http://127.0.0.1:3000/dashboard"
        let scopes = "gist"
        window.location.href = "https://github.com/login/oauth/authorize?client_id=" + client_id + "&redirect_uri=" + redirect_uri + "&scope=" + scopes
    })
  })
  