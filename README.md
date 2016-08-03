# AudioSpace
A tool for setting up and managing spatialized audio for Altspace developer apps.


Example: http://norybiak.com/apps/sound
Note: The example works best in the SDK Test (Large) space.

---
## Using AudioSpace

Before adding sounds, you must first start AudioSpace:
```javacsript
AudioSpace.start();
```

To add a new sound:
```javascript
AudioSpace.newSpatialSound("uniqueName", "path/to/file.ogg", config).then(function(name) { //Ready to play a sound! });
```

You must also update AudioSpace in your render loop while passing the user's head object:
```javacsript 
AudioSpace.update(userHead);
```
The following are the config parameters: 
```
config options: (order doesn't matter)

	mesh 				Type: THREE.Mesh - The mesh you want the sound to originate from (this overrides pos)
	pos					Type: Object | Format {x: 0, y: 0, z: 0} - The custom position you want the sound to originate from	(mesh must be left out to use pos)

	soundZone			Type: int (0-360) - The zone around the object where the sound is played (in degrees)
									Think of the zone as a cone that expands outward in the direction the the object is facing. The smaller the degree,
									the smaller the cone is. 360 degrees wraps around the entire object (default)
									***NOTE: This setting will always override to 360 degrees until it can be fully implemented***

	distanceModel		Type: string - 'linear', 'inverse', 'exponential' - default is linear (recommended)
	fadeFactor			Type: double (0-1) - How fast the volume decreases as a user moves away from the object (default is 1)
	refDistance			Type: double (0-1) - I'm not exactly sure what this does (default is 1)
	maxDistance			Type: double (0-10000) - The maximum distance between the object and user, after which the volume is not reduced anymore (default is 200)
  	volume				Type: double (0-100) - The volume of the sound (default is 1)
  	usingOwnerTools		Type: bool - If the mesh is using OwnerTools, this must be set to true (default is false)

```
