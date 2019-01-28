
import ModelSpawnerBase from "../../Base/model/ModelSpawner";
import Wireframe from '../../../lib/vao/Wireframe.js';
import KeypointVAO from '../../../lib/vao/KeypointVAO';

class ModelSpawner extends ModelSpawnerBase {





    create_all_wireframes(window, model_manager) {
        for (let key in model_manager.id2obj) {
            let id_model = key
            let obj = model_manager.id2obj[key];

            var wireframe = new Wireframe();
            wireframe.init(window.gl);
            wireframe.is_visible = 1;
            wireframe.update_box(obj.bounding_box.x, obj.bounding_box.y, obj.bounding_box.z);
            model_manager.add_wireframe0(id_model, wireframe);
        }
    }


}

export default ModelSpawner;
