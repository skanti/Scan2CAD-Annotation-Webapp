export const PolygonVS = `#version 300 es
            precision mediump float;

            layout (location = 0) in vec3 vertex;

            out vec4 frag_color_vs;

            uniform vec4 color;

            uniform mat4 model_matrix;
            uniform mat4 view_matrix;
            uniform mat4 projection_matrix;

            void main() {
            	mat4 mvp_matrix = projection_matrix*view_matrix*model_matrix;
                gl_Position = mvp_matrix*vec4(vertex, 1.0);
                frag_color_vs = color;
            }`;

export const PolygonFS = `#version 300 es
            precision mediump float;
            in vec4 frag_color_vs;
            out vec4 frag_color;

            void main() {
                frag_color = frag_color_vs;
            }`;
