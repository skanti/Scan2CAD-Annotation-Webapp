'use strict';

import * as THREE from 'three/build/three';
window.THREE = THREE;
import * as d3 from 'd3/build/d3';

import React from 'react';
import ReactDOM from 'react-dom';

import RootUI from "./view/RootUI";

import PLYModel from "../../lib/vao/PLYModel";
import PickVisibleVertex from "../../lib/vao/PickVisibleVertex";
import KeypointVAO from '../../lib/vao/KeypointVAO';
import CamSphereVAO from '../../lib/vao/CamSphereVAO';

import ModelSpawner from "./model/ModelSpawner";

import ModelManager from "../Base/model/ModelManager";
import WindowManager from "../Base/model/WindowManager";
import SegmentSatelliteModel from "../Base/model/SegmentSatelliteModel";
import GalleryModel from "./model/GalleryModel";
import OptionsModel from "./model/OptionsModel";
import AlignerState from "./model/AlignerState";
import InfoModel from "./model/InfoModel";
import KeymapModel from "./model/KeymapModel";
import ObjectCounterModel from "./model/ObjectCounterModel";
import CADSatelliteModel from './model/CADSatelliteModel';


import SegmentSatelliteController from "../Base/controller/SegmentSatelliteController";
import GalleryController from "./controller/GalleryController";
import PVVController from "./controller/PVVController";
import SkipSubmitController from "./controller/SkipSubmitController";
import OptionsBarController from "./controller/OptionsBarController";
import InfoController from "./controller/InfoController";
import KeymapController from "./controller/KeymapController";
import CADSatelliteController from "./controller/CADSatelliteController";

import {UserInfo, MouseState, MouseButtonState} from "../Base/SceneBase";


class Retriever {
    constructor(){
        this.initialized = 0;
    }

    init_new(id_scan) {
        this.mode = "new";
        this.draw_root().then(res =>
            this.init().then( res => {
                this.model_spawner.load_from_id_scan(id_scan, this.window, this.model_manager, this.pvv_model).then(res => {
                    this.draw_divs();
                    this.initialized = 1;
                });
            })
        );
    }

    init_from_db(id_annotation) {
        this.mode = "edit";
        this.id_annotation = id_annotation;
        this.draw_root().then(res =>
            this.init().then( res => {
                this.model_spawner.load_from_id_annotation(id_annotation, this.window, this.model_manager, this.pvv_model).then(res => {
                    this.draw_divs();

                    this.initialized = 1;
                });
            })
        );
    }

    init_from_alignment(info, cargo) {
        return new Promise((resolve, reject) => {
                this.draw_root().then(res => {
                    this.window.reinit();
                    this.attach_listener();

                    let scene = this.model_manager.scene;
                    scene.reinit_gl(this.window.gl);
                    scene.init_vao_offscreen(this.window.gl, scene.position_buffer, scene.label_buffer, scene.index_buffer);

                    if (cargo.obj) {
                        let obj = cargo.obj;

                        let id_model = "";
                        if (info.is_realign)
                            id_model = this.model_manager.add_model_with_id_model(info.catid_cad, info.id_cad, obj, info.id_model);
                        else
                            id_model = this.model_manager.add_model(info.catid_cad, info.id_cad, obj);


                        let label_buffer_int32 = new Int32Array(obj.position_buffer.length/3);
                        label_buffer_int32.fill(this.model_manager.create_obj_label(id_model));
                        obj.label_buffer = label_buffer_int32;


                        this.model_manager.add_keypoint0(id_model, cargo.keypoint0);
                        this.model_manager.add_keypoint1(id_model, cargo.keypoint1);

                    }

                    this.model_spawner.create_all_wireframes(this.window, this.model_manager);

                    for (let key in this.model_manager.id2obj) {
                        let obj = this.model_manager.id2obj[key];
                        obj.reinit_gl(this.window.gl);
                        obj.init_vao_offscreen(this.window.gl, obj.position_buffer, obj.label_buffer);

                        let wireframe0 = this.model_manager.id2wireframe0[key];
                        wireframe0.is_visible = 1;
                    }


                    this.pvv_model.reinit(this.window.gl, this.window.window_width, this.window.window_height);

                    this.anchor.reinit(this.window.gl);

                    this.cam_sphere.reinit(this.window.gl);
                    this.draw_divs();

                    this.initialized = 1;
                    resolve();
            });
        });
    }


