
class KeymapController {
    init(keymap_model) {
        this.keymap_model = keymap_model;
    }

    draw() {
        this.keymap_model.draw();
    }



}

export default KeymapController;
