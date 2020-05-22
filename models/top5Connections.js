//check if current entry value is bigger then one of maxMap values and then replace
function checkIfEntryValueIsMatchToMaxMap(value, key, maxMap) {
    var minKey = Number.MAX_VALUE;
    var minValue = Number.MAX_VALUE;

    maxMap.forEach(function (maxMapValue, maxMapKey) {
        if (maxMapValue < minValue) {
            minValue = maxMapValue;
            minKey = maxMapKey;
        }
    });

    if (minValue < value) {
        maxMap.delete(minKey);
        maxMap.set(key, value);
    }
}
// return maxMap with k higest vlues in map
function getMaxMap(k, map) {
    var maxMap = new Map();
    map.forEach(function (value, key) {
        if (maxMap.size < 5) {
            maxMap.set(key, value);
        }
        else {
            checkIfEntryValueIsMatchToMaxMap(value, key, maxMap);
        }
    });
    return maxMap;
}
//set writers and their num of comments/posts in a given map
async function setHeadersInMap(map, header) {
    if (map.has(header)) {
        var tempValue = await map.get(header);
        map.set(header, tempValue + 1);
    }
    else {
        map.set(header, 1);
    }
}
function getArrOfKeys(map) {
    var keysArr = [];
    var index = 0;
    map.forEach(function (value, key) {
        keysArr[index] = key;
        index++;
    });
    return keysArr;
}
function userNameOptions(userName) {
    return [userName + " ", userName + "\n", userName];
}

async function checkIfTheNameExistsDifferently(userName, arrOfOriginalUserNameOptions) {
    //Checks whether this is not the username that the profile belongs to
    if (userName != arrOfOriginalUserNameOptions[0] && userName != arrOfOriginalUserNameOptions[1] && userName != arrOfOriginalUserNameOptions[2]) {
            if(userName.endsWith("\n")){
                userName = await userName.substring(0, userName.length-1);
                userName += " ";
            }
            return userName;
    }
    return "";
}
async function getTop5connections(doc, userName) {
    //all options that username is appears on social media
    var arrOfOriginalUserNameOptions = userNameOptions(userName);
    var allConnectionsMap = new Map();
    var fiveHigestValuesInMap = new Map();
    try {
        for (post of doc.posts) {
            var Header = await checkIfTheNameExistsDifferently(post.postHeader, arrOfOriginalUserNameOptions);
            if (Header != "") { 
                await setHeadersInMap(allConnectionsMap, Header);
            }
            for (comment of post.comments) {
                Header = await checkIfTheNameExistsDifferently(comment.commentHeader, arrOfOriginalUserNameOptions);
                if (Header != "") {
                    await setHeadersInMap(allConnectionsMap, Header);
                }
            }
        }
        // get new map with five higest values
        fiveHigestValuesInMap = getMaxMap(5, allConnectionsMap);
    }
    catch (error) {
        global.logger.error("error when trying to get top 5 connections", {meta: {err: error.message}})
    }
    return getArrOfKeys(fiveHigestValuesInMap);
}

module.exports.getTop5connections = getTop5connections;
