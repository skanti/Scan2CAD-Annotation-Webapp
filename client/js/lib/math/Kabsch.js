import numeric from 'numeric';
import CMAES from "./CMAES";

// Calculate the transformation matrix from A to B.
function kabsch(pa, pb) {
    // -> translation
    let cA = calc_centroid(pa);
    let cB = calc_centroid(pb);
    // diff(pa, pb);

    recenter(pa, cA);
    recenter(pb, cB);
    // diff(pA, pb);
    // <-

	let pa0 = JSON.parse(JSON.stringify(pa));
	let pb0 = JSON.parse(JSON.stringify(pb));
    pa = [].concat.apply([], pa);
    pb = [].concat.apply([], pb);

    let condition_number = calc_condition_number(pa0, pb0);
    console.log("cn", condition_number)

    if (condition_number >= 1e3)
        return null;

    let cmaes = new CMAES();
    let res = cmaes.minimize(pa, pb);
    let cost = res.get(res.size() - 1)
    console.log("cost cma-es", cost)
    let params = []
    for (let i = 0; i < res.size() - 1; i++)
        params.push(res.get(i))

    var quat = new THREE.Quaternion(params[0], params[1], params[2], params[3]);
	quat = quat.normalize();

    let translation_matrix = 0; //make_translation_matrix(trans);
    let rotation_matrix = new THREE.Matrix4();
    rotation_matrix.makeRotationFromQuaternion(quat);
	let scale = [params[4], params[5], params[6]];
    let scale_matrix = new THREE.Matrix4();
    scale_matrix.makeScale(params[4], params[5], params[6]);

	let rot3 = three2array((new THREE.Matrix3()).setFromMatrix4(rotation_matrix))

	//scale_mat(pa0, scale);
	//rot_mat(pa0, rot3);
	//diff(pa0, pb0)


    return {translation_matrix : translation_matrix, rotation_matrix : rotation_matrix, scale_matrix : scale_matrix, cA : cA, cB : cB};
}


function kabsch0(pA, pB) {
    // -> translation
    let cA = calc_centroid(pA);
    let cB = calc_centroid(pB);
    // diff(pA, pB);

    recenter(pA, cA);
    recenter(pB, cB);
    // diff(pA, pB);
    // <-

    // -> rotation and scale
    let Atmp1 = JSON.parse(JSON.stringify(pA));
    let Btmp = JSON.parse(JSON.stringify(pB));

    let sBtmp = calc_uniform_scale(Btmp);
    scale_mat(Btmp, sBtmp);
    let rot = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
    let scale = [1, 1, 1];
    for (let i = 0; i < 10; i++) {

        let pAnorm = JSON.parse(JSON.stringify(Atmp1));
        let sAnorm = calc_uniform_scale(pAnorm);
        scale_mat(pAnorm, sAnorm);

        let rot1 = calc_rotation(pAnorm, Btmp);
        rot_mat(pAnorm, rot1);
        rot = numeric.dot(rot1, rot);

        rot_mat(Atmp1, rot1);

        let sA1 = calc_scale(Atmp1);
        let sB = calc_scale(pB);
        let scale1 = make_scale(sA1, sB);
        scale_mat(Atmp1, scale1);
        scale[0] *= scale1[0]; scale[1] *= scale1[1]; scale[2] *= scale1[2];

        // diff(Atmp1, pB);
    }
    rot_mat(pA, rot);
    scale_mat(pA, scale);

    diff(pA, pB);

    let translation_matrix = 0; //make_translation_matrix(trans);
    let rotation_matrix = make_rotation_matrix(rot);
    let scale_matrix = make_scale_matrix(scale);


    return {translation_matrix : translation_matrix, rotation_matrix : rotation_matrix, scale_matrix : scale_matrix, cA : cA, cB : cB};
}

function three2array(a0) {
	let a = a0.transpose().toArray()
	let b = [];
	while(a.length) b.push(a.splice(0,3));
	return b;
}

function calc_world_pos(p, trs) {
    let position = []
    for (let i = 0; i < p.length; i++) {
        let p1= new THREE.Vector3();
        p1.x = p[i][0];
        p1.y = p[i][1];
        p1.z = p[i][2];

        p1.applyMatrix4(trs);

        position.push([p1.x, p1.y, p1.z]);
    }
    return position;
}

function make_scale(sA, sB) {
    if (sA[0] === 0 || sB[0] === 0) {
        sA[0] = 1;
        sB[0] = 1;
    }

    if (sA[1] === 0 || sB[1] === 0) {
        sA[1] = 1;
        sB[1] = 1;
    }

    if (sA[2] === 0 || sB[2] === 0) {
        sA[2] = 1;
        sB[2] = 1;
    }

    let scale = [sB[0]/sA[0], sB[1]/sA[1], sB[2]/sA[2]];
    return scale;
}

function diff(A, B) {
    let n = A.length;
    let d = 0;
    for (let i = 0; i < n; i++) {
        d += (A[i][0] - B[i][0])*(A[i][0] - B[i][0]);
        d += (A[i][1] - B[i][1])*(A[i][1] - B[i][1]);
        d += (A[i][2] - B[i][2])*(A[i][2] - B[i][2]);
    }

    //d = Math.sqrt(d/n);
    console.log("cost", d)
}

