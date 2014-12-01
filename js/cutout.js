self.addEventListener('message', function(e) {

importScripts('THREE.js');  

//Input Buffer
var selectedVertices = e.data[0];
var icoVertices = e.data[1];
var icoFacesCentroid = e.data[2];
var icoFaces = e.data[3];

var newIcoVertices = new Float32Array();
var newIcoFaces = new Float32Array();
var debugPoints;
var subDivisionPoints = [];

// Output ArrayBuffer
var cutOut = new Float32Array(icoFaces.length / 3);

	console.log("work, work!");
	console.log("selected length: " + selectedVertices.length);

 	for ( var i = 0; i <= selectedVertices.length - 3; i += 3 ) {


 		console.log("selected" + i);

 		// Test collision with lamp (Ico Mesh)

 		var vertex = new THREE.Vector3(selectedVertices[i],selectedVertices[i+1],selectedVertices[i+2]);
 		var direction = vertex.sub(new THREE.Vector3(0,0,0));

		direction.normalize();

		var myRaycaster = new THREE.Raycaster(vertex, direction);

		var faceCounter = 0;

		var closestFace;
		var closestDistance = 10000;


		// Get closestFace and closestDistance
 		for (var j =0; j <= icoFacesCentroid.length -3; j+=3) {

 			// Center of Face
			var centroid = new THREE.Vector3(icoFacesCentroid[j],icoFacesCentroid[j+1],icoFacesCentroid[j+2]);

 			if(myRaycaster.ray.distanceToPoint(centroid) <= closestDistance){
 					closestDistance = myRaycaster.ray.distanceToPoint(centroid);
 					closestFace = faceCounter;
 			}

 			faceCounter ++;
 		
 			
 		}

 		// Identify unique, hit faces?
 		// JAJAJAJAJAJA!


 		if(closestDistance <= .04){

 			// Remove
 		}

 		if(closestDistance <= 2 && closestDistance >= .04) {


			//Subdivide

			console.log("closestFace: " + closestFace);

			// Get adjacent faces of closestFace
			var faceCounter = 0;
			var deleteFaces = [];
			var counter = 0;


			// Which faces have a common indices with closestFace
			for (var l = 0; l <= icoFaces.length - 3; l+=3) {

				for (var p = 0; p <= 2; p++) {

					// List of face indices at the position closestFace * 3 (because xyz) + addition (p) for xyz
					if( icoFaces[l] == icoFaces[closestFace * 3 + p]){
						counter ++;
					}

					if(icoFaces[l+1] == icoFaces[closestFace * 3 + p]){
						counter ++;
					}

					if(icoFaces[l+2] == icoFaces[closestFace * 3 + p]){
						counter ++;
					}
				}
				
				// At least two common indices
				if(counter >= 2){
					deleteFaces.push(faceCounter);
				}

				counter = 0;

				faceCounter++;
			}

			console.log(deleteFaces);


			// Creating new arrays for subdivision

			newIcoVertices = new Float32Array(icoVertices.length);
			newIcoFaces = new Float32Array(icoFaces.length);
			
			var idCounter = 0;
			var deleteCounter = 0;

			for (var l = 0; l <= newIcoFaces.length - 3; l+=3) {

				// Does this face appear in the deleteFaces list?
				for (var p = 0; p <= deleteFaces.length - 1; p++) {
					if(idCounter == deleteFaces[p]){
						deleteCounter ++;
					}
				}
				

				/////////////////////////////////////////////////
				/////////////////////////////////////////////////
				/////////////////////////////////////////////////

				// Delete has to be done after the loop, because the the face ID's get messed up by this

				// If so, delete
				if(deleteCounter <= 0){
					newIcoFaces[l] = icoFaces[l];
					newIcoFaces[l+1] = icoFaces[l+1];	
					newIcoFaces[l+2] = icoFaces[l+2];		
				}else{
					newIcoFaces[l] = 10;
					newIcoFaces[l+1] = 10;
					newIcoFaces[l+2] = 10;
				} 
				
				idCounter++;
				deleteCounter = 0;

			}


			// Reconstruct Faces


			// The points of the faces, that are to be subdivided (including adjacent faces)
			for (var p = 0; p <= deleteFaces.length - 1; p++) {
				//	if(deleteFaces[p] != closestFace){
					subDivisionPoints.push(new THREE.Vector3(	icoVertices[icoFaces[ deleteFaces[p]*3 +0]* 3],
														icoVertices[icoFaces[ deleteFaces[p]*3 +0]* 3 +1],
														icoVertices[icoFaces[ deleteFaces[p]*3 +0]* 3 +2]));
					subDivisionPoints.push(new THREE.Vector3(	icoVertices[icoFaces[ deleteFaces[p]*3 +1]* 3],
														icoVertices[icoFaces[ deleteFaces[p]*3 +1]* 3 +1],
														icoVertices[icoFaces[ deleteFaces[p]*3 +1]* 3 +2]));
					subDivisionPoints.push(new THREE.Vector3(	icoVertices[icoFaces[ deleteFaces[p]*3 +2]* 3],
														icoVertices[icoFaces[ deleteFaces[p]*3 +2]* 3 +1],
														icoVertices[icoFaces[ deleteFaces[p]*3 +2]* 3 +2]));
					
				//	}
			}
			
			debugPoints = new Float32Array(subDivisionPoints.length * 3);

			var counter = 0;
			for(var u = 0; u <= debugPoints.length -3; u +=3){
				debugPoints[u] = subDivisionPoints[counter].x;
				debugPoints[u+1] = subDivisionPoints[counter].y;
				debugPoints[u+2] = subDivisionPoints[counter].z;
				counter ++;
			}
			

			// Leave the Vertices as they are for now
			idCounter = 0;
			for (var m = 0; m <= newIcoVertices.length - 3; m+=3) {
					newIcoVertices[m] = icoVertices[m];
					newIcoVertices[m+1] = icoVertices[m+1];
					newIcoVertices[m+2] = icoVertices[m+2];
			}


			icoFaces = newIcoFaces;


		} else {

			// Leave everything as it is

			newIcoVertices = new Float32Array(icoVertices.length);
			newIcoFaces = new Float32Array(icoFaces.length);
			
			for(var l = 0; l <= icoFaces.length - 1; l++) {
					newIcoFaces[l] = icoFaces[l];	
				
			}

			for(var m = 0; m <= icoVertices.length - 1; m++) {
					newIcoVertices[m] = icoVertices[m];
			}
		}

	}
 	





var buffers = [newIcoVertices, newIcoFaces, debugPoints];

self.postMessage(buffers);

}, false);