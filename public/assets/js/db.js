// var BACKGROUND_SAVE_LOCALDB = "new-notes-sync";
var db = (function () {
  //check for support
  // if (!("indexedDB" in window)) {
  //   console.log("This browser doesn't support IndexedDB");
  //   return;
  // }

  var dbPromise = idb.open("my_db", 1, function (upgradeDb) {
    console.log("making a new object store");
    if (!upgradeDb.objectStoreNames.contains("notes")) {
      upgradeDb.createObjectStore("notes", { keyPath: "_id" });
    }
  });

  const addnote = (notes) => {
    dbPromise
      .then(function (db) {
        var tx = db.transaction("notes", "readwrite");
        var store = tx.objectStore("notes");

        store.add(notes);
        return tx.complete;
      })
      .then(function () {
        console.log("added item to the notes os!");
      });
  };

  const gettallNote = () => {
    return dbPromise.then(function (db) {
      var tx = db.transaction("notes", "readonly");
      var store = tx.objectStore("notes");
      return store.getAll();
    });
  };
  const getoneNote = (id) => {
    dbPromise.then(function (db) {
      var tx = db.transaction("notes", "readonly");
      var store = tx.objectStore("notes");
      return store.get(id);
    });
  };
  const deleteoneNote = (id) => {
    dbPromise.then(function (db) {
      var tx = db.transaction("notes", "readwrite");
      var store = tx.objectStore("notes");
      store.delete(id);
      return tx.complete;
    });
  };

  return {
    addnote,
    gettallNote,
    getoneNote,
    deleteoneNote,
  };
})();
