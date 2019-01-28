import React from 'react';

class SplashScreenUI extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        // <div className="carousel-item ">
        //     <img src="/hello.gif" style={{width:"100%"}}/>
        // </div>

        if (!this.props.is_visible) {
            return null;
        } else {
            const pos = this.props.pos;
            // const carousel = this.make_carousel();
            return (
            <div id="myCarousel" className="carousel slide" data-ride="carousel" data-interval="false"  style={{backgroundColor:"#DBDBDB", width:"100vw", height:"100vh"}}>
              <ol className="carousel-indicators">
                <li data-target="#myCarousel" data-slide-to="0" className="active"></li>
                <li data-target="#myCarousel" data-slide-to="1"></li>
                <li data-target="#myCarousel" data-slide-to="2"></li>
                <li data-target="#myCarousel" data-slide-to="3"></li>
                <li data-target="#myCarousel" data-slide-to="4"></li>
              </ol>
              <div className="carousel-inner" style={{height:"100%"}}>

                      <button className="btn btn-success" style={{position:"absolute", top:"90%", left:"80%",  cursor: "pointer",
                          fontSize:"1.2vw", transform: "translate(-50%, -50%)"}} onClick={this.props.onclick_ok} >
                          OK
                      </button>
                <div className="carousel-item active">
                <div style={{margin:"1.5vw", fontSize:"1vw"}}>
                      <p> <b> Part 2: </b> </p>
                      <p>In the left window you will see the virtual objects you have selected and placed.  In the right you will see the real objects.  Click on a virtual object and then one-by-one click on a point on the virtual object and on the real object.  Select pairs of points that best match between the two (the virtual and real objects may look different but do your best to select corresponding points).  Think of what pairs of points another person might choose to show you when you ask them: "show me the same point on the real and on the virtual object". Click done at the top, and then click on another virtual object until you are done with all objects.  The following video shows an example.</p>

                      </div>

                      <div style={{margin:"1vw", fontSize:"1vw", textAlign:"center"}}>
                          <b> Part 2 (Tutorial): </b>
                      </div>

                      <div className="container-fluid" style={{textAlign:"center", width:"100%", display:"inline-block"}}>
                          <video controls loop style={{width:"50%", height:"50%"}} >
                            <source src="/tutorial/tutorial_keypoint.mp4" type="video/mp4"/>
                          </video>
                      </div>
                </div>



                <div className="carousel-item " style={{textAlign:"center"}}>
                    <div style={{margin:"1vw", fontSize:"1vw"}}>
                        <b> Part 2 (Do's and Dont's): </b>
                    </div>
                    <img src="/dosdonts/dosdonts0.png" style={{width:"60%"}}/>
                </div>

                <div className="carousel-item " style={{textAlign:"center"}}>
                    <div style={{margin:"1vw", fontSize:"1vw"}}>
                        <b> Part 2 (Do's and Dont's): </b>
                    </div>
                    <img src="/dosdonts/dosdonts1.png" style={{width:"60%"}}/>
                </div>

                <div className="carousel-item " style={{textAlign:"center"}}>
                    <div style={{margin:"1vw", fontSize:"1vw"}}>
                        <b> Part 2 (Do's and Dont's): </b>
                    </div>
                    <img src="/dosdonts/dosdonts2.png" style={{width:"60%"}}/>
                </div>

                <div className="carousel-item " style={{textAlign:"center"}}>
                    <div style={{margin:"1vw", fontSize:"1vw"}}>
                        <b> Part 2 (Do's and Dont's): </b>
                    </div>
                    <img src="/dosdonts/dosdonts3.png" style={{width:"60%"}}/>
                </div>

              </div>

              <a className="carousel-control-prev" href="#myCarousel" role="button" data-slide="prev">
                <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                <span className="sr-only">Previous</span>
              </a>

              <a className="carousel-control-next" href="#myCarousel" role="button" data-slide="next">
                <span className="carousel-control-next-icon" aria-hidden="true"></span>
                <span className="sr-only">Next</span>
              </a>

            </div>);
            // return (
            //         {carousel}
                    // <div>
                    //     <div className="button_gray" id="div_info" style={{position:"absolute", color:"black", border:"1px solid black", left:pos.x + "px", top:pos.y + "px",
                    //         width : "40vw", height:"30vw", lineHeight:"3vw",  fontSize:"1.2vw", outline: "none", cursor:"default", transform: "translate(-50%, -50%)"}} >
                    //         <div style={{margin:"2.5vw", textAlign:"left"}}>
                    //         <p>Task: </p>
                    //         The user has to identity various objects in the 3D scene and find the corresponding model from the gallery. When a suitable model is found, it is brought into the 3D scene
                    //         and the user adapts the size and orientation roughly for a good match.
                    //
                    //         </div>
                    //         <button className="button_green" style={{position:"absolute", border:"1px solid black", top:"100%", left:"50%",  cursor: "pointer",
                    //             lineHeight:"3vw",  fontSize:"1.2vw", transform: "translate(-100%, -50%)"}} onClick={(event) => {this.setState({visible : 0})}} >
                    //             OK
                    //         </button>
                    //     </div>
                    // </div>
            // );
        }
    }






}


export default SplashScreenUI;
