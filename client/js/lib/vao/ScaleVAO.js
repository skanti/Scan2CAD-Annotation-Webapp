import * as THREE from "three/build/three";

import GLProgram from "./GLProgram";
import * as CoordArrow from "../geometry/CoordArrow";
import * as Arrow from "../geometry/Arrow";
import * as Shader from "../shader/PolygonGLSL";
import * as PVVGLSL from "../shader/PVVGLSL";

class VAOOffscreen {
    constructor(gl) {
        this.gl = gl;
        this.program = null;

        this.vbo_position = null;
        this.vbo_label = null;
        this.ebo = null;

        this.n_vertices = 0;
        this.n_elements = 0;
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

    set_ebo(indices_buffer) {
        // -> ebo
        this.ebo = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.ebo);
        this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, indices_buffer, this.gl.STATIC_DRAW);
        // <-
    }
}

class VAOMesh {
    constructor() {
        this.vbo_vertex = 0;
        this.ebo = 0;
        this.n_vertices = 0;
        this.n_elements = 0;

        this.color = new THREE.Vector4(1, 0 , 0, 0.5);
    }
}

class ScaleVAO {
    init(gl) {
        this.gl = gl;
        this.program = GLProgram.compile_shaders_and_link_with_program(this.gl, Shader.PolygonVS, Shader.PolygonFS);
        this.gl.useProgram(this.program);

        this.id_mesh = 2;

        this.is_active = 0;
        this.is_visible = 0;
        this.is_done = 0;

        // -> uniforms
        this.model_matrix = new THREE.Matrix4();;
        this.rotation_matrix = new THREE.Matrix4();;
        this.translation_matrix = new THREE.Matrix4();;
        this.scale_matrix = new THREE.Matrix4();;
        // <-

        this.mesh = null;

        this.vao = new VAOMesh();
    }

    set_active(value) {
        this.is_active = value;
    }


    set_color_to_red() {
        this.vao.color.set(254/255.0, 190/255.0, 175/255.0, 1.0);
    }

    set_pos(a, b, c) {
        this.gl.useProgram(this.program);

        this.mesh = Arrow.make_arrow(a*1.1, b*1.1, c*1.1, this.id_mesh);
        this.set_color_to_red();

        this.vao.n_elements = this.mesh.n_elements;
        this.vao.n_vertices = this.mesh.n_vertices;

        // -> vbo vertex
        this.vao.vbo_vertex = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vao.vbo_vertex);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, this.mesh.vertices, this.gl.STATIC_DRAW);
        this.gl.vertexAttribPointer(1, 3, this.gl.FLOAT, false, 0, 0);
        this.gl.enableVertexAttribArray(1);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
        // <-

        // -> ebo
        this.vao.ebo = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.vao.ebo);
        this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, this.mesh.elements, this.gl.STATIC_DRAW);
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, null);
        // <-

    }


    set_trs(translation_matrix, rotation_matrix, scale_matrix) {
        this.translation_matrix.copy(translation_matrix);
        this.rotation_matrix.copy(rotation_matrix);
        this.scale_matrix.copy(scale_matrix);
    }

    draw(view_matrix, projection_matrix) {
        if (this.is_visible) {
            this.gl.useProgram(this.program);
            this.gl.enable(this.gl.DEPTH_TEST);
            this.gl.disable(this.gl.CULL_FACE);

            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vao.vbo_vertex);
            this.gl.vertexAttribPointer(0, 3, this.gl.FLOAT, false, 0, 0);
            this.gl.enableVertexAttribArray(0);

            this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.vao.ebo);
            this.gl.uniform4f(this.gl.getUniformLocation(this.program, "color"), this.vao.color.x, this.vao.color.y, this.vao.color.z, this.vao.color.w);

            this.model_matrix.identity();
            this.model_matrix.premultiply(this.scale_matrix);
            this.model_matrix.premultiply(this.rotation_matrix);
            this.model_matrix.premultiply(this.translation_matrix);
            this.gl.uniformMatrix4fv(this.gl.getUniformLocation(this.program, "model_matrix"), false, new Float32Array(this.model_matrix.elements));
            this.gl.uniformMatrix4fv(this.gl.getUniformLocation(this.program, "view_matrix"), false, new Float32Array(view_matrix.elements));
            this.gl.uniformMatrix4fv(this.gl.getUniformLocation(this.program, "projection_matrix"), false, new Float32Array(projection_matrix.elements));

            this.gl.drawElements(this.gl.TRIANGLES, this.vao.n_elements*3, this.gl.UNSIGNED_INT, 0);

            this.gl.useProgram(null);
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
            this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, null);
            this.gl.enable(this.gl.CULL_FACE);
        }
    }

    advance(i_iteration, mspf) {


    }

    init_vao_offscreen(gl, position_buffer, label_buffer, index_buffer) {
        this.vao_offscreen = new VAOOffscreen(gl);
        this.vao_offscreen.program = GLProgram.compile_shaders_and_link_with_program(gl, PVVGLSL.PVVVS, PVVGLSL.PVVFS);
        this.vao_offscreen.n_vertices = position_buffer.length/3;
        this.vao_offscreen.n_elements = index_buffer.length/3;

        this.vao_offscreen.set_vbo_position(position_buffer);
        this.vao_offscreen.set_vbo_label(label_buffer);
        this.vao_offscreen.set_ebo(index_buffer);

    }

    draw_offscreen(view_matrix, projection_matrix) {
        if (this.is_visible) {
            let vao = this.vao_offscreen;
            let gl = vao.gl;
            gl.useProgram(vao.program);
            gl.enable(gl.DEPTH_TEST);
            gl.disable(gl.CULL_FACE);


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
            gl.drawElements(gl.TRIANGLES, vao.n_elements*3, gl.UNSIGNED_INT, 0);

            gl.useProgram(null);
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
            gl.bindBuffer(gl.ARRAY_BUFFER, null);
            gl.enable(gl.CULL_FACE);
            gl.enable(gl.DEPTH_TEST);

        }
    }


}

export default ScaleVAO;
