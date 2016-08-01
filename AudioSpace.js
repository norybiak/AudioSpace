var AudioSpace = AudioSpace || {};

(function(main) 
{ 'use strict';
	var instance;
	
	var context;
	var masterVolume;
	
	var soundObjects = {};	
	var soundBank = {};
	
	/**
	 * Start AudioSpace!
	 * Optional param: instance (isn't required, but needed for OwnerTools)
	 *
	 */
	main.start = function(i)
	{
		instance = i || null;
		
		// Just in case the AudioContext isn't there....but it should since we know the environment is the same for everyone.
		window.AudioContext = ( window.AudioContext || window.webkitAudioContext || null );
		if (!AudioContext) { throw new Error("AudioContext not supported!"); } 
		
		context = new AudioContext();

		// Create a gain node that acts as our volume control for the entire context
		masterVolume = context.createGain();	
		// Connect the volume to the context destination (the output)
		masterVolume.connect(context.destination);
	
		// We're ready to start connecting sounds!
	
		console.log("AudioSpace: Started!");
	}
	
	/**
	 * Give an object OwnerTools functionality and add it to the scene
	 * See the source code of norybiak.com/apps/sound for examples and config info
	 *
	 */
	main.newSpatialSound = function(name, theAudioPath, config)
	{
		if (soundObjects[name])
		{
			console.log("AudioSpace: The sound - " + name + " - already exists! Sounds must have unique names.");
			return;
		}
		
		var config = config || {};
		var newSpatialSoundObject = {};
		
		// create volume node
		var volume = context.createGain();
		
		// create panner (3D spatial controller)
		var panner = context.createPanner();
		
		// connect the panner to the volume node
		volume.connect(panner);
		
		// connect the panner to the master volume
		panner.connect(masterVolume);
		
		//sounds[name] (source) --- > volume --- > panner --- > masterVolume --- > speakers
		//Note: we don't connect to source here
		
		// set volume 
		volume.gain.value = config.volume || 1;
		
		// set panner settings
		panner.distanceModel = config.distanceModel || 'linear';
		panner.coneInnerAngle = config.soundZone || 360;
		panner.rolloffFactor = config.fadeFactor || 1;
		panner.refDistance = config.refDistance || 1;
		panner.maxDistance = config.maxDistance || 200;

		var mesh = config.mesh || 0;
		var pos = config.pos || 0;
		var usingOwnerTools = config.usingOwnerTools || false;
	
		if (mesh)
		{
			if (instance && config.usingOwnerTools)
			{
				instance.child('objects').child(mesh.name).child("pos").on('value', function (childSnapshot, prevChildkey) 
				{
					var pos = childSnapshot.val();
				
					panner.setPosition(pos.x, pos.y, pos.z);
				});
			}
			else
			{
				var v2 = new THREE.Vector3();
				mesh.updateMatrixWorld();
				
				v2.setFromMatrixPosition(mesh.matrixWorld);
				
				panner.setPosition(v2.x, v2.y, v2.z);
			}
		}
		else if (pos)
		{
			panner.setPosition(pos.x, pos.y, pos.z);
		}
		else 
		{
			panner.setPosition(0, 0, 0);
		}
		
		newSpatialSoundObject = {volume: volume, panner: panner, mesh: mesh, pos: pos};
		soundObjects[name] = newSpatialSoundObject;
		
		return new Promise(function(resolve, reject) 
		{
			var request = new XMLHttpRequest();
			request.open("GET", theAudioPath, true);
			request.responseType = "arraybuffer";
			
			request.onload = function(e) 
			{
				context.decodeAudioData(this.response, function(buffer) 
				{
					soundBank[name] = buffer;
					resolve(name);
					
				}, function onFailure()
				{
					reject(console.log("AudioSpace: There was an issue loading the audio file!"));
				});
			};
			
			request.send();
	
		});
		
		//getAudio(name, theAudioPath);
	}
	
	/**
	 * Plays the sound!
	 * Optional param (bool): loop
	 *
	 */
	main.play = function(name, loop)
	{
		var loop = loop || false;		
		
		// create a new source
		var source = context.createBufferSource();
		
		// connect the source to the soundObject's volume node
		source.connect(soundObjects[name].volume);
		
		// set the source's buffer to the sound buffer
		source.buffer = soundBank[name];
		
		// loop sound if true
		source.loop = loop;

		// play the sound from the beginning
		source.start(0);
	}
	
	/**
	 * Changes master volume
	 * 
	 *
	 */
	main.setVolume = function(num)
	{
		// set volume 
		masterVolume.gain.value = num;
	}
	
		
	/**
	 * Update the listener to the current position of the user's head
	 * 
	 *
	 */
	var v = new THREE.Vector3();
	var v2 = new THREE.Vector3();
	var matrix = new THREE.Matrix4();
	main.update = function(head)
	{
		
		v.setFromMatrixPosition(head.matrixWorld);
		
		context.listener.setPosition(v.x, v.y, v.z);	
		
		matrix.extractRotation(head.matrix);

		var direction = new THREE.Vector3( 0, 0, 1 );
		direction.applyMatrix4( matrix );
		
		context.listener.setOrientation(direction.x, direction.y, direction.z, 0, 1, 0);
	}
	
	/**
	 * Fetches audio and puts it into soundBank as an arrayBuffer
	 * (not used atm)
	 *
	 */
	function getAudio(name, theAudioPath)
	{
		var request = new XMLHttpRequest();
		request.open("GET", theAudioPath, true);
		request.responseType = "arraybuffer";
		
		request.onload = function(e) 
		{
			context.decodeAudioData(this.response, function(buffer) 
			{
				
				soundBank[name] = buffer;
				AudioSpace.play(name, true);
				
				
			}, function onFailure()
			{
				console.log("AudioSpace: There was an issue loading the audio file!");
			});
		};
		
		request.send();
	}

})(AudioSpace);