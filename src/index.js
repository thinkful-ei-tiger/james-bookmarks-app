import $ from "jquery";
import api from "./api";
import "normalize.css";
import "./index.css";
import STORE from "./store.js";
import bookmarks from "./bookmarks.js";

const main = function () {
  api
    .getBookmarks()
    .then((res) => res.json())
    .then((res) => {
      res.forEach((bookmark) => STORE.addBookmark(bookmark));
      bookmarks.render();
    });
  bookmarks.bindEventListeners();
};

$(main);
