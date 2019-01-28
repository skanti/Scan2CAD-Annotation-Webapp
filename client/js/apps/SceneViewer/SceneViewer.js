import * as THREE from 'three/build/three';
window.THREE = THREE;

import PickVisibleVertex from "../../lib/vao/PickVisibleVertex";
import CamSphereVAO from '../../lib/vao/CamSphereVAO';

import React from 'react';
import ReactDOM from 'react-dom';

import RootUI from "./view/RootUI";

import ModelManager from '../Base/model/ModelManager';
import WindowManager from '../Base/model/WindowManager';
import SegmentSatelliteModel from '../Base/model/SegmentSatelliteModel';
import ModelSpawner from './model/ModelSpawner';

import PanelModel from "./model/PanelModel";
import OptionsModel from "./model/OptionsModel";

import PVVViewerController from "./controller/PVVViewerController.js";
import SegmentSatelliteController from "../Base/controller/SegmentSatelliteController.js";

import {UserInfo, MouseState, MouseButtonState} from "../Base/SceneBase";

class SceneViewer {
    constructor(){
        this.initialized = 0;
        this.id_annotation = null;
    }

    init_from_db(id_annotation) {
        console.log(id_annotation);
        this.draw_root().then(res => {
            this.init(id_annotation).then( res => {
                this.load_and_draw_panel(id_annotation).then(res => {
                    this.model_spawner.load_from_id_annotation(id_annotation, this.window, this.model_manager, this.pvv_model, this.trs_model).then(res => {
                        for (let key in this.model_manager.id2keypoint0) {
                            let kp = this.model_manager.id2keypoint0[key];
                            kp.is_visible = true;
                        }
                        this.initialized = 1;
                    });
                });
            });
        });
    }

    load_and_draw_panel(id_annotation) {
        return xhr_json("GET", "db/annotations/" + id_annotation).then(res => {
            let res0 = res[0]["data"];
            this.alignment = res0[res0.length - 1];
            this.panel_model.draw(id_annotation, this.alignment);
            this.options_model.draw();
        });
    }

    init(id_annotation) {
        return new Promise((resolve, reject) => {

            this.id_annotation = id_annotation;
            this.initialized = 0;

            this.mouse_state = MouseState.CLICK;
            this.mouse_button_state = MouseButtonState.RELEASED;
            this.user = null;

            // -> setup models
            this.window = new WindowManager("id_panel_div", "id_canvas_div");
            this.window.init();

            this.cam_sphere = new CamSphereVAO();
            this.cam_sphere.init(this.window.gl);

            this.model_manager = new ModelManager();
            this.model_manager.init();

            this.pvv_model = new PickVisibleVertex();
            this.pvv_model.init(this.window.gl, this.window.window_width, this.window.window_height);

            this.panel_model = new PanelModel();
            this.panel_model.init();
            this.panel_model.set_active(1);

            this.options_model = new OptionsModel();
            this.options_model.init(this.model_manager);

            this.segment_satellite_model = new SegmentSatelliteModel();
            this.segment_satellite_model.init();
            this.segment_satellite_model.set_active(1);

            this.model_spawner = new ModelSpawner();

            this.pvv = new PVVViewerController();
            this.pvv.init(this.window, this.model_manager, this.pvv_model);

            this.segment_satellite = new SegmentSatelliteController();
            this.segment_satellite.init(this.window, this.model_manager, this.pvv_model, this.segment_satellite_model);
            // <-

            // -> event listeners
            this.attach_listener();
            // <-

            this.cam_sphere.is_visible = 1;

            resolve();
        });
    }

    draw_root() {
        return new Promise((resolve, reject) =>
            ReactDOM.render( <RootUI />,
                document.getElementById("id_div_root"), () => resolve())
        );
    }

    draw() {
        this.window.clear();
        if (!this.initialized)
            return;

        this.model_manager.draw(this.window.camera.matrixWorldInverse, this.window.projection_matrix, this.window.camera.matrixWorldInverse, this.window.projection_matrix)


        for (let key in this.model_manager.id2keypoint0) {
            let keypoint0 = this.model_manager.id2keypoint0[key];
            let obj = this.model_manager.id2obj[key];
            if (obj !== undefined)
                keypoint0.draw(this.window.camera.matrixWorldInverse, this.window.projection_matrix);
        }

        for (let key in this.model_manager.id2keypoint1) {
            let keypoint1 = this.model_manager.id2keypoint1[key];
            let obj = this.model_manager.id2obj[key];
            if (obj !== undefined)
                keypoint1.draw(this.window.camera.matrixWorldInverse, this.window.projection_matrix);
        }

        this.pvv.draw();

        this.cam_sphere.is_visible = this.window.navigation.is_camera_moving();
        this.cam_sphere.translation_matrix.makeTranslation(this.window.navigation.target.x, this.window.navigation.target.y, this.window.navigation.target.z);
        this.cam_sphere.draw(this.window.camera.matrixWorldInverse, this.window.projection_matrix);

        // this.segment_satellite.draw();
    }


    advance(i_iteration, mspf) {
        this.window.advance(i_iteration, mspf);

        this.pvv.advance();
    }

    mousedown ( event ) {
        this.mouse_state = MouseState.CLICK;

        switch (event.button) {
            case 0: // <-- left button
                let vertex_info = this.pvv_model.get_vertex_info();
                let id_mesh = vertex_info.id_mesh;
                let id_label = vertex_info.id_segment;
                if (id_mesh == 1) {
                    this.model_manager.set_selected_id_model_from_id_label(id_label);
                    let id_model = this.model_manager.get_selected_id_model();
                    let info = {};
                    info["id_cad"] = this.model_manager.id2idcad[id_model];
                    info["catid_cad"] = this.model_manager.id2catidcad[id_model];
                    console.log(id_model)
                    info["i_cad"] = this.model_manager.id2index[id_model];

                    console.log(info)
                }
                break;
        }
        this.window.navigation.mousedown(event);
    };

    mousemove ( event ) {
        if (!this.initialized)
            return;

        this.mouse_state = MouseState.DRAG;

        this.window.mousemove(event);

    };

    mouseup( event ) {
        this.mouse_button_state = MouseButtonState.RELEASED;

        this.window.navigation.mouseup(event);
    };




    term() {

    }


    mousewheel ( event ) {
            this.window.navigation.mousewheel(event);
    };

    contextmenu( event ) {
            this.window.navigation.contextmenu(event);
    };

    attach_listener() {
        // -> event listeners
        this.contextmenu_ref = this.contextmenu.bind(this);
        this.mousemove_ref = this.mousemove.bind(this);
        this.mousedown_ref = this.mousedown.bind(this);
        this.mouseup_ref = this.mouseup.bind(this);
        this.mousewheel_ref = this.mousewheel.bind(this);

        this.window.add_listener('contextmenu', this.contextmenu_ref);
        this.window.add_listener('mousemove', this.mousemove_ref);
        this.window.add_listener('mousedown', this.mousedown_ref);
        this.window.add_listener('mouseup', this.mouseup_ref);
        this.window.add_listener('mousewheel', this.mousewheel_ref);
        // <-
    }

    dispose() {
        this.window0.remove_listener( "contextmenu", this.contextmenu_ref);
        this.window0.remove_listener( "mousedown", this.mousedown_ref);
        this.window0.remove_listener( "mousemove", this.mousemove_ref);
        this.window0.remove_listener( "mouseup", this.mouseup_ref);
        this.window0.remove_listener( "mousewheel", this.mousewheel_ref);
    };

}

window.SceneViewer = SceneViewer;
