

class IntroRotationController {
    init(window, intro_rotation_model, model_manager) {
        this.window = window;
        this.intro_rotation_model = intro_rotation_model;
        this.model_manager = model_manager;
        this.angle = 0;
    }

    draw() {
        if (this.intro_rotation_model.is_active) {
            let scene = this.model_manager.scene;
            scene.vao.color_mode = 1;

            const x_new = Math.sin(this.angle)*5;
            const z_new = Math.cos(this.angle)*5;

            this.window.camera.position.set(x_new, 5, z_new);
            this.angle = this.angle + 0.01;

            if (this.angle > Math.PI/3)
                this.stop_rotation();
        }
    }

    stop_rotation() {
        this.intro_rotation_model.is_active = 0;
        let scene = this.model_manager.scene;
        scene.vao.color_mode = 0;
    }



}

export default IntroRotationController;
