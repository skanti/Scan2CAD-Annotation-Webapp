import React from 'react';

class KeymapUI extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div>
            <div className="dropdown">
              <button className="btn btn-warning btn-lg dropdown-toggle" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"> Mousemap </button>
              <div className="dropdown-menu" style={{ cursor : "default"}}>
                <a className="dropdown-item"> <b>Click Left:</b> Action </a>
                <a className="dropdown-item"> <b>Hold Right:</b> Look around </a>
                <a className="dropdown-item"> <b>Hold Middle:</b> Move camera </a>
                <a className="dropdown-item"> <b>Mousewheel:</b> Zoom </a>
              </div>
            </div>
            </div>
        );
    }

}

export default KeymapUI;
