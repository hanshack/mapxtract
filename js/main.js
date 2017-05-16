//Map
mapboxgl.accessToken = 'NOT-REQUIRED-WITH-YOUR-VECTOR-TILES-DATA';

var map = new mapboxgl.Map({
    container: 'map',
    style: './bright-v8.json',
    center: [13.39194537820481, 52.49885537065768],
    zoom: 16,
    zoomAnimation: true
});




//Spinner
var opts = {
  lines: 13 // The number of lines to draw
, length: 28 // The length of each line
, width: 14 // The line thickness
, radius: 42 // The radius of the inner circle
, scale: 1 // Scales overall size of the spinner
, corners: 1 // Corner roundness (0..1)
, color: '#000' // #rgb or #rrggbb or array of colors
, opacity: 0.25 // Opacity of the lines
, rotate: 0 // The rotation offset
, direction: 1 // 1: clockwise, -1: counterclockwise
, speed: 1 // Rounds per second
, trail: 60 // Afterglow percentage
, fps: 20 // Frames per second when using setTimeout() as a fallback for CSS
, zIndex: 2e9 // The z-index (defaults to 2000000000)
, className: 'spinner' // The CSS class to assign to the spinner
, top: '50%' // Top position relative to parent
, left: '50%' // Left position relative to parent
, shadow: false // Whether to render a shadow
, hwaccel: false // Whether to use hardware acceleration
, position: 'absolute' // Element positioning
}
var target = document.getElementById('map')
var spinner = new Spinner(opts);


var layers = {
    "house": {
        color:"#3C3F58",
        visibility:true,
        strokeWidth: 0.2,
        type:"fill"
    },
    "street": {
        color:"#807F7F",
        visibility:true,
        strokeWidth: 15,
        type:"line"
    },
    "nature": {
        color:"#BDDFBB",
        visibility:true,
        strokeWidth: 0.2,
        type:"fill"
    },
    "water": {
        color:"#2AA3BD",
        visibility:true,
        strokeWidth: 0.2,
        type:"fill"
    },
    "admin": {
        color:"#000",
        visibility:true,
        strokeWidth: 15,
        type:"line"
    },
    "background": {
        color:"#FFFFFF",
        visibility:true,
        strokeWidth: 15,
        type:"background"
    },
}


activelayer = "house"
$(".layer").on('click',  function (){

    if(!$(".extractWrapper").hasClass("hidden")){$(".extractWrapper").addClass("hidden");}

    $(".layer").removeClass("active");
    $(this).addClass("active");
    activelayer = $(this).attr("value");

    if (layers[activelayer].visibility){
        $(".button.visibility").addClass("active");
    }
    else{
        $(".button.visibility").removeClass("active");
    }

})


$(".visibility").on('click',  function (){

    var active = $(this).hasClass("active");
    if(active){
        $(".button.visibility").removeClass("active");
        layers[activelayer].visibility = false;
        map.setLayoutProperty(activelayer, "visibility", "none");
        // if(activelayer=="street"){map.setLayoutProperty("bridge", "visibility", "none");}
    }
    else{
        $(".button.visibility").addClass("active");
        layers[activelayer].visibility = true;
        map.setLayoutProperty(activelayer, "visibility", "visible");
        // if(activelayer=="street"){map.setLayoutProperty("bridge", "visibility", "visible");}
    }

})


var zoomActive = true;
$(".extractWrapper").on('click',  function (){

    if(!zoomActive){return}

    var hidden = $(this).hasClass("hidden");
    if(hidden){
        $(".extractWrapper").removeClass("hidden");
    }
    else{
        $(".extractWrapper").addClass("hidden");
    }

})


//Save option disabled if zoomed out
map.on('zoom', function(e) {
    var zoom = map.getZoom();
    if(zoom<=6.5){zoomActive = false; $(".extractWrapper").addClass("zoomInactive")}
    else{zoomActive = true; $(".extractWrapper").removeClass("zoomInactive")}

})


//Hide dowload on map click
$("#map").on('click',  function (){
    if(!$(".extractWrapper").hasClass("hidden")){$(".extractWrapper").addClass("hidden");}
})





