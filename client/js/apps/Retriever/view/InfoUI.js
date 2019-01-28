import React from 'react';

class InfoUI extends React.Component {

    render() {
        if (!this.props.is_visible) {
            return null;
        } else {
            return (
                    <div className="card">
                        <div className="card-info" id="div_info" style={{display:"inline-block", width : "100%", fontSize:"1.2vw", outline: "none", pointerEvents: "none"}} >
                            <big>&#9432;</big>{this.props.text}
                        </div>
                    </div>
            );
        }
    }

}


export default InfoUI;
