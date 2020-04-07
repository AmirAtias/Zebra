function convertUTCDateToLocalDate(date) {
    var newDate = new Date(date.getTime()+date.getTimezoneOffset()*60*1000);
  
    var offset = date.getTimezoneOffset() / 60;
    var hours = date.getHours();
  
    newDate.setHours(hours - offset);
  
    return newDate;   
  }
  
  function randomInt(min, max) {
      return min + Math.floor((max - min) * Math.random());
  }
  
  
  var utcDate =  new Date;
  var creatTime = convertUTCDateToLocalDate(utcDate);
  
  var newUserSchema = require('./newUsersWorldExplorer');
    /*
  var crawlingRequests = require('./crawlingRequests');
  var reset = require('./resetCrawlingReq');
  var post = require('./post');
  */
  
  async function CreatingFictitiousUser(username, url) {
    const socialMedia = "worldExplorer"
    try {
      //update db -  start crawling
  
      var filter = {
        socialMedia
      };
  /*
      var newUser = new facebookSchema({
        fullName: newName,
        userName: newUsername,
        email: newEmail,
        password: newPassword,
        creatTime:creatTime

      });
  */
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
      
      // Creates a first and last name and puts them in the text box
      random_name =  require('node-random-name');
      var firstName = await random_name({ first: true, gender: "male" });
      var lastName =await random_name({ last: true });
      newName = firstName+lastName;
      element = await driver.findElement(By.xpath('//*[@id="root"]/div/div[2]/div[2]/div/div[2]/form/input[1]'));
      await element.sendKeys(newName);
      // Creates a new email and puts it in email text box
      var newEmail = newName + '@gmail.com'
      element = await driver.findElement(By.xpath('//*[@id="root"]/div/div[2]/div[2]/div/div[2]/form/div[1]/input'));
      await element.sendKeys(newEmail);
      // Creates a new username and puts it in useranme text box
      var tempUserNumber = await randomInt(1,10000);
      var newUsername = newName + tempUserNumber;
      element = await driver.findElement(By.xpath('//*[@id="root"]/div/div[2]/div[2]/div/div[2]/form/input[2]'));
      await element.sendKeys(newUsername);
      // Creates a new password and puts it in password text box
      var generator = require('random-password');
      var newPassword = generator(10);
      element = await driver.findElement(By.xpath('//*[@id="root"]/div/div[2]/div[2]/div/div[2]/form/div[2]/input'));
      await element.sendKeys(newPassword, Key.RETURN);
      setTimeout(function () {}, 3000);
  
      await driver.sleep(2000);
  
        
       var newUser = new newUserSchema({
          fullName: newName,
          userName: newUsername,
          email: newEmail,
          password: newPassword,
          creatTime:creatTime
          });
        
       // await newUser.save();
       // Facebookposts.posts.push(newUser);
       // await driver.executeScript("arguments[0].scrollIntoView(false);", allPosts[index]);
        await driver.sleep(1000);
      
        newUser.save(function (err, result) {
        if (err) {
          console.log(err.message)
        } else {
          console.log("success creat")
        }
      });
  
      reset.resetWorldExplorer();
    } catch (error) { //reset worldExplorer request in case there is error
      console.log(error);
     // reset.resetWorldExplorer();
    }
  
  }
  
  
  
  