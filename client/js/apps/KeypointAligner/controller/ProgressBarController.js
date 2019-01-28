
import kabsch from "../../../lib/math/Kabsch";
import pca from "../../../lib/math/PCA";

class ProgressBarController {
    init(window0, window1, model_manager, progress_model, keypoint_state) {
        this.window0 = window0;
        this.window1 = window1;
        this.model_manager = model_manager;
        this.progress_model = progress_model;
        this.keypoint_state = keypoint_state;

        // -> members
        this.n_min_keypoints = Settings.n_min_keypoints;
        // <-

        // -> bindings
        this.progress_model.onclick_done = this.onclick_done.bind(this);
        this.progress_model.onclick_back = this.onclick_back.bind(this);
        this.progress_model.onclick_start_over = this.onclick_start_over.bind(this);
        this.progress_model.onclick_looks_good = this.onclick_looks_good.bind(this);
        // <-
    }

    onclick_done(event) {
        if (this.check_number_of_keypoints())
            this.progress_model.flash_not_enough_keypoints();
        else if (this.keypoint_state.is_state_set_keypoint1())
            this.progress_model.flash_place_keypoint1();

        // else if (this.check_keypoint_spread())
        //     this.progress_model.flash_too_close();
        // else if (this.check_keypoint_orientation())
        //     this.progress_model.flash_bad_keypoint_placement();
        else {
            let trs = this.calculate_kabsch_trs();
            if (trs == null)
                this.progress_model.flash_bad_keypoint_placement();
            else {
                this.keypoint_state.set_state_to_view_result();
                this.align_keypoints(trs);
                this.transfer_to_window1(trs);
                this.focus_camera_on_obj();
                this.model_manager.make_all_obj_univisble_expect_selected();

                let id_model = this.model_manager.get_selected_id_model();

                if (Object.keys(this.model_manager.id2alignedobj).length === Object.keys(this.model_manager.id2obj).length)
                    this.progress_model.flash_done();
                this.progress_model.draw_dependent_on_state();
            }
        }
    }

    align_keypoints(trs) {
        this.window0.set_camera_pos_and_lookat_to_default();
        this.window1.set_camera_pos_and_lookat_to_default();
        // let wireframe0 = this.model_manager.get_selected_wireframe0();
        // wireframe0.set_color_to_green();
        // wireframe0.is_done = 1;
        let wireframe1 = this.model_manager.get_selected_wireframe1();
        wireframe1.set_color_to_green();
        wireframe1.is_done = 1;

        let id_model = this.model_manager.get_selected_id_model();
        let obj = this.model_manager.get_selected_obj();
        this.model_manager.add_alignedobj(id_model, obj);


    }

    check_keypoint_spread() {
        let keypoint0 = this.model_manager.get_selected_keypoint0();
        let A = keypoint0.get_position_as_array();
        const n = A.length;
        let c = [0, 0, 0];
        for (let i = 0; i < n; i++) {
            c[0] += A[i][0];
            c[1] += A[i][1];
            c[2] += A[i][2];
        }
        c[0] /= n;
        c[1] /= n;
        c[2] /= n;

        let s = 0;
        for (let i = 0; i < n; i++) {
            s += Math.abs(A[i][0] - c[0]);
            s += Math.abs(A[i][1] - c[1]);
            s += Math.abs(A[i][2] - c[2]);
        }
        s /= n;
        return s < 0.10;
    }

    check_number_of_keypoints() {
        let keypoint0 = this.model_manager.get_selected_keypoint0();
        return keypoint0.vao.n_instance < this.n_min_keypoints;
    }

    transfer_to_first_window(id_model) {
        let obj = this.model_manager.id2obj[id_model];
        obj.reinit_gl(this.window0.gl);
        obj.set_trs_to_default();

        let keypoint0 = this.model_manager.id2keypoint0[id_model];
        keypoint0.reinit_gl(this.window0.gl);
        keypoint0.set_color_to_red();
    }


