
const State = {
    NONE: -1,
    SET_ANCHOR: 0,
    SEARCH: 1,
};

class AlignerState {
    init() {
        this.state = State.SET_ANCHOR;
    }

    get_state() {
        return this.state;
    }

    is_state_set_anchor(state0) {
        let state = state0 === undefined ? this.state : state0;
        return state === State.SET_ANCHOR;
    }

    is_state_search(state0) {
        let state = state0 === undefined ? this.state : state0;
        return state === State.SEARCH;
    }

    set_state_to_set_anchor() {
        this.state = State.SET_ANCHOR;
    }

    set_state_to_search() {
        this.state = State.SEARCH;
    }

    // set_state_to_retrieve_object() {
    //     this.state = State.RETRIEVE_OBJECT;
    // }


}

export default AlignerState;
