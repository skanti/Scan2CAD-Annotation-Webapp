import React from 'react';

class StartOverSatelliteUI extends React.Component {

    render() {
        if (this.props.is_visible) {
            return (
                <div>
                    {this.props.id_model_list.map((key, i) => {
                        return (<button className={"button_orange"} key={"start_over" + key} onClick={this.props.onclick_start_over.bind(null, key)}
                            style={{position: "absolute", left: this.props.pos_list[i].x - 50 + "px", top: this.props.pos_list[i].y - 50 + "px", fontSize:"1vw", display: "inline-block"}}>  <big> &#8634;</big>Again </button>);
                        }
                    )}
                </div>
            );
        } else {
            return null;
        }
    }
}

export default StartOverSatelliteUI;
