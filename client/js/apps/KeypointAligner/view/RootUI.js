import React from 'react';

class SearchUI extends React.Component {

    render() {
        if (this.props.is_visible)
            return (
                <div>
                    <div className="row">
                        <div className="col-6">
                                <div id="id_div_info0" style={{display:"inline-block", margin:"5px"}}/>
                        </div>

                        <div className="col-6">
                            <div id="id_div_keypoint_counter" style={{display:"inline-block", margin:"5px"}}/>
                            <div id="id_div_start_over"  style={{display:"inline-block", margin:"5px"}}/>
                            <div id="id_div_align_submit"  style={{display:"inline-block", margin:"5px"}}/>
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-6" style={{position:"relative"}}>
                            <div id="id_panel0_div" style={{width:"100%", height:"80vh"}}>
                                <canvas id="id_canvas0_div" style={{top:"0px", width:"100%", height:"100%"}}/>
                            </div>
                            <div id="id_keypoint_satellite0_div" style={{position:"absolute", top:"0px"}}/>
                        </div>

                        <div className="col-6" style={{position:"relative"}}>
                            <div id="id_panel1_div" style={{width:"100%", height:"80vh"}}>
                                <canvas id="id_canvas1_div" style={{top:"0px", width:"100%", height:"100%"}}/>
                            </div>

                            <div id="id_keypoint_satellite1_div" style={{position:"absolute", top:"0px"}}/>
                            <div id="id_start_over_satellite_div" style={{position:"absolute", top:"0px"}}/>
                        </div>

                        <div id="id_div_skip_submit" className="container-fluid" style={{marginTop:"5px"}}/>
                    </div>

                    <div id="id_div_splash_screen" style={{position:"absolute", left:"0", top:"0"}}/>
                </div>
            )
        else
            return null;
    }



}

export default SearchUI;
