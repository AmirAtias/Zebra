const {
    Key,
    By
} = require('selenium-webdriver');

var post = require('./post');

class crawlerUtilities {
    reset = require('./resetCrawlingReq');
    crawlingRequests = require('./crawlingRequests');
    profile = require('./profile');
    getRandomFictitiousUser = require("../models/getRandomFictitiousUser");

    addZeroToStart(t) {
        if (t.length == 1) {
            t = '0' + "" + t;
        }
        return t;
    }


    getDateAndTime() {
        var houer = this.addZeroToStart(new Date().getHours().toString());
        var minuets = this.addZeroToStart(new Date().getMinutes().toString());
        var secondes = this.addZeroToStart(new Date().getSeconds().toString());
        var month = this.addZeroToStart((new Date().getMonth() + 1).toString());
        var day = this.addZeroToStart(new Date().getDate().toString());

        return day + "/" + month + " " + houer + ":" + minuets + ":" + secondes;
    }

    fillProfileSchema(userUrl, username, socialMedia) {
        var crawlingTime = this.getDateAndTime();
        return new this.profile({
            url: userUrl,
            userName: username,
            socialMedia: socialMedia,
            crawlingTime: crawlingTime
        });
    }

    async scroolsToBottom(driver, allPostsClassName, numberOfPosts) {
        while (true) {
            await (driver).executeScript("window.scrollTo(0, document.body.scroll);");
            await driver.sleep(2000);
            await (driver).executeScript("window.scrollTo(0, document.body.scrollHeight);");
            var tempNumOfPosts = await driver.findElements(By.css(allPostsClassName));
            if (tempNumOfPosts.length == numberOfPosts) {
                break;
            } else {
                numberOfPosts = tempNumOfPosts.length;
            }
        }
    }

    async getAllPosts(driver, loginUrl, socialMedia, userNameId, passwordId, userUrl, allPostsClassName) {
        try {
            console.log("srart gut")
            await driver.get(loginUrl);
            await driver.sleep(10000);
            // get user from db to login
            var avatarData = await this.getRandomFictitiousUser.getRandomAvatar(socialMedia);
            element = await driver.findElement(By.xpath(userNameId));
            await element.sendKeys(avatarData[0]);
            element = await driver.findElement(By.xpath(passwordId));
            await element.sendKeys(avatarData[1], Key.RETURN);
            await driver.sleep(2000);
            await driver.get(userUrl);
            await driver.manage().window().maximize();
            await driver.sleep(2000);
            await (driver).executeScript("window.scrollTo(0, document.body.scrollHeight);");
            await driver.sleep(2000);
            var allPosts = await driver.findElements(By.css(allPostsClassName));
            var numberOfPosts = allPosts.length;
            //Scrolls to the bottom
            await this.scroolsToBottom(driver, allPostsClassName, numberOfPosts);
            allPosts = await driver.findElements(By.css(allPostsClassName));
            await driver.executeScript("arguments[0].scrollIntoView(false);", allPosts[0]); //  scrolling to top
            return allPosts;
        }
        catch (err) {
            console.log(err)
        }
    }

    creatPostSchema(postHeader, postContent, commentsArray, postTime) {
        return new post({
            postHeader: postHeader,
            postContent: postContent,
            comments: commentsArray,
            postTime: postTime
        });
    }

    fillCommentsArr(commentsArray, commentheader, commentContent, commentTime) {
        commentsArray.push({
            "commentHeader": commentheader,
            "commentContent": commentContent,
            "commentTime": commentTime
        });
    }

    saveProfilePost(profilePost) {
        profilePost.save(function (err) {
            if (err) {
                console.log(err.message)
            } else {
                console.log("success")
            }
        });
    }
}
module.exports.crawlerUtilities = crawlerUtilities;
