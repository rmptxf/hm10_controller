import { Component, NgZone } from '@angular/core';
import { NavController, AlertController,ToastController, LoadingController } from '@ionic/angular';
import { BLE } from '@ionic-native/ble/ngx';
import { Platform } from '@ionic/angular'; 

const CUSTOM_SERVICE = "ffe0" ;  
  
@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {


  devices: any[] = [];

  constructor(private ble: BLE,
              public platform: Platform,
              public navCtrl: NavController,           
              private toastCtrl: ToastController,
              private alertCtrl: AlertController,
              private loadingController: LoadingController,
              private ngZone: NgZone) {
             }
         
  scan() 
  {
    this.onscaning();        
    this.devices = [];
    
    this.ble.scan([CUSTOM_SERVICE], 3).subscribe(
              device => { this.onDiscoveredDevice(device);},
              error =>  { this.showAlert("Error Scanning","Make sure you have both the Bluetooth and the Location service enabled!");}              
      );
  }                    

  onDiscoveredDevice(device : any)
  {
    var advData ;      
    var advDataString = new Array; 
    var deviceMac = '';       
    var deviceFlagByte ='';    
    var deviceBattByte ='';    
    var s =':';                

    advData = new Uint8Array(device.advertisting.kCBAdvDataManufacturerData);

    for(var i=0; i<advData.length; i++)
    {
      advDataString[i] = advData[i].toString(16).toUpperCase().length < 2 ? '0'+advData[i].toString(16).toUpperCase() : advData[i].toString(16).toUpperCase();
    }

    // getting the scanned device MAC address
    // more info : HM-10_11 datasheet.pdf page 17
    for(var i=0; i<advDataString.length; i++)
    { 
      //48, 4D, XX, XX, XX, XX, XX, XX
      if( advDataString[i+0] == '48' 
      && advDataString[i+1] == '4D')
      {
        // i+2 to i+2+6(MAC size) : will hold the MAC
        for(var j=i+2; j< i+2+6; j++)
        {
          if(j == i+2+6-1) s='';
          deviceMac += advDataString[j]+s;
        }
      } 
      // 07, 16, 00, B0, [FLAG], [temperature], [humidity], [battery]
      // more info : HM-10_11 datasheet.pdf page 25
      else if(   advDataString[i+0] == '07'
              && advDataString[i+1] == '16' 
              && advDataString[i+2] == '00'
              && advDataString[i+3] == 'B0')
      {
        deviceFlagByte = advDataString [i+4];
        deviceBattByte = (advDataString [i+5] == '42' && advDataString [i+7] == '4C') ? '100' : (advDataString[i+5][1] + advDataString[i+7][1]);
      }
    }

    var scannedDevice = { name: device.name, id: device.id, mac: deviceMac, flag: deviceFlagByte, batt: deviceBattByte }; 

    console.log('Scanned device : '+JSON.stringify(scannedDevice));
    console.log('Scanned device advData : '+advDataString+'.');

    this.ngZone.run(() => 
    {
      this.devices.push(scannedDevice);
    })
  }  
    
  async showAlert(title, message) 
  {               
    let alert = await this.alertCtrl.create({
          header: title,
          subHeader: message,
          buttons: ['OK']
          })         
    await alert.present()
  }
                
                              
  async onscaning() 
  {
      const loading = await this.loadingController.create({
          spinner:"bubbles",
          duration: 3000,
          translucent: true,
          mode: "ios",
          cssClass: 'spinner'
            });
        return await loading.present();
}
              
  

}
