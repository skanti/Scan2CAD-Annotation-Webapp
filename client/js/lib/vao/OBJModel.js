import GLProgram from './GLProgram.js';
import * as THREE from 'three/build/three';
import OBJLoader from '../loader/OBJLoader.js';
import MTLLoader from '../loader/MTLLoader.js'

import * as Phong from '../shader/PhongGLSL.js';
import * as PVVGLSL from '../shader/PVVGLSL';

class VAOOffscreen {
    constructor(gl) {
        this.gl = gl;
        this.program = null;

        this.vbo_position = null;
        this.vbo_label = null;

        this.n_vertices = 0;
    }

    set_vbo_position(position_buffer) {
        // -> vbo position
        this.vbo_position = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vbo_position);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, position_buffer, this.gl.STATIC_DRAW);
        this.gl.vertexAttribPointer(0, 3, this.gl.FLOAT, false, 0, 0);
        this.gl.enableVertexAttribArray(0);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
        // <-
    }

    set_vbo_label(label_buffer) {
        // -> vbo labels
        this.vbo_label = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vbo_label);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, label_buffer, this.gl.STATIC_DRAW);
        this.gl.vertexAttribIPointer(1, 1, this.gl.INT, 0, 0);
        this.gl.enableVertexAttribArray(1);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
        // <-
    }
}

class VAOMesh {
    constructor() {
        this.vbo_position = 0;
        this.vbo_normal = 0;
        this.vbo_uv = 0;
        this.vbo_label = 0;
        this.vbo_material = 0;
        this.vbo_color = 0;
        this.ebo = 0;
        this.tex = new Array(10);
        this.n_vertices = 0;
        this.n_elements = 0;
        this.n_textures = 0;
        this.n_parts = 0;
    }
}

class OBJModel {
    init(gl) {

        this.gl = gl;
        this.program = null;

        this.is_visible = 0;
        this.is_visible_offscreen = 0;

        this.vao = null;
        this.vao_offscreen = null;

        this.scale_matrix0 = new THREE.Matrix4();
        this.scale_matrix = new THREE.Matrix4();
        this.scale_matrix1 = new THREE.Matrix4();
        this.translation_matrix0 = new THREE.Matrix4(); // <- Base translation
        this.translation_matrix = new THREE.Matrix4(); // <- Current translation
        this.translation_matrix1 = new THREE.Matrix4(); // <- Helper translation for drag
        this.rotation_matrix0 = new THREE.Matrix4(); // <- Base rotation
        this.rotation_matrix = new THREE.Matrix4(); // <- Current translation
        this.rotation_matrix1 = new THREE.Matrix4();  // <- Helper rotation for drag

        this.scale_matrix0.makeScale(1, 1, 1);
        this.scale_matrix.copy(this.scale_matrix0);
        this.scale_matrix1.copy(this.scale_matrix0);

        // this.rotation_matrix0.makeRotationAxis(new THREE.Vector3(1.0, 0.0, 0.0), Math.PI*0.5);
        this.rotation_matrix0.identity();
        this.rotation_matrix.copy(this.rotation_matrix0);
        this.rotation_matrix1.copy(this.rotation_matrix0);

        this.translation_matrix0.identity();
        this.translation_matrix.copy(this.translation_matrix0);
        this.translation_matrix1.copy(this.translation_matrix0);

        this.model_matrix = new THREE.Matrix4();
        this.model_matrix.premultiply(this.scale_matrix);
        this.model_matrix.premultiply(this.rotation_matrix);
        this.model_matrix.premultiply(this.translation_matrix);

        this.position_buffer = null;
        this.label_buffer = null;

    }

    reinit_gl(gl) {
        this.is_visible = 0;
        this.gl = gl;
        this.set_buffers_from_geometry_and_materials(this.geometry, this.materials);
        this.is_visible = 1;
    }

