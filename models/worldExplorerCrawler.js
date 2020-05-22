var utilitiesRequire = require("../models/crawlerUtilities");
var utilities = new utilitiesRequire.crawlerUtilities();
var post = utilities.post;
var reset = utilities.reset;
var crawlingRequests = utilities.crawlingRequests;

async function saveCommentsData(driver, commentsContainer, headersContainer, commentsArray) {
  if (commentsContainer.length > 0) { //check if the post contian comments
    await driver.sleep(1000);
    for (i = 0; i < commentsContainer.length; i++) {
      // The title contains both the time and the username so it splits and saves separately
      var tempContent = await commentsContainer[i].getText();
      var commentheader = await headersContainer[i].getText();
      var commentContent = tempContent.split(commentheader);
      //Saves in the json array all important parameters associated with each post response
      utilities.fillCommentsArr(commentsArray, commentheader, commentContent[1], "There is no comment time on this social network");
    }
  }

}
async function handlepostContent(postContentContainer, ) {
  if (postContentContainer.length > 0) //handle post content
    return await postContentContainer[0].getText();
  else
    return "";
}

async function clickOnCommentsButton(By, element, driver) {
  var commentsButton = await element.findElements(By.css(".sc-ifAKCX.sc-lkqHmb.hdufcJ"));
  await commentsButton[0].click();
  await driver.sleep(1000);
}

async function HandlesDataOfAllPosts(driver, allPosts, element, By, profilePost) {
  for (let index = 0; index < await allPosts.length; index++) {
    const element = allPosts[index];
    var postHeader = await element.findElements(By.css(".sc-iujRgT.eHHHfk"));
    var postTime = await element.findElements(By.css(".sc-bMVAic.ddJtUJ"));
    var postContentContainer = await element.findElements(By.css(".sc-jzJRlG.fkPtct"));
    var postContent = await handlepostContent(postContentContainer);
    await clickOnCommentsButton(By, element, driver)
    var commentsContainer = await element.findElements(By.css(".sc-kfGgVZ.hcILRE"));
    var headersContainer = await element.findElements(By.css(".sc-esjQYD.cUSCEe"))
    await driver.sleep(1000);
    var commentsArray = [];
    await saveCommentsData(driver, commentsContainer, headersContainer, commentsArray);
    var currPost = utilities.creatPostSchema(await postHeader[0].getText(),
      postContent, commentsArray, await postTime[0].getText());
    await currPost.save();
    profilePost.posts.push(currPost);
    await driver.executeScript("arguments[0].scrollIntoView(false);", allPosts[index]);
    await driver.sleep(1000);
  }
}

async function crawler(username, userUrl, socialMedia) {
  try {
    //update db -  start crawling
    reqStatus = true;
    var filter = {
      socialMedia
    };
    var update = {
      requestHandling: true
    };
    await crawlingRequests.findOneAndUpdate(filter, update, {
      upsert: true
    });
    var profilePost = utilities.fillProfileSchema(userUrl, username, socialMedia);

    //delete
    const {
      Builder,
      Key,
      promise,
      By
    } = require('selenium-webdriver');
    require('selenium-webdriver/lib/error');
    const firefox = require('selenium-webdriver/firefox');
    promise.USE_PROMISE_MANAGER = false;
    var firefoxOptions = new firefox.Options();
    firefoxOptions.setPreference("dom.webnotifications.enabled", false);
    const driver = new Builder()
      .forBrowser("firefox")
      .setFirefoxOptions(firefoxOptions)
      .build();
    var loginUrl = 'http://localhost:3000';
    var userNameId = '//*[@id="root"]/div/div[2]/div[1]/div/div/form/div/div[1]/input';
    var passwordId = '//*[@id="root"]/div/div[2]/div[1]/div/div/form/div/div[2]/input';
    var allPostsClassName = ".sc-gqPbQI.hcaOkx";
    //Scroll down the page and then collect all the posts on this page
    var allPosts = await utilities.getAllPosts(driver, loginUrl, socialMedia, userNameId, passwordId, userUrl, allPostsClassName);
    await HandlesDataOfAllPosts(driver, allPosts, element, By, profilePost)
    utilities.saveProfilePost(profilePost);
    await driver.close();
  } catch (error) {
    global.logger.error("error when trying to use World Explorer crawler", {meta: {err: error.message}})
  }
  finally {
    //reset worldExplorer request
    reset.resetWorldExplorer();
  }
}
module.exports.crawler = crawler;
