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
function navSubmitStory (evt){
  evt.preventDefault();
  $storySubmitForm.show();
}

$storySubmitForm.on("submit", addNewStoryToList);

/**Gets the new story submit form values and returns an object with the values */
function getSubmitFormValues() {
  let author = $storySubmitAuthor.val();
  let title = $storySubmitTitle.val();
  let url = $storySubmitUrl.val();
  
  $storySubmitForm.trigger("reset");

  return {author, title, url};
}

/**Adds the new story to the story list*/
function addNewStoryToList(evt) {
  evt.preventDefault();

  let formValues = getSubmitFormValues();
  storyList.addStory(currentUser, formValues);
}