    set_trs_to_default() {
        this.scale_matrix.copy(this.scale_matrix0);
        this.rotation_matrix.copy(this.rotation_matrix0);
        this.translation_matrix.copy(this.translation_matrix0);
        this.calc_model_matrix();
    }

    set_trs_to_identity() {
        this.translation_matrix.identity();
        this.rotation_matrix.identity();
        this.scale_matrix.identity();
    }

    set_trs(translation_matrix, rotation_matrix, scale_matrix) {
        this.translation_matrix.copy(translation_matrix);
        this.rotation_matrix.copy(rotation_matrix);
        this.scale_matrix.copy(scale_matrix);
    }

    package_model_data() {
        let model_matrix = new THREE.Matrix4();
        model_matrix.identity();
        model_matrix.premultiply(this.scale_matrix);
        model_matrix.premultiply(this.rotation_matrix);
        model_matrix.premultiply(this.translation_matrix);

        let translation = new THREE.Vector3();
        let rotation = new THREE.Quaternion();
        let scale = new THREE.Vector3();
        model_matrix.decompose(translation, rotation, scale);

        const data = {
            "translation" : [translation.x, translation.y, translation.z],
            "rotation": [rotation.x, rotation.y, rotation.z, rotation.w],
            "scale":  [scale.x, scale.y, scale.z]
        };
        return data;
    }

    recenter_mesh(vertices) {
        let min_x = Infinity;
        let min_y = Infinity;
        let min_z = Infinity;

        let max_x = -Infinity;
        let max_y = -Infinity;
        let max_z = -Infinity;

        let n = vertices.length/3;
        for (let i = 0; i < n; i++) {
            min_x = Math.min(min_x, vertices[3*i + 0]);
            min_y = Math.min(min_y, vertices[3*i + 1]);
            min_z = Math.min(min_z, vertices[3*i + 2]);

            max_x = Math.max(max_x, vertices[3*i + 0]);
            max_y = Math.max(max_y, vertices[3*i + 1]);
            max_z = Math.max(max_z, vertices[3*i + 2]);
        }


        let center_x = (min_x + max_x)/2.0;
        let center_y = (min_y + max_y)/2.0;
        let center_z = (min_z + max_z)/2.0;

        for (let i = 0; i < n; i++) {
            vertices[3*i + 0] -= center_x;
            vertices[3*i + 1] -= center_y;
            vertices[3*i + 2] -= center_z;
        }

        max_x = -Infinity;
        max_y = -Infinity;
        max_z = -Infinity;

        for (let i = 0; i < n; i++) {
            max_x = Math.max(max_x, vertices[3*i + 0]);
            max_y = Math.max(max_y, vertices[3*i + 1]);
            max_z = Math.max(max_z, vertices[3*i + 2]);
        }

        this.bbox_center = new THREE.Vector3(center_x, center_y, center_z);
        this.bounding_box = new THREE.Vector3(max_x, max_y, max_z);
    }

    set_glow_on_label(id_segment, a_glow) {
        return;
    }

    set_buffers_from_geometry_and_materials(geometry, materials) {
        this.geometry = geometry;
        this.materials = materials;

        this.program = GLProgram.compile_shaders_and_link_with_program(this.gl, Phong.PhongVS, Phong.PhongFS);
        this.gl.useProgram(this.program);
        this.vao = new VAOMesh();

        let material_info_map = this.create_info_and_fill_phong_materials(this.program, materials);
        let texture_info_map = this.create_info_and_fill_textures(this.program, this.vao, materials);

        let buffers = this.create_attribute_buffers(geometry, this.vao, material_info_map, texture_info_map);

        this.position_buffer = buffers.position;
        this.recenter_mesh(this.position_buffer);
        this.create_and_fill_vbo(this.program, this.vao, buffers);
        this.is_visible_offscreen = 1;
        // console.log("n_meshes:", this.vao.n_parts, "n_textures:", this.vao.n_textures);

    }