function translate_A(A, trans) {
    let n = A.length;
    for (let i = 0; i < n; i++) {
        A[i][0] += trans[0];
        A[i][1] += trans[1];
        A[i][2] += trans[2];
    }
}

function rot_mat(A, rot) {
    let n = A.length;
    for (let i = 0; i < n; i++) {
        let a = numeric.dot(rot, A[i]);
        A[i][0] = a[0];
        A[i][1] = a[1];
        A[i][2] = a[2];
    }
}

function filter_scale(scale) {
    if (scale[0] === 0) {
        scale[0] = 1;
    }

    if (scale[1] === 0) {
        scale[1] = 1;
    }

    if (scale[2] === 0) {
        scale[2] = 1;
    }
}

function scale_mat(A, scale) {

    let n = A.length;
    for (let i = 0; i < n; i++) {
        A[i][0] *= scale[0];
        A[i][1] *= scale[1];
        A[i][2] *= scale[2];
    }
}

function recenter(A, c) {
    let n = A.length;
    for (let i = 0; i < n; i++) {
        A[i][0] -= c[0];
        A[i][1] -= c[1];
        A[i][2] -= c[2];
    }
}

function calc_scale(A) {
    let n = A.length;
    let s = [0, 0, 0];
    for (let i = 0; i < n; i++) {
        s[0] += A[i][0]*A[i][0];
        s[1] += A[i][1]*A[i][1];
        s[2] += A[i][2]*A[i][2];
    }

    s[0] /= n;
    s[1] /= n;
    s[2] /= n;

    const w = Math.sqrt(s[0] + s[1] + s[2]);

    s[0] = Math.sqrt(s[0]);
    s[1] = Math.sqrt(s[1]);
    s[2] = Math.sqrt(s[2]);

    s[0] = s[0] < 0.001 ? 1 : s[0];
    s[1] = s[1] < 0.001 ? 1 : s[1];
    s[2] = s[2] < 0.001 ? 1 : s[2];

    return s;
}

function calc_uniform_scale(A) {
    let n = A.length;
    let s = [0, 0, 0];
    for (let i = 0; i < n; i++) {
        s[0] += A[i][0]*A[i][0];
        s[1] += A[i][1]*A[i][1];
        s[2] += A[i][2]*A[i][2];
    }

    s[0] /= n;
    s[1] /= n;
    s[2] /= n;

    let w = 1.0/Math.sqrt(s[0] + s[1] + s[2]);
    return [w, w, w];
}

function calc_centroid(A) {
    let n = A.length;
    let c = [0, 0, 0];
    for (let i = 0; i < n; i++) {
        c[0] += A[i][0];
        c[1] += A[i][1];
        c[2] += A[i][2];
    }
    c[0] /= n;
    c[1] /= n;
    c[2] /= n;

    return c;
}

function calc_centroid2(A) {
    let min_x = Infinity;
    let min_y = Infinity;
    let min_z = Infinity;

    let max_x = -Infinity;
    let max_y = -Infinity;
    let max_z = -Infinity;

    let n = A.length;
    for (let i = 0; i < n; i++) {
        min_x = Math.min(min_x, A[i][0]);
        min_y = Math.min(min_y, A[i][1]);
        min_z = Math.min(min_z, A[i][2]);

        max_x = Math.max(max_x, A[i][0]);
        max_y = Math.max(max_y, A[i][1]);
        max_z = Math.max(max_z, A[i][2]);
    }


    let cx = (min_x + max_x)/2.0;
    let cy = (min_y + max_y)/2.0;
    let cz = (min_z + max_z)/2.0;

    let c = [cx, cy, cz];
    return c;
}

function calc_condition_number(A, B) {
    let B_t = numeric.transpose(B);
    let Cov = numeric.dot(B_t, A);
    let USV = numeric.svd(Cov);
    return USV.S[0]/USV.S[2];
}

function calc_rotation(A, B) {
    let B_t = numeric.transpose(B);
    let Cov = numeric.dot(B_t, A);
    let USV = numeric.svd(Cov);
    let UVt = numeric.dot(USV.U, numeric.transpose(USV.V));
    let det = numeric.det(UVt);
    let E = numeric.diag([1, 1, Math.sign(det)]);
    let R = numeric.dot(USV.U, E);
    R = numeric.dot(R, numeric.transpose(USV.V));
    // let R_t = numeric.transpose(R);
    return R;
}

function make_scale_matrix(scale0) {
    let scale = new THREE.Matrix4();
    scale.makeScale(scale0[0], scale0[1], scale0[2]);
   return scale;
}

function make_rotation_matrix(rot0) {
    let rot = new THREE.Matrix4();
    rot.set(rot0[0][0], rot0[0][1], rot0[0][2], 0,
            rot0[1][0], rot0[1][1], rot0[1][2], 0,
            rot0[2][0], rot0[2][1], rot0[2][2], 0,
                   0,        0,        0, 1);
   return rot;
}

function make_translation_matrix(trans0) {
    let trans = new THREE.Matrix4();
    trans.makeTranslation(trans0[0], trans0[1], trans0[2]);
   return trans;
}

export default kabsch;
