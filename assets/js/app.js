var map, featureList, boroughSearch = [], basuralescaSearch = [], museumSearch = [];

$(window).resize(function() {
  sizeLayerControl();
});

$(document).on("click", ".feature-row", function(e) {
  $(document).off("mouseout", ".feature-row", clearHighlight);
  sidebarClick(parseInt($(this).attr("id"), 10));
});

if ( !("ontouchstart" in window) ) {
  $(document).on("mouseover", ".feature-row", function(e) {
    highlight.clearLayers().addLayer(L.circleMarker([$(this).attr("lat"), $(this).attr("lng")], highlightStyle));
  });
}

$(document).on("mouseout", ".feature-row", clearHighlight);

$("#about-btn").click(function() {
  $("#aboutModal").modal("show");
  $(".navbar-collapse.in").collapse("hide");
  return false;
});

$("#full-extent-btn").click(function() {
  map.fitBounds(partidos.getBounds());
  $(".navbar-collapse.in").collapse("hide");
  return false;
});

$("#legend-btn").click(function() {
  $("#legendModal").modal("show");
  $(".navbar-collapse.in").collapse("hide");
  return false;
});

$("#login-btn").click(function() {
  $("#loginModal").modal("show");
  $(".navbar-collapse.in").collapse("hide");
  return false;
});

$("#list-btn").click(function() {
  animateSidebar();
  return false;
});

$("#nav-btn").click(function() {
  $(".navbar-collapse").collapse("toggle");
  return false;
});

$("#sidebar-toggle-btn").click(function() {
  animateSidebar();
  return false;
});

$("#sidebar-hide-btn").click(function() {
  animateSidebar();
  return false;
});

function animateSidebar() {
  $("#sidebar").animate({
    width: "toggle"
  }, 350, function() {
    map.invalidateSize();
  });
}

function sizeLayerControl() {
  $(".leaflet-control-layers").css("max-height", $("#map").height() - 50);
}

function clearHighlight() {
  highlight.clearLayers();
}

function sidebarClick(id) {
  var layer = markerClusters.getLayer(id);
  map.setView([layer.getLatLng().lat, layer.getLatLng().lng], 17);
  layer.fire("click");
  /* Hide sidebar and go to the map on small screens */
  if (document.body.clientWidth <= 767) {
    $("#sidebar").hide();
    map.invalidateSize();
  }
}

function syncSidebar() {
  /* Empty sidebar features */
  $("#feature-list tbody").empty();
  /* Loop through basurales_ca layer and add only features which are in the map bounds */
  basurales_ca.eachLayer(function (layer) {
    if (map.hasLayer(basuralesLayer)) {
      if (map.getBounds().contains(layer.getLatLng())) {
        $("#feature-list tbody").append('<tr class="feature-row" id="' + L.stamp(layer) + '" lat="' + layer.getLatLng().lat + '" lng="' + layer.getLatLng().lng + '"><td style="vertical-align: middle;"><img width="16" height="18" src="assets/img/theater.png"></td><td class="feature-name">' + layer.feature.properties.nombre + '</td><td style="vertical-align: middle;"><i class="fa fa-chevron-right pull-right"></i></td></tr>');
      }
    }
  });
  /* Loop through refuncionalizadores layer and add only features which are in the map bounds */
  refuncionalizadores.eachLayer(function (layer) {
    if (map.hasLayer(refuncionalizadoresLayer)) {
      if (map.getBounds().contains(layer.getLatLng())) {
        $("#feature-list tbody").append('<tr class="feature-row" id="' + L.stamp(layer) + '" lat="' + layer.getLatLng().lat + '" lng="' + layer.getLatLng().lng + '"><td style="vertical-align: middle;"><img width="16" height="18" src="assets/img/museum.png"></td><td class="feature-name">' + layer.feature.properties.nombre_r_s + '</td><td style="vertical-align: middle;"><i class="fa fa-chevron-right pull-right"></i></td></tr>');
      }
    }
  });
  /* Update list.js featureList */
  featureList = new List("features", {
    valueNames: ["feature-name"]
  });
  featureList.sort("feature-name", {
    order: "asc"
  });
}

