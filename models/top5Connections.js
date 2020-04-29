//check if current entry value is bigger then one of maxMap values and then replace
function checkIfEntryValueIsMatchToMaxMap (value, key, maxMap){
    var minKey = Number.MAX_VALUE;
    var minValue = Number.MAX_VALUE;

    maxMap.forEach(function(maxMapValue,maxMapKey){
        if(maxMapValue < minValue){
            minValue = maxMapValue;
            minKey = maxMapKey;
        }
    });

    if(minValue < value){
        maxMap.delete(minKey);
        maxMap.set(key,value);
    }
}
// return maxMap with k higest vlues in map
function getMaxMap(k,map){
    var maxMap = new Map();
    map.forEach(function(value, key){
        if ( maxMap.size < 5) {
            maxMap.set(key,value);
        }
        else{
            checkIfEntryValueIsMatchToMaxMap(value, key, maxMap);
        }
    });
    return maxMap;
}
//set writers and their num of comments/posts in a given map
async function setHeadersInMap(map,header){
    if(map.has(header)){
        var tempValue = await map.get(header);
        map.set(header,tempValue+1);
     }
     else {
         map.set(header,1);
     }
}
function getArrOfKeys(map){
    var keysArr = [];
    var index = 0;
    map.forEach(function(value,key){
        keysArr[index] = key;
        index++;
    });
    return keysArr;
}

async function getTop5connections(doc,userName) {
    console.log(userName);
    //options that username is stored in db 
    var userNameOptions = [userName+" ", userName+"\n", userName];

    var allConnectionsMap = new Map();
    var fiveHigestValuesInMap = new Map();

    try{
        for(post of doc.posts){
            if(post.postHeader != userNameOptions[0] &&post.postHeader != userNameOptions[1] &&post.postHeader != userNameOptions[2] ){
                var postHeader = post.postHeader + " ";
                setHeadersInMap(allConnectionsMap,postHeader);
            }
            for(comment of post.comments){
                if(comment.commentHeader != userNameOptions[0] && comment.commentHeader != userNameOptions[1] && comment.commentHeader != userNameOptions[2]){
                    setHeadersInMap(allConnectionsMap,comment.commentHeader);
                }
            }
        }
        // get new map with five higest values
        fiveHigestValuesInMap = getMaxMap(5,allConnectionsMap);
    }
    catch (error) { 
        console.log(error);
    } 
    console.log(getArrOfKeys(fiveHigestValuesInMap));
    return getArrOfKeys(fiveHigestValuesInMap);
} 


module.exports.getTop5connections = getTop5connections;
