import React from 'react';

class StartOverButtonUI extends React.Component {

    render() {
        if (this.props.is_visible) {
            return (
                <button type="button" className="btn btn-warning btn-lg" id={"id_progress_start_over"} onClick={this.props.onclick_start_over}> &#8634; Reset Points </button>
            );
        } else {
            return (<div></div>);
        }
    }

}

export default StartOverButtonUI;
