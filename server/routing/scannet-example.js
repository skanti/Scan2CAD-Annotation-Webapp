let express = require("express");
let path = require("path");
var fs = require("fs");
let config = require("../config");
let mongodb_helper = require("../mongodb_helper");

module.exports = function() {

    let router = express.Router();

    router.get("/download/scan/thumbnail/:id", function(req, res) {
        let file = path.join(__dirname, "../../resources/", "apple.jpg");
        res.sendFile(file);
    });

    router.get("/download/scan/mesh/:id/:file?", function(req, res) {
        let file = path.join(__dirname, "../static/", config.dataset_scan, req.params.id, req.params.id + "_vh_clean_2.ply");
        res.sendFile(file);
    });

    router.get("/download/scan/label/:id/:file?", function(req, res) {
        let file = path.join(__dirname, "../static/", config.dataset_scan, req.params.id, req.params.id + "_vh_clean_2.labels.ply");
        res.sendFile(file);
    });

    router.get("/db/scan/catid2catname", function (req, res) {
        let file = path.join(__dirname, "../static/", config.dataset_scan, "scannet-labels2names.json");
		console.log(file)
		fs.readFile(file, 'utf8', (error, data) => {
			if (!error && data) {
				let data_parsed = JSON.parse(data);
        		res.send(data_parsed);
			} 
		});
		
    });

    router.get("/db/scan/all", function (req, res) {
        let data = [{"id" : "scene0470_00"}] // <- should contain a list of all scans that you want to annotate
        res.send(data);
    });

    return router;
};
