import React from 'react';

class InfoBarUI extends React.Component {
    render() {
        if (this.props.is_visible)
            return (
                <MyButton id={this.props.id} text={this.props.text}/>
            );
        else
            return (<div> </div>);
    }

}

class MyButton extends React.Component {
    constructor (props) {
      super(props)
      this.state = {anim : 1, text : props.text}
      this.anim_done = this.anim_done.bind(this)
    }

    render() {
        const id = "id_div_progress_status" + this.props.id;
        let anim_class = "card-info " + (this.state.anim ? "focusable" : "");

        return (
            <div className="card">
                <div className={anim_class} ref="info" id={id} style={{width:"100%", fontSize:"1.2vw"}}>
                    <big>&#9432;</big> {this.state.text}
                </div>
            </div>
        );
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.text != null)
            this.setState({text : nextProps.text});
        this.setState({anim: 1});
    }

    anim_done () {
       this.setState({anim: 0});
     }

    componentDidMount () {
        const elm = this.refs.info;
        elm.addEventListener('animationend', this.anim_done);
    }

    componentWillUnmount () {
        const elm = this.refs.info;
        elm.removeEventListener('animationend', this.anim_done);
    }



}

export default InfoBarUI;
