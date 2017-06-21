import { Injectable, Inject, LOCALE_ID } from '@angular/core';
import { Http, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { environment } from '../environments/environment';

@Injectable()
export class CognosService {
  private readonly devServiceUrl:string = "http://server/analytics-analytique/bi/v1/disp/rds/reportData/";
  private readonly prdServiceUrl:string = ""; 
  public readonly NONE = "<NONE>";

  private readonly enCode:string = "En";
  private readonly frCode:string = "Fr";

  private readonly langEN:string = "en-CA";
  private readonly langFR:string = "fr-CA";
  private lang:string = this.langEN;
  private serviceUrl:string;

  

  public constructor(
    private http:Http,
    @Inject(LOCALE_ID) private language
  ) {
    this.setLang(language);
    this.serviceUrl = environment.production ? this.prdServiceUrl : this.devServiceUrl;
  }

  public setLang(lang:string) {
    if ( lang!=null && lang!="" )
      this.lang = lang;
  }

  public get(reportPath:string, parameters:Map<string,string>, list?:string): Observable<object> {
  	let pList:string = "";

  	parameters.forEach((value,key) => {
  		pList += "p_" + encodeURI(key) + "=" + encodeURI(value) + "&"
  	});

  	let requestOptions = new RequestOptions({ withCredentials: true });
  	return this.http.get(this.serviceUrl + "path/" + encodeURI(reportPath) + "?" + pList + "fmt=datasetjson", requestOptions).map(response => {
  		let report:object = response.json();

      if ( list==null ) {
    			for ( let table of report['dataSet']['dataTable']) {
            this.localize(table['row']);
          }
    	}
    	else {
        report = this.extract(report, list);
        this.localize(report);
      }

      return report;
  	});
  }

  public extract(cognosObject:object, list:string):object {
  	let extracted = null;
  	for ( let table of cognosObject['dataSet']['dataTable']) {
  		if ( table['id']==list ) {
  			extracted = table['row'];
  			break;
  		}
  	}
  	return extracted;
  }

  public localize(cognosTable:object):void {
    for ( let i of Object.keys(cognosTable) ) {
      for ( let key of Object.keys(cognosTable[i]) ) {
        let code = key.indexOf(this.enCode)
        if ( code>=0 ) {
          let newProp = key.substr(0, code);
          cognosTable[i][newProp] = this.lang==this.langFR ? cognosTable[i][newProp + this.frCode] : cognosTable[i][newProp + this.enCode];
        }
      }
    }
  }
}
