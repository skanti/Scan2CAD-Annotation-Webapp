import React from 'react';

class DoneButtonUI extends React.Component {

    render() {
        if (this.props.is_visible) {
            return (
                <button type="button" className="btn btn-primary btn-lg" id={"id_progress_ok"} onClick={this.props.onclick}> Align </button>
            )
        } else {
            return (<div></div>);
        }
    }

}

export default DoneButtonUI;
