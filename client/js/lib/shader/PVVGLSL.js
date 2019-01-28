export const PVVVS = `#version 300 es
            precision lowp float;

            layout(location = 0) in vec3 position;
            layout(location = 1) in int label;

            flat out int frag_color_vs;

            uniform mat4 model_matrix;
            uniform mat4 view_matrix;
            uniform mat4 projection_matrix;

            void main() {
                frag_color_vs = label;
                gl_Position = projection_matrix*view_matrix*model_matrix*vec4(position, 1.0);

            }`;

export const PVVFS = `#version 300 es
            precision lowp float;

            flat in int frag_color_vs;

            layout(location = 0) out vec4 color;
            layout(location = 1) out vec4 depth;

            float near = 2.0;
            float far = 100.0;

            void main() {
                int r = (frag_color_vs & 0x000000FF) >> 0;
                int g = (frag_color_vs & 0x0000FF00) >> 8;
                int b = (frag_color_vs & 0x00FF0000) >> 16;
                int a = (frag_color_vs & 0xFF000000) >> 24;
                color = vec4(float(r)/255.0, float(g)/255.0, float(b)/255.0, 1.0);

                // float z_ndc = 2.0*gl_FragCoord.z - 1.0;
                // float z_linear = 2.0*near*far/(far + near - z_ndc*(far - near))/(far - near);


                int z_linear_int = int(gl_FragCoord.z *float(1 << 24));
                int r1 = (z_linear_int & 0x000000FF) >> 0;
                int g1 = (z_linear_int & 0x0000FF00) >> 8;
                int b1 = (z_linear_int & 0x00FF0000) >> 16;
                depth = vec4(float(r1)/255.0, float(g1)/255.0, float(b1)/255.0, 1.0);
            }`;
