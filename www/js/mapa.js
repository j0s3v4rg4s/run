'use strict'

// variable que modela el resultado de geoposicion del usuario
var resultado;
var distancia;

/**
Variable que representa una lista de lugares para ser evaluados en el algoritmo
**/
var lista;
/**
Variable que representa una lista de lugares que seran eliminados despues del algoritmo
**/
var listaRm = [];

// Variable q modela los puntos intermedios del algoritmo
var intermedios = [];

// posicion blobal del usuario
var myPosi;

var directionsService;
var directionsDisplay;
var distancia;
var distanciaAlgoritmo;

function controlMapa() {
    this.mapa = null;
    this.myposition = null;
    this.fire = new Firebase("https://project-7073738268450241823.firebaseio.com/points");
    directionsService = new google.maps.DirectionsService();
    directionsDisplay = new google.maps.DirectionsRenderer();
    let polyOption = {
        strokeColor: '#fa6100'
    }
    let directionOption = {
        polylineOptions: polyOption
    }
    directionsDisplay.setOptions(directionOption);

}

controlMapa.prototype.iniciarMapa = function() {
    let mapOptions = {
        center: new google.maps.LatLng(4.710988599999999, -74.072092),
        zoom: 15,
        disableDefaultUI: true,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    }
    this.mapa = new google.maps.Map(document.getElementById("map"), mapOptions);
    directionsDisplay.setMap(this.mapa);
    this.fire.on("child_added", (snapshot, prevChildKey) => {
        let direction = new google.maps.LatLng(snapshot.val().localitation.lat, snapshot.val().localitation.lng);
        let marker = new google.maps.Marker({
            position: direction,
            map: this.mapa,
            title: snapshot.key(),
            icon: "img/NewPointer-02.png"
        });
    });
    google.maps.event.addListenerOnce(this.mapa, 'center_changed', function() {
        document.getElementById("splash").className += " change";
        window.setTimeout(function() {
            document.getElementById("splash").style.display = 'none'
        }, 1000);
    });

};

controlMapa.prototype.cargarLocalizacion = function(lat, lng) {
    let pos = new google.maps.LatLng(lat, lng);
    let geocoder = new google.maps.Geocoder();
    geocoder.geocode({ 'location': pos }, (result, status) => {
        if (status === google.maps.GeocoderStatus.OK) {
            resultado = result;
        }
    });
    this.mapa.setCenter(pos);
    this.myposition = new google.maps.Marker({
        position: pos,
        map: this.mapa,
        icon: 'img/Pointer.png',
        title: 'I'
    });
    /*
    navigator.geolocation.getCurrentPosition((position) => {
        let pos = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
        let geocoder = new google.maps.Geocoder();
        geocoder.geocode({ 'location': pos }, (result, status) => {
            if (status === google.maps.GeocoderStatus.OK) {
                resultado = result;
            }
        });
        this.mapa.setCenter(pos);
        this.myposition = new google.maps.Marker({
            position: pos,
            map: this.mapa,
            icon: 'img/Pointer.png',
            title: 'I'
        });
    });*/
};

var loop2 = function(data, i, info, processData, cb) {
    let place = lista[data[i]];
    let p1 = place.localitation[info['key_i']];
    let p2 = info['info_i'];
    if (p1 === p2) {
        processData(data[i], function() {
            if (++i < data.length && distanciaAlgoritmo < distancia) {
                loop2(data, i, info, processData, cb);
            } else {
                cb();
            }
        });
    } else {
        if (++i < data.length && distanciaAlgoritmo < distancia) {
            loop2(data, i, info, processData, cb);
        } else {
            cb();
        }
    }
}

var fn2 = function(valor, cb) {
    intermedios.push({
        location: new google.maps.LatLng(lista[valor].localitation['lat'], lista[valor].localitation['lng']),
        stopover: true
    });
    let request = {
        origin: myPosi.getPosition(),
        destination: myPosi.getPosition(),
        travelMode: google.maps.TravelMode.WALKING,
        waypoints: intermedios,
        optimizeWaypoints: true
    }
    directionsService.route(request, function(response, status) {
        if (status === google.maps.DirectionsStatus.OK) {
            listaRm.push(valor);
            var dis = 0;
            for (let i = 0; i < response.routes[0].legs.length; i++) {
                dis += parseFloat(response.routes[0].legs[i].distance.value);
            }
            distanciaAlgoritmo = dis / 1000;
            if (distanciaAlgoritmo > distancia) {
                directionsDisplay.setDirections(response);
            }
            console.log(distanciaAlgoritmo);
            cb();
        } else {
            console.error(status);
            cb();
        }
    });
}

var fn1 = function(data, i, info, cb) {
    setTimeout(function() {
        let tem = info['myinfo'];
        console.log("This is iteration number: " + i)
        console.log("****   key= " + data[i] + "  value= " + tem[data[i]]);
        let nInfo = {
            key_i: data[i],
            info_i: tem[data[i]]
        }
        doSynchronousLoop(info['key_Place'], nInfo, loop2, fn2, function() {
            for (let pl of listaRm) {
                delete lista[pl];
            }
            console.log('!!!!  termino for2   !!!!!!');
            cb();
        });
    }, 0);
}

var loop1 = function(data, i, info, processData, cb) {
    processData(data, i, info, function() {
        listaRm = [];
        if (Object.keys(lista).length > 0 && distanciaAlgoritmo < distancia) {
            if (++i < data.length) {
                loop1(data, i, info, processData, cb);
            } else {
                cb();
            }
        } else {
            cb();
        }
    });
}

function doSynchronousLoop(data, info, loop, processData, done) {
    if (data.length > 0) {
        loop(data, 0, info, processData, done);
    } else {
        done();
    }
}

controlMapa.prototype.algoritmo = function(myInfo, distanciaUsuario) {
    distancia = distanciaUsuario;
    distanciaAlgoritmo = 0;
    myPosi = this.myposition;
    lista = null;
    listaRm = [];
    intermedios = [];
    this.fire.orderByChild("localitation/Country").equalTo(myInfo['Country']).on('value', (snapshot) => {
        lista = snapshot.val();
    });
    let keyPlace = Object.keys(lista);
    let keyArray = Object.keys(myInfo);
    let info = {
        key_Place: keyPlace,
        key_Array: keyArray,
        myinfo: myInfo
    }
    doSynchronousLoop(keyArray, info, loop1, fn1, function() {
        console.log('termino primer for');
    });
}
