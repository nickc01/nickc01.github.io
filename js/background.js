// @ts-check

//This file contains the functionality for the background perlin noise effect

var background = {};

/** Whether or not the background is currently animated */
background.backgroundRunning = false;

/** The default top color of the perlin noise background */
background.defaultTopColor = [107 / 2, 157 / 2, 62 / 2, 255];

/** The default bottom color of the perlin noise background */
background.defaultBottomColor = [50 / 4, 90 / 4, 30 / 4, 255];


/** The default top color of the perlin noise background */
background.currentTopColor = background.defaultTopColor.slice();

/** The default bottom color of the perlin noise background */
background.currentBottomColor = background.defaultBottomColor.slice();

/** How much to darken the perlin noise background */
background.darkenAmount = 0.75;

/** How much to scale the perlin noise background */
background.scale = 750.0;

/** How fast the perlin noise background animates */
background.speed = 0.15;

/** How much scrolling parallax should be applied to the background */
background.parallaxAmount = 3.0;

/** The quality of the background between 0 and 1 */
background.qualty = 1;

/** Contains a list of uniform functions that can be used to set values of the perlin noise shader */
background.uniforms = {};

/** @type {HTMLCanvasElement} Contains the canvas that the perlin noise background will render to */
background.glCanvas = null;

/** @type {WebGLRenderingContext} The GL context of the canvas */
background.gl = null;

/** The timer used to interpolate the perlin background between two colors */
background.interpolationTimer = 0;

/** @type {Array.<number>} The start top color that will be interpolated from */
background.startTopColor = background.defaultTopColor.slice();

/** @type {Array.<number>} The end top color that will be interpolated to */
background.endTopColor = background.defaultTopColor.slice();

/** @type {Array.<number>} The start bottom color that will be interpolated from */
background.startBottomColor = background.defaultBottomColor.slice();

/** @type {Array.<number>} The end bottom color that will be interpolated to */
background.endBottomColor = background.defaultBottomColor.slice();

/** Keeps track of the time since loading the webpage. Used for animating the perlin noise background effect */
background.timer = 0.0;

/** Contains the vertex shader of the perlin noise program */
background.vertexShader = "";

/** Contains the fragment shader of the perlin noise program */
background.fragmentShader = "";

/** Called when the window is loaded */
function onWindowLoad() {
    //Get the canvas and GL context
    background.glCanvas = document.getElementById('backgroundCanvas');
    background.gl = background.glCanvas.getContext("webgl");

    //If the GL context couldn't be retrieved, then don't load the background
    if (background.gl === null) {
        return;
    }
    //Fetch the shader programs
    Promise.all([fetch("js/shaders/perlin.vert"), fetch("js/shaders/perlin.frag")]).then(responses => Promise.all([responses[0].text(), responses[1].text()])).then(responses => {
        background.vertexShader = responses[0];
        background.fragmentShader = responses[1];

        background.backgroundRunning = true;

        //Reduce the quality on mobile devices
        if (core.onMobile) {
            background.qualty /= 2;
        }

        //Setup the GL context
        setupGlContext();

        //Start the opacity at 1. The CSS will then fade it back out to 0
        background.glCanvas.style.opacity = "1";
    });
}

/**
 * Interpolates the perlin noise background between the old colors and the new color arguments
 * @param {string} topColor The top color to interpolate to
 * @param {string} bottomColor The bottom color to interpolate to
 */
background.interpolateToColor = function(topColor, bottomColor) {

    if (core.onMobile) {
        background.currentTopColor = core.cssToColor(topColor);
        background.currentBottomColor = core.cssToColor(bottomColor);
        return;
    }

    core.removeFromEvent(core.events.updateEvent, background.bg_revert_colors_update);
    core.removeFromEvent(core.events.updateEvent, background.bg_interpolate_colors_update);

    background.startTopColor = core.lerpArray(background.startTopColor, background.endTopColor, background.interpolationTimer);
    background.startBottomColor = core.lerpArray(background.startBottomColor, background.endBottomColor, background.interpolationTimer);

    background.interpolationTimer = 0.0;

    background.endTopColor = core.cssToColor(topColor);
    background.endBottomColor = core.cssToColor(bottomColor);

    core.addToEvent(core.events.updateEvent, background.bg_interpolate_colors_update);
}

/**
 * Reverts a color interpolation back to the previous color
 */
