
function shear(frame)
{
    var ZOOM = -40;

    // bail out if we have no motion vectors
    let mvs = frame["mv"];
    if ( !mvs )
        return;
    // bail out if we have no forward motion vectors
    let fwd_mvs = mvs["forward"];
    if ( !fwd_mvs )
        return;

	var M_H = fwd_mvs.length/2;
    // clear horizontal element of all motion vectors
    for ( let i = 0; i < fwd_mvs.length; i++ )
    {

        // loop through all rows

        let row = fwd_mvs[i];
        var M_W = row.length/2;
        for ( let j = 0; j < row.length; j++ )
        {
            // loop through all macroblocks
            let mv = row[j];

            // THIS IS WHERE THE MAGIC HAPPENS
            //if(i>M_W){
				mv[0] = mv[0] + ((i - M_W) / 100)*ZOOM;
            	mv[1] = mv[1] + ((j - M_H) / 100)*ZOOM;
			//}
        }
    }
}

// global variable holding forward motion vectors from previous frames
var prev_fwd_mvs = [ ];

// change this value to use a smaller or greater number of frames to
// perform the average of motion vectors
var tail_length = 30;

// calculate average of previous motion vectors
function average_mv(mv, i, j, n, k)
{
    let sum = 0;
    for ( let t = 0; t < n; t++ )
        sum += prev_fwd_mvs[t][i][j][k];
    let val = Math.round(sum / n);
    val = Math.max(val, -64);
    val = Math.min(val,  63);
    return val;
}

function average(frame)
{
    // bail out if we have no motion vectors
    let mvs = frame["mv"];
    if ( !mvs )
        return;
    // bail out if we have no forward motion vectors
    let fwd_mvs = mvs["forward"];
    if ( !fwd_mvs )
        return;

    // update variable holding forward motion vectors from previous
    // frames. note that we perform a deep copy of the clean motion
    // vector values before modifying them.
    let json_str = JSON.stringify(fwd_mvs);
    let deep_copy = JSON.parse(json_str);
    // push to the end of array
    prev_fwd_mvs.push(deep_copy);
    // drop values from earliest frames to always keep the same tail
    // length
    if ( prev_fwd_mvs.length > tail_length )
        prev_fwd_mvs = prev_fwd_mvs.slice(1);

    // bail out if we still don't have enough frames
    if ( prev_fwd_mvs.length != tail_length )
        return;

    // replace all motion vectors of current frame with an average
    // of the motion vectors from the previous 10 frames
    for ( let i = 0; i < fwd_mvs.length; i++ )
    {
        // loop through all rows
        let row = fwd_mvs[i];
        for ( let j = 0; j < row.length; j++ )
        {
            // loop through all macroblocks
            let mv = row[j];

            // THIS IS WHERE THE MAGIC HAPPENS

            mv[0] = average_mv(mv, i, j, tail_length, 0);
            mv[1] = average_mv(mv, i, j, tail_length, 1);
        }
    }
}
// dd_zoom_in.js


function zoom(frame)
{
    var ZOOM = 100;

    // bail out if we have no motion vectors
    let mvs = frame["mv"];
    if ( !mvs )
        return;
    // bail out if we have no forward motion vectors
    let fwd_mvs = mvs["forward"];
    if ( !fwd_mvs )
        return;

	var M_H = fwd_mvs.length/2;
    // clear horizontal element of all motion vectors
    for ( let i = 0; i < fwd_mvs.length; i++ )
    {

        // loop through all rows

        let row = fwd_mvs[i];
        var M_W = row.length/2;

        for ( let j = 0; j < row.length; j++ )
        {
            // loop through all macroblocks
            let mv = row[j];

            // THIS IS WHERE THE MAGIC HAPPENS
            //if(i>M_W){
				mv[0] = mv[0] + ((M_W - j) / 100)*ZOOM;
            	mv[1] = mv[1] + ((M_H - i) / 100)*ZOOM;
			//}
        }
    }
}

var buffer = [ ];


function mirror(frame)
{

    // bail out if we have no motion vectors
    let mvs = frame["mv"];
    if ( !mvs )
        return;
    // bail out if we have no forward motion vectors
    let fwd_mvs = mvs["forward"];
    if ( !fwd_mvs )
        return;

	// note that we perform a deep copy of the clean motion
    // vector values before modifying them.
    let json_str = JSON.stringify(fwd_mvs);
    let deep_copy = JSON.parse(json_str);
	// stick em in the buffer
    buffer = deep_copy;

	var M_H = fwd_mvs.length/2;
    // VERTICALLY
    for ( let i = 0; i < fwd_mvs.length; i++ )
    {

        // loop through all rows

        let row = fwd_mvs[i];
        var row2 = buffer[i];
        //var row2 = fwd_mvs[(fwd_mvs.length-1)-i];

        var M_W = row.length/2;

		// HORIZONTALLY
        for ( let j = 0; j < row.length; j++ )
        {
            // loop through all macroblocks
            let mv = row[j];
			var mv2 = row2[(row.length - 1) - j];
            // THIS IS WHERE THE MAGIC HAPPENS
            //if(i>M_W){
				mv[0] = 0-mv2[0];
            	mv[1] = mv2[1];
			//}
        }
    }
}


