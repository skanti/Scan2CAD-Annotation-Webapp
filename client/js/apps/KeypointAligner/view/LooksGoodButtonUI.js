import React from 'react';

class LooksGoodButtonUI extends React.Component {

    render() {
        if (this.props.is_visible) {
            return (
                <button type="button" className="btn btn-success btn-lg" ref={input => { this.component = input; this.flash(); }} id={"id_looks_good"}
                    onClick={this.props.onclick}> {this.props.text}</button>
            )
        } else {
            return null;
        }
    }


    flash() {
        if (this.component !== null)
            this.component.focus();
    }


}

export default LooksGoodButtonUI;
