# mapXtract
Edit maps and save them as svg, png or geoJson
Style the map by coloring or adding/removing layers. Layers are: nature, houses, water, roads and administrative zones.
Website: http://hanshack.com/mapxtract/

### Made with
Mapbox GL, turf, tiles from osm2vectortiles, geocoder by photon.komoot.de.

### Exports
SVG: Elements of the same layer have the same class name.
GeoJson: Every feature has a color property.

### Bugs
Due to performance reasons it is currently not possible to save the map when zoomed out afar.
