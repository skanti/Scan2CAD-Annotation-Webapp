import numeric from 'numeric';


function pca(A) {
    recenter(A)
    let A_t = numeric.transpose(A);
    let Cov = numeric.dot(A_t, A);
    let res = numeric.eig(Cov);
    let eigvecs = res.E.x;
    return [eigvecs[0][0], eigvecs[1][0], eigvecs[2][0]];
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

function recenter(A) {
    const c = calc_centroid(A);

    let n = A.length;
    for (let i = 0; i < n; i++) {
        A[i][0] -= c[0];
        A[i][1] -= c[1];
        A[i][2] -= c[2];
    }
}


export default pca;