/* Basemap Layers */
var cartoLight = L.tileLayer("https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="https://cartodb.com/attributions">CartoDB</a>'
});
var usgsImagery = L.layerGroup([L.tileLayer("http://basemap.nationalmap.gov/arcgis/rest/services/USGSImageryOnly/MapServer/tile/{z}/{y}/{x}", {
  maxZoom: 15,
}), L.tileLayer.wms("http://raster.nationalmap.gov/arcgis/services/Orthoimagery/USGS_EROS_Ortho_SCALE/ImageServer/WMSServer?", {
  minZoom: 16,
  maxZoom: 19,
  layers: "0",
  format: 'image/jpeg',
  transparent: true,
  attribution: "Aerial Imagery courtesy USGS"
})]);

/* Overlay Layers */
var highlight = L.geoJson(null);
var highlightStyle = {
  stroke: false,
  fillColor: "#00FFFF",
  fillOpacity: 0.7,
  radius: 10
};

var partidos = L.geoJson(null, {
  style: function (feature) {
    return {
      color: "black",
      fill: false,
      opacity: 1,
      clickable: false
    };
  },
  onEachFeature: function (feature, layer) {
    boroughSearch.push({
      name: layer.feature.properties.nam,
      source: "Partidos",
      id: L.stamp(layer),
      bounds: layer.getBounds()
    });
  }
});
$.getJSON("data/partidos.geojson", function (data) {
  partidos.addData(data);
});

//Create a color dictionary based off of subway route_id
var subwayColors = {"1":"#ff3135", "2":"#ff3135", "3":"ff3135", "4":"#009b2e",
    "5":"#009b2e", "6":"#009b2e", "7":"#ce06cb", "A":"#fd9a00", "C":"#fd9a00",
    "E":"#fd9a00", "SI":"#fd9a00","H":"#fd9a00", "Air":"#ffff00", "B":"#ffff00",
    "D":"#ffff00", "F":"#ffff00", "M":"#ffff00", "G":"#9ace00", "FS":"#6e6e6e",
    "GS":"#6e6e6e", "J":"#976900", "Z":"#976900", "L":"#969696", "N":"#ffff00",
    "Q":"#ffff00", "R":"#ffff00" };

var subwayLines = L.geoJson(null, {
  style: function (feature) {
      return {
        color: subwayColors[feature.properties.route_id],
        weight: 3,
        opacity: 1
      };
  },
  onEachFeature: function (feature, layer) {
    if (feature.properties) {
      var content = "<table class='table table-striped table-bordered table-condensed'>" + "<tr><th>Division</th><td>" + feature.properties.Division + "</td></tr>" + "<tr><th>Line</th><td>" + feature.properties.Line + "</td></tr>" + "<table>";
      layer.on({
        click: function (e) {
          $("#feature-title").html(feature.properties.Line);
          $("#feature-info").html(content);
          $("#featureModal").modal("show");

        }
      });
    }
    layer.on({
      mouseover: function (e) {
        var layer = e.target;
        layer.setStyle({
          weight: 3,
          color: "#00FFFF",
          opacity: 1
        });
        if (!L.Browser.ie && !L.Browser.opera) {
          layer.bringToFront();
        }
      },
      mouseout: function (e) {
        subwayLines.resetStyle(e.target);
      }
    });
  }
});
$.getJSON("data/subways.geojson", function (data) {
  subwayLines.addData(data);
});

/* Single marker cluster layer to hold all clusters */
var markerClusters = new L.MarkerClusterGroup({
  spiderfyOnMaxZoom: true,
  showCoverageOnHover: false,
  zoomToBoundsOnClick: true,
  disableClusteringAtZoom: 16
});

