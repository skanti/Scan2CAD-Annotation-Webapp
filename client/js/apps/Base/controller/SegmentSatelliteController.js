

class SegmentLabelSatelliteController {
    init(window, model_manager, pvv_model, segment_satellite_model) {
        this.window = window;
        this.model_manager = model_manager;
        this.pvv_model = pvv_model;
        this.segment_satellite_model = segment_satellite_model;
    }


    draw_segment_satellite() {
        let vertex_info = this.pvv_model.get_vertex_info();
        let segment_name = "Maybe: " + this.model_manager.get_catname_from_vertex_info(vertex_info);
        let is_gray = vertex_info.id_mesh === 1;
        let pos_mouse = this.window.get_pos_mouse();
        this.segment_satellite_model.draw(pos_mouse, segment_name, is_gray);
    }

    draw() {
        this.segment_satellite_model.is_visible = this.segment_satellite_model.is_active && this.window.is_mouse_in_model_panel();

        if (this.segment_satellite_model.is_visible)
            this.draw_segment_satellite();
        else
            this.segment_satellite_model.draw(null);
    }

    advance() {

    }
}

export default SegmentLabelSatelliteController;
