var raster = new ol.layer.Tile({
    source: new ol.source.OSM()
});

var source = new ol.source.Vector({wrapX: false});

var vector = new ol.layer.Vector({
    source: source
});

if (vector) {
    console.dir(source.getProjection());
}
var map = new ol.Map({
    layers: [raster, vector],
    target: 'map',
    view: new ol.View({
        projection: 'EPSG:3857',
        center: [-11000000, 4600000],
        zoom: 4
    })
});

var typeSelect = document.getElementById('type');


function printCoordinates(interaction) {
    return (
        function (coordinates, opt_geometry) {
            if (opt_geometry) {
                
                var displayCoordinates = document.getElementById("coordinates");
                displayCoordinates.textContent = JSON.stringify(opt_geometry.getCoordinates());
                
            }
            return interaction(coordinates, opt_geometry);
        }
    )
}
var draw; // global so we can remove it later
function addInteraction() {
    var value = typeSelect.value;
    if (value !== 'None') {
        var geometryFunction;
        if (value === 'Square') {
            value = 'Circle';
            // interact here
            geometryFunction = printCoordinates(ol.interaction.Draw.createRegularPolygon(4));
        } else if (value === 'Triangle') {
            value = 'Circle';
            geometryFunction = printCoordinates(ol.interaction.Draw.createRegularPolygon(3));
        } else if (value === 'Hexagon') {
            value = 'Circle';
            geometryFunction = printCoordinates(ol.interaction.Draw.createRegularPolygon(6));
        } else if (value === 'Star') {
            value = 'Circle';
            geometryFunction = printCoordinates(function(coordinates, geometry) {
                if (!geometry) {
                    geometry = new ol.geom.Polygon(null);
                }
            var center = coordinates[0];
            var last = coordinates[1];
            var dx = center[0] - last[0];
            var dy = center[1] - last[1];
            var radius = Math.sqrt(dx * dx + dy * dy);
            var rotation = Math.atan2(dy, dx);
            var newCoordinates = [];
            var numPoints = 12;
            for (var i = 0; i < numPoints; ++i) {
                var angle = rotation + i * 2 * Math.PI / numPoints;
                var fraction = i % 2 === 0 ? 1 : 0.5;
                var offsetX = radius * fraction * Math.cos(angle);
                var offsetY = radius * fraction * Math.sin(angle);
                newCoordinates.push([center[0] + offsetX, center[1] + offsetY]);
            }
            newCoordinates.push(newCoordinates[0].slice());
            geometry.setCoordinates([newCoordinates]);
            return geometry;
            });
        }
        draw = new ol.interaction.Draw({
            source: source,
            type: value,
            geometryFunction: geometryFunction
        });
        map.addInteraction(draw);
    }
}


/**
 * Handle change event.
 */
typeSelect.onchange = function() {
    map.removeInteraction(draw);
    addInteraction();
};

addInteraction();
