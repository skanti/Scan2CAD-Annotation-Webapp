import React from 'react';
import ReactDOM from 'react-dom';

import {AppLogicState, MouseButtonState} from "../Common";


import PLYModel from '../lib/PLYModel';
import OBJModel from '../lib/vao/OBJModel.js';

import AlignedSceneTableUI from '../lib/react/AlignedSceneTableUI.js';
import SearchUI from "../lib/react/SearchUI.js";
import ModelListingUI from "../lib/react/ModelListingUI";



class ResultGalleryControllerBase {
    init(model_manager) {
        this.model_manager = model_manager;
    }

    async onclick_search() {
        console.log("search...");
    }

    create(data) {
        const columns = [
           {
               Header: 'ID User',
               accessor: 'id_user' // String-based value accessors!
           }, {
           Header: 'ID Scannet',
           accessor: 'id_scan' // String-based value accessors!
           }, {
               Header: 'Date',
               accessor: 'date',
           }
       ];

        ReactDOM.render(
           <AlignedSceneTableUI columns={columns} data={data} onclick={this.load_results.bind(this)}/>,
           document.getElementById('id_gallery_div'));
    }


    load_aligned_scene(id_scan, window, pvv_model) {
        return new Promise((resolve, reject) => {
            let scene = new PLYModel();
            scene.init(window.gl);

            scene.load_scene("scannet", id_scan).then( res => {
                this.model_manager.add_scene(scene);
                pvv_model.add_scene(scene);
                resolve();
            });
        });
    }



    load_aligned_models(aligned_models_info, window, pvv_model) {
        return new Promise((resolve, reject) => {
            for (let key in aligned_models_info) {
                let id_model = aligned_models_info[key].id_model;
                let id_category = aligned_models_info[key].id_model_category;
                this.spawn_model(id_category, id_model, window, pvv_model).then(res => {

                    this.model_manager.id2obj[id_model].scale_matrix.elements = aligned_models_info[key].scale_matrix.slice(0);
                    this.model_manager.id2obj[id_model].rotation_matrix.elements = aligned_models_info[key].rotation_matrix.slice(0);
                    this.model_manager.id2obj[id_model].translation_matrix.elements = aligned_models_info[key].translation_matrix.slice(0);
                });
            }
            resolve();
        });
    }


}

export default ResultGalleryControllerBase;