    init() {
        return new Promise((resolve, reject) => {

            this.user = new UserInfo();
            this.model_spawner = new ModelSpawner();

            this.state = new AlignerState();
            this.state.init();

            // -> Managers
            this.window = new WindowManager("id_panel_div", "id_canvas_div");
            this.window.init();

            this.model_manager = new ModelManager();
            this.model_manager.init();

            this.gallery_model = new GalleryModel();
            this.gallery_model.init();

            this.pvv_model = new PickVisibleVertex();
            this.pvv_model.init(this.window.gl, this.window.window_width, this.window.window_height);

            this.options_model = new OptionsModel();
            this.options_model.init();
            this.options_model.set_active(1);

            this.segment_satellite_model = new SegmentSatelliteModel();
            this.segment_satellite_model.init();
            this.segment_satellite_model.set_active(1);

            this.anchor = new KeypointVAO();
            this.anchor.init(this.window.gl);

            this.cam_sphere = new CamSphereVAO();
            this.cam_sphere.init(this.window.gl);

            this.info_model = new InfoModel();
            this.info_model.init(this.state);
            this.info_model.set_active(1);

            this.keymap_model = new KeymapModel();
            this.keymap_model.init();

            this.object_counter_model = new ObjectCounterModel();
            this.object_counter_model.init();


            this.cad_satellite_model = new CADSatelliteModel();
            this.cad_satellite_model.init();
            // <-

            // -> controllers
            this.options_bar = new OptionsBarController();
            this.options_bar.init(this.options_model, this.pvv_model, this.model_manager);

            this.info_controller = new InfoController();
            this.info_controller.init(this.window, this.info_model, this.state);

            this.gallery = new GalleryController();
            this.gallery.onclick_retriever2aligner = this.onclick_retriever2aligner;
            this.gallery.init(this.window, this.model_manager, this.gallery_model, this.pvv_model, this.segment_satellite_model, this.state, this.anchor, this.info_model,
                this.object_counter_model);

            this.pvv = new PVVController();
            this.pvv.onclick_retriever2aligner = this.onclick_retriever2aligner;
            this.pvv.init(this.window, this.model_manager, this.pvv_model, this.gallery_model, this.segment_satellite_model, this.state, this.anchor, this.info_model);

            this.segment_satellite = new SegmentSatelliteController();
            this.segment_satellite.init(this.window, this.model_manager, this.pvv_model, this.segment_satellite_model);

            this.skipsubmit = new SkipSubmitController();
            this.skipsubmit.init(this.user, this.mode, this.id_annotation, this.model_manager, this.info_model);
            this.skipsubmit.set_restart_func(this.restart.bind(this));

            this.keymap_controller = new KeymapController();
            this.keymap_controller.init(this.keymap_model);


            this.cad_satellite_controller = new CADSatelliteController();
            this.cad_satellite_controller.init(this.window, this.model_manager,  this.cad_satellite_model);
            // <-

            // -> event listeners
            this.attach_listener();
            // <-

            // -> user and scene
            this.user.date = new Date();
            this.user.time_start = Date.now();
            // <-

            this.cam_sphere.is_visible = 1;

            let async0 = this.model_manager.fill_catid2catname_cad();

            let async1 = this.model_manager.fill_catid2catname_scan();

            let asyncs_all = [async0, async1];
            // <-

            Promise.all(asyncs_all).then(res => resolve());
        });
    }

    draw_divs() {
        this.skipsubmit.draw();
        this.options_bar.draw();
        this.keymap_controller.draw();
        this.info_model.draw_pick_object();
        let n = Object.keys(this.model_manager.id2obj).length;
        this.object_counter_model.draw(n);
        this.reinit_canvas_and_gl();
    }

