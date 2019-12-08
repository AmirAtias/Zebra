var crawlingRequests = require('./crawlingRequests');
var update = { requestHandling: false };
async function resetCrawlingReq(){
    resetFacebook();
    resetTwitter();
 
}

async function resetFacebook(){
    await crawlingRequests.findOneAndUpdate({socialMedia: "facebook"}, update,{
        upsert: true //create new document in case there is no match
      });
}
async function resetTwitter(){
    await crawlingRequests.findOneAndUpdate({socialMedia: "twitter"}, update,{
        upsert: true
      });
}
module.exports.resetCrawlingReq=resetCrawlingReq;
module.exports.resetFacebook=resetFacebook;
module.exports.resetTwitter=resetTwitter;