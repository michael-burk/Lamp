self.addEventListener('message', function(e) {

importScripts('js/THREE.js');  

var positions1 = e.data;

var deleteArray = new Float32Array( positions1.length / 3 );	

var minDistance = 1000000;
var counter = 0;

for(var i = 0; i < positions1.length; i+=3){  

	
	
		// Threading simulation needed  
	for(var j = 0; j < 5000; j+=3){  

	   var newPoint = new THREE.Vector3( positions1[ i ],	positions1[ i + 1 ] , positions1[ i + 2 ])  
	  
	  var otherPoint = new THREE.Vector3( positions1[ j ],	positions1[ j + 1 ] , positions1[ j + 2 ]);
	  var distance = new THREE.Vector3();
	  
	  distance.subVectors(newPoint,otherPoint);
	  var length = distance.length();
	  if(length < minDistance && length != 0){
	    minDistance = length;
	    //console.log(distance.length());
	  }
	  
	}


	if(minDistance >= .1){
	  
		//deleteArray[counter] = 1;
	  	//console.log(minDistance);
	}

	if(i % 100 == 0){
		// self.postMessage(i);
		console.log(i);
		deleteArray[counter] = 1;
	}

	counter++;

}
	
  self.postMessage(deleteArray);
}, false);

