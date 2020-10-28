import { Component, NgZone } from '@angular/core';
import { NavController, AlertController,ToastController, LoadingController } from '@ionic/angular';
import { NavigationExtras } from '@angular/router';
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
  devicePlatform: string = '';
  deviceMac:string='';
  flagByte:string='';
  constructor(private ble: BLE,
              public platform: Platform,
              public navCtrl: NavController,           
              private toastCtrl: ToastController,
              private alertCtrl: AlertController,
              private loadingController: LoadingController,
              private ngZone: NgZone) {
             }


  // Checking which platform (ios/android) the device uses
  platformCheck()
  {   
    if (this.platform.is('ios')) 
    {
      this.devicePlatform = 'ios'; 
      console.log('I am an iOS device!');         
    }
    else if(this.platform.is('android'))
    {
      this.devicePlatform = 'android'; 
      console.log('I am an Android device!');       
    }
   // console.log(this.platform.platforms());
  }

  ionViewWillEnter()
  {
      console.log('ionViewWillEnter'); 
      this.platformCheck();
      this.blecheck()            
  };
              
              
  ionViewDidLoad() 
  {
      console.log('ionViewDidLoad');
      this.blecheck()
  };
      
           
  scan() 
  {
      this.onscaning();       
      this.devices = [];  // clear existing list
      
      this.ble.scan([CUSTOM_SERVICE],3).subscribe(
                device => { this.onDiscoveredDevice(device);},
                error =>  { this.showAlert("Error","Error scanning for hm10 based devices. Make sure the Location service is enabled!");}              
        );
  
      }                    
       
  blecheck(){                
    this.ble.enable().then(
              () =>  this.scan(),
              () =>  this.bledisabled()
                );                  
              }
            
         
  bledisabled(){  

    this.showAlert("Bluetooth Disabled" , "Please Enable the Bluetooth!");
            
 }   

  onDiscoveredDevice(device) 
  {
    var advData;
    var deviceMac = '';
    var flagByte ='';
    var s ='';
    var p =':';  

    if(this.devicePlatform == 'android')
    {
      advData = new Uint8Array(device.advertising);
    }
    else if(this.devicePlatform == 'ios')
    {
      advData = new Uint8Array(device.advertisting.kCBAdvDataManufacturerData);
    }

    for(var i=0; i<advData.length; i++)
    { 
      //48, 4D, XX, XX, XX, XX, XX, XX
      if( advData[i].toString(16).toUpperCase()   == '48' 
        && advData[i+1].toString(16).toUpperCase() == '4D')
      {
        for(var j=i+2; j< i+2+6; j++)
        {
          if(advData[j].toString(16).length<2) s = '0';
          else s = ''
          if(j == i+2+6-1) p ='';
          deviceMac += s + advData[j].toString(16).toUpperCase()+ p;
        }
      }
      // 16, 00, B0, [FLAG]
      else if( advData[i].toString(16).toUpperCase()   == '16' 
            && advData[i+1].toString(16).toUpperCase() == '00'
            && advData[i+2].toString(16).toUpperCase() == 'B0')
      {
        flagByte = advData[i+3].toString(16).toUpperCase();
      }

    }
  
    console.log('device  id : '+ device.id);
    console.log('device MAC : '+ deviceMac); 
    console.log('device  id should be the same as the device MAC address on android.'); 
    console.log('Flag : '+ flagByte);
  

    this.ngZone.run(
      () => {
            this.devices.push(device);
            this.deviceMac = deviceMac;
            this.flagByte = flagByte;
          });
  }
        
    
  deviceSelected(device) { 
        
      console.log(JSON.stringify(device) + ' selected'); 
      let navigationExtras: NavigationExtras = {
            queryParams: {
                device: JSON.stringify(device)
                    }
                };
                
      this.navCtrl.navigateForward(['detail'],navigationExtras);
      this.onDeviceConnected(); 
      
           }
    
            
  async showAlert(title, message) {               
        let alert = await this.alertCtrl.create({
              header: title,
              subHeader: message,
              buttons: ['OK']
              })         
        await alert.present()
       }
                
                              
  async onscaning() {
         const loading = await this.loadingController.create({
                spinner:"bubbles",
                duration: 1000,
                translucent: true,
                mode: "ios",
                cssClass: 'spinner'
                  });
                  return await loading.present();
              }
              
 
  async onDeviceConnected() {
          let toast = await this.toastCtrl.create({             
                color: "primary",
                message: " Connected",
                duration: 1000,
                position: 'bottom'              
                });
              
          toast.onDidDismiss().then(() => {
                  console.log('Dismissed toast');
                });
              
          toast.present();
         }
              

}
