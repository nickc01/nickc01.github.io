window.shaders = window.shaders || {};
window.shaders.backgroundVertexShader = `
//SHADER START
attribute vec3 position;

void main(void) {
    gl_Position = vec4(position, 1.0);
}
`;
