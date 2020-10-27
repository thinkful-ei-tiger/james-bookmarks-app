import $ from "jquery";
import api from "./api";

import store from "./store";

const generateItemElement = function (item) {
  let itemTitle = `<span class="shopping-item shopping-item__checked">${item.name}</span>`;
  if (!item.checked) {
    itemTitle = `
      <form class="js-edit-item">
        <input class="shopping-item" type="text" value="${item.name}" />
      </form>
    `;
  }

  return `
    <li class="js-item-element" data-item-id="${item.id}">
      ${itemTitle}
      <div class="shopping-item-controls">
        <button class="shopping-item-toggle js-item-toggle">
          <span class="button-label">check</span>
        </button>
        <button class="shopping-item-delete js-item-delete">
          <span class="button-label">delete</span>
        </button>
      </div>
    </li>`;
};

const generateShoppingItemsString = function (shoppingList) {
  const items = shoppingList.map((item) => generateItemElement(item));
  return items.join("");
};

const render = function () {
  // Filter item list if store prop is true by item.checked === false
  let items = [...store.items];
  if (store.hideCheckedItems) {
    items = items.filter((item) => !item.checked);
  }

  // render the shopping list in the DOM
  const shoppingListItemsString = generateShoppingItemsString(items);

  // insert that HTML into the DOM
  $(".js-shopping-list").html(shoppingListItemsString);
};

const handleNewItemSubmit = function () {
  $("#js-shopping-list-form").submit(function (event) {
    event.preventDefault();
    const newItemName = $(".js-shopping-list-entry").val();
    $(".js-shopping-list-entry").val("");

    api
      .createItem(newItemName)
      .then((res) => res.json())
      .then((newItem) => {
        store.addItem(newItem);
        render();
      });
  });
};

const getItemIdFromElement = function (item) {
  return $(item).closest(".js-item-element").data("item-id");
};

const handleDeleteItemClicked = function () {
  $(".js-shopping-list").on("click", ".js-item-delete", (event) => {
    const id = getItemIdFromElement(event.currentTarget);
    api
      .deleteItem(id)
      .then((res) => res.json())
      .then(() => {
        store.findAndDelete(id);
        render();
      });
  });
};

const handleEditShoppingItemSubmit = function () {
  $(".js-shopping-list").on("submit", ".js-edit-item", (event) => {
    event.preventDefault();
    const id = getItemIdFromElement(event.currentTarget);
    const itemName = $(event.currentTarget).find(".shopping-item").val();
    api.updateItem(id, { name: itemName }).then(() => {
      SourceBuffer.findAndUpdate(id, { name: itemName });
      render();
    });
  });
};

const handleItemCheckClicked = function () {
  $(".js-shopping-list").on("click", ".js-item-toggle", (event) => {
    const id = getItemIdFromElement(event.currentTarget);
    api.updateItem(id, { checked: true }).then(() => {
      store.findAndUpdate(id, { checked: true });
      render();
    });
  });
};

const handleToggleFilterClick = function () {
  $(".js-filter-checked").click(() => {
    store.toggleCheckedFilter();
    render();
  });
};

const bindEventListeners = function () {
  handleNewItemSubmit();
  handleItemCheckClicked();
  handleDeleteItemClicked();
  handleEditShoppingItemSubmit();
  handleToggleFilterClick();
};
// This object contains the only exposed methods from this module:
export default {
  render,
  bindEventListeners,
};
