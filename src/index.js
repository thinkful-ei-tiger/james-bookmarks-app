import $ from "jquery";

import "normalize.css";
import "./index.css";

import api from "./api";
import store from "./store";
import shoppingList from "./shopping-list";

const main = function () {
  api
    .getItems()
    .then((res) => res.json())
    .then((items) => {
      items.forEach((item) => store.addItem(item));
      shoppingList.render();
    });

  shoppingList.bindEventListeners();
  shoppingList.render();
};

$(main);
