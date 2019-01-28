import React from 'react';

class SegmentLabelSatelliteUI extends React.Component {

    render() {
        if (this.props.hide) {
            return null;
        } else {
            let button_color = this.props.gray ? "button_gray" : "button_blue";
            return (
                <button className={button_color} style={{position: "absolute", left: this.props.pos[0] + "px",top: this.props.pos[1] + "px", fontSize:"1rem"}}> {this.props.label} </button>
            );
        }
    }
}

export default SegmentLabelSatelliteUI;
