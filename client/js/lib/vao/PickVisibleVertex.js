import GLProgram from './GLProgram.js';
import * as Shader from '../shader/PVVGLSL.js';

class VAOOffscreen {
    constructor() {
        this.fbo = null;
        this.rbo = null;
        this.rbo_depth = null;
        this.rbo_depth_dummy = null;
    }
}

class VAOMesh {
    constructor(gl) {
        this.gl = gl;

        this.vbo_position = null;
        this.vbo_label = null;
        this.ebo = null;
        this.type = "";

        this.is_culling = 0;

        this.n_vertices = 0;
        this.n_elements = 0;
        this.n_instances = 0;

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

class PickVisibleVertex {

    constructor() {
        this.gl = null;
        this.initialized = 0;

        this.is_active = 0;
        this.is_lock = 0;

        this.vertex_info = {id_mesh: 0, id_segment : 0};
        this.pixel_depth = 0;
    }


    init(gl, window_width, window_height) {
        this.gl = gl;

        this.offscreen = new VAOOffscreen();

        this.setup_fbo_and_rbo(gl, window_width, window_height);

        this.offscreen_image = new Uint8Array(4);
        this.offscreen_depth = new Uint8Array(4);

        this.initialized = 0;
        // <-
    }

    reinit(gl, window_width, window_height) {
        this.gl = gl;
        this.offscreen = new VAOOffscreen();        

        this.setup_fbo_and_rbo(gl, window_width, window_height);
    }

    setup_fbo_and_rbo(gl, window_width, window_height) {
        // -> framebuffer camera (offscreen)
        this.offscreen.fbo = this.gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.offscreen.fbo);
        // <-

        // -> renderbuffer camera (offscreen)
        this.offscreen.rbo = gl.createRenderbuffer();
        gl.bindRenderbuffer(gl.RENDERBUFFER, this.offscreen.rbo);
        gl.renderbufferStorage(gl.RENDERBUFFER, gl.RGBA8, window_width/4.0, window_height/4.0);
        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.RENDERBUFFER, this.offscreen.rbo);
        if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) {
            console.log("Error with framebuffer (color).");
        }

        this.offscreen.rbo_depth = gl.createRenderbuffer();
        gl.bindRenderbuffer(gl.RENDERBUFFER, this.offscreen.rbo_depth);
        gl.renderbufferStorage(gl.RENDERBUFFER, gl.RGBA8, window_width/4.0, window_height/4.0);
        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT1, gl.RENDERBUFFER, this.offscreen.rbo_depth);
        if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) {
            console.log("Error with framebuffer (depth).");
        }

        this.offscreen.rbo_depth_dummy = gl.createRenderbuffer();
        gl.bindRenderbuffer(gl.RENDERBUFFER, this.offscreen.rbo_depth_dummy);
        gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT24, window_width/4.0, window_height/4.0);
        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, this.offscreen.rbo_depth_dummy);
        if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) {
            console.log("Error with framebuffer (depth dummy).");
        }
        // <-

        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.bindRenderbuffer(gl.RENDERBUFFER, null);
    }

    set_active(value) {
        this.is_active = value;
    }

    get_vertex_info() {
        return this.vertex_info;
    }

    pick(pos_x, pos_y, view_matrix, projection_matrix, window_width, window_height, vao_list) {

        if (this.is_active && Object.keys(vao_list).length > 0) {
            this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.offscreen.fbo);
            this.gl.viewport(0, 0, window_width/4.0, window_height/4.0);

            this.gl.clearColor(0, 0, 0, 1.0);
            this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
            this.gl.enable(this.gl.DEPTH_TEST);

            this.gl.drawBuffers([this.gl.COLOR_ATTACHMENT0, this.gl.COLOR_ATTACHMENT1]);

            for (let key in vao_list) {
                let vao = vao_list[key];
                vao.draw_offscreen(view_matrix, projection_matrix);
            }


            this.gl.readBuffer(this.gl.COLOR_ATTACHMENT0);
            this.gl.bindRenderbuffer(this.gl.RENDERBUFFER, this.offscreen.rbo);
            this.gl.readPixels(pos_x/4.0, (window_height - pos_y)/4.0, 1, 1, this.gl.RGBA, this.gl.UNSIGNED_BYTE, this.offscreen_image, 0);

            this.vertex_info.id_mesh = this.offscreen_image[0];
            this.vertex_info.id_segment = 0;
            this.vertex_info.id_segment |= this.offscreen_image[1] << 0;
            this.vertex_info.id_segment |= this.offscreen_image[2] << 8;
            // vertex_info.id_segment |= this.offscreen_image[3] << 16; // <-- disabled because of alpha issues in gl.clearColor

            this.gl.readBuffer(this.gl.COLOR_ATTACHMENT1);
            this.gl.bindRenderbuffer(this.gl.RENDERBUFFER, this.offscreen.rbo_depth);
            this.gl.readPixels(pos_x/4.0, (window_height - pos_y)/4.0, 1, 1, this.gl.RGBA, this.gl.UNSIGNED_BYTE, this.offscreen_depth, 0);
            let dummy = 0;
            dummy |= this.offscreen_depth[0] << 0;
            dummy |= this.offscreen_depth[1] << 8;
            dummy |= this.offscreen_depth[2] << 16;
            this.pixel_depth = dummy/16777215.0;

            this.gl.viewport(0, 0, window_width, window_height);
            this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
            this.gl.bindRenderbuffer(this.gl.RENDERBUFFER, null);
        }
    }

    term() {

    }

}

export default PickVisibleVertex;
