import * as THREE from 'three/build/three';
window.THREE = THREE;
import * as d3 from 'd3/build/d3';


import React from 'react';
import ReactDOM from 'react-dom';

import RootUI from "./view/RootUI";

import Settings from "./Settings";
window.Settings = Settings;

import PickVisibleVertex from '../../lib/vao/PickVisibleVertex';
import CamSphereVAO from '../../lib/vao/CamSphereVAO';

import ModelSpawner from './model/ModelSpawner';

import ModelManager from '../Base/model/ModelManager';
import WindowManager from '../Base/model/WindowManager';
import SegmentSatelliteModel from '../Base/model/SegmentSatelliteModel';
import KeypointState from "./model/KeypointState";
import ProgressModel from './model/ProgressModel';
import KeypointSatelliteModel from './model/KeypointSatelliteModel';
import StartOverSatelliteModel from './model/StartOverSatelliteModel';

import SegmentSatelliteController from "../Base/controller/SegmentSatelliteController";
import PVVKeypointAController from "./controller/PVVKeypointAController";
import PVVKeypointBController from "./controller/PVVKeypointBController";
import ProgressBarController from "./controller/ProgressBarController";
import SubmitController from "./controller/SubmitController";
import KeypointSatelliteController from "./controller/KeypointSatelliteController";
import StartOverSatelliteController from "./controller/StartOverSatelliteController";
import KeypointController from "./controller/KeypointController";

import {UserInfo, MouseState, MouseButtonState} from "../Base/SceneBase";


class KeypointAligner {
    constructor(){
        this.initialized = 0;
    }

    init_from_retrieval(info, cargo) {
        return this.draw_root().then( res => {
            this.init().then( res => {
                this.model_spawner.load_by_retrieval(info, cargo, this.window0, this.window1, this.model_manager, this.pvv_model0, this.pvv_model1).then( res => {
                    this.model_manager.catid2catname_scan = cargo.catid2catname_scan;
                    this.model_manager.catid2catname_cad = cargo.catid2catname_cad;
                    this.focus_camera_on_obj();
                    this.keypoint_state.set_state_to_closeup_view();
                    this.progress_model.draw_dependent_on_state();
                    this.draw_divs();

                    this.initialized = 1;

                });
            })
        });
    }

    focus_camera_on_obj() {
        let obj = this.model_manager.get_selected_obj();
        let pos = new THREE.Vector4(0, obj.bounding_box.y + 1.0, -obj.bounding_box.z - 1.0, 1);
        pos.applyMatrix4(obj.model_matrix);

        let lookat = new THREE.Vector3(0, 0, 0);
        let dummy0 = new THREE.Quaternion();
        let dummy1 = new THREE.Vector3(0, 0, 0);
        obj.model_matrix.decompose(lookat, dummy0, dummy1);
        this.window0.set_camera_pos_and_lookat(pos, lookat);
        this.window1.set_camera_pos_and_lookat(pos, lookat);
    }

