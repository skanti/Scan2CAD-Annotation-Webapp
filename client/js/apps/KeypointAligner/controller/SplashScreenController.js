

class SplashScreenController {
    init(splash_screen_model) {
        this.splash_screen_model = splash_screen_model;
        this.splash_screen_model.onclick_ok = this.onclick_ok.bind(this);
    }

    draw() {
        this.splash_screen_model.draw();
    }

    start_after_splash_screen() {
        throw new Error("Error: Define 'start_after_splash_screen'");
    }

    onclick_ok() {
        this.splash_screen_model.is_visible = 0;
        this.splash_screen_model.hide();
        this.start_after_splash_screen();
    }



}

export default SplashScreenController;