/* Empty layer placeholder to add to layer control for listening when to add/remove basurales_ca to markerClusters layer */
var basuralesLayer = L.geoJson(null);
var basurales_ca = L.geoJson(null, {
  pointToLayer: function (feature, latlng) {
    return L.marker(latlng, {
      icon: L.icon({
        iconUrl: "assets/img/theater.png",
        iconSize: [24, 28],
        iconAnchor: [12, 28],
        popupAnchor: [0, -25]
      }),
      title: feature.properties.nombre,
      riseOnHover: true
    });
  },
  onEachFeature: function (feature, layer) {
    if (feature.properties) {
      var content = "<table class='table table-striped table-bordered table-condensed'>" 
                      + "<tr><th>ID BCA</th><td>" + feature.properties.id_bca + "</td></tr>" 
                      + "<tr><th>Nombre</th><td>" + feature.properties.nombre + "</td></tr>" 
                      + "<tr><th>Zonificación</th><td>" + feature.properties.zonificaci + "</td></tr>" 
                      + "<tr><th>Dominio</th><td>" + feature.properties.dominio + "</td></tr>"
                      + "<tr><th>Gestión</th><td>" + feature.properties.gestion + "</td></tr>" 
                      + "<tr><th>Estado</th><td>" + feature.properties.no_activo + "</td></tr>"
                      + "<tr><th>Superficie total</th><td>" + feature.properties.supt + " Ha?</td></tr>"
                      + "<tr><th>Superficie impactada</th><td>" + feature.properties.supimpactd + " Ha?</td></tr>"
                      + "<tr><th>U_C_R</th><td> "+ feature.properties.u_c_r +"</td></tr>" 
                      + "<tr><th>Zona</th><td>" + feature.properties.zonas + "</td></tr>" 
                      + "<table>";
      layer.on({
        click: function (e) {
          $("#feature-title").html(feature.properties.nombre);
          $("#feature-info").html(content);
          $("#featureModal").modal("show");
          highlight.clearLayers().addLayer(L.circleMarker([feature.geometry.coordinates[1], feature.geometry.coordinates[0]], highlightStyle));
        }
      });
      $("#feature-list tbody").append('<tr class="feature-row" id="' + L.stamp(layer) + '" lat="' + layer.getLatLng().lat + '" lng="' + layer.getLatLng().lng + '"><td style="vertical-align: middle;"><img width="16" height="18" src="assets/img/theater.png"></td><td class="feature-name">' + layer.feature.properties.nombre + '</td><td style="vertical-align: middle;"><i class="fa fa-chevron-right pull-right"></i></td></tr>');
      basuralescaSearch.push({
        name: layer.feature.properties.nombre,
        address: layer.feature.properties.zonas,
        source: "Basurales_CA",
        id: L.stamp(layer),
        lat: layer.feature.geometry.coordinates[1],
        lng: layer.feature.geometry.coordinates[0]
      });
    }
  }
});
$.getJSON("data/basurales_ca.geojson", function (data) {
  basurales_ca.addData(data);
  map.addLayer(basuralesLayer);
});

/* Rellenos sanitarios */
var rellenosLayer = L.geoJson(null);
var rellenos = L.geoJson(null, {
  pointToLayer: function (feature, latlng) {
    return L.marker(latlng, {
      icon: L.icon({
        iconUrl: "assets/img/theater.png",
        iconSize: [24, 28],
        iconAnchor: [12, 28],
        popupAnchor: [0, -25]
      }),
      title: feature.properties.nombre,
      riseOnHover: true
    });
  },
  onEachFeature: function (feature, layer) {
    if (feature.properties) {
      var content = "<table class='table table-striped table-bordered table-condensed'>" 
                    + "<tr><th>ID</th><td>" + feature.properties.id_rs + "</td></tr>" 
                    + "<tr><th>Nombre</th><td>" + feature.properties.nombre + "</td></tr>"
                    + "<tr><th>Municipio</th><td>" + feature.properties.municipio + "</td></tr>"
                    + "<tr><th>Dominio</th><td>" + feature.properties.dominio + "</td></tr>"  
                    + "<tr><th>Gestión</th><td>" + feature.properties.t_gestion + "</td></tr>" 
                    + "<tr><th>Estado</th><td>" + feature.properties.operativo + "</td></tr>" 
                    + "<tr><th>Zona</th><td>" + feature.properties.zonas + "</td></tr>"  
                    + "<tr><th>U_C_R</th><td> "+ feature.properties.u_c_r +"</td></tr>" 
                    + "<tr><th>Superficie total</th><td>" + feature.properties.supt + "</td></tr>"
                    + "<tr><th>Superficie afectada</th><td>" + feature.properties.sup_impact + "</td></tr>"
                    + "<tr><th>Dsiposición</th><td>" + feature.properties.dispo_t_di + "</td></tr>"
                    + "<table>";
      layer.on({
        click: function (e) {
          $("#feature-title").html(feature.properties.nombre);
          $("#feature-info").html(content);
          $("#featureModal").modal("show");
          highlight.clearLayers().addLayer(L.circleMarker([feature.geometry.coordinates[1], feature.geometry.coordinates[0]], highlightStyle));
        }
      });
      $("#feature-list tbody").append('<tr class="feature-row" id="' + L.stamp(layer) + '" lat="' + layer.getLatLng().lat + '" lng="' + layer.getLatLng().lng + '"><td style="vertical-align: middle;"><img width="16" height="18" src="assets/img/theater.png"></td><td class="feature-name">' + layer.feature.properties.nombre + '</td><td style="vertical-align: middle;"><i class="fa fa-chevron-right pull-right"></i></td></tr>');
      basuralescaSearch.push({
        name: layer.feature.properties.nombre,
        address: layer.feature.properties.zonas,
        source: "Basurales_CA",
        id: L.stamp(layer),
        lat: layer.feature.geometry.coordinates[1],
        lng: layer.feature.geometry.coordinates[0]
      });
    }
  }
});
$.getJSON("data/rellenos_sanitarios.geojson", function (data) {
  rellenos.addData(data);
  map.addLayer(rellenosLayer);
});