let threshold = 95;
var TRIGGERED = 0;
var nFrames = 10;
var frameCount = 0;
var MAGNITUDE = 20;

function invert_reverse(frame)
{

	var do_or_not = Math.random() * 100;
	if(do_or_not > threshold){
		if(TRIGGERED > 0){

		}else{
			TRIGGERED = 1;
			frameCount = 0;
			nFrames = Math.random() * MAGNITUDE;
		}
	}
	// only do the glitch if our random number crosses the threshold
	if(TRIGGERED > 0 & frameCount <= nFrames){
		frameCount++;

		// bail out if we have no motion vectors
		let mvs = frame["mv"];
		if ( !mvs )
			return;
		// bail out if we have no forward motion vectors
		let fwd_mvs = mvs["forward"];
		if ( !fwd_mvs )
			return;

		var M_H = fwd_mvs.length/2;
		// clear horizontal element of all motion vectors
		for ( let i = 0; i < fwd_mvs.length; i++ )
		{
			// loop through all rows
			let row = fwd_mvs[i];
			var M_W = row.length/2;

			for ( let j = 0; j < row.length; j++ )
			{
				// loop through all macroblocks
				let mv = row[j];

				// THIS IS WHERE THE MAGIC HAPPENS
				// STOP XY
				mv[0] = 0 - mv[0];
				mv[1] = 0 - mv[1];
			}
		}
	}else{
		TRIGGERED = 0;
	}
}
var randomness = 10;
var bias = (randomness/2);
function vibrate(frame)
{
    // bail out if we have no motion vectors
    let mvs = frame["mv"];
    if ( !mvs )
        return;
    // bail out if we have no forward motion vectors
    let fwd_mvs = mvs["forward"];
    if ( !fwd_mvs )
        return;

    // clear horizontal element of all motion vectors
    for ( let i = 0; i < fwd_mvs.length; i++ )
    {
        // loop through all rows
        let row = fwd_mvs[i];
        for ( let j = 0; j < row.length; j++ )
        {
            // loop through all macroblocks
            let mv = row[j];

            // THIS IS WHERE THE MAGIC HAPPENS
				mv[0] = mv[0] + (Math.floor((Math.random() * randomness) -bias));
            	mv[1] = mv[1] + (Math.floor((Math.random() * randomness) -bias));
        }
    }
}

// dd_RandomDamage(antiGrav).js
// anitgravityify if threshold met for frame

// global variable holding forward motion vectors from previous frames
var old_mvs = [ ];
// a variable for gravity
var rt = 0;
var gravity = 0
var orig_gravity = 5;
var TRIGGERED = 0;
var frameCount = 10;
var count = 0;

function antigravity(frame)
{
	var do_or_not = Math.random() * 100;
	// only do the glitch if our random number crosses the threshold
	if(do_or_not > threshold | TRIGGERED == 1){
		if(TRIGGERED == 0){
			gravity = orig_gravity;
			TRIGGERED = 1;
			rt = 0;
		}
		// bail out if we have no motion vectors
		let mvs = frame["mv"];
		if ( !mvs )
			return;
		// bail out if we have no forward motion vectors
		let fwd_mvs = mvs["forward"];
		if ( !fwd_mvs )
			return;

		// buffer first set of vectors. . .
		if(rt == 0){
			let json_str = JSON.stringify(fwd_mvs);
			let deep_copy = JSON.parse(json_str);
			// push to the end of array
			old_mvs[0] = (deep_copy);
			rt = 1;
		}

		// clear horizontal element of all motion vectors
		for ( let i = 0; i < fwd_mvs.length; i++ )
		{
			// loop through all rows
			let row = fwd_mvs[i];
			let old_row = old_mvs[0][i];
			for ( let j = 0; j < row.length; j++ )
			{
				// loop through all macroblocks
				let mv = row[j];
				let omv = old_row[j];
				// THIS IS WHERE THE MAGIC HAPPENS

				mv[0] = mv[0];
				//if(mv[1] < 0){
					var nmv = mv[1];
					mv[1] = omv[1];
					omv[1] = nmv + omv[1] + gravity;
					//gravity++;
				//}else{
				//	mv[1] = mv[1];
				//}

			}
		}
		count++;
		if(count >= frameCount){
			TRIGGERED = 0;
			count = 0;
		}
	}
}

funcs = [
    shear,
    average,
    invert_reverse,
    zoom,
    vibrate,
    mirror,
    antigravity,
    average,
]
var index = 0;

function glitch_frame(frame){
    index+=1;
    if (index>funcs.length-1){
        index = 0
    }

    // index = Math.floor(Math.random() * funcs.length);
    funcs[index](frame)
}
