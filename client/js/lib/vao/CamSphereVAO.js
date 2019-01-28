import * as THREE from 'three/build/three';

import GLProgram from './GLProgram.js';
import * as Shader from '../shader/PolygonGLSL.js';
import * as CamSphere from '../geometry/CamSphere';


class VAOMesh {
    constructor() {
        this.vbo_vertex = 0;
        this.ebo = 0;
        this.n_vertices = 0;
        this.n_elements = 0;
        this.n_instance = 0;

        this.color = null;
    }
}

class CamSphereVAO {
    init(gl) {
        this.gl = gl;
        this.program = GLProgram.compile_shaders_and_link_with_program(this.gl, Shader.PolygonVS, Shader.PolygonFS);
        this.gl.useProgram(this.program);

        this.is_active = 0;
        this.is_visible = 0;
        this.is_done = 0;

        // -> buffers
        this.vertex_buffer = new Float32Array(3*8);
        // <-

        // -> uniforms
        this.model_matrix = new THREE.Matrix4();;
        this.rotation_matrix = new THREE.Matrix4();;
        this.translation_matrix = new THREE.Matrix4();;
        this.scale_matrix = new THREE.Matrix4();;
        // <-

        this.box = null;

        this.vao = new VAOMesh();
        this.init_vao();
    }

    reinit(gl) {
        this.gl = gl;
        this.program = GLProgram.compile_shaders_and_link_with_program(this.gl, Shader.PolygonVS, Shader.PolygonFS);

        this.upload_all_buffers();

    }

    set_active(value) {
        this.is_active = value;
    }

    set_color_to_blue() {
        this.vao.color.set(0.2, 0.2, 0.8, 1.0);
    }


    init_vao() {
        this.gl.useProgram(this.program);

        this.cam_sphere = CamSphere.make_cam_sphere(0.5);
        this.vao.n_elements = this.cam_sphere.n_elements;
        this.vao.n_vertices = this.cam_sphere.n_vertices;

        this.upload_all_buffers();

        this.vao.color = new THREE.Vector4(0.0, 0.2, 0.8, 1.0);
    }

    upload_all_buffers() {
        this.gl.useProgram(this.program);
        
        // -> vbo vertex
        this.vao.vbo_vertex = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vao.vbo_vertex);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, this.cam_sphere.vertices, this.gl.STATIC_DRAW);
        this.gl.vertexAttribPointer(0, 3, this.gl.FLOAT, false, 0, 0);
        this.gl.enableVertexAttribArray(0);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
        // <-

        // -> ebo
        this.vao.ebo = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.vao.ebo);
        this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, this.cam_sphere.elements, this.gl.STATIC_DRAW);
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

            this.gl.drawElements(this.gl.LINES, this.vao.n_elements*2, this.gl.UNSIGNED_SHORT, 0);

            this.gl.useProgram(null);
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
            this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, null);
        }
    }

    advance(i_iteration, mspf) {


    }

}

export default CamSphereVAO;
