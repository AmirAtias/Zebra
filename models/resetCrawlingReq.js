var crawlingRequests = require('./crawlingRequests');
var update = { requestHandling: false };
async function resetCrawlingReq(){
    resetFacebook();
    resetWorldExplorer();
    resetHumHub();
 
}

async function resetFacebook(){
    await crawlingRequests.findOneAndUpdate({socialMedia: "facebook"}, update,{
        upsert: true //create new document in case there is no match
      });
}
async function resetWorldExplorer(){
    await crawlingRequests.findOneAndUpdate({socialMedia: "worldExplorer"}, update,{
        upsert: true
      });
}
async function resetHumHub(){
    await crawlingRequests.findOneAndUpdate({socialMedia: "humhub"}, update,{
        upsert: true
      });
}
module.exports.resetCrawlingReq=resetCrawlingReq;
module.exports.resetFacebook=resetFacebook;
module.exports.resetWorldExplorer=resetWorldExplorer;
module.exports.resetHumHub=resetHumHub;