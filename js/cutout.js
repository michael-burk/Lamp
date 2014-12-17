var closestFace;
var closestDistance;

//Input Buffer
var selectedVertices;
var icoVertices;
var icoFacesCentroids;
var newCentroids = [];
var icoFaces;

var newIcoVertices;


var newIcoFaces;
var newIcoFacesArray  = [];

var debugPoints;
var debugPointsArray = [];

var subDivisionPoints;

var closestFaces = [];
var deleteFacesTopIndices = [];
var deleteFaces = [];
var hitFaces = [];
var hitFaceCountOld = 0;

var depth = 6;
var depthCounter = 0;


self.addEventListener('message', function(e) {

importScripts('THREE.js');  

//Input Buffer
 selectedVertices = e.data[0];
 icoVertices = e.data[1];
 icoFacesCentroids = e.data[2];
 icoFaces = e.data[3];

 newIcoVertices = new Float32Array();
 newIcoFaces = new Float32Array();
 debugPoints;
 subDivisionPoints = [];



console.log("work, work!");
//console.log("selected length: " + selectedVertices.length);

hitTest();

debugPoints = new Float32Array(debugPointsArray.length);
debugPoints = debugPointsArray;
 	
//debugPoints
var buffers = [newIcoVertices, newIcoFaces,debugPoints];

self.postMessage(buffers);

}, false);



function hitTest(){

	deleteFaces = [];
	deleteFacesTopIndices = [];
	closestFaces = [];

	for ( var i = 0; i <= selectedVertices.length - 3; i += 3 ) {


 		// Test collision with lamp (Ico Mesh)

 		var vertex = new THREE.Vector3(selectedVertices[i],selectedVertices[i+1],selectedVertices[i+2]);
 		var direction = vertex.sub(new THREE.Vector3(0,0,0));

		direction.normalize();

		var myRaycaster = new THREE.Raycaster(vertex, direction);

		var faceCounter = 0;
		
		

		closestDistance = 100000;

		// Get closestFace and closestDistance
 		for (var j =0; j <= icoFacesCentroids.length -3; j+=3) {

 			// Center of Face
			var centroid = new THREE.Vector3(icoFacesCentroids[j],icoFacesCentroids[j+1],icoFacesCentroids[j+2]);

 			if(myRaycaster.ray.distanceToPoint(centroid) <= closestDistance){
 					closestDistance = myRaycaster.ray.distanceToPoint(centroid);
 					closestFace = faceCounter;
 			}

 			faceCounter ++;
 			
 		}


 		var clone = false;
 		if(closestDistance <= 2 && closestDistance >= .0001) {
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
}

function subdivide(){

	newCentroids = [];
	newIcoFacesArray = [];


	calcDeleteFaces();


	//console.log(deleteFacesTopIndices);


	// Creating new arrays for subdivision

	// Same length as before + three new vertices for every hitFace
	newIcoVertices = new Float32Array(icoVertices.length + (hitFaces.length * 3 * 3));

	// Same length as before + three new faces for hitface + two new faces for every adjacent face (deleteFaces)
	//newIcoFaces = new Float32Array(icoFaces.length + (hitFaces.length * 4 * 3) + (deleteFaces.length * 2 * 3));
	


	//////////////////////////////////
	// Calculate new vertices
	//////////////////////////////////

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

		// centroid0.divideScalar(1.99);
		// centroid1.divideScalar(1.99);
		// centroid2.divideScalar(1.99);

		centroid0.divideScalar(2);
		centroid1.divideScalar(2);
		centroid2.divideScalar(2);


		var sub = new THREE.Vector3(0,0,0);

		// var offset = centroid0.copy().sub(sub.copy());
		
		// centroid0 += offset *.1;

		// var offset = centroid1.copy().sub(sub.copy());
		
		// centroid1 += offset *.1;

		// var offset = centroid2.copy().sub(sub.copy());
		
		// centroid2 += offset *.1;

	
		var c0 = false;
		var c1 = false;
		var c2 = false;	

		var c0Clones = [];
		var c1Clones = [];
		var c2Clones = [];


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


	// Check for clone Vertices
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


	/////////////////////////////////////////
	// Reconstruct Faces
	/////////////////////////////////////////

	// Keep old faces

	var idCounter = 0;
	var deleteCounter = 0;

	for (var l = 0; l <= icoFaces.length - 3; l+=3) {

		// Does this face appear in the deleteFaces list?
		for (var p = 0; p <= deleteFaces.length - 1; p++) {
			if(idCounter == deleteFaces[p]){
				deleteCounter ++;
			}
		}

		// Does this face appear in the hitFaces list? 
		for (var q = 0; q <= hitFaces.length - 1; q++) {
			var closestFace = hitFaces[q];
			if(idCounter == closestFace){
				deleteCounter ++;
			}
		}


		if(deleteCounter == 0){

			newIcoFacesArray.push(icoFaces[l]);
			newIcoFacesArray.push(icoFaces[l+1]);
			newIcoFacesArray.push(icoFaces[l+2]);	

			// Keep these centroids
			var v1 = new THREE.Vector3( icoFacesCentroids[l+0],
										icoFacesCentroids[l+1],
										icoFacesCentroids[l+2] );
		
			// debugPointsArray.push(v1.x);
			// debugPointsArray.push(v1.y);
			// debugPointsArray.push(v1.z);

			newCentroids.push(v1.x);
			newCentroids.push(v1.y);
			newCentroids.push(v1.z);
		}
		
		idCounter++;
		deleteCounter = 0;

	}



	//Subdividing HitFace

	var faceOffset = icoFaces.length;
	var faceCounter = 0;
	faceCounter = 0;

	// Outer Polygons of HitFace
	for (var l = 0; l <= hitFaces.length - 1; l++) {

		for (var p = 0; p <= 9 - 3; p+=3) {

			var a = icoFaces[ hitFaces[l] * 3 + faceCounter % 3 ];
			var b = newVertexIDs[ l * 3 + (faceCounter) % 3] / 3;
			var c = newVertexIDs[ l * 3 + (faceCounter + 2) % 3 ] / 3;
			
			newIcoFacesArray.push(a);
			newIcoFacesArray.push(b);
			newIcoFacesArray.push(c);

			
			// Calculate new CENTROID

			var v0 = new THREE.Vector3( newIcoVertices[a*3 + 0],
										newIcoVertices[a*3 + 1],
										newIcoVertices[a*3 + 2] );

			var v1 = new THREE.Vector3( newIcoVertices[b*3 + 0],
										newIcoVertices[b*3 + 1],
										newIcoVertices[b*3 + 2] );

			var v2 = new THREE.Vector3( newIcoVertices[c*3 + 0],
										newIcoVertices[c*3 + 1],
										newIcoVertices[c*3 + 2] );
			
			var addition = v0.clone().add(v1.clone()).add(v2.clone());

			var centroid = addition.divideScalar(3);

			// debugPointsArray.push(centroid.x);
			// debugPointsArray.push(centroid.y);
			// debugPointsArray.push(centroid.z);

			newCentroids.push(centroid.x);
			newCentroids.push(centroid.y);
			newCentroids.push(centroid.z);
			


			faceCounter++;
				
		}

	}

	for (var l = 0; l <= hitFaces.length - 1; l++) {
	
		// Center Polygon

			if(depthCounter < depth -1){
				
	
			

				var a = newVertexIDs[0+(l*3)] / 3;
				var b = newVertexIDs[1+(l*3)] / 3;
				var c = newVertexIDs[2+(l*3)] / 3;

				newIcoFacesArray.push(a);
				newIcoFacesArray.push(b);
				newIcoFacesArray.push(c);


				// Calculate new CENTROID

				var v0 = new THREE.Vector3( newIcoVertices[a*3 + 0],
											newIcoVertices[a*3 + 1],
											newIcoVertices[a*3 + 2] );

				var v1 = new THREE.Vector3( newIcoVertices[b*3 + 0],
											newIcoVertices[b*3 + 1],
											newIcoVertices[b*3 + 2] );

				var v2 = new THREE.Vector3( newIcoVertices[c*3 + 0],
											newIcoVertices[c*3 + 1],
											newIcoVertices[c*3 + 2] );
				
				var addition = v0.clone().add(v1.clone()).add(v2.clone());

				var centroid = addition.divideScalar(3);

				// debugPointsArray.push(centroid.x);
				// debugPointsArray.push(centroid.y);
				// debugPointsArray.push(centroid.z);

				newCentroids.push(centroid.x);
				newCentroids.push(centroid.y);
				newCentroids.push(centroid.z);


			}



	}


	/////////////////////////////
	//Add new outer faces
	/////////////////////////////

	faceOffset += hitFaces.length * 4 * 3;

	var face;
	var skipCounter = 0;

	for (var h = 0; h <= hitFaces.length - 1; h++) {
		face = h * 6 * 3;
		faceCounter = 0;


		for (var q = 0; q <= (newVertexIDs.length/hitFaces.length)*2 -2; q+=2) {

				clone = cloneVertices[faceCounter+h*3];
			

				if(clone == 0){

					// Clockwise indices sorting for normals

					var a = deleteFacesTopIndices[faceCounter+h*3];
					var b = newVertexIDs[faceCounter+h*3] / 3;
					var c = icoFaces[ hitFaces[h] * 3 + faceCounter ];

					var d = deleteFacesTopIndices[faceCounter+h*3];
					var e = icoFaces[ hitFaces[h] * 3 + (faceCounter+1)%3];
					var f = newVertexIDs[faceCounter+h*3] / 3;

					newIcoFacesArray.push(a);
					newIcoFacesArray.push(b);
					newIcoFacesArray.push(c);

					newIcoFacesArray.push(d);
					newIcoFacesArray.push(e);
					newIcoFacesArray.push(f);


					// Calculate new CENTROID

					var v0 = new THREE.Vector3( newIcoVertices[a*3 + 0],
												newIcoVertices[a*3 + 1],
												newIcoVertices[a*3 + 2] );

					var v1 = new THREE.Vector3( newIcoVertices[b*3 + 0],
												newIcoVertices[b*3 + 1],
												newIcoVertices[b*3 + 2] );

					var v2 = new THREE.Vector3( newIcoVertices[c*3 + 0],
												newIcoVertices[c*3 + 1],
												newIcoVertices[c*3 + 2] );
					
					var addition = v0.clone().add(v1.clone()).add(v2.clone());

					var centroid = addition.divideScalar(3);

					// debugPointsArray.push(centroid.x);
					// debugPointsArray.push(centroid.y);
					// debugPointsArray.push(centroid.z);

					newCentroids.push(centroid.x);
					newCentroids.push(centroid.y);
					newCentroids.push(centroid.z);



					var v3 = new THREE.Vector3( newIcoVertices[d*3 + 0],
												newIcoVertices[d*3 + 1],
												newIcoVertices[d*3 + 2] );

					var v4 = new THREE.Vector3( newIcoVertices[e*3 + 0],
												newIcoVertices[e*3 + 1],
												newIcoVertices[e*3 + 2] );

					var v5 = new THREE.Vector3( newIcoVertices[f*3 + 0],
												newIcoVertices[f*3 + 1],
												newIcoVertices[f*3 + 2] );
					
					var addition = v3.clone().add(v4.clone()).add(v5.clone());

					var centroid = addition.divideScalar(3);

					// debugPointsArray.push(centroid.x);
					// debugPointsArray.push(centroid.y);
					// debugPointsArray.push(centroid.z);

					newCentroids.push(centroid.x);
					newCentroids.push(centroid.y);
					newCentroids.push(centroid.z);




				}			
				
				faceCounter ++;
		}

	}
	

	newIcoFaces = new Float32Array(newIcoFacesArray.length);


	for (var h = 0; h <= newIcoFaces.length - 1; h++) {
		newIcoFaces[h] = newIcoFacesArray[h];
	}

	icoFaces = newIcoFaces;


	icoFacesCentroids = new Float32Array(newCentroids.length);

	for (var h = 0; h <= newIcoFaces.length - 1; h++) {
		icoFacesCentroids[h] = newCentroids[h];
	}


	icoVertices = new Float32Array(newIcoVertices.length);

	for (var h = 0; h <= icoVertices.length - 1; h++) {
		icoVertices[h] = newIcoVertices[h];
	}

	depthCounter++;

	if(depthCounter < depth){
		hitTest();
	}

}

function calcDeleteFaces(){
		
		var top = 0;

			
		for (var i = 0; i <= hitFaces.length - 1; i++) {

			var closestFace = hitFaces[i];
			//console.log("closestFace " + closestFace);
			// Get adjacent faces of closestFace

			var faceCounter = 0;
			var counterA = 0;
			var counterB = 0;
			var counter = 0;
			var counterOld = 0;
			var top2 = 0;

			compareAll(icoFaces[closestFace * 3 + 0], icoFaces[closestFace * 3 + 1]);
			compareAll(icoFaces[closestFace * 3 + 1], icoFaces[closestFace * 3 + 2]);
			compareAll(icoFaces[closestFace * 3 + 2], icoFaces[closestFace * 3 + 0]);
	

		}
						
		var sameIndices = [];
		var top;

		function compareAll(a,b){
			
			faceCounter = 0;
			counterA = 0;
			counterB = 0;
			

			for (var l = 0; l <= icoFaces.length - 3; l+=3) {
				sameIndices = [];
				if( icoFaces[l] == a){
						counterA++;
						sameIndices.push(a);
				}else if( icoFaces[l] == b){
						counterB++;
						sameIndices.push(b);
				}else{
					top = icoFaces[l];
				}

				if( icoFaces[l+1] == a){
						counterA++;
						sameIndices.push(a);
				}else if( icoFaces[l+1] == b){
						counterB++;
						sameIndices.push(b);
				}else{
					top = icoFaces[l+1];
				}

				if( icoFaces[l+2] == a){
						counterA++;
						sameIndices.push(a);
				}else if( icoFaces[l+2] == b){
						counterB++;
						sameIndices.push(b);
				}else{
					top = icoFaces[l+2];
				}
				
				//  Two common indices
				if(counterA == 1 && counterB == 1 && faceCounter != closestFace){
					deleteFaces.push(faceCounter);
					deleteFacesTopIndices.push(top);
				} 

				counterA = 0;
				counterB = 0;
				faceCounter++;
			}
		}


		//////////////////////////////////////////////////
		// Test for double deleteFaces
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
			}

		}



		 if(hitFaceCountOld < hitFaces.length){
		 	hitFaceCountOld = hitFaces.length;
		 	deleteFaces = [];
		 	deleteFacesTopIndices = [];
		 	calcDeleteFaces();

		 }




}