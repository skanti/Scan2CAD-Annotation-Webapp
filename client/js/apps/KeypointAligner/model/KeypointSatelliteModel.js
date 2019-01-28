
import React from 'react';
import ReactDOM from 'react-dom';

import KeypointSatelliteUI from "../view/KeypointSatelliteUI";

class KeypointSatelliteModel {
    init() {
        this.is_active = 0;
        this.is_visible = 0;

    }

    set_active(value) {
        this.is_active = value;
    }

    draw_item(pos0, is_visible, target) {
        if (this.is_visible && is_visible) {
            ReactDOM.render(
            <KeypointSatelliteUI is_visible={1} pos={pos0} onclick_delete={this.onclick_delete} />,
            document.getElementById(target));
        } else {
            ReactDOM.render(
            <KeypointSatelliteUI is_visible={0} />,
            document.getElementById(target));
        }
    }

    draw(pos, mode) {
        switch (mode) {
            case 0:
                this.draw_item(pos, 1, "id_keypoint_satellite0_div");
                this.draw_item(pos, 0, "id_keypoint_satellite1_div");
                break;
            case 1:
                this.draw_item(pos, 0, "id_keypoint_satellite0_div");
                this.draw_item(pos, 1, "id_keypoint_satellite1_div");
                break;
            default:
                this.draw_item(pos, 0, "id_keypoint_satellite0_div");
                this.draw_item(pos, 0, "id_keypoint_satellite1_div");
                break;
        }
    }

    onclick_delete(event) {
        throw new Error("Error: Define 'onclick_delete'");
    }

}

export default KeypointSatelliteModel;
