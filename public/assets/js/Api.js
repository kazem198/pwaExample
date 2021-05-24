const SERVER_URL = "http://localhost:3003/api/pwa/";
const SERVER_URL_push = "http://localhost:3003/api/pwa/push";
var BACKGROUND_SAVE_LOCALDB = "new-notes-sync";
var UPDATE_DBAPI = "update_databaseApi";
function AddNoteApi(notes) {
  // console.log(notes);
  return fetch(SERVER_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(notes),
  });
}
function AddPushApi(push) {
  return fetch(SERVER_URL_push, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(push),
  });
}

function SendPushApi(data) {
  console.log(data);
  return fetch(SERVER_URL_push + "/send", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(data),
  });
}

function EditNoteApi(notes) {
  return fetch(SERVER_URL + notes._id, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(notes),
  });
}

function GetAllNotes() {
  return fetch(SERVER_URL);
}
function GetOneNote(id) {
  return fetch(SERVER_URL + id);
}
function DeleteOneNote(id) {
  return fetch(SERVER_URL + id, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });
}
