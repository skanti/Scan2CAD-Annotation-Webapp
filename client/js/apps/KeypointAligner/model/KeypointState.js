
const State = {
    NONE: -1,
    SET_KEYPOINT0 : 1,
    SET_KEYPOINT1 : 2,
    CLOSEUP_VIEW : 3,
    VIEW_RESULT : 4,
};

class KeypointState {
    init() {
        this.state = State.PICK_OBJECT;
    }

    get_state() {
        return this.state;
    }

    // is_state_pick_object() {
    //     return this.state === State.PICK_OBJECT;
    // }

    is_state_set_keypoint0() {
        return this.state === State.SET_KEYPOINT0;
    }

    is_state_set_keypoint1() {
        return this.state === State.SET_KEYPOINT1;
    }

    is_state_closeup_view() {
        return this.state === State.CLOSEUP_VIEW;
    }

    is_state_view_result() {
        return this.state === State.VIEW_RESULT;
    }

    // is_state_done() {
    //     return this.state === State.DONE;
    // }

    // set_state_to_pick_object() {
    //     this.state = State.PICK_OBJECT;
    // }

    set_state_to_set_keypoint0() {
        this.state = State.SET_KEYPOINT0;
    }

    set_state_to_set_keypoint1() {
        this.state = State.SET_KEYPOINT1;
    }

    set_state_to_closeup_view() {
        this.state = State.CLOSEUP_VIEW;
    }

    set_state_to_view_result() {
        this.state = State.VIEW_RESULT;
    }

    // set_state_to_done() {
    //     this.state = State.DONE;
    // }

}

export default KeypointState;
