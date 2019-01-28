import React from 'react';

class OptionsBar extends React.Component {
    constructor(props) {
        super(props);

        this.state = {is_color_toggled : false, is_show_only_segment : false};
        this.onclick_color_ref = this.onclick_color.bind(this);
    }

    render() {
        return (
            <div>
            <div className="dropdown">
              <button className="btn btn-warning btn-lg dropdown-toggle" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"> Options </button>
              <div className="dropdown-menu">
                <a href="#" className="dropdown-item" onClick={this.onclick_color_ref} > Toggle Color {this.state.is_color_toggled ?(<span>&#10003;</span>) : ""} </a>
              </div>
            </div>
            </div>
        );
    }

    onclick_color(event) {
        this.setState({ is_color_toggled : !this.state.is_color_toggled });
        this.props.onclick_color(event);
    }



}

export default OptionsBar;
