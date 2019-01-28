
class ModelManager {
    init() {
        this.catid2catname_cad = {};
        this.catid2catname_scan = {};
        this.scene = null;
        this.id2obj = {};
        this.id2obj_is_realign = {};
        this.id2wireframe0 = {};
        this.id2wireframe1 = {};
        this.id2keypoint0 = {};
        this.id2keypoint1 = {};
        this.id2alignedobj = {};
        this.index2id = {};
        this.id2index = {};
        this.id2idcad = {};
        this.id2catidcad = {};


        this.counter_obj = 0;
        this.category2counter = {};
        this.id_selected = null;
    }

    fill_catid2catname_cad() {
        return xhr_json("GET", "db/cad/catid2catname").then( data => {
            this.catid2catname_cad = data;
        });
    }

    fill_catid2catname_scan() {
        return xhr_json("GET", "db/scan/catid2catname").then( data => {
            this.catid2catname_scan = data;
        });
    }

    draw(view_matrix0, projection_matrix0, view_matrix1, projection_matrix1) {
        if (this.scene !== null) {
            this.scene.draw(view_matrix1, projection_matrix1);
        }

        for (let key in this.id2obj) {
            let obj = this.id2obj[key];
            obj.draw(view_matrix0, projection_matrix0);
        }

        for (let key in this.id2wireframe0) {
            let wireframe0 = this.id2wireframe0[key];
            let obj = this.id2obj[key];
            if (obj !== undefined)
                wireframe0.draw(view_matrix0, projection_matrix0, obj.model_matrix);
        }

        for (let key in this.id2wireframe1) {
            let wireframe1 = this.id2wireframe1[key];
            let obj = this.id2obj[key];
            if (obj !== undefined)
                wireframe1.draw(view_matrix1, projection_matrix1, obj.model_matrix);
        }

    }

    get_scene() {
        return this.scene;
    }

    get_scene_model_matrix() {
        let model_matrix = this.scene === null ? [] : [this.scene.model_matrix.elements];
        return model_matrix;
    }

    get_obj_model_matrices() {
        let model_matrices = [];
        for (let i in this.id2obj) {
            model_matrices.push(this.id2obj[i].model_matrix.elements);
        }
        return model_matrices;
    }


    get_all_model_matrices() {
        let model_matrices = this.get_scene_model_matrix();
        model_matrices = model_matrices.concat(this.get_obj_model_matrices());
        return model_matrices;
    }

    get_all_vaos() {
        let vaos = [this.scene];
        vaos = vaos.concat(Object.values(this.id2obj));
        return vaos;
    }

    create_scene_label(label_buffer) {
        let label_buffer_int32 = new Int32Array(label_buffer.length)
        for (let i = 0; i < label_buffer.length; i++) {
            label_buffer_int32[i] = 0 & 0x000000FF;
            label_buffer_int32[i] |= (label_buffer[i] << 8);
        }
        return label_buffer_int32;
    }

    create_obj_label(id_model) {
        console.assert(id_model in this.id2index, "id_model not in id2index.");
        let i_cad = this.id2index[id_model];
        let tmp = new Int32Array(1);
        tmp[0] =  1 & 0x000000FF;
        tmp[0] |= i_cad << 8;
        return tmp[0];
    }

    add_scene(scene) {
        this.scene = scene;
    }

    check_if_index_unique() {

    }

    add_model(catid_cad, id_cad, obj, i_cad=-1) {

        let id_model = catid_cad + "_" + id_cad + "_" + this.counter_obj;
        this.id2obj[id_model] = obj;
        this.id2idcad[id_model] = id_cad;
        this.id2catidcad[id_model] = catid_cad;

        this.id2index[id_model]  = i_cad == -1 ? this.counter_obj : parseInt(i_cad);
        this.index2id[this.id2index[id_model]]  = id_model;

        if (catid_cad in this.category2counter)
            this.category2counter[catid_cad]++;
        else
            this.category2counter[catid_cad] = 0;

        this.id_selected = id_model;
        this.counter_obj++;
        console.assert(Object.keys(this.id2obj).length === this.counter_obj, "counter_obj and id2obj.length not same: %d and %d", Object.keys(this.id2obj).length, this.counter_obj);
        return id_model;
    }
    add_model_with_id_model(catid_cad, id_cad, obj, id_model, i_cad=-1) {
        let exists_already = id_model in this.id2obj;
        if (exists_already) {
            this.id2obj[id_model] = obj;
        } else {
            this.id2obj[id_model] = obj;
            this.id2idcad[id_model] = id_cad;
            this.id2catidcad[id_model] = catid_cad;

            this.id2index[id_model]  = i_cad == -1 ? this.counter_obj : parseInt(i_cad);
            this.index2id[this.id2index[id_model]]  = id_model;

            if (catid_cad in this.category2counter)
                this.category2counter[catid_cad]++;
            else
                this.category2counter[catid_cad] = 0;

            this.id_selected = id_model;
            this.counter_obj++;
            console.assert(Object.keys(this.id2obj).length === this.counter_obj, "counter_obj and id2obj.length not same: %d and %d", Object.keys(this.id2obj).length, this.counter_obj);
        }
        return id_model;
    }

