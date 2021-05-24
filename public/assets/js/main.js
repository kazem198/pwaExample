var app = (function () {
  var indexPage = function () {
    // Register Dialog box
    var dialog = document.querySelector("dialog");
    if (!dialog.showModal) {
      dialogPolyfill.registerDialog(dialog);
    }
    dialog.querySelector(".close").addEventListener("click", function () {
      window.history.back(1);
      dialog.close();
    });

    // Placehodlers
    var TITLE_PLACEHOLDER = "{{TITLE}}";
    var NOTE_PLACEHOLDER = "{{NOTE}}";
    var _id_PLACEHOLDER = "{{_id}}";
    var SYNCED_PLACEHOLDER = "{{SYNCED}}";
    var DATE_PLACEHOLDER = "{{DATE}}";
    var CLOUD_ICON =
      '<div _id="tt3" class="icon material-icons">cloud_upload</div>';
    var EMPTY_NOTE_PLACEHODER =
      '<div class="mdl-cell mdl-cell--6-col mdl-cell--8-col-tablet" _id="column"> <div class="mdl-card mdl-shadow--2dp" style="w_idth:95%; margin:1rem; text-align:center; padding:1rem"> <h3>You dont have any notes!</h3> </div> </div>';
    // TO See how this template looks like, please open index.html and see comment under <div _id="grid"></div>
    var NOTE_TEMPLATE =
      '<!-- Column START --> <div class="mdl-cell mdl-cell--6-col mdl-cell--8-col-tablet"> <!-- CARD START --> <div _id="{{_id}}" class="mdl-card mdl-shadow--2dp" style="w_idth:95%; margin:1rem"> <div class="mdl-card__title"> <h2 class="mdl-card__title-text">{{TITLE}}  {{SYNCED}}</h2> </div> <div class="mdl-card__media mdl-color--cyan" style="padding:2px"> </div> <div class="mdl-card__supporting-text"> {{NOTE}} </div> <div class="mdl-card__actions mdl-card--border"> <a href="/add.html?_id={{_id}}" class="mdl-button mdl-js-button mdl-button--colored mdl-color-text--cyan mdl-js-ripple-effect"> Edit </a> <a href="#_id={{_id}}" class="delete-button mdl-button mdl-button--colored mdl-js-button mdl-js-ripple-effect"> Delete </a> <div class="mdl-layout-spacer"></div><div class="mdl-layout-spacer"></div> <p class="mdl-textfield--align-right">{{DATE}}</p> </div> </div> <!-- CARD END --> </div> <!-- Column END -->';

    var getRegex = function (str) {
      return new RegExp(str, "g");
    };

    var replacePlaceholders = function (data) {
      var title = data.title;
      var note = data.note;
      var _id = data._id;
      var date = data.date;
      var synced = data.synced ? "" : CLOUD_ICON;

      var HTML = NOTE_TEMPLATE.replace(getRegex(TITLE_PLACEHOLDER), title);
      HTML = HTML.replace(getRegex(_id_PLACEHOLDER), _id);
      HTML = HTML.replace(getRegex(NOTE_PLACEHOLDER), note);
      HTML = HTML.replace(getRegex(DATE_PLACEHOLDER), date);
      HTML = HTML.replace(getRegex(SYNCED_PLACEHOLDER), synced);
      HTML = HTML.replace(getRegex(NOTE_PLACEHOLDER), note);

      return HTML;
    };

    var getListOfDeleteButtons = function () {
      // get all delete-button classes
      return document.querySelectorAll(".delete-button");
    };

    var removeClickListerner = function () {
      var buttonsElements = getListOfDeleteButtons();
      for (var i = 0; i < buttonsElements.length; i++) {
        buttonsElements[i].removeEventListener("click", showModalFn, false);
      }
    };

    var attachClickTodeleteButtons = function () {
      var buttonsElements = getListOfDeleteButtons();
      // Attach click event to all delete-button
      for (var i = 0; i < buttonsElements.length; i++) {
        buttonsElements[i].addEventListener("click", showModalFn);
      }
    };

    // Show notes
    var updateUI = function (data) {
      removeClickListerner();
      var grid = document.querySelector("#grid");
      grid.innerHTML = "";
      if (!data.length) {
        grid.insertAdjacentHTML("beforeend", EMPTY_NOTE_PLACEHODER);
        return;
      }
      for (var i = 0; i < data.length; i++) {
        var snippet = replacePlaceholders({
          title: data[i].title,
          note: data[i].note,
          _id: data[i]._id,
          date: data[i].date,
          synced: data[i].synced,
        });
        grid.insertAdjacentHTML("beforeend", snippet);
      }
      attachClickTodeleteButtons();
    };

    var showModalFn = function () {
      dialog.showModal();
    };

    var getDataAndUpdateUI = function () {
      GetAllNotes()
        .then((res) => {
          return res.json();
        })
        .then((res) => {
          updateUI([...res]);
        })
        .catch((err) => {
          db.gettallNote().then((res) => {
            updateUI([...res]);
          });
        });
      // Call essential methods
    };

    var deleteNote = function (id) {
      DeleteOneNote(id)
        .then((res) => {
          db.deleteoneNote(id);
        })
        .then((res) => {
          helpers.showMessage("Note deleted:87 " + id);
          window.history.back(1);
          // console.log(res);
          getDataAndUpdateUI();
        })
        .catch((err) => {
          db.deleteoneNote(id);
          window.history.back(1);
          getDataAndUpdateUI();
          navigator.serviceWorker.ready.then((sw) => {
            sw.sync.register(UPDATE_DBAPI);
          });
        });
    };

    // Call initially to update data
    getDataAndUpdateUI();

    dialog
      .querySelector(".confirmDelete")
      .addEventListener("click", function () {
        var id = helpers.getHashByName("_id");

        deleteNote(id);
        dialog.close();
      });
  };

  var addPage = function () {
    var _id = helpers.getParameterByName("_id"); // "1"
    var pageTitle = document.querySelector("#page-title");
    var addNoteForm = document.forms.addNote; // Or document.forms['addNote']
    var titleInput = addNoteForm.elements.title;
    var noteInput = addNoteForm.elements.note;

    var AttachSubmitForm = function (data) {
      // Listen to form submit
      addNoteForm.addEventListener("submit", function (event) {
        event.preventDefault();

        var title = titleInput.value.trim();
        var note = noteInput.value.trim();

        if (title === "" || note === "") {
          helpers.showMessage("Please enter val_id data!");
          return;
        }

        var noteData = {
          //  _id: data ? data._id : new Date().getTime(),
          title: title,
          note: note,
          date: new Date(),
          synced: false,
        };

        if ("serviceWorker" in navigator && "SyncManager" in window) {
          navigator.serviceWorker.ready.then((sw) => {
            AddNoteApi(noteData)
              .then((res) => {
                helpers.showMessage("successfully insert to api db!");
                console.log(res);
                return res.json();
              })
              .then((res) => {
                db.addnote(res);
                return res;
              })
              .then((result) => {
                SendPushApi(result);
              })
              .catch((err) => {
                noteData._id = new Date();
                noteData.sync = false;
                // console.log(noteData);
                db.addnote(noteData);
                sw.sync.register(BACKGROUND_SAVE_LOCALDB);
              });
          });
        } else {
          AddNoteApi(noteData)
            .then((res) => {
              helpers.showMessage("successfully insert to api db!");
              return res.json();
            })
            .then((result) => {
              SendPushApi(result);
            });
        }
      });
    };

    // This means we are in edit mode
    if (_id) {
      pageTitle.innerHTML = "Edit your Note";
      // get Note information from DB
      db_helpers.getNote(_id).then(function (data) {
        titleInput.value = data.title;
        noteInput.value = data.note;
        AttachSubmitForm(data);
      });
    } else {
      // call essential methods
      AttachSubmitForm();
    }
  };

  return {
    indexPage: indexPage,
    addPage: addPage,
  };
})();

