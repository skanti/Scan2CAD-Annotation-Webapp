
import React from 'react';
import ReactDOM from 'react-dom';

import InfoUI from "../view/InfoUI";

class InfoModel {
    init(aligner_state) {
        this.state = aligner_state;
        this.is_active = 0;

    }

    set_active(value) {
        this.is_active = value;
    }

    draw(text) {
        ReactDOM.render(<InfoUI is_visible={1} text={text} is_visible_undo={this.is_visible_undo} is_visible_redo={this.is_visible_redo}/>,
            document.getElementById("id_div_info"));
    }

    focus() {
        let div_info = document.getElementById("div_info");
        div_info.blur();
        div_info.focus();
    }

    draw_dependent_on_state() {
        if (this.state.is_state_set_anchor()) {
            this.draw("Left-click on surface");
        } else if (this.state.is_state_search()) {
            this.draw("Find most similar model");
        } else if (this.state.is_state_trs()) {
            this.draw("Use mouse to overlay model");
        }
    }

    draw_pick_object() {
        this.draw("Left-click on surface");
    }

    draw_retrieve_object() {
        this.draw("Find similar model in right gallery");
    }

    draw_trs() {
        this.draw("Use mouse to overlay on scan");
    }

    flash_not_enough_models(n) {
        this.draw("Minimum number of models is " + n);
        this.focus();
    }


}

export default InfoModel;
