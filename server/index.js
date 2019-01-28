var http = require("http");
var fs = require("fs");
var path = require("path");
var bodyParser = require("body-parser");
var assert = require("assert");
var ObjectId = require("mongodb").ObjectID;
var mongodb_helper = require("./mongodb_helper");
var request = require("request");
const querystring = require('querystring');
var express = require("express");
var app = express();
var router = express.Router();
var d3 = require('d3');

// -> load config parameters like base-url, port, dataset-name
let config = require("./config");
var routing_scan = null;
var routing_cad = null;
// <-


let db_annotation = {};

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));


// -> annotation results
router.get("/db/annotations/all", function (req, res) {
    let collection = db_annotation.collection(config.db_annotation.collection);

    collection.find().toArray((err, data) => {
        if (err) { return console.error(err); }

        res.send(data);
    });
});

router.put("/db/annotations", function (req, res) {
    let collection = db_annotation.collection(config.db_annotation.collection);


    if (req.body.id_annotation) {
        let id_annotation = req.body.id_annotation;
        let item = {"$push" : {"data" : req.body}}
        // -> update
        collection.update({"_id" : new ObjectId(id_annotation)}, item, (err, data) => {
            if (err) { console.log(err);}
            res.send(data);
        });
        // <-
    } else {
        // -> insert
        let item = {"data" : [req.body]}
        collection.insert( item, (err, data) => {
            if (err) { console.log(err);}
            res.send(data);
        });
        // <-
    }
});

router.put("/db/annotations/message", function (req, res) {
    let collection = db_annotation.collection(config.db_annotation.collection);


	let message = req.body.message;
	let id_annotation = req.body.id_annotation;
    if (id_annotation) {
        collection.findOne( {"_id" : new ObjectId(id_annotation)}, (err, data) => {
    		if (err) { return next(err); }
    		data["data"][data["data"].length - 1].message_verification = message;

			collection.update({"_id" : new ObjectId(id_annotation)}, data);
		});
	}
});

router.put("/db/annotations/checked", function (req, res) {

	const id_annotation = req.query.id;
	const mode = req.query.checked;

    let collection = db_annotation.collection(config.db_annotation.collection);


	collection.findOne( {"_id" : new ObjectId(id_annotation)}, (err, data) => {
		if (err) { return next(err); }
		data["data"][data["data"].length - 1].checked = mode;

        collection.update({"_id" : new ObjectId(id_annotation)}, data);
	});
});

router.get("/db/annotations/:id", function (req, res) {
    let collection = db_annotation.collection(config.db_annotation.collection);


    if (req.params.id === "next") {
        if (cursor_annotation === null)
            cursor_annotation = collection.find();

        if (cursor_annotation.hasNext()) {
            cursor_annotation.next((err, data) => {
                if (err) return null;
                res.send(data);
            });
        }
    } else {
        collection.find( {"_id" : new ObjectId(req.params.id)}).toArray((err, data) => {
            if (err) { return next(err); }
            res.send(data);
        });
    }
});

router.delete("/db/annotations/:id", function (req, res) {
    let collection = db_annotation.collection(config.db_annotation.collection);


    collection.remove( {"_id" : new ObjectId(req.params.id)}, (err, data) => {
        if (err) { return next(err); }
        res.send(data);
    });
});

// <-



router.get("/viewer/:id", function (req, res) {
    res.render("SceneViewer", {
        id_annotation : req.params.id,
    })
});


router.get("/new/:id", function (req, res) {
    res.render("Scan2CAD", {
        id_scan : req.params.id,
        mode : "new"
    })
});

router.get("/edit/:id", function (req, res) {

    res.render("Scan2CAD", {
        id_annotation : req.params.id,
        mode : "edit"
    })
});

router.get("/menu/", function (req, res) {
    res.render("Scan2CADMenu", {
    });
});
// <-

router.get('/', function (req, res) {
    // res.redirect(config.base_url + "/menu");
});

app.use(config.base_url, router);
module.exports = router;

app.use(express.static(path.join(__dirname, "../client")));
app.use(express.static(path.join(__dirname, "../node_modules")));
app.use(express.static(path.join(__dirname, "../resources")));
app.use(express.static(path.join(__dirname, "./static")));



function do_checks_and_assertions() {
    if (!config.is_release) {
        let path_scan = path.join(__dirname, "/static/", config.dataset_scan);
        assert(fs.existsSync(path_scan), "Dataset for scan not found in /server/static/");

        let path_scan_routing = path.join(__dirname, "/routing/", config.dataset_scan + ".js");
        assert(fs.existsSync(path_scan_routing), "Routing for scan not found in /server/routing/");

        let path_cad = path.join(__dirname, "/static/", config.dataset_cad);
        assert(fs.existsSync(path_cad), "Dataset not found in /server/static/");

        let path_cad_routing = path.join(__dirname, "/routing/", config.dataset_cad + ".js");
        assert(fs.existsSync(path_cad_routing), "Routing for scan not found in /server/routing/");
    }
}

function load_routings() {
    routing_scan = require("./routing/" + config.dataset_scan)();
    router.use('/', routing_scan);

    routing_cad = require("./routing/" + config.dataset_cad)();
    router.use('/', routing_cad);

}


mongodb_helper.connect_to_db(config.db_annotation).then( res => {
    db_annotation = res;
    const server = app.listen(config.http_port, () => {
        do_checks_and_assertions();
        load_routings();
        const host = server.address().address;
        const port = server.address().port;
        console.log("Example app listening at address http://%s in port: %s", host, port)
    });
});
