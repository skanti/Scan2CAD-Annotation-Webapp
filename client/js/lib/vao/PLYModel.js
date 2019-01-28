import * as THREE from 'three/build/three';

import GLProgram from './GLProgram';
import PLYLoader from '../loader/PLYLoader';
import * as SceneGLSL from '../shader/SceneGLSL';
import * as PVVGLSL from '../shader/PVVGLSL';

class VAOOffscreen {
    constructor(gl) {
        this.gl = gl;
        this.program = null;

        this.vbo_position = null;
        this.vbo_label = null;
        this.ebo = null;

        this.type_ebo = null;

        this.n_vertices = 0;
        this.n_elements = 0;
    }

    upload_vbo_position(position_buffer) {
        // -> vbo position
        this.vbo_position = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vbo_position);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, position_buffer, this.gl.STATIC_DRAW);
        this.gl.vertexAttribPointer(0, 3, this.gl.FLOAT, false, 0, 0);
        this.gl.enableVertexAttribArray(0);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
        // <-
    }

    upload_vbo_label(label_buffer) {
        // -> vbo labels
        this.vbo_label = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vbo_label);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, label_buffer, this.gl.STATIC_DRAW);
        this.gl.vertexAttribIPointer(1, 1, this.gl.INT, 0, 0);
        this.gl.enableVertexAttribArray(1);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
        // <-
    }

    upload_ebo(index_buffer) {
        // -> ebo
        this.ebo = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.ebo);
        this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, index_buffer, this.gl.STATIC_DRAW);
        // <-

        if (index_buffer instanceof Uint16Array)
            this.type_ebo = this.gl.UNSIGNED_SHORT;
        else if (index_buffer instanceof Uint32Array)
            this.type_ebo = this.gl.UNSIGNED_INT;

    }
}

class VAOMesh {
    constructor() {
        this.vbo_position = 0;
        this.vbo_normal = 0;
        this.vbo_label = 0;
        this.vbo_color = 0;
        this.vbo_color_segment = 0;
        this.ebo = 0;
        this.n_vertices = 0;
        this.n_elements = 0;

        this.type_ebo = null;

        this.color_mode = 0;
        this.a_glow = 1.0;
        this.id_label_glow = -1;
    }
}

class PLYModel {
    constructor() {
        this.id = null;
        this.gl = null;
        this.program = null;
        this.vao_offscreen = null;

        this.model_matrix = null;
        this.is_active = 0;
        this.is_visible = 0;

        this.position_buffer = null;
        this.normal_buffer = null;
        this.index_buffer = null;
        this.color_buffer = null;
        this.color_segment_buffer = null;
        this.label_buffer_raw = null;
        this.label_buffer = null;
    }

    toggle_color() {
        this.vao.color_mode = !this.vao.color_mode;
    }


    set_glow_on_label(id_label_glow, a_glow) {
        this.vao.id_label_glow = id_label_glow;
        this.vao.a_glow = a_glow;
    }

    init(gl) {
        this.gl = gl;

        this.program = GLProgram.compile_shaders_and_link_with_program(this.gl, SceneGLSL.SceneVS, SceneGLSL.SceneFS);
        this.gl.useProgram(this.program);

        this.center = new THREE.Vector3();
        this.scale_matrix = new THREE.Matrix4();
        this.rotation_matrix = new THREE.Matrix4();
        this.translation_matrix = new THREE.Matrix4();
        this.model_matrix = new THREE.Matrix4();
        // <-

        this.vao = new VAOMesh();

        this.model_matrix = new THREE.Matrix4();
    }

