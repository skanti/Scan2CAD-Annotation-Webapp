import React from 'react';

class SearchUI extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
           text: "",
           update_search_text : null
        };

        this.handleChange = this.handleChange.bind(this);
        this.onclick_search = this.onclick_search.bind(this);
    }

    render() {

        if (this.props.is_visible) {


            let button = this.make_button();
            return (
                    <div>
                        <form className="exampleform">
                          <input type="text" id="id_input_search" value={this.state.text}  placeholder="Search.." name="search" onKeyDown={(event) => {if (event.keyCode === 13) this.onclick_search()}} onChange={this.handleChange}/>
                          {button}
                        </form>
                    </div>
            );
        } else {
            return null;
        }
    }

    make_button() {
        let symbol = null;
        let is_disabled = 0;
        switch (this.props.mode) {
            case 0:
                symbol = <i className="fa fa-search" aria-hidden="true"></i>;
                is_disabled = 0;
                break;
            case 1:
                symbol = <i className="fa fa-spinner" aria-hidden="true"></i>;
                is_disabled = 1;
                break;
        }

        return (
            <button type="submit" className="btn btn-primary btn-block" onClick={this.onclick_search} style={{ fontSize:"1.2rem", width:"20%", padding:"10px", float:"left", borderRadius: "0px",  border: "1px solid grey", borderLeft:"none"}} disabled={is_disabled}>
                {symbol}
            </button>
        );
    }
    // <input  type="text"  id="id_input_search" value={this.state.text} style={{color : "rgb(64, 64, 64)", fontSize : "18px", width: "100%", padding : "1px"}}
    //     onKeyDown={(event) => {if (event.keyCode === 13) this.onclick_search()}} onChange={this.handleChange} />
    // {
    //     button
    // }

    componentWillReceiveProps(nextProps) {
        if (nextProps.text !== this.props.text)
            this.state.text = nextProps.text;
        this.forceUpdate();
    }

    componentDidMount() {
        this.state.text = this.props.text;
        this.update_search_text = this.props.update_search_text;
        this.onclick = this.props.onclick_search;
    }

    handleChange(e) {
        this.setState({text : e.target.value});
        this.update_search_text(e.target.value);
    }

    onclick_search(e) {
        this.update_search_text(this.state.text);
        this.onclick();
    }



}

export default SearchUI;