    draw_root() {
        return new Promise((resolve, reject) =>
            ReactDOM.render( <RootUI is_visible={1}/>,
                document.getElementById('id_div_root'), () => resolve())
        );
    }

    draw() {
        if (!this.initialized)
            return;

        this.window.clear();

        this.pvv.draw();
        this.segment_satellite.draw();

        this.model_manager.draw(this.window.camera.matrixWorldInverse, this.window.projection_matrix, this.window.camera.matrixWorldInverse, this.window.projection_matrix);
        this.anchor.draw(this.window.camera.matrixWorldInverse, this.window.projection_matrix);

        this.cam_sphere.is_visible = this.window.navigation.is_camera_moving();
        this.cam_sphere.translation_matrix.makeTranslation(this.window.navigation.target.x, this.window.navigation.target.y, this.window.navigation.target.z);
        this.cam_sphere.draw(this.window.camera.matrixWorldInverse, this.window.projection_matrix);

        this.cad_satellite_controller.draw();

    }


    advance(i_iteration, mspf) {
        if (!this.initialized)
            return;

        // if (i_iteration === 120) {
        //     this.clean().then(res =>{
        //         this.reinit("2016-10-28_05-48-19__776B755E-17B4-4DAB-B358-DA3EAD7E0BBE");
        //     });
        // }

        this.window.advance(i_iteration, mspf);

        this.segment_satellite.advance();
        this.pvv.advance();
    }

    onresize(event) {
        if (!this.initialized)
            return;

        this.reinit_canvas_and_gl();
    }

    reinit_canvas_and_gl() {
        this.window.on_window_resize(event);
        this.pvv_model.reinit(this.window.gl, this.window.window_width, this.window.window_height);
        this.window.gl.viewport(0, 0, this.window.window_width, this.window.window_height);
    }


    mousedown ( event ) {
        this.mouse_state = MouseState.CLICK;

        switch (event.button) {
            case 0: // <-- left button
                this.mouse_button_state = MouseButtonState.LEFT_PRESSED;
                break;
        }

        this.info_controller.mousedown(event);
        this.window.mousedown(event);
    };

    mousemove ( event ) {

        if (!this.initialized)
            return;

        this.mouse_state = MouseState.DRAG;

        this.window.mousemove(event);
    }

    mouseup( event ) {

        // if (this.mouse_state === MouseState.CLICK) {
        //     this.mouseclick(event);
        // }
        this.mouse_button_state = MouseButtonState.RELEASED;

        this.window.mouseup(event);
    }

    mouseclick(event) {
        this.pvv.mouseclick(event);
    }

    clean() {
        return new Promise((resolve, reject) => {
            this.initialized = 0;
            this.dispose();
            ReactDOM.render( <RootUI is_visible={0} />, document.getElementById('id_div_root'), () => {
                resolve();
            })
        });
    }

    restart() {
        this.clean();
        window.location.assign("next");
    }


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
        this.mouseclick_ref = this.mouseclick.bind(this);
        this.mousewheel_ref = this.mousewheel.bind(this);
        this.onresize_ref = this.onresize.bind(this);

        this.window.add_listener('contextmenu', this.contextmenu_ref);
        this.window.add_listener('mousemove', this.mousemove_ref);
        this.window.add_listener('mousedown', this.mousedown_ref);
        this.window.add_listener('click', this.mouseclick_ref);
        this.window.add_listener('mouseup', this.mouseup_ref);
        this.window.add_listener('mousewheel', this.mousewheel_ref);
        window.addEventListener('resize', this.onresize_ref, false);
        // <-
    }

    dispose() {
        this.window.remove_listener( "contextmenu", this.contextmenu_ref);
        this.window.remove_listener( "mousedown", this.mousedown_ref);
        this.window.remove_listener( "mousemove", this.mousemove_ref);
        this.window.remove_listener( "mouseup", this.mouseup_ref);
        this.window.remove_listener( "click", this.mouseclick_ref);
        this.window.remove_listener( "mousewheel", this.mousewheel_ref);
        window.removeEventListener('resize', this.mousewheel_ref, false);
    };

}

export default Retriever;