    reinit_gl(gl) {
        this.gl = gl;

        this.program = GLProgram.compile_shaders_and_link_with_program(this.gl, SceneGLSL.SceneVS, SceneGLSL.SceneFS);
        this.gl.useProgram(this.program);

        this.upload_all_buffers();
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

    recenter_and_rotate() {
        this.rotation_matrix.makeRotationAxis(new THREE.Vector3(1, 0, 0), -Math.PI*0.5);

        this.center.applyMatrix4(this.rotation_matrix);
        this.translation_matrix.makeTranslation(-this.center.x, -this.center.y, -this.center.z);

        this.model_matrix.identity();
        this.model_matrix.premultiply(this.scale_matrix);
        this.model_matrix.premultiply(this.rotation_matrix);
        this.model_matrix.premultiply(this.translation_matrix);
    }

    upload_all_buffers() {
        this.gl.useProgram(this.program);

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

        this.vao.vbo_position = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vao.vbo_position);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, this.position_buffer, this.gl.STATIC_DRAW);
        this.gl.vertexAttribPointer(0, 3, this.gl.FLOAT, false, 0, 0);
        this.gl.enableVertexAttribArray(0);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);

        this.vao.vbo_normal = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vao.vbo_normal);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, this.normal_buffer, this.gl.STATIC_DRAW);
        this.gl.vertexAttribPointer(1, 3, this.gl.FLOAT, false, 0, 0);
        this.gl.enableVertexAttribArray(1);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);

        this.vao.vbo_color = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vao.vbo_color);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, this.color_buffer, this.gl.STATIC_DRAW);
        this.gl.vertexAttribPointer(2, 3, this.gl.FLOAT, false, 0, 0);
        this.gl.enableVertexAttribArray(2);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);

        this.vao.ebo = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.vao.ebo);
        this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, this.index_buffer, this.gl.STATIC_DRAW);
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, null);

        this.vao.n_elements = Math.floor(this.index_buffer.length/3);
    }

    set_buffers_from_geometry_and_labels(geometry, labels) {
        geometry.computeBoundingBox();
        this.center = geometry.boundingBox.getCenter();

        this.position_buffer = geometry.attributes.position.array;
        this.normal_buffer = geometry.attributes.normal.array;
        this.color_buffer = geometry.attributes.color.array;
        this.index_buffer = geometry.index.array;

        if (this.index_buffer instanceof Uint16Array)
            this.vao.type_ebo = this.gl.UNSIGNED_SHORT;
        else if (this.index_buffer instanceof Uint32Array)
            this.vao.type_ebo = this.gl.UNSIGNED_INT;

        this.color_segment_buffer = labels.attributes.color.array;
        this.label_buffer_raw = Int32Array.from(labels.attributes.label.array);
    }

    draw(view_matrix, projection_matrix) {
        if (this.is_visible) {
            this.gl.useProgram(this.program);

            this.gl.enable(this.gl.DEPTH_TEST);
            this.gl.enable(this.gl.CULL_FACE);

            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vao.vbo_position);
            this.gl.vertexAttribPointer(0, 3, this.gl.FLOAT, false, 0, 0);
            this.gl.enableVertexAttribArray(0);

            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vao.vbo_normal);
            this.gl.vertexAttribPointer(1, 3, this.gl.FLOAT, false, 0, 0);
            this.gl.enableVertexAttribArray(1);

            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vao.vbo_color);
            this.gl.vertexAttribPointer(2, 3, this.gl.FLOAT, false, 0, 0);
            this.gl.enableVertexAttribArray(2);

            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vao.vbo_color_segment);
            this.gl.vertexAttribPointer(3, 3, this.gl.FLOAT, false, 0, 0);
            this.gl.enableVertexAttribArray(3);

            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vao.vbo_label);
            this.gl.vertexAttribIPointer(4, 1, this.gl.INT, 0, 0);
            this.gl.enableVertexAttribArray(4);

            this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.vao.ebo);
            this.gl.uniformMatrix4fv(this.gl.getUniformLocation(this.program, "model_matrix"), false, new Float32Array(this.model_matrix.elements));
            this.gl.uniformMatrix4fv(this.gl.getUniformLocation(this.program, "view_matrix"), false, new Float32Array(view_matrix.elements));
            this.gl.uniformMatrix4fv(this.gl.getUniformLocation(this.program, "projection_matrix"), false, new Float32Array(projection_matrix.elements));

            this.gl.uniform1i(this.gl.getUniformLocation(this.program, "color_mode"), this.vao.color_mode);
            this.gl.uniform1i(this.gl.getUniformLocation(this.program, "id_label_glow"), this.vao.id_label_glow);
            this.gl.uniform1f(this.gl.getUniformLocation(this.program, "a_glow"), this.vao.a_glow);

            this.gl.drawElements(this.gl.TRIANGLES, this.vao.n_elements*3, this.vao.type_ebo, 0);

            this.gl.useProgram(null);
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
            this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, null);
        }
    }

    init_vao_offscreen(gl, position_buffer, label_buffer, index_buffer) {
        this.vao_offscreen = new VAOOffscreen(gl);
        this.vao_offscreen.program = GLProgram.compile_shaders_and_link_with_program(gl, PVVGLSL.PVVVS, PVVGLSL.PVVFS);
        this.vao_offscreen.n_vertices = position_buffer.length/3;
        this.vao_offscreen.n_elements = index_buffer.length/3;

        this.vao_offscreen.upload_vbo_position(position_buffer);
        this.vao_offscreen.upload_vbo_label(label_buffer);
        this.vao_offscreen.upload_ebo(index_buffer);

    }

    draw_offscreen(view_matrix, projection_matrix) {
        if (this.is_visible) {
            let vao = this.vao_offscreen;
            let gl = vao.gl;
            gl.useProgram(vao.program);

            gl.enable(this.gl.DEPTH_TEST);
            gl.enable(gl.CULL_FACE);

            gl.bindBuffer(gl.ARRAY_BUFFER, vao.vbo_position);
            gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(0);

            gl.bindBuffer(gl.ARRAY_BUFFER, vao.vbo_label);
            gl.vertexAttribIPointer(1, 1, gl.INT, 0, 0);
            gl.enableVertexAttribArray(1);

            gl.uniformMatrix4fv(gl.getUniformLocation(vao.program, "model_matrix"), false, new Float32Array(this.model_matrix.elements));
            gl.uniformMatrix4fv(gl.getUniformLocation(vao.program, "view_matrix"), false, view_matrix);
            gl.uniformMatrix4fv(gl.getUniformLocation(vao.program, "projection_matrix"), false, projection_matrix);

            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, vao.ebo);

            gl.drawElements(gl.TRIANGLES, vao.n_elements*3, this.vao.type_ebo, 0);

            gl.useProgram(null);
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
            gl.bindBuffer(gl.ARRAY_BUFFER, null);
        }
    }

}

export default PLYModel;