    onclick_start_over(event) {
        let id_model = this.model_manager.get_selected_id_model();

        this.transfer_to_first_window(id_model);

        let obj = this.model_manager.get_selected_obj();
        const pos0 = obj.get_position();

        let keypoint0 = this.model_manager.id2keypoint0[id_model];
        keypoint0.set_to_zero();
        keypoint0.set_trs_to_default();
        keypoint0.set_color_to_green();
        keypoint0.set_origin_position(pos0);

        let keypoint1 = this.model_manager.id2keypoint1[id_model];
        keypoint1.set_to_zero();
        keypoint1.set_trs_to_default();
        keypoint1.set_origin_position(pos0);

        // let wireframe0 = this.model_manager.id2wireframe0[id_model];
        // wireframe0.set_color_to_red();
        // wireframe0.is_visible = 1;

        let wireframe1 = this.model_manager.id2wireframe1[id_model];
        wireframe1.set_color_to_red();
        wireframe1.is_visible = 1;

        delete this.model_manager.id2alignedobj[id_model];
        this.keypoint_state.set_state_to_closeup_view();
        this.model_manager.make_all_obj_univisble_expect_selected();

        this.progress_model.set_number_of_keypoint(0);
        this.progress_model.draw_dependent_on_state();
        this.focus_camera_on_obj(id_model);
    }

    onclick_looks_good(event) {
        let id_model = this.model_manager.get_selected_id_model();
        const obj = this.model_manager.id2obj[id_model];
        const keypoint0 = this.model_manager.id2keypoint0[id_model];
        const keypoint1 = this.model_manager.id2keypoint1[id_model];

        let id_cad = this.model_manager.id2idcad[id_model];
        let catid_cad = this.model_manager.id2catidcad[id_model];
        let is_realign = this.model_manager.id2obj_is_realign[id_model];
        this.onclick_aligner2retriever(id_model, catid_cad, id_cad, is_realign, obj, keypoint0, keypoint1);
        this.model_manager.delete_selected_model();
    }

    calculate_kabsch_trs() {
		//let pA = {"position":[0.30521124601364136,-0.21906980872154236,-0.29463687539100647,0.2980354130268097,-0.20709002017974854,0.1359395831823349,0.31300708651542664,0.21144060790538788,0.3064456284046173,0.3069489002227783,0.21144060790538788,0.3064456284046173,0.2875610589981079,-0.2062801867723465,0.14137138426303864,0.302265465259552,-0.21934494376182556,-0.30334100127220154],"trs":{"elements":[1,0,0,0,0,1,0,0,0,0,1,0,-0.01090673426998046,-0.6316858937503476,1.012213690784871,1]}};
		//let pB = {"position":[0.25234124064445496,-0.027378594502806664,-0.11149993538856506,0.12206356972455978,-0.033244118094444275,0.039127349853515625,0.08259844779968262,0.1549643576145172,0.11851520091295242,0.15976925194263458,0.15907536447048187,-0.0552065446972847,0.11648421734571457,-0.039564453065395355,-0.12468403577804565,0.019644232466816902,-0.0387551449239254,-0.2717883288860321],"trs":{"elements":[1,0,0,0,0,1,0,0,0,0,1,0,-0.01090673426998046,-0.6316858937503476,1.012213690784871,1]}};

		let keypoint0 = this.model_manager.get_selected_keypoint0();
        //keypoint0.set_position_from_array(pA.position, 6);
        //keypoint0.translation_matrix.elements = pA.trs.elements;
        let A = keypoint0.get_position_and_trs();

        let keypoint1 = this.model_manager.get_selected_keypoint1();
        //keypoint1.set_position_from_array(pB.position, 6);
        //keypoint1.translation_matrix.elements = pB.trs.elements;
        let B = keypoint1.get_position_and_trs();

        //console.log(JSON.stringify(A));
        //console.log(JSON.stringify(B));

        let trs = kabsch(A.position, B.position);
        // let trs = kabsch(pA.position, pA.trs, pB.position, pB.trs);
        return trs;
    }

