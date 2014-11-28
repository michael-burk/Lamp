self.addEventListener('message', function(e) {

importScripts('THREE.js');  

//Input Buffer
var selectedVertices = e.data[0];
var icoVertices = e.data[1];
var icoFacesCentroid = e.data[2];
var icoFaces = e.data[3];

var newIcoVertices = new Float32Array();
var newIcoFaces = new Float32Array();

// Output ArrayBuffer
var cutOut = new Float32Array(icoFaces.length / 3);

	console.log("work, work!");
	//console.log(selectedVertices);

 	for ( var i = 0; i <= selectedVertices.length - 3; i += 3 ) {

 		// Test collision with lamp (Ico Mesh)

 		var vertex = new THREE.Vector3(selectedVertices[i],selectedVertices[i+1],selectedVertices[i+2]);
 		var direction = vertex.sub(new THREE.Vector3(0,0,0));

		direction.normalize();

		var myRaycaster = new THREE.Raycaster(vertex, direction);

		var faceCounter = 0;

		var closestFace;
		var closestDistance = 10000;

 		for (var j =0; j <= icoFacesCentroid.length -3; j+=3) {

 			// Center of Face
			var centroid = new THREE.Vector3(icoFacesCentroid[j],icoFacesCentroid[j+1],icoFacesCentroid[j+2]);


 			if(myRaycaster.ray.distanceToPoint(centroid) <= closestDistance){
 					closestDistance = myRaycaster.ray.distanceToPoint(centroid);
 					closestFace = faceCounter;
 			}

 			faceCounter ++;
 		
 			
 		}


 		if(closestDistance <= .04){

 				// Remove

 				// Set according slot in output buffer to 1
 				//cutOut[closestFace] = 1;

 		}

 		if(closestDistance <= 2 && closestDistance >= .04) {
 		//if(closestDistance <= .04){
			//Subdivide

			console.log("closestFace: " + closestFace);
			console.log(icoFaces);



			// Get adjacent faces of closestFace
			var faceCounter = 0;
			var deleteFaces = [];
			var counter = 0;


			// Which faces have a common indices with closestFace
			for (var l = 0; l <= icoFaces.length - 3; l+=3) {

					for (var p = 0; p <= 2; p++) {

						//console.log(closestFace+p);

						if( icoFaces[l] == icoFaces[closestFace*3+p]){
							
							counter ++;
						}

						if(icoFaces[l+1] == icoFaces[closestFace*3+p]){
							counter ++;
						}

						if(icoFaces[l+2] == icoFaces[closestFace*3+p]){
							counter ++;
						}
					}
				

				if(counter >= 2){
					deleteFaces.push(faceCounter);
					//counter = 0;
				}

				counter = 0;

				faceCounter++;
			}

			console.log(deleteFaces);
				


			newIcoVertices = new Float32Array(icoVertices.length);
			newIcoFaces = new Float32Array(icoFaces.length);
			
			var idCounter = 0;
			var deleteCounter = 0;

			for (var l = 0; l <= newIcoFaces.length - 3; l+=3) {

				for (var p = 0; p <= deleteFaces.length - 1; p++) {
					if(idCounter == deleteFaces[p]){
						deleteCounter ++;
					}
				}

				//console.log(deleteCounter);
				
				if(deleteCounter <= 0){
					newIcoFaces[l] = icoFaces[l];
					newIcoFaces[l+1] = icoFaces[l+1];	
					newIcoFaces[l+2] = icoFaces[l+2];		
				} else {
					//deleteCounter+=3;
				}
				
				idCounter++;
				deleteCounter = 0;

			};

			// newIcoFaces[newIcoFaces.length -1 ] = 42;
			// newIcoFaces[newIcoFaces.length -2 ] = 43;
			// newIcoFaces[newIcoFaces.length -3 ] = 44;


			idCounter = 0;
			for (var m = 0; m <= newIcoVertices.length - 3; m+=3) {
					newIcoVertices[m] = icoVertices[m];
					newIcoVertices[m+1] = icoVertices[m+1];
					newIcoVertices[m+2] = icoVertices[m+2];
			};

			

			// newIcoVertices[newIcoVertices.length -1 ] = 0;
			// newIcoVertices[newIcoVertices.length -2 ] = 0;
			// newIcoVertices[newIcoVertices.length -3 ] = 0;
			// newIcoVertices[newIcoVertices.length -4 ] = 2000;
			// newIcoVertices[newIcoVertices.length -5 ] = 2000;
			// newIcoVertices[newIcoVertices.length -6 ] = 2000;
			// newIcoVertices[newIcoVertices.length -7 ] = 2000;
			// newIcoVertices[newIcoVertices.length -8 ] = -2000;
			// newIcoVertices[newIcoVertices.length -9 ] = -2000;

			icoFaces = newIcoFaces;


		} else {

			// todo: aus for-loop auslagern

			newIcoVertices = new Float32Array(icoVertices.length);
			newIcoFaces = new Float32Array(icoFaces.length);
			
			for (var l = 0; l <= icoFaces.length - 1; l++) {
					newIcoFaces[l] = icoFaces[l];	
				
			};

			for (var m = 0; m <= icoVertices.length - 1; m++) {
					newIcoVertices[m] = icoVertices[m];
					
			};
		}


 		//console.log(closestDistance);

 	}


//console.log(newIcoFaces);


var buffers = [newIcoVertices, newIcoFaces];

self.postMessage(buffers);

}, false);