
import PVVBaseController from "../../Base/controller/PVVBaseController";

class PVVViewerController extends PVVBaseController {

    init(window, model_manager, pvv_model, trs_model, gallery_model, segment_satellite_model) {
        super.init(window, model_manager, pvv_model);
    }


    mouseclick(event) {
        switch (event.button) {
            case 0:
                console.log("here")
                break;
            }
    }
}


export default PVVViewerController;
