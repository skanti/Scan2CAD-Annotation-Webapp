
import GLProgram from './GLProgram.js';

import * as THREE from 'three/build/three';
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
class SimpleVAO {
    init() {
        this.vao_offscreen = null;

        this.model_matrix = new THREE.Matrix4();
        this.scale_matrix = new THREE.Matrix4();
        this.translation_matrix = new THREE.Matrix4();
        this.rotation_matrix = new THREE.Matrix4();
    }

    set_trs(translation_matrix, rotation_matrix, scale_matrix) {
        this.translation_matrix.copy(translation_matrix);
        this.rotation_matrix.copy(rotation_matrix);
        this.scale_matrix.copy(scale_matrix);

        this.model_matrix.identity();
        this.model_matrix.premultiply(this.scale_matrix);
        this.model_matrix.premultiply(this.rotation_matrix);
        this.model_matrix.premultiply(this.translation_matrix);
    }

    init_vao_offscreen(gl, position_buffer, label_buffer) {
        this.vao_offscreen = new VAOOffscreen(gl);
        this.vao_offscreen.program = GLProgram.compile_shaders_and_link_with_program(gl, PVVGLSL.PVVVS, PVVGLSL.PVVFS);

        this.vao_offscreen.n_vertices = position_buffer.length/3;

        this.vao_offscreen.set_vbo_position(position_buffer);
        this.vao_offscreen.set_vbo_label(label_buffer);
    }

    draw_offscreen(view_matrix, projection_matrix) {
        let vao = this.vao_offscreen;
        let gl = this.vao_offscreen.gl;
        gl.useProgram(vao.program);
        gl.enable(gl.CULL_FACE);

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

export default SimpleVAO;
