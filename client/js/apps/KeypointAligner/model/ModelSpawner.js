
import ModelSpawnerBase from "../../Base/model/ModelSpawner";
import Wireframe from '../../../lib/vao/Wireframe.js';
import KeypointVAO from '../../../lib/vao/KeypointVAO';

class ModelSpawner extends ModelSpawnerBase {

    load_by_retrieval(info, cargo, window0, window1, model_manager, pvv_model0, pvv_model1) {
        if (cargo.obj === null) {
            return this.load_scan(info.id_scan, window1, model_manager, pvv_model1).then( res =>
                this.load_retrieved_model(info.retrieved_model, window0, model_manager, pvv_model0).then( res => {
                    this.create_all_wireframes_two_windows(window0, window1, model_manager);
                    this.create_all_keypoints_two_windows(window0, window1, model_manager);
                    pvv_model0.set_active(1);
                    pvv_model1.set_active(1);
                })
            );
        } else
            return this.create_scene(cargo.scene, window1, model_manager, pvv_model1).then( res =>
                this.create_retrieved_model(info.retrieved_model, cargo.obj, window0, model_manager, pvv_model0).then( res => {
                    this.create_all_wireframes_two_windows(window0, window1, model_manager);
                    this.create_all_keypoints_two_windows(window0, window1, model_manager);
                    pvv_model0.set_active(1);
                    pvv_model1.set_active(1);
                })
            );
    }

    load_alignment_prealignment(data, window0, window1, model_manager, pvv_model0, pvv_model1) {
        this.load_aligned_scene(data.id_scan, window1, model_manager, pvv_model1).then( res =>
            Promise.all(this.load_aligned_models(data.aligned_models, window0, model_manager, pvv_model0)).then( res => {
                this.create_all_wireframes_two_windows(window0, window1, model_manager);
                this.create_all_keypoints_two_windows(window0, window1, model_manager);
                pvv_model0.set_active(1);
                pvv_model1.set_active(1);
            })
        );
    }

    load_alignment_keypointalignment(data, window0, window1, model_manager, pvv_model0, pvv_model1) {
        this.load_aligned_scene(data.id_scan, window1, model_manager, pvv_model1).then( res =>
            Promise.all(this.load_aligned_models(data.aligned_models, window1, model_manager, pvv_model0)).then( res => {
                this.create_all_wireframes_two_windows(window0, window1, model_manager);
                this.load_all_keypoints(data.aligned_models, window1, model_manager);

                for (let key in model_manager.id2obj) {
                    let wireframe1 = model_manager.id2wireframe1[key];
                    wireframe1.is_visible = 1;
                }

                model_manager.id2alignedobj = Object.assign({}, model_manager.id2obj);
                pvv_model0.set_active(1);
                pvv_model1.set_active(1);
            })
        );
    }

    load_alignment(data, window, model_manager, pvv_model) {
        this.load_aligned_scene(data.id_scan, window, model_manager, pvv_model).then( res =>
            Promise.all(this.load_aligned_models(data.aligned_models, window, model_manager, pvv_model)).then( res => {
                this.create_all_wireframes(window, model_manager);
                pvv_model.set_active(1);
            })
        );
    }

    create_scene(scene, window, model_manager, pvv_model) {
        return new Promise((resolve, reject) => {
            scene.reinit_gl(window.gl);
            model_manager.add_scene(scene);
            scene.init_vao_offscreen(window.gl, scene.position_buffer, scene.label_buffer, scene.index_buffer);
            resolve();
        });
    }

    load_retrieved_model(retrieved_model, window, model_manager, pvv_model) {
        return new Promise((resolve, reject) => {
            let id_cad = retrieved_model.id_cad;
            let catid_cad = retrieved_model.catid_cad;
            let is_realign = retrieved_model.is_realign;
            this.load_cad(catid_cad, id_cad, window).then(obj => {

                let id_model = model_manager.add_model(catid_cad, id_cad, obj);
                // -> generate label for CAD
                let label_int32 = model_manager.create_obj_label(id_model);
                let label_buffer_int32 = new Int32Array(obj.position_buffer.length/3);
                label_buffer_int32.fill(label_int32);
                obj.label_buffer = label_buffer_int32;
                obj.init_vao_offscreen(pvv_model.gl, obj.position_buffer, obj.label_buffer);
                obj.is_visible = 1;
                // <-

                model_manager.id2obj_is_realign[id_model] = is_realign;

                const position = retrieved_model.translation;

                // const scale = new THREE.Vector3().fromArray(trs.scale.slice(0));
                // const rotation = new THREE.Quaternion().fromArray(trs.rotation.slice(0));
                const translation = new THREE.Vector3().fromArray(retrieved_model.position.slice(0));

                // obj.scale_matrix0.makeScale(scale.x, scale.y, scale.z);
                // obj.rotation_matrix0.makeRotationFromQuaternion(rotation);
                obj.translation_matrix0.makeTranslation(translation.x, translation.y, translation.z);

                // obj.scale_matrix.makeScale(scale.x, scale.y, scale.z);
                // obj.rotation_matrix.makeRotationFromQuaternion(rotation);
                obj.translation_matrix.makeTranslation(translation.x, translation.y, translation.z);

                obj.calc_model_matrix();

                resolve();
            });
        });
    }

