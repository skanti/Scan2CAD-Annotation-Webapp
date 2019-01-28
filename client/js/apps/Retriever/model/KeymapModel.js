
import React from 'react';
import ReactDOM from 'react-dom';

import KeymapUI from "../view/KeymapUI";

class KeymapModel {
    init() {
        this.is_visible = 0;
    }

    set_active(value) {
        this.is_visible = value;
    }


    draw() {
        ReactDOM.render(
            <KeymapUI />,
            document.getElementById('id_div_keymap'));
    }

}

export default KeymapModel;