    init() {
        return new Promise((resolve, reject) => {

            this.user = new UserInfo();

            this.keypoint_state = new KeypointState();
            this.keypoint_state.init();

            // -> setup models
            this.window0 = new WindowManager("id_panel0_div", "id_canvas0_div");
            this.window0.init();

            this.window1 = new WindowManager("id_panel1_div", "id_canvas1_div");
            this.window1.init();

            this.cam_sphere0 = new CamSphereVAO();
            this.cam_sphere0.init(this.window0.gl);

            this.cam_sphere1 = new CamSphereVAO();
            this.cam_sphere1.init(this.window1.gl);

            this.model_manager = new ModelManager();
            this.model_manager.init();

            this.pvv_model0 = new PickVisibleVertex();
            this.pvv_model0.init(this.window0.gl, this.window0.window_width, this.window0.window_height);

            this.pvv_model1 = new PickVisibleVertex();
            this.pvv_model1.init(this.window1.gl, this.window1.window_width, this.window1.window_height);

            this.progress_model = new ProgressModel();
            this.progress_model.init(this.keypoint_state);

            this.keypoint_satellite_model = new KeypointSatelliteModel();
            this.keypoint_satellite_model.init();


            this.model_spawner = new ModelSpawner();
            // <-

            // -> controllers
            this.progress_controller = new ProgressBarController();
            this.progress_controller.init(this.window0, this.window1, this.model_manager, this.progress_model, this.keypoint_state);
            this.progress_controller.onclick_aligner2retriever = this.onclick_aligner2retriever;

            this.keypoint_satellite_controller = new KeypointSatelliteController();
            this.keypoint_satellite_controller.init(this.window0, this.window1, this.model_manager, this.progress_model, this.keypoint_state, this.keypoint_satellite_model);

            this.pvv0 = new PVVKeypointAController();
            this.pvv0.init(this.window0, this.window1, this.model_manager, this.pvv_model0, this.keypoint_state, this.progress_model);

            this.pvv1 = new PVVKeypointBController();
            this.pvv1.init(this.window0, this.window1, this.model_manager, this.pvv_model1, this.keypoint_state, this.progress_model);

            this.submit_controller = new SubmitController();
            this.submit_controller.init(this.id_annotation, this.id_collection_keypointalignment, this.user, this.model_manager, this.progress_model);
            this.submit_controller.onclick_aligner2retriever = this.onclick_aligner2retriever;


            this.keypoint_controller = new KeypointController();
            this.keypoint_controller.init(this.window0, this.window1, this.model_manager, this.keypoint_state);

            // <-

            this.attach_listener();

            // -> user and scene
            this.user.id = "testuser123";
            this.user.date = new Date();
            this.user.time_start = Date.now();
            // <-


            this.cam_sphere0.is_visible = 1;
            this.cam_sphere1.is_visible = 1;

            resolve();
        });
    }


    draw_divs() {
        this.progress_model.draw_dependent_on_state();
        this.submit_controller.draw();
        this.progress_model.set_active(1);
        this.reinit_canvas_and_gl();
    }

    draw_root() {
        return new Promise((resolve, reject) =>
            ReactDOM.render( <RootUI is_visible={1} />,
                document.getElementById('id_div_root1'), () => resolve())
        );
    }

    draw() {
        if (!this.initialized)
            return;

        this.window0.clear();
        this.window1.clear();

        this.pvv0.draw();
        this.pvv1.draw();

        if (this.keypoint_state.is_state_view_result())
            this.model_manager.draw(this.window1.camera.matrixWorldInverse, this.window1.projection_matrix, this.window1.camera.matrixWorldInverse, this.window1.projection_matrix);
        else
            this.model_manager.draw(this.window0.camera.matrixWorldInverse, this.window0.projection_matrix, this.window1.camera.matrixWorldInverse, this.window1.projection_matrix);

        this.draw_camera_sphere();

        this.keypoint_controller.draw();
        this.keypoint_satellite_controller.draw();
        // this.start_over_satellite_controller.draw();
    }

    draw_meshes() {

    }

    draw_camera_sphere() {
        this.cam_sphere0.is_visible = this.window0.navigation.is_camera_moving();
        this.cam_sphere0.translation_matrix.makeTranslation(this.window0.navigation.target.x, this.window0.navigation.target.y, this.window0.navigation.target.z);
        this.cam_sphere0.draw(this.window0.camera.matrixWorldInverse, this.window0.projection_matrix);

        this.cam_sphere1.is_visible = this.window1.navigation.is_camera_moving();
        this.cam_sphere1.translation_matrix.makeTranslation(this.window1.navigation.target.x, this.window1.navigation.target.y, this.window1.navigation.target.z);
        this.cam_sphere1.draw(this.window1.camera.matrixWorldInverse, this.window1.projection_matrix);
    }

    advance(i_iteration, mspf) {
        if (!this.initialized)
            return;

        this.pvv0.advance();
        this.pvv1.advance();

        this.window0.advance(i_iteration, mspf);
        this.window1.advance(i_iteration, mspf);
    }

