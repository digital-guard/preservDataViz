/*
 * This is the latest working/reviewed/approved version. Use it as a replacement in case you are not satisfied with the current one. This version is fully compliant with the first set of requirements.
 *
 * Esta é a última versão de trabalho/revisão/aprovação. Use-o como um substituto no caso de não estar satisfeito com o atual. Esta versão está em total conformidade com o primeiro conjunto de requisitos.
 */

window.onload = () => {
  const LocationSearch = document.location.search.replace("?", "");
  // console.log(document.location);
  const ghs = LocationSearch || "geohashes";
  // const mapStyle = ghs === "geohashes" ? "light-v10" : "streets-v11";
  const orange = chroma("orange").hex();
  const baseURL =
    "https://raw.githubusercontent.com/digital-guard/preservCutGeo-BR2021/main/data/MG/BeloHorizonte/_pk0008.01/geoaddress/";
  const colors = chroma.scale("YlGnBu");
  const normalize = (val, max, min) => (val - min) / (max - min);
  const ghsList_back = document.getElementById("geohashes_button");
  const ghsList_tBody = document.getElementById("ghs_table_body");
  const ghs_prefix_len = 3;

  new Tablesort(document.getElementById("ghs_table"));

  const baseMaps = {
    Satellite: L.tileLayer(
      "https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw",
      {
        // minZoom: 8,
        maxZoom: 25,
        id: "mapbox/satellite-v9",
        tileSize: 512,
        zoomOffset: -1,
        attribution: '<a href="https://www.mapbox.com/">Mapbox</a>',
      }
    ),
    "Satellite Streets": L.tileLayer(
      "https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw",
      {
        // minZoom: 8,
        maxZoom: 25,
        id: "mapbox/satellite-streets-v11",
        tileSize: 512,
        zoomOffset: -1,
        attribution: '<a href="https://www.mapbox.com/">Mapbox</a>',
      }
    ),
    Streets: L.tileLayer(
      "https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw",
      {
        // minZoom: 8,
        maxZoom: 25,
        id: "mapbox/streets-v11",
        tileSize: 512,
        zoomOffset: -1,
        attribution: '<a href="https://www.mapbox.com/">Mapbox</a>',
      }
    ),
    Grayscale: L.tileLayer(
      "https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw",
      {
        // minZoom: 8,
        maxZoom: 25,
        id: "mapbox/light-v10",
        tileSize: 512,
        zoomOffset: -1,
        attribution: '<a href="https://www.mapbox.com/">Mapbox</a>',
      }
    ),
  };

  let minZoom = 10;
  let isMosaic = true;
  let dataLayer, label;

  const map = L.map("map", {
    center: [-23.550385, -46.633956],
    zoom: 10,
    layers: [
      baseMaps.Grayscale,
      baseMaps.Streets,
      baseMaps.Satellite,
      baseMaps["Satellite Streets"],
    ],
  }).setView([-23.550385, -46.633956], 10);
  map.attributionControl.setPrefix(
    '<a title="© tile data" target="_copyr" href="https://www.OSM.org/copyright">OSM</a>'
  ); // no Leaflet advertisement!

  // const mosaic = loadGeoJson("geohashes");
  const overlayMaps = {
    // Mosaic: mosaic,
    // "Addresses": addresses,
  };
  L.control.layers(baseMaps, overlayMaps).addTo(map);

  map.on("zoom", function () {
    console.log(minZoom);
    console.log(map.getZoom());
    if (map.getZoom() <= minZoom && !isMosaic) {
      loadGeoJson("geohashes");
    }
  });

  const markers = L.layerGroup();
  const loadGeoJson = (ghs) => {
    let path = ghs === "geohashes" ? "geohashes" : `pts_${ghs}`;
    if (dataLayer) {
      if (label) {
        if (map.hasLayer(markers)) {
          markers.clearLayers();
        }
      }
      map.removeLayer(dataLayer);
    }
    fetch(`${baseURL + path}.geojson`)
      .then(function (response) {
        return response.json();
      })
      .then(function (data) {
        if (ghs === "geohashes") {
          /*****************************************************************************
           * Load Mosaic
           *****************************************************************************/
          let densities = data.features.map(
            (a) => a.properties.val_density_km2
          );
          let max = Math.max(...densities);
          let min = Math.min(...densities);
          ghsList_back.innerHTML = "";
          ghsList_tBody.innerHTML = "";

          dataLayer = L.geoJSON(data, {
            style: (feature) => ({
              fillColor: colors(
                normalize(
                  Math.round(feature.properties.val_density_km2),
                  max,
                  min
                )
              ).hex(),
              color: "#000",
              weight: 0.125,
              fillOpacity: 0.65,
            }),
            onEachFeature: (feature, layer) => {
              let center = layer.getBounds().getCenter();
              let ghs = feature.properties.ghs;

              //let li = document.createElement("li");
              //li.innerHTML = `<a href="?${ghs}">${ghs}</a>`;
              let ghs_tr = document.createElement("tr");
              let ghs_bold =
                ghs.substring(0, ghs_prefix_len) +
                "<b>" +
                ghs.substring(ghs_prefix_len) +
                "</b>";
              ghs_tr.innerHTML = `<td><a href="?${ghs}"><code>${ghs_bold}</code></a></td> <td>${
                feature.properties.val
              }</td> <td>${Math.round(
                feature.properties.val_density_km2
              )}</td>`;

              //ghsList_back.appendChild(li);
              ghsList_tBody.appendChild(ghs_tr);

              label = L.marker(center, {
                icon: L.divIcon({
                  html: "",
                  size: [0, 0],
                }),
              }).bindTooltip(ghs.substring(ghs_prefix_len), {
                permanent: true,
                opacity: 0.7,
                direction: "center",
                className: "label",
              });
              markers.addLayer(label);
              layer
                .bindTooltip(
                  `Densidade: <b>${Math.round(
                    feature.properties.val_density_km2
                  )} pts/km²</b><br/>Volumetria: <b>${
                    feature.properties.val
                  } pts</b><hr/>Clique para ver os pontos<br/>do Geohash <b>${
                    feature.properties.ghs
                  }</b>`,
                  {
                    sticky: true,
                    opacity: 0.7,
                    direction: "top",
                    className: "tooltip",
                  }
                )
                .on("mouseover", () => {
                  layer.setStyle({
                    fillColor: "#ffa500",
                  });
                })
                .on("mouseout", () => {
                  layer.setStyle({
                    fillColor: colors(
                      normalize(
                        Math.round(feature.properties.val_density_km2),
                        max,
                        min
                      )
                    ).hex(),
                  });
                })
                .on("mouseup", () => {
                  // window.location.href = `?${ghs}`;
                  loadGeoJson(ghs);
                });
            },
          });
          map.addLayer(markers);
        } else {
          /*****************************************************************************
           * Load Points
           *****************************************************************************/
          isMosaic = false;
          // falta acrescebtar botão antes da tabela ghsList_tBody
          ghsList_back.innerHTML = `<li><a href=".">Back to Mosaic</a></li>`;
          dataLayer = L.geoJSON(data, {
            // onEachFeature: onEachFeature,
            pointToLayer: function (feature, latlng) {
              return L.circleMarker(latlng, {
                radius: 4,
                fillColor: orange,
                color: "#000",
                weight: 0.15,
                opacity: 1,
                fillOpacity: 0.8,
              }).bindTooltip(feature.properties.address, {
                opacity: 0.7,
                direction: "top",
                className: "tooltip",
              });
            },
          });
        }
        dataLayer.addTo(map);
        map.fitBounds(dataLayer.getBounds());
        // map.setMaxBounds(map.getBounds());
        minZoom = map.getZoom() - 2;
        map.options.minZoom = minZoom;
      });
  };
  loadGeoJson(ghs);
}; //window onload
