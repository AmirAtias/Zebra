var crawlingRequests = require('./crawlingRequests');
var app = require('../app');
var update = { requestHandling: false };
async function resetCrawlingReq() {
    resetFacebook();
    resetWorldExplorer();
    resetHumHub();

}

async function resetFacebook() {
    await crawlingRequests.findOneAndUpdate({ socialMedia: "facebook" }, update, {
        upsert: true //create new document in case there is no match
    });
    reqStatus = false;

}
async function resetWorldExplorer() {
    await crawlingRequests.findOneAndUpdate({ socialMedia: "worldExplorer" }, update, {
        upsert: true
    });
    reqStatus = false;

}
async function resetHumHub() {
    await crawlingRequests.findOneAndUpdate({ socialMedia: "humhub" }, update, {
        upsert: true
    });
    reqStatus = false;

}
module.exports.resetCrawlingReq = resetCrawlingReq;
module.exports.resetFacebook = resetFacebook;
module.exports.resetWorldExplorer = resetWorldExplorer;
module.exports.resetHumHub = resetHumHub;