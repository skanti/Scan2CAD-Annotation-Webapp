let Config = {};

Config.base_url = "/Scan2CAD"; // <- don't change this

Config.http_port = 8080; // <- port
Config.is_release = false; // <-- true for release, false for debug

Config.dataset_scan = "scannet-example"; // <- ply and obj accepted
Config.dataset_cad = "shapenet-example"; // <- ply and obj accepted

Config.db_annotation = {
    host : "localhost:27017", user : "guest", pw : "guest", // <-- login for mongo
    db : "scan2cad", collection : "correspondences" // <-- database and collection name
};

module.exports = Config;
