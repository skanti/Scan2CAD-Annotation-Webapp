
import GLProgram from './GLProgram.js';

import * as Shader from '../shader/PolygonInstanceGLSL.js';
import * as Icosahedron from '../geometry/Icosahedron';

class VAOMesh {
    constructor() {
        this.vbo_vertex = 0;
        this.vbo_position = 0;
        this.vbo_normal = 0;
        this.vbo_color = 0;
        this.vbo_label = 0;
        this.ebo = 0;
        this.n_vertices = 0;
        this.n_elements = 0;
        this.n_instance = 0;

        this.color = new THREE.Vector3(0.8, 0.2, 0.2);
        this.base_scale = 0.05;
    }
}

class KeypointVAO {
    init(gl) {
        this.gl = gl;
        this.program = GLProgram.compile_shaders_and_link_with_program(this.gl, Shader.PolygonInstanceVS, Shader.PolygonInstanceFS);
        this.gl.useProgram(this.program);

        this.is_visible = 0;

        this.sphere = null;
        this.n_instance_max = 256;
        this.position_buffer = new Float32Array(this.n_instance_max*3);
        this.label_buffer = new Int32Array(this.n_instance_max);

        this.last_position = new THREE.Vector3(0, 0, 0);
        this.position0 = new THREE.Vector3(0, 0, 0);

        this.scale_matrix = new THREE.Matrix4();
        this.rotation_matrix = new THREE.Matrix4();
        this.translation_matrix = new THREE.Matrix4();
        this.model_matrix = new THREE.Matrix4();

        this.vao = new VAOMesh();
        this.init_vao();
    }

    reinit(gl) {
        this.gl = gl;
        this.program = GLProgram.compile_shaders_and_link_with_program(this.gl, Shader.PolygonInstanceVS, Shader.PolygonInstanceFS);
        this.gl.useProgram(this.program);

        this.upload_all_buffers();
    }

    reinit_gl(gl) {
        this.gl = gl;
        this.program = GLProgram.compile_shaders_and_link_with_program(this.gl, Shader.PolygonInstanceVS, Shader.PolygonInstanceFS);
        this.gl.useProgram(this.program);

        this.init_vao();
    }

    set_color_to_green() {
        this.vao.color.set(0.2, 0.8, 0.2);
    }

    set_color_to_red() {
        this.vao.color.set(0.8, 0.2, 0.2);
    }

    set_color_to_blue() {
        this.vao.color.set(0.2, 0.2, 0.8);
    }

    set_trs(translation_matrix, rotation_matrix, scale_matrix) {
        this.translation_matrix.copy(translation_matrix);
        this.rotation_matrix.copy(rotation_matrix);
        this.scale_matrix.copy(scale_matrix);
    }

    set_trs_to_default() {
        this.translation_matrix.identity();
        this.rotation_matrix.identity();
        this.scale_matrix.identity();
    }

    package_data() {
        let positions = this.get_position_as_array();
        positions = [].concat.apply([], positions);
        const data = {
            n_keypoints: this.vao.n_instance,
            position: positions,
        };
        return data;
    }

    unpack_data(data) {
        // let positions = this.get_position_as_array();
        //
        // const data = {
        //     n_keypoints: this.vao.n_instance,
        //     position: positions,
        // };
        // let positions = []
        // for (let i = 0; i < this.vao.n_instance; i++) {
        //     let p = new THREE.Vector3();
        //     p.x = this.position_buffer[i*3 + 0];
        //     p.y = this.position_buffer[i*3 + 1];
        //     p.z = this.position_buffer[i*3 + 2];
        //
        //     p.applyMatrix4(this.model_matrix);
        //
        //     positions.push([p.x, p.y, p.z]);
        // }
    }


    init_vao() {
        this.gl.useProgram(this.program);

        this.sphere = Icosahedron.make_icosahedron();
        this.vao.n_elements = this.sphere.n_elements;
        this.vao.n_vertices = this.sphere.n_vertices;
        // this.vao.n_instance = 0;

        this.upload_all_buffers();

        // -> vbo instance labels
        // vao.vbo_label = this.gl.createBuffer();
        // this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vao.vbo_label);
        // // this.gl.bufferData(this.gl.ARRAY_BUFFER, label_buffer, this.gl.STATIC_DRAW);
        // this.gl.vertexAttribIPointer(2, 1, this.gl.INT, 0, 0);
        // this.gl.enableVertexAttribArray(2);
        // this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
        // <-

    }
    upload_all_buffers() {

        // -> vbo vertex
        this.vao.vbo_vertex = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vao.vbo_vertex);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, this.sphere.vertices, this.gl.STATIC_DRAW);
        this.gl.vertexAttribPointer(0, 3, this.gl.FLOAT, false, 0, 0);
        this.gl.enableVertexAttribArray(0);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
        // <-

        // -> ebo
        this.vao.ebo = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.vao.ebo);
        this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, this.sphere.elements, this.gl.STATIC_DRAW);
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, null);
        // <-

        // -> vbo instance position
        this.vao.vbo_position = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vao.vbo_position);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, this.position_buffer, this.gl.STATIC_DRAW);
        this.gl.vertexAttribPointer(1, 3, this.gl.FLOAT, false, 0, 0);
        this.gl.enableVertexAttribArray(1);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
    }

    calc_centroid() {
        // this.calc_model_matrix();
        let n = this.vao.n_instance;
        let c = new THREE.Vector3(0, 0, 0);
        for (let i = 0; i < n; i++) {
            let c0 = new THREE.Vector3(0, 0, 0);
            c0.x += this.position_buffer[i*3 + 0];
            c0.y += this.position_buffer[i*3 + 1];
            c0.z += this.position_buffer[i*3 + 2];

            c0.applyMatrix4(this.model_matrix);
            c.add(c0);
        }
        c.multiplyScalar(1.0/n);

        return c;
    }

    calc_centroid_local() {
        // this.calc_model_matrix();
        let n = this.vao.n_instance;
        let c = new THREE.Vector3(0, 0, 0);
        for (let i = 0; i < n; i++) {
            let c0 = new THREE.Vector3(0, 0, 0);
            c0.x += this.position_buffer[i*3 + 0];
            c0.y += this.position_buffer[i*3 + 1];
            c0.z += this.position_buffer[i*3 + 2];

            c.add(c0);
        }
        c.multiplyScalar(1.0/n);

        return c;
    }

    recenter() {
        const c = this.calc_centroid_local();

        let n = this.vao.n_instance;
        for (let i = 0; i < n; i++) {
            this.position_buffer[i*3 + 0] -= c.x;
            this.position_buffer[i*3 + 1] -= c.y;
            this.position_buffer[i*3 + 2] -= c.z;
        }

        let trans = new THREE.Matrix4();
        this.position0.add(c);
        trans.makeTranslation(c.x, c.y, c.z);
        this.translation_matrix.premultiply(trans);
        this.calc_model_matrix();

        // -> vbo instance position
        this.gl.useProgram(this.program);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vao.vbo_position);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, this.position_buffer, this.gl.STATIC_DRAW);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
        // <-

    }

    get_position_and_trs() {
        let position = []
        for (let i = 0; i < this.vao.n_instance; i++) {
            let p = new THREE.Vector3();
            p.x = this.position_buffer[i*3 + 0];
            p.y = this.position_buffer[i*3 + 1];
            p.z = this.position_buffer[i*3 + 2];
            position.push([p.x, p.y, p.z]);
        }

        let cargo = {position: position, trs : this.model_matrix};
        return cargo;
    }

    get_position_as_array() {
        let positions = []
        for (let i = 0; i < this.vao.n_instance; i++) {
            let p = new THREE.Vector3();
            p.x = this.position_buffer[i*3 + 0];
            p.y = this.position_buffer[i*3 + 1];
            p.z = this.position_buffer[i*3 + 2];

            p.applyMatrix4(this.model_matrix);

            positions.push([p.x, p.y, p.z]);
        }
        return positions;
    }

    push_back_mesh(position, label) {
        let position1 = position.clone();
        position1.sub(this.position0);
        this.position_buffer.set([position1.x, position1.y, position1.z], this.vao.n_instance*3);
        this.label_buffer.set([label], this.vao.n_instance);
        this.vao.n_instance++;
        this.last_position.copy(position1);

        // -> vbo instance position
        this.gl.useProgram(this.program);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vao.vbo_position);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, this.position_buffer, this.gl.STATIC_DRAW);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
        // <-
    }

    pop() {
        this.vao.n_instance--;
        this.last_position.x = this.position_buffer[(this.vao.n_instance - 1)*3 + 0];
        this.last_position.y = this.position_buffer[(this.vao.n_instance - 1)*3 + 1];
        this.last_position.z = this.position_buffer[(this.vao.n_instance - 1)*3 + 2];
    }

    set_to_zero() {
        this.vao.n_instance = 0;
    }

    set_position_from_array(position_array, n_size) {
        this.vao.n_instance = n_size;

        this.position_buffer.set(position_array, 0);
        this.label_buffer.set(new Int32Array(n_size), this.vao.n_instance);

        // -> vbo instance position
        this.gl.useProgram(this.program);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vao.vbo_position);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, this.position_buffer, this.gl.STATIC_DRAW);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
    }

    update_attribute() {
        this.gl.useProgram(this.program);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vao.vbo_position);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, this.position_buffer, this.gl.STATIC_DRAW);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
    }

    set_origin_position(position) {
        this.translation_matrix.makeTranslation(position.x, position.y, position.z);
        this.position0.copy(position);
    }

    get_last_position() {
        let pos = new THREE.Vector3();
        pos.copy(this.last_position);
        pos.applyMatrix4(this.model_matrix);
        return pos;
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
            this.gl.enable(this.gl.DEPTH_TEST);
            this.gl.disable(this.gl.CULL_FACE);
            this.gl.vertexAttribDivisor(1, 1);

            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vao.vbo_vertex);
            this.gl.vertexAttribPointer(0, 3, this.gl.FLOAT, false, 0, 0);
            this.gl.enableVertexAttribArray(0);

            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vao.vbo_position);
            this.gl.vertexAttribPointer(1, 3, this.gl.FLOAT, false, 0, 0);
            this.gl.enableVertexAttribArray(1);

            // this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vao.vbo_normal);
            // this.gl.vertexAttribPointer(2, 3, this.gl.FLOAT, false, 0, 0);
            // this.gl.enableVertexAttribArray(2);

            // this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vao.vbo_label);
            // this.gl.vertexAttribIPointer(2, 1, this.gl.INT, 0, 0);
            // this.gl.enableVertexAttribArray(2);

            this.calc_model_matrix();

            this.model_matrix.identity();
            this.model_matrix.premultiply(this.scale_matrix);
            this.model_matrix.premultiply(this.rotation_matrix);
            this.model_matrix.premultiply(this.translation_matrix);

            this.gl.uniform1f(this.gl.getUniformLocation(this.program, "base_scale"), this.vao.base_scale);
            this.gl.uniform3f(this.gl.getUniformLocation(this.program, "color"), this.vao.color.x, this.vao.color.y, this.vao.color.z);
            this.gl.uniformMatrix4fv(this.gl.getUniformLocation(this.program, "model_matrix"), false, new Float32Array(this.model_matrix.elements));
            this.gl.uniformMatrix4fv(this.gl.getUniformLocation(this.program, "view_matrix"), false, new Float32Array(view_matrix.elements));
            this.gl.uniformMatrix4fv(this.gl.getUniformLocation(this.program, "projection_matrix"), false, new Float32Array(projection_matrix.elements));

            this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.vao.ebo);
            this.gl.drawElementsInstanced(this.gl.TRIANGLES, this.vao.n_elements*3, this.gl.UNSIGNED_SHORT, 0, this.vao.n_instance);


            this.gl.useProgram(null);
            this.gl.vertexAttribDivisor(1, 0);
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
            this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, null);
            this.gl.enable(this.gl.CULL_FACE);
        }
    }

    advance() {

    }

}

export default KeypointVAO;
