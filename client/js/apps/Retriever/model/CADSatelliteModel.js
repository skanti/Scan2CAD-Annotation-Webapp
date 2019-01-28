
import React from 'react';
import ReactDOM from 'react-dom';

import CADSatelliteUI from "../view/CADSatelliteUI";

class KeypointSatelliteModel {
    init() {
        this.is_active = 0;
        this.is_visible = 0;

    }

    set_active(value) {
        this.is_active = value;
    }

    draw(id2poses) {
        if (this.is_visible) {
            ReactDOM.render(
            <CADSatelliteUI is_visible={1} id2poses={id2poses} onclick_delete={this.onclick_delete} />,
            document.getElementById("id_cad_satellite_div"));
        } else {
            ReactDOM.render(
            <CADSatelliteUI is_visible={0} />,
            document.getElementById("id_cad_satellite_div"));
        }
    }

    onclick_delete(event) {
        throw new Error("Error: Define 'onclick_delete'");
    }

}

export default KeypointSatelliteModel;
