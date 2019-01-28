
import PVVBaseController from "../../Base/controller/PVVBaseController";

class PVVController extends PVVBaseController {

    init(window, model_manager, pvv_model, gallery_model, segment_satellite_model, aligner_state, anchor, info_model, intro_rotation_model) {
        this.window = window;
        this.model_manager = model_manager;
        this.pvv_model = pvv_model;
        this.gallery_model = gallery_model;
        this.segment_satellite_model = segment_satellite_model;
        this.aligner_state = aligner_state;
        this.anchor = anchor;
        this.info_model = info_model;
        this.intro_rotation_model = intro_rotation_model;
    }

    onclick_retriever2aligner() {
        throw new Error("Error: Define 'onclick_retriever2aligner'");
    }

    onclick_model() {

    }

    draw() {
        if (!this.window.is_mouse_in_model_panel())
            return;
        let pos_mouse = this.window.get_pos_mouse();
        let vao_list = this.model_manager.get_all_vaos();
        this.pvv_model.pick(pos_mouse.x, pos_mouse.y, new Float32Array(this.window.camera.matrixWorldInverse.elements), new Float32Array(this.window.projection_matrix.elements), this.window.window_width, this.window.window_height, vao_list);

        const vertex_info = this.pvv_model.get_vertex_info();
        // if (vertex_info.id_mesh === 0 && vertex_info.id_segment > 0)
        //     this.intro_rotation_model.is_active = 0;
    }

    advance() {
        if (this.pvv_model.is_active) {
            this.set_glow();
        }
    }

    set_glow() {
        let scene = this.model_manager.scene;
        if (scene !== null) {
            let id_segment_glow = -1;
            let vertex_info = this.pvv_model.get_vertex_info();
            if (vertex_info.id_mesh === 0)
                if (vertex_info.id_segment > 0)
                    id_segment_glow = vertex_info.id_segment;

            scene.set_glow_on_label(id_segment_glow, 0.1);
        }
    }


    place_anchor_and_set_search_focus_or_transform(pos_mouse) {
        let vertex_info = this.pvv_model.get_vertex_info();
        let id_mesh = vertex_info.id_mesh;
        let id_segment = vertex_info.id_segment;
        if (id_mesh === 0) {
            const is_placed = this.spawn_point(pos_mouse);
            if (is_placed) {
                const catname_scannet = this.model_manager.get_catname_from_vertex_info(vertex_info);
                this.gallery_model.set_text_and_focus_on_search_bar(catname_scannet);
                this.aligner_state.set_state_to_search();
                this.save_anchor();
                this.gallery_model.onclick_search(0);
            }
        } else if (id_mesh === 1) {

            let id_model = this.model_manager.index2id[id_segment];
            let obj = this.model_manager.id2obj[id_model];
            let catid_cad = this.model_manager.id2catidcad[id_model];
            let id_cad = this.model_manager.id2idcad[id_model];
            let cargo = {scene : this.model_manager.scene, obj : obj, catid2catname_scan : this.model_manager.catid2catname_scan, catid2catname_cad : this.model_manager.catid2catname_cad }

            this.onclick_retriever2aligner(id_model, catid_cad, id_cad, true, [0, 0, 0], cargo);
        }
    }

    spawn_point(pos_mouse) {
        let u = pos_mouse.x/this.window.window_width;
        let v = pos_mouse.y/this.window.window_height;
        let d = this.pvv_model.pixel_depth;
        if (d !== 0) {
            this.create_anchor_and_set_position(u, v, d);
            return 1;
        } else {
            return 0;
        }
    }

    create_anchor_and_set_position(u, v, d) {
        let c = new THREE.Vector4(u*2.0 - 1.0, -v*2.0 + 1.0, d*2.0 - 1.0, 1.0);
        c = this.window.project_ndc_to_world(c);
        this.anchor.translation_matrix.makeTranslation(c.x, c.y, c.z);
        this.anchor.scale_matrix.makeScale(2, 2, 2);
        this.anchor.set_color_to_green();
        this.anchor.vao.n_instance = 1;
        this.anchor.is_visible = 1;
    }

    mouseclick_branching(pos_mouse) {
        if (this.aligner_state.is_state_set_anchor() || this.aligner_state.is_state_search()) {
            this.place_anchor_and_set_search_focus_or_transform(pos_mouse);
        }
    }

    mouseclick(event) {
        switch (event.button) {
            case 0:
                if (this.window.is_mouse_in_model_panel()) {
                    let pos_mouse = new THREE.Vector2( event.clientX, event.clientY);
                    pos_mouse = this.window.get_relative_pos(pos_mouse);
                    this.mouseclick_branching(pos_mouse);
                }
                break;
            }
    }

    save_anchor() {

    }
}


export default PVVController;