    create_retrieved_model(retrieved_model, obj, window, model_manager, pvv_model) {
        return new Promise((resolve, reject) => {

            let id_model = retrieved_model.id_model;
            let id_cad = retrieved_model.id_cad;
            let catid_cad = retrieved_model.catid_cad;
            let is_realign = retrieved_model.is_realign;

            model_manager.add_model_with_id_model(catid_cad, id_cad, obj, id_model);

            let label_int32 = model_manager.create_obj_label(id_model);
            let label_buffer_int32 = new Int32Array(obj.position_buffer.length/3);
            label_buffer_int32.fill(label_int32);
            obj.label_buffer = label_buffer_int32;
            obj.reinit_gl(window.gl);
            obj.init_vao_offscreen(window.gl, obj.position_buffer, obj.label_buffer);

            // console.log(id_model, is_realign);
            // console.log(retrieved_model)
            model_manager.id2obj_is_realign[id_model] = is_realign;

            resolve();
        });
    }

    spawn_model(catid_cad, id_cad, window, model_manager, pvv_model) {
        return new Promise((resolve, reject) => {
            load_cad_mesh_and_texture_and_mtl(id_cad, catid_cad).then(res => {
                let label_int32 = model_manager.create_obj_label();
                let label_buffer_int32 = new Int32Array(obj.position_buffer.length/3);
                label_buffer_int32.fill(label_int32);
                obj.label_buffer = label_buffer_int32;
                obj.init_vao_offscreen(pvv_model.gl, obj.position_buffer, obj.label_buffer);
                resolve(obj);
            });
        });

    }

    create_all_wireframes(window, model_manager) {
        for (let key in model_manager.id2obj) {
            let id_model = key
            let obj = model_manager.id2obj[key];

            var wireframe = new Wireframe();
            wireframe.init(window.gl);
            wireframe.is_visible = 1;
            wireframe.update_box(obj.bounding_box.x, obj.bounding_box.y, obj.bounding_box.z);
            model_manager.add_wireframe0(id_model, wireframe);
        }
    }

    create_all_wireframes_two_windows(window0, window1, model_manager) {
        for (let key in model_manager.id2obj) {
            let id_model = key
            let bounding_box = model_manager.id2obj[key].bounding_box;
            this.create_wireframe_two_windows(id_model, bounding_box, window0, window1, model_manager);
        }
    }

    create_wireframe_two_windows(id_model, bounding_box, window0, window1, model_manager) {
        // var wireframe0 = new Wireframe();
        // wireframe0.init(window0.gl);
        // wireframe0.update_box(bounding_box.x, bounding_box.y, bounding_box.z);
        // wireframe0.is_visible = 1;
        // model_manager.add_wireframe0(id_model, wireframe0);

        var wireframe1 = new Wireframe();
        wireframe1.init(window1.gl);
        wireframe1.update_box(bounding_box.x, bounding_box.y, bounding_box.z);
        wireframe1.is_visible = 1;
        model_manager.add_wireframe1(id_model, wireframe1);
    }

    create_all_keypoints_two_windows(window0, window1, model_manager) {
        for (let key in model_manager.id2obj) {
            let id_model = key;
            this.create_keypoint_two_windows(id_model, window0, window1, model_manager);
        }
    }

    create_keypoint_two_windows(id_model, window0, window1, model_manager) {
        let obj = model_manager.id2obj[id_model];
        let scale0 = [obj.scale_matrix.elements[0], obj.scale_matrix.elements[5], obj.scale_matrix.elements[10]];
        let scale = Math.min(Math.min(scale0[0], scale0[1]), scale0[2]);
        const pos0 = obj.get_position();

        var keypoint0 = new KeypointVAO();
        keypoint0.init(window0.gl);
        keypoint0.is_visible = 1;
        keypoint0.set_color_to_green();
        keypoint0.vao.base_scale = 0.025;
        keypoint0.set_origin_position(pos0);
        model_manager.add_keypoint0(id_model, keypoint0);

        var keypoint1 = new KeypointVAO();
        keypoint1.init(window1.gl);
        keypoint1.is_visible = 1;
        keypoint1.vao.base_scale = 0.05;
        keypoint1.set_origin_position(pos0);
        model_manager.add_keypoint1(id_model, keypoint1);
    }

    load_all_keypoints(aligned_models, window1, model_manager) {
        for (let key in model_manager.id2obj) {
            let obj = model_manager.id2obj[key];

            const aligned_model = aligned_models.find(elem => {return elem.id === key;});
            const data_keypoint0 = aligned_model.keypoint0;
            const data_keypoint1 = aligned_model.keypoint1;

            const pos0 = data_keypoint0.position.slice();
            const pos1 = data_keypoint1.position.slice();

            var keypoint0 = new KeypointVAO();
            keypoint0.init(window1.gl);
            keypoint0.set_position_from_array(pos0, data_keypoint0.n_keypoints);

            keypoint0.vao.base_scale = 0.05;
            keypoint0.set_color_to_green();
            keypoint0.is_visible = 1;
            model_manager.add_keypoint0(key, keypoint0);

            var keypoint1 = new KeypointVAO();
            keypoint1.init(window1.gl);
            keypoint1.set_position_from_array(pos1, data_keypoint1.n_keypoints);

            keypoint1.vao.base_scale = 0.05;
            keypoint1.set_color_to_red();
            keypoint1.is_visible = 1;
            model_manager.add_keypoint1(key, keypoint1);


        }
    }


}

export default ModelSpawner;
