//import*as THREE from '..//three/build/three';

// This set of controls performs orbiting, dollying (zooming), and panning.
// Unlike TrackballControls, it maintains the "up" direction camera.up (+Y by default).
//
//    Orbit - left mouse / touch: one finger move
//    Zoom - middle mouse, or mousewheel / touch: two finger spread or squish
//    Pan - right mouse, or arrow keys / touch: three finger swipe

class OrbitControls {

    constructor(camera, domElement) {

        this.camera = camera;

        this.domElement = ( domElement !== undefined ) ? domElement : document;

        // Set to false to disable this control
        this.enabled = true;

        // "target" sets the location of focus, where the camera orbits around
        this.target = new THREE.Vector3();

        // How far you can dolly in and out ( PerspectiveCamera only )
        this.minDistance = 0;
        this.maxDistance = Infinity;

        // How far you can zoom in and out ( OrthographicCamera only )
        this.minZoom = 0;
        this.maxZoom = Infinity;

        // How far you can orbit vertically, upper and lower limits.
        // Range is 0 to Math.PI radians.
        this.minPolarAngle = 0; // radians
        this.maxPolarAngle = Math.PI; // radians

        // How far you can orbit horizontally, upper and lower limits.
        // If set, must be a sub-interval of the interval [ - Math.PI, Math.PI ].
        this.minAzimuthAngle = -Infinity; // radians
        this.maxAzimuthAngle = Infinity; // radians

        // Set to true to enable damping (inertia)
        // If damping is enabled, you must call controls.update() in your animation loop
        this.enableDamping = false;
        this.dampingFactor = 0.25;

        // This option actually enables dollying in and out; left as "zoom" for backwards compatibility.
        // Set to false to disable zooming
        this.enableZoom = true;
        this.zoomSpeed = 1.0;

        // Set to false to disable rotating
        this.enableRotate = true;
        this.rotateSpeed = 0.5;

        // Set to false to disable panning
        this.enablePan = true;
        this.keyPanSpeed = 3.0;	// pixels moved per arrow key push

        // Set to true to automatically rotate around the target
        // If auto-rotate is enabled, you must call controls.update() in your animation loop
        this.autoRotate = false;
        this.autoRotateSpeed = 2.0; // 30 seconds per round when fps is 60

        // Set to false to disable use of the keys
        this.enableKeys = true;

        // The four arrow keys
        this.keys = {LEFT: 37, UP: 38, RIGHT: 39, BOTTOM: 40};

        // Mouse buttons
        this.mouseButtons = {ORBIT: THREE.MOUSE.RIGHT, PAN: THREE.MOUSE.MIDDLE, ZOOM: null};

        // for reset
        this.target0 = this.target.clone();
        this.position0 = this.camera.position.clone();
        this.zoom0 = this.camera.zoom;

        this.changeEvent = { type: 'change' };
        this.startEvent = { type: 'start' };
        this.endEvent = { type: 'end' };

        this.STATE0 = { NONE: - 1, ROTATE: 0, DOLLY: 1, PAN: 2, TOUCH_ROTATE: 3, TOUCH_DOLLY: 4, TOUCH_PAN: 5 };
        this.STATE = this.STATE0.NONE;

        this.EPS = 0.000001;

        // current position in spherical coordinates
        this.spherical = new THREE.Spherical();
        this.sphericalDelta = new THREE.Spherical();

        this.value = 1;
        this.panOffset = new THREE.Vector3();
        this.zoomChanged = false;

        this.rotateStart = new THREE.Vector2();
        this.rotateEnd = new THREE.Vector2();
        this.rotateDelta = new THREE.Vector2();

        this.panStart = new THREE.Vector2();
        this.panEnd = new THREE.Vector2();
        this.panDelta = new THREE.Vector2();

        this.dollyStart = new THREE.Vector2();
        this.dollyEnd = new THREE.Vector2();
        this.dollyDelta = new THREE.Vector2();
    }

    //
    // public methods
    //

    is_camera_moving() {
        return !(this.STATE === this.STATE0.NONE);
    }


    savetSTATE() {

        this.target0.copy(this.target);
        this.position0.copy(this.camera.position);
        this.zoom0 = this.camera.zoom;

    };

    reset() {

        this.target.copy(this.target0);
        this.camera.position.copy(this.position0);
        this.camera.zoom = this.zoom0;

        this.camera.updateProjectionMatrix();
        // this.dispatchEvent(this.changeEvent);

        this.update();

        this.STATE = this.STATE0.NONE;

    };

