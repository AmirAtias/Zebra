
  async function crawler(username, url,socialNetwork) {
    try {
     
      const {
        Builder,
        Key,
        promise,
        By,
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
  
      var currentUsername = "";
     // await driver.get(url);
      if(socialNetwork == "humhub"){
        await driver.get('https://guyandamir-sn.humhub.com/user/auth/login');
        await driver.sleep(10000);
    
        element = await driver.findElement(By.xpath('//*[@id="login_username"]'));
        await element.sendKeys('guyamir');
        element = await driver.findElement(By.xpath('//*[@id="login_password"]'));
        await element.sendKeys('15293amirh', Key.RETURN);
        
        await driver.sleep(4000);
        await driver.get(url);
        await driver.sleep(2000);
        element = await driver.findElement(By.css('.panel-profile-header'));
        currentUsername = await element.getText()
        console.log(currentUsername)
      }
      else if(socialNetwork == "worldExplorer"){
        await driver.get('http://localhost:3000');
        await driver.sleep(10000);
    
        element = await driver.findElement(By.xpath('//*[@id="root"]/div/div[2]/div[1]/div/div/form/div/div[1]/input'));
    
        await element.sendKeys('oshri@gmail.com');
        element = await driver.findElement(By.xpath('//*[@id="root"]/div/div[2]/div[1]/div/div/form/div/div[2]/input'));
        await element.sendKeys('123456789', Key. RETURN);    
        await driver.sleep(2000);
    
        await driver.get(url);
        await driver.sleep(2000);
        element = await driver.findElement(By.css('.sc-jTzLTM.gsLxCE'));
        currentUsername = await element.getText()
        console.log(currentUsername)
      }
      else if(socialNetwork == "facebook"){

      }
     else { 
         console.log("This social network cannot be used with this software")
         currentUsername = "";
     } 
     if (currentUsername == username ){
       console.log(true);
     }
     else{
      console.log(false);

     }
  
    } catch (error) { //reset HumHub request in case there is error
      console.log(error);
    }
  }
  
  crawler("itai levi", "https://guyandamir-sn.humhub.com/u/itai/","humhub")
  crawler("oshri", "http://localhost:3000/oshri","worldExplorer")
