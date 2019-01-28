
import React from 'react';
import ReactDOM from 'react-dom';

import OptionsBarUI from "../view/OptionsBarUI";

class OptionsModel {
    init() {
        this.is_active = 0;
        this.is_visible = 0;
        this.is_real_color = false;
        this.is_show_only_segment = false;
    }

    set_active(value) {
        this.is_active = value;
    }


    draw() {
        ReactDOM.render(
            <OptionsBarUI onclick_color={this.onclick_color.bind(this)}/>,
            document.getElementById('id_options_bar'));
    }

    onclick_color(event) {
        throw new Error("Error: Define 'onclick_color'");
    }

    onclick_segment(event) {
        throw new Error("Error: Define 'onclick_segment'");
    }

    toggle_color() {
        this.is_real_color = !this.is_real_color;
    }

    toggle_segment() {
        this.is_show_only_segment = !this.is_show_only_segment;
    }

}

export default OptionsModel;
