import GLProgram from '../../../lib/vao/GLProgram';
import OrbitControls from '../../../lib/controls/OrbitControls';

class WindowManager {
    constructor(id_panel, id_canvas) {
        this.gl = null;
        this.initialized = 0;
        this.pos_mouse = new THREE.Vector2();
        this.is_mouse_in = 0;

        this.id_panel = id_panel;
        this.id_canvas = id_canvas;

        this.container = document.getElementById(id_panel);
        this.canvas = document.getElementById(id_canvas);

        // this.canvas.addEventListener("webglcontextlost", (event) => {console.log("lost context");}, false);

        this.window_width = Math.floor(this.container.getBoundingClientRect().width);
        this.window_height = Math.floor(this.container.getBoundingClientRect().height);
        this.window_left = Math.floor(this.container.getBoundingClientRect().left);
        this.window_top = Math.floor(this.container.getBoundingClientRect().top);
        this.window_ar = this.window_height/this.window_width;

        this.mouseenter_ref = this.mouseenter.bind(this);
        this.mouseleave_ref = this.mouseleave.bind(this);
        this.container.addEventListener('mouseenter', this.mouseenter_ref, false);
        this.container.addEventListener('mouseleave', this.mouseleave_ref, false);

        this.canvas.left = Math.floor(this.window_left);
        this.canvas.top = Math.floor(this.window_top);
        this.canvas.width = Math.floor(this.window_width);
        this.canvas.height = Math.floor(this.window_height);

        this.z_near = 0.5;
        this.z_far = 50.0;
    }



    reinit() {
        this.container = document.getElementById(this.id_panel);
        this.canvas = document.getElementById(this.id_canvas);

        this.window_width = Math.floor(this.container.getBoundingClientRect().width);
        this.window_height = Math.floor(this.container.getBoundingClientRect().height);
        this.window_left = Math.floor(this.container.getBoundingClientRect().left);
        this.window_top = Math.floor(this.container.getBoundingClientRect().top);
        this.window_ar = this.window_height/this.window_width;

        this.mouseenter_ref = this.mouseenter.bind(this);
        this.mouseleave_ref = this.mouseleave.bind(this);
        this.container.addEventListener('mouseenter', this.mouseenter_ref, false);
        this.container.addEventListener('mouseleave', this.mouseleave_ref, false);

        this.canvas.left = Math.floor(this.window_left);
        this.canvas.top = Math.floor(this.window_top);
        this.canvas.width = Math.floor(this.window_width);
        this.canvas.height = Math.floor(this.window_height);

        this.init();
    }

    init() {
        this.gl = GLProgram.init_webgl(this.canvas);
        this.init_camera();
        this.init_navigation();
    }

    advance(i_iteration, mspf) {
        this.navigation.update(mspf*0.001);
        this.camera.updateMatrixWorld(true);
    }

    init_camera() {
        // -> view/projection
        this.projection_matrix = new THREE.Matrix4();
        const factor = 0.25;
        this.projection_matrix.makePerspective(-factor*1.0, factor*1.0, factor*this.window_ar, -factor*this.window_ar, this.z_near, this.z_far);

        this.camera = new THREE.PerspectiveCamera();
        this.camera.position.set(5, 5, -5);
        this.camera.up = new THREE.Vector3(0, 1, 0);
        this.camera.lookAt(new THREE.Vector3(0, 0, 0));
        this.camera.updateMatrixWorld(true);
        // <-
    }

    init_navigation() {
        // -> navigation
        // this.navigation_fly = new FPFlyControls(this.camera, this.window_width, this.window_height, this.window_left, this.window_top);
        this.navigation_orbit = new OrbitControls(this.camera, this.container);
        this.navigation = this.navigation_orbit;
        // <-
    }

    set_camera_pos_and_lookat(pos, lookat) {
        this.camera.position.set(pos.x, pos.y, pos.z);
        this.camera.up = new THREE.Vector3(0, 1, 0);
        this.navigation.target = lookat;
        this.camera.updateMatrixWorld(true);
    }

    set_camera_pos_and_lookat_to_default() {
        this.camera.position.set(5, 5, -5);
        this.camera.up = new THREE.Vector3(0, 1, 0);
        this.navigation.target = new THREE.Vector3(0, 0, 0);
        this.camera.updateMatrixWorld(true);
    }

    get_camera_pos() {
        return this.camera.position;
    }

    mousemove(event) {
        if (this.is_mouse_in_model_panel()) {
            this.pos_mouse.x = event.clientX - this.window_left;
            this.pos_mouse.y = event.clientY - this.window_top;
            this.navigation.mousemove(event);
        }
    }

    mousedown(event) {
        if (this.is_mouse_in_model_panel())
            this.navigation.mousedown(event);
    }

    mouseup(event) {
        if (this.is_mouse_in_model_panel())
            this.navigation.mouseup(event);
    }

    mousewheel(event) {
        if (this.is_mouse_in_model_panel())
            this.navigation.mousewheel(event);
    }

    contextmenu(event) {
        this.navigation.contextmenu(event);
    }

    get_pos_mouse() {
        return this.pos_mouse;
    }