    // this method is exposed, but perhaps it would be better if we can make it private...
    update() {

        var offset = new THREE.Vector3();

        // so camera.up is the orbit axis
        var quat = new THREE.Quaternion().setFromUnitVectors(this.camera.up, new THREE.Vector3(0, 1, 0));
        var quatInverse = quat.clone().inverse();

        var lastPosition = new THREE.Vector3();
        var lastQuaternion = new THREE.Quaternion();


        var position = this.camera.position;

        offset.copy(position).sub(this.target);

        // rotate offset to "y-axis-is-up" space
        offset.applyQuaternion(quat);

        // angle from z-axis around y-axis
        this.spherical.setFromVector3(offset);

        if (this.autoRotate && this.STATE === this.STATE0.NONE) {

            this.rotateLeft(2*Math.PI / 60 / 60*this.autoRotateSpeed);

        }

        this.spherical.theta += this.sphericalDelta.theta;
        this.spherical.phi += this.sphericalDelta.phi;

        // restrict theta to be between desired limits
        this.spherical.theta = Math.max(this.minAzimuthAngle, Math.min(this.maxAzimuthAngle, this.spherical.theta));

        // restrict phi to be between desired limits
        this.spherical.phi = Math.max(this.minPolarAngle, Math.min(this.maxPolarAngle, this.spherical.phi));

        this.spherical.makeSafe();


        this.spherical.radius *= this.value;

        // restrict radius to be between desired limits
        this.spherical.radius = Math.max(this.minDistance, Math.min(this.maxDistance, this.spherical.radius));

        // move target to panned location
        this.target.add(this.panOffset);

        offset.setFromSpherical(this.spherical);

        // rotate offset back to "camera-up-vector-is-up" space
        offset.applyQuaternion(quatInverse);

        position.copy(this.target).add(offset);

        this.camera.lookAt(this.target);

        if (this.enableDamping === true) {

            this.sphericalDelta.theta *= ( 1 - this.dampingFactor );
            this.sphericalDelta.phi *= ( 1 - this.dampingFactor );

        } else {

            this.sphericalDelta.set(0, 0, 0);

        }

        this.value = 1;
        this.panOffset.set(0, 0, 0);

        // update condition is:
        // min(camera displacement, camera rotation in radians)^2 > this.EPS
        // using small-angle approximation cos(x/2) = 1 - x^2 / 8

        if (this.zoomChanged ||
            lastPosition.distanceToSquared(this.camera.position) > this.EPS ||
            8*( 1 - lastQuaternion.dot(this.camera.quaternion) ) > this.EPS) {

            // this.dispatchEvent(this.changeEvent);

            lastPosition.copy(this.camera.position);
            lastQuaternion.copy(this.camera.quaternion);
            this.zoomChanged = false;


        }



    };




    rotateLeft(angle) {

        this.sphericalDelta.theta -= angle;

    }

    rotateUp(angle) {

        this.sphericalDelta.phi -= angle;

    }

    panLeft(distance, objectMatrix) {

        var v = new THREE.Vector3();

        v.setFromMatrixColumn(objectMatrix, 0); // get X column of objectMatrix
        v.multiplyScalar(-distance);

        this.panOffset.add(v);


    };

    panUp(distance, objectMatrix) {

        var v = new THREE.Vector3();

        v.setFromMatrixColumn(objectMatrix, 1); // get Y column of objectMatrix
        v.multiplyScalar(distance);

        this.panOffset.add(v);


    };

    // deltaX and deltaY are in pixels; right and down are positive
    pan(deltaX, deltaY) {

        var offset = new THREE.Vector3();

        var element = this.domElement === document ? this.domElement.body : this.domElement;

        if (this.camera instanceof THREE.PerspectiveCamera) {

            // perspective
            var position = this.camera.position;
            offset.copy(position).sub(this.target);
            var targetDistance = offset.length();

            // half of the fov is center to top of screen
            targetDistance *= Math.tan(( this.camera.fov / 2 )*Math.PI / 180.0);

            // we actually don't use screenWidth, since perspective camera is fixed to screen height
            this.panLeft(1*deltaX*targetDistance / element.clientHeight, this.camera.matrix);
            this.panUp(1*deltaY*targetDistance / element.clientHeight, this.camera.matrix);

        } else if (this.camera instanceof THREE.OrthographicCamera) {

            // orthographic
            this.panLeft(deltaX*( this.camera.right - this.camera.left ) / this.camera.zoom / element.clientWidth, this.camera.matrix);
            this.panUp(deltaY*( this.camera.top - this.camera.bottom ) / this.camera.zoom / element.clientHeight, this.camera.matrix);

        } else {

            // camera neither orthographic nor perspective
            console.warn('WARNING: OrbitControls.js encountered an unknown camera type - pan disabled.');
            this.enablePan = false;

        }


    };

