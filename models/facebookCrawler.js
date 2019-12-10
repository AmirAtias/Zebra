var facebookSchema = require('./facebookPosts');
var crawlingRequests = require('./crawlingRequests');
var reset = require('./resetCrawlingReq');
var post = require('./post');
async function crawler(username, url) {
  try {

    //update db -  start crawling
    var filter = { socialMedia: "facebook" };
    var update = { requestHandling: true };
    await crawlingRequests.findOneAndUpdate(filter, update, {
      upsert: true
    });
    var Facebookposts = new facebookSchema({
      facebookUserName: "Amit Atias",
      url: "https://www.facebook.com/profile.php?id=100001660335679",
    });
    console.log(username);
    console.log(url);
    const { Builder, Key, promise, until, By, webdriver } = require('selenium-webdriver');
    require('selenium-webdriver/lib/error');
    const firefox = require('selenium-webdriver/firefox');
    promise.USE_PROMISE_MANAGER = false;
    var firefoxOptions = new firefox.Options();
    firefoxOptions.setPreference("dom.webnotifications.enabled", false);
    const driver = new Builder()
      .forBrowser("firefox")
      .setFirefoxOptions(firefoxOptions)
      .build();
    await driver.get("https://www.facebook.com");

    //there is 2 login page options - handle both of them
    var logingPagePlaceHolders = await driver.findElements(By.css(".inputtext._55r1._6luy"));
    var logingPagePlaceHolders = await driver.findElements(By.css("._8opu"))
    if (logingPagePlaceHolders.length > 0) {
      await logingPagePlaceHolders[0].click();
      await logingPagePlaceHolders[0].sendKeys("amirzebra505@gmail.com")
      await logingPagePlaceHolders[1].click();
      await logingPagePlaceHolders[1].sendKeys("0522924825")
      await driver.findElement(By.name("login")).click()
    }
    else {
      await driver.findElement(By.id("email")).click()
      await driver.findElement(By.id("email")).sendKeys("amirzebra505@gmail.com")
      await driver.findElement(By.id("pass")).click()
      await driver.findElement(By.id("pass")).sendKeys("0522924825")
      await driver.findElement(By.id("loginbutton")).click()
    }
    await driver.get("https://www.facebook.com/profile.php?id=100001660335679")
    await driver.sleep(2000);
    await driver.manage().window().maximize();
    var existed = false;

    while (!existed) { // load all hidden posts
      existed = await driver.findElement(By.css(".img.sp_jgaSVtiDmn__1_5x.sx_dd9709")).then(function () {
        return true;//it existed
      }, function (err) {
        if (err.name === "NoSuchElementError") {
          driver.executeScript("window.scrollTo(0, document.body.scrollHeight);");//keep scrolling
          driver.sleep(2000);
          return false;//it was not found
        } else {
          promise.rejected(err);
        }
      });
    }


    var showAllPostsButton = await driver.findElements(By.css(".showAll._5q5v")); //show all hidden posts under the same date
    var iterator = showAllPostsButton.length - 1;
    console.log(iterator);
    while (iterator >= 0) {
      await driver.executeScript("arguments[0].scrollIntoView(false);", showAllPostsButton[iterator]); //the bottom of the element will be aligned to the bottom of the visible area of the scrollable ancestor
      await showAllPostsButton[iterator].click();
      iterator--;
      await driver.sleep(5000);
    }
    var AllPostsClassName = ["._5pcr.userContentWrapper", "._5pa-.userContentWrapper"]
    for (postsClassName of AllPostsClassName) {
      var AllPosts = await driver.findElements(By.css(postsClassName));
      await driver.executeScript("arguments[0].scrollIntoView(false);", AllPosts[0]); //  scrolling to top
      console.log(AllPosts.length)
      for (let index = 0; index < AllPosts.length; index++) {
        const element = AllPosts[index];
        let showMoreButton = await element.findElements(By.css(".see_more_link_inner"));//check if post contian show more button
        if (showMoreButton.length > 0)
          await showMoreButton[0].click();

        var postHeader = await element.findElements(By.css("._6a._5u5j._6b"));
        var postContentContainer = await element.findElements(By.css("._5pbx.userContent._3576"));
        var postContent;
        if (postContentContainer.length > 0)//handle post content
          postContent = await postContentContainer[0].getText();
        else
          postContent = "";
        let commentsButton = await element.findElements(By.css("._3hg-._42ft"));
        if (commentsButton.length > 0) {//check if the post contian comments
          var commentsContainer = await element.findElements(By.css("._7791"));
          if (commentsContainer.length == 0) {//check if comments are not visible
            await commentsButton[0].click();
            commentsContainer = await element.findElements(By.css("._7791"));
            await driver.sleep(1000);
          }
          let loadMoreCommentsButton = await element.findElements(By.css("._4sxc._42ft"));
          if (loadMoreCommentsButton.length > 0) //check if post contian load more comments button
            await loadMoreCommentsButton[0].click();
          await driver.sleep(1000);
          let loadAllReplays = await element.findElements(By.css("._4sxc._42ft"));
          for (loadReplayButton of loadAllReplays) { //check if post contian loadAllReplays button
            await loadReplayButton.click();
          }
          var s = await element.findElements(By.css("._6a._5u5j._6b"));
          var tempCommentsArr = [];
          if (commentsContainer.length > 0) { //  commentsContainer.length==0 , meaning  there is a bug(facebook bug)
            var allComments = await driver.executeScript("return arguments[0].childNodes; ", commentsContainer[0]);
            for (e of allComments) {
              tempCommentsArr.push(await e.getText());
            }
          }
          var b = await element.findElements(By.css("._5wj-"))
          var tempPost = new post({
            postHeader: await postHeader[0].getText(),
            postContent: postContent,
            comments: tempCommentsArr
          });

          await tempPost.save();
          
          Facebookposts.posts.push(tempPost);




        }
        //res.send(allPostsContent[0].replace(/\n/g, "<br />"));
        else {
          var tempPost = new post({
            postHeader: await postHeader[0].getText(),
            postContent: postContent,
            comments: []
          });

          await tempPost.save();

          Facebookposts.posts.push(tempPost);
          await driver.executeScript("arguments[0].scrollIntoView(false);", AllPosts[index]);
          await driver.sleep(1000);
        }

      }

      Facebookposts.save(function (err, result) {
        if (err) {
          console.log(err.message)
        }
        else {
          console.log("success")
        }
      });

      //await driver.sleep(600000);
      reset.resetFacebook();

    }


  } catch (error) { //reset facbook request in case there is error
    console.log(error);
    reset.resetFacebook();
  }

}




module.exports.crawler = crawler;