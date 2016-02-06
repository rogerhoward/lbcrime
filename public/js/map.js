
console.log('map init start');

L.mapbox.accessToken = 'pk.eyJ1Ijoicm9nZXJob3dhcmQiLCJhIjoiY2lrOXlnZHFvMGc5ZnY0a3ViMHkyYTE0dyJ9.CWAOOChPtxviw8fVB0R1mQ';
var map = L.mapbox.map('map','mapbox.comic').setView([33.793418, -118.153740], 13);

console.log('map init end');

function itemHandler(data) {
	var thisMarker = L.mapbox.featureLayer().addTo(map);

	thisDescription = sprintf("%s<br><small>%s</small>", data.address, data.time.toString());


	thisMarkerGeoJSON = {
	    // this feature is in the GeoJSON format: see geojson.org
	    // for the full specification
	    type: 'Feature',
	    geometry: {
	        type: 'Point',
	        // coordinates here are in longitude, latitude order because
	        // x, y is the standard for GeoJSON and many formats
	        coordinates: [
	          data.longitude,
	          data.latitude
	        ]
	    },
	    properties: {
	        title: data.title,
	        description: thisDescription,
	        'marker-size': 'large',
	        'marker-color': '#770000',
	        'marker-symbol': 'danger'
	    }
	};

	thisMarker.setGeoJSON(thisMarkerGeoJSON);

	thisMarker.on('mouseover', function(e) {
		e.layer.openPopup();
	});

	thisMarker.on('mouseout', function(e) {
		e.layer.closePopup();
	});

}