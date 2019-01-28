
class StartOverSatelliteController {
    init(window0, window1, model_manager, progress_model, keypoint_state, start_over_satellite_model) {
        this.window0 = window0;
        this.window1 = window1;
        this.model_manager = model_manager;
        this.progress_model = progress_model;
        this.keypoint_state = keypoint_state;
        this.start_over_satellite_model = start_over_satellite_model;

        // -> bindings
        this.start_over_satellite_model.onclick_start_over = this.onclick_start_over.bind(this);
        // <-
    }


    draw() {
        let is_state_pick_object =  this.keypoint_state.is_state_pick_object() || this.keypoint_state.is_state_done();
        this.start_over_satellite_model.is_visible = is_state_pick_object;
        const alignedobj = this.model_manager.id2alignedobj;
        let pos_list = [];
        let id_model_list = [];
        for (let key in alignedobj) {
            let pos = alignedobj[key].get_position();
            pos = this.window1.project_position_to_screen(pos);
            if (this.window1.is_pos_in_model_panel(pos)) {
                pos_list.push(pos);
                id_model_list.push(key)
            }
        }
        this.start_over_satellite_model.draw(id_model_list, pos_list);

    }

    onclick_start_over(id_model) {
        this.transfer_to_other_window(id_model);

        let obj = this.model_manager.id2obj[id_model];
        const pos0 = obj.get_position();

        let keypoint0 = this.model_manager.id2keypoint0[id_model];
        keypoint0.set_to_zero();
        keypoint0.set_trs_to_default();
        keypoint0.set_color_to_green();
        keypoint0.set_origin_position(pos0);

        let keypoint1 = this.model_manager.id2keypoint1[id_model];
        keypoint1.set_to_zero();
        keypoint1.set_trs_to_default();
        keypoint1.set_origin_position(pos0);

        let wireframe0 = this.model_manager.id2wireframe0[id_model];
        wireframe0.set_color_to_red();
        wireframe0.is_visible = 1;

        let wireframe1 = this.model_manager.id2wireframe1[id_model];
        wireframe1.set_color_to_red();
        wireframe1.is_visible = 1;

        delete this.model_manager.id2alignedobj[id_model];
        this.keypoint_state.set_state_to_closeup_view();

        this.model_manager.set_selected_id_model(id_model);

        this.progress_model.set_number_of_keypoint(0);
        this.progress_model.draw_dependent_on_state();
        this.model_manager.make_all_obj_univisble_expect_selected();
        this.focus_camera_on_obj(id_model);
    }

    transfer_to_other_window(id_model) {
        let obj = this.model_manager.id2obj[id_model];
        obj.reinit_gl(this.window0.gl);
        obj.set_trs_to_default();

        let keypoint0 = this.model_manager.id2keypoint0[id_model];
        keypoint0.reinit_gl(this.window0.gl);
        keypoint0.set_color_to_red();
        keypoint0.set_to_zero();
        keypoint0.set_trs_to_default();
    }

    focus_camera_on_obj(id_model) {
        let obj = this.model_manager.id2obj[id_model];
        let bounding_box = obj.bounding_box.clone();

        let pos = new THREE.Vector4(0,  obj.bounding_box.y + 1.0, -obj.bounding_box.x - 1.0, 1);
        pos.applyMatrix4(obj.model_matrix);

        let lookat = new THREE.Vector3(0, 0, 0);
        let dummy0 = new THREE.Quaternion();
        let dummy1 = new THREE.Vector3(0, 0, 0);
        obj.model_matrix.decompose(lookat, dummy0, dummy1);
        this.window0.set_camera_pos_and_lookat(pos, lookat);
        this.window1.set_camera_pos_and_lookat(pos, lookat);
    }


}

export default StartOverSatelliteController;