    dollyIn(dollyScale) {

        if (this.camera instanceof THREE.PerspectiveCamera) {

            this.value /= dollyScale;

        } else if (this.camera instanceof THREE.OrthographicCamera) {

            this.camera.zoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.camera.zoom*dollyScale));
            this.camera.updateProjectionMatrix();
            this.zoomChanged = true;

        } else {

            console.warn('WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled.');
            this.enableZoom = false;

        }

    }

    dollyOut(dollyScale) {

        if (this.camera instanceof THREE.PerspectiveCamera) {

            this.value *= dollyScale;

        } else if (this.camera instanceof THREE.OrthographicCamera) {

            this.camera.zoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.camera.zoom / dollyScale));
            this.camera.updateProjectionMatrix();
            this.zoomChanged = true;

        } else {

            console.warn('WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled.');
            this.enableZoom = false;

        }

    }

    //
    // event callbacks - update the camera this.STATE
    //

    handleMouseDownRotate(event) {

        this.rotateStart.set(event.clientX, event.clientY);

    }

    handleMouseDownDolly(event) {
        this.dollyStart.set(event.clientX, event.clientY);

    }

    handleMouseDownPan(event) {

        this.panStart.set(event.clientX, event.clientY);

    }

    handleMouseMoveRotate(event) {

        this.rotateEnd.set(event.clientX, event.clientY);
        this.rotateDelta.subVectors(this.rotateEnd, this.rotateStart);

        var element = this.domElement === document ? this.domElement.body : this.domElement;

        // rotating across whole screen goes 360 degrees around
        this.rotateLeft(2*Math.PI*this.rotateDelta.x / element.clientWidth*this.rotateSpeed);

        // rotating up and down along whole screen attempts to go 360, but limited to 180
        this.rotateUp(2*Math.PI*this.rotateDelta.y / element.clientHeight*this.rotateSpeed);

        this.rotateStart.copy(this.rotateEnd);

        this.update();

    }

    handleMouseMoveDolly(event) {

        this.dollyEnd.set(event.clientX, event.clientY);

        this.dollyDelta.subVectors(this.dollyEnd, this.dollyStart);

        if (this.dollyDelta.y > 0) {

            this.dollyIn(Math.pow(0.95, this.zoomSpeed));

        } else if (this.dollyDelta.y < 0) {

            this.dollyOut(Math.pow(0.95, this.zoomSpeed));

        }

        this.dollyStart.copy(this.dollyEnd);

        this.update();

    }

    handleMouseMovePan(event) {

        this.panEnd.set(event.clientX, event.clientY);

        this.panDelta.subVectors(this.panEnd, this.panStart);

        this.pan(this.panDelta.x, this.panDelta.y);

        this.panStart.copy(this.panEnd);

        this.update();

    }


    handleMouseWheel(event) {

        if (event.deltaY < 0) {

            this.dollyOut(Math.pow(0.95, this.zoomSpeed));

        } else if (event.deltaY > 0) {

            this.dollyIn(Math.pow(0.95, this.zoomSpeed));

        }

    }

    handleKeyDown(event) {

        switch (event.keyCode) {

            case this.keys.UP:
                this.pan(0, this.keyPanSpeed);
                this.update();
                break;

            case this.keys.BOTTOM:
                this.pan(0, -this.keyPanSpeed);
                this.update();
                break;

            case this.keys.LEFT:
                this.pan(this.keyPanSpeed, 0);
                this.update();
                break;

            case this.keys.RIGHT:
                this.pan(-this.keyPanSpeed, 0);
                this.update();
                break;

        }

    }


    mousedown(event) {

        if (this.enabled === false) return;

        event.preventDefault();

        switch (event.button) {

            case this.mouseButtons.ORBIT:
                if (this.enableRotate === false)
                    return;
                this.handleMouseDownRotate(event);
                this.STATE = this.STATE0.ROTATE;

                break;

            // case this.mouseButtons.ZOOM:
            //     if (this.enableZoom === false)
            //         return;
            //     this.handleMouseDownDolly(event);
            //     this.STATE = this.STATE0.DOLLY;
            //     break;

            case this.mouseButtons.PAN:
                if (this.enablePan === false)
                     return;
                this.handleMouseDownPan(event);
                this.STATE = this.STATE0.PAN;
                break;

        }

    }

    mousemove(event) {

        if (this.enabled === false)
            return;

        event.preventDefault();

        switch (this.STATE) {

            case this.STATE0.ROTATE:

                if (this.enableRotate === false)
                    return;

                this.handleMouseMoveRotate(event);

                break;

            case this.STATE0.DOLLY:

                if (this.enableZoom === false)
                    return;

                this.handleMouseMoveDolly(event);

                break;

            case this.STATE0.PAN:

                if (this.enablePan === false)
                    return;
                this.handleMouseMovePan(event);

                break;
        }

    }

    mouseup(event) {

        if (this.enabled === false) return;

        this.STATE = this.STATE0.NONE;

    }

    mousewheel(event) {

        if (this.enabled === false || this.enableZoom === false || ( this.STATE !== this.STATE0.NONE && this.STATE !== this.STATE0.ROTATE )) return;

        event.preventDefault();
        event.stopPropagation();

        this.handleMouseWheel(event);
    }

    keydown(event) {

        if (this.enabled === false || this.enableKeys === false || this.enablePan === false) return;

        this.handleKeyDown(event);
    }

    keyup(event) {

    }


    contextmenu(event) {

        if (this.enabled === false) return;

        event.preventDefault();

    }

}

export default OrbitControls;
