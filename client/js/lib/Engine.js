
class Engine {

    init(world) {
        this.world = world;

        this.run_ref = this.run.bind(this);
        // this.fps_label_ref = document.getElementById("fps_label");
        // this.mspf_label_ref = document.getElementById("mspf_label");


        this.i_iteration = 0;
        this.mspf = 0.0;
        this.mspf10 = 0.0;
        this.time_last = 0.0;

        this.ready = true;
    }

    run() {
        if (this.ready) {
            if (this.world.initialized) {
                this.world.advance(this.i_iteration, this.mspf);
                this.world.draw();
            }

            this.mspf = Date.now() - this.time_last;
            this.mspf10 += this.mspf;
            this.i_iteration++;

            if (this.i_iteration % 10 === 0) {
                //this.fps_label_ref.textContent = "FPS: " + 10000.0/this.mspf10;
                this.mspf10 = Math.min(10000, this.mspf10);
                // this.mspf_label_ref.textContent = "ms/frame: " + (this.mspf10 / 10.0).toFixed(1);
                this.mspf10 = 0.0;
            }

            this.time_last = Date.now();
        }
        requestAnimationFrame(this.run_ref);

    }


    term() {
        this.world.term();
    }

}

window.Engine = Engine;
