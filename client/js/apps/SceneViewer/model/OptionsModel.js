import React from 'react';
import ReactDOM from 'react-dom';

import ToggleModelsUI from "../view/ToggleModelsUI";

class OptionsModel {
    init(model_manager) {
        this.model_manager = model_manager;
    }

    set_active(value) {
        this.is_active = value;
    }


    draw() {
        ReactDOM.render(
            <ToggleModelsUI onclick_models={this.onclick_models.bind(this)}/>,
            document.getElementById("id_div_options"));
    }

    onclick_models(mode) {
        let show_obj = 1;
        let show_scan = 1;
        if (mode == 0){
            show_obj = 1;
            show_scan = 1;
        } else if (mode == 1) {
            show_obj = 1;
            show_scan = 0;
        } else if (mode == 2) {
            show_obj = 0;
            show_scan = 1;
        }

        this.model_manager.scene.is_visible = show_scan;
        for (let key in this.model_manager.id2obj) {
            let obj = this.model_manager.id2obj[key];
            obj.is_visible = show_obj;
        }
        for (let key in this.model_manager.id2keypoint0) {
            let keypoint0 = this.model_manager.id2keypoint0[key];
            let obj = this.model_manager.id2obj[key];
            if (obj !== undefined)
                keypoint0.is_visible = show_obj;
        }
    }


}

export default OptionsModel;
