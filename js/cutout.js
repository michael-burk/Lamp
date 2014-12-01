var closestFace;
var closestDistance;

//Input Buffer
var selectedVertices;
var icoVertices;
var icoFacesCentroid;
var icoFaces;

var newIcoVertices;
var newIcoFaces;
var debugPoints;
var subDivisionPoints;

var closestFaces = [];
var deleteFacesTopIndices = [];


// Output ArrayBuffer
 var cutOut;

self.addEventListener('message', function(e) {

importScripts('THREE.js');  

//Input Buffer
 selectedVertices = e.data[0];
 icoVertices = e.data[1];
 icoFacesCentroid = e.data[2];
 icoFaces = e.data[3];

 newIcoVertices = new Float32Array();
 newIcoFaces = new Float32Array();
 debugPoints;
 subDivisionPoints = [];

// Output ArrayBuffer
 cutOut = new Float32Array(icoFaces.length / 3);



	console.log("work, work!");
	console.log("selected length: " + selectedVertices.length);

 	for ( var i = 0; i <= selectedVertices.length - 3; i += 3 ) {


 		//console.log("selected" + i);

 		// Test collision with lamp (Ico Mesh)

 		var vertex = new THREE.Vector3(selectedVertices[i],selectedVertices[i+1],selectedVertices[i+2]);
 		var direction = vertex.sub(new THREE.Vector3(0,0,0));

		direction.normalize();

		var myRaycaster = new THREE.Raycaster(vertex, direction);

		var faceCounter = 0;
		

		closestDistance = 100000;

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

 		if(closestDistance <= 2 && closestDistance >= .04) {
 			closestFaces.push(closestFace);
 		}	

 		

	}

	if(closestFaces.length > 0){

		subdivide(closestFaces);

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

 	

var buffers = [newIcoVertices, newIcoFaces, debugPoints];

self.postMessage(buffers);

}, false);




function subdivide(hitFaces){


		console.log(closestFaces);
		var deleteFaces = [];
		var top = 0;
		deleteFacesTopIndices = [];
			
		for (var i = 0; i <= hitFaces.length - 1; i++) {

			var closestFace = hitFaces[i];

			// Get adjacent faces of closestFace

			var faceCounter = 0;
			var counter = 0;
			var counterOld = 0;
			var top2 = 0;
			
			console.log("closestFace " + closestFace);

			// Which faces have a common index with closestFace
			for (var l = 0; l <= icoFaces.length - 3; l+=3) {

				for (var p = 0; p <= 2; p++) {
					// List of face indices at the position closestFace * 3 (because xyz) + addition (p) for xyz
					
					if( icoFaces[l + p] == icoFaces[closestFace * 3 + 0]){
						counter ++;
					}else{
						top = icoFaces[l + p];
					}

					if(icoFaces[l + p] == icoFaces[closestFace * 3 + 1]){
						counter ++;
					}else{
						top = icoFaces[l + p];
					}

					if(icoFaces[l + p] == icoFaces[closestFace * 3 + 2]){
						counter ++;
					}else{
						top = icoFaces[l + p];
					}

					// if(counter > counterOld){
					// 	top = 0;
					// }

					if(counter == counterOld){
						top2 = top;
					}
					
					counterOld = counter;

				}


				//  Two common indices
				if(counter == 2){
					deleteFaces.push(faceCounter);
					deleteFacesTopIndices.push(top2);
				} 

				top = 0;
				top2 = 0;


				counter = 0;
				counterOld = 0;

				faceCounter++;
			}


			console.log("deleteFaces " + deleteFaces);
			console.log("deleteFacesTopIndices " + deleteFacesTopIndices);

		}



			// Creating new arrays for subdivision

			// Same length as before + three new vertices for every hitFace
			newIcoVertices = new Float32Array(icoVertices.length + (hitFaces.length * 3 * 3));

			// Same length as before + three new faces for hitface + two new faces for every adjacent face (deleteFaces)
			newIcoFaces = new Float32Array(icoFaces.length + (hitFaces.length * 4 * 3) + (deleteFaces.length * 2 * 3));
			
			var idCounter = 0;
			var deleteCounter = 0;

			for (var l = 0; l <= newIcoFaces.length - 3; l+=3) {

				// Does this face appear in the deleteFaces list?
				for (var p = 0; p <= deleteFaces.length - 1; p++) {
					if(idCounter == deleteFaces[p]){
						deleteCounter ++;
					}
				}

			//	console.log(idCounter);
			//	console.log(closestFace);


				// Does this face appear in the deleteFaces list? 
				if(deleteCounter <= 0){
					newIcoFaces[l] = icoFaces[l];
					newIcoFaces[l+1] = icoFaces[l+1];	
					newIcoFaces[l+2] = icoFaces[l+2];		
				}
				// If so, delete
				if(deleteCounter > 0 || idCounter == closestFace){
					newIcoFaces[l] = 0;
					newIcoFaces[l+1] = 0;
					newIcoFaces[l+2] = 0;
				} 
				
				idCounter++;
				deleteCounter = 0;

			}


			// Reconstruct Faces


			// The points of the faces, that are to be subdivided (including adjacent faces)
			for (var p = 0; p <= deleteFaces.length - 1; p++) {
					subDivisionPoints.push(new THREE.Vector3( icoVertices[icoFaces[ deleteFaces[p]*3 +0]* 3 +0],
															  icoVertices[icoFaces[ deleteFaces[p]*3 +0]* 3 +1],
															  icoVertices[icoFaces[ deleteFaces[p]*3 +0]* 3 +2]));
					subDivisionPoints.push(new THREE.Vector3( icoVertices[icoFaces[ deleteFaces[p]*3 +1]* 3 +0],
															  icoVertices[icoFaces[ deleteFaces[p]*3 +1]* 3 +1],
															  icoVertices[icoFaces[ deleteFaces[p]*3 +1]* 3 +2]));
					subDivisionPoints.push(new THREE.Vector3( icoVertices[icoFaces[ deleteFaces[p]*3 +2]* 3 +0],
															  icoVertices[icoFaces[ deleteFaces[p]*3 +2]* 3 +1],
															  icoVertices[icoFaces[ deleteFaces[p]*3 +2]* 3 +2]));
			}
			
			// Data for debug boxes
			debugPoints = new Float32Array(subDivisionPoints.length * 3 + 3);

			var counter = 0;
			for(var u = 0; u <= debugPoints.length -3 -3; u +=3){
				debugPoints[u] = subDivisionPoints[counter].x;
				debugPoints[u+1] = subDivisionPoints[counter].y;
				debugPoints[u+2] = subDivisionPoints[counter].z;
				counter ++;
			}
		



			// Keep all old vertices
			idCounter = 0;
			for (var m = 0; m <= newIcoVertices.length - 3; m+=3) {
					newIcoVertices[m] = icoVertices[m];
					newIcoVertices[m+1] = icoVertices[m+1];
					newIcoVertices[m+2] = icoVertices[m+2];
			}


			var newVertices = [];
			var hitFaceID = 0;

			// Calculate new vertices
			for (var p = 0; p <= hitFaces.length * 3 - 3; p+=3) {

				//three centroids of hitFace outlines

				var v0 = new THREE.Vector3( icoVertices[icoFaces[ hitFaces[hitFaceID]*3+0]* 3 +0],
											icoVertices[icoFaces[ hitFaces[hitFaceID]*3+0]* 3 +1],
											icoVertices[icoFaces[ hitFaces[hitFaceID]*3+0]* 3 +2]);
				var v1 = new THREE.Vector3( icoVertices[icoFaces[ hitFaces[hitFaceID]*3+1]* 3 +0],
											icoVertices[icoFaces[ hitFaces[hitFaceID]*3+1]* 3 +1],
											icoVertices[icoFaces[ hitFaces[hitFaceID]*3+1]* 3 +2]);
				var v2 = new THREE.Vector3( icoVertices[icoFaces[ hitFaces[hitFaceID]*3+2]* 3 +0],
											icoVertices[icoFaces[ hitFaces[hitFaceID]*3+2]* 3 +1],
											icoVertices[icoFaces[ hitFaces[hitFaceID]*3+2]* 3 +2]);



				var centroid0 = v0.clone().add(v1.clone());
				var centroid1 = v1.clone().add(v2.clone());
				var centroid2 = v0.clone().add(v2.clone());

				centroid0.divideScalar(2);
				centroid1.divideScalar(2);
				centroid2.divideScalar(2);

				newVertices.push(centroid0);
				newVertices.push(centroid1);
				newVertices.push(centroid2);

				debugPoints[debugPoints.length - 3 + 0] = centroid2.x;
				debugPoints[debugPoints.length - 3 + 1] = centroid2.y;
				debugPoints[debugPoints.length - 3 + 2] = centroid2.z;

				hitFaceID ++;
			}

			//console.log(newVertices);

			// Add new vertices
			var offset =  icoVertices.length;
			var vertexCounter = 0;
			var newVertexIDs = [];
			for (var p = 0; p <= hitFaces.length * 3 * 3 - 3; p+=3) {
				newIcoVertices[offset + p + 0] = newVertices[vertexCounter].x;
				newIcoVertices[offset + p + 1] = newVertices[vertexCounter].y;
				newIcoVertices[offset + p + 2] = newVertices[vertexCounter].z;
				newVertexIDs.push(offset + p);
				vertexCounter ++;
			}

			console.log("newVertexIDs :" + newVertexIDs);


			//Add new faces

			var offset = icoFaces.length;
			var faceCounter = 0;

			//console.log("hitFaces " + hitFaces);

			// Loop for all hitFaces?
			/////////////////////////////////////////////////////////////////

			for (var p = 0; p <= 9 - 3; p+=3) {

					newIcoFaces[offset + p + 0] = newVertexIDs[faceCounter] / 3;
					newIcoFaces[offset + p + 1] = icoFaces[ hitFaces[0] * 3 + faceCounter ];
					newIcoFaces[offset + p + 2] = newVertexIDs[(faceCounter+2)%3] / 3;
					faceCounter++;
					
			}

			// Center Polygon
			newIcoFaces[offset + 9 + 0] = newVertexIDs[0] / 3;
			newIcoFaces[offset + 9 + 1] = newVertexIDs[1] / 3;
			newIcoFaces[offset + 9 + 2] = newVertexIDs[2] / 3;

			// newIcoFaces[offset + 9 + 0] = 1;
			// newIcoFaces[offset + 9 + 1] = 1;
			// newIcoFaces[offset + 9 + 2] = 1;

			

			offset += hitFaces.length * 4 * 3;
			faceCounter = 0;
			for (var q = 0; q <= deleteFaces.length * 2 * 3 -3; q+=6) {
					
					newIcoFaces[offset + q + 0] = newVertexIDs[faceCounter] / 3;
					newIcoFaces[offset + q + 1] = icoFaces[ hitFaces[0] * 3 + faceCounter ];
					newIcoFaces[offset + q + 2] = deleteFacesTopIndices[(faceCounter + 1) % 3];
					newIcoFaces[offset + q + 3] = icoFaces[ hitFaces[0] * 3 + (faceCounter + 1) % 3 ];
					newIcoFaces[offset + q + 4] = newVertexIDs[faceCounter] / 3;
					newIcoFaces[offset + q + 5] = deleteFacesTopIndices[(faceCounter + 1) % 3];

					faceCounter ++;
			}


			icoFaces = newIcoFaces;
}