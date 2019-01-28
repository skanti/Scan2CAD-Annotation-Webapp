export const TextureVS = `#version 300 es
            precision mediump float;

            layout (location = 0) in vec2 position;
            layout (location = 1) in vec2 uv;

            out vec2 uv_vs;

            uniform mat4 model_matrix;

            void main() {
                gl_Position = model_matrix*vec4(position, 0, 1.0);
                uv_vs = uv;
            }`;

export const TextureFS = `#version 300 es
            precision mediump float;

            in vec2 uv_vs;

            out vec4 frag_color;

            uniform sampler2D tex;

            void main() {
                frag_color = texture(tex, vec2(uv_vs.x*2.0, 1.0) - uv_vs);
            }`;
