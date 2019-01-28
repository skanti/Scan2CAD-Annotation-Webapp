class PVVKeypointAController {

    init(window0, window1, model_manager, pvv_model, keypoint_state, progress_model) {
        this.window0 = window0;
        this.window1 = window1;
        this.model_manager = model_manager;
        this.pvv_model = pvv_model;
        this.keypoint_state = keypoint_state;
        this.progress_model = progress_model;
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

    draw() {
        if (!this.window0.is_mouse_in_model_panel())
            return;

        let pos_mouse = this.window0.get_pos_mouse();
        let vao_list = Object.values(this.model_manager.id2obj);
        this.pvv_model.pick(pos_mouse.x, pos_mouse.y, new Float32Array(this.window0.camera.matrixWorldInverse.elements), new Float32Array(this.window0.projection_matrix.elements), this.window0.window_width, this.window0.window_height, vao_list);
    }

    advance() {
        if (this.pvv_model.is_active) {
            this.set_glow();
        }
    }

    pick_object(pos_mouse) {
        let vertex_info = this.pvv_model.get_vertex_info();
        let id_mesh = vertex_info.id_mesh;
        let id_label = vertex_info.id_segment;

        this.model_manager.set_undone_wireframes0_unvisible();
        this.model_manager.set_undone_wireframes1_unvisible();
        if (id_mesh === 1) {
            this.model_manager.set_selected_id_model_from_id_label(id_label);
            let id_model = this.model_manager.get_selected_id_model();
            let wireframe0 = this.model_manager.get_selected_wireframe0();

            wireframe0.is_visible = 1;
            let wireframe1 = this.model_manager.get_selected_wireframe1();
            wireframe1.is_visible = 1;

            this.model_manager.id2duration[id_model] = Date.now();

            this.focus_camera_on_obj();
            this.keypoint_state.set_state_to_closeup_view();
            this.progress_model.draw_dependent_on_state();
            this.model_manager.make_all_obj_univisble_expect_selected();

        }
    }

    spawn_point(pos_mouse) {
        let u = pos_mouse.x/this.window0.window_width;
        let v = pos_mouse.y/this.window0.window_height;
        let d = this.pvv_model.pixel_depth;
        if (d !== 0) {
            this.create_keypoint_and_save_in_model_manager(u, v, d);
            let keypoint = this.model_manager.get_selected_keypoint0();
            let n = keypoint.vao.n_instance;
            this.progress_model.set_number_of_keypoint(n);
            this.keypoint_state.set_state_to_set_keypoint1();
            this.progress_model.draw_dependent_on_state();
        }
    }

    mouselick_branching(pos_mouse) {
        if (this.keypoint_state.is_state_set_keypoint0() || this.keypoint_state.is_state_closeup_view())
            this.spawn_point(pos_mouse);
    }

    mousedown(event) {
        switch (event.button) {
            case 0:
                if (this.window0.is_mouse_in_model_panel()) {
                    let pos_mouse = new THREE.Vector2( event.clientX, event.clientY);
                    pos_mouse = this.window0.get_relative_pos(pos_mouse);
                    this.mouselick_branching(pos_mouse);
                } else {
                    if (this.keypoint_state.is_state_closeup_view() || this.keypoint_state.is_state_set_keypoint0()) {
                        this.progress_model.flash_info0();
                    } else if (this.keypoint_state.is_state_view_result()) {
                        this.progress_model.flash_looks_good();
                    }
                }
                break;
            }
    }

    create_keypoint_and_save_in_model_manager(u, v, d) {
        let c = new THREE.Vector4(u*2.0 - 1.0, -v*2.0 + 1.0, d*2.0 - 1.0, 1.0);
        c = this.window0.project_ndc_to_world(c);
        let keypoint = this.model_manager.get_selected_keypoint0();
        keypoint.push_back_mesh(c, 1);
    }


    set_glow() {
        let scene = this.model_manager.scene;
        if (scene !== null) {
            let id_segment_glow = -1;
            let vertex_info = this.pvv_model.get_vertex_info();
            if (vertex_info.id_mesh == 0)
                if (vertex_info.id_segment > 0)
                    id_segment_glow = vertex_info.id_segment;

            scene.set_glow_on_label(id_segment_glow, 0.1);
        }
    }

}


export default PVVKeypointAController;