    create_info_and_fill_phong_materials(program, materials) {
        let counter_info = 0;
        let map_info = {};
        this.gl.useProgram(program);
        for (let key in materials.materialsInfo) {
            let mat = materials.materialsInfo[key];
            let kd = new Float32Array(mat.kd);
            this.gl.uniform3fv(this.gl.getUniformLocation(program, "material[" + counter_info + "].kd"), kd);
            let ka = new Float32Array(mat.ka);
            this.gl.uniform3fv(this.gl.getUniformLocation(program, "material[" + counter_info + "].ka"), ka);
            let ks = new Float32Array(mat.ks);
            this.gl.uniform3fv(this.gl.getUniformLocation(program, "material[" + counter_info + "].ks"), ks);
            let shininess = 10;
            this.gl.uniform1f(this.gl.getUniformLocation(program, "material[" + counter_info + "].shininess"), shininess);
            map_info[key] = counter_info++;
        }
        return map_info;
    }

    create_info_and_fill_textures(program, vao, materials) {
        let counter_info = 0;
        let map_info = {};
        this.gl.useProgram(program);
        for (var key in materials.materials) {
            let tex = materials.materials[key];
            if (tex.map !== null) {
                this.gl.activeTexture(this.gl.TEXTURE0 + counter_info);
                vao.tex[counter_info] = this.gl.createTexture();
                this.gl.bindTexture(this.gl.TEXTURE_2D, vao.tex[counter_info]);
                this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA8, tex.map.image.width, tex.map.image.height, 0, this.gl.RGBA, this.gl.UNSIGNED_BYTE, tex.map.image);
                this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
                this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
                map_info[key] = counter_info++;
            }
        }