/* Celdas sanitarias */
var celdasLayer = L.geoJson(null);
var celdas = L.geoJson(null, {
  pointToLayer: function (feature, latlng) {
    return L.marker(latlng, {
      icon: L.icon({
        iconUrl: "assets/img/theater.png",
        iconSize: [24, 28],
        iconAnchor: [12, 28],
        popupAnchor: [0, -25]
      }),
      title: feature.properties.nombre,
      riseOnHover: true
    });
  },
  onEachFeature: function (feature, layer) {
    if (feature.properties) {
      var content = "<table class='table table-striped table-bordered table-condensed'>" 
                    + "<tr><th>ID</th><td>" + feature.properties.id_cs + "</td></tr>"
                    + "<tr><th>Municipio</th><td>" + feature.properties.municipio + "</td></tr>" 
                    + "<tr><th>Estado</th><td>" + feature.properties.est_oper + "</td></tr>" 
                    + "<tr><th>Fuente</th><td>" + feature.properties.sag + "</td></tr>" 
                    + "<table>";
      layer.on({
        click: function (e) {
          $("#feature-title").html(feature.properties.nombre);
          $("#feature-info").html(content);
          $("#featureModal").modal("show");
          highlight.clearLayers().addLayer(L.circleMarker([feature.geometry.coordinates[1], feature.geometry.coordinates[0]], highlightStyle));
        }
      });
      $("#feature-list tbody").append('<tr class="feature-row" id="' + L.stamp(layer) + '" lat="' + layer.getLatLng().lat + '" lng="' + layer.getLatLng().lng + '"><td style="vertical-align: middle;"><img width="16" height="18" src="assets/img/theater.png"></td><td class="feature-name">' + layer.feature.properties.nombre + '</td><td style="vertical-align: middle;"><i class="fa fa-chevron-right pull-right"></i></td></tr>');
      basuralescaSearch.push({
        name: layer.feature.properties.nombre,
        address: layer.feature.properties.zonas,
        source: "Basurales_CA",
        id: L.stamp(layer),
        lat: layer.feature.geometry.coordinates[1],
        lng: layer.feature.geometry.coordinates[0]
      });
    }
  }
});
$.getJSON("data/celdas_sanitarias.geojson", function (data) {
  celdas.addData(data);
  map.addLayer(celdasLayer);
});

/* Empty layer placeholder to add to layer control for listening when to add/remove refuncionalizadores to markerClusters layer */
var refuncionalizadoresLayer = L.geoJson(null);
var refuncionalizadores = L.geoJson(null, {
  pointToLayer: function (feature, latlng) {
    return L.marker(latlng, {
      icon: L.icon({
        iconUrl: "assets/img/museum.png",
        iconSize: [24, 28],
        iconAnchor: [12, 28],
        popupAnchor: [0, -25]
      }),
      title: feature.properties.nombre_r_s,
      riseOnHover: true
    });
  },
  onEachFeature: function (feature, layer) {
    if (feature.properties) {
      var content = "<table class='table table-striped table-bordered table-condensed'>" 
                    + "<tr><th>ID</th><td>" + feature.properties.idref + "</td></tr>" 
                    + "<tr><th>Localidad</th><td>" + feature.properties.localidad + "</td></tr>"
                    + "<tr><th>Nombre</th><td>" + feature.properties.nombre_r_s + "</td></tr>"
                    + "<tr><th>Tipo de organización</th><td>" + feature.properties.tipo_r_s + "</td></tr>" 
                    + "<tr><th>Pequeños electrodomésticos</th><td>" + feature.properties.pe_electro + "</td></tr>"
                    + "<tr><th>Aparatos bajo consumo</th><td>" + feature.properties.apar_bajo_ + "</td></tr>"
                    + "<tr><th>TICS</th><td>" + feature.properties.tics + "</td></tr>"
                    + "<tr><th>Grandes electrodomésticos</th><td>" + feature.properties.gdes_elect + "</td></tr>"
                    + "<tr><th>Herramientas electrónicas</th><td>" + feature.properties.herram_ele + "</td></tr>"
                    + "<tr><th>Voluminosos</th><td>" + feature.properties.voluminoso + "</td></tr>"
                    + "<tr><th>Correo</th><td>" + feature.properties.mail + "</td></tr>"
                    + "<tr><th>Teléfono</th><td>" + feature.properties.telefono + "</td></tr>" 
                    + "<tr><th>Domicilio</th><td>" + feature.properties.adr + ' ' + feature.properties.adn + "</td></tr>" 
                    + "<tr><th>Fuente</th><td>" + feature.properties.sag + "</td></tr>"
                    + "<table>";
      layer.on({
        click: function (e) {
          $("#feature-title").html(feature.properties.nombre_r_s);
          $("#feature-info").html(content);
          $("#featureModal").modal("show");
          highlight.clearLayers().addLayer(L.circleMarker([feature.geometry.coordinates[1], feature.geometry.coordinates[0]], highlightStyle));
        }
      });
      $("#feature-list tbody").append('<tr class="feature-row" id="' + L.stamp(layer) + '" lat="' + layer.getLatLng().lat + '" lng="' + layer.getLatLng().lng + '"><td style="vertical-align: middle;"><img width="16" height="18" src="assets/img/museum.png"></td><td class="feature-name">' + layer.feature.properties.nombre_r_s + '</td><td style="vertical-align: middle;"><i class="fa fa-chevron-right pull-right"></i></td></tr>');
      museumSearch.push({
        name: layer.feature.properties.nombre_r_s,
        address: layer.feature.properties.adr,
        source: "Refuncionalizadores",
        id: L.stamp(layer),
        lat: layer.feature.geometry.coordinates[1],
        lng: layer.feature.geometry.coordinates[0]
      });
    }
  }
});
$.getJSON("data/refuncionalizadores_raee.geojson", function (data) {
  refuncionalizadores.addData(data);
});

map = L.map("map", {
  zoom: 10,
  center: [40.702222, -73.979378],
  layers: [cartoLight, partidos, markerClusters, highlight],
  zoomControl: false,
  attributionControl: false
});

/* Layer control listeners that allow for a single markerClusters layer */
map.on("overlayadd", function(e) {
  if (e.layer === basuralesLayer) {
    markerClusters.addLayer(basurales_ca);
    syncSidebar();
  }
  if (e.layer === refuncionalizadoresLayer) {
    markerClusters.addLayer(refuncionalizadores);
    syncSidebar();
  }
  if (e.layer === rellenosLayer) {
    markerClusters.addLayer(rellenos);
    syncSidebar();
  }
  if (e.layer === celdasLayer) {
    markerClusters.addLayer(rellenos);
    syncSidebar();
  }
});

map.on("overlayremove", function(e) {
  if (e.layer === basuralesLayer) {
    markerClusters.removeLayer(basurales_ca);
    syncSidebar();
  }
  if (e.layer === refuncionalizadoresLayer) {
    markerClusters.removeLayer(refuncionalizadores);
    syncSidebar();
  }
  if (e.layer === rellenosLayer) {
    markerClusters.removeLayer(rellenos);
    syncSidebar();
  }
  if (e.layer === celdasLayer) {
    markerClusters.removeLayer(rellenos);
    syncSidebar();
  }
});

/* Filter sidebar feature list to only show features in current map bounds */
map.on("moveend", function (e) {
  syncSidebar();
});

/* Clear feature highlight when map is clicked */
map.on("click", function(e) {
  highlight.clearLayers();
});

/* Attribution control */
function updateAttribution(e) {
  $.each(map._layers, function(index, layer) {
    if (layer.getAttribution) {
      $("#attribution").html((layer.getAttribution()));
    }
  });
}
map.on("layeradd", updateAttribution);
map.on("layerremove", updateAttribution);

