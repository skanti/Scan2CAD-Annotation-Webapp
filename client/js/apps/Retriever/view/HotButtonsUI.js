import React from 'react';

class HotButtonsUI extends React.Component {

    render() {
        if (this.props.is_visible)
            return (
                <div className="card" >
                <div className="card-body" style={{padding: "5px"}}>
                    <div className="card-title"> Quick Search Buttons: </div>
                    <button type="button" className="btn btn-outline-primary" style={{margin:"5px"}} onClick={e => this.onclick_search(e, "chair")}> Chair </button>
                    <button type="button" className="btn btn-outline-primary" style={{margin:"5px"}} onClick={e => this.onclick_search(e, "table")}> Table </button>
                    <button type="button" className="btn btn-outline-primary" style={{margin:"5px"}} onClick={e => this.onclick_search(e, "couch")}> Couch </button>
                    <button type="button" className="btn btn-outline-primary" style={{margin:"5px"}} onClick={e => this.onclick_search(e, "lamp")}> Lamp </button>
                    <button type="button" className="btn btn-outline-primary" style={{margin:"5px"}} onClick={e => this.onclick_search(e, "cabinet")}> Cabinet </button>
                    <button type="button" className="btn btn-outline-primary" style={{margin:"5px"}} onClick={e => this.onclick_search(e, "bed")}> Bed </button>
                    <button type="button" className="btn btn-outline-primary" style={{margin:"5px"}} onClick={e => this.onclick_search(e, "monitor")}> Monitor </button>
                    <button type="button" className="btn btn-outline-primary" style={{margin:"5px"}} onClick={e => this.onclick_search(e, "bathtub")}> Bathtub </button>
                    <button type="button" className="btn btn-outline-primary" style={{margin:"5px"}} onClick={e => this.onclick_search(e, "wastebin")}> Wastebin </button>
                    <button type="button" className="btn btn-outline-primary" style={{margin:"5px"}} onClick={e => this.onclick_search(e, "laptop")}> Laptop </button>
                    <button type="button" className="btn btn-outline-primary" style={{margin:"5px"}} onClick={e => this.onclick_search(e, "stove")}> Stove </button>
                    </div>
                </div>
            );
        else
            return null;
    }


    onclick_search(e, text) {
        this.props.update_search_text(text);

        this.props.onclick_search();
    }


}

export default HotButtonsUI;
