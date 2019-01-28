
import React from 'react';
import ReactDOM from 'react-dom';

import SubmitUI from "../view/SubmitUI";

class SkipSubmitController {
    init(id_prealignment, collection_keypointalignment, user, model_manager, progress_model) {
        this.id_prealignment = id_prealignment;
        this.collection_keypointalignment = collection_keypointalignment;
        this.user = user;
        this.model_manager = model_manager;
        this.progress_model = progress_model;
    }

    restart() {
        throw new Error('Define restart.');
    }

    set_restart_func(func) {
        this.restart = func;
    }

    onclick_submit() {

    }

    onclick_aligner2retriever() {
        throw new Error("Error: Define 'onclick_aligner2retriever'");
    }

    onclick_go_back() {
        this.onclick_aligner2retriever(null);
    }

    draw() {
        ReactDOM.render(
            <SubmitUI onclick_go_back={this.onclick_go_back.bind(this)} onclick_submit={this.onclick_submit.bind(this)} />,
            document.getElementById('id_div_skip_submit'));
    }

    check_number_of_models(n) {
        return Object.keys(this.model_manager.id2alignedobj).length !== Object.keys(this.model_manager.id2obj).length;
    }
}

export default SkipSubmitController;
