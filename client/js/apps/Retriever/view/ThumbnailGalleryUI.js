import React from 'react';

class ThumbnailGalleryUI extends React.Component {
    constructor(props) {
        super(props);
        this.n_cols = 4;
        this.n_cols_dummy = (new Array(this.n_cols)).fill(1);
        this.f_click = this.props.onclick;

    }

    sort_for_last_picked(data, id_cad) {
        var index = data.find(elem => {return elem.id_cad === id_cad;});
        if (index !== null && index !== undefined)
            [index, data[0]] = [data[0], index];
    }

    render() {
        switch(this.props.mode) {
        case -1:
            return (<div> </div>);
        case 0:

            this.sort_for_last_picked(this.props.data_cad, this.props.last_picked.id_cad);
            this.n_rows = Math.floor(this.props.data_cad.length / this.n_cols);
            this.n_rows_dummy = (new Array(this.n_rows)).fill(1);
            return (
                <div>
                    {this.n_rows_dummy.map((x, i) => {
                            return this.add_row(i * 4);
                        }
                    )}
                </div>
            );
        case 1:
            return (
                <div style={{fontSize: "18px"}}> The database does not contain everything. Try another object.
                </div>
            );
        case 2:
            return (
                <div style={{fontSize: "18px"}}> Loading... </div>
            );
        }
    }

    handle_click(model_id) {
        this.f_click(model_id);
    }

    add_row(i_row) {
        return (
            <div className="row" key={"thumbnail_gallery_row" + i_row} style={{marginBottom:"0.5vw"}}>
                {this.n_cols_dummy.map((x, i) => {
                    if (i_row + i < this.props.data_cad.length)
                        return this.add_image(i_row + i)
                }
                )}
            </div>);
    }

    show_gif (id, path) {
        const elm = this.refs[id];
        elm.src = path;
        // elm.addEventListener('animationend', this.anim_done);
    }

    show_front(id, path) {
        const elm = this.refs[id];
        elm.src = path;
    }

    add_image(i_image) {
        const id_cad = this.props.data_cad[i_image].id_cad;
		if (id_cad == null)
			return null;
        const catid_cad = this.props.data_cad[i_image].catid_cad;
        const image_path_front = "/Scan2CAD/download/cad/image/front/" + catid_cad + "/" + id_cad;
        const image_path_gif = "/Scan2CAD/download/cad/image/gif/" + catid_cad + "/" + id_cad;

        let is_last_picked = id_cad === this.props.last_picked.id_cad && catid_cad === this.props.last_picked.catid_cad;
        let hightlight_border = is_last_picked ?  "2px solid red" : "";
        return (
            <div className="col-3" key={"thumbnail_gallery_col" + id_cad}>
                    <img className="img-fluid img-thumbnail imghover" src={image_path_front} key={"key" + catid_cad + id_cad}
                        ref={"ref" + catid_cad + id_cad} onClick={this.props.onclick_thumbnail.bind(null, catid_cad, id_cad)}
                        onMouseEnter={this.show_gif.bind(this, "ref" + catid_cad + id_cad, image_path_gif)} onMouseLeave={this.show_front.bind(this, "ref" + catid_cad + id_cad, image_path_front)}
                        style={{cursor: "pointer", border: hightlight_border}}/>
            </div>
        )
    }
}

export default ThumbnailGalleryUI;
