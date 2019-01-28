import React from 'react';

class KeypointSatelliteUI extends React.Component {

    render() {
        if (this.props.is_visible) {
            return (
                <button className={"button_red"} onClick={this.props.onclick_delete} style={{position: "absolute", left: this.props.pos.x - 50 + "px",top: this.props.pos.y - 50 + "px"}}>  <big>&#10006;</big> </button>
            );
        } else {
            return null;
        }
    }
}

export default KeypointSatelliteUI;
