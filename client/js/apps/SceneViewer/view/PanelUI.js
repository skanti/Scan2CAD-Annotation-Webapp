import React from "react";
import ReactTable from 'react-table'

class PanelUI extends React.Component {
    constructor(props) {
        super(props);
        this.state = {mode : props.checked, messages : props.messages, is_collapsed : false};
    }

    handle_radio_change(mode) {
        this.setState({
            mode: mode,
        });
        this.props.onclick_radio(this.props.id, mode);
    }

    render() {
        const checked = this.state.mode;

        let color_checked =  "primary";
        if (checked == "0")
            color_checked = "warning";
        else if (checked == "1")
            color_checked = "danger";
        else if (checked == "2")
            color_checked = "success";
        else if (checked == "3")
            color_checked = "dark";

        let collapse = this.state.is_collapsed ? "collapse" : "";
        return (
            <div className={"card text-white bg-" +  color_checked + " mb-3"} style={{display: "inline-block", width : "400px"}}>
                <div className="card-header">#OBJ <b>{this.props.n_objs}</b>  #KP <b> {this.props.n_kps} </b>  <div className="float-right" > <a className="fas fa-minus-square" onClick={e => {this.setState({is_collapsed : !this.state.is_collapsed})}} href="#"> </a> </div> </div>
                <div className={collapse}>
                    <div className="card-body" style={{display: "inline-block"}}>
                        <div className="card-subtitle"> ID: <b> {this.props.id}</b> </div>
                        <div className="card-subtitle"> User: <b> {this.props.user}</b> </div>
                        <div> Message Annotation: </div>
                        <div style={{marginLeft : "5px"}}> <b> {this.state.messages.annotation} </b> </div>
                        <form style={{marginTop : "1vw"}} action="" onSubmit={e => {this.handle_message_save(e, this.props.id)}}>
                              <div> Message Verfication:</div>
                              <div style={{display: "inline-block"}}>
                                  <input type="text" name="message" defaultValue={this.state.messages.verification} onChange={e => this.handle_message_change(e)}/>
                                  <input type="submit" value="Save"/>
                              </div>
                        </form>

                        <form style={{marginTop : "0.5vw"}} action="" >
                            <div className="radio">
                                <label><input type="radio" name={"optradio"} value={0} checked={this.state.mode == "0"} onChange={e => {this.handle_radio_change("0")}}/> Needs checking </label>
                            </div>
                            <div className="radio">
                                <label><input type="radio" name={"optradio"} value={1} checked={this.state.mode == "1"} onChange={e => {this.handle_radio_change("1")}}/> Needs re-annotation </label>
                            </div>
                            <div className="radio ">
                                <label><input type="radio" name={"optradio"} value={2} checked={this.state.mode == "2"} onChange={e => {this.handle_radio_change("2")}} /> Is Final </label>
                            </div>
                            <div className="radio ">
                                <label><input type="radio" name={"optradio"} value={3} checked={this.state.mode == "3"} onChange={e => {this.handle_radio_change("3")}} /> Ignore </label>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        );
    }



	handle_message_change(event) {
		let message = event.target.value;
        let tmp = this.state.messages;
        tmp.verification = message;
		this.setState({message: tmp});
	}

	handle_message_save(event, id_keypointalignment) {
		let message = this.state.messages.verification;
		this.props.onclick_messagebox(id_keypointalignment, message);
		event.preventDefault();
	}

    shouldComponentUpdate(nextProps, nextState) {
       return this.state.messages.verification === nextState.messages.verification;
    }

}


export default PanelUI;
