

import ResultGalleryControllerBase from "../../Base/controller/ResultGalleryControllerBase";

class ResultGalleryController extends ResultGalleryControllerBase  {
    init(window, model_manager, pvv) {
        super.init(model_manager);

        this.window = window;
        this.model_manager = model_manager;
        this.pvv = pvv;
    }

    load_results(id_scan, aligned_models_info) {
        this.load_aligned_scene(id_scan, this.window, this.pvv).then( res =>
            this.load_aligned_models(aligned_models_info, this.window, this.pvv)
        );
    }

}

export default ResultGalleryController;
