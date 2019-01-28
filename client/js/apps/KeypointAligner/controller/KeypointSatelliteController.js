
class KeypointSatelliteController {
    init(window0, window1, model_manager, progress_model, keypoint_state, keypoint_satellite_model) {
        this.window0 = window0;
        this.window1 = window1;
        this.model_manager = model_manager;
        this.progress_model = progress_model;
        this.keypoint_state = keypoint_state;
        this.keypoint_satellite_model = keypoint_satellite_model;

        // -> bindings
        this.keypoint_satellite_model.onclick_delete = this.onclick_delete.bind(this);
        // <-
    }



    draw() {
        let is_state_set_keypoint =  this.keypoint_state.is_state_set_keypoint0() || this.keypoint_state.is_state_set_keypoint1();
        this.keypoint_satellite_model.is_visible = is_state_set_keypoint;

        let keypoint0 = this.model_manager.get_selected_keypoint0();
        if (keypoint0 !== undefined) {
            let is_already_keypoints_set = keypoint0.vao.n_instance > 0;
            this.keypoint_satellite_model.is_visible &= is_already_keypoints_set;
        } else {
            this.keypoint_satellite_model.is_visible = 0;
        }

        if (this.keypoint_satellite_model.is_visible) {
            if (this.keypoint_state.is_state_set_keypoint0()) {
                let keypoint1 = this.model_manager.get_selected_keypoint1();
                let pos = keypoint1.get_last_position();
                pos = this.window1.project_position_to_screen(pos);
                this.keypoint_satellite_model.draw(pos, 1);

            } else if (this.keypoint_state.is_state_set_keypoint1()) {
                let keypoint0 = this.model_manager.get_selected_keypoint0();
                let pos = keypoint0.get_last_position();
                pos = this.window0.project_position_to_screen(pos);
                this.keypoint_satellite_model.draw(pos, 0);
            }
        } else {
            this.keypoint_satellite_model.draw(null);
        }
    }

    onclick_delete(event) {
        if (this.keypoint_state.is_state_set_keypoint0()) {
            let keypoint1 = this.model_manager.get_selected_keypoint1();
            keypoint1.pop();
            this.keypoint_state.set_state_to_set_keypoint1();
        } else if (this.keypoint_state.is_state_set_keypoint1()) {
            let keypoint0 = this.model_manager.get_selected_keypoint0();
            keypoint0.pop();
            this.keypoint_state.set_state_to_set_keypoint0();
        }
        let keypoint = this.model_manager.get_selected_keypoint0();
        let n = keypoint.vao.n_instance;
        this.progress_model.set_number_of_keypoint(n);
        this.progress_model.draw_dependent_on_state();

        this.keypoint_satellite_model.is_visible = 0;
    }

}

export default KeypointSatelliteController;
