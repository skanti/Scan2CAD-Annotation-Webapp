const MongoClient = require("mongodb").MongoClient
var ObjectId = require("mongodb").ObjectID;

const connect_to_db = (credential) => {
    return new Promise((resolve, reject) => {
        let url = "mongodb://" + credential.user + ":" + credential.pw + "@" + credential.host + "/" + credential.db + "?&authSource=admin";
        MongoClient.connect(url, function (err, data) {
            if (err === null) {
                resolve(data);
            } else {
                console.log("\nCould not connect to mongo with: ", url);
                console.log("Have you setup a user, database and a collection in mongo?\n");
                reject();
            }
        });
    });
}

module.exports = {connect_to_db};
