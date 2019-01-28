
import React from 'react';
import ReactDOM from 'react-dom';

import SkipSubmitUI from "../view/SkipSubmitUI";
import UserPromptUI from "../view/UserPromptUI";

class SkipSubmitController {
    init(user, mode, id_annotation, model_manager, info_model) {
        this.user = user;
        this.mode = mode;
        this.id_annotation = id_annotation;
        this.model_manager = model_manager;
        this.info_model = info_model;


        this.data_old = null;
        this.messages = {verification : "", annotation : ""};
    }

    add_data_old(data_old) {
        this.data_old = data_old;

        this.messages["verification"] = data_old["message_verification"];
        this.messages["annotation"] = data_old["message_annotation"];
    }

    restart() {
        throw new Error('Define restart.');
    }

    set_restart_func(func) {
        this.restart = func;
    }

    onclick_skip() {
        this.restart();
    }


    sort_dict(src) {
		let ordered = {};
		Object.keys(src).sort().forEach(key => { ordered[key] = src[key];});
		return ordered;
	}

    package_data(data_old) {
        let data = {
            id_user : this.user.id,
            date : this.user.date.toString(),
            duration : (Date.now() - this.user.time_start)*0.001,
            id_scan: this.model_manager.scene.id,
            trs : this.model_manager.scene.package_model_data(),
            n_aligned_models :Object.keys(this.model_manager.id2obj).length,
            aligned_models : [],
            checked : "0",
            message_verification : this.messages.verification,
            message_annotation : this.messages.annotation,
        };

        // -> sort by index
        this.model_manager.index2id = this.sort_dict(this.model_manager.index2id);
        // <-

        for (let key0 in this.model_manager.index2id) {
            let key = this.model_manager.index2id[key0];
            const obj = this.model_manager.id2obj[key];
            const keypoint0 = this.model_manager.id2keypoint0[key];
            const keypoint1 = this.model_manager.id2keypoint1[key];
            const id_cad = {id_cad : this.model_manager.id2idcad[key]};
            const catid_cad = {catid_cad : this.model_manager.id2catidcad[key]};
            const trs = { trs : obj.package_model_data()};
            const bbox = { bbox : obj.bounding_box.toArray()};
            const center = { center : obj.bbox_center.toArray()};
            const keypoint0_data = {keypoint0 : keypoint0.package_data()};
            const keypoint1_data = {keypoint1 : keypoint1.package_data()};
            const aligned_model = Object.assign({}, id_cad, catid_cad, trs, bbox, center, keypoint0_data, keypoint1_data);
            data.aligned_models.push(aligned_model);

        }
        return data;
    }

    insert_or_update_item() {
        return new Promise((resolve, reject) => {
            let data = this.package_data(this.data_old);

            if (this.mode == "new") {
                xhr_push("PUT","db/annotations", data).then( (res) => {
                    let id = res.insertedIds[0];
                    console.log("Saved in db as _id: " + id);
                    resolve();
                });
            } else if (this.mode == "edit"){
                data.id_annotation = this.id_annotation;
                xhr_push("PUT","db/annotations", data).then( (res) => {
                    console.log("Saved in db!");
                    resolve();
                });
            }
        });

    }

    onclick_submit() {

        ReactDOM.render(<UserPromptUI onclick_ok={this.submit.bind(this)} onclick_back={this.draw.bind(this)}/>, document.getElementById('id_div_skip_submit'));

    }

    submit(username) {
        this.user.id = username;

        if (Object.keys(this.model_manager.id2obj).length > 0) {
            this.insert_or_update_item().then(res => {
                window.location.assign("/Scan2CAD/menu/");
            });
        }
    }

    draw() {
        ReactDOM.render(
            <SkipSubmitUI onclick_skip={this.onclick_skip.bind(this)} onclick_submit={this.onclick_submit.bind(this)} messages={this.messages}/>,
            document.getElementById('id_div_skip_submit'));
    }


}

export default SkipSubmitController;
