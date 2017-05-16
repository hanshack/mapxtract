
// map.on('mousemove', function(e) {

//     mouseOnFeature = false;
//   var features = map.queryRenderedFeatures(e.point, { layers: ["nature"] });


//   if (features.length){
//         console.log(features[0].properties.type);
//         console.log(features[0])
//     }

// })


// go = function (){

//     var layer = map.queryRenderedFeatures({ layers: ['water'] });
//     startLayer = layer[0].toJSON();
//     startLayerBuff = turf.buffer(startLayer, 1, 'meters');
//     startLayerBuff = startLayerBuff.features[0];

//     for (i = 1; i < layer.length; i++) {
//         var newLayer = layer[i].toJSON();
//         newLayer = turf.buffer(newLayer, 1, 'meters');
//         newLayer = newLayer.features[0];
//         startLayerBuff = turf.union(startLayerBuff, newLayer);
//     }
// }




    // map.addSource(
    //   "myJsonSource" , {
    //     "type": "geojson",
    //     "data": polygons
    //   }
    //   )

    // map.addLayer({
    //     "id": "polygons",
    //     "type": "line",
    //     "source": "myJsonSource",
    //     "paint": {
    //         "line-color":"red",
    //         "line-opacity":.4,
    //         "line-width":4
    //     }
    // });





     // "properties": {"fill":"red"},


// var extractFeaturesSingle = function(layer){

//     var startId = layer[0].properties.osm_id;
//     featureCollection = {};
//     featureCollection[startId] =  layer[0];

//     for (i = 1; i < layer.length; i++) {

//         var id = layer[i].properties.osm_id;

//         if(featureCollection[id] == undefined){
//             featureCollection[id] =  layer[i];
//         }
//         else{
//             var noError = true;
//             try{
//                 var union = turf.union(featureCollection[id], layer[i])
//             }
//             catch(e){
//                 noError = false;
//             }
//             finally {
//                 if (noError){
//                     featureCollection[id] = union;
//                 } 
//                 else{
//                     //If union isn't working buffer both shapes and then union.
//                     featureCollection[id] = turf.buffer(featureCollection[id], 1, 'meters').features[0];
//                     layer[i] = turf.buffer(layer[i], 1, 'meters').features[0];
//                     featureCollection[id] = turf.union(featureCollection[id], layer[i])
//                     featureCollection[id] = turf.buffer(featureCollection[id], -1, 'meters').features[0];
//                 }                      
//             }


//         } 
//     }

//     var jsonCollection = [];
//     for (x in featureCollection) {
//         jsonCollection.push(featureCollection[x]);
//     }

//     polygons = {
//       "type": "FeatureCollection",
//       "features": jsonCollection
//     };

// }


// var extractFeaturesMulti = function(layer){

//     var startLayer = layer[0].toJSON();
//     var startLayerBuff = turf.buffer(startLayer, 1, 'meters');
//     startLayerBuff = startLayerBuff.features[0];

//     for (i = 1; i < layer.length; i++) {
//         var newLayer = layer[i].toJSON();
//         newLayer = turf.buffer(newLayer, 1, 'meters');
//         newLayer = newLayer.features[0];
//         startLayerBuff = turf.union(startLayerBuff, newLayer);
//     }

//     polygons = startLayerBuff;

// }