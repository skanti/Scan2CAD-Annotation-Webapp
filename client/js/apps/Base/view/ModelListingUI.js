import React from 'react';

class ModelListingUI extends React.Component {
    constructor(props) {
        super(props);
        this.f_click = this.props.onclick;
    }

    render() {

        let n_rows = this.props.id_model.length;
        let n_rows_dummy = (new Array(n_rows)).fill(1);
        return (
            <div>
                {n_rows_dummy.map((x, i) => {
                    return (
                        <div key={"model_list" + this.props.id_model[i]}>
                            <button  id={this.props.id_model[i]} className="btn btn-primary btn-sm" style={{cursor:"pointer", "marginBottom":"0.5vw"}} onClick={this.props.onclick.bind(null, this.props.id_model[i])}> {this.props.category_model[i]} </button>
                        </div>
                    );
                })
                }
            </div>
        );
    }

    handle_click(model_id) {
        this.f_click(model_id);
    }
}

export default ModelListingUI;