import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { OnInit } from '@angular/core';
import {Alert} from 'ionic-angular';
import {DetalleService} from './detalle.service';
import {Geolocation} from 'ionic-native';
/*
  Generated class for the MapaPage page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/

declare var google: any;
declare var controlMapa: any;
declare var resultado: any;

@Component({
    templateUrl: 'build/pages/mapa/mapa.html',
    providers: [DetalleService]
})
export class MapaPage implements OnInit {
    private map;
    private watchID;
    private lat;
    private lon;
    private myposition;

    constructor(private nav: NavController, private _detalleService: DetalleService) { }
    ngOnInit() {
        this.map = new controlMapa();
        this.map.iniciarMapa();
        Geolocation.getCurrentPosition().then((resp) => {
            this.lat = resp.coords.latitude;
            this.lon = resp.coords.longitude;
            this.map.cargarLocalizacion(this.lat, this.lon);
        });
        //this.whatchposition();
    }

    myData() {
        this._detalleService.getMap(resultado[0].address_components).then(mapas => {
            mapas['lat'] = resultado[0].geometry.location.lat();
            mapas['lng'] = resultado[0].geometry.location.lng();
            mapas['addres'] = resultado[0].formatted_address;
            this.map.algoritmo(mapas, 4);
        });

    }

    whatchposition() {
        this.watchID = navigator.geolocation.watchPosition((position) => {
            let latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
            this.map.myposition.setPosition(latLng);

        }, (error) => {
            let alert = Alert.create({
                title: 'Error position',
                message: 'RounTour can\'t detect your position',
                buttons: ['Ok']
            });
            this.nav.present(alert);
            console.log(error)
        }, { timeout: 30000 });
    }
}
