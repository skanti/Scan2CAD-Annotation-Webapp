import React from "react";
import ReactTable from 'react-table'


class TableUI extends React.Component {
    constructor(props) {
        super(props);
        this.state = {sort_order : 1, message : {}, show_filter : 0, show_filter_name : ""};
    }

    render() {
        let tables = this.make_row();
        return (
            <div>
                <div className="row">
                    <div className="container-fluid" style={{margin:"1vh"}}>
                        <button className="btn btn-light btn-lg" style={{marginRight:"0.5vw", cursor:"default"}}> <b> Statistics: </b> </button>
                        <button className="btn btn-light btn-lg" style={{marginRight:"0.5vw", cursor:"default"}}> # Unique Scenes <b> {this.props.statistics.n_scans} </b> </button>
                        <button className="btn btn-light btn-lg" style={{marginRight:"0.5vw", cursor:"default"}}> # Annotations <b> {this.props.statistics.n_annotations} (duplic. {this.props.statistics.n_duplicates})</b> </button>
                        <button className="btn btn-light btn-lg" style={{marginRight:"0.5vw", cursor:"default"}}> # Objects <b> {this.props.statistics.n_models} (unique {this.props.statistics.n_unique_models})</b> </button>
                        <button className="btn btn-light btn-lg" style={{marginRight:"0.5vw", cursor:"default"}}> # Keypoints <b> {this.props.statistics.n_keypoints} </b> </button>
                    </div>
                </div>

                <div className="row">
                    <div className="container-fluid" style={{margin:"1vh"}}>
                        <div className="btn-group btn-group-toggle" data-toggle="buttons">
                            <label className="btn btn-primary active" onClick={e => this.setState({show_filter : 0})}>
                                <input type="radio" name="options" id="option3" autoComplete="off"  /> Show all
                            </label>
                            <label className="btn btn-primary" onClick={e => this.setState({show_filter : 1})}>
                                <input type="radio" name="options" id="option3" autoComplete="off"  /> Show Unannotated only  <b> {this.props.statistics.checked["4"]} </b>
                            </label>
                            <label className="btn btn-warning" onClick={e => this.setState({show_filter : 2})}>
                                <input type="radio" name="options" id="option4" autoComplete="off"  /> Show Verification only <b> {this.props.statistics.checked["0"]} </b>
                            </label>
                            <label className="btn btn-danger" onClick={e => this.setState({show_filter : 3})}>
                                <input type="radio" name="options" id="option5" autoComplete="off"  /> Show Re-Annotation only <b> {this.props.statistics.checked["1"]} </b>
                            </label>
                            <label className="btn btn-success" onClick={e => this.setState({show_filter : 4})}>
                                <input type="radio" name="options" id="option6" autoComplete="off"  /> Show Finished only <b> {this.props.statistics.checked["2"]} </b>
                            </label>
                            <label className="btn btn-dark" onClick={e => this.setState({show_filter : 5})}>
                                <input type="radio" name="options" id="option6" autoComplete="off"  /> Show Ignore only <b> {this.props.statistics.checked["3"]} </b>
                            </label>
                        </div>
                    </div>
                </div>


                <div className="row">
					<div className="container-fluid" style={{margin:"1vh"}}>
						<table style={{"border" : "1px solid black"}}>
							<tbody>
								<tr style={{"border" : "1px solid black"}}>
									<th style={{"border" : "1px solid black"}}> User </th>
									<th style={{"border" : "1px solid black"}}> # Scenes </th>
									<th style={{"border" : "1px solid black"}}> # Objects </th>
									<th style={{"border" : "1px solid black"}}> Δ Objects (last week)  </th>
									<th style={{"border" : "1px solid black"}}> # Keypoints </th>
								</tr>
								{this.make_user_stats()}
							</tbody>
						</table>
					</div>
				</div>

                <div className="row">
                    <div className="container-fluid" style={{margin:"1vh"}}>
                        <div className="btn-group btn-group-toggle" data-toggle="buttons">
                            <label className="btn btn-secondary btn-sm" onClick={e => this.onclick_sort(0)}>
                                <input type="radio" name="options" id="option1" autoComplete="off" checked onChange={e => null} /> Sort newest
                            </label>
                            <label className="btn btn-secondary active btn-sm" onClick={e => this.onclick_sort(1)}>
                                <input type="radio" name="options" id="option2" autoComplete="off"  /> Sort alphabetical
                            </label>
                            <label className="btn btn-secondary btn-sm" onClick={e => this.onclick_sort(2)}>
                                <input type="radio" name="options" id="option2" autoComplete="off"  /> Sort by #Objects
                            </label>
                        </div>
                    </div>
                </div>


                {tables.map((x, i) => {
                    return x;
                })}
            </div>
        );
    }

	make_user_stats() {
		let stats0 = this.props.statistics.stats_user;
		let stats1 = this.props.statistics.stats_user_last_week;
		let stats = Object.keys(stats0).map(key => {
			  return [key, stats0[key], stats1[key]];
		});
		stats.sort((x, y) => {return x[1].n_objs > y[1].n_objs ? -1 : 1;} );
		return stats.map((x, index) => {
			return (
					<tr key={x[0]}>
					<td > <a href="#" onClick={e => this.setState({show_filter : 9, show_filter_name : x[0]})} > {x[0]} </a> </td>
					<td style={{textAlign:"right"}} >{x[1].n_scans} (<font color="#f4c842"> {x[1].n_scans_needverification} </font> / <font color="red"> {x[1].n_scans_needreannotation} </font> / <font color="green"> {x[1].n_scans_finished} </font>)</td>
					<td style={{textAlign:"right"}} >{x[1].n_objs}</td>
					<td style={{textAlign:"right"}} >{x[2].n_objs}</td>
					<td style={{textAlign:"right"}} >{x[1].n_kps}</td>
					</tr>
			)
		})

	}

