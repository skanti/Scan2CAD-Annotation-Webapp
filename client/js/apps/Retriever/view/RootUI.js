import React from 'react';

class SearchUI extends React.Component {

    render() {
        if (this.props.is_visible)
            return (
                <div>
                    <div className="row">
                        <div className="col-8">
                            <div className="d-flex justify-content-between">
                                <div className="d-flex justify-content-between">
                                    <div id="id_options_bar" style={{display:"inline-block", margin:"5px"}}/>
                                    <div id="id_div_keymap" style={{display:"inline-block", margin:"5px"}}/>
                                </div>
                                <div id="id_div_info" style={{width:"50%", display:"inline-block", margin:"5px"}}/>
                                <div id="id_div_object_counter" style={{display:"inline-block", margin:"5px"}}/>
                            </div>
                        </div>
                    </div>
                    <div id="id_div_undoredo"/>


                    <div className="row" style={{marginTop:"1vh"}}>
                        <div className="col-8" style={{position:"relative"}}>
                            <div id="id_panel_div" style={{width: "100%", height: "80vh"}}>
                                <canvas id="id_canvas_div" style={{width:"100%", height: "100%"}}/>
                            </div>
                            <div id="container_segment_label_satelite" style={{position:"absolute", left:"0px", top:"0px"}}/>
                            <div id="id_cad_satellite_div" style={{position:"absolute", left:"0px", top:"0px"}}/>
                            <div id="container_scale_rotation_slider" style={{position:"absolute", left:"0px", top:"0px"}}/>
                            <div id="container_ok_satelite" style={{position:"absolute", left:"0px", top:"0px"}}/>
                        </div>

                        <div className="col-4" style={{position:"relative"}}>
                            <div className="card">
                                <div id="id_search_div"/>
                                <div id="id_div_hotbuttons"/>
                                <div className="container-fluid" id="id_gallery_div" style={{width:"100%", height:"40vh", paddingTop: "5px", overflowY:"scroll"}}/>
                                <div className="container-fluid" id="id_pagination_div" style={{width:"100%", paddingTop: "20px"}}/>
                            </div>
                            <div id="id_div_skip_submit" style={{top:"0px"}}/>
                        </div>
                    </div>

                    <div id="id_div_splash_screen" style={{position:"absolute", left:"0px", top:"0px"}}/>
                </div>
            );
        else
            return null;
    }



}

export default SearchUI;
