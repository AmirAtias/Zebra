var utilitiesRequire = require("../models/crawlerUtilities");
var utilities = new utilitiesRequire.crawlerUtilities();
var reset = utilities.reset;
var crawlingRequests = utilities.crawlingRequests;
async function clickIfCommentsButtonExists(element, By) {
  if (await element.findElements(By.css(".show.show-all-link")) != 0) {
    var commentsButton = await element.findElements(By.css(".show.show-all-link"));
    await commentsButton[0].click();
  }
}
async function getPostHeader(element, By) {
  var tempPostHeader1 = await element.findElements(By.css(".media-heading"));
  var tempPostHeader2 = await tempPostHeader1[0].getText();
  return tempPostHeader2.split("PUBLIC");
}
async function fillPostContent(postContentContainer) {
  if (postContentContainer.length > 0) //handle post content
    postContent = await postContentContainer[0].getText();
  else
    postContent = "";
}

async function HandlesDataOfAllPosts(driver, allPosts, element, By, profilePost) {
  for (let index = 0; index < allPosts.length; index++) {
    const element = allPosts[index];
    var postHeader = await getPostHeader(element, By);
    var date = await element.findElements(By.css(".media-subheading"));
    var postContentContainer = await element.findElements(By.css(".content"));
    await fillPostContent(postContentContainer);
    clickIfCommentsButtonExists(element, By)
    await driver.sleep(1000);
    var commentsContainer = await element.findElements(By.css(".media"));
    await driver.sleep(1000);
    var commentsArray = [];
    await saveCommentsData(driver, commentsContainer, commentsArray, By);

    var currPost = utilities.creatPostSchema(postHeader[0], postContent, commentsArray, await date[0].getText());
    await currPost.save();
    profilePost.posts.push(currPost);
    await driver.executeScript("arguments[0].scrollIntoView(false);", allPosts[index]);
    await driver.sleep(1000);
  }
}

async function saveCommentsData(driver, commentsContainer, commentsArray, By) {
  if (commentsContainer.length > 1) { //check if the post contian comments
    await driver.sleep(1000);
    for (i = 1; i < commentsContainer.length; i++) {
      var commentTimeContainer = await commentsContainer[i].findElements(By.css(".time"));
      var headersContainer = await commentsContainer[i].findElements(By.css(".media-heading"));
      var commentContentContainer = await commentsContainer[i].findElements(By.css(".content.comment_edit_content"));
      // The title contains both the time and the username so it splits and saves separately
      var commentContent = await commentContentContainer[0].getText();
      var tempheader = await headersContainer[0].getText();
      var commentTime = await commentTimeContainer[0].getText();
      var commentheader = tempheader.split(commentTime);
      //Saves in the json array all important parameters associated with each post response
      utilities.fillCommentsArr(commentsArray, commentheader[0], commentContent, commentTime);
    }
  }

}

async function crawler(username, userUrl, socialMedia) {
  try {
    //update db -  start crawling
    reqStatus = true;
    var filter = { socialMedia: socialMedia };
    var update = { requestHandling: true };
    await crawlingRequests.findOneAndUpdate(filter, update, {
      upsert: true
    });
    var profilePost = utilities.fillProfileSchema(userUrl, username, socialMedia);
    ///delete!!
    const {
      Builder,
      promise,
      By
    } = require('selenium-webdriver');
    require('selenium-webdriver/lib/error');
    const firefox = require('selenium-webdriver/firefox');
    promise.USE_PROMISE_MANAGER = false;//?
    var firefoxOptions = new firefox.Options();
    firefoxOptions.setPreference("dom.webnotifications.enabled", false);
    const driver = new Builder().forBrowser("firefox").setFirefoxOptions(firefoxOptions).build();
    var loginUrl = 'https://guyandamir-sn.humhub.com/user/auth/login';
    var userNameId = '//*[@id="login_username"]';
    var passwordId = '//*[@id="login_password"]';
    var allPostsClassName = ".wall-entry";
    //Scroll down the page and then collect all the posts on this page
    var allPosts = await utilities.getAllPosts(driver, loginUrl, socialMedia, userNameId, passwordId, userUrl, allPostsClassName);
    await HandlesDataOfAllPosts(driver, allPosts, element, By, profilePost)
    utilities.saveProfilePost(profilePost);
    await driver.close();
  } catch (error) {
    console.log(error);
  }
  finally {
    //reset HumHub request
    reset.resetHumHub();
  }
}
module.exports.crawler = crawler;