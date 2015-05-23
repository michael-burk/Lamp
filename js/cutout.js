var closestFace;
var closestDistance;

//Input Buffer
var selectedVertices;
var icoVertices;
var icoFacesCentroids;
var newCentroids = [];
var icoFaces;

var newIcoVertices;
var newVerticesArray;


var newIcoFaces;
var newIcoFacesArray  = [];

var debugPoints;
var debugPointsArray = [];

var subDivisionPoints;

var closestFaces = [];
var deleteFacesTopIndices = [];
var deleteFaces = [];
var hitFaces = [];
var holeFaces = [];


var hitFaceCountOld = 0;

var depth = 4;

var depthCounter = 1;

var centerArray = [];

var centerMode = false;

var thickness = .3 ;
var tipThickness = .1;
var holeFactor = .2;


var extrudeFactor = 1.6;


var hole = [23,28,24,34,35,36,17,25,29,33,37,41,31,18,19,26,16,32,38,39,40,42,43,30];

var holeSubdivided = [];

var holeVertices = [];


self.addEventListener('message', function(e) {

importScripts('Three.js');  


// Load Settings

extrudeFactor = e.data[4];
thickness = e.data[5];
depth = e.data[6];
tipThickness = e.data[7];
holeFactor = e.data[8];


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


var holeCounter = 0;

for (var i = 0; i <= hole.length*3 - 3; i+=3) {
	holeVertices.push( icoFaces[ hole[holeCounter]*3 + 0] );
	holeVertices.push( icoFaces[ hole[holeCounter]*3 + 1] );
	holeVertices.push( icoFaces[ hole[holeCounter]*3 + 2] );
	holeCounter++;
};

//console.log(holeVertices);
//console.log(icoFaces);
// holeVertices = [12,17,15,12,15,0];
//holeVertices = [18,20,21];





hitTest();

debugPoints = new Float32Array(debugPointsArray.length);
debugPoints = debugPointsArray;
 	
//debugPoints
var buffers = [newIcoVertices, newIcoFaces, debugPoints];

self.postMessage(buffers);

}, false);



function hitTest(){


	//console.log(icoFaces);

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

 		//console.log("initial length: " + faceCounter);

 		var clone = false;
 		if(closestDistance <= 2 && closestDistance >= .0001) {
 			for (var c =0; c <= closestFaces.length -1; c++) {
 				if(closestFaces[c] == closestFace){
 					clone = true;
 				}
 			}

 			if(!clone){
 			
 				//closestFaces.push(closestFace);

 				var leaveOut = false;

				for (var j = hole.length - 1; j >= 0; j--) {
					if(hole[j] == closestFace){
						leaveOut = true;
					}
				};

			
				if(!leaveOut){
					closestFaces.push(closestFace);
				}
 				
 			}
 			
 		}	


	}

	if(closestFaces.length > 0){

		if(!centerMode){
			hitFaces = closestFaces;
		}
		
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

	//console.log("hitFaces: " + hitFaces);	

	newCentroids = [];
	newIcoFacesArray = [];
	newVerticesArray = [];

	holeFaces = [];

	calcDeleteFaces();

	//console.log(hitFaces);
	//console.log(deleteFaces);


	centerArray = [];


	//////////////////////////////////
	// Calculate new vertices
	//////////////////////////////////

	// Keep all old vertices
	idCounter = 0;
	
	for (var m = 0; m <= icoVertices.length - 3; m+=3) {
		newVerticesArray.push(icoVertices[m]);
		newVerticesArray.push(icoVertices[m+1]);
		newVerticesArray.push(icoVertices[m+2]);
	}

	var newVertices = [];
	var hitFaceID = 0;
	var offset = newVerticesArray.length;
	var newVertexIDs = [];
	var newVertexIDs2 = [];

	var newVertexCounter = 0;

	var origin;
	var sub;


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


		

		if(centerMode){

			sub = new THREE.Vector3(0,0,0);

			sub.subVectors(centroid0,v2);

			sub.normalize();

			sub.multiplyScalar(holeFactor);

			centroid0.addVectors(centroid0,sub);



			sub = new THREE.Vector3(0,0,0);

			sub.subVectors(centroid1,v0);

			sub.normalize();

			sub.multiplyScalar(holeFactor);

			centroid1.addVectors(centroid1,sub);


			sub = new THREE.Vector3(0,0,0);

			sub.subVectors(centroid2,v1);

			sub.normalize();

			sub.multiplyScalar(holeFactor);

			centroid2.addVectors(centroid2,sub);

		}
		



		//var extrude = 3/depthCounter;
		var extrude = extrudeFactor/ depthCounter;

		origin = new THREE.Vector3(0,0,0);
		sub = new THREE.Vector3(0,0,0);

		sub.subVectors(centroid0,origin);

		sub.normalize();

		sub.multiplyScalar(extrude);

		centroid0.addVectors(centroid0,sub);




		origin = new THREE.Vector3(0,0,0);
		sub = new THREE.Vector3(0,0,0);

		sub.subVectors(centroid1,origin);

		sub.normalize();

		sub.multiplyScalar(extrude);

		centroid1.addVectors(centroid1,sub);



		origin = new THREE.Vector3(0,0,0);
		sub = new THREE.Vector3(0,0,0);

		sub.subVectors(centroid2,origin);

		sub.normalize();

		sub.multiplyScalar(extrude);

		centroid2.addVectors(centroid2,sub);



		var sub = new THREE.Vector3(0,0,0);

	
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

		newVerticesArray.push(newVertices[vertexCounter].x);
		newVerticesArray.push(newVertices[vertexCounter].y);
		newVerticesArray.push(newVertices[vertexCounter].z);


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


	// Fill Buffer

	newIcoVertices =  new Float32Array(newVerticesArray.length);

	for (var v = 0; v <= newVerticesArray.length - 1; v++) {
		newIcoVertices[v] = newVerticesArray[v];
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
		

			newCentroids.push(v1.x);
			newCentroids.push(v1.y);
			newCentroids.push(v1.z);
		}
		
		idCounter++;
		deleteCounter = 0;

	}



	////////////////////////////
	// Reconstruct hole faces
	////////////////////////////

	//console.log(newIcoFacesArray);

	hole = [];

	for (var r = 0; r <= holeVertices.length*3 - 3; r+=3) {

		var faceCounter = 0;
		for (var t = 0; t <= newIcoFacesArray.length*3 - 3; t+=3) {
			
			var counter = 0;
			
			for (var z = 0; z <= 2; z++) {
				
				if(holeVertices[r + 0] == newIcoFacesArray[t + z]){
					counter ++;
				}
				if(holeVertices[r + 1] == newIcoFacesArray[t + z]){
					counter ++;
				}
				if(holeVertices[r + 2] == newIcoFacesArray[t + z]){
					counter ++;
				}
			};

			if(counter == 3){

				hole.push(faceCounter);
				continue;
			}

			faceCounter++;
		};


		
	};

	
	//console.log("new hole list: " + hole);




	////////////////////////////
	//Subdividing HitFace
	////////////////////////////


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


			newCentroids.push(centroid.x);
			newCentroids.push(centroid.y);
			newCentroids.push(centroid.z);
			


			faceCounter++;
				
		}

	}

	for (var l = 0; l <= hitFaces.length - 1; l++) {
	
		// Center Polygon

		

		//	if(depthCounter < depth ){
				

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


				newCentroids.push(centroid.x);
				newCentroids.push(centroid.y);
				newCentroids.push(centroid.z);

				

	//		}

			
			centerArray.push(newIcoFacesArray.length/3 -1);

	}


	/////////////////////////////
	//Add new outer faces
	/////////////////////////////

	//console.log("aktuelle länge: " + newIcoFacesArray.length);

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

					holeVertices.push(a);
					holeVertices.push(b);
					holeVertices.push(c);

					holeVertices.push(d);
					holeVertices.push(e);
					holeVertices.push(f);


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

					newCentroids.push(centroid.x);
					newCentroids.push(centroid.y);
					newCentroids.push(centroid.z);


					//Check for holeFaces

					for (var i = holeFaces.length - 1; i >= 0; i--) {
						if(holeFaces[i] == deleteFacesTopIndices[faceCounter+h*3]){
						//	console.log(newIcoFacesArray.length);
							hole.push(((newIcoFacesArray.length) / 3)-1);
							hole.push(((newIcoFacesArray.length) / 3)-2);

						}
					};


				}			

				

				faceCounter ++;

		}

		//console.log("newIcoFaces.length: " + newIcoFacesArray.length);
		// console.log(newIcoFacesArray.length);
		//console.log(hole);

		
	}
	
	//console.log(hole);
	//console.log(holeVertices);
	// Fill Buffer
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
		console.log(depthCounter);
		hitTest();
	}
	if(depthCounter < depth + 1){
		centerMode = true;
		hitFaces = centerArray.slice();
		deleteFaces = [];
		deleteFacesTopIndices = [];
		closestFaces = [];
		subdivide();
		createShell();
	}
	
}

var shellFaces = [];
var shellVertices = [];

function createShell(){


	// Add faces for inner shell
	var faceCounter = 0;
	var centerCounter = 0;

	for(var i = 0; i <= newIcoFaces.length -1; i+=3){

		var inStar = false;
		var currentStar;
		
		for(var j = 0; j <= 5; j++){
			if(faceCounter == hole[j]){
				inStar = true;
				currentStar = j;
				continue;
			}
		}

		if(faceCounter == centerArray[centerCounter]){
			centerCounter++;
		
			shellFaces.push(newIcoFaces[i]+newIcoVertices.length/3);
			shellFaces.push(newIcoFaces[i]);
			shellFaces.push(newIcoFaces[i]+newIcoVertices.length/3+1);

			shellFaces.push(newIcoFaces[i]);
			shellFaces.push(newIcoFaces[i]+1);
			shellFaces.push(newIcoFaces[i]+newIcoVertices.length/3+1);

			shellFaces.push(newIcoFaces[i+1]+newIcoVertices.length/3);
			shellFaces.push(newIcoFaces[i+1]);
			shellFaces.push(newIcoFaces[i+1]+newIcoVertices.length/3+1);

			shellFaces.push(newIcoFaces[i+1]);
			shellFaces.push(newIcoFaces[i+1]+1);
			shellFaces.push(newIcoFaces[i+1]+newIcoVertices.length/3+1);

			shellFaces.push(newIcoFaces[i+2]+newIcoVertices.length/3);
			shellFaces.push(newIcoFaces[i+2]);
			shellFaces.push(newIcoFaces[i]);

			shellFaces.push(newIcoFaces[i]);
			shellFaces.push(newIcoFaces[i]+newIcoVertices.length/3);
			shellFaces.push(newIcoFaces[i+2]+newIcoVertices.length/3);
			
			
		} else if(!inStar){

			shellFaces.push(newIcoFaces[i]);
			shellFaces.push(newIcoFaces[i+1]);	
			shellFaces.push(newIcoFaces[i+2]);

			shellFaces.push(newIcoFaces[i+1]+newIcoVertices.length/3);	
			shellFaces.push(newIcoFaces[i]+newIcoVertices.length/3);
			shellFaces.push(newIcoFaces[i+2]+newIcoVertices.length/3);

		} 


		if(inStar) {

			switch(currentStar){
			
				case 0:

					shellFaces.push(newIcoFaces[i+2]+newIcoVertices.length/3);
					shellFaces.push(newIcoFaces[i+2]);
					shellFaces.push(newIcoFaces[i+2]+newIcoVertices.length/3+2);


					shellFaces.push(newIcoFaces[i+2]);
					shellFaces.push(newIcoFaces[i+2]+2);
					shellFaces.push(newIcoFaces[i+2]+newIcoVertices.length/3+2);


					break;
				
				case 1:

					shellFaces.push(newIcoFaces[i]);
					shellFaces.push(newIcoFaces[i]+1);
					shellFaces.push(newIcoFaces[i]+newIcoVertices.length/3+1);

					shellFaces.push(newIcoFaces[i]);
					shellFaces.push(newIcoFaces[i]+newIcoVertices.length/3+1);
					shellFaces.push(newIcoFaces[i]+newIcoVertices.length/3);
					

					break;
				
				case 2:

					shellFaces.push(newIcoFaces[i]+newIcoVertices.length/3);
					shellFaces.push(newIcoFaces[i]);
					shellFaces.push(newIcoFaces[i+2]+newIcoVertices.length/3+2);

					shellFaces.push(newIcoFaces[i]);
					shellFaces.push(newIcoFaces[i+2]+2);
					shellFaces.push(newIcoFaces[i+2]+newIcoVertices.length/3+2);

					break;

				case 3:

					shellFaces.push(newIcoFaces[i+1]+newIcoVertices.length/3);
					shellFaces.push(newIcoFaces[i+1]);
					shellFaces.push(newIcoFaces[i+2]);

					shellFaces.push(newIcoFaces[i+2]);
					shellFaces.push(newIcoFaces[i+2]+newIcoVertices.length/3);
					shellFaces.push(newIcoFaces[i+1]+newIcoVertices.length/3);	

					break;

				case 4:

					shellFaces.push(newIcoFaces[i+2]);
					shellFaces.push(newIcoFaces[i+2]+newIcoVertices.length/3);
					shellFaces.push(newIcoFaces[i+1]);

					shellFaces.push(newIcoFaces[i+1]);
					shellFaces.push(newIcoFaces[i+2]+newIcoVertices.length/3);
					shellFaces.push(newIcoFaces[i+1]+newIcoVertices.length/3);
				
				

					break;

				case 5:

					shellFaces.push(newIcoFaces[i]);
					shellFaces.push(newIcoFaces[i+1]);
					shellFaces.push(newIcoFaces[i]+newIcoVertices.length/3);

					shellFaces.push(newIcoFaces[i+1]);
					shellFaces.push(newIcoFaces[i+1]+newIcoVertices.length/3);
					shellFaces.push(newIcoFaces[i]+newIcoVertices.length/3);
				

					break;


			}


		}

		faceCounter ++;
	}





	// Add old vertices
	for(var i = 0; i <= newIcoVertices.length -1; i++){
		shellVertices.push(newIcoVertices[i]);	
	}

	// Add translated vertices for shell
	var origin = new THREE.Vector3(0,0,0);
	var sub = new THREE.Vector3(0,0,0);

	var vertexCounter = 0;

	console.log(icoFacesCentroids);

	for(var i = 0; i <= newIcoVertices.length -3; i+=3){

		var hitFace = false;


		for(var j = 0; j <= centerArray.length -1; j++){

			var centerFaceIndex0 = newIcoFaces[centerArray[j]*3 + 0 ]; 
			var centerFaceIndex1 = newIcoFaces[centerArray[j]*3 + 1 ]; 
			var centerFaceIndex2 = newIcoFaces[centerArray[j]*3 + 2 ]; 

			if(vertexCounter == centerFaceIndex0 || vertexCounter == centerFaceIndex1 || vertexCounter == centerFaceIndex2){
				hitFace = true;
				var centroid = new THREE.Vector3( icoFacesCentroids[centerArray[j]*3 + 0 ],
											icoFacesCentroids[centerArray[j]*3 + 1 ],
											icoFacesCentroids[centerArray[j]*3 + 2 ] );
			}

		}

		
		var v1 = new THREE.Vector3(newIcoVertices[i],newIcoVertices[i+1],newIcoVertices[i+2]);
		
		sub = new THREE.Vector3(0,0,0);
		sub.subVectors(origin,v1);

		sub.normalize();

		if(hitFace){
			
			
			var sub2 = new THREE.Vector3(0,0,0);

			sub2.subVectors(centroid,v1);

			sub2.normalize();

			sub2.multiplyScalar(tipThickness);

			v1.addVectors(v1,sub2);


		} else {
			sub.multiplyScalar(thickness);
			v1.addVectors(v1,sub);
		}
		
		shellVertices.push(v1.x);
		shellVertices.push(v1.y);
		shellVertices.push(v1.z);
		
		

		vertexCounter++;
	}






	newIcoFaces = new Float32Array(shellFaces.length);


	for (var h = 0; h <= shellFaces.length - 1; h++) {
		newIcoFaces[h] = shellFaces[h];
	}

	icoFaces = newIcoFaces;


	newIcoVertices = new Float32Array(shellVertices.length);

	for (var h = 0; h <= shellVertices.length - 1; h++) {
		newIcoVertices[h] = shellVertices[h];
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
				
					for (var j = hole.length - 1; j >= 0; j--) {
						if(hole[j] == faceCounter){
							holeFaces.push(top);
							//console.log("new hole top found: " + faceCounter);
						}
					}


					deleteFaces.push(faceCounter);
					deleteFacesTopIndices.push(top);
					
					
				} 

				counterA = 0;
				counterB = 0;
				faceCounter++;
			}
		}


		// //////////////////////////////////////////////////
		// // Test for double deleteFaces
		// //////////////////////////////////////////////////

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