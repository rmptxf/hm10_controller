### Ionic V5.2
The project is based on ionic v5.2. I use this version, cause it was the latest version that supports the IonicDevapp.

* To uinstall the current version, and install the 5.2 version
```bash
npm uninstall -g ionic && npm install -g ionic@5.2.0
```
* The Ionic devapp can be used to test the project, before building the actual app. 
```bash
ionic serve --devapp
```
> The **Ionic Devapp** was [**retired**](https://ionicframework.com/docs/appflow/devapp), and it is no longer available in the app/play stores, so I included the Android verion (apk) I still have in the **Ionic_Devapp** folder.

>If you encouter this issue { Invalid options object. Copy Plugin has been initialized using an options object that does not match the API schema }, try to execute this command :
```bash
npm i @ionic/angular-toolkit@2.3.0 -E -D
```

### HM10

The HM10 BLE module, has one custom service (uuid :*ffe0*), with one characteristic (uuid: *ffe1*). The characteristic is capable of handeling **20 bytes** at time. So, the maximum data you can transsmite or recieve at one time is 20 bytes.
The notifications on the custom chaaracteristic should be enabled, to get notified of any data updates.

## Arduino

Sendig data from an arduino code requires using the **print()** function.

## App workflow
After connecting to the hm10 based device, you'll need to enable the Notifications on the custom characteristic (*ffe1*).
After that, you can have the arduino send the data using the **print()** function. The data would containe the actual variable, separated with a comma.

*Example :* 

The arduino will **print("124,254,245,361,212,")**. 

The app will take the values in between the commas. So the Data[0] = 124, and the Data[1] = 254  and so on. for now, the app takes 4 variables.

The printed data will also be displayed on the top.

And you can also send data back to the Arduino, uisng the box down. use the enter key on the vertual keyboard to send your data. The max size id limited to 20bytes. And you can use **the read()** function in the side of the arduino, to read this data.


