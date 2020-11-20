"use strict";
// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();

  putStoriesOnPage();

}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story, isFave = false, isTrash = false) {
  // console.debug("generateStoryMarkup", story);

  let starState = (isFave) ? "fas" : "far";
  let trash = (isTrash) ? `<span class="trash-can">
                <i class="fas fa-trash-alt"></i>
               </span>`: "";

  const hostName = story.getHostName();
  return $(`
      <li id="${story.storyId}">
        ${trash}
        <span class="star">
          <i class="fa-star ${starState}"></i>
        </span>
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
      </li>
    `);
}

/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage() {
  console.debug("putStoriesOnPage");

  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }

  $allStoriesList.show();
}

$storySubmitForm.on("submit", addNewStoryToList);

/** Gets list of current user's stories from server, generates their HTML, and puts on page. */

function putMyStoriesOnPage() {
  console.debug("putMyStoriesOnPage");
  $allStoriesList.empty();
  for (let story of currentUser.ownStories) {
    let isFave = currentUser.favorites.some(s => s.storyId === story.storyId);

    const $story = generateStoryMarkup(story, isFave, true);
    $allStoriesList.append($story);
  }
  $allStoriesList.show();

}

/** Gets list of current user's favorite stories from server,
 * generates their HTML, and puts on page.
 * */

function putFavesOnPage() {
  console.debug("putFavesOnPage");

  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of currentUser.favorites) {
    const $story = generateStoryMarkup(story, true);
    $allStoriesList.append($story);
  }

  $allStoriesList.show();
}


/**Gets the new story submit form values
 * and add it to the list.
 */
async function addNewStoryToList(evt) {
  evt.preventDefault();
  const author = $storySubmitAuthor.val();
  const title = $storySubmitTitle.val();
  const url = $storySubmitUrl.val();
  const formValues = { author, title, url };

  const newStory = await storyList.addStory(currentUser, formValues);
  const $storyMarkup = generateStoryMarkup(newStory);

  $storySubmitForm.trigger("reset");
  $storySubmitForm.hide();
  $allStoriesList.prepend($storyMarkup);

}

/**
 * Toggles Star class, adds story to favorites.
 */
async function toggleStar(evt) {
  evt.preventDefault();

  $(evt.target).toggleClass(["far", "fas"]);
  let faveStoryId = $(evt.target)
    .closest("li")
    .attr("id");
  let story = storyList.stories.find(story => story.storyId === faveStoryId);
  let method = ($(evt.target).hasClass("fas")) ? "POST" : "DELETE";
  await currentUser.toggleFavorite(method, story);
}

$allStoriesList.on("click", ".fa-star", toggleStar);


/**
 * Handle trashcan click, deletes myStory from storyList and user's
 * favorites and my story lists.
 */
async function deleteMyStory(evt) {
  evt.preventDefault();
  let $trashStory = $(evt.target).closest("li");
  let trashStoryId = $trashStory.attr("id");
  
  $trashStory.remove();

  storyList.deleteStoryById(trashStoryId);
  currentUser.deleteMyStory(trashStoryId);

}
$allStoriesList.on("click", ".fa-trash-alt", deleteMyStory);
