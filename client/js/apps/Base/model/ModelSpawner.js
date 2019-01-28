
import PLYLoader from '../../../lib/loader/PLYLoader';

import PLYModel from '../../../lib/vao/PLYModel';
import OBJModel from '../../../lib/vao/OBJModel.js';
import Wireframe from '../../../lib/vao/Wireframe.js';
import KeypointVAO from '../../../lib/vao/KeypointVAO';
import ScaleVAO from '../../../lib/vao/ScaleVAO';
import RotationVAO from '../../../lib/vao/RotationVAO';

class ModelSpawner {

    load_from_id_scan(id_scan, window, model_manager, pvv_model) {
        return this.load_scan(id_scan, window, model_manager, pvv_model).then( res =>
            pvv_model.set_active(1)
        );
    }

    load_from_id_annotation(id_annotation, window, model_manager, pvv_model) {
        return xhr_json("GET", "db/annotations/" + id_annotation).then( res => this.load_annotation(res[0], window, model_manager, pvv_model) )
    }



    load_annotation(data0, window, model_manager, pvv_model) {
        let data = data0["data"][data0["data"].length - 1];
        return this.load_scan(data.id_scan, window, model_manager, pvv_model).then( res =>
            Promise.all(this.load_annotated_cads(data.aligned_models, window, model_manager, pvv_model)).then( res => {
                this.load_all_keypoints(data.aligned_models, window, model_manager);
                this.create_all_wireframes(window, model_manager);
                // this.create_all_trs(window, model_manager, pvv_model);
                pvv_model.set_active(1);
            })
        );
    }

    bin2str( buff, length=-1 ) {
        let array_buffer = new Uint8Array( buff );
        if ( window.TextDecoder !== undefined ) {

            return new TextDecoder().decode( array_buffer );

        }

        let str = '';

        let len = length == -1 ? array_buffer.length : length;
        for ( let i = 0, il = len; i < il; i ++ ) {

            str += String.fromCharCode( array_buffer[ i ] ); // implicitly assumes little-endian

        }

        return str;

    }

    check_if_ply_or_obj(buff) {
        let header = this.bin2str(buff, 50);
        header = header.substring(0, 50);
        if (header.includes("ply") || header.includes("property"))
            return "ply"
        else
            return "obj"
    }

    load_cad(catid_cad, id_cad, window) {
        return new Promise((resolve, reject) => {
            xhr("GET", "/download/cad/mesh/" + catid_cad + "/" + id_cad).then(mesh_raw => {
                let mesh_type = this.check_if_ply_or_obj(mesh_raw);
                if (mesh_type == "ply") {
                    console.log("mesh-type (scan): ply");
                    this.load_cad_as_meshtype_ply(id_scan, mesh_raw, window, model_manager, pvv_model);
                } else if (mesh_type == "obj") {
                    console.log("mesh-type (scan): obj");
                    this.load_cad_as_meshtype_obj(catid_cad, id_cad, mesh_raw).then(res => {
                        let obj = new OBJModel();
                        obj.init(window.gl);
                        obj.set_buffers_from_geometry_and_materials(res.geometry, res.materials);
                        resolve(obj);
                    });
                }
            })
        });
    }

    load_scan(id_scan, window, model_manager, pvv_model) {
        return new Promise((resolve, reject) => {
            xhr_arraybuffer("GET", "/download/scan/mesh/" + id_scan).then(mesh_raw => {
                let mesh_type = this.check_if_ply_or_obj(mesh_raw);
                if (mesh_type == "ply") {
                    console.log("mesh-type (scan): ply");
                    xhr_arraybuffer("GET", "/download/scan/label/" + id_scan).then(labels_raw => {
                        this.load_scan_as_meshtype_ply(id_scan, mesh_raw, labels_raw, window, model_manager, pvv_model).then(res =>
                            resolve()
                        );
                    });
                } else if (mesh_type == "obj") {
                    console.log("mesh-type (scan): obj");
                }
            });
        });
    }

    load_scan_as_meshtype_ply (id_scan, mesh_raw, labels_raw, window, model_manager, pvv_model) {
        return new Promise((resolve, reject) => {
            let loader = new PLYLoader();
            let geometry = loader.parse(mesh_raw);
            geometry.computeVertexNormals();
            let labels = loader.parse(labels_raw);

            let scan = new PLYModel();
            scan.init(window.gl);
            scan.id = id_scan;
            scan.set_buffers_from_geometry_and_labels(geometry, labels);
            scan.label_buffer = model_manager.create_scene_label(scan.label_buffer_raw);
            scan.upload_all_buffers();
            scan.recenter_and_rotate();

            scan.init_vao_offscreen(pvv_model.gl, scan.position_buffer, scan.label_buffer, scan.index_buffer);

            scan.is_active = 1;
            scan.is_visible = 1;
            model_manager.add_scene(scan);

            resolve();
        });
    }

    load_scan_as_meshtype_obj(id_scan, window, model_manager, pvv_model) {
        return new Promise((resolve, reject) => {
            this.load_scan_mesh_and_texture_and_mtl(id_scan).then(res => {
                this.load_labels(id_scan).then(labels => {
                    let scan = new OBJModel();
                    scan.init(window.gl);
                    scan.id = id_scan;
                    scan.init_vao(res.geometry, res.materials);
                    // scan.uplad_labels( geometry.attributes.color.array, Int32Array.from(geometry.attributes.label.array));
                    scan.rotate_xaxis(-Math.PI/2.0);
                    scan.label_buffer = model_manager.create_scene_label(Int32Array.from(labels.attributes.label.array));
                    scan.init_vao_offscreen(pvv_model.gl, scan.position_buffer, scan.label_buffer);
                    scan.is_active = 1;
                    scan.is_visible = 1;
    				model_manager.add_scene(scan);
                    resolve(scan);
                });
            });
        });
    }

    load_scan_mesh_and_texture_and_mtl(id_scan) {
        return new Promise((resolve, reject) => {
            //-> load meshes
            let mtl_loader = new THREE.MTLLoader();
            mtl_loader.setTexturePath("/Scan2CAD/download/scan/texture/" + id_scan + "/");

            mtl_loader.setPath("/Scan2CAD/download/scan/mtl/");
            mtl_loader.load(id_scan, materials => {
                materials.preload();
                this.is_all_textures_loaded(materials).then(res => {
                    let obj_loader = new THREE.OBJLoader();
                    obj_loader.setMaterials( materials );
                    obj_loader.setPath( '/Scan2CAD/download/scan/mesh/' );
                    obj_loader.load( id_scan, object => {
                        resolve({geometry : object, materials : materials});
                    });
                });
            });
        });
    }

    load_cad_as_meshtype_obj(catid_cad, id_cad, mesh_raw, window, model_manager) {
        return new Promise((resolve, reject) => {
            //-> load meshes
            let mtl_loader = new THREE.MTLLoader();
            let texture_path = "/Scan2CAD/download/cad/texture/" + catid_cad + "/" + id_cad + "/;";

            mtl_loader.setTexturePath(texture_path);

            mtl_loader.load("/Scan2CAD/download/cad/mtl/" + catid_cad + "/" + id_cad, materials => {
                materials.preload();
                this.is_all_textures_loaded(materials).then(res => {
                    let obj_loader = new THREE.OBJLoader();
                    obj_loader.setMaterials( materials );
                    // let mesh_raw_str = this.bin2str(mesh_raw)
                    let geometry = obj_loader.parse( mesh_raw);
                    resolve({geometry : geometry, materials : materials});
                });
            });
        });
    }

    is_all_textures_loaded(materials) {
        function load_textures(map) {
            return new Promise((resolve, reject) => {
                (function load_textures1() {
                    if (map.image.complete === false) {
                        window.setTimeout(load_textures1, 200);
                    } else {
                        resolve();
                    }
                })();
            });
        }

        let asyncs = [];
        for (let key in materials.materials) {
            let map = materials.materials[key].map;
            if (map !== null) {
                asyncs.push(load_textures(map));
            }
        }

        return new Promise((resolve, reject) => {
            Promise.all(asyncs).then(() => resolve());
        })
    }

    load_annotated_cads(aligned_models, window, model_manager, pvv_model) {
        let asyncs = [];

        for (let i_cad in aligned_models) {
            let promise = new Promise((resolve, reject) => {

                let id_cad = aligned_models[i_cad].id_cad;
                let catid_cad = aligned_models[i_cad].catid_cad;
                this.load_cad(catid_cad, id_cad, window).then(obj => {
                    console.log(obj);

                    let id_model = model_manager.add_model(catid_cad, id_cad, obj, i_cad);
                    // -> generate label for CAD
                    let label_int32 = model_manager.create_obj_label(id_model);
                    let label_buffer_int32 = new Int32Array(obj.position_buffer.length/3);
                    label_buffer_int32.fill(label_int32);
                    obj.label_buffer = label_buffer_int32;
                    obj.init_vao_offscreen(pvv_model.gl, obj.position_buffer, obj.label_buffer);
                    obj.is_visible = 1;

                    const trs = aligned_models[i_cad].trs;

                    const scale = new THREE.Vector3().fromArray(trs.scale.slice(0));
                    const rotation = new THREE.Quaternion().fromArray(trs.rotation.slice(0));
                    const translation = new THREE.Vector3().fromArray(trs.translation.slice(0));

                    obj.scale_matrix0.makeScale(scale.x, scale.y, scale.z);
                    obj.rotation_matrix0.makeRotationFromQuaternion(rotation);
                    obj.translation_matrix0.makeTranslation(translation.x, translation.y, translation.z);

                    obj.scale_matrix.makeScale(scale.x, scale.y, scale.z);
                    obj.rotation_matrix.makeRotationFromQuaternion(rotation);
                    obj.translation_matrix.makeTranslation(translation.x, translation.y, translation.z);

                    resolve();
                });
            });
            asyncs.push(promise);
        }
        return asyncs;
    }
    load_all_keypoints(aligned_models, window, model_manager) {
        for (let key in model_manager.id2obj) {
            let obj = model_manager.id2obj[key];
            let index = model_manager.id2index[key];

            const aligned_model = aligned_models[index];
            const data_keypoint0 = aligned_model.keypoint0;
            const data_keypoint1 = aligned_model.keypoint1;

            const pos0 = data_keypoint0.position.slice();
            const pos1 = data_keypoint1.position.slice();

            let kp0 = new KeypointVAO();
            kp0.init(window.gl);
            kp0.set_position_from_array(pos0, data_keypoint0.n_keypoints);
            kp0.vao.base_scale = 0.05;
            kp0.set_color_to_green();
            kp0.is_visible = 0;

            let kp1 = new KeypointVAO();
            kp1.init(window.gl);
            kp1.set_position_from_array(pos1, data_keypoint1.n_keypoints);
            kp1.vao.base_scale = 0.05;
            kp1.set_color_to_red();
            kp1.is_visible = 0;

            model_manager.add_keypoint0(key, kp0);
            model_manager.add_keypoint1(key, kp1);

        }
    }

    create_all_wireframes(window, model_manager) {
        for (let key in model_manager.id2obj) {
            let id_model = key
            let obj = model_manager.id2obj[key];

            let wireframe = new Wireframe();
            wireframe.init(window.gl);
            wireframe.is_visible = 1;
            wireframe.update_box(obj.bounding_box.x, obj.bounding_box.y, obj.bounding_box.z);
            model_manager.add_wireframe0(id_model, wireframe);
        }
    }

    create_all_trs(window, model_manager, pvv_model) {
        for (let key in model_manager.id2obj) {
            let id_model = key
            let obj = model_manager.id2obj[key];

            let scale = new ScaleVAO();
            scale.init(window.gl);
            scale.set_pos(obj.bounding_box.x, obj.bounding_box.z, obj.bounding_box.y);
            scale.init_vao_offscreen(pvv_model.gl, scale.mesh.vertices, scale.mesh.labels, scale.mesh.elements);
            scale.is_visible = 0;
            model_manager.add_scale(id_model, scale);

            let rotation = new RotationVAO();
            rotation.init(window.gl);
            rotation.set_pos(obj.bounding_box.x, obj.bounding_box.z, obj.bounding_box.y);
            rotation.init_vao_offscreen(pvv_model.gl, rotation.mesh.vertices, rotation.mesh.labels, rotation.mesh.elements);
            rotation.is_visible = 0;
            model_manager.add_rotation(id_model, rotation);


        }
    }






}

export default ModelSpawner;