background.revertInterpolation = function() {

    if (core.onMobile) {
        background.currentTopColor = background.defaultTopColor.slice();
        background.currentBottomColor = background.defaultBottomColor.slice();
        return;
    }

    core.removeFromEvent(core.events.updateEvent, background.bg_interpolate_colors_update);
    core.removeFromEvent(core.events.updateEvent, background.bg_revert_colors_update);

    background.endTopColor = core.lerpArray(background.startTopColor, background.endTopColor, background.interpolationTimer);
    background.endBottomColor = core.lerpArray(background.startBottomColor, background.endBottomColor, background.interpolationTimer);

    background.startTopColor = background.defaultTopColor.slice();
    background.startBottomColor = background.defaultBottomColor.slice();

    background.interpolationTimer = 1.0;

    core.addToEvent(core.events.updateEvent, background.bg_revert_colors_update);
}

/**
 * Called every frame to update the perlin noise background colors
 * @param {number} dt The amount of time since the last update
 */
background.bg_interpolate_colors_update = function(dt) {
    background.interpolationTimer += dt * projectPanel.interpolationSpeed;
    if (background.interpolationTimer >= 1) {
        background.interpolationTimer = 1;
        core.removeFromEvent(core.events.updateEvent, background.interpolation_color_update);
    }

    calculate_colors();
}

/**
 * Called every frame to revert the perlin noise background colors
 * @param {number} dt The amount of time since the last update
 */
background.bg_revert_colors_update = function(dt) {
    background.interpolationTimer -= dt * projectPanel.interpolationSpeed;
    if (background.interpolationTimer <= 0) {
        background.interpolationTimer = 0;
        core.removeFromEvent(core.events.updateEvent, background.revert_color_update);
    }

    calculate_colors();
}

/** Calculates the background color based on the interpolation timer */
function calculate_colors() {
    background.currentTopColor = core.lerpArray(background.startTopColor, background.endTopColor, background.interpolationTimer);
    background.currentBottomColor = core.lerpArray(background.startBottomColor, background.endBottomColor, background.interpolationTimer);
}

/**
 * Called once each frame
 * @param {number} dt The time passed since the last update 
 */
function update(dt) {
    background.timer += dt;
    if (!background.backgroundRunning) {
        return;
    }

    //Don't draw the background if we are on mobile and the project panel is open and the project panel is fullscreen
    if (!(core.onMobile && projectPanel.projectOpen && window.innerWidth < (59.375 * core.fontSize))) {
        drawBackground();
    }
}

/** Draws the perlin noise background to the canvas */
function drawBackground() {
    //Get the width and height of the window
    var width = Math.max(document.body.clientWidth, window.innerWidth);
    var height = Math.max(document.body.clientHeight, window.innerHeight);

    background.glCanvas.width = width * background.qualty;
    background.glCanvas.height = height * background.qualty;

    background.glCanvas.style.width = width.toString() + "px";
    background.glCanvas.style.height = height.toString() + "px";
    //Set background.uniforms
    background.uniforms.setNoiseScale(background.scale * background.qualty);
    background.uniforms.setTopColor(background.currentTopColor);
    background.uniforms.setBottomColor(background.currentBottomColor);

    background.uniforms.setNoiseZ((background.timer) * background.speed);
    background.uniforms.setVerticalOffset((window.scrollY / background.parallaxAmount) - (window.scrollY * background.qualty) - height);
    // Clear the canvas
    background.gl.clearColor(1.0, 0.0, 0.0, 1.0);

    // Clear the color buffer bit
    background.gl.clear(background.gl.COLOR_BUFFER_BIT);
    // Set the view port
    background.gl.viewport(0, 0, width * background.qualty, height * background.qualty);

    // Draw the triangle
    background.gl.drawElements(background.gl.TRIANGLES, 6, background.gl.UNSIGNED_SHORT, 0);
}