var attributionControl = L.control({
  position: "bottomright"
});
attributionControl.onAdd = function (map) {
  var div = L.DomUtil.create("div", "leaflet-control-attribution");
  div.innerHTML = "<span class='hidden-xs'>Desarrollado por <a href='https://www.ungs.edu.ar/ico/ico'>ICO - UNGS</a> | </span><a href='#' onclick='$(\"#attributionModal\").modal(\"show\"); return false;'>Attribution</a>";
  return div;
};
map.addControl(attributionControl);

var zoomControl = L.control.zoom({
  position: "bottomright"
}).addTo(map);

/* GPS enabled geolocation control set to follow the user's location */
var locateControl = L.control.locate({
  position: "bottomright",
  drawCircle: true,
  follow: true,
  setView: true,
  keepCurrentZoomLevel: true,
  markerStyle: {
    weight: 1,
    opacity: 0.8,
    fillOpacity: 0.8
  },
  circleStyle: {
    weight: 1,
    clickable: false
  },
  icon: "fa fa-location-arrow",
  metric: false,
  strings: {
    title: "My location",
    popup: "You are within {distance} {unit} from this point",
    outsideMapBoundsMsg: "You seem located outside the boundaries of the map"
  },
  locateOptions: {
    maxZoom: 18,
    watch: true,
    enableHighAccuracy: true,
    maximumAge: 10000,
    timeout: 10000
  }
}).addTo(map);

/* Larger screens get expanded layer control and visible sidebar */
if (document.body.clientWidth <= 767) {
  var isCollapsed = true;
} else {
  var isCollapsed = false;
}

var baseLayers = {
  "Carto": cartoLight,
  "Satelital": usgsImagery
};

var groupedOverlays = {
  "RAEE": {
    "<img src='assets/img/museum.png' width='24' height='28'>&nbsp;Refuncionalizadores": refuncionalizadoresLayer
  },
  "Disposición final": {
    "<img src='assets/img/theater.png' width='24' height='28'>&nbsp;Basurales_CA": basuralesLayer,
    "<img src='assets/img/theater.png' width='24' height='28'>&nbsp;Rellenos sanitarios": rellenosLayer,
    "<img src='assets/img/theater.png' width='24' height='28'>&nbsp;Celdas sanitarias": celdasLayer
  },
  "Límites": {
    "Partidos": partidos
  }
};

var layerControl = L.control.groupedLayers(baseLayers, groupedOverlays, {
  collapsed: isCollapsed
}).addTo(map);

/* Highlight search box text on click */
$("#searchbox").click(function () {
  $(this).select();
});

/* Prevent hitting enter from refreshing the page */
$("#searchbox").keypress(function (e) {
  if (e.which == 13) {
    e.preventDefault();
  }
});

$("#featureModal").on("hidden.bs.modal", function (e) {
  $(document).on("mouseout", ".feature-row", clearHighlight);
});

