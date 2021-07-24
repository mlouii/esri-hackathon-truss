/*
  Copyright 2019 Esri
  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at
    http://www.apache.org/licenses/LICENSE-2.0
  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
*/

import {Component, OnInit, ViewChild, ElementRef, Input} from '@angular/core';
import { loadModules } from 'esri-loader';
// import {FeatureLayer} from 'esri/layers/FeatureLayer';

@Component({
  selector: 'app-esri-map',
  templateUrl: './esri-map.component.html',
  styleUrls: ['./esri-map.component.css']
})

export class EsriMapComponent implements OnInit {

  @Input() searchRadius: number;
  @Input() considerFoodDeserts: boolean;
  @Input() considerPublicTransport: boolean;
  @Input() considerDistanceCommunityCenters: boolean;
  @Input() considerHeavyMetals: boolean;
  @Input() considerSunlight: boolean;


  @ViewChild('mapViewNode', { static: true }) private viewNode: ElementRef; // needed to inject the MapView into the DOM
  mapView: __esri.MapView;
  panRequestSubscription: any;

  constructor() {}



createPopupTemplate() {
    return {
      title: 'description',
      content: [
        {
          type: 'fields',
          fieldInfos: [
            {
              fieldName: 'TaxRateCity',
              label: 'City',
              format: {
                places: 0,
                digitSeparator: true
              }
            },
            {
              fieldName: 'Agency Name',
              label: 'Who owns the parcel',
              format: {
                places: 0,
                digitSeparator: true
              }
            },
            {
              fieldName: 'UseType',
              label: 'residential/industrial/commercial',
              format: {
                places: 0,
                digitSeparator: true
              }
            },
            {
              fieldName: 'ParcelArea',
              label: 'Area in sq feet',
              format: {
                places: 0,
                digitSeparator: true
              }
            },

            {
              fieldName: 'FloodFreq',
              label: 'Flood Frequency',
              format: {
                places: 0,
                digitSeparator: true
              }
            },
            {
              fieldName: 'SoilType',
              label: 'Soil Type',
              format: {
                places: 0,
                digitSeparator: true
              }
            },
            {
              fieldName: 'SubS_pH',
              label: 'The sub-soil pH',
              format: {
                places: 0,
                digitSeparator: true
              }
            },
            {
              fieldName: 'TopS_pH',
              label: 'The top-soil pH',
              format: {
                places: 0,
                digitSeparator: true
              }
            },
            {
              fieldName: 'AvaWatrStr',
              label: 'Available water storage capacity of the topsoil',
              format: {
                places: 0,
                digitSeparator: true
              }
            },
            {
              fieldName: 'gwthreats',
              label: 'Clean-up sites within each census tract weighted by distance to a tract and status',
              format: {
                places: 0,
                digitSeparator: true
              }
            },
            {
              fieldName: 'PestcUse',
              label: 'Active pesticide ingredients (filtered for hazard and volatility) used in production-agriculture per square mile ',
              format: {
                places: 0,
                digitSeparator: true
              }
            },
            {
              fieldName: 'DrnkWatCI',
              label: 'Concentration of contaminants like arsenic, cadmium, lead, nitrate etc. in drinking water',
              format: {
                places: 0,
                digitSeparator: true
              }
            },
            {
              fieldName: 'DSL_PM',
              label: 'Annual emissions from diesel engines (on-road and non-road sources)',
              format: {
                places: 0,
                digitSeparator: true
              }
            },
            {
              fieldName: 'PM2_5',
              label: 'Annual concentration of PM2.5',
              format: {
                places: 0,
                digitSeparator: true
              }
            },
            {
              fieldName: 'MedianFami',
              label: 'Median income',
              format: {
                places: 0,
                digitSeparator: true
              }
            },
            {
              fieldName: 'PovertyRat',
              label: 'Poverty rate',
              format: {
                places: 0,
                digitSeparator: true
              }
            },
            {
              fieldName: 'Pop2010',
              label: 'Population',
              format: {
                places: 0,
                digitSeparator: true
              }
            }
          ]
        }
      ]
    };
  }


  public async ngOnInit() {
    console.log('running ngoninit');
    // use esri-loader to load JSAPI modules
    try {
      const [Map, MapView, FeatureLayer, WebStyleSymbol, Basemap, Search, Locator] = await loadModules([
        'esri/Map',
        'esri/views/MapView',
        'esri/layers/FeatureLayer',
        'esri/symbols/WebStyleSymbol',
        'esri/Basemap',
        'esri/widgets/Search',
        'esri/tasks/Locator',
      ]);
      console.log('got here');
      const basemap = new Basemap({
        portalItem: {
          id: '8dda0e7b5e2d4fafa80132d59122268c'
        }
      });

      // national parks layer
      const layer = new FeatureLayer({
        url:
          'https://services.arcgis.com/nGt4QxSblgDfeJn9/arcgis/rest/services/Vacant_Lots_SpatialJoin/FeatureServer/0',
        outFields: ['*'],
        popupTemplate: this.createPopupTemplate()
      });

      const map = new Map({
        basemap,
        layers: [layer]
      });

        this.mapView = new MapView({
          container: this.viewNode.nativeElement,
          center: [-118.24, 34.05],
          zoom: 10,
          map
        });

        this.mapView.on('pointer-down', (event) => {
          console.log('the pointer clicked');
          const query = layer.createQuery();
          query.geometry = this.mapView.toMap(event);
          console.log(query.geometry);
        });

      const search = new Search({  //Add Search widget
        view: this.mapView
      });

      this.mapView.ui.add(search, 'top-right');
    } catch (err) {
      console.log(err);
    }
  }
}
