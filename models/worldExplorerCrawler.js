
var facebookSchema = require('./profile');
var crawlingRequests = require('./crawlingRequests');
var reset = require('./resetCrawlingReq');
var post = require('./post');
function convertUTCDateToLocalDate(date) {
  var newDate = new Date(date.getTime()+date.getTimezoneOffset()*60*1000);

  var offset = date.getTimezoneOffset() / 60;
  var hours = date.getHours();

  newDate.setHours(hours - offset);

  return newDate;   
}
var utcDate =  new Date;
var crawlingTime = convertUTCDateToLocalDate(utcDate);
async function WorldExplorerCrawler(username, url) {
  const socialMedia = "worldExplorer"
  try {
    //update db -  start crawling
    var filter = {
      socialMedia
    };
    var update = {
      requestHandling: true
    };
    await crawlingRequests.findOneAndUpdate(filter, update, {
      upsert: true
    });
    var Facebookposts = new facebookSchema({
      facebookUserName: username,
      url: url,
      socialMedia: socialMedia
    });
    const {
      Builder,
      Key,
      promise,
      until,
      By,
      webdriver
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

    await driver.get('http://localhost:3000');
    await driver.sleep(10000);

    element = await driver.findElement(By.xpath('//*[@id="root"]/div/div[2]/div[1]/div/div/form/div/div[1]/input'));

    await element.sendKeys('oshri@gmail.com');
    element = await driver.findElement(By.xpath('//*[@id="root"]/div/div[2]/div[1]/div/div/form/div/div[2]/input'));
    await element.sendKeys('123456789', Key.RETURN);
    setTimeout(function () {}, 3000);

    await driver.sleep(2000);

    await driver.get(url);
    await driver.manage().window().maximize();
    await driver.sleep(2000);
    await (driver).executeScript("window.scrollTo(0, document.body.scrollHeight);");
    await driver.sleep(2000);

    var className = ".sc-gqPbQI.hcaOkx";
    var allPosts = await driver.findElements(By.css(className));
    var numberOfPosts = allPosts.length;
    //Scrolls to the bottom
    while (true) {
      await (driver).executeScript("window.scrollTo(0, document.body.scroll);");
      await driver.sleep(3000);
      await (driver).executeScript("window.scrollTo(0, document.body.scrollHeight);");
      await driver.sleep(3000);
      await (driver).executeScript("window.scrollTo(0, document.body.scrollHeight);");

      var tempNumOfPosts = await driver.findElements(By.css(className));
      if (tempNumOfPosts.length == numberOfPosts) {
        break;
      } else {
        numberOfPosts = tempNumOfPosts.length;
      }
    }

    allPosts = await driver.findElements(By.css(className));
    await driver.executeScript("arguments[0].scrollIntoView(false);", allPosts[0]); //  scrolling to top
    for (let index = 0; index < allPosts.length; index++) {
      const element = allPosts[index];
      var postHeader = await element.findElements(By.css(".sc-iujRgT.eHHHfk"));
      var postTime = await element.findElements(By.css(".sc-bMVAic.ddJtUJ"));

      var postContentContainer = await element.findElements(By.css(".sc-jzJRlG.fkPtct"));
      var postContent;
      if (postContentContainer.length > 0) //handle post content
        postContent = await postContentContainer[0].getText();
      else
        postContent = "";
      var commentsButton = await element.findElements(By.css(".sc-ifAKCX.sc-lkqHmb.hdufcJ"));
      await commentsButton[0].click();
      await driver.sleep(1000);
      var commentsContainer = await element.findElements(By.css(".sc-kfGgVZ.hcILRE"));
      var headersContainer = await element.findElements(By.css(".sc-esjQYD.cUSCEe"))

      await driver.sleep(1000);
      var commentsArray = [];
      if (commentsContainer.length > 0) { //check if the post contian comments
        await driver.sleep(1000);
        for (i = 0; i < commentsContainer.length; i++) {
          // The title contains both the time and the username so it splits and saves separately
          var tempContent = await commentsContainer[i].getText();
          var commentheader = await headersContainer[i].getText();
          var commentContent =  tempContent.split(commentheader);
          //Saves in the json array all important parameters associated with each post response
          commentsArray.push({"commentHeader":commentheader,
          "commentContent":commentContent[1],
          "commentTime":"There is no comment time on this social network"});
        }

        var tempPost = new post({
          postHeader: await postHeader[0].getText(),
          postContent: postContent,
          comments: commentsArray,
          postTime: await postTime[0].getText(),
          crawlingTime: crawlingTime
        });
      
      }
      else {
        var tempPost = new post({
          postHeader: await postHeader[0].getText(),
          postContent: postContent,
          comments: [],
          postTime: await postTime[0].getText(),
          crawlingTime: crawlingTime
        });
      }
      await tempPost.save();
      Facebookposts.posts.push(tempPost);
      await driver.executeScript("arguments[0].scrollIntoView(false);", allPosts[index]);
      await driver.sleep(1000);
    }
    Facebookposts.save(function (err, result) {
      if (err) {
        console.log(err.message)
      } else {
        console.log("success")
      }
    });

    reset.resetWorldExplorer();
  } catch (error) { //reset worldExplorer request in case there is error
    console.log(error);
    reset.resetWorldExplorer();
  }
}
module.exports.WorldExplorerCrawler = WorldExplorerCrawler;
