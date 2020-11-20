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

function generateStoryMarkup(story) {
  // console.debug("generateStoryMarkup", story);

  let faveIdx = currentUser.favorites.findIndex(favStory => favStory.storyId === story.storyId);
  let starState = (faveIdx > -1) ? "fas" : "far";

  const hostName = story.getHostName();
  return $(`
      <li id="${story.storyId}">
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


/** Gets list of current user's favorite stories from server,
 * generates their HTML, and puts on page.
 * */

function putFavesOnPage() {
  console.debug("putFavesOnPage");

  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of currentUser.favorites) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }

  $allStoriesList.show();
}
