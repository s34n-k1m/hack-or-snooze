"use strict";
/******************************************************************************
 * Handling navbar clicks and updating navbar
 */

/** Show main list of all stories when click site name */

function navAllStories(evt) {
  console.debug("navAllStories", evt);
  hidePageComponents();
  putStoriesOnPage();
}

$body.on("click", "#nav-all", navAllStories);

/** Show login/signup on click on "login" */

function navLoginClick(evt) {
  console.debug("navLoginClick", evt);
  hidePageComponents();
  $loginForm.show();
  $signupForm.show();
}

$navLogin.on("click", navLoginClick);

/** When a user first logins in, update the navbar to reflect that. */

function updateNavOnLogin() {
  console.debug("updateNavOnLogin");
  $(".main-nav-links").show();
  $navLogin.hide();
  $navLogOut.show();
  $navUserProfile.text(`${currentUser.username}`).show();
}

$navSubmit.on("click", navSubmitStory);

/** When a user clicks submit, show the submit form. */
function navSubmitStory(evt) {
  evt.preventDefault();
  navAllStories(evt);
  $storySubmitForm.toggle();
}


/** Show main list of favorite stories when "favorites" is clicked */

function navFaveStories(evt) {
  console.debug("navFaveStories", evt);
  putFavesOnPage();
}

$navFavorites.on("click", navFaveStories);

/** Show main list of the user's stories when click "My Stories" */

function navMyStories(evt) {
  console.debug("navMyStories", evt);
  putMyStoriesOnPage();
}

// $navFavorites.on("click", navFaveStories);
$navMyStories.on("click", navMyStories);
