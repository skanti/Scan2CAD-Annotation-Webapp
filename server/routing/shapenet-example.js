let express = require("express");
let path = require("path");
let config = require("../config");
let request = require("request");
let mongodb_helper = require("../mongodb_helper");


module.exports = function(dbs_mongo) {

    let router = express.Router();

    router.get("/download/cad/mesh/:catid/:id", function (req, res) {
        let file = path.join(__dirname, "../static/", config.dataset_cad, req.params.catid, req.params.id, "models", "model_normalized.obj");
        res.sendFile(file);
    });

    router.get("/download/cad/mtl/:catid/:id", function (req, res) {
        let file = path.join(__dirname, "../static/", config.dataset_cad, req.params.catid, req.params.id, "models", "model_normalized.mtl");
        res.sendFile(file);
    });

    router.get("/download/cad/texture/:catid/:id/*", function (req, res) {
        let file = path.join(__dirname, "../static/", config.dataset_cad, req.params.catid, req.params.id, "models", req.params[0].substring(1));
        res.sendFile(file);
    });

    router.get("/download/cad/image/:type/:cadid/:id", function (req, res) {
        let suffix = "";
          if (req.params.type === "front")
              suffix =  "-6_thumb.png";
          else if (req.params.type === "gif")
              suffix =  ".gif";

          const image_name = req.params.id;
          const image_name1 = image_name.substring(5);
          const ipx = image_name.substring(0, 5);
          let file =  path.join(__dirname, "../static/shapenet-example-thumbnails/", ipx[0], ipx[1], ipx[2], ipx[3], ipx[4], image_name1, image_name, image_name + suffix);
          res.sendFile(file);
    });

    router.get("/db/cad/catid2catname", function (req, res) {
        res.send({});
    });

    router.get("/db/cad/search/:category/:start", function (req, res) {
        let data = [
            {catid_cad : "02747177", id_cad : "85d8a1ad55fa646878725384d6baf445"},
            {catid_cad : "03001627", id_cad : "2c03bcb2a133ce28bb6caad47eee6580"},
            {catid_cad : "03001627", id_cad : "b4371c352f96c4d5a6fee8e2140acec9"},
            {catid_cad : "04379243", id_cad : "142060f848466cad97ef9a13efb5e3f7"}

        ];
        let n_matches_found = data.length;
        res.send({n_matches_found : n_matches_found, data : data});
    });

    return router;

};
