
var contextSet = false;
var backgrondScale = 750.0;
var speedMultiplier = 0.15;
var parallaxAmount = 3.0;
var resolutionMultipler = 0.5;

/*function componentToHex(c) {
  var hex = c.toString(16);
  return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
  return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}*/

function hexToRgb(hex) {
	hex = hex.replace(" ","");
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
 /* return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
	a: 255
} : null;*/
//console.log("1st = " + result[1]);
//console.log("2nd = " + result[2]);
//console.log("3rd = " + result[3]);
  return result ? [parseInt(result[1], 16),parseInt(result[2], 16),parseInt(result[3], 16),255 ] : null;
}

function Awake()
{
	glCanvas = document.getElementById('backgroundCanvas');
	gl = glCanvas.getContext("webgl");
	if (gl === null)
	{
		return;
	}
	contextSet = true;
	setupGlContext();

	//testPrint("CONTEXT SET");
	glCanvas.style.opacity = "100%";
	glCanvas.style.MozOpacity = "100%";
	glCanvas.style.webkitOpacity = "100%";

	//gl.clearColor(1.0, 0.0, 0.0, 0.5);
	//gl.clear(gl.COLOR_BUFFER_BIT);

	window.requestAnimationFrame(loop);
}

function Update(dt)
{
	if (contextSet === false)
	{
		return;
	}
	drawBackground();
}

function drawBackground()
{
	var documentStyle = getComputedStyle(document.documentElement);



	glCanvas.width = window.innerWidth;
	glCanvas.height = window.innerHeight;
	//Set Uniforms
	//gl.uniform2f(uniforms.windowSize,glCanvas.width,glCanvas.height);
	 uniforms.setNoiseScale(backgrondScale);
	 //documentStyle.getPropertyValue('--top-bg-color').convertToRGB()
	 //documentStyle.getPropertyValue('--bottom-bg-color').convertToRGB()
	 //46,56,58,255
	 //uniforms.setTopColor(hexToRgb(documentStyle.getPropertyValue('--top-bg-color')));
	 //uniforms.setBottomColor(hexToRgb(documentStyle.getPropertyValue('--bottom-bg-color')));
	 //uniforms.setBottomColor([30,50,20,255]);
	 //uniforms.setBottomColor([50,90,30,255]);
	 //uniforms.setTopColor([100,20,100,255]);


	 uniforms.setTopColor([107 / 2,157 / 2,62 / 2,255]);
	 uniforms.setBottomColor([50 / 2,90 / 2,30 / 2,255]);

	 uniforms.setNoiseZ((previousTime / 1000.0) * speedMultiplier);
	 uniforms.setVerticalOffset((window.scrollY / parallaxAmount) - window.scrollY);
	// Clear the canvas
     gl.clearColor(1.0, 0.0, 0.0, 1.0);

     // Clear the color buffer bit
     gl.clear(gl.COLOR_BUFFER_BIT);

     // Set the view port
	 //console.log("Width = " + window.innerWidth + " Height = " + window.innerHeight);
     gl.viewport(0,0,window.innerWidth,window.innerHeight);

	 console.log("Viewport = " + gl.getParameter(gl.VIEWPORT));

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
	Update(time - previousTime);

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
