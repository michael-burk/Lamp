self.addEventListener('message', function(e) {

importScripts('THREE.js');  

//Input Buffer
var selectedVertices = e.data[0];
var icoVertices = e.data[1];
var icoFaces = e.data[2];

// Output ArrayBuffer
var cutOut = new Float32Array(icoFaces.length / 3);

 	for ( var i = 0; i <= selectedVertices.length; i += 3 ) {


 		// Test collision with lamp (Ico Mesh)

 		var vertex = new THREE.Vector3(selectedVertices[i],selectedVertices[i+1],selectedVertices[i+2]);
 		var direction = vertex.sub(new THREE.Vector3(0,0,0));

		direction.normalize();

		var myRaycaster = new THREE.Raycaster(vertex, direction);

		var faceCounter = 0;

 		for (var j =0; j <= icoFaces.length; j+=3) {

 			// Center of Face
			var centroid = new THREE.Vector3(icoFaces[j],icoFaces[j+1],icoFaces[j+2]);

			// Does the ray intersect with the face?
 			if(myRaycaster.ray.distanceToPoint(centroid) <= .04){
 				
 				// Set according slot in output buffer to 1
 				cutOut[faceCounter] = 1;

 			} 

 			faceCounter ++;
 		
 		}

 	}
	
 self.postMessage(cutOut);

}, false);