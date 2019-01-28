import React from 'react';
import ReactDOM from 'react-dom';

import TableUI from './view/TableUI';
import csvparse from 'csv-parse';

class Scan2CADMenu {

    init() {
        let annotations = null;
        let scans = null;

        // -> load data
        let async0 = xhr_json("GET", "db/scan/all").then( res => {
            this.scans = res.filter(x => {return x;});
        });
        let async1 = xhr_json("GET", "db/annotations/all").then( res => {
            this.annotations = res;
        });
        // <-

        Promise.all([async0, async1]).then( res => {
            this.statistics = this.extract_statistics(this.annotations, this.scans.length);
            this.merge_data(this.scans, this.annotations);
			// this.mark_train_val_test_set(this.scans, trainset, valset, testset)
            this.create_table_view(this.scans);
        });
		// <-
	}


    compare_dates(a,b) {
        let time_min_a = 0;
        let time_min_b = 0;
        for (let key in a.annotations)
            time_min_a = new Date(a.annotations[key].date) > time_min_a ?  new Date(a.annotations[key].date) : time_min_a;

        for (let key in b.annotations)
            time_min_b = new Date(b.annotations[key].date) > time_min_b ?  new Date(b.annotations[key].date) : time_min_b;

        let is_a_newer = time_min_a > time_min_b ? -1 : 1;
        return is_a_newer;
    }

    compare_names(a,b) {
        return a.id < b.id ? -1 : 1;
    }

    compare_progress(a,b) {
        let min_a = 0;
        let min_b = 0;
        for (let key in a.annotations) {
            min_a = a.annotations[key].checked;
            break;
        }
        for (let key in b.annotations) {
            min_b = b.annotations[key].checked;
            break;
        }

        return min_a > min_b ? -1 : 1;
    }

    compare_object_count(a,b) {
        let min_a = 0;
        let min_b = 0;
        for (let key in a.annotations) {
            min_a = a.annotations[key].aligned_models.length;
            break;
        }
        for (let key in b.annotations) {
            min_b = b.annotations[key].aligned_models.length;
            break;
        }

        return min_a > min_b ? -1 : 1;
    }


    onclick_sort(sort_order) {
        if (sort_order == 0)
            this.scans.sort(this.compare_dates);
        else if (sort_order == 1)
            this.scans.sort(this.compare_names);
        else if (sort_order == 2)
            this.scans.sort(this.compare_object_count);
    }

    merge_data(scans, annotations) {
        for (let key in annotations) {
            let id_annotation = annotations[key]["_id"];
            let res0 = annotations[key]["data"];
            let res = res0[res0.length - 1];
            res.id_annotation = id_annotation;
            let key_scans = res.id_scan;

            let found = scans.find(x => {return x.id === key_scans});
            if (found.annotations === undefined) {
                found.annotations = [];
            }
            found.annotations.push(res);
        }
    }

