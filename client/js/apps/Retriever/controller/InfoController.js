

class InfoController {
    init(window, info_model, aligner_state) {
        this.window = window;
        this.info_model = info_model;
        this.aligner_state = aligner_state;

    }

    draw() {
        this.info_model.draw();
    }

    mousedown(event) {
        switch (event.button) {
            case 0:
            if (this.aligner_state.is_state_search())
                if (this.window.is_mouse_in_model_panel())
                    this.info_model.focus();
            break;
        }
    }

}

export default InfoController;
