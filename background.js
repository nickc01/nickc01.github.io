
var contextSet = false;
var backgrondScale = 750.0;
var speedMultiplier = 0.15;
var parallaxAmount = 3.0;
var resolutionMultipler = 0.5;

var currentTopColor = null;
var currentBottomColor = null;

var defaultTopColor = [107 / 2,157 / 2,62 / 2,255];
var defaultBottomColor = [50 / 4,90 / 4,30 / 4,255];

var interpolateTimeMax = null;
var interpolateTime = null;
var interpolateTopColor = null;
var interpolateBottomColor = null;

var interpolatePreviousTopColor = null;
var interpolatePreviousBottomColor = null;

function Awake()
{
	glCanvas = document.getElementById('backgroundCanvas');
	gl = glCanvas.getContext("webgl");
	if (gl === null)
	{
		return;
	}
	currentTopColor = defaultTopColor.slice();
	currentBottomColor = defaultBottomColor.slice();
	contextSet = true;
	setupGlContext();

	glCanvas.style.opacity = "1";
	window.requestAnimationFrame(loop);
}

function Update(dt)
{
	if (contextSet === false)
	{
		return;
	}

	if (interpolateTime !== null)
	{
		currentTopColor = lerpColor(interpolatePreviousTopColor,interpolateTopColor,1.0 - (interpolateTime / interpolateTimeMax));
		currentBottomColor = lerpColor(interpolatePreviousBottomColor,interpolateBottomColor,1.0 - (interpolateTime / interpolateTimeMax));
		interpolateTime -= dt;
		//console.log("Interpolate Time = " + interpolateTime);
		if (interpolateTime <= 0) {
			currentTopColor = lerpColor(interpolatePreviousTopColor,interpolateTopColor,1.0);
			currentBottomColor = lerpColor(interpolatePreviousBottomColor,interpolateBottomColor,1.0);
			interpolateTime = null;
		}
	}

	drawBackground();
}

function InterpolateToNewColor(newTopColor,newBottomColor,time)
{
	interpolateTime = time;
	interpolateTimeMax = time;
	interpolatePreviousTopColor = currentTopColor;
	interpolatePreviousBottomColor = currentBottomColor;

	interpolateTopColor = newTopColor;
	interpolateBottomColor = newBottomColor;
}

function lerp (a, b, t)
{
	return (1-t)*a+t*b;
}

function lerpColor(colorA,colorB,t)
{
	if (colorA.length >= 4 || colorB.length >= 4)
	{
		var alpha = lerp(colorA.length >= 4 ? colorA[3] : 255, colorB.length >= 4 ? colorB[3] : 255,t);
		return [lerp(colorA[0],colorB[0],t),lerp(colorA[1],colorB[1],t),lerp(colorA[2],colorB[2],t),alpha];
	}
	else {
		return [lerp(colorA[0],colorB[0],t),lerp(colorA[1],colorB[1],t),lerp(colorA[2],colorB[2],t)];
	}
}

function drawBackground()
{
	var documentStyle = getComputedStyle(document.documentElement);



	/*glCanvas.width = window.innerWidth;
	glCanvas.height = window.innerHeight;

	glCanvas.width = Math.max(window.innerWidth,document.body.scrollWidth);
	glCanvas.height = Math.max(window.innerHeight,document.body.scrollHeight);*/





	glCanvas.width = window.innerWidth;
	glCanvas.height = window.innerHeight;

	glCanvas.width = window.innerWidth;//Math.max(window.innerWidth,document.body.scrollWidth);
	glCanvas.height = window.innerHeight;//Math.max(window.innerHeight,document.body.scrollHeight);

	//glCanvas.width = Math.max(window.innerWidth,window.scrollWidth);
	//glCanvas.height = Math.max(window.innerHeight,window.scrollHeight);
	//Set Uniforms
	 uniforms.setNoiseScale(backgrondScale);
	 uniforms.setTopColor(currentTopColor);
	 uniforms.setBottomColor(currentBottomColor);

	 uniforms.setNoiseZ((previousTime / 1000.0) * speedMultiplier);
	 uniforms.setVerticalOffset((window.scrollY / parallaxAmount) - window.scrollY);
	// Clear the canvas
     gl.clearColor(1.0, 0.0, 0.0, 1.0);

     // Clear the color buffer bit
     gl.clear(gl.COLOR_BUFFER_BIT);

     // Set the view port
	 //console.log("Width = " + window.innerWidth + " Height = " + window.innerHeight);
     gl.viewport(0,0,glCanvas.width,glCanvas.height);

     // Draw the triangle
     //gl.drawArrays(gl.POINTS, 0, 6);
	gl.drawElements(gl.TRIANGLES,6,gl.UNSIGNED_SHORT,0);

	ErrorCheck();
}

