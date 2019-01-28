import React from 'react';

class CADSatelliteUI extends React.Component {

    render() {
        if (this.props.is_visible) {
            return (
                <div>
                    {Object.keys(this.props.id2poses).map((key, i) => {
                            return (<button className={"button_red"} key={"delete_satellite_" + key} onClick={this.props.onclick_delete.bind(null, key)} style={{position: "absolute", left: this.props.id2poses[key].x - 50 + "px",top: this.props.id2poses[key].y - 50 + "px"}}>  <big>&#10006;</big> </button>);
                        }
                    )};
                </div>
            );
        } else {
            return null;
        }
    }
}

export default CADSatelliteUI;
