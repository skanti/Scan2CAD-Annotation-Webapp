import React from "react";
import ReactTable from 'react-table'

class UserPromptUI extends React.Component {
    constructor(props) {
        super(props);
        this.state = {is_invalid : 0};
    }


    render() {
        let warning = null;
        if (this.state.is_invalid)
            warning = (<div className="alert alert-warning" role="alert"> Invalid user name. Please re-enter. </div>);

        return (
            <div>
                <div className="card" style={{padding : "0", width:"100%", height:"100%", top : "10px"}}>
                    <div className="card-header">
                       Login
                     </div>
                    <div className="card-body">
                        <form>
                          <div className="form-group">
                            <label htmlFor="input_iduser">Please enter a user name: </label>
                            <input type="text" className="form-control" ref={"input_iduser"} id={"input_iduser"} placeholder="User ID" onKeyDown={e => {if (e.keyCode === 13) {e.preventDefault(); this.onclick_ok()}}}/>
                          </div>

                          <div style={{display:"inline-block"}}>
                              <button type="button" className="btn btn-primary" onClick={e => this.onclick_ok()}> OK </button>
                              <button type="button" className="btn btn-warning" onClick={e => this.props.onclick_back()} style={{marginLeft : "10px"}}> Back </button>
                          </div>
                          {warning}

                        </form>
                    </div>
                </div>
            </div>
        );
    }

    onclick_ok() {
        const elm = this.refs.input_iduser;
        let iduser = elm.value;
        if (iduser === "")
            this.setState({is_invalid : 1})
        else {
            this.setState({is_invalid : 0})
            this.props.onclick_ok(iduser);
        }
    }
}


export default UserPromptUI;
