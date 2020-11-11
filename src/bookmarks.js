import $ from "jquery";
import api from "./api";
import STORE from "./store";

const generateStarRating = function (bookmark) {
  let starRating;
  let starChecked = bookmark.rating;
  let starUnchecked = 5 - starChecked;
  const starCheckedHtml = `<span class="fa fa-star checked"></span>`;
  const starUncheckedHtml = `<span class="fa fa-star"></span>`;

  starRating =
    starCheckedHtml.repeat(starChecked) +
    starUncheckedHtml.repeat(starUnchecked);

  return starRating;
};

const generateBookMarkHtml = function (bookmark) {
  let bookmarkExpand = !bookmark.expand ? "bookmark-hide" : "";
  let bookmarkRating = generateStarRating(bookmark);
  return `
      <div class="bookmark-condensed-container js-bookmark-condensed-container" data-item-id="${bookmark.id}">
        <button class="expand-button js-expand-button">Expand Me!</button>  
        <h2 class="bookmark-name js-bookmark-name">${bookmark.title}</h2>
        <div class="bookmark-rating js-bookmark-rating">
          ${bookmarkRating}
        </div>
        <div class="bookmark-expand js-bookmark-expand-container ${bookmarkExpand}">
          <p>Description: ${bookmark.desc}</p>
          <div class="actions">
            <a class="bookmark-URL js-bookmark-URL" href=${bookmark.url} target="_blank"><strong>Visit Site!</strong></a>
            <button class="delete-button js-delete-button">Delete Me!</button>
          </div>
        </div>
      </div>
    `;
};
//loop through bookmarks and display
const generateBookMarksHtml = function (bookmarks) {
  const bookmarksHtml = bookmarks.map((bookmark) =>
    generateBookMarkHtml(bookmark)
  );

  return bookmarksHtml.join("");
};

const generateBookmarkHeader = function () {
  $("#main").html(`
    
    <header role="banner">
    <h1>BookMark</h1>
  </header>
<!-- BOOKMARKS CONTROLS-->
  <div class="main-container" role="main">
    <div class="flex-container">
      <section class="user-controls">
        <button class="button-add js-button-add">+Add New Bookmark</button>
        <div class="filter-container">
          <label for="star-rating-filter">Filter by:</label>
          <select name="star-rating" id="star-rating-filter">
            <option value="0">minimum rating</option>
            <option value="5">5+ stars</option>
            <option value="4">4+ stars</option>
            <option value="3">3+ stars</option>
            <option value="2">2+ stars</option>
            <option value="1">see all</option>
          </div>
        </select>
      </section>
  <!-- BOOKMARKS DISPLAY -->
      <section class="bookmark-container js-bookmark-container">
      </section>
    </div>
  </div>`);
};

const generateBookMarkAddHtml = function () {
  return `
<div class="add-bookmark-container">
<form class="add-bookmark-form"> 
  <fieldset role="group">
    <legend class="form">Bookmark Information</legend>
    <label class="form" for="title">Title:</label><br>
    <input type="text" id="title" name="title" required><br>
    <div class"bookmark-hide" role="radiogroup" aria-labelledby="rating">
      <label class="form" id="rating">Rating:</label><br>
      <label class="bookmark-hide" for="rating5">5 stars</label>
      <input type="radio" name="rating" id="rating5" value="5" checked>5 stars
      <label class="bookmark-hide" for="rating4">4 stars</label>
      <input type="radio" name="rating" id="rating4" value="4">4 stars
      <label class="bookmark-hide" for="rating3">3 stars</label>
      <input type="radio" name="rating" id="rating3" value="3">3 stars
      <label class="bookmark-hide" for="rating2">2 stars</label>
      <input type="radio" name="rating" id="rating2" value="2">2 stars
      <label class="bookmark-hide" for="rating1">1 star</label>
      <input type="radio" name="rating" id="rating1" value="1">1 star<br>
    </div>
    <lable class="form">Description:<br>
      <textarea name="desc" id="bookmark-description" cols="100" rows="10" ></textarea>
    </lable><br>
    <label class="form" for="url">Bookmark URL:</label><br>
    <input type="url" name="url" id="url" required><br>
    <div class="url-warning-container">
      <p class="url-warning"> URL must include HTTP/HTTPS</p>
    </div>
    <div class="actions">
      <input type="submit" value="Submit">
      <input type="reset" value="Reset"> 
      <input type="button" value="Cancel" class="js-cancel-button">
    </div>
  </fieldset>
</form>
</div>
`;
};
const generateError = function (errorMessage) {
  return `
    <!-- ERROR DISPLAY -->
    <div class="error-container js-error-container">
      <button id="cancel-error">X</button>
      <h2>ERROR!</h2>
      <p>${errorMessage}</p>
    </div>
    `;
};

