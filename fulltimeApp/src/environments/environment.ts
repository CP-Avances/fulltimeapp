// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,

  //DESARROLLO
  urlMultitenant: 'http://192.168.0.145:3011',
  reportesURL: 'http://localhost:8080/api/reporte', // Microservicio de reportes
  socketUrl: 'http://192.168.0.145:3011',

  //PRODUCCION
  /*urlMultitenant: 'https://conexionfulltime.fulltime.com.ec',
  reportesURL: 'https://reportesfulltime.fulltime.com.ec/api/reporte',
  socketUrl: 'https://conexionfulltime.fulltime.com.ec',*/

};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
