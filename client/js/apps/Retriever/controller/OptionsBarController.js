
class OptionsBarController {
    init(options_model, pvv_model, model_manager) {
        this.options_model = options_model;
        this.pvv_model = pvv_model;
        this.model_manager = model_manager;

        // -> bindings
        this.options_model.onclick_color = this.onclick_color.bind(this);
        this.options_model.onclick_segment = this.onclick_segment.bind(this);
        // <-
    }

    draw() {
        this.options_model.draw();
    }

    onclick_color(event) {
        this.options_model.toggle_color();
        let scene = this.model_manager.scene;
        scene.toggle_color();
    }

    onclick_segment(event) {
        this.options_model.toggle_segment();
    }

}

export default OptionsBarController;
