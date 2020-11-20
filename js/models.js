"use strict";
const BASE_URL = "https://hack-or-snooze-v3.herokuapp.com";

/******************************************************************************
 * Story: a single story in the system
 */

class Story {

  /** Make instance of Story from data object about story:
   *   - {title, author, url, username, storyId, createdAt}
   */

  constructor({ title, author, url, username, storyId, createdAt }) {
    this.author = author;
    this.title = title;
    this.url = url;
    this.username = username;
    this.storyId = storyId;
    this.createdAt = createdAt;
  }

  /** Parses hostname out of URL and returns it. */

  getHostName(url = "") {
    let regex = /[^https:\/\/].*\.[a-zA-Z]{2,5}/;
    let re = new RegExp(regex);
    let hostname = url.match(re)
    return hostname;
  }
}


/******************************************************************************
 * List of Story instances: used by UI to show story lists in DOM.
 */

class StoryList {
  constructor(stories) {
    this.stories = stories;
  }

  /** Generate a new StoryList. It:
   *
   *  - calls the API
   *  - builds an array of Story instances
   *  - makes a single StoryList instance out of that
   *  - returns the StoryList instance.
   */

  static async getStories() {
    // Note presence of `static` keyword: this indicates that getStories is
    //  **not** an instance method. Rather, it is a method that is called on the
    //  class directly. Why doesn't it make sense for getStories to be an
    //  instance method?

    // query the /stories endpoint (no auth required)
    const response = await axios({
      url: `${BASE_URL}/stories`,
      method: "GET",
    });

    // turn plain old story objects from API into instances of Story class
    const stories = response.data.stories.map(story => new Story(story));

    // build an instance of our own class using the new array of stories
    return new StoryList(stories);
  }


  /** Adds story data to API, makes a Story instance, adds it to story list.
 * - user - the current instance of User who will post the story
 * - obj of {title, author, url}
 *
 * Returns the new Story instance
 */
  async addStory(user, { author, title, url }) {
    const token = user.loginToken;
    const response = await axios.post(`${BASE_URL}/stories`,
      {
        token,
        story: { author, title, url }
      });

    const newStory = new Story(response.data.story);
    this.stories.unshift(newStory);
    user.ownStories.unshift(newStory);

    return newStory;
  }

}
//  Hardcoded test story:
// await storyList.addStory(currentUser, {"author":"Sterling", "title":"Local Ducks Now homeless","url":"http://http.cat"})

/******************************************************************************
 * User: a user in the system (only used to represent the current user)
 */

class User {
  /** Make user instance from obj of user data and a token:
   *   - {username, name, createdAt, favorites[], ownStories[]}
   *   - token
   */

  constructor({
    username,
    name,
    createdAt,
    favorites = [],
    ownStories = []
  },
    token) {
    this.username = username;
    this.name = name;
    this.createdAt = createdAt;

    // instantiate Story instances for the user's favorites and ownStories
    this.favorites = favorites.map(s => new Story(s));
    this.ownStories = ownStories.map(s => new Story(s));

    // store the login token on the user so it's easy to find for API calls.
    this.loginToken = token;
  }

  /** Register new user in API, make User instance & return it.
   *
   * - username: a new username
   * - password: a new password
   * - name: the user's full name
   */

  static async signup(username, password, name) {
    const response = await axios({
      url: `${BASE_URL}/signup`,
      method: "POST",
      data: { user: { username, password, name } },
    });

    return new User(response.data.user, response.data.token);
  }

  /** Login in user with API, make User instance & return it.

   * - username: an existing user's username
   * - password: an existing user's password
   */

  static async login(username, password) {
    const response = await axios({
      url: `${BASE_URL}/login`,
      method: "POST",
      data: { user: { username, password } },
    });

    return new User(response.data.user, response.data.token);
  }

  /** When we already have credentials (token & username) for a user,
   *   we can log them in automatically. This function does that.
   */

  static async loginViaStoredCredentials(token, username) {
    try {
      const response = await axios({
        url: `${BASE_URL}/users/${username}`,
        method: "GET",
        params: { token },
      });
      return new User(response.data.user, token);
    } catch (err) {
      console.error("loginViaStoredCredentials failed", err);
      return null;
    }
  }
  /**
   * Sends add favorite API request and returns result.
   */
  async postAddNewFavorite(story) {
    this.favorites.unshift(story);
    await this._request("POST", story.storyId);
  }
  /**
   * Sends delete favorite API request and returns result.
   */
  async deleteFavorite(story) {
    this.favorites = this.favorites.filter(s => s.storyId !== story.storyId);
    await this._request("DELETE", story.storyId);
  }
  /* Private helper function to send API request. */
  async _request(method, storyId) {
    try {
      const response = await axios({
        url: `${BASE_URL}/users/${this.username}/favorites/${storyId}`,
        method: `${method}`,
        params: { token: this.loginToken },
      });
      return `Favorite ${method}!`;
    } catch (err) {
      console.error(`${method} favorites failed`, err);
      return null;
    }
  }
  /**
   * Add/Removes favorites from the user class & the API.
   */
  async toggleFavorite(method, story) {
    // Toggle. Removing element if it is there, adding if it isn't.
    if (method === "DELETE") {
      this.deleteFavorite(story)
    }
    else if (method === "POST") {
      this.postAddNewFavorite(story)
    }
  }
}
