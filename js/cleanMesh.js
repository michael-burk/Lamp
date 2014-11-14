self.addEventListener('message', function(e) {

importScripts('THREE.js');  

var distCounter = 0;

var positions1 = e.data;

var deleteArray1 = new Int32Array( positions1.length / 3);

for (var i = 0; i < deleteArray1; i++) deleteArray1[i] = 0;


var counter = 0;

for(var i = 0; i < positions1.length; i+=3){  

	var minDistance = 99999999999;
		
	for(var j = 0; j < positions1.length; j+=3){  

		var newPoint = new THREE.Vector3( positions1[ i ],	positions1[ i + 1 ] , positions1[ i + 2 ]);  

		var otherPoint = new THREE.Vector3( positions1[ j ],	positions1[ j + 1 ] , positions1[ j + 2 ]);
		var distance = new THREE.Vector3();

		distance.subVectors(otherPoint,newPoint);
		var length = distance.length();
		if(length < minDistance && length != 0){
		minDistance = length;
		}
	  
	}


	if(minDistance >= 10){
		distCounter ++;
		deleteArray1[counter] = 1;
	}

	if(i % 100 == 0){
		console.log(counter);
	}

	counter++;
}
	
  self.postMessage(deleteArray1);
}, false);

