
import OBJModel from '../../../lib/vao/OBJModel';
import Wireframe from '../../../lib/vao/Wireframe.js';
import ScaleVAO from '../../../lib/vao/ScaleVAO.js';
import RotationVAO from '../../../lib/vao/RotationVAO.js';


class GalleryController {

    init(window, model_manager, gallery_model, pvv_model, segment_satellite_model, aligner_state, anchor, info_model, object_counter_model) {
        this.window = window;
        this.model_manager = model_manager;
        this.gallery_model = gallery_model;
        this.pvv_model = pvv_model;
        this.segment_satellite_model = segment_satellite_model;
        this.aligner_state = aligner_state;
        this.anchor = anchor;
        this.info_model = info_model;
        this.object_counter_model = object_counter_model;


        // -> bindings
        this.gallery_model.onclick_search = this.onclick_search.bind(this);
        this.gallery_model.onclick_thumbnail = this.onclick_thumbnail.bind(this);
        this.gallery_model.onclick_pagination = this.onclick_pagination.bind(this);
        // <-

    }

    clean() {
        this.gallery_model.clean();

        // let root_modellisting = document.getElementById('model_listing_div');
        // while (root_modellisting.hasChildNodes()) {
        //     root_modellisting.removeChild(root_modellisting.lastChild);
        // }
    }

    shuffle(a) {
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    }

    onclick_search(should_save, i_page=0) {
        if (this.aligner_state.is_state_search()) {
            this.gallery_model.set_label_to_loading();
            let time_start = new Date().getTime();

            let name_category_scannet = this.gallery_model.search_text;
            let data = null;
            let n_matches_found = 0;
            xhr_json("GET", "db/cad/search/" + name_category_scannet + "/" + i_page).then( res => {
                data = res["data"];
                n_matches_found = res["n_matches_found"];
                this.add_item_to_cad_data(data, this.gallery_model.last_picked.id_cad, this.gallery_model.last_picked.catid_cad);
                if (data.length > 0) {
                    this.gallery_model.set_label_to_default();
                    // data = this.shuffle(data);
                    this.gallery_model.draw_gallery(data, n_matches_found)
                    this.aligner_state.set_state_to_search();
                    this.info_model.draw_dependent_on_state();
                } else {
                    let time_elapsed = (new Date().getTime() - time_start)/1000.0;
                    if (time_elapsed < 1)
                        setTimeout(this.draw_as_no_results_found(), 1000);
                    else
                        this.draw_as_no_results_found();
                }
                if (should_save)
                    this.save_search();
            });
        } else
            this.info_model.focus();
    }

    add_item_to_cad_data(data, id_cad, catid_cad) {
        if (id_cad != null) {
            data[0] = {id_cad : id_cad, catid_cad : catid_cad};
        }
    }

    draw_as_no_results_found() {
        this.gallery_model.draw_gallery_as_no_results_found();
        this.gallery_model.set_label_to_default();
        this.aligner_state.set_state_to_search();
        this.info_model.draw_search();
    }

    onclick_pagination(i_page) {
        this.onclick_search(false, i_page*100);
    }

    onclick_thumbnail(catid_cad, id_cad) {
        this.gallery_model.set_last_picked(id_cad, catid_cad);

        let pos_anchor = this.anchor.get_position_as_array()[0];

        let cargo = {scene : this.model_manager.scene, obj : null, catid2catname_scan : this.model_manager.catid2catname_scan, catid2catname_cad : this.model_manager.catid2catname_cad }
        this.onclick_retriever2aligner(null, catid_cad, id_cad, false, pos_anchor, cargo);
    }

    onclick_spawn_model(catid_cad, id_model1, should_save) {
        if (this.aligner_state.is_state_search()) {

            // let id_model1 = id_model0.substring(4);
            var obj = new OBJModel();
            obj.init(this.window.gl);
            obj.load(catid_cad, id_model1).then(() => {

                let pos_anchor = this.anchor.get_position_as_array()[0];
                let trans = new THREE.Matrix4();
                trans.makeTranslation(pos_anchor[0], pos_anchor[1], pos_anchor[2]);
                obj.translation_matrix0.copy(trans);
                obj.translation_matrix.copy(trans);

                let label_int32 = this.model_manager.create_obj_label();
                let label_buffer_int32 = new Int32Array(obj.position_buffer.length/3);
                label_buffer_int32.fill(label_int32);
                obj.init_vao_offscreen(this.pvv_model.gl, obj.position_buffer, label_buffer_int32);

                this.model_manager.add_model(catid_cad, id_model1, obj);
                let id_model_unique = this.model_manager.get_selected_id_model();

                var wireframe = new Wireframe();
                wireframe.init(this.window.gl);
                wireframe.is_visible = 1;
                wireframe.update_box(obj.bounding_box.x, obj.bounding_box.y, obj.bounding_box.z);
                this.model_manager.add_wireframe0(id_model_unique, wireframe);

                var scale = new ScaleVAO();
                scale.init(this.window.gl);
                scale.set_pos(obj.bounding_box.x, obj.bounding_box.z, obj.bounding_box.y);
                scale.init_vao_offscreen(this.pvv_model.gl, scale.mesh.vertices, scale.mesh.labels, scale.mesh.elements);
                scale.is_visible = 1;
                this.model_manager.add_scale(id_model_unique, scale);

                var rotation = new RotationVAO();
                rotation.init(this.window.gl);
                rotation.set_pos(obj.bounding_box.x, obj.bounding_box.z, obj.bounding_box.y);
                rotation.init_vao_offscreen(this.pvv_model.gl, rotation.mesh.vertices, rotation.mesh.labels, rotation.mesh.elements);
                rotation.is_visible = 1;
                this.model_manager.add_rotation(id_model_unique, rotation);

                this.segment_satellite_model.set_active(0);

                this.aligner_state.set_state_to_trs();
                this.info_model.draw_trs();
                this.anchor.is_visible = 0;

                this.object_counter_model.draw(this.model_manager.id_counter);

                this.model_manager.id2duration[id_model_unique] = Date.now();

                if (should_save)
                    this.save_trs(id_model_unique, obj);
            });

        } else if (this.aligner_state.is_state_trs()) {
            let id_model = this.model_manager.get_selected_id_model();
            let index = this.model_manager.id2index[id_model];
            this.model_manager.delete_selected_model();
            this.aligner_state.set_state_to_search();
            this.onclick_spawn_model(catid_cad, id_model1, should_save);
        }
    }

    load_obj() {

    }

    save_search() {

    }

    save_trs(id_model, obj) {

    }


}

export default GalleryController;
