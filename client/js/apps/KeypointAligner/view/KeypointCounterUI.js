import React from 'react';

class KeypointCounterUI extends React.Component {

    render() {
        if (!this.props.is_visible) {
            return null;
        } else {

            let color = null;

            if (this.props.n < 4)
                color = "btn btn-outline-danger btn-lg";
            else if (this.props.n >= 4 && this.props.n <= 6)
                color = "btn btn-outline-warning btn-lg";
            else if (this.props.n > 6)
                color = "btn btn-outline-success btn-lg";
            return (
                    <button className={color} id="div_info" style={{pointerEvents: "none"}} >
                        Placed Points: {this.props.n}/{this.props.n_min}
                    </button>
            );
        }
    }

}


export default KeypointCounterUI;