    extract_statistics(annotations, n_scans_scans) {
        const date_now = (new Date()).getTime();

        // -> helper functions
        let func_count_kps = function(aligned_models) {
            let counter = 0;
            for (let key1 in aligned_models) {
                counter += aligned_models[key1].keypoint0.n_keypoints;
            }
            return counter;
        }

        let func_count_objs = function(aligned_models) {
            return aligned_models.length;
        }
        // <-

        let statistics = {n_annotationss: 0 , n_keypoints : 0, n_models : 0, n_scans : 0, n_duplicates : 0, n_unique_models : 0};
        let checked = {"0" : 0, "1" : 0, "2" : 0, "3" : 0, "4" : 0};
		let stats_user = {}
		let stats_user_last_week = {}
        let uniquescans2counter = {};
        let uniqueobj2counter = {};
        for (let key in annotations) {
            for (let i_edit in annotations[key]["data"]) {
                let res = annotations[key]["data"][i_edit];
                let res_prev = annotations[key]["data"][i_edit - 1];

                // -> create user if user not recorded
    			if (!(res.id_user in stats_user)) {
    				stats_user[res.id_user] = {n_scans : 0, n_scans_needverification : 0, n_scans_needreannotation : 0, n_scans_finished : 0, n_objs : 0, n_kps : 0};
    				stats_user_last_week[res.id_user] = {n_scans : 0, n_objs : 0, n_kps : 0};
                }
                // <-

                for (let key1 in res.aligned_models) {
                    uniqueobj2counter[res.aligned_models[key1].catid_cad + "_" + res.aligned_models[key1].id_cad] = 1
                }



                let n_objs_prev = 0;
                let n_kps_prev = 0;
                if (res_prev) {
                    n_objs_prev = func_count_objs(res_prev.aligned_models);
                    n_kps_prev = func_count_kps(res_prev.aligned_models);
                }

                let n_objs = func_count_objs(res.aligned_models) - n_objs_prev;
                let n_kps = func_count_kps(res.aligned_models) - n_kps_prev;

    			stats_user[res.id_user].n_objs += n_objs;
    			stats_user[res.id_user].n_kps += n_kps;

                let delta_date = date_now - (new Date(res.date)).getTime();
                delta_date = Math.ceil(delta_date / (1000.0 * 3600.0 * 24.0))
                if (delta_date <= 7 ) {
                    stats_user_last_week[res.id_user].n_scans += 1;
                    stats_user_last_week[res.id_user].n_objs += n_objs;
                    stats_user_last_week[res.id_user].n_kps += n_kps;
                }

                res.n_total_keypoints = func_count_kps(res.aligned_models);
                statistics.n_models += n_objs;
                statistics.n_keypoints += n_kps;
            }

            let last_res = annotations[key]["data"][annotations[key]["data"].length - 1]

            uniquescans2counter[last_res.id_scan] = 1;


            stats_user[last_res.id_user].n_scans += 1;
            if (last_res.checked === "0")
                stats_user[last_res.id_user].n_scans_needverification += 1;
            else if (last_res.checked === "1")
                stats_user[last_res.id_user].n_scans_needreannotation += 1;
            else if (last_res.checked === "2")
                stats_user[last_res.id_user].n_scans_finished += 1;


            checked[last_res.checked] += 1;

        }

        statistics.n_annotationss = annotations.length;
        statistics.n_scans = Object.keys(uniquescans2counter).length;
        statistics.n_duplicates = statistics.n_annotationss - statistics.n_scans;
        statistics.n_unique_models = Object.keys(uniqueobj2counter).length;
		statistics.stats_user = stats_user;
		statistics.stats_user_last_week = stats_user_last_week;
        statistics.checked = checked;
        statistics.checked["4"] = n_scans_scans - statistics.n_annotationss + statistics.n_duplicates;
        return statistics;
    }

    create_table_view(data) {
        ReactDOM.render(
           <TableUI data={data} statistics={this.statistics}
            onclick_sort={this.onclick_sort.bind(this)}
            onclick_new={this.onclick_new.bind(this)} onclick_view={this.onclick_view.bind(this)} onclick_edit={this.onclick_edit.bind(this)} onclick_remove={this.onclick_remove.bind(this)}
            />,
           document.getElementById('id_gallery_div'));
    }


    onclick_new(id_scan) {
        window.location.assign("/Scan2CAD/new/" + id_scan + "/" + this.id_user);
        // window.location.assign("/Scan2CAD/menu");
    }


    onclick_view(id_annotation) {
        window.open("/Scan2CAD/viewer/" + id_annotation, "_blank");
    }

    onclick_edit(id_annotation) {
        window.location.assign("/Scan2CAD/edit/" + id_annotation);
    }

    onclick_remove(id_annotation) {
        xhr("DELETE", "/db/annotations/" + id_annotation).then(res => window.location.assign("/Scan2CAD/menu/"));
    }



}

window.Scan2CADMenu = Scan2CADMenu;
