
import React from 'react';
import ReactDOM from 'react-dom';

import DoneButtonUI from "../view/DoneButtonUI";
import InfoBarUI from "../view/InfoBarUI";
import KeypointCounterUI from "../view/KeypointCounterUI";
import BackButtonUI from "../view/BackButtonUI";
import StartOverButtonUI from "../view/StartOverButtonUI";
import LooksGoodButtonUI from "../view/LooksGoodButtonUI";

class ProgressModel {
    init(keypoint_state) {
        this.state = keypoint_state;

        // -> members for each label in progress bar
        this.n_min_keypoints = Settings.n_min_keypoints;
        this.n_keypoints = 0;
        // <-

        this.is_visible_back = 0;
        this.is_visible_done = 0;
        this.is_visible_info0 = 0;
        this.is_visible_info1 = 0;
        this.is_visible_start_over = 0;
    }

    set_number_of_keypoint(n) {
        this.n_keypoints = n;
    }
    set_active(value) {
        this.is_active = value;
    }

    draw_dependent_on_state() {
        if (this.state.is_state_set_keypoint0()) {
            this.draw_info0("Place point in left window.");
            this.draw_done();
            this.draw_counter();
            // this.hide_info1();
            this.draw_start_over();
        } else if (this.state.is_state_set_keypoint1()) {
            this.draw_done();
            this.draw_info1("Place point in right window.");
            this.draw_counter();
            this.draw_start_over();
            // this.hide_info0();
        } else if (this.state.is_state_closeup_view()) {
            this.disable_done();
            this.hide_looks_good();
            this.hide_start_over();
            this.draw_info0("Place point in left window.");
            this.draw_counter();
            // this.hide_info1();
        } else if (this.state.is_state_view_result()) {
            this.hide_info0();
            this.disable_done();
            this.draw_start_over();
            this.draw_looks_good();
            // this.hide_info1();
        }
    }

    draw_counter() {
        ReactDOM.render(
        <KeypointCounterUI is_visible={1} n={this.n_keypoints} n_min={this.n_min_keypoints} />,
        document.getElementById("id_div_keypoint_counter"));
    }

    draw_done() {
        let is_disabled = this.n_keypoints < this.n_min_keypoints;
        ReactDOM.render(
        <DoneButtonUI is_visible={1} is_disabled={is_disabled} onclick={this.onclick_done.bind(this)} />,
        document.getElementById("id_div_align_submit"));
    }

    draw_looks_good() {
        ReactDOM.render(
        <LooksGoodButtonUI is_visible={1} text={"Submit ✔"} onclick={this.onclick_looks_good.bind(this)} />,
        document.getElementById("id_div_align_submit"));
    }

    draw_start_over() {
        ReactDOM.render(
        <StartOverButtonUI is_visible={1} onclick_start_over={this.onclick_start_over.bind(this)} />,
        document.getElementById("id_div_start_over"));
    }

    draw_info0(text) {
        ReactDOM.render(
        <InfoBarUI is_visible={1} text={text} id={0}/>,
        document.getElementById("id_div_info0"));
    }

    draw_info1(text) {
        ReactDOM.render(
        <InfoBarUI is_visible={1} text={text} id={1}/>,
        document.getElementById("id_div_info0"));
    }

    hide_counter() {
        ReactDOM.render(
        <KeypointCounterUI is_visible={0} />,
        document.getElementById("id_div_keypoint_counter"));
    }


    disable_done() {
        ReactDOM.render(
        <DoneButtonUI is_visible={1} is_disabled={1}  />,
        document.getElementById("id_div_align_submit"));
    }

    hide_back() {
        ReactDOM.render(
        <BackButtonUI is_visible={0} />,
        document.getElementById("id_div_back"));
    }

    hide_looks_good() {
        ReactDOM.render(
        <LooksGoodButtonUI is_visible={0} />,
        document.getElementById("id_div_align_submit"));
    }

    hide_start_over() {
        ReactDOM.render(
        <StartOverButtonUI is_visible={0} />,
        document.getElementById("id_div_start_over"));
    }

    hide_info0() {
        ReactDOM.render(
        <InfoBarUI is_visible={0} />,
        document.getElementById("id_div_info0"));
    }

    hide_info1() {
        ReactDOM.render(
        <InfoBarUI is_visible={0} />,
        document.getElementById("id_div_info0"));
    }


    focus() {
        // document.getElementById("id_progress_status").blur();
        // document.getElementById("id_progress_status").focus();
    }

    flash_looks_good() {
        let looks_good = document.getElementById("id_looks_good");
        looks_good.blur();
        looks_good.focus();
    }

    flash_info0() {
        this.draw_info0();
    }

    flash_info1() {
        this.draw_info1();
    }

    flash_not_enough_keypoints() {
        const text = "Place at least " +  this.n_min_keypoints + " points";
        this.draw_info0(text);
    }

    flash_place_keypoint1() {
        const text = "Place matching point in right window";
        this.draw_info0(text);
    }

    flash_align_all_models() {
        const text = "Please align all models";
        this.draw_info0(text);
    }

    flash_too_close() {
        const text = "Points too close to each other";
        this.draw_info0(text);
    }

    flash_bad_keypoint_placement() {
        const text = "Points are placed too badly. Please add more points and spread them";
        this.draw_info0(text);
    }


    flash_done() {
        const text = "Thank you. Please click on Submit";
        this.draw_info0(text);
    }

    onclick_done(event) {
        throw new Error("Error: Define 'onclick_done'");
    }

    onclick_looks_good(event) {
        throw new Error("Error: Define 'onclick_looks_good'");
    }

    onclick_back(event) {
        throw new Error("Error: Define 'onclick_back'");
    }

    onclick_start_over(event) {
        throw new Error("Error: Define 'onclick_start_over'");
    }

}

export default ProgressModel;
