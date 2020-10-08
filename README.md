### Ionic V5
The project is based on ionic v5.2.

* To uinstall the current version, and install the 5.2 version
```bash
npm uninstall -g ionic && npm install -g ionic@5.2.0
```
* The Ionic devapp can be used to test the project, before building the actual app. The Ionic Devapp is not available in the app/play stores, so I included the Android verion I have in the Ionic_Devapp folder.
```bash
ionic serve --devapp
```

### HM10

The HM10 BLE module, has one custom service (uuid :'ffe0'), with one characteristic (uuid: 'ffe1'). The characteristic is capable of handeling 20 bytes at time. So, the maximum data you can transsmite or recieve at one time is 20 bytes.
The notifications on the custom chaaracteristic should be enabled, to get notified of any data updates.

## Arduino

Sendig data from an arduino code requires using the **print()** function.

###

