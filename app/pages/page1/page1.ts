import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

declare var Firebase:any;

@Component({
  templateUrl: 'build/pages/page1/page1.html'
})
export class Page1 {
  db;
  constructor(private navController: NavController) {
    this.db = new Firebase('https://project-7073738268450241823.firebaseio.com/');
  }
}
