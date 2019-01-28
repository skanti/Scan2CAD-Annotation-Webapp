import React from 'react';

class SubmitUI extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        // <button className="button_gray" onClick={this.props.onclick_skip} style={{cursor: "pointer",  lineHeight:"3vw", fontSize:"1.2vw" }}> Skip </button>

        return (
                <div className="d-flex justify-content-end">
                    <button className="btn btn-primary btn-lg" onClick={this.props.onclick_go_back}> <big>&#8617;</big> Go back to selection </button>
                </div>
        );
    }

}

// <button className="button_blue" onClick={this.props.onclick_submit} style={{display:"inline-block", marginLeft:"0.2vw", cursor: "pointer",  lineHeight:"3vw", fontSize:"1.2vw" }}> Submit </button>

export default SubmitUI;