//Dowload function
var clickAllowed = true;
$(".extract").on('click',  function (){

    spinner.spin(target);
    selectedFormat = $(this).attr("value");

    if(clickAllowed == false){return}
    clickAllowed = false;
    // $(".extractWrapper").addClass("hidden");


    setTimeout(function() {


        var counter = 1;
        

        //Calc Envelope
        var bbox = map.getBounds().toArray();
        var features = [
            turf.point(bbox[0]),
            turf.point(bbox[1]),
        ];
        var fc = turf.featurecollection(features);
        var envelope = turf.envelope(fc);
        var envelope3857 = reproject.reproject(envelope,'EPSG:4326','EPSG:3857',proj4.defs);
        extent = turf.extent(envelope3857);

        //SVG Header
        mySVG = '<svg xmlns="http://www.w3.org/2000/svg" width="'+$("#map").width()+'" height="'+$("#map").height()+'" x="0" y="0">';
        if(layers["background"].visibility == true){mySVG +='<rect style="fill:'+layers["background"].color +';fill-opacity:1;" width="'+$("#map").width()+'" height="'+$("#map").height()+'" x="0" y="0" />';}

        //Array for GeoJson 
        arrayWithFeatures = [];



        //Go throught each layer
        for (layerType in layers) {

            counter++

            //if not visible --> return 
            if(layers[layerType].visibility==false){

                continue
            }

            //querry layer
            if(layerType=="street"){
                layer = map.queryRenderedFeatures({ layers: ["street"] }); //bridge
            }
            else{
                layer = map.queryRenderedFeatures({ layers: [layerType] });
            }


            //if nothing there --> return 
            if(layer.length === 0){

                continue
            }



            var startId = layer[0].id;
            featureCollection = {};
            featureCollection[startId] =  layer[0];

            for (i = 1; i < layer.length; i++) {

                var id = layer[i].id;

                if(featureCollection[id] == undefined){
                    featureCollection[id] =  layer[i];
                }
                else{
                    var noError = true;
                    try{
                        var union = turf.union(featureCollection[id], layer[i])
                    }
                    catch(e){
                        noError = false;
                    }
                    finally {
                        if (noError){
                            featureCollection[id] = union;

                        } 
                        else{
                            //If union isn't working buffer both shapes and then union.
                            try{
                                featureCollection[id] = turf.buffer(featureCollection[id], 1, 'meters').features[0];
                                layer[i] = turf.buffer(layer[i], 1, 'meters').features[0];
                                featureCollection[id] = turf.union(featureCollection[id], layer[i])
                                featureCollection[id] = turf.buffer(featureCollection[id], -1, 'meters').features[0];
                            }
                            catch(e){
                                noError = false;
                            }
                            finally {
                                if (noError){alert("Sorry this doesn't seem to be working. Please reload the site")} 
                            }

                        }                      
                    }


                } 
            }

            var jsonCollection = [];
            for (x in featureCollection) {

                featureCollection[x].properties.fill = layers[layerType].color;
                jsonCollection.push(featureCollection[x]);

                arrayWithFeatures.push(featureCollection[x])
            }

            if(selectedFormat!="json"){

                polygons = {
                  "type": "FeatureCollection",
                  "features": jsonCollection
                };

                var style = 'stroke:#A8A8A8; fill: ' + layers[layerType].color +'; stroke-width: ' + layers[layerType].strokeWidth + 'px';

                if(layerType=="street"){
                    style = 'stroke:'+layers[layerType].color +'; fill: none; stroke-width: ' + map.getLayer("street").paint["line-width"] + 'px';
                }
                if(layerType=="admin"){
                    style = 'stroke:'+layers[layerType].color +'; fill: none; stroke-width: ' + map.getLayer("admin").paint["line-width"] + 'px';
                }

                var convertor = geojson2svg({ 
                    viewportSize: {width: $("#map").width(), height: $("#map").height()},
                    mapExtent:  {
                        left: extent[0],
                        bottom: extent[1],
                        right: extent[2],
                        top: extent[3]
                    },
                    attributes: {
                        'style': style,
                        'class' : layerType
                    },
                    explode: false,
                });


                //Make the SVG
                // covert wgs84 data to Web Mercator projection
                var geojson3857 = reproject.reproject(polygons,'EPSG:4326','EPSG:3857',proj4.defs);
                var svgElements = convertor.convert(geojson3857);

                svgElements.forEach(function(svgStr) {mySVG += svgStr;});
            }


        }



        mySVG += 
        // '<rect fill="#fff" fill-opacity="1" width="175" height="20" x="'+ ($("#map").width() -175) +'" y="'+ ($("#map").height()-20) +'" />' +
        '<text font-weight="bold" font-family="arial" x="'+ ($("#map").width() -10) +'" y="'+ ($("#map").height()-12) +'" fill="black" text-anchor="end">hanshack.com | © OpenStreetMap contributors</text></svg>';

        //Open it
        var b64 = Base64.encode(mySVG); 
        $("#map a").remove()

        if(selectedFormat=="svg"){
            $("#map").append($("<a download='hanshack.com.svg' target='_blank' href-lang='image/svg+xml' href='data:image/svg+xml;base64,\n"+b64+"' title='file.svg'>Download</a>"));
            $("#map a").get(0).click();
        }
        if(selectedFormat=="json"){
            mainGeoJOSN = {
              "type": "FeatureCollection",
              "features": arrayWithFeatures
            };
            mainGeoJOSN.properties = {};
            mainGeoJOSN.properties.downloaded_from = "hanshack.com/mapxtract";
            mainGeoJOSN.properties.copyright = "copyright OpenStreetMap contributors";
            $("#map").append($("<a download='hanshack.com.json' target='_blank' href-lang='image/svg+xml' href='data:text/json;charset=utf-8,\n"+encodeURIComponent(JSON.stringify(mainGeoJOSN))+"' title='file.json'>Download</a>"))
            $("#map a").get(0).click();
        }
        if(selectedFormat=="png"){

            var canvas = $("#canvas")[0];
            var width = $("#map").width();
            var height = $("#map").height();
            canvas.width = $("#map").width();
            canvas.height = height;

            var image = new Image;
            var imgsrc = 'data:image/svg+xml;base64,'+ b64;
            image.src = imgsrc;
            image.onload = function() {

                context = canvas.getContext("2d");
                context.drawImage(image, 0, 0, width, height);
                canvasdata = canvas.toDataURL("image/png");

                $("#map").append($('<a download="hanshack.com.png" href="'+canvasdata+'">'))
                $("#map a").get(0).click();

            };
        }
        spinner.stop();
        clickAllowed = true;
    },500)


})



