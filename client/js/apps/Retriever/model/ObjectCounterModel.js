
import React from 'react';
import ReactDOM from 'react-dom';

import ObjectCounterUI from "../view/ObjectCounterUI";

class ObjectCounterModel {
    init() {
        this.is_active = 0;

    }

    set_active(value) {
        this.is_active = value;
    }

    draw(n) {
        ReactDOM.render(<ObjectCounterUI is_visible={1} n={n} />,
            document.getElementById("id_div_object_counter"));
    }



}

export default ObjectCounterModel;
