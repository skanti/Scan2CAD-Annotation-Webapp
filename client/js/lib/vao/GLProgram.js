
class GLProgram {

    static init_webgl(canvas) {
        var gl = null;

        // Try to grab the standard context. If it fails, fallback to experimental.
        gl = canvas.getContext('webgl2');

        // If we don't have a GL context, give up now
        if (!gl) {
            alert('Unable to initialize WebGL. Your browser may not support it.');
        }

        return gl;
    }

    static compile_shaders_and_link_with_program(gl, src_vs, src_fs) {
        var vertex_shader = GLProgram.compile_shader(gl, src_vs, gl.VERTEX_SHADER);
        var fragment_shader = GLProgram.compile_shader(gl, src_fs, gl.FRAGMENT_SHADER);

        // Create the shader program

        var program = gl.createProgram();
        gl.attachShader(program, vertex_shader);
        gl.attachShader(program, fragment_shader);
        gl.linkProgram(program);

        // If creating the shader program failed, alert

        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            console.log('Unable to initialize the shader program: ' + gl.getProgramInfoLog(program));
        }

        return program;
    }

    static compile_shader(gl, src, type) {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, src);

        // Compile the shader program
        gl.compileShader(shader);

        // See if it compiled successfully
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.log('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
            gl.deleteShader(shader);
            return null;
        }

        return shader;
    }
}

export default GLProgram;