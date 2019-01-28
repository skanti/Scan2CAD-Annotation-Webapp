
class KeypointController {

    init(window0, window1, model_manager, keypoint_state) {
        this.window0 = window0;
        this.window1 = window1;
        this.model_manager = model_manager;
        this.keypoint_state = keypoint_state;

    }

    draw() {
        const keypoint_state = this.keypoint_state;

        for (let key in this.model_manager.id2keypoint0) {
            let keypoint0 = this.model_manager.id2keypoint0[key];
            let obj = this.model_manager.id2obj[key];
            if (keypoint_state.is_state_closeup_view() || keypoint_state.is_state_set_keypoint0() || keypoint_state.is_state_set_keypoint1() || keypoint_state.is_state_view_result()) {
                keypoint0.is_visible = key === this.model_manager.get_selected_id_model();
            } else {
                keypoint0.is_visible = 1;
            }
            if (obj !== undefined)
                this.draw0_dependent_on_state(keypoint0);
        }

        for (let key in this.model_manager.id2keypoint1) {
            let keypoint1 = this.model_manager.id2keypoint1[key];
            let obj = this.model_manager.id2obj[key];
            if (keypoint_state.is_state_closeup_view() || keypoint_state.is_state_set_keypoint0() || keypoint_state.is_state_set_keypoint1() || keypoint_state.is_state_view_result()) {
                keypoint1.is_visible = key === this.model_manager.get_selected_id_model();
            } else {
                keypoint1.is_visible = 1;
            }
            if (obj !== undefined)
                keypoint1.draw(this.window1.camera.matrixWorldInverse, this.window1.projection_matrix);
        }
    }

    draw0_dependent_on_state(keypoint0) {
        if (this.keypoint_state.is_state_view_result())
            keypoint0.draw(this.window1.camera.matrixWorldInverse, this.window1.projection_matrix);
        else
            keypoint0.draw(this.window0.camera.matrixWorldInverse, this.window0.projection_matrix);

    }
}


export default KeypointController;
