
import React from 'react';
import ReactDOM from 'react-dom';

import SplashScreenUI from "../view/SplashScreenUI";

class SplashScreenModel {
    init() {
        this.is_visible = 1;
    }


    draw() {
            ReactDOM.render(
                <SplashScreenUI is_visible={1} onclick_ok={this.onclick_ok.bind(this)}/>,
                document.getElementById('id_div_splash_screen'));
    }

    hide() {
        ReactDOM.render(
            <SplashScreenUI is_visible={0}/>,
            document.getElementById('id_div_splash_screen'));
    }

    onclick_ok() {
        throw new Error("Error: Define 'onclick_ok'");
    }
}

export default SplashScreenModel;
