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
import {NgForm} from '@angular/forms';
import {ToastController} from "@ionic/angular";
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
  @Input() considerLowIncome: boolean;

  @Input() parcelDimensions: any;
  @Input() myForm: NgForm;

  queryData: any;

  @ViewChild('mapViewNode', { static: true }) private viewNode: ElementRef; // needed to inject the MapView into the DOM
  mapView: __esri.MapView;
  graphicsLayer: any;
  panRequestSubscription: any;

  formChanged = false;
  isQueryData = false;

  pointGraphic: any;

  constructor(public toastController: ToastController) {}

  async presentToast() {
    const toast = await this.toastController.create({
      message: 'Map Query results have been updated',
      duration: 800,
      color:'secondary'
    });
    toast.present();
  }

createPopupTemplate() {
    return {
      title: 'Parcel Attributes',
      content: [
        {
          type: 'fields',
          fieldInfos: [
            {
              fieldName: 'AIN',
              label: 'AIN',
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


  updateMap(layer, layerView)
  {

    //base query attributes
    const query = layer.createQuery();
    query.geometry = this.mapView.center; //set origin point from center of map

    const point = { //Create a point
      type: 'point',
      longitude: query.geometry.longitude,
      latitude: query.geometry.latitude
    };

    this.pointGraphic.geometry = point;

    query.units = 'miles';
    query.spatialRelationship = 'intersects';  // this is the default
    query.returnGeometry = true;
    //query.outFields = [ "PARK" ];

    //variable query attributes
    query.distance = this.searchRadius;
    query.where = `ShapeSTAre >= '${this.parcelDimensions.lower}'`;
    query.where += ` AND ShapeSTAre <= '${this.parcelDimensions.upper}'`;

    if (this.considerFoodDeserts)
    {
      query.where += ` AND (latracts_h = 1 OR latracts1 = 1)`;
    }

    if (this.considerPublicTransport)
    {
      query.where += ` AND MetroDist < 2.00`;
    }
    if (this.considerDistanceCommunityCenters)
    {
      query.where += ` AND schmdist < 2.00`;
    }
    if (this.considerHeavyMetals)
    {
      query.where += ` AND DrnkWatCI < 700.00`;
    }
    if (this.considerLowIncome)
    {
      query.where += ` AND LowIncomeT = 1`;
    }
    console.log(query.where);

    //perform query
    layerView.queryFeatures(query)
      .then((response) => {
        try {
        console.log(response);
        if (response.features) {
          this.presentToast();
          this.queryData = response.features;
        } else {
          this.queryData = [];
        }
      } catch (err) {
          console.log(err);
        }
      });
  }


  panMap(coordinates, area){

    const zoom = (20-Math.sqrt(Math.sqrt(area)));

    console.log(zoom);
    console.log(area);

    this.mapView.goTo(coordinates)
      .then(() => {
        this.mapView.zoom = 13;
      });
  }


  public async ngOnInit() {
    console.log('running ngoninit');

    this.queryData = [];
    // use esri-loader to load JSAPI modules
    try {
      const [Map, MapView, FeatureLayer, WebStyleSymbol, Basemap, Search, Locator, Graphic, GraphicsLayer] = await loadModules([
        'esri/Map',
        'esri/views/MapView',
        'esri/layers/FeatureLayer',
        'esri/symbols/WebStyleSymbol',
        'esri/Basemap',
        'esri/widgets/Search',
        'esri/tasks/Locator',
        'esri/Graphic',
        'esri/layers/GraphicsLayer',
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
          'https://services.arcgis.com/nGt4QxSblgDfeJn9/arcgis/rest/services/Final_vacant_lots2/FeatureServer/0',
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

        this.graphicsLayer = new GraphicsLayer();
        map.add(this.graphicsLayer);

       const point = { //Create a point
        type: 'point',
        longitude: -118.24,
        latitude: 34.05
      };
      const simpleMarkerSymbol = {
        type: 'simple-marker',
        color: [124, 159, 113],  // Orange
        outline: {
          color: [255, 255, 255], // White
          width: 1,
        }
      };

      this.pointGraphic = new Graphic({
        geometry: point,
        symbol: simpleMarkerSymbol
      });

      this.graphicsLayer.add(this.pointGraphic);

        // this.mapView.on('pointer-down', (event) => {
        //   console.log('the pointer clicked');
        //   const query = layer.createQuery();
        //   query.geometry = this.mapView.toMap(event);
        //   console.log(query.geometry);
        // });

      const layerView = await this.mapView.whenLayerView(layer);

      const search = new Search({  //Add Search widget
        view: this.mapView
      });

      search.on('select-result', (event) => {
        setTimeout(() => {this.updateMap(layer, layerView);}, 100);
      });

      this.mapView.ui.add(search, 'top-right');

      this.myForm.form.valueChanges.subscribe(c => {
        this.formChanged = true;
        this.isQueryData = true;
        setTimeout(() => {this.updateMap(layer, layerView);}, 100);
      });
    } catch (err) {
      console.log(err);
    }
  }
}