    onclick_sort(order) {
        if (order !== this.state.sort_order) {
            this.props.onclick_sort(order);
            this.setState({sort_order : order});
        }
    }

    query_checked(tiles, val) {
        let ok = false;
        for (let i in tiles) {
            if (tiles[i].checked === val.toString())
                return true;
        }
        return ok;
    }

    show_filter(key, i_set) {
        let filter_passed = false;

        let tiles = this.props.data[key].annotations;
        if (this.state.show_filter == 0) {
            filter_passed = true;
        } else if (this.state.show_filter == 1) {
            filter_passed = tiles === undefined;
        } else if (this.state.show_filter == 2) {
            filter_passed = this.query_checked(tiles, 0);
        } else if (this.state.show_filter == 3) {
            filter_passed = this.query_checked(tiles, 1);
        } else if (this.state.show_filter == 4) {
            filter_passed = this.query_checked(tiles, 2);
        } else if (this.state.show_filter == 5) {
            filter_passed = this.query_checked(tiles, 3);
        } else if (this.state.show_filter == 9) {
            if (this.props.data[key].annotations !== undefined)
                filter_passed = this.props.data[key].annotations[0].id_user === this.state.show_filter_name;
        }
        return filter_passed;
    }

    make_row() {
        let row = [];
        for (let key in this.props.data) {
            let id_scan = this.props.data[key].id;
            let i_set = this.props.data[key].i_set;

            let image_path = "/Scan2CAD/download/scan/thumbnail/" + id_scan;

            let filter_passed = this.show_filter(key, i_set);

            if (filter_passed == true) {
                row.push(<div className="row" key={"row" + key} style={{marginBottom: "1vh", border:"1px solid #dbe8ff"}}>
                        <div className="col-2" style={{textAlign:"center"}}>
                            <div> <b> {key} </b> </div>
                            <a href={"/Scan2CAD/new/" + id_scan}>
                            <img className="img-fluid" src={image_path} style={{cursor:"pointer"}}/>
                            </a>
                            <div> <small>{id_scan} </small> </div>
                        </div>
                        <div className="col-9">
                            {this.make_results(key)}
                        </div>
                    </div>
                );
            }
        }
        return row;
    }


    make_results(key) {
        const id_user = this.props.data[key].id_user;
        const id_scan = this.props.data[key].id;
        const annotations = this.props.data[key].annotations;
        if (annotations === undefined)
            return (<div> No alignments made</div>)
        else {
            let cols = [];
            for (let key0 in annotations) {
                let alignment_result = annotations[key0];
                const id_keypointalignment =  this.props.data[key].annotations[key0].id_annotation;
				const checked = this.props.data[key].annotations[key0].checked;

                let color_checked =  "primary";
                let status =  "";
				if (checked == "0") {
					color_checked = "warning";
					status = "Need Verification";
				} else if (checked == "1") {
					color_checked = "danger";
                    status = "Need Re-Annotation";
				} else if (checked == "2") {
					color_checked = "success";
                    status = "Final";
				} else if (checked == "3") {
					color_checked = "dark";
                    status = "Ignore";
                }

                const date_local = (new Date(alignment_result.date)).toLocaleString();
                const messages =  {verification : this.props.data[key].annotations[key0].message_verification, annotation : this.props.data[key].annotations[key0].message_annotation};

                cols.push(
                    <div className={"card text-white bg-" +  color_checked + " mb-3"} style={{display: "inline-block", margin:"1vw", width :"350px"}} key={key + "alignment_result" + key0}>
                        <div className="card-header">#OBJ <b>{alignment_result.n_aligned_models}</b>  #KP <b> {alignment_result.n_total_keypoints} </b></div>
                        <div className="card-body" style={{display: "inline-block"}}>
                            <div className="card-subtitle"> ID: <b> {id_keypointalignment}</b> </div>
                            <div className="card-subtitle"> User: <b> {alignment_result.id_user}</b> </div>
                            <div className="card-subtitle"> Status: <b> {status} </b> </div>
                            <div className="card-subtitle"> Timestamp: <b> {date_local} </b> </div>
                            <a role ="button" className="btn btn-secondary" style={{marginRight:"0.5vw", cursor:"pointer"}} href={"/Scan2CAD/viewer/" + id_keypointalignment}> <i className="fas fa-search"></i> </a>
                            <a role ="button" className="btn btn-secondary" style={{marginRight:"0.5vw", cursor:"pointer"}} href={"/Scan2CAD/edit/" + id_keypointalignment}> <i className="fas fa-pencil-alt"></i> </a>
                            <button className="btn btn-secondary" style={{cursor:"pointer"}} data-toggle="confirmation" onClick={this.props.onclick_remove.bind(null, id_keypointalignment)}> <i className="fas fa-trash-alt"></i>  </button>
                            <div style={{marginTop : "0.5vh"}}>
                            <label> <font color="black"> Message Verification</font> </label> <br />
                            <label style={{marginLeft:"5px"}}> <b> <font color="black"> {messages.verification} </font> </b> </label> <br />
                            <label> <font color="black"> Message Annotation</font> </label> <br />
                            <label style={{marginLeft:"5px"}}> <b> <font color="black"> {messages.annotation} </font> </b> </label> <br />
                            </div>
                        </div>
                    </div>
                );
            }
            return cols;

        }
    }


}


export default TableUI;
