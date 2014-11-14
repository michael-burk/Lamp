self.addEventListener('message', function(e) {

importScripts('THREE.js');  


var selectedVertices = e.data[0];
var icoVertices = e.data[1];
var icoFaces = e.data[2];


var cutOut = new Float32Array(icoFaces.length / 3);

// console.log(e.data[1]);
//console.log(e.data[2].length);


	         	for ( var i = 0; i < selectedVertices.length; i += 3 ) {



	         		// Test collision with lamp (Ico Mesh)

	         		var vertex = new THREE.Vector3(selectedVertices[i],selectedVertices[i+1],selectedVertices[i+2]);
	         		var direction = new THREE.Vector3(0,0,0);
	         		var vertexSub = vertex.clone();
	         		direction = direction.sub(vertexSub);

					direction.normalize();

					var myRaycaster = new THREE.Raycaster(vertex, direction);


					var faceCounter = 0;

	         		for (var j =0; j <= icoFaces.length; j+=3) {

	         		faceCounter ++;

						var centroid = new THREE.Vector3(icoFaces[j],icoFaces[j+1],icoFaces[j+2]);


						//console.log(myRaycaster.ray.distanceToPoint( centroid ));

	         			if(myRaycaster.ray.distanceToPoint(centroid) <= .1){
	         				

	         				//console.log("hit");

	         				//console.log(myRaycaster.ray.distanceToPoint(icoFaces[faceCounter]);


	         				// cutOut[j] = 1;
	         				// cutOut[j + 1] = 1;
	         				// cutOut[j + 2] = 1;

	         				cutOut[faceCounter] = 1;

	         			} 
	         			// else {

	         			// 	cutOut[j] = 1;
	         			// 	cutOut[j + 1] = 1;
	         			// 	cutOut[j + 2] = 1;

	         			// }
	         		
	         		};

	         	}
	
 self.postMessage(cutOut);

}, false);




