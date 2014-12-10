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
var deleteFaces = [];
var hitFaces = [];
var hitFaceCountOld = 0;

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

 		var clone = false;
 		if(closestDistance <= 2 && closestDistance >= .04) {
 			for (var c =0; c <= closestFaces.length -1; c++) {
 				if(closestFaces[c] == closestFace){
 					clone = true;
 				}
 			}
 			if(!clone){
 				closestFaces.push(closestFace);
 			}
 			
 		}	


	}

	if(closestFaces.length > 0){

		hitFaces = closestFaces;
		// var test = [61,62,42,41,43,40];
		// hitFaces = test;
		hitFaceCountOld = hitFaces.length;		
		subdivide();

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

 	
//debugPoints
var buffers = [newIcoVertices, newIcoFaces];

self.postMessage(buffers);

}, false);







function calcDeleteFaces(){
		
		var top = 0;
		
			
		for (var i = 0; i <= hitFaces.length - 1; i++) {

			var closestFace = hitFaces[i];

			// Get adjacent faces of closestFace
			//deleteFaces = [];
			var faceCounter = 0;
			var counter = 0;
			var counterOld = 0;
			var top2 = 0;
			
			//console.log("closestFace " + closestFace);

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


			
			

		}
		console.log("deleteFacesTopIndices " + deleteFacesTopIndices);
		console.log("hitFaces " + hitFaces);


		console.log("deleteFaces " + deleteFaces);
		

		//////////////////////////////////////////////////
		// Test needed for double deleteFaces
		//////////////////////////////////////////////////

		var newDeleteFaces = [];
		var deleteFaceCloneCounter = 0;
		var hitFacesCounter;

		for (var j = 0; j <= deleteFaces.length -1 ; j++) {
			
			deleteFaceCloneCounter = 0;

			for (var k = 0; k <= deleteFaces.length -1 ; k++) {

				if(deleteFaces[j] == deleteFaces[k]){
					deleteFaceCloneCounter++;
				}

			}

			//console.log(deleteFaceCloneCounter);


			if(deleteFaceCloneCounter > 1 ){


				hitFacesCounter = 0;

				for (var l = 0; l <= hitFaces.length -1 ; l++) {

					

					if(hitFaces[l] == deleteFaces[j]){
						hitFacesCounter++;
					}


				}

				if(hitFacesCounter == 0){
					hitFaces.push(deleteFaces[j]);
				}
				
				// console.log("double delete face!");
			}

		 }

		 console.log("hitFaces " + hitFaces);


		console.log("deleteFaces " + deleteFaces);


		 if(hitFaceCountOld < hitFaces.length){
		 	hitFaceCountOld = hitFaces.length;
		 	console.log("halloo");
		 	deleteFaces = [];
		 	deleteFacesTopIndices = [];
		 	calcDeleteFaces();

		 }


		 //hitFaces = [61,62,42,41,43,40,60];


}

function subdivide(){

		calcDeleteFaces();

		//console.log("deleteFaces " + newDeleteFaces);



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


				// Does this face appear in the deleteFaces list? 
				if(deleteCounter <= 0){
					newIcoFaces[l] = icoFaces[l];
					newIcoFaces[l+1] = icoFaces[l+1];	
					newIcoFaces[l+2] = icoFaces[l+2];		
				}

				// If so, delete
				if(deleteCounter > 0 ){
					newIcoFaces[l] = 0;
					newIcoFaces[l+1] = 0;
					newIcoFaces[l+2] = 0;
				} 

				// "Delete" hitFaces
				for (var f = 0; f <= hitFaces.length - 1; f++) {
					var closestFace = hitFaces[f];
					if(idCounter == closestFace){
						newIcoFaces[l] = 0;
						newIcoFaces[l+1] = 0;
						newIcoFaces[l+2] = 0;
					}
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
			debugPoints = new Float32Array(subDivisionPoints.length * 3);

			// var counter = 0;
			// for(var u = 0; u <= debugPoints.length -3; u +=3){
			// 	debugPoints[u] = subDivisionPoints[counter].x;
			// 	debugPoints[u+1] = subDivisionPoints[counter].y;
			// 	debugPoints[u+2] = subDivisionPoints[counter].z;
			// 	counter ++;
			// }
		

			// Keep all old vertices
			idCounter = 0;
			for (var m = 0; m <= newIcoVertices.length - 3; m+=3) {
					newIcoVertices[m] = icoVertices[m];
					newIcoVertices[m+1] = icoVertices[m+1];
					newIcoVertices[m+2] = icoVertices[m+2];
			}


			var newVertices = [];
			var hitFaceID = 0;
			var offset = icoVertices.length;
			var newVertexIDs = [];
			var newVertexCounter = 0;


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

		
				var sub = new THREE.Vector3(0,0,0);
				
			
				var c0 = false;
				var c1 = false;
				var c2 = false;	

				var c0Clones = [];
				var c1Clones = [];
				var c2Clones = [];

			//	console.log("newVertices length: " + newVertices.length);


				// Check for clone indices
				for (var q = 0; q <= newVertices.length - 1; q++) {
					
					sub = new THREE.Vector3(0,0,0);
					if(sub.subVectors(newVertices[q],centroid0).length() == 0){
						c0 = true;
						c0Clones.push(offset + q*3);
					}
						
					sub = new THREE.Vector3(0,0,0);
					if(sub.subVectors(newVertices[q],centroid1).length() == 0){
						c1 = true;
						c1Clones.push(offset + q*3);

					}
						
					sub = new THREE.Vector3(0,0,0);
					if(sub.subVectors(newVertices[q],centroid2).length() == 0){
						c2 = true;
						c2Clones.push(offset + q*3);
					}
					
				}



				if(!c0){
					newVertices.push(centroid0);
					newVertexIDs.push(offset-3 + newVertices.length*3);
					newVertexCounter++;
				}else{
					for (var c = 0; c <= c0Clones.length - 1; c++) {
						newVertexIDs.push(c0Clones[c]);
						newVertexCounter++;
					}

				}

				if(!c1){
					newVertices.push(centroid1);
					newVertexIDs.push(offset-3 + newVertices.length*3);
					newVertexCounter++;
				}else{
					for (var c = 0; c <= c1Clones.length - 1; c++) {
						newVertexIDs.push(c1Clones[c]);
						newVertexCounter++;
					}
				}

				if(!c2){
					newVertices.push(centroid2);
					newVertexIDs.push(offset-3 + newVertices.length*3);
					newVertexCounter++;
				}else{
					for (var c = 0; c <= c2Clones.length - 1; c++) {
						newVertexIDs.push(c2Clones[c]);
						newVertexCounter++;
					}
				}
				

				// newVertices.push(centroid0);
				// newVertices.push(centroid1);
				// newVertices.push(centroid2);

				hitFaceID ++;
			}


			// Add new vertices
			
			var vertexCounter = 0;
			
			for (var p = 0; p <= newVertices.length * 3 - 3; p+=3) {
				newIcoVertices[offset + p + 0] = newVertices[vertexCounter].x;
				newIcoVertices[offset + p + 1] = newVertices[vertexCounter].y;
				newIcoVertices[offset + p + 2] = newVertices[vertexCounter].z;
				
				vertexCounter ++;
			}

			var cloneVertices = [];
			for (var v = 0; v <= newVertexIDs.length - 1; v++) {
				var clone = 0;
				for (var w = 0; w <= newVertexIDs.length - 1; w++) {
					if(newVertexIDs[v] == newVertexIDs[w]){
						clone ++;
					}
				}
				if(clone>1){
					cloneVertices.push(1);
				}else{
					cloneVertices.push(0);
				}
			}

			// console.log("newVertexIDs: " + newVertexIDs);
			// console.log("clones: " + cloneVertices);
			// console.log("newVertexCounter: " + newVertexCounter);


			//Add new faces


			//Subdividing HitFace

			var faceOffset = icoFaces.length;
			var faceCounter = 0;
			faceCounter = 0;

			// Outer Polygons of HitFace
			for (var l = 0; l <= hitFaces.length - 1; l++) {

				

				for (var p = 0; p <= 9 - 3; p+=3) {

					newIcoFaces[faceOffset + (l*9) + p + 0] = icoFaces[ hitFaces[l] * 3 + faceCounter%3 ];
					newIcoFaces[faceOffset + (l*9) + p + 1] = newVertexIDs[ l*3 + (faceCounter)%3] / 3;
					newIcoFaces[faceOffset + (l*9) + p + 2] = newVertexIDs[  l*3 + (faceCounter+2) %3 ] / 3;

					// newIcoFaces[faceOffset + (l*9) + p + 0] = 1;
					// newIcoFaces[faceOffset + (l*9) + p + 1] = 1;
					// newIcoFaces[faceOffset + (l*9) + p + 2] = 1;
					faceCounter++;
						
				}

			}

			//faceOffset+=9;

			for (var l = 0; l <= hitFaces.length - 1; l++) {
				// Center Polygon
				newIcoFaces[faceOffset + faceCounter*3 + (l*3) + 0] = newVertexIDs[0+(l*3)] / 3;
				newIcoFaces[faceOffset + faceCounter*3 + (l*3) + 1] = newVertexIDs[1+(l*3)] / 3;
				newIcoFaces[faceOffset + faceCounter*3 + (l*3) + 2] = newVertexIDs[2+(l*3)] / 3;

				// newIcoFaces[faceOffset + faceCounter*3 + (l*3) + 0] = 0;
				// newIcoFaces[faceOffset + faceCounter*3 + (l*3) + 1] = 0;
				// newIcoFaces[faceOffset + faceCounter*3 + (l*3) + 2] = 0;
			}



			



			// Sort deleteFacesTopIndices
			/////////////////////////////////////////////////

			var sorted = [];
			var smallestValue;
			var face;
			
			for (var h = 0; h <= hitFaces.length - 1; h++) {
				smallestValue = 10000;
				face = h*3;

				for (var p = 0; p <= 3 - 1; p++) {
				
					
					var v2 = new THREE.Vector3( newIcoVertices[newVertexIDs[p+face]],
												newIcoVertices[(newVertexIDs[p+face]) + 1],
												newIcoVertices[(newVertexIDs[p+face]) + 2]);


					smallestValue = 10000;

					for (var q = 0; q <= 3 - 1; q++) {
						
						var v1 = new THREE.Vector3( newIcoVertices[deleteFacesTopIndices[q+face] * 3],
											    	newIcoVertices[(deleteFacesTopIndices[q+face]  * 3) + 1],
											   		newIcoVertices[(deleteFacesTopIndices[q+face]  * 3) + 2]);

						 var sub = new THREE.Vector3(0,0,0);
						 sub.subVectors(v1,v2);
					
						if(sub.length() < smallestValue){
							smallestValue = sub.length();
							sorted[p+face] = deleteFacesTopIndices[q+face];
						}
					}

				}

			}
			

			deleteFacesTopIndices = sorted;


			
			faceOffset += hitFaces.length * 4 * 3;

			var face;
			var skipCounter = 0;
			for (var h = 0; h <= hitFaces.length - 1; h++) {
				face = h * 6 * 3;
				faceCounter = 0;

				for (var q = 0; q <= deleteFacesTopIndices.length * 2 * 3 -3; q+=6) {

						clone = cloneVertices[faceCounter+h*3];


						if(clone == 0){
							// Clockwise indices sorting for normals
							newIcoFaces[faceOffset + face + q + 0] = deleteFacesTopIndices[faceCounter+h*3];
							newIcoFaces[faceOffset + face + q + 1] = newVertexIDs[faceCounter+h*3] / 3;
							newIcoFaces[faceOffset + face + q + 2] = icoFaces[ hitFaces[h] * 3 + faceCounter ];
							
							newIcoFaces[faceOffset + face + q + 3] = deleteFacesTopIndices[faceCounter+h*3];
							newIcoFaces[faceOffset + face + q + 4] = icoFaces[ hitFaces[h] * 3 + (faceCounter+1)%3];
							newIcoFaces[faceOffset + face + q + 5] = newVertexIDs[faceCounter+h*3] / 3;

						}else{
							newIcoFaces[faceOffset + face + q + 0] = 0;
							newIcoFaces[faceOffset + face + q + 1] = 0;
							newIcoFaces[faceOffset + face + q + 2] = 0;
							newIcoFaces[faceOffset + face + q + 3] = 0;
							newIcoFaces[faceOffset + face + q + 4] = 0;
							newIcoFaces[faceOffset + face + q + 5] = 0;
						}

						faceCounter ++;

				}

			}


			icoFaces = newIcoFaces;
}