import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { OnInit } from '@angular/core';
import {Alert} from 'ionic-angular';
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
})
export class MapaPage implements OnInit {
  private map;
  private watchID;
  private lat;
  private lon;
  private myposition;
  constructor(private nav: NavController) { }
  ngOnInit() {
    this.map = null;
    this.watchID = null;
    this.lat = 'null';
    this.lon = 'null';
    this.myposition = null;
  }
}
