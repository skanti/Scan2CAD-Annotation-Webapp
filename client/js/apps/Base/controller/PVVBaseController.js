
class PVVBaseController  {

    init(window, model_manager, pvv_model) {
        this.window = window;
        this.model_manager = model_manager;
        this.pvv_model = pvv_model;
    }

    mouseclick(event) {
        throw new Error("Error: Define 'mouseclick'");
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

    draw() {
        if (!this.window.is_mouse_in_model_panel())
            return;

        let pos_mouse = this.window.get_pos_mouse();
        let vao_list = this.model_manager.get_all_vaos();
        this.pvv_model.pick(pos_mouse.x, pos_mouse.y, new Float32Array(this.window.camera.matrixWorldInverse.elements), new Float32Array(this.window.projection_matrix.elements), this.window.window_width, this.window.window_height, vao_list);
    }

    advance() {
        if (this.pvv_model.is_active) {
            this.set_glow();
        }
    }

}


export default PVVBaseController;