const renderButtonClose = function () {
  $(".js-error-container").remove();
};

// if there is an error, render error container
const renderError = function () {
  if (STORE.error) {
    if (STORE.adding) {
      const errorMessage = generateError(STORE.error);
      $(".flex-container").after(errorMessage);
    } else if (!STORE.adding) {
      const errorMessage = generateError(STORE.error);
      $(".user-controls").after(errorMessage);
    }
  } else {
    $(".js-error-container").empty();
  }
};

const serializeJson = function (form) {
  const formData = new FormData(form);
  const o = {};
  formData.forEach((val, name) => (o[name] = val));
  return JSON.stringify(o);
};

//change on click adding: false => adding: true
const handleBookMarkAdd = function () {
  $("#main").on("click", ".js-button-add", function () {
    //console.log('add button was clicked')
    if (!STORE.adding) {
      STORE.adding = true;
    }
    render();
  });
};
//bookmark form
const handleBookmarkSubmit = function () {
  $(".add-bookmark-form").submit(function (event) {
    event.preventDefault();

    let formElement = $(".add-bookmark-form")[0];
    let jsonObj = serializeJson(formElement);

    api
      .createBookmark(jsonObj)
      .then((newBookMark) => {
        STORE.addBookmark(newBookMark);
        render();
      })
      .catch((e) => {
        STORE.setError(e.message);
        renderError();
      });
    render();
  });
};
//render
const render = function () {
  $("#main").html(generateBookmarkHeader());
  // render bookmark form if adding: true
  if (STORE.adding) {
    //console.log('adding test')
    $(".user-controls").toggleClass("bookmark-hide");
    $(".js-error-container-main").toggleClass("bookmark-hide");
    $(".js-bookmark-container").html(generateBookMarkAddHtml());
    renderError();
    bindEventListeners();

    //render bookmarks if any
  } else if (STORE.filter) {
    let bookmarksFilteredCopy = [...STORE.filteredBookmarks];
    const bookmarkFilteredHtml = generateBookMarksHtml(bookmarksFilteredCopy);
    $(".js-bookmark-container").html(bookmarkFilteredHtml);
    renderError();
    STORE.filteredBookmarks = [];
    bindEventListeners();
  } else {
    const bookmarkHtml = generateBookMarksHtml(STORE.bookmarks);
    // add the html to the bookmark container
    $(".js-bookmark-container").html(bookmarkHtml);
    renderError();
    bindEventListeners();
  }
};
//target bookmark ids
const getBookmarkIdFromElement = function (targetElement) {
  return $(targetElement)
    .closest(".js-bookmark-condensed-container")
    .data("item-id");
};
//expand bookmark details on click
const handleBookmarkExpand = function () {
  $(".js-bookmark-container").on("click", ".js-expand-button", (e) => {
    const id = getBookmarkIdFromElement(e.currentTarget);
    STORE.expandBookmark(id);
    render();
  });
};
//Delete bookmark from api/store
const handleBookmarkDelete = function () {
  $(".js-delete-button").on("click", (e) => {
    const id = $(e.currentTarget).parent().parent().parent().data("item-id");
    api
      .deleteBookmark(id)
      .then(() => {
        STORE.deleteBookmark(id);
        render();
      })
      .catch((e) => {
        STORE.setError(e.message);
        renderError();
      });
  });
};

const handleErrorClose = function () {
  $(".flex-container").on("click", "#cancel-error", () => {
    renderButtonClose();
    STORE.setError(null);
  });
};

const handleBookmarkCancel = function () {
  $(".js-cancel-button").on("click", function () {
    STORE.setAdding(false);
    render();
  });
};

const handleBookmarkFilter = function () {
  $("#star-rating-filter").change(() => {
    let filterParam = $("#star-rating-filter").val();
    console.log("rating:", filterParam);
    STORE.filterBookmarks(filterParam);
    render();
  });
};

const bindEventListeners = function () {
  handleErrorClose();
  handleBookmarkFilter();
  handleBookmarkCancel();
  handleBookmarkDelete();
  handleBookmarkExpand();
  handleBookMarkAdd();
  handleBookmarkSubmit();
};

export default {
  bindEventListeners,
  render,
};
