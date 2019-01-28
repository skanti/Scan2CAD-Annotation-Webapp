import Retriever from "../Retriever/Retriever";
import KeypointAligner from "../KeypointAligner/KeypointAligner";


class Scan2CAD {
    constructor() {
        this.initialized = 0;

        this.retriever = new Retriever();
        this.retriever.onclick_retriever2aligner = this.onclick_retriever2aligner.bind(this);

        this.aligner = new KeypointAligner();
        this.aligner.onclick_aligner2retriever = this.onclick_aligner2retriever.bind(this);

        this.app_active = null;
    }

	init_new(id_scan) {
		this.app_active = this.retriever;
		this.app_active.init_new(id_scan);
		this.initialized = 1;
    }

    init_edit(id_annotation) {
        this.app_active = this.retriever;
        this.app_active.init_from_db(id_annotation);
        this.initialized = 1;
    }

    draw() {
        this.app_active.draw();
    }


    advance(i_iteration, mspf) {
        this.app_active.advance(i_iteration, mspf);
    }

    onclick_retriever2aligner(id, catid_cad, id_cad, is_realign, position, cargo) {
        this.retriever.clean();


        let info = {
            id_user : "dummy",
            date : Date.now(),
            duration : 0,
            id_scan: cargo.scene.id,
            trs : cargo.scene.package_model_data(),
            retrieved_model : {
                id_model : id,
                catid_cad : catid_cad,
                id_cad : id_cad,
                is_realign : is_realign,
                position : position,
            }
        };

        // let data = {"id_user":"test123","date":1513786018573,"duration":0,"id_scan":"2016-08-07_09-33-26__C7BA9586-8237-4204-9116-02AE5804338A","trs":{"translation":[-3.3972364366054535,-1.4502116385847332,3.9008082449436188],"rotation":[-0.7071067811865475,0,0,0.7071067811865476],"scale":[1,1,1]},"retrieved_model":{"catid_cad":"04256520","id_cad":"63eeb7ea2c7683b3f811db9eaa01354f","position":[-1.3245568463582948,-0.9247316330595369,0.8766226908875345]}};

        this.initialized = 0;
        this.aligner.init_from_retrieval(info, cargo).then(res => {
            this.app_active = this.aligner;
            this.initialized = 1;
        })
    }

    onclick_aligner2retriever(id_model, catid_cad, id_cad, is_realign, obj, keypoint0, keypoint1) {
        this.aligner.clean();

        let info = {
            id_model : id_model,
            catid_cad : catid_cad,
            id_cad : id_cad,
            is_realign : is_realign,
        };
        let cargo = {obj : obj, keypoint0 : keypoint0, keypoint1 : keypoint1};

        this.initialized = 0;
        this.retriever.init_from_alignment(info, cargo).then(res => {
            this.initialized = 1;
            this.app_active = this.retriever;
        });
    }






}

window.Scan2CAD = Scan2CAD;