/** Sets up the GL context, the shaders, and the uniforms so the perlin noise effect can run */
function setupGlContext() {
    //Define the vertex points
    var verticies = [
        -1.0, -1.0, 0.0,
        -1.0, 1.0, 0.0,
        1.0, 1.0, 0.0,
        1.0, -1.0, 0.0,
    ];

    var indices = [0, 1, 3, 1, 2, 3];

    //Create the vertex buffer
    var vertex_buffer = background.gl.createBuffer();
    background.gl.bindBuffer(background.gl.ARRAY_BUFFER, vertex_buffer);
    background.gl.bufferData(background.gl.ARRAY_BUFFER, new Float32Array(verticies), background.gl.STATIC_DRAW);
    background.gl.bindBuffer(background.gl.ARRAY_BUFFER, null);

    //Create the index buffer
    var index_buffer = background.gl.createBuffer();
    background.gl.bindBuffer(background.gl.ELEMENT_ARRAY_BUFFER, index_buffer);
    background.gl.bufferData(background.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), background.gl.STATIC_DRAW);
    background.gl.bindBuffer(background.gl.ELEMENT_ARRAY_BUFFER, null);

    //Create Vertex Shader
    var vertShader = background.gl.createShader(background.gl.VERTEX_SHADER);
    background.gl.shaderSource(vertShader, background.vertexShader);
    background.gl.compileShader(vertShader);
    var message = background.gl.getShaderInfoLog(vertShader);
    if (message.length > 0) {
        console.log("Vertex Shader Compilation Error");
        console.log(message);
    }

    //Create Fragment/Pixel Shader
    var fragShader = background.gl.createShader(background.gl.FRAGMENT_SHADER);
    background.gl.shaderSource(fragShader, background.fragmentShader);
    background.gl.compileShader(fragShader);

    var message = background.gl.getShaderInfoLog(fragShader);
    if (message.length > 0) {
        console.log("Fragment Shader Compilation Error");
        console.log(message);
    }

    //Create and use Shader Program
    var shaderProgram = background.gl.createProgram();
    background.gl.attachShader(shaderProgram, vertShader);
    background.gl.attachShader(shaderProgram, fragShader);
    background.gl.linkProgram(shaderProgram);
    background.gl.useProgram(shaderProgram);

    //Get background.uniforms
    background.uniforms.noiseScale = background.gl.getUniformLocation(shaderProgram, "noiseScale");
    background.uniforms.setNoiseScale = function(value) {
        background.gl.uniform1f(background.uniforms.noiseScale, value);
    };

    background.uniforms.noiseZ = background.gl.getUniformLocation(shaderProgram, "noiseZ");
    background.uniforms.setNoiseZ = function(value) {
        background.gl.uniform1f(background.uniforms.noiseZ, value);
    };

    background.uniforms.verticalOffset = background.gl.getUniformLocation(shaderProgram, "verticalOffset");
    background.uniforms.setVerticalOffset = function(value) {
        background.gl.uniform1f(background.uniforms.verticalOffset, value);
    };

    background.uniforms.topColor = background.gl.getUniformLocation(shaderProgram, "topColor");
    background.uniforms.setTopColor = function(value) {
        background.gl.uniform4f(background.uniforms.topColor, (value[0] / 255.0) * background.darkenAmount, (value[1] / 255.0) * background.darkenAmount, (value[2] / 255.0) * background.darkenAmount, value[3] / 255.0);
    };

    background.uniforms.bottomColor = background.gl.getUniformLocation(shaderProgram, "bottomColor");
    background.uniforms.setBottomColor = function(value) {
        background.gl.uniform4f(background.uniforms.bottomColor, (value[0] / 255.0) * background.darkenAmount, (value[1] / 255.0) * background.darkenAmount, (value[2] / 255.0) * background.darkenAmount, value[3] / 255.0);
    };

    //Bind Buffers to Shader Program
    background.gl.bindBuffer(background.gl.ARRAY_BUFFER, vertex_buffer);
    background.gl.bindBuffer(background.gl.ELEMENT_ARRAY_BUFFER, index_buffer);
    var coord = background.gl.getAttribLocation(shaderProgram, "position");
    background.gl.vertexAttribPointer(coord, 3, background.gl.FLOAT, false, 0, 0);
    background.gl.enableVertexAttribArray(coord);
    // Disable the depth test
    background.gl.disable(background.gl.DEPTH_TEST);
}

core.addToEvent(core.events.onWindowLoad, onWindowLoad);

core.addToEvent(core.events.updateEvent, update);

core.addToEvent(projectPanel.events.projectColorChangeEvent, project => {
    //console.log("Color Chance = " + project);
    if (project == null) {
        background.revertInterpolation();
    } else {
        var color = project.color;
        if (project.perlinColor) {
            color = project.perlinColor;
        }

        var backColor = project.backgroundColor;
        if (project.perlinBackgroundColor) {
            backColor = project.perlinBackgroundColor;
        }

        background.interpolateToColor(color, backColor);
    }
});

console.log("Background Loaded");