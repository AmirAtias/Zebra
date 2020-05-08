var utilitiesRequire = require("../models/crawlerUtilities");
var utilities = new utilitiesRequire.crawlerUtilities();

async function checkURL(username, url, socialNetwork) {
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
    var avatarData = await utilities.getRandomFictitiousUser.getRandomAvatar(socialNetwork);

    if (socialNetwork == "humhub") {
      await driver.get('https://guyandamir-sn.humhub.com/user/auth/login');
      await driver.sleep(10000);
      // get user from db
      element = await driver.findElement(By.xpath('//*[@id="login_username"]'));
      // await element.sendKeys('guyamir');
      await element.sendKeys(await avatarData[0]);

      element = await driver.findElement(By.xpath('//*[@id="login_password"]'));
      await element.sendKeys(await avatarData[1], Key.RETURN);
      await driver.sleep(4000);
      await driver.get(url);
      await driver.sleep(2000);
      element = await driver.findElement(By.css('.profile'));
      currentUsername = await element.getText()
      console.log(currentUsername)
    }
    else if (socialNetwork == "WorldExplorer") {
      console.log("here " + socialNetwork)
      await driver.get('http://localhost:3000');
      await driver.sleep(10000);
      element = await driver.findElement(By.xpath('//*[@id="root"]/div/div[2]/div[1]/div/div/form/div/div[1]/input'));
      await element.sendKeys(avatarData[0]);
      element = await driver.findElement(By.xpath('//*[@id="root"]/div/div[2]/div[1]/div/div/form/div/div[2]/input'));
      await element.sendKeys(avatarData[1], Key.RETURN);
      await driver.sleep(2000);
      await driver.get(url);
      await driver.sleep(2000);
      element = await driver.findElement(By.css('.sc-jTzLTM.gsLxCE'));
      currentUsername = await element.getText()
      console.log(currentUsername)
    }
    else if (socialNetwork == "facebook") {

    }
    else {
      console.log("122334545 " + socialNetwork)

      console.log("This social network cannot be used with this software")
      currentUsername = "";
    }
    await driver.close();
    return (currentUsername === username);

  } catch (error) {
    console.log(error);
    return false;
  }
}

module.exports.checkURL = checkURL;