function GetTrueHeight()
{
	var body = document.body, html = document.documentElement;

	var height = Math.max( body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight );
	return height;
}

function loop(time)
{
	Update((time - previousTime) / 1000.0);

	previousTime = time;
	window.requestAnimationFrame(loop);
}

var previousTime = 0;

window.onload = Awake;

function setupGlContext()
{
	//testPrint("Setting up Context");
	//Define the vertex points
	var verticies = [
		-1.0,-1.0,0.0,
		-1.0,1.0,0.0,
		 1.0,1.0,0.0,
		 1.0,-1.0,0.0,
	];

	var indices = [0,1,3,1,2,3];

	//Create the vertex buffer
	var vertex_buffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verticies), gl.STATIC_DRAW);
	gl.bindBuffer(gl.ARRAY_BUFFER, null);

	//Create the index buffer
	var index_buffer = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, index_buffer);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

	//Create Vertex Shader
	var vertCode = window.shaders.backgroundVertexShader;
	var vertShader = gl.createShader(gl.VERTEX_SHADER);
	gl.shaderSource(vertShader, vertCode);
	gl.compileShader(vertShader);
	var message = gl.getShaderInfoLog(vertShader);
	if (message.length > 0) {
		console.log("Vertex Shader Compilation Error");
		console.log(message);
	}

	//Create Fragment/Pixel Shader
	var fragCode = window.shaders.backgroundFragmentShader;

	var fragShader = gl.createShader(gl.FRAGMENT_SHADER);
	gl.shaderSource(fragShader, fragCode);
	gl.compileShader(fragShader);

	var message = gl.getShaderInfoLog(fragShader);
	if (message.length > 0) {
		console.log("Fragment Shader Compilation Error");
		console.log(message);
	}

	//Create and use Shader Program
	var shaderProgram = gl.createProgram();
	gl.attachShader(shaderProgram, vertShader);
	gl.attachShader(shaderProgram, fragShader);
	gl.linkProgram(shaderProgram);
	gl.useProgram(shaderProgram);

	//Get Uniforms
	uniforms = {};
	uniforms.noiseScale = gl.getUniformLocation(shaderProgram,"noiseScale");
	uniforms.setNoiseScale = function(value)
	{
		gl.uniform1f(uniforms.noiseScale,value);
	};

	uniforms.noiseZ = gl.getUniformLocation(shaderProgram,"noiseZ");
	uniforms.setNoiseZ = function(value)
	{
		gl.uniform1f(uniforms.noiseZ,value);
	};

	uniforms.verticalOffset = gl.getUniformLocation(shaderProgram,"verticalOffset");
	uniforms.setVerticalOffset = function(value)
	{
		gl.uniform1f(uniforms.verticalOffset,value);
	};

	uniforms.topColor = gl.getUniformLocation(shaderProgram, "topColor");
	uniforms.setTopColor = function(value)
	{
		gl.uniform4f(uniforms.topColor,value[0] / 255.0,value[1] / 255.0,value[2] / 255.0,value[3] / 255.0);
	};

	uniforms.bottomColor = gl.getUniformLocation(shaderProgram, "bottomColor");
	uniforms.setBottomColor = function(value)
	{
		gl.uniform4f(uniforms.bottomColor,value[0] / 255.0,value[1] / 255.0,value[2] / 255.0,value[3] / 255.0);
	};

	//Bind Buffers to Shader Program
	gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, index_buffer);
	var coord = gl.getAttribLocation(shaderProgram, "position");
	gl.vertexAttribPointer(coord, 3, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(coord);
	// Disable the depth test
	gl.disable(gl.DEPTH_TEST);
	ErrorCheck();
}

function ErrorCheck()
{
	var error = gl.getError();
	if (error !== gl.NO_ERROR) {
		console.log(error);
	}
}

/*function testPrint(message)
{
	var debugTest = document.getElementById('debugTest');
	debugTest.innerText += message + "-:-";
}*/
