import React from 'react';

class SkipSubmitUI extends React.Component {
    constructor(props) {
        super(props);
        this.state = {messages : props.messages};

    }

    render() {
        let message_verification = this.state.messages.verification == "" ? "-- No message left --" : this.state.messages.verification;
        let message_annotation = this.state.messages.annotation == "" ? "E.g. Can't find good chair... " : this.state.messages.annotation;
        return (
            <div className="container-fluid">
                <div className="row" style={{marginTop:"0.5vw"}}>
                    <button type="button" className="btn btn-success btn-lg" onClick={this.props.onclick_submit} style={{margin:"0.2vw", cursor:"pointer"}}> Done </button>
                </div>
                <div className="row" style={{marginTop:"0.5vw"}}>
                    <label> <b> <font color="black"> Verification Notes: </font> </b> </label> <br />
                </div>
                <div className="row" style={{marginTop:"0.5vw", marginLeft:"0.5vw"}}>
                    <label> <b> <font color="#4286f4"> {message_verification} </font> </b> </label> <br />
                </div>
                <div className="row" style={{marginTop:"0.5vw"}}>
                    <label> <b> <font color="black"> Annotation Notes: </font> </b> </label> <br />
                </div>
                <div className="row" style={{marginTop:"0.5vw", marginLeft:"0.5vw"}}>
                    <input type="text" name="message" placeholder={message_annotation} style={{width : "100%"}} onChange={e => this.handle_message_change(e)}/>
                </div>
            </div>
        );
    }

    handle_message_change(event) {
        let message = event.target.value;
        let tmp = this.state.messages;
        tmp.annotation = message;
        this.setState({ messages : tmp})
    }

    shouldComponentUpdate(nextProps, nextState) {
       return this.state.messages.annotation === nextState.messages.annotation;
    }

}

export default SkipSubmitUI;