    onclick_aligner2retriever() {
        throw new Error("Error: Define 'onclick_aligner2retriever'");
    }

    onresize(event) {
        if (!this.initialized)
            return;
        this.reinit_canvas_and_gl();
    }

    reinit_canvas_and_gl() {
        this.window0.on_window_resize(event);
        this.window1.on_window_resize(event);
        this.pvv_model0.reinit(this.window0.gl, this.window0.window_width, this.window0.window_height);
        this.pvv_model1.reinit(this.window1.gl, this.window1.window_width, this.window1.window_height);
        this.window0.gl.viewport(0, 0, this.window0.window_width, this.window0.window_height);
        this.window1.gl.viewport(0, 0, this.window1.window_width, this.window1.window_height);
    }

    mousemove( event ) {
        if (!this.initialized)
            return;

        this.mouse_state = MouseState.DRAG;

        this.window0.mousemove(event);
        this.window1.mousemove(event);
    };

    mousedown( event ) {

        this.mouse_state = MouseState.CLICK;

        if (!this.initialized)
            return;

        this.pvv0.mousedown(event);
        this.pvv1.mousedown(event);

        this.window0.mousedown(event);
        this.window1.mousedown(event);
    };

    mouseup( event ) {
        if (!this.initialized)
            return;

        if (this.mouse_state == MouseState.CLICK) {
            this.mouseclick(event);
        }

        this.window0.mouseup(event);
        this.window1.mouseup(event);
    };

    mouseclick(event) {
        if (!this.initialized)
            return;

    }

    mousewheel( event ) {
            this.window0.mousewheel(event);
            this.window1.mousewheel(event);
    };

    contextmenu( event ) {
            this.window0.contextmenu(event);
            this.window1.contextmenu(event);
    };

    term() {

    }

    attach_listener() {
        // -> event listeners
        this.contextmenu_ref = this.contextmenu.bind(this);
        this.mousemove_ref = this.mousemove.bind(this);
        this.mousedown_ref = this.mousedown.bind(this);
        this.mouseup_ref = this.mouseup.bind(this);
        this.mousewheel_ref = this.mousewheel.bind(this);
        this.onresize_ref = this.onresize.bind(this);

        this.window0.add_listener('contextmenu', this.contextmenu_ref);
        this.window0.add_listener('mousemove', this.mousemove_ref);
        this.window0.add_listener('mousedown', this.mousedown_ref);
        this.window0.add_listener('mouseup', this.mouseup_ref);
        this.window0.add_listener('mousewheel', this.mousewheel_ref);

        this.window1.add_listener('contextmenu', this.contextmenu_ref);
        this.window1.add_listener('mousemove', this.mousemove_ref);
        this.window1.add_listener('mousedown', this.mousedown_ref);
        this.window1.add_listener('mouseup', this.mouseup_ref);
        this.window1.add_listener('mousewheel', this.mousewheel_ref);

        window.addEventListener('resize', this.onresize_ref, false);

        // <-
    }

    clean() {
        this.initialized = 0;
        ReactDOM.render( <RootUI is_visible={0} />, document.getElementById('id_div_root1'))
        this.dispose();
    }

    dispose() {
        this.window0.remove_listener( "contextmenu", this.contextmenu_ref);
        this.window0.remove_listener( "mousedown", this.mousedown_ref);
        this.window0.remove_listener( "mousemove", this.mousemove_ref);
        this.window0.remove_listener( "mouseup", this.mouseup_ref);
        this.window0.remove_listener( "mousewheel", this.mousewheel_ref);

        this.window1.remove_listener( "contextmenu", this.contextmenu_ref);
        this.window1.remove_listener( "mousedown", this.mousedown_ref);
        this.window1.remove_listener( "mousemove", this.mousemove_ref);
        this.window1.remove_listener( "mouseup", this.mouseup_ref);
        this.window1.remove_listener( "mousewheel", this.mousewheel_ref);

        window.removeEventListener('resize', this.onresize_ref, false);


    };
}

export default KeypointAligner;
