

export function make_cam_sphere(a) {

    let cam_sphere =  { vertices : new Float32Array(3*32*3),
                    elements: new Uint16Array(3*32*2),
                    n_vertices : 3*32,
                    n_elements: 3*32};

    let vertsx = get_x_vertices();
    let vertsy = get_y_vertices();
    let vertsz = get_z_vertices();

    cam_sphere.vertices.set(vertsx, 0*32*3);
    cam_sphere.vertices.set(vertsy, 1*32*3);
    cam_sphere.vertices.set(vertsz, 2*32*3);

    let elementsx = get_elements(0*32);
    let elementsy = get_elements(1*32);
    let elementsz = get_elements(2*32);

    cam_sphere.elements.set(elementsx, 0*32*2);
    cam_sphere.elements.set(elementsy, 1*32*2);
    cam_sphere.elements.set(elementsz, 2*32*2);

    return cam_sphere;
}

function get_x_vertices() {
    let vertices = [32*3];
    for (let i = 0; i < 32; i++) {
        let phi = 2*i/32*Math.PI;
        vertices[i*3 + 0] = Math.sin(phi);
        vertices[i*3 + 1] = Math.cos(phi);
        vertices[i*3 + 2] = 0;
    }
    return vertices;
}

function get_y_vertices() {
    let vertices = [32*3];
    for (let i = 0; i < 32; i++) {
        let phi = 2*i*Math.PI/32;
        vertices[i*3 + 0] = Math.sin(phi);
        vertices[i*3 + 1] = 0;
        vertices[i*3 + 2] = Math.cos(phi);
    }
    return vertices;
}


function get_z_vertices() {
    let vertices = [32*3];
    for (let i = 0; i < 32; i++) {
        let phi = 2*i*Math.PI/32;
        vertices[i*3 + 0] = 0;
        vertices[i*3 + 1] = Math.sin(phi);
        vertices[i*3 + 2] = Math.cos(phi);
    }
    return vertices;
}

function get_elements(n) {
    let elements = [32*2];
    for (let i = 0; i < 32; i++) {
        elements[i*2 + 0] = i%32 + n;
        elements[i*2 + 1] = (i + 1)%32 + n;
    }
    return elements;
}
