import * as THREE from 'three/build/three';

import GLProgram from './GLProgram';
import * as TextureGLSL from '../shader/TextureGLSL';

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

    set_ebo(index_buffer) {
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
        this.vbo_uv = 0;
        this.tex = 0;
        this.ebo = 0;
        this.n_vertices = 0;
        this.n_elements = 0;
        this.type_ebo = null;
    }
}

class ImageVAO {
    constructor() {
        this.id = null;
        this.gl = null;
        this.program = null;
        this.vao = null;
        this.vao_offscreen = null;

        this.model_matrix = null;
        this.is_active = 0;
        this.is_visible = 0;

    }

    init(gl) {
        this.gl = gl;
        this.vao = new VAOMesh();

        this.program = GLProgram.compile_shaders_and_link_with_program(this.gl, TextureGLSL.TextureVS, TextureGLSL.TextureFS);

        this.model_matrix = new THREE.Matrix4();

        this.setup_vao();
    }

    create_plane() {
        return { position : new Float32Array([ -1, 1, -1, -1, 1, -1, 1, 1]),
                uv : new Float32Array([0, 1, 0, 0, 1, 0, 1, 1]),
                n_vertices : 4,
                n_elements: -1};
    }

    setup_vao() {
        this.gl.useProgram(this.program);
        let vao = this.vao;

        this.plane = this.create_plane();

        vao.n_vertices = this.plane.n_vertices;
        vao.n_elements = -1;

        // -> vbo vertex
        vao.vbo_position = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vao.vbo_position);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, this.plane.position, this.gl.STATIC_DRAW);
        this.gl.vertexAttribPointer(0, 2, this.gl.FLOAT, false, 0, 0);
        this.gl.enableVertexAttribArray(0);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
        // <-

        // -> vbo uv
        vao.vbo_uv = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vao.vbo_uv);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, this.plane.uv, this.gl.STATIC_DRAW);
        this.gl.vertexAttribPointer(1, 2, this.gl.FLOAT, false, 0, 0);
        this.gl.enableVertexAttribArray(1);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
        // <-

        // -> texture
        this.gl.activeTexture(this.gl.TEXTURE0);
        vao.tex = this.gl.createTexture();
        this.gl.bindTexture(this.gl.TEXTURE_2D, vao.tex);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
        // <-

    }

    update_image(image) {

        this.gl.bindTexture(this.gl.TEXTURE_2D, this.vao.tex);
        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGB, image.width, image.height, 0, this.gl.RGB, this.gl.UNSIGNED_BYTE, image);
        let ar = image.height/image.width;
        this.model_matrix.makeScale(1, ar, 1);
    }

    draw(view_matrix, projection_matrix) {
        if (this.is_visible) {
            this.gl.useProgram(this.program);
            // this.gl.enable(this.gl.BLEND);
            this.gl.disable(this.gl.CULL_FACE);

            this.gl.activeTexture(this.gl.TEXTURE0);
            this.gl.bindTexture(this.gl.TEXTURE_2D, this.vao.tex);

            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vao.vbo_position);
            this.gl.vertexAttribPointer(0, 2, this.gl.FLOAT, false, 0, 0);
            this.gl.enableVertexAttribArray(0);

            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vao.vbo_uv);
            this.gl.vertexAttribPointer(1, 2, this.gl.FLOAT, false, 0, 0);
            this.gl.enableVertexAttribArray(1);

            this.gl.uniformMatrix4fv(this.gl.getUniformLocation(this.program, "model_matrix"), false, new Float32Array(this.model_matrix.elements));


            this.gl.drawArrays(this.gl.TRIANGLE_FAN, 0, this.vao.n_vertices);

            this.gl.useProgram(null);
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
        }
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

            gl.enable(gl.CULL_FACE);

            gl.bindBuffer(gl.ARRAY_BUFFER, vao.vbo_position);
            gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
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

export default ImageVAO;
