import React from "react";

class ToggleModelsUI extends React.Component {
    constructor(props) {
        super(props);
        this.state = {show_filter : 0};
    }

    render() {
        return (
            <div className="container-fluid" >
                <div className="btn-group btn-group-toggle" data-toggle="buttons">
                    <label className="btn btn-primary btn-sm active" onClick={e => this.props.onclick_models(0)}>
                        <input type="radio" name="options" id="option3" autoComplete="off"  /> Show All
                    </label>
                    <label className="btn btn-primary btn-sm" onClick={e => this.props.onclick_models(1)}>
                        <input type="radio" name="options" id="option4" autoComplete="off"  /> Show CAD only
                    </label>
                    <label className="btn btn-primary btn-sm" onClick={e => this.props.onclick_models(2)}>
                        <input type="radio" name="options" id="option5" autoComplete="off"  /> Show Scan only
                    </label>
                </div>
            </div>
        );
    }

}


export default ToggleModelsUI;