//Tooltip Layers
$('.layer').tooltipster({
    functionBefore: function(instance, helper, position){
        if($(helper.origin).hasClass("active")){
            instance.option('distance', 85);
        }
        else{
            instance.option('distance', 5);
        }
    },
  side: 'right',
  distance: 85,
  animation: 'fade',
  delay: 0,
  theme: 'tooltipster-noir',
  touchDevices: true,
  trigger: 'hover',
  arrow: false

})




//Tooltip Download
$('.extractWrapper').tooltipster({
    functionBefore: function(instance, helper, position){
        if(!$(helper.origin).hasClass("hidden")){
            instance.option('distance', 125);
        }
        else{
            instance.option('distance', 5);
        }
    },
  side: 'right',
  distance: 85,
  animation: 'fade',
  delay: 0,
  theme: 'tooltipster-noir',
  touchDevices: true,
  trigger: 'hover',
  arrow: false

})





//Set Button color
$("#menue .button .color").eq(0).css("background-color", layers["house"].color)
$("#menue .button .color").eq(1).css("background-color", layers["nature"].color)
$("#menue .button .color").eq(2).css("background-color", layers["water"].color)
$("#menue .button .color").eq(3).css("background-color", layers["street"].color)
$("#menue .button .color").eq(4).css("background-color", layers["admin"].color)
$("#menue .button .color").eq(5).css("background-color", layers["background"].color)






//Colorpicler
$(".color").spectrum({
    preferredFormat: "hex",
    showInput: true,
    showButtons: false
}).on("move.spectrum", function(e, c) {

    var value = $(e.currentTarget).parent().attr("value");
    var color = c.toHexString();

    $(e.currentTarget).css("background-color", color)

    var type = layers[value].type + '-color';
    layers[value].color = color;
    map.setPaintProperty(value, type, color);
    // if(value=="street"){map.setPaintProperty("bridge", type, color);}
});;





//SEARCH PLACE
searchPlace = function (inputAddress) {

    //Querry
    var addressQuerry = "http://photon.komoot.de/api/?q=" + inputAddress +"&limit=1";
    $.getJSON(addressQuerry, function(data) {

        // for (i = 1; i < layer.length; i++) {

        // }

        if (data.features[0].properties.extent != undefined){
            var inputCoo = data.features[0].properties.extent;
            map.fitBounds(inputCoo, {duration:1000})  
        }
        else{
            var inputCoo = data.features[0].geometry.coordinates;
            map.setCenter(inputCoo)
            map.setZoom(13)
        }


    })
}

$('.addressInput').keyup(function(e){
    if (e.keyCode == 13){
        var inputAddress = $(this).val();
        searchPlace(inputAddress);
    }
})

$('.addressInputButton').on('click', function(e){
    var inputAddress = $(this).parent().parent().children('input').val();
    searchPlace(inputAddress);
})