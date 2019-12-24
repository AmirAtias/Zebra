

var facebookSchema = require('./facebookPosts');
var crawlingRequests = require('./crawlingRequests');
var reset = require('./resetCrawlingReq');
var post = require('./post');
async function crawler(username, url) {
  try {
    //update db -  start crawling

    var filter = {
      socialMedia: "worldExplorer"
    };
    var update = {
      requestHandling: true
    };
    await crawlingRequests.findOneAndUpdate(filter, update, {
      upsert: true
    });
    var Facebookposts = new facebookSchema({
      facebookUserName: "edenshavit",
      url: "http://localhost:3000/edenshavit",
    });
    console.log(username);
    console.log(url);
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

    await element.sendKeys('itaiguymay1234@gmail.com');
    element = await driver.findElement(By.xpath('//*[@id="root"]/div/div[2]/div[1]/div/div/form/div/div[2]/input'));
    await element.sendKeys('amirguy1234', Key.RETURN);
    setTimeout(function () {}, 3000);

    await driver.sleep(2000);

    await driver.get(url);
    await driver.manage().window().maximize();
    await driver.sleep(2000);
    await (driver).executeScript("window.scrollTo(0, document.body.scrollHeight);");
    await driver.sleep(2000);

    var className = ".sc-gqPbQI.hcaOkx";
    var AllPosts = await driver.findElements(By.css(className));
    var numberOfPosts = AllPosts.length;

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

    var finalAllPosts = await driver.findElements(By.css(className));
    await driver.executeScript("arguments[0].scrollIntoView(false);", finalAllPosts[0]); //  scrolling to top
    for (let index = 0; index < finalAllPosts.length; index++) {
      const element = finalAllPosts[index];
      var postHeader = await element.findElements(By.css(".sc-iujRgT.eHHHfk"));
      var date = await element.findElements(By.css(".sc-bMVAic.ddJtUJ"));
      var header = await postHeader[0].getText() + " date: " + await date[0].getText();
      console.log(header);

      var postContentContainer = await element.findElements(By.css(".sc-jzJRlG.fkPtct"));
      var postContent;
      if (postContentContainer.length > 0) //handle post content
        postContent = await postContentContainer[0].getText();
      else
        postContent = "";
      var commentsButton = await element.findElements(By.css(".sc-ifAKCX.sc-lkqHmb.hdufcJ"));
      await commentsButton[0].click();
      await driver.sleep(1000);
      console.log(postContent);
      var commentsContainer = await element.findElements(By.css(".sc-kfGgVZ.hcILRE"));
      await driver.sleep(1000);
      var tempCommentsArr = [];
      if (commentsContainer.length > 0) { //check if the post contian comments
        await driver.sleep(1000);
        console.log(commentsContainer.length);
        for (e of commentsContainer) {
          tempCommentsArr.push(await e.getText());
          console.log(await e.getText());
        }
        var tempPost = new post({
          postHeader: await postHeader[0].getText(),
          postContent: postContent,
          comments: tempCommentsArr
        });
      
      }
      //res.send(allPostsContent[0].replace(/\n/g, "<br />"));
      else {
        var tempPost = new post({
          postHeader: await postHeader[0].getText(),
          postContent: postContent,
          comments: []
        });
      }
      await tempPost.save();
      Facebookposts.posts.push(tempPost);
      await driver.executeScript("arguments[0].scrollIntoView(false);", AllPosts[index]);
      await driver.sleep(1000);
    }
    //guy
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
module.exports.crawler = crawler;