if ("serviceWorker" in navigator) {
  window.addEventListener("load", function () {
    navigator.serviceWorker
      .register("/sw.js", {
        scope: "/",
      })
      .catch((err) => {
        console.log(err);
      });
  });
}
//////////////////////////Notifiction?//////////
function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

const applicationServerPublicKey =
  "BPC4bJt4ItlFgq6wgitzGeVLhrl3Q2Bxvg-5WGCRwFf03PvfP1UnJiRAhziLkMVu2QdmnUqmLUwFZRTeqAJ7Qgc";
// Private Key:
// g7-VV44BMVgXA2F_PfQcesK7MTInBdGxizBEpvIjuak
function subscribeUser() {
  if ("serviceWorker" in navigator) {
    const applicationServerKey = urlBase64ToUint8Array(
      applicationServerPublicKey
    );

    navigator.serviceWorker.ready.then(function (reg) {
      reg.pushManager
        .subscribe({
          userVisibleOnly: true,
          applicationServerKey: applicationServerKey,
        })
        .then(function (sub) {
          const mySub = {
            endpoint: sub.endpoint,
            p256dh: sub.toJSON().keys.p256dh,
            auth: sub.toJSON().keys.auth,
          };
          // console.log("Endpoint URL: ", mySub);

          AddPushApi(mySub);
        })
        .catch(function (e) {
          reg.pushManager.getSubscription().then((sub) => {
            return sub.unsubscribe();
          });

          if (Notification.permission === "denied") {
            console.warn("Permission for notifications was denied");
          } else {
            console.error("Unable to subscribe to push", e);
          }
        });
    });
  }
}

var buttonNotifiction = document.querySelector(".notification-button");

if ("Notification" in window && "serviceWorker" in navigator) {
  if (Notification.permission === "granted") {
    buttonNotifiction.innerText = "Subscribed";
    buttonNotifiction.disabled = true;
  }
  buttonNotifiction.addEventListener("click", () => {
    Notification.requestPermission(function (status) {
      // console.log("Notification permission status:", status);
      if (status == "granted") {
        navigator.serviceWorker.getRegistration().then(function (reg) {
          if (Notification.permission === "granted") {
            buttonNotifiction.innerText = "Subscribed";
            buttonNotifiction.disabled = true;
          }

          subscribeUser();
        });
      }
    });
  });
} else {
  buttonNotifiction.style.display = "none";
}

var send = document.getElementById("SendPushApi");
send.addEventListener("click", () => {
  SendPushApi({ title: "amir", note: "slm reza" });
});
