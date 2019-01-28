import React from 'react';

class BackButtonUI extends React.Component {

    render() {
        if (this.props.is_visible) {
            return (
                    <button className="button_blue" id={"id_progress_back"} style={{display:"inline-block", lineHeight:"2vw", fontSize:"1.2vw" }} onClick={this.props.onclick_back}><big>&#8617;</big>Back </button>
            );
        } else {
            return (<div></div>);
        }
    }

}

export default BackButtonUI;
