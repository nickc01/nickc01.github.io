
var previousRoutineTime = 0;

var routines = [];

var ROUTINE_DT = 0.0;

function Routine_Update(dt)
{
	ROUTINE_DT = dt;
	//console.log("ROUTINES = " + routines.length);
	for (var i = routines.length - 1; i >= 0; i--) {
		var routine = routines[i];
		if (routine.next().done) {
			routines.splice(i,1);
		}
	}
}


function Routine_loop(time)
{
	Routine_Update((time - previousRoutineTime) / 1000.0);

	previousRoutineTime = time;
	window.requestAnimationFrame(Routine_loop);
}

window.requestAnimationFrame(Routine_loop);

function AddRoutine(routine)
{
	routines.push(routine);
}

/*function RemoveRoutine(routineID)
{

}*/
