/*
function convertUTCDateToLocalDate(date) {
  var newDate = new Date(date.getTime()+date.getTimezoneOffset()*60*1000);
  var offset = date.getTimezoneOffset() / 60;
  var hours = date.getHours();
  newDate.setHours(hours - offset);
  return newDate;   
}
var utcDate =  new Date;
var crawlingTime = convertUTCDateToLocalDate(utcDate);
*/
function addZeroToStart(t){
  if(t.length==1){
    t = '0' +""+ t;
  }
  return t;
}
function getDateAndTime(){

  var houer = addZeroToStart(new Date().getHours().toString());
  var minuets = addZeroToStart(new Date().getMinutes().toString());
  var secondes = addZeroToStart(new Date().getSeconds().toString());
  var month = addZeroToStart((new Date().getMonth()+1).toString());
  var day = addZeroToStart(new Date().getDate().toString());

  return day+ "/" +month + " " + houer + ":" + minuets + ":" + secondes;

}


var profile = require('./profile');
var crawlingRequests = require('./crawlingRequests');
var reset = require('./resetCrawlingReq');
var post = require('./post');

async function crawler(username, url) {
  const socialMedia = "humhub"
  try {
    //update db -  start crawling

    var filter = {
      socialMedia: socialMedia
    };
    var update = {
      requestHandling: true
    };
    await crawlingRequests.findOneAndUpdate(filter, update, {
      upsert: true
    });
    var crawlingTime = getDateAndTime();
    console.log(crawlingTime)

    var profilePost = new profile({
      url: url,
      userName: username,
      socialMedia: socialMedia,
      crawlingTime:crawlingTime
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

    await driver.get('https://guyandamir-sn.humhub.com/user/auth/login');
    await driver.sleep(10000);

    // need to add get user from db to login

    element = await driver.findElement(By.xpath('//*[@id="login_username"]'));
    await element.sendKeys('guyamir');
    element = await driver.findElement(By.xpath('//*[@id="login_password"]'));
    await element.sendKeys('15293amirh', Key.RETURN);
    setTimeout(function () {}, 3000);

    await driver.sleep(2000);
    await driver.get(url);
    await driver.manage().window().maximize();
    await driver.sleep(2000);
    await (driver).executeScript("window.scrollTo(0, document.body.scrollHeight);");
    await driver.sleep(2000);

    var className = ".wall-entry";
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
      var tempPostHeader1 = await element.findElements(By.css(".media-heading"));
      var tempPostHeader2 = await tempPostHeader1[0].getText();

      var postHeader = tempPostHeader2.split("PUBLIC");

      var date = await element.findElements(By.css(".media-subheading"));
      var postContentContainer = await element.findElements(By.css(".content"));
        
      if (postContentContainer.length > 0) //handle post content
        postContent = await postContentContainer[0].getText();
      else
        postContent = "";
      if   (await element.findElements(By.css(".show.show-all-link")) != 0){
          var commentsButton = await element.findElements(By.css(".show.show-all-link"));
          await commentsButton[0].click();
      }
    
      await driver.sleep(1000);
      var commentsContainer = await element.findElements(By.css(".media"));
      await driver.sleep(1000);
      var commentsArray = [];
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
          commentsArray.push({"commentHeader":commentheader[0],
          "commentContent": commentContent,
          "commentTime":commentTime});
        }

        var tempPost = new post({
          postHeader:  postHeader[0],
          postContent: postContent,
          comments: commentsArray,
          postTime: await date[0].getText()
        });
      }
      else {
        var tempPost = new post({
          postHeader:  postHeader[0],
          postContent: postContent,
          comments: [],
          postTime: await date[0].getText()
        });
      }
      await tempPost.save();
      profilePost.posts.push(tempPost);
      await driver.executeScript("arguments[0].scrollIntoView(false);", allPosts[index]);
      await driver.sleep(1000);
    }
    profilePost.save(function (err, result) {
      if (err) {
        console.log(err.message)
      } else {
        console.log("success")
      }
    });

    reset.resetHumHub();
  } catch (error) { //reset HumHub request in case there is error
    console.log(error);
    reset.resetHumHub();
  }
}
module.exports.crawler = crawler;



