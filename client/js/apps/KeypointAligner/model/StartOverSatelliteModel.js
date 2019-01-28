
import React from 'react';
import ReactDOM from 'react-dom';

import StartOverSatelliteUI from "../view/StartOverSatelliteUI";

class StartOverSatelliteModel {
    init() {
        this.is_active = 0;
        this.is_visible = 0;
    }

    set_active(value) {
        this.is_active = value;
    }

    draw(id_model_list, pos_list) {
        if (this.is_visible && id_model_list.length > 0) {
            ReactDOM.render(
            <StartOverSatelliteUI is_visible={1} pos_list={pos_list} id_model_list={id_model_list} onclick_start_over={this.onclick_start_over} />,
            document.getElementById("id_start_over_satellite_div"));
        } else {
            ReactDOM.render(
            <StartOverSatelliteUI is_visible={0} />,
            document.getElementById("id_start_over_satellite_div"));
        }
    }


    onclick_start_over(event) {
        throw new Error("Error: Define 'onclick_start_over'");
    }

}

export default StartOverSatelliteModel;
