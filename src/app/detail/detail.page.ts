import { Component, NgZone } from '@angular/core';
import { NavController, ToastController, LoadingController, AlertController } from '@ionic/angular';
import { ActivatedRoute } from "@angular/router";

import { BLE } from '@ionic-native/ble/ngx';

const CUSTOM_SERVICE = "ffe0" ; 
const CUSTOM_CHAR    = "ffe1" ;  

@Component({
  selector: 'app-detail',
  templateUrl: './detail.page.html',
  styleUrls: ['./detail.page.scss'],
})
export class DetailPage {

  peripheral: any = {};
  dataToSend:string ="";
  recievedData:string ="";
  notification_status:string ="Enable Notifications";
  data0:string ="";
  data1:string ="";
  data2:string ="";
  data3:string ="";
  button_color:string = "primary";

  constructor(private ble: BLE,
              private toastCtrl: ToastController,
              public ngZone: NgZone,
              private route: ActivatedRoute,
              public loadingController: LoadingController,
              private alertCtrl: AlertController, 
              public navCtrl: NavController)
            {     
                  this.route.queryParams.subscribe(params => {
                  console.log(params);
                  let device = JSON.parse(params['device']);
                  this.ble.connect(device.id).subscribe(
                      peripheral => this.onConnected(peripheral),
                      peripheral => { this.onDeviceDisconnected(peripheral); this.navigationBackHome(); } 
                  );
              });
            }

// send text data to the BLE device    
sendData(){
  let data = this.stringToBytes(this.dataToSend);
  this.ble.writeWithoutResponse(this.peripheral.id, CUSTOM_SERVICE, CUSTOM_CHAR,data).then(
      () => this.onWriteSucceed(),
      () => this.onWriteFailed()
  );
}

// Start BLE device notifications
startNotifications(){
  // Subscribe for notifications when the device sends new data
  if(this.notification_status == "Enable Notifications"){
      this.notification_status ="Disable Notifications";
      this.button_color = "danger";
      this.ble.startNotification(this.peripheral.id, CUSTOM_SERVICE, CUSTOM_CHAR).subscribe(
        data => this.onDataChange(data[0]),
        () => { this.notification_status ="Enable Notifications"; this.button_color = "primary"; this.showAlert('Unexpected Error', 'Failed to subscribe for data changes.')}
      )}
  else {

    this.notification_status = "Enable Notifications";
    this.button_color = "primary";
    this.ble.stopNotification(this.peripheral.id, CUSTOM_SERVICE, CUSTOM_CHAR);
  }
}

//  stop notifications
stopNotifications(){
    // stop notifications from the custom char
    this.ble.stopNotification(this.peripheral.id, CUSTOM_SERVICE, CUSTOM_CHAR);
}

// disconnect from the BLE device
disconnect() {
  //stop Notifications
  if(this.notification_status == "Disable Notifications")
  {
      this.stopNotifications();
  }
  
  // disconnect
  this.ble.disconnect(this.peripheral.id).then(
          () => { this.onDisconnected(); this.navigationBackHome(); },
          () => { this.showAlert("ERROR","Error disconnecting !"); this.navigationBackHome(); }
      );     
  }

// on device disconnected 
async onDeviceDisconnected(peripheral) {
    let toast = await this.toastCtrl.create({
        color: "danger",
        message: 'The Device unexpectedly disconnected!',
        duration: 2000,
        position: 'bottom'
    });
    toast.onDidDismiss().then(() => {
        console.log('Dismissed toast');
    });
  
    toast.present();
}

// on device connected
onConnected(peripheral) {

  this.peripheral = peripheral;
  //this.startNotifications();

}

// Data change handler
onDataChange(buffer:ArrayBuffer) {
  var data = this.bytesToString(buffer);
  console.log(buffer);
  this.ngZone.run(() => {
    this.recievedData = data;
    var parts = data.split(',');
    this.data0 = parts[0];
    this.data1 = parts[1];
    this.data2 = parts[2];
    this.data3 = parts[3];

  });

}

// on device disconnected
async onDisconnected() {
  let toast = await this.toastCtrl.create({
      color: "danger",
      message: 'Disconnected',
      duration: 1000,
      position: 'bottom'
  });

  toast.onDidDismiss().then(() => {
      console.log('Dismissed toast');
  });

  toast.present();
}

// Alert
async showAlert(title, message) {               
  let alert = await this.alertCtrl.create({
        header: title,
        subHeader: message,
        buttons: ['OK']
        })         
  await alert.present();
}
  
// on writing daat succeded
async onWriteSucceed() {
  let toast = await this.toastCtrl.create({
      color: "tertiary",
      message: 'Data sent successfully.',
      duration: 800,
      position: 'bottom'
  });

  toast.onDidDismiss().then(() => {
      console.log('Dismissed toast');
  });

  toast.present();
}

// on writing data failed
async onWriteFailed() {
  let toast = await this.toastCtrl.create({
      color: "danger",
      message: 'Sending data failed.',
      duration: 1000,
      position: 'bottom'
  });

  toast.onDidDismiss().then(() => {
      console.log('Dismissed toast');
  });

  toast.present();
}


// convert an array of bytes to a string
bytesToString(buffer) 
{
    return String.fromCharCode.apply(null, new Uint8Array(buffer));
}

// convert a string to an array of bytes
stringToBytes(string) {
  var array = new Uint8Array(string.length);
    for (var i = 0, l = string.length; i < l; i++) {
      array[i] = string.charCodeAt(i);
    }
    return array.buffer;
}
// navigate back to the home page
navigationBackHome(){
  this.navCtrl.navigateBack(['home']);
}

}








