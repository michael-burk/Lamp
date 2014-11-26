self.addEventListener('message', function(e) {

importScripts('THREE.js');  

//Input Buffer
var selectedVertices = e.data[0];
var icoVertices = e.data[1];
var icoFacesCentroid = e.data[2];
var icoFaces = e.data[3];

// Output ArrayBuffer
var cutOut = new Float32Array(icoFaces.length / 3);

	//console.log(e.data[3]);

 	for ( var i = 0; i <= selectedVertices.length; i += 3 ) {


 		// Test collision with lamp (Ico Mesh)

 		var vertex = new THREE.Vector3(selectedVertices[i],selectedVertices[i+1],selectedVertices[i+2]);
 		var direction = vertex.sub(new THREE.Vector3(0,0,0));

		direction.normalize();

		var myRaycaster = new THREE.Raycaster(vertex, direction);

		var faceCounter = 0;

		var closestFace;
		var closetDistance = 10000;

 		for (var j =0; j <= icoFacesCentroid.length; j+=3) {

 			// Center of Face
			var centroid = new THREE.Vector3(icoFacesCentroid[j],icoFacesCentroid[j+1],icoFacesCentroid[j+2]);


 			if(myRaycaster.ray.distanceToPoint(centroid) <= closetDistance){
 					closetDistance = myRaycaster.ray.distanceToPoint(centroid);
 					closestFace = faceCounter;
 			}

 			faceCounter ++;
 		
 			if(closetDistance <= .04){

 				// Remove

 				// Set according slot in output buffer to 1
 				cutOut[closestFace] = 1;

 			} else {

 				//Subdivide

 			}
 		}

 		//console.log(closestFace);

 	}

var buffers = [icoVertices, icoFaces];

self.postMessage(buffers);

}, false);