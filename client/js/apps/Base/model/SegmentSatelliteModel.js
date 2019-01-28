
import React from 'react';
import ReactDOM from 'react-dom';

import SegmentLabelSatelliteUI from "../view/SegmentLabelSatelliteUI";

class SegmentSatelliteModel {
    init() {
        this.is_active = 0;
        this.is_visible = 0;
    }

    set_active(value) {
        this.is_active = value;
    }

    draw(pos_mouse, id_category_scannet, is_gray) {
        if (this.is_visible) {
            ReactDOM.render(
                <SegmentLabelSatelliteUI hide={0} gray={is_gray} pos={[pos_mouse.x + 25, pos_mouse.y + 15]} label={id_category_scannet}/>,
                document.getElementById('container_segment_label_satelite')
            );
        } else {
            ReactDOM.render(
                <SegmentLabelSatelliteUI hide={1}/>,
                document.getElementById('container_segment_label_satelite')
            );
        }
    }

    advance() {

    }

}

export default SegmentSatelliteModel;
