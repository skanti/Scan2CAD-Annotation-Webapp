export const PhongVS = `#version 300 es
            precision mediump float;

            layout (location = 0) in vec3 position;
            layout (location = 1) in vec2 uv;
            layout (location = 2) in vec3 normal;
            layout (location = 3) in float id_part;
            layout (location = 4) in float id_texture;
            // layout(location = 5) in vec3 color_label;
            // layout(location = 6) in int label;

            out vec3 position_vs;
            out vec3 normal_vs;
            out vec2 uv_vs;
            flat out int id_texture_vs;
            flat out int id_part_vs;

            uniform mat4 model_matrix;
            uniform mat4 view_matrix;
            uniform mat4 projection_matrix;

            void main() {
                normal_vs = vec3(transpose(inverse(view_matrix*model_matrix))*vec4(normalize(normal), 1.0));
                position_vs = vec3(view_matrix*model_matrix*vec4(position, 1.0));
                uv_vs = uv;
                id_part_vs = int(id_part);
                id_texture_vs = int(id_texture);
                gl_Position = projection_matrix*view_matrix*model_matrix*vec4(position, 1.0);
            }`;

export const PhongFS = `#version 300 es
            precision mediump float;
            #define N_MAX_TEXTURES 10

            in vec3 position_vs;
            in vec3 normal_vs;
            in vec2 uv_vs;
            flat in int id_texture_vs;
            flat in int id_part_vs;

            const vec3 pos_light = vec3(0, 0, 0); // Light position in eye coords.
            const vec3 la = vec3(0.3);       // Ambient light intensity
            const vec3 ld = vec3(1.0);       // Diffuse light intensity
            const vec3 ls = vec3(0.2);       // Specular light intensity

            struct Material {
                vec3 ka;            // Ambient reflectivity
                vec3 kd;            // Diffuse reflectivity
                vec3 ks;            // Specular reflectivity
                float shininess;    // Specular shininess factor
            };

            uniform Material material[50];

            out vec4 frag_color;
            uniform sampler2D tex[N_MAX_TEXTURES];

            void main() {
                vec4 color;
                if (id_texture_vs == 0) {
                    color = texture(tex[0], vec2(uv_vs.x*2.0, 1.0) - uv_vs);
                } else if (id_texture_vs == 1) {
                    color = texture(tex[1], vec2(uv_vs.x*2.0, 1.0) - uv_vs);
                } else if (id_texture_vs == 2) {
                    color = texture(tex[2], vec2(uv_vs.x*2.0, 1.0) - uv_vs);
                } else if (id_texture_vs == 3) {
                    color = texture(tex[3], vec2(uv_vs.x*2.0, 1.0) - uv_vs);
                 } else if (id_texture_vs == 4) {
                    color = texture(tex[4], vec2(uv_vs.x*2.0, 1.0) - uv_vs);
                } else if (id_texture_vs == 5) {
                    color = texture(tex[5], vec2(uv_vs.x*2.0, 1.0) - uv_vs);
                } else if (id_texture_vs == 6) {
                    color = texture(tex[6], vec2(uv_vs.x*2.0, 1.0) - uv_vs);
                } else if (id_texture_vs == 7) {
                    color = texture(tex[7], vec2(uv_vs.x*2.0, 1.0) - uv_vs);
                } else if (id_texture_vs == 8) {
                    color = texture(tex[8], vec2(uv_vs.x*2.0, 1.0) - uv_vs);
                } else if (id_texture_vs == 9) {
                    color = texture(tex[9], vec2(uv_vs.x*2.0, 1.0) - uv_vs);
                } else if (id_texture_vs == -1) {
                    color = vec4(1.0);
                }


                vec3 normal1 = vec3(0);
                if (gl_FrontFacing)
                    normal1 = normalize(normal_vs);
                else
                    normal1 = normalize(-normal_vs);
                vec3 s = normalize(pos_light - position_vs);
                vec3 v = normalize(-position_vs);
                vec3 r = reflect(-s, normal1);

                float sDotN = max(dot(s, normal1), 0.0);
                vec3 ambient = la*material[id_part_vs].ka;
                vec3 diffuse = ld*material[id_part_vs].kd*sDotN;
                vec3 specular = vec3(0.0);
                if( sDotN > 0.0 )
                    specular = ls*material[id_part_vs].ks*pow(max(dot(r,v), 0.0), material[id_part_vs].shininess);

                frag_color = vec4( ambient + diffuse, 1 )*color + vec4( specular, 1 );

            }`;
