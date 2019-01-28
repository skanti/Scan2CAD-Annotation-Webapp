import React from 'react';

class RootUI extends React.Component {

    render() {
        return (
            <div style={{marginTop : "10px"}}>
                <div id="id_panel_div" style={{width: "80%", height: "90vh"}}>
                    <canvas id="id_canvas_div" style={{width:"100%", height: "100%"}}/>
                </div>
                <div style={{position:"absolute", left:"0px", top:"0px", margin:"2vh", pointerEvents: "none"}}>
                    <div id="id_div_verification" style={{display:"inline-block", verticalAlign: "top", pointerEvents: "all"}}/>
                    <div id="id_div_options" style={{display:"inline-block", verticalAlign: "top", pointerEvents: "all"}}/>
                </div>
            </div>

        );
    }



}

export default RootUI;
