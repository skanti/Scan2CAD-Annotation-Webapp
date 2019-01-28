
class PVVKeypointBController {

    init(window0, window1, model_manager, pvv_model, keypoint_state, progress_model) {
        this.window0 = window0;
        this.window1 = window1;
        this.model_manager = model_manager;
        this.pvv_model = pvv_model;
        this.keypoint_state = keypoint_state;
        this.progress_model = progress_model;

    }

    draw() {
        if (!this.window1.is_mouse_in_model_panel())
            return;

        let pos_mouse = this.window1.get_pos_mouse();
        let vao_list = [this.model_manager.scene];
        this.pvv_model.pick(pos_mouse.x, pos_mouse.y, new Float32Array(this.window1.camera.matrixWorldInverse.elements), new Float32Array(this.window1.projection_matrix.elements), this.window1.window_width, this.window1.window_height, vao_list);
    }

    advance() {
        if (this.pvv_model.is_active) {
            this.set_glow();
        }
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

    pick_object(pos_mouse) {
        let vertex_info = this.pvv_model.get_vertex_info();
        let id_mesh = vertex_info.id_mesh;
        let id_label = vertex_info.id_segment;
    }

    spawn_point(pos_mouse) {
        let u = pos_mouse.x/this.window1.window_width;
        let v = pos_mouse.y/this.window1.window_height;
        let d = this.pvv_model.pixel_depth;
        if (d !== 0) {
            this.create_keypoint_and_save_in_model_manager(u, v, d);
            this.keypoint_state.set_state_to_set_keypoint0();

            this.progress_model.draw_dependent_on_state();
        }
    }

    mouselick_branching(pos_mouse) {
        if (this.keypoint_state.is_state_set_keypoint1())
            this.spawn_point(pos_mouse);
    }

    mousedown(event) {
        switch (event.button) {
            case 0:
                if (this.window1.is_mouse_in_model_panel()) {
                    let pos_mouse = new THREE.Vector2( event.clientX, event.clientY);
                    pos_mouse = this.window1.get_relative_pos(pos_mouse);
                    this.mouselick_branching(pos_mouse);
                } else if (this.keypoint_state.is_state_set_keypoint1()) {
                    this.progress_model.flash_info1();
                } else if (this.keypoint_state.is_state_view_result()) {
                    this.progress_model.flash_looks_good();
                }
                break;
            }
    }

    create_keypoint_and_save_in_model_manager(u, v, d) {
        let c = new THREE.Vector4(u*2.0 - 1.0, -v*2.0 + 1.0, d*2.0 - 1.0, 1.0);
        c = this.window1.project_ndc_to_world(c);

        let keypoint = this.model_manager.get_selected_keypoint1()
        keypoint.push_back_mesh(c, 1);
    }
}


export default PVVKeypointBController;
