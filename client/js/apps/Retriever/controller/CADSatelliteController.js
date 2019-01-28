
class CADSatelliteController {
    init(window, model_manager, cad_satellite_model) {
        this.window = window;
        this.model_manager = model_manager;
        this.cad_satellite_model = cad_satellite_model;
        this.cad_satellite_model.set_active(true);

        // -> bindings
        this.cad_satellite_model.onclick_delete = this.onclick_delete.bind(this);
        // <-
    }



    draw() {
        let id2poses = {};
        for (let key in this.model_manager.id2obj) {
            let obj = this.model_manager.id2obj[key];
            this.cad_satellite_model.is_visible = true;
            let pos = obj.get_position();
            pos = this.window.project_position_to_screen(pos);
            let is_visible = this.window.is_pos_in_model_panel(pos);
            if (is_visible)
                id2poses[key] = pos;
        }
        this.cad_satellite_model.draw(id2poses);
    }

    onclick_delete(id_model) {
        this.model_manager.delete_model(id_model);
    }

}

export default CADSatelliteController;