    transfer_to_window1(trs) {
        let obj = this.model_manager.get_selected_obj();
        obj.reinit_gl(this.window1.gl);
        obj.is_visible_offscreen = 0;

        let keypoint0 = this.model_manager.get_selected_keypoint0();
        let keypoint1 = this.model_manager.get_selected_keypoint1();
        keypoint0.reinit_gl(this.window1.gl);
        keypoint0.set_color_to_green();

        let T0 = new THREE.Matrix4();
        T0.makeTranslation(-trs.cA[0], -trs.cA[1], -trs.cA[2]);
        let T1 = new THREE.Matrix4();
        T1.makeTranslation(trs.cB[0], trs.cB[1], trs.cB[2]);

        let M = new THREE.Matrix4();
        M.identity();
        M.premultiply(keypoint0.scale_matrix);
        M.premultiply(keypoint0.rotation_matrix);
        M.premultiply(T0);
        M.premultiply(trs.scale_matrix);
        M.premultiply(trs.rotation_matrix);
        M.premultiply(T1);
        M.premultiply(keypoint1.translation_matrix);

        let trans = new THREE.Vector3();
        let quaternion = new THREE.Quaternion();
        let scale = new THREE.Vector3();
        M.decompose(trans, quaternion, scale);

        let T = new THREE.Matrix4();
        T.makeTranslation(trans.x, trans.y, trans.z);

        let R = new THREE.Matrix4();
        R.makeRotationFromQuaternion(quaternion);

        let S = new THREE.Matrix4();
        S.makeScale(scale.x, scale.y, scale.z);

        keypoint0.scale_matrix.copy(S);
        keypoint0.rotation_matrix.copy(R);
        keypoint0.translation_matrix.copy(T);
        keypoint0.calc_model_matrix();

        let ca = keypoint0.calc_centroid();
        let cb = keypoint1.calc_centroid();

        // console.log("centroida", ca);
        // console.log("centroidb", cb);

        M.identity();
        M.premultiply(obj.scale_matrix);
        M.premultiply(obj.rotation_matrix);
        M.premultiply(T0);
        M.premultiply(trs.scale_matrix);
        M.premultiply(trs.rotation_matrix);
        M.premultiply(T1);
        M.premultiply(keypoint1.translation_matrix);

        trans = new THREE.Vector3();
        quaternion = new THREE.Quaternion();
        scale = new THREE.Vector3();
        M.decompose(trans, quaternion, scale);

        T = new THREE.Matrix4();
        T.makeTranslation(trans.x, trans.y, trans.z);

        R = new THREE.Matrix4();
        R.makeRotationFromQuaternion(quaternion);

        S = new THREE.Matrix4();
        S.makeScale(scale.x, scale.y, scale.z);


        obj.scale_matrix.copy(S);
        obj.rotation_matrix.copy(R);
        obj.translation_matrix.copy(T);
        obj.calc_model_matrix();

        // console.warn(keypoint0.scale_matrix, keypoint0.rotation_matrix, keypoint0.translation_matrix);

        // let wireframe0 = this.model_manager.get_selected_wireframe0();
        // wireframe0.is_visible = 0;
    }

    focus_camera_on_obj() {
        let obj = this.model_manager.get_selected_obj();
        let pos = new THREE.Vector4(0,  obj.bounding_box.y + 1.0, -obj.bounding_box.x - 1.0, 1);
        pos.applyMatrix4(obj.model_matrix);

        let lookat = new THREE.Vector3(0, 0, 0);
        let dummy0 = new THREE.Quaternion();
        let dummy1 = new THREE.Vector3(0, 0, 0);
        obj.model_matrix.decompose(lookat, dummy0, dummy1);
        this.window0.set_camera_pos_and_lookat(pos, lookat);
        this.window1.set_camera_pos_and_lookat(pos, lookat);
    }

    check_keypoint_orientation() {
        let keypoint0 = this.model_manager.get_selected_keypoint0();
        let A = keypoint0.get_position_as_array();

        let keypoint1 = this.model_manager.get_selected_keypoint1();
        let B = keypoint1.get_position_as_array();

        let M0 = pca(A);
        M0 = new THREE.Vector3().fromArray(M0);
        M0.normalize();

        let M1 = pca(B);
        M1 = new THREE.Vector3().fromArray(M1);
        M1.normalize();

        const angle = Math.acos(M0.dot(M1));

        return angle > 80;
    }

    onclick_aligner2retriever() {
        throw new Error("Error: Define 'onclick_aligner2retriever'");
    }

    onclick_back(event) {

        this.window0.set_camera_pos_and_lookat_to_default();
        this.window1.set_camera_pos_and_lookat_to_default();
        // let wireframe0 = this.model_manager.get_selected_wireframe0();
        // wireframe0.is_visible = 0;
        let wireframe1 = this.model_manager.get_selected_wireframe1();
        wireframe1.is_visible = 0;

        this.keypoint_state.set_state_to_pick_object();
        this.progress_model.draw_dependent_on_state();
        this.model_manager.make_all_obj_visible();
        this.model_manager.make_all_alignedobj_unvisible();
    }

}

export default ProgressBarController;
