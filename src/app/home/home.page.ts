import {Component, Input, OnInit, ViewChild} from '@angular/core';
import { EsriMapComponent } from './esri-map/esri-map.component';
import {NgForm} from '@angular/forms';
import { loadModules } from 'esri-loader';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit{
  searchRadius: number;
  considerFoodDeserts: boolean;
  considerPublicTransport: boolean;
  considerDistanceCommunityCenters: boolean;
  considerHeavyMetals: boolean;
  considerSunlight: boolean;
  parcelDimensions: any;

  locator: __esri.locator;

  openFoodDesert: boolean;
  openPublicTransport: boolean;
  openCommunityCenters: boolean;
  openHeavyMetals: boolean;
  openSunlight: boolean;
  openParcelDimensions: boolean;
  openSearchRadius: boolean;

  formChanged = false;
  @ViewChild('myForm', { static: true }) myForm: NgForm;

  constructor() {}

  closeAllDescriptions() {
    this.openParcelDimensions = false;
    this.openSearchRadius = false;
    this.openFoodDesert = false;
    this.openSunlight = false;
    this.openCommunityCenters = false;
    this.openPublicTransport = false;
    this.openHeavyMetals = false;
  }

  showParcelDimensions() {
    let isOpen = false;
    if (this.openParcelDimensions) {
      isOpen = true;
    }
    this.closeAllDescriptions();
    this.openParcelDimensions = !this.openParcelDimensions;

    if (isOpen) {
      this.openParcelDimensions = false;
    }
    console.log(this.openParcelDimensions);
  }

  showSearchRadius() {
    let isOpen = false;
    if (this.openSearchRadius) {
      isOpen = true;
    }
    this.closeAllDescriptions();
    this.openSearchRadius = !this.openSearchRadius;

    if (isOpen) {
      this.openSearchRadius = false;
    }
  }

  showFoodDesert() {
    let isOpen = false;
    if (this.openFoodDesert) {
      isOpen = true;
    }
    this.closeAllDescriptions();
    this.openFoodDesert = !this.openFoodDesert;

    if (isOpen) {
      this.openFoodDesert = false;
    }
  }

  showPublicTransport() {
    let isOpen = false;
    if (this.openPublicTransport) {
      isOpen = true;
    }
    this.closeAllDescriptions();
    this.openPublicTransport = !this.openPublicTransport;

    if (isOpen) {
      this.openPublicTransport = false;
    }
  }

  showCommunityCenters() {
    let isOpen = false;
    if (this.openCommunityCenters) {
      isOpen = true;
    }
    this.closeAllDescriptions();
    this.openCommunityCenters = !this.openCommunityCenters;
    if (isOpen) {
      this.openCommunityCenters = false;
    }
  }

  showHeavyMetals() {
    let isOpen = false;
    if (this.openHeavyMetals) {
      isOpen = true;
    }
    this.closeAllDescriptions();
    this.openHeavyMetals = !this.openHeavyMetals;
    if (isOpen) {
      this.openHeavyMetals = false;
    }
  }

  showSunlight() {
    let isOpen = false;
    if (this.openSunlight) {
      isOpen = true;
    }
    this.closeAllDescriptions();
    this.openSunlight = !this.openSunlight;
    if (isOpen) {
      this.openSunlight = false;
    }
  }

  testPlaces() {
    // console.log('testing places');
    const params: __esri.locatorAddressToLocationsParams = {
      address: {
        address: 'Starbucks'
      },
      // location: [-118.24, 34.05],  // San Francisco (-122.4194, 37.7749)
      outFields: ['PlaceName','Place_addr']
    };

    // console.log(this.locator);
    this.locator.addressToLocations(params, 'http://geocode-api.arcgis.com/arcgis/rest/services/World/GeocodeServer').then((results)=> {
      console.log('getting back the results');
      console.log(results);
    });
  }

  async ngOnInit() {

    try {
      const [Locator] = await loadModules([
        'esri/tasks/Locator',
      ]);

      this.locator = new Locator({
        url: 'http://geocode-api.arcgis.com/arcgis/rest/services/World/GeocodeServer'
      });

      this.searchRadius = 5;
      this.considerFoodDeserts = true;
      this.considerPublicTransport = true;
      this.considerDistanceCommunityCenters = true;
      this.considerHeavyMetals = false;
      this.considerSunlight = false;
      this.parcelDimensions = {lower: 0, upper: 10};

      this.openFoodDesert = false;


      this.myForm.form.valueChanges.subscribe(c => {
        this.formChanged = true;
        console.log('this form changed!');
        this.testPlaces();
      });
    } catch (err) {
      console.log(err);
    }
  }


}
