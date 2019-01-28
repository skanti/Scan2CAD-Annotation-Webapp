import * as THREE from 'three/build/three';

class FPFlyControls {
    constructor( camera, window_width, window_height, window_left, window_top ) {

        this.camera = camera;
        this.window_width = window_width;
        this.window_height = window_height;
        this.window_left = window_left;
        this.window_top = window_top;

        // API

        this.movementSpeed = 1.0;
        this.rollSpeed = 0.5;

        this.phi = this.camera.rotation.y;
        this.theta = this.camera.rotation.x;
        this.R = new THREE.Matrix3();


        this.tmpQuaternion = new THREE.Quaternion();


        this.moveState = {
            up: 0,
            down: 0,
            left: 0,
            right: 0,
            forward: 0,
            back: 0,
            pitchUp: 0,
            pitchDown: 0,
            yawLeft: 0,
            yawRight: 0,
            rollLeft: 0,
            rollRight: 0,
            mouseFly: 0,
            move: 0,
            out: 0
        };
        this.moveVector = new THREE.Vector3(0, 0, 0);
        this.rotationVector = new THREE.Vector3(0, 0, 0);
    }

    keydown( event ) {

        if ( event.altKey ) {

            return;

        }

        //event.preventDefault();

        switch ( event.keyCode ) {

            case 16: /* shift */ this.movementSpeedMultiplier = .1; break;
            case 17: /* ctrl */ this.moveState.mouseFly = 1; break;

            case 87: /*W*/ this.moveState.forward = 1; break;
            case 83: /*S*/ this.moveState.back = 1; break;

            case 65: /*A*/ this.moveState.left = 1; break;
            case 68: /*D*/ this.moveState.right = 1; break;

            case 82: /*R*/ this.moveState.up = 1; break;
            case 70: /*F*/ this.moveState.down = 1; break;

            case 38: /*up*/ this.moveState.pitchUp = 1; break;
            case 40: /*down*/ this.moveState.pitchDown = 1; break;

            case 37: /*left*/ this.moveState.yawLeft = 1; break;
            case 39: /*right*/ this.moveState.yawRight = 1; break;

            case 81: /*Q*/ this.moveState.rollLeft = 1; break;
            case 69: /*E*/ this.moveState.rollRight = 1; break;

        }

        this.updateMovementVector();

    };

    keyup( event ) {

        switch ( event.keyCode ) {

            case 16: /* shift */ this.movementSpeedMultiplier = 1; break;
            case 17: /* ctrl */ this.moveState.mouseFly = 0; break;

            case 87: /*W*/ this.moveState.forward = 0; break;
            case 83: /*S*/ this.moveState.back = 0; break;

            case 65: /*A*/ this.moveState.left = 0; break;
            case 68: /*D*/ this.moveState.right = 0; break;

            case 82: /*R*/ this.moveState.up = 0; break;
            case 70: /*F*/ this.moveState.down = 0; break;

            case 38: /*up*/ this.moveState.pitchUp = 0; break;
            case 40: /*down*/ this.moveState.pitchDown = 0; break;

            case 37: /*left*/ this.moveState.yawLeft = 0; break;
            case 39: /*right*/ this.moveState.yawRight = 0; break;

            case 81: /*Q*/ this.moveState.rollLeft = 0; break;
            case 69: /*E*/ this.moveState.rollRight = 0; break;

        }

        this.updateMovementVector();

    };

    mousedown( event ) {

        event.preventDefault();
        event.stopPropagation();

        switch ( event.button ) {
            case 2: this.moveState.mouseFly = 1; break;
            // case 0: this.moveState.forward = 1; break;
            // case 2: this.moveState.back = 1; break;

        }

    };

    mouseup( event ) {

        event.preventDefault();
        event.stopPropagation();


        switch ( event.button ) {
            case 2:
                this.moveState.mouseFly = 0;
                this.moveState.yawLeft = 0;
                this.moveState.yawRight = 0;
                this.moveState.pitchDown = 0;
                this.moveState.pitchUp = 0;
                break;
            // case 0: this.moveState.forward = 0; break;
            // case 2: this.moveState.back = 0; break;

        }

    };



    mousemove( event ) {

        if (event.clientX < this.window_left || event.clientX >= (this.window_width + this.window_left)  || event.clientY < this.window_top || event.clientY >= (this.window_height + this.window_top)) {
            this.moveState.mouseFly = 0;
            return;
        }

        if ( this.moveState.mouseFly ) {

            // this.moveState.yawLeft   = -event.movementX*0.1;
            // this.moveState.pitchDown = event.movementY*0.1;


            this.phi = event.movementX*0.003;
            this.theta = event.movementY*0.003;

            // this.camera.rotateAroundWorldAxis(this.camera.position, new THREE.Vector3(0, 0, 1), -this.phi);
            var q1 = new THREE.Quaternion();
            q1.setFromAxisAngle( new THREE.Vector3(0, 0, 1), -this.phi );
            this.camera.quaternion.multiplyQuaternions( q1, this.camera.quaternion );
            var pos_tmp = this.camera.position.clone();
            this.camera.position.sub( pos_tmp );
            this.camera.position.applyQuaternion( q1 );
            this.camera.position.add( pos_tmp );

            this.tmpQuaternion.set( -this.theta, 0, 0, 1 ).normalize();
            this.camera.quaternion.multiply( this.tmpQuaternion );
            this.camera.rotation.setFromQuaternion(this.camera.quaternion, this.camera.rotation.order);

            this.moveState.move = 1;

        }

    };


    update( delta ) {

        var moveMult = delta * this.movementSpeed;
        var rotMult = delta * this.rollSpeed;

        this.camera.translateX( this.moveVector.x * moveMult );
        this.camera.translateY( this.moveVector.y * moveMult );
        this.camera.translateZ( this.moveVector.z * moveMult );

        if (this.moveState.move === 1) {
            // this.tmpQuaternion.set( this.rotationVector.x * rotMult, this.rotationVector.y * rotMult, this.rotationVector.z * rotMult, 1 ).normalize();
            // this.camera.quaternion.multiply( this.tmpQuaternion );
            // this.camera.rotation.setFromQuaternion(this.camera.quaternion, this.camera.rotation.order);
        }
        this.moveState.move = 0;

    };

    updateMovementVector() {

        var forward = ( this.moveState.forward || ( this.autoForward && ! this.moveState.back ) ) ? 1 : 0;

        this.moveVector.x = ( - this.moveState.left    + this.moveState.right );
        this.moveVector.y = ( - this.moveState.down    + this.moveState.up );
        this.moveVector.z = ( - forward + this.moveState.back );

        //console.log( 'move:', [ this.moveVector.x, this.moveVector.y, this.moveVector.z ] );

    };

    updateRotationVector() {

        this.rotationVector.x = ( -this.moveState.pitchDown + this.moveState.pitchUp );
        this.rotationVector.y = ( -this.moveState.yawRight + this.moveState.yawLeft );
        this.rotationVector.z = ( -this.moveState.rollRight + this.moveState.rollLeft );
        //console.log( 'rotate:', [ this.rotationVector.x, this.rotationVector.y, this.rotationVector.z ] );

    };

    contextmenu( event ) {
        event.preventDefault();

    }

    mousewheel(event) {
        event.preventDefault();
        this.camera.translateZ(0.005 * event.deltaY);
    }


}


export default FPFlyControls;
