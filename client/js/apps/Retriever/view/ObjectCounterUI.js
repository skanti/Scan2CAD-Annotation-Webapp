import React from 'react';

class ObjectCounterUI extends React.Component {

    render() {
        if (!this.props.is_visible) {
            return null;
        } else {
            return (
                    <div className="btn btn-outline-dark btn-lg" style={{pointerEvents: "none"}} >
                        Finished Objects: {this.props.n}
                    </div>
            );
        }
    }

}


export default ObjectCounterUI;