        vao.n_textures = counter_info;
        if (vao.n_textures > 0) {
            this.gl.uniform1iv(this.gl.getUniformLocation(this.program, "tex"), Array.from(Array(vao.n_textures).keys()));
        } else {
            this.gl.activeTexture(this.gl.TEXTURE0);
            vao.tex[0] = this.gl.createTexture();
            this.gl.bindTexture(this.gl.TEXTURE_2D, vao.tex[0]);
            this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA8, 1, 1, 0, this.gl.RGBA, this.gl.UNSIGNED_BYTE, new Uint8Array([255, 0, 0, 255]));
        }

        return map_info;
    }

    create_attribute_buffers(geometry, vao, material_info_map, material_texture_map) {
            vao.n_vertices = 0;
            vao.n_elements = 0;
            vao.n_parts = 0;
            geometry.traverse((mesh) => {
                if (mesh instanceof THREE.Mesh) {
                    vao.n_parts++;
                    vao.n_vertices += mesh.geometry.attributes.position.count;
                }
            });

            let position_buffer = new Float32Array(vao.n_vertices*3);
            let normal_buffer = new Float32Array(vao.n_vertices*3);
            let uv_buffer = new Float32Array(vao.n_vertices*2);
            let id_part_buffer = new Float32Array(vao.n_vertices);
            let id_texture_buffer = new Float32Array(vao.n_vertices);
            let counter_vertices = 0;
            geometry.traverse((mesh) => {
                if (mesh instanceof THREE.Mesh) {
                    position_buffer.set(mesh.geometry.attributes.position.array, counter_vertices * 3);
                    normal_buffer.set(mesh.geometry.attributes.normal.array, counter_vertices * 3);
                    uv_buffer.set(mesh.geometry.attributes.uv.array, counter_vertices * 2);
                    let id_part = new Float32Array(mesh.geometry.attributes.position.count);
                    id_part.fill(material_info_map[mesh.material.name]);
                    id_part_buffer.set(id_part, counter_vertices);
                    let id_texture = new Float32Array(mesh.geometry.attributes.position.count);
                    if (mesh.material.map !== null)
                        id_texture.fill(material_texture_map[mesh.material.name]);
                    else
                        id_texture.fill(-1.0);

                    id_texture_buffer.set(id_texture, counter_vertices);
                    counter_vertices += mesh.geometry.attributes.position.count;
                }
            });

            let buffers = {};
            buffers.position = position_buffer;
            buffers.normal = normal_buffer;
            buffers.uv = uv_buffer;
            buffers.id_part = id_part_buffer;
            buffers.id_texture = id_texture_buffer;

            return buffers;
        }

    create_and_fill_vbo(program, vao, buffers) {

        this.gl.useProgram(program);
        this.gl.enable(this.gl.DEPTH_TEST);
        vao.vbo_position = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vao.vbo_position);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, buffers.position, this.gl.STATIC_DRAW);
        this.gl.vertexAttribPointer(0, 3, this.gl.FLOAT, false, 0, 0);
        this.gl.enableVertexAttribArray(0);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);

        vao.vbo_uv = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vao.vbo_uv);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, buffers.uv, this.gl.STATIC_DRAW);
        this.gl.vertexAttribPointer(1, 2, this.gl.FLOAT, false, 0, 0);
        this.gl.enableVertexAttribArray(1);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);

        vao.vbo_normal = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vao.vbo_normal);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, buffers.normal, this.gl.STATIC_DRAW);
        this.gl.vertexAttribPointer(2, 3, this.gl.FLOAT, false, 0, 0);
        this.gl.enableVertexAttribArray(2);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);

        vao.vbo_label = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vao.vbo_label);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, buffers.id_part, this.gl.STATIC_DRAW);
        this.gl.vertexAttribPointer(3, 1, this.gl.FLOAT, false, 0, 0);
        this.gl.enableVertexAttribArray(3);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);

        vao.vbo_material = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vao.vbo_material);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, buffers.id_texture, this.gl.STATIC_DRAW);
        this.gl.vertexAttribPointer(4, 1, this.gl.FLOAT, false, 0, 0);
        this.gl.enableVertexAttribArray(4);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);

        this.gl.useProgram(null);
    }

    upload_labels(color_segments, labels) {
        this.color_segment_buffer = color_segments;
        this.label_buffer_raw = labels;

        this.set_buffers_from_mesh1(geometry);

        this.vao.vbo_color_segment = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vao.vbo_color_segment);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, this.color_segment_buffer, this.gl.STATIC_DRAW);
        this.gl.vertexAttribPointer(3, 3, this.gl.FLOAT, false, 0, 0);
        this.gl.enableVertexAttribArray(3);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);

        this.vao.vbo_label = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vao.vbo_label);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, this.label_buffer_raw, this.gl.STATIC_DRAW);
        this.gl.vertexAttribIPointer(4, 1, this.gl.INT, 0, 0);
        this.gl.enableVertexAttribArray(4);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);

    }

    create_texture() {
        this.vao.n_textures = counter_texture;
        if (this.vao.n_textures > 0) {
            this.gl.uniform1iv(this.gl.getUniformLocation(this.program, "tex"), Array.from(Array(this.vao.n_textures).keys()));
        } else {
            this.gl.activeTexture(this.gl.TEXTURE0);
            this.vao.tex[0] = this.gl.createTexture();
            this.gl.bindTexture(this.gl.TEXTURE_2D, this.vao.tex[0]);
            this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA8, 1, 1, 0, this.gl.RGBA, this.gl.UNSIGNED_BYTE, new Uint8Array([255, 0, 0, 255]));
        }
    }

    calc_model_matrix() {
        this.model_matrix.identity();
        this.model_matrix.premultiply(this.scale_matrix);
        this.model_matrix.premultiply(this.rotation_matrix);
        this.model_matrix.premultiply(this.translation_matrix);
    }

    draw(view_matrix, projection_matrix) {
        if (this.is_visible) {
            this.gl.useProgram(this.program);
            this.gl.enable(this.gl.CULL_FACE);
            this.gl.disable(this.gl.BLEND);
            this.gl.enable(this.gl.DEPTH_TEST);

            for (let i = 0; i < this.vao.n_textures; i++) {
                this.gl.activeTexture(this.gl.TEXTURE0 + i);
                this.gl.bindTexture(this.gl.TEXTURE_2D, this.vao.tex[i]);
            }
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vao.vbo_position);
            this.gl.vertexAttribPointer(this.gl.getAttribLocation(this.program, 'position'), 3, this.gl.FLOAT, false, 0, 0);
            this.gl.enableVertexAttribArray(this.gl.getAttribLocation(this.program, 'position'));

            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vao.vbo_uv);
            this.gl.vertexAttribPointer(this.gl.getAttribLocation(this.program, 'uv'), 2, this.gl.FLOAT, false, 0, 0);
            this.gl.enableVertexAttribArray(this.gl.getAttribLocation(this.program, 'uv'));

            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vao.vbo_normal);
            this.gl.vertexAttribPointer(this.gl.getAttribLocation(this.program, 'normal'), 3, this.gl.FLOAT, false, 0, 0);
            this.gl.enableVertexAttribArray(this.gl.getAttribLocation(this.program, 'normal'));

            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vao.vbo_label);
            this.gl.vertexAttribPointer(this.gl.getAttribLocation(this.program, 'id_part'), 1, this.gl.FLOAT, false, 0, 0);
            this.gl.enableVertexAttribArray(this.gl.getAttribLocation(this.program, 'id_part'));

            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vao.vbo_material);
            this.gl.vertexAttribPointer(this.gl.getAttribLocation(this.program, 'id_texture'), 1, this.gl.FLOAT, false, 0, 0);
            this.gl.enableVertexAttribArray(this.gl.getAttribLocation(this.program, 'id_texture'));

            this.calc_model_matrix();

            this.gl.uniformMatrix4fv(this.gl.getUniformLocation(this.program, "model_matrix"), false, new Float32Array(this.model_matrix.elements));
            this.gl.uniformMatrix4fv(this.gl.getUniformLocation(this.program, "projection_matrix"), false, new Float32Array(projection_matrix.elements));
            this.gl.uniformMatrix4fv(this.gl.getUniformLocation(this.program, "view_matrix"), false, new Float32Array(view_matrix.elements));

            this.gl.drawArrays(this.gl.TRIANGLES, 0, this.vao.n_vertices);

            this.gl.useProgram(null);
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);

        }
    }

    init_vao_offscreen(gl, position_buffer, label_buffer) {
        this.vao_offscreen = new VAOOffscreen(gl);
        this.vao_offscreen.program = GLProgram.compile_shaders_and_link_with_program(gl, PVVGLSL.PVVVS, PVVGLSL.PVVFS);

        this.vao_offscreen.n_vertices = position_buffer.length/3;

        this.vao_offscreen.set_vbo_position(position_buffer);
        this.vao_offscreen.set_vbo_label(label_buffer);
    }

    draw_offscreen(view_matrix, projection_matrix) {
        if (this.is_visible_offscreen) {
            let vao = this.vao_offscreen;
            let gl = vao.gl;
            gl.useProgram(vao.program);
            this.gl.enable(this.gl.CULL_FACE);

            gl.bindBuffer(gl.ARRAY_BUFFER, vao.vbo_position);
            gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(1);

            gl.bindBuffer(gl.ARRAY_BUFFER, vao.vbo_label);
            gl.vertexAttribIPointer(1, 1, gl.INT, 0, 0);
            gl.enableVertexAttribArray(1);

            gl.uniformMatrix4fv(gl.getUniformLocation(vao.program, "model_matrix"), false, new Float32Array(this.model_matrix.elements));
            gl.uniformMatrix4fv(gl.getUniformLocation(vao.program, "projection_matrix"), false, projection_matrix);
            gl.uniformMatrix4fv(gl.getUniformLocation(vao.program, "view_matrix"), false, view_matrix);

            gl.drawArrays(gl.TRIANGLES, 0, vao.n_vertices);

            gl.useProgram(null);
            gl.bindBuffer(gl.ARRAY_BUFFER, null);
        }
    }

    rotate_xaxis(angle) {
        let axis = new THREE.Vector3(1, 0, 0);
        this.rotate_axis(axis, angle);
    }

    rotate_yaxis(angle) {
        let axis = new THREE.Vector3(0, 1, 0);
        this.rotate_axis(axis, angle);
    }

    rotate_zaxis(angle) {
        let axis = new THREE.Vector3(0, 0, 1);
        this.rotate_axis(axis, angle);
    }

    rotate_axis(axis, angle) {
        axis.applyMatrix4(this.rotation_matrix1);
        axis.normalize();
        let rotation1 = new THREE.Matrix4();
        rotation1.makeRotationAxis(axis, angle);
        this.rotation_matrix.copy(this.rotation_matrix1);
        this.rotation_matrix.premultiply(rotation1);
    }

    scale(value) {
        let scale = new THREE.Matrix4();

        scale.makeScale(value, value, value);
        this.scale_matrix.copy(this.scale_matrix1);
        this.scale_matrix.premultiply(scale);
    }

    scale_axis(camera_axis, value) {
        let model_axis_x = new THREE.Vector3(1, 0, 0);
        model_axis_x.applyMatrix4(this.rotation_matrix);
        let model_axis_y = new THREE.Vector3(0, 1, 0);
        model_axis_y.applyMatrix4(this.rotation_matrix);
        let model_axis_z = new THREE.Vector3(0, 0, 1);
        model_axis_z.applyMatrix4(this.rotation_matrix);
        let angle0 = Math.acos(camera_axis.dot(model_axis_x)/(camera_axis.length() * model_axis_x.length()));
        angle0 = angle0 > Math.PI*0.5 ? Math.PI - angle0: angle0;
        let angle1 = Math.acos(camera_axis.dot(model_axis_y)/(camera_axis.length() * model_axis_y.length()));
        angle1 = angle1 > Math.PI*0.5 ? Math.PI - angle1 : angle1;
        let angle2 = Math.acos(camera_axis.dot(model_axis_z)/(camera_axis.length() * model_axis_z.length()));
        angle2 = angle2 > Math.PI*0.5 ? Math.PI - angle2 : angle2;
        let angle_min = Math.min(angle0, angle1, angle2);

        let scale = new THREE.Matrix4();
        if (angle_min === angle0) {
            scale.makeScale(value, 1, 1);
        } else if (angle_min === angle1) {
            scale.makeScale(1, value, 1);
        } else if (angle_min === angle2) {
            scale.makeScale(1, 1, value);
        }
        this.scale_matrix.copy(this.scale_matrix1);
        this.scale_matrix.premultiply(scale);
    }

    scale_xaxis(camera_axis_x, camera_axis_y, camera_axis_z, value) {
        this.scale_axis(camera_axis_x, value);
    }

    scale_yaxis(camera_axis_x, camera_axis_y, camera_axis_z, value) {
        this.scale_axis(camera_axis_y, value);
    }

    scale_zaxis(camera_axis_x, camera_axis_y, camera_axis_z, value) {
        this.scale_axis(camera_axis_z, value);
    }

    get_position() {
        let pos = new THREE.Vector3(0, 0, 0);
        let dummy0 = new THREE.Quaternion();
        let dummy1 = new THREE.Vector3(0, 0, 0);
        this.translation_matrix.decompose(pos, dummy0, dummy1);
        return pos;
    }

    reset() {
        this.translation_matrix.copy(this.translation_matrix0);
        this.rotation_matrix.copy(this.rotation_matrix0);
        this.scale_matrix.copy(this.scale_matrix0);
    }
}

export default OBJModel;
