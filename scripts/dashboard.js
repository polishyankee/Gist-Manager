let client_token = ""
let token_type = ""
let actualFilesList = []
let gistsList = []
let actualGist = null
let actualGistIndexInArray = -1

$(document).ready(function() {
    $('#connected_row').hide()
    $('#error_row').hide()
    $('#gist_creation_form').hide()

    $('#connect_user').click(connectUser)
    $('#create_gist').click(addGist)
    $('#load_gists').click(loadUserGists)
    $('#save_file_to_gist').click(addFileToList)
  })


  function connectUser() {
    let searchParams = new URLSearchParams(window.location.search)
    let client_id = $("#github_id").val()
    let client_secret = $("#github_secret").val()
    let client_code = searchParams.get("code");
    authenticateUserAndSaveToken(client_id, client_secret, client_code)
  }

  function addGist() {
    $('#gist_creation_form').show()
    actualGist = createNewGistObject()
    gistsList.push(actualGist)
    actualGistIndexInArray = gistsList.length - 1
    showListOfGists()
  }

  function showListOfGists() {
    $("#gists_table tbody > tr").remove();
    $("#gists_table > tr").remove();
    gistsList.forEach(function(item, index) {
      $('#gists_table').append('<tr><td class="w-25">' + item.id +'</td><td class="w-50">' + item.description +'</td><td class="w-25">' + createActionButtonsForItem(item, index) +'</td></tr>');
    })
  }

  function createActionButtonsForItem(item, index) {
    let buttons = ""
    buttons += getSaveButtonForItemWithIndexAndType(index, "gist")
    buttons += getEditButtonForItemWithIndexAndType(index, "gist")
    buttons += getDeleteButtonForItemWithIndexAndType(index, "gist")
    return buttons
  }

  function getSaveButtonForItemWithIndexAndType(index, type) {
    return ("<button class='btn btn-primary' id='save_" + type + "_" + index + "' data-array_index=" + index + " onclick='" + type + "Save(this)'>Save/Update</button>")
  }

  function getEditButtonForItemWithIndexAndType(index, type) {
    return ("<button class='btn btn-warning' id='edit_" + type + "_" + index + "' data-array_index=" + index + " onclick='" + type + "Edit(this)'>Edit</button>")
  }

  function getDeleteButtonForItemWithIndexAndType(index, type) {
    return ("<button class='btn btn-danger' id='delete_" + type + "_" + index + "' data-array_index=" + index + " onclick='" + type + "Delete(this)'>Delete</button>")
  }

  function gistSave(gistObject) {
    let gistId = $(gistObject).data('array_index')
    let gistObj = gistsList[gistId]
    if( gistsList[gistId].id == undefined || gistsList[gistId].id == -1) {
      sendAddGistRequest(gistObj).then(function(res) {
        gistsList[gistId].id = res.data.id
        showListOfGists()
      })
    }
    else {
      sendUpdateGistRequest(gistObj).then(function(res) {
        loadUserGists()
      })
    }
  }

  function gistEdit(gistObject) {
    let gistId = $(gistObject).data('array_index')

    $('#gist_creation_form').show()
    actualGist = gistsList[gistId]
    actualGistIndexInArray = gistId
    actualFilesList = actualGist.files
    refreshFilesList()
    changeGistDescriptionFieldToActualDesc()
  }

  function gistDelete(gistObject) {
    let gistId = $(gistObject).data('array_index')
    let realGistId = gistsList[gistId].id
    let params = {
      gist_id: realGistId,
      token: client_token,
    }
  
    axios.post ("/github_delete_gist", params).then(function (response) {
      loadUserGists()
     })
  }

  function fileEdit(fileObject) {
    let fileId = $(fileObject).data('array_index')
    let fileObj = actualFilesList[fileId]
    fillFileInputsUsingFileObject(fileObj)
  }

  function fileDelete(fileObject) {
    let fileId = $(fileObject).data('array_index')
    actualFilesList.splice(fileId, 1)
    updateActualGistFileList()
    refreshFilesList()
  }

  function fillFileInputsUsingFileObject(fileObject) {
    $('#file_name').val(fileObject.filename)
    $('#file_contents').val(fileObject.content)
  }

  function addFileToList() {
    let createdFile = generateFileObjectFromInput()
    let fileInListIndex = findIndexInArrayByProperty(actualFilesList, 'filename', createdFile.filename)
    if(fileInListIndex != -1) {
      actualFilesList[fileInListIndex] = createdFile
    }
    else {
      actualFilesList.push(createdFile)
    }    
    updateActualGistFileList()
    refreshFilesList()
  }

  function generateFileObjectFromInput() {
    let fileObj = {}
    fileObj.filename = $('#file_name').val()
    fileObj.content = $('#file_contents').val()
    return fileObj
  }

  function refreshFilesList() {
    $("#files_table tbody > tr").remove();
    $("#files_table > tr").remove();
    actualFilesList.forEach(function(file, index) {
      $('#files_table').append('<tr><td class="w-50">' + file.filename +'</td><td class="w-50">' + createActionButtonsForFile(file, index) +'</td></tr>');
    })
  }

  function createActionButtonsForFile(file, index) {
    let buttons = ""
    buttons += getEditButtonForItemWithIndexAndType(index, "file")
    buttons += getDeleteButtonForItemWithIndexAndType(index, "file")
    return buttons
  }

  async function sendAddGistRequest(gistObj) {
    const params = {
      token: client_token,
      description: gistObj.description,
      files: createObjectFromFilesArray(gistObj.files)
  }
  
  let res = await axios.post ("/github_save_gist", params).then(function (response) {
      return response
     })
     return res
  }

  async function sendUpdateGistRequest(gistObj) {
    const params = {
      token: client_token,
      description: gistObj.description,
      files: createObjectFromFilesArray(gistObj.files),
      gist_id: gistObj.id
  }
  
  let res = await axios.post ("/github_update_gist", params).then(function (response) {
      return response
     })
     return res
  }

  function loadUserGists() {
    const params = {
        filter: "",
        token: client_token
    }
    axios.post ("/github_get_gists", params).then(function (response) {
        replaceGistsList(response.data)
        showListOfGists()
       })
  }

  function saveToken(resp) {
    let splitted_resp = resp.toString().split("&")
    if(splitted_resp.length < 2) return false
    client_token = splitted_resp[0].split("=")[1]
    token_type = splitted_resp[1].split("=")[1]
    if(client_token == "bad_verification_code") return false
    return true
  }

  async function authenticateUserAndSaveToken(client_id, client_secret, client_code) {
    const params = {
        client_id: client_id,
        client_secret: client_secret,
        code: client_code
    }

    await axios.post ("/get_access_github", params).then(function (response) {
        let isOk = saveToken(response.data)
        if(isOk) {
            $('#connected_row').show()
        }
        else {
            $('#error_row').show()
        }
       })
  }

  function gistDescriptionUpdated(desc) {
    actualGist.description = desc
    showListOfGists()
  }

  function changeGistDescriptionFieldToActualDesc() {
    $('#gist_desc').val(actualGist.description)
  }

  function createNewGistObject() {
    return {
      id: -1,
      description: "None",
      public: false,
      files: []
    }
  }

  function updateActualGistFileList() {
    actualGist.files = actualFilesList
    gistsList[actualGistIndexInArray].files = actualFilesList
  }

  function findIndexInArrayByProperty(array, propertyName, propertyValue) {
    return array.findIndex((o) => { return o[propertyName] === propertyValue })
  }

  function createObjectFromFilesArray(files) {
    let filesObj = {}
    for (let i = 0; i < files.length; i++) {
      filesObj[files[i].filename] = {
        filename: files[i].filename,
        content: files[i].content
      }
    }
    return filesObj
  }

  function replaceGistsList(data) {
    gistsList = []
    data.forEach(function(item) {
      let newGist = createNewGistObject()
      newGist.id = item.id
      newGist.description = item.description
      let gistFiles = item.files

      for (var key in gistFiles) {
        var file = gistFiles[key];
        let fileObj = {}
        fileObj.filename = file.filename
        fileObj.content = file.content
        newGist.files.push(fileObj)
      }
      gistsList.push(newGist)
    })
  }