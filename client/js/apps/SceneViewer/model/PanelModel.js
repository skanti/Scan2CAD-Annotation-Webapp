import React from 'react';
import ReactDOM from 'react-dom';

import PanelUI from "../view/PanelUI";

class PanelModel {
    init() {
        this.is_active = 0;
        this.is_visible = 0;
    }

    set_active(value) {
        this.is_active = value;
    }


    draw(id_annotation, res) {
        let n_objs = res.aligned_models.length;
        let n_kps = 0;
        for (let key in res.aligned_models) {
            n_kps += res.aligned_models[key].keypoint0.n_keypoints;
        }

        let messages = {verification: res.message_verification, annotation : res.message_annotation};
        ReactDOM.render(
            <PanelUI id={id_annotation} user={res.id_user} n_objs={n_objs} n_kps={n_kps} checked={res.checked} messages={messages} onclick_radio={this.onclick_radio.bind(this)}
            onclick_messagebox={this.onclick_messagebox.bind(this)} onclick_radio={this.onclick_radio.bind(this)} />,
            document.getElementById("id_div_verification"));
    }


    onclick_radio(id_keypointalignment, mode) {
        let params = {id : id_keypointalignment, checked : mode };
        let esc = encodeURIComponent;
        let query = Object.keys(params)
            .map(k => esc(k) + '=' + esc(params[k]))
            .join('&');

        xhr("PUT", "/db/annotations/checked?" + query);

    }

    onclick_messagebox(id_keypointalignment, message) {
        let data = {id_annotation : id_keypointalignment, message : message};

        xhr_push("PUT", "/db/annotations/message", data);

    }


}

export default PanelModel;