    delete_selected_model() {
        this.delete_model(this.id_selected);
        this.id_selected = null;
    }

    delete_model(id_model) {
        let catid_cad = this.id2catidcad[id_model];
        let index = this.id2index[id_model];
        delete this.id2index[id_model];

        let id2index = {};
        let index2id = {};
        for (let key in this.id2index) {
            id2index[key] = this.id2index[key] > index ? this.id2index[key] - 1 : this.id2index[key];
            index2id[id2index[key]] = key;
        }
        this.id2index == id2index;
        this.index2id = index2id;

        delete this.id2obj[id_model];
        delete this.id2idcad[id_model];
        delete this.id2catidcad[id_model];

        this.category2counter[catid_cad]--;
        this.counter_obj--;
        console.assert(Object.keys(this.id2obj).length === this.counter_obj, "counter_obj and id2obj.length not same: %d and %d", Object.keys(this.id2obj).length, this.counter_obj);
    }


    add_wireframe0(id_model, wireframe) {
        this.id2wireframe0[id_model] = wireframe;
    }

    add_wireframe1(id_model, wireframe) {
        this.id2wireframe1[id_model] = wireframe;
    }

    add_keypoint0(id_model, keypoint) {
        this.id2keypoint0[id_model] = keypoint;
    }

    add_keypoint1(id_model, keypoint) {
        this.id2keypoint1[id_model] = keypoint;
    }

    add_alignedobj(id_model, obj) {
        this.id2alignedobj[id_model] = obj;
    }


    set_undone_wireframes0_unvisible(i_instance) {
        for (let key in this.id2wireframe0) {
            let wireframe = this.id2wireframe0[key];
            if (wireframe.is_done === 0)
                wireframe.is_visible = 0;
        }
    }

    set_undone_wireframes1_unvisible(i_instance) {
        for (let key in this.id2wireframe1) {
            let wireframe = this.id2wireframe1[key];
            if (wireframe.is_done === 0)
                wireframe.is_visible = 0;
        }
    }

    get_catid2catname_scan(catid) {
        let catname = this.catid2catname_scan[catid - 1];
        return catname === undefined ? "unknown" : catname;
    }


    get_catname2catid_cad(catname) {
        let catid = "";
        xhr_json("GET","/cad/catid2catname/" + catname).then(res => {
            catid = res.topLevelSynsetId;
        });
        return catid;
    }

    get_catname_from_vertex_info(vertex_info) {
        let id_mesh = vertex_info.id_mesh;
        let id_segment = vertex_info.id_segment;

        let catname = "";
        if (id_mesh === 0)
            catname = id_segment > 0 ? this.get_catid2catname_scan(id_segment) : "unknown";
        else if (id_mesh === 1) {
            let id = Object.keys(this.id2index).filter(key => {return this.id2index[key] === id_segment;})
            console.assert(id.length == 1, "Multiple indices found for hovering.");
            catname = this.catid2catname_cad[this.id2catidcad[id[0]]];
        }
        return catname;
    }

    make_all_obj_univisble_expect_selected() {
        for (let key in this.id2obj) {
            if (key !== this.id_selected) {
                let obj = this.id2obj[key];
                obj.is_visible = 0;
                obj.is_visible_offscreen = 0;
            }
        }
    }

    make_all_obj_visible() {
        for (let key in this.id2obj) {
            let obj = this.id2obj[key];
            obj.is_visible = 1;
            obj.is_visible_offscreen = 1;
        }
    }

    make_all_alignedobj_unvisible() {
        for (let key in this.id2alignedobj) {
            let obj = this.id2alignedobj[key];
            obj.is_visible_offscreen = 0;
        }
    }

    get_selected_obj() {
        return this.id2obj[this.id_selected];
    }

    get_selected_wireframe0() {
        return this.id2wireframe0[this.id_selected];
    }

    get_selected_wireframe1() {
        return this.id2wireframe1[this.id_selected];
    }

    get_selected_keypoint0() {
        return this.id2keypoint0[this.id_selected];
    }

    get_selected_keypoint1() {
        return this.id2keypoint1[this.id_selected];
    }

    get_obj(id_model) {
        return this.id2obj[id_model];
    }

    get_selected_id_model() {
        return this.id_selected;
    }

    set_selected_id_model_from_id_label(id_label) {
        this.id_selected = this.index2id[id_label];
    }

    set_selected_id_model(id_model) {
        this.id_selected = id_model;
    }
}

export default ModelManager;
