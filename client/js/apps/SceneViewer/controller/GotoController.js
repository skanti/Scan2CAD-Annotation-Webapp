
import React from 'react';
import ReactDOM from 'react-dom';

import GotoUI from "../view/GotoUI";

class GotoController {
    init(id_annotation) {
        this.id_annotation = id_annotation;
    }

    draw() {
        ReactDOM.render(
            <GotoUI onclick_goto_keypoint={this.onclick_goto_keypoint.bind(this)} />,
            document.getElementById('id_div_goto'));
    }

    onclick_goto_keypoint() {
        window.location.assign("/KeypointAligner/" + this.id_annotation);
    }
}

export default GotoController;