/* Typeahead search functionality */
$(document).one("ajaxStop", function () {
  $("#loading").hide();
  sizeLayerControl();
  /* Fit map to partidos bounds */
  map.fitBounds(partidos.getBounds());
  featureList = new List("features", {valueNames: ["feature-name"]});
  featureList.sort("feature-name", {order:"asc"});

  var partidosBH = new Bloodhound({
    name: "Partidos",
    datumTokenizer: function (d) {
      return Bloodhound.tokenizers.whitespace(d.name);
    },
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    local: boroughSearch,
    limit: 10
  });

  var basuralescaBH = new Bloodhound({
    nombre: "Basurales_CA",
    datumTokenizer: function (d) {
      return Bloodhound.tokenizers.whitespace(d.nombre);
    },
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    local: basuralescaSearch,
    limit: 10
  });

  var museumsBH = new Bloodhound({
    name: "Refuncionalizadores",
    datumTokenizer: function (d) {
      return Bloodhound.tokenizers.whitespace(d.name);
    },
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    local: museumSearch,
    limit: 10
  });

  var geonamesBH = new Bloodhound({
    name: "GeoNames",
    datumTokenizer: function (d) {
      return Bloodhound.tokenizers.whitespace(d.name);
    },
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    remote: {
      url: "http://api.geonames.org/searchJSON?username=bootleaf&featureClass=P&maxRows=5&countryCode=US&name_startsWith=%QUERY",
      filter: function (data) {
        return $.map(data.geonames, function (result) {
          return {
            name: result.name + ", " + result.adminCode1,
            lat: result.lat,
            lng: result.lng,
            source: "GeoNames"
          };
        });
      },
      ajax: {
        beforeSend: function (jqXhr, settings) {
          settings.url += "&east=" + map.getBounds().getEast() + "&west=" + map.getBounds().getWest() + "&north=" + map.getBounds().getNorth() + "&south=" + map.getBounds().getSouth();
          $("#searchicon").removeClass("fa-search").addClass("fa-refresh fa-spin");
        },
        complete: function (jqXHR, status) {
          $('#searchicon').removeClass("fa-refresh fa-spin").addClass("fa-search");
        }
      }
    },
    limit: 10
  });
  partidosBH.initialize();
  basuralescaBH.initialize();
  museumsBH.initialize();
  geonamesBH.initialize();

  /* instantiate the typeahead UI */
  $("#searchbox").typeahead({
    minLength: 3,
    highlight: true,
    hint: false
  }, {
    name: "Partidos",
    displayKey: "name",
    source: partidosBH.ttAdapter(),
    templates: {
      header: "<h4 class='typeahead-header'>Partidos</h4>"
    }
  }, {
    name: "Basurales_CA",
    displayKey: "nombre",
    source: basuralescaBH.ttAdapter(),
    templates: {
      header: "<h4 class='typeahead-header'><img src='assets/img/theater.png' width='24' height='28'>&nbsp;Basurales_CA</h4>",
      suggestion: Handlebars.compile(["{{nombre}}<br>&nbsp;<small>{{zonas}}</small>"].join(""))
    }
  }, {
    name: "Refuncionalizadores",
    displayKey: "name",
    source: museumsBH.ttAdapter(),
    templates: {
      header: "<h4 class='typeahead-header'><img src='assets/img/museum.png' width='24' height='28'>&nbsp;Refuncionalizadores</h4>",
      suggestion: Handlebars.compile(["{{name}}<br>&nbsp;<small>{{address}}</small>"].join(""))
    }
  }, {
    name: "GeoNames",
    displayKey: "name",
    source: geonamesBH.ttAdapter(),
    templates: {
      header: "<h4 class='typeahead-header'><img src='assets/img/globe.png' width='25' height='25'>&nbsp;GeoNames</h4>"
    }
  }).on("typeahead:selected", function (obj, datum) {
    if (datum.source === "Partidos") {
      map.fitBounds(datum.bounds);
    }
    if (datum.source === "Basurales_CA") {
      if (!map.hasLayer(basuralesLayer)) {
        map.addLayer(basuralesLayer);
      }
      map.setView([datum.lat, datum.lng], 17);
      if (map._layers[datum.id]) {
        map._layers[datum.id].fire("click");
      }
    }
    if (datum.source === "Refuncionalizadores") {
      if (!map.hasLayer(refuncionalizadoresLayer)) {
        map.addLayer(refuncionalizadoresLayer);
      }
      map.setView([datum.lat, datum.lng], 17);
      if (map._layers[datum.id]) {
        map._layers[datum.id].fire("click");
      }
    }
    if (datum.source === "GeoNames") {
      map.setView([datum.lat, datum.lng], 14);
    }
    if ($(".navbar-collapse").height() > 50) {
      $(".navbar-collapse").collapse("hide");
    }
  }).on("typeahead:opened", function () {
    $(".navbar-collapse.in").css("max-height", $(document).height() - $(".navbar-header").height());
    $(".navbar-collapse.in").css("height", $(document).height() - $(".navbar-header").height());
  }).on("typeahead:closed", function () {
    $(".navbar-collapse.in").css("max-height", "");
    $(".navbar-collapse.in").css("height", "");
  });
  $(".twitter-typeahead").css("position", "static");
  $(".twitter-typeahead").css("display", "block");
});

// Leaflet patch to make layer control scrollable on touch browsers
var container = $(".leaflet-control-layers")[0];
if (!L.Browser.touch) {
  L.DomEvent
  .disableClickPropagation(container)
  .disableScrollPropagation(container);
} else {
  L.DomEvent.disableClickPropagation(container);
}