    get_relative_pos(pos) {
        return new THREE.Vector2(pos.x - this.window_left, pos.y - this.window_top);
    }

    get_distance_to_camera(pos) {
        let pos_camera = this.camera.position;
        return pos_camera.distanceTo(pos);
    }

    on_window_resize(event) {
        this.window_width = Math.floor(this.container.getBoundingClientRect().width);
        this.window_height = Math.floor(this.container.getBoundingClientRect().height);
        this.window_left = Math.floor(this.container.getBoundingClientRect().left);
        this.window_top = Math.floor(this.container.getBoundingClientRect().top);
        this.window_ar = this.window_height/this.window_width;

        this.canvas.left = Math.floor(this.window_left);
        this.canvas.top = Math.floor(this.window_top);
        this.canvas.width = Math.floor(this.window_width);
        this.canvas.height = Math.floor(this.window_height);

        this.camera.aspect = this.window_width/this.window_height;
        this.camera.updateProjectionMatrix(true);
    };

    project_percent_to_screen(pos0) {
        let pos = new THREE.Vector2();
        pos.x = pos0.x*this.window_width + this.window_left;
        pos.y = pos0.y*this.window_height + this.window_top;
        return pos;
    }
    project_model_position_to_screen(translation_matrix) {
        let pos = new THREE.Vector4(0.0, 0.0, 0.0, 1.0);
        pos.applyMatrix4(translation_matrix);
        pos.applyMatrix4(this.camera.matrixWorldInverse);
        pos.applyMatrix4(this.projection_matrix);
        pos.multiplyScalar(1.0/pos.w);
        pos.x = (pos.x + 1.0)*0.5*this.window_width;
        pos.y = (-pos.y + 1.0)*0.5*this.window_height;
        return pos;
    }

    project_position_to_clipspace(pos0) {
        let pos = new THREE.Vector4(pos0.x, pos0.y, pos0.z, 1.0);
        pos.applyMatrix4(this.camera.matrixWorldInverse);
        pos.applyMatrix4(this.projection_matrix);
        pos.multiplyScalar(1.0/pos.w);
        return pos;
    }

    project_position_to_screen(pos0) {
        let pos = new THREE.Vector4(pos0.x, pos0.y, pos0.z, 1.0);
        pos.applyMatrix4(this.camera.matrixWorldInverse);
        pos.applyMatrix4(this.projection_matrix);
        pos.multiplyScalar(1.0/pos.w);
        pos.x = (pos.x + 1.0)*0.5*this.window_width;
        pos.y = (-pos.y + 1.0)*0.5*this.window_height;
        return pos;
    }

    project_ndc_to_world(pos0) {
        let pos = new THREE.Vector4(pos0.x, pos0.y, pos0.z, 1.0);
        const projection_view_inv = new THREE.Matrix4();
        projection_view_inv.premultiply(this.camera.matrixWorldInverse);
        projection_view_inv.premultiply(this.projection_matrix);
        projection_view_inv.getInverse(projection_view_inv);
        pos.applyMatrix4(projection_view_inv);
        pos.multiplyScalar(1.0/pos.w);
        return pos;
    }

    project_ndc_to_screen(pos0) {
        let pos = new THREE.Vector2();
        pos.x = (pos0.x + 1.0)*this.window_width*0.5;
        pos.y = (-pos0.y + 1.0)*this.window_height*0.5;
        return pos;
    }

    project_screen_to_ndc(pos0) {
        let pos = new THREE.Vector2();
        pos.x = pos0.x/this.window_width*2.0 - 1.0;
        pos.y = -pos0.y/this.window_height*2.0 + 1.0;
        return pos;
    }

    project_depth_to_ndc(depth0) {
        return depth0/(this.z_far - this.z_near)*2.0 - 1.0;
    }

    project_linear_depth_to_nonlinear_depth(depth) {
        let z_delta = this.z_far - this.z_near;
        let depth_nonlinear = (this.z_far + this.z_near -2.0*this.z_near*this.z_far/depth)/z_delta;
        return depth_nonlinear;
    }

    mouseenter(event) {
        this.is_mouse_in = 1;
    }

    mouseleave(event) {
        this.is_mouse_in = 0;
    }

    is_mouse_in_model_panel() {
        return this.is_mouse_in;
    }

    is_pos_in_model_panel(pos) {
        if (pos.x > 0 && pos.x < this.window_width && pos.y > 0 && pos.y < this.window_height)
            return 1;
        else
            return 0;
    }

    add_listener(event_tag, event_callback) {
        if (event_tag === "mousemove")
            this.container.parentNode.addEventListener( event_tag, event_callback, false );
        else
            this.container.addEventListener( event_tag, event_callback, false );
    }

    remove_listener(event_tag, event_callback) {
        if (event_tag === "mousemove")
            this.container.parentNode.removeEventListener( event_tag, event_callback, false );
        else
            this.container.removeEventListener( event_tag, event_callback, false );
    }

    clear(){
        this.gl.clearColor(240/255.0, 240/255.0, 240/255.0, 1.0);  // Clear to black, fully opaque
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

    }

}

export default WindowManager;
