import React from 'react';
import ReactDOM from 'react-dom';

import PLYModel from '../../../lib/vao/PLYModel';
import OBJModel from '../../../lib/vao/OBJModel.js';

import ModelListingUI from "../../Base/view/ModelListingUI";
import ThumbnailGalleryUI from "../view/ThumbnailGalleryUI.js";
import PaginationUI from "../view/PaginationUI.js";
import SearchUI from "../view//SearchUI.js";
import HotButtonsUI from "../view//HotButtonsUI.js";

class GalleryModel {
    init() {
        this.is_visible = 0;
        this.search_text = "";

        this.last_picked = {id_cad: null, catid_cad: null};
        // this.last_picked = {id_cad: "99f15c63712d9fbe84868d3618d73011", catid_cad: "04379243"};
    }

    blur_search_bar() {
        this.search_bar.blur();
    }

    draw_search_bar() {
        let async0 = new Promise((resolve, reject) => {

            if (this.is_visible) {
                ReactDOM.render( <SearchUI is_visible={1} text={this.search_text} mode={0} onclick_search={this.onclick_search.bind(this)} update_search_text={this.update_search_text.bind(this)}/>,
                    document.getElementById('id_search_div'), () => resolve());

                ReactDOM.render( <HotButtonsUI is_visible={1} onclick_search={this.onclick_search.bind(this)} update_search_text={this.update_search_text.bind(this)}/>,
                    document.getElementById('id_div_hotbuttons'));
            } else {
                ReactDOM.render(<SearchUI is_visible={0} />,
                document.getElementById('id_search_div'), () => resolve());

                ReactDOM.render( <HotButtonsUI is_visible={0}/>,
                    document.getElementById('id_div_hotbuttons'));
            }
        });
        return async0
    }

    update_search_text(text) {
        this.search_text = text;
    }

    set_text_and_focus_on_search_bar(search_text) {
        this.is_visible = 1;
        this.search_text = search_text.slice(0);
        this.draw_search_bar();
    }

    flash() {
        this.search_bar.blur();
        this.search_bar.focus();
    }

    get_search_text() {
        return this.search_text;
    }

    set_label_to_loading() {
        ReactDOM.render(
            <SearchUI is_visible={1} mode={1} text={this.search_text} update_search_text={this.update_search_text.bind(this)}/>,
            document.getElementById('id_search_div')
        );

    }

    set_last_picked(id_cad, catid_cad) {
        this.last_picked.id_cad = id_cad;
        this.last_picked.catid_cad = catid_cad;
    }

    set_label_to_default() {
        this.draw_search_bar();
    }

    draw_gallery(data_cad, n_items_found) {

        ReactDOM.render(
            <ThumbnailGalleryUI mode={0} data_cad={data_cad} onclick_thumbnail={this.onclick_thumbnail} last_picked={this.last_picked}/>,
            document.getElementById('id_gallery_div'));

        ReactDOM.render(
            <PaginationUI n_items_found={n_items_found} onclick={this.onclick_pagination}/>,
            document.getElementById('id_pagination_div'));

    }

    draw_gallery_as_no_results_found() {
        ReactDOM.render(
            <ThumbnailGalleryUI mode={1}/>,
            document.getElementById('id_gallery_div')
        );
    }

    onclick_search(event) {
            throw new Error("Error: Define 'onclick_search'");
    }

    onclick_pagination(event) {
            throw new Error("Error: Define 'onclick_pagination'");
    }

    onclick_spawn_model(event) {
            throw new Error("Error: Define 'onclick_spawn_model'");
    }

    clean() {
        ReactDOM.render(
            <ThumbnailGalleryUI mode={-1}/>,
            document.getElementById('id_gallery_div'));

        this.is_visible = 0;
        this.draw_search_bar();
    }


}

export default GalleryModel;
