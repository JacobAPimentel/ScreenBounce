import { Injectable } from "@angular/core";
import { Logo, LogoBase, LogoImage } from "../models/logo";
import { DvdLogoComponent } from "../app/screen-bouncer/dvd-logo/dvd-logo.component";
import { BehaviorSubject, Observable, Subject } from "rxjs";

@Injectable({
  providedIn: "root"
})
export class DatabaseService {
  public loadSuccess!: Promise<boolean>;
  private db!: IDBDatabase;

  private logosSubject: BehaviorSubject<Logo[]> = new BehaviorSubject<Logo[]>([]);
  public logos$ = this.logosSubject.asObservable();

  private logoAddedSubject: Subject<Logo> = new Subject<Logo>();
  public logosAdded$ = this.logoAddedSubject.asObservable();

  private logoDeletedSubject: Subject<number> = new Subject<number>();
  public logosDeleted$ = this.logoDeletedSubject.asObservable();

  constructor() 
  {
    this.loadSuccess = new Promise((resolve,reject) => {
      const openRequest: IDBOpenDBRequest = window.indexedDB.open("screenBouncer",3);

      openRequest.onsuccess = (event) => {
        this.db = openRequest.result;

        this.getAllLogos();

        resolve(true);
      }

      openRequest.onupgradeneeded = (event) => {
        if (!openRequest.result.objectStoreNames.contains("logos")) {
          openRequest.result.createObjectStore("logos", {keyPath: "id", autoIncrement: true});
        }
      };

      openRequest.onerror = (event) => {
        console.error("FAILED TO OPEN DATABASE!")
        resolve(false);
      }
    })
  }

  createNewLogo(obj: Logo | null = null)
  {
    const tx: IDBTransaction = this.db.transaction("logos","readwrite");
    const store: IDBObjectStore = tx.objectStore("logos");
    const logo = obj ?? this.defaultObject();
    const request = store.add(logo);

    request.onsuccess = () => {
      logo.id = request.result as number;
      this.logoAddedSubject.next(logo)
    }
  }

  deleteLogo(id: number)
  {
    const tx: IDBTransaction = this.db.transaction("logos","readwrite");
    const store: IDBObjectStore = tx.objectStore("logos");
    const request = store.delete(id);

    request.onsuccess = () => {
      this.logoDeletedSubject.next(id);
    }
  }

  clearAll()
  {
    const tx: IDBTransaction = this.db.transaction("logos","readwrite");
    const store: IDBObjectStore = tx.objectStore("logos");
    const request = store.clear();

    request.onsuccess = () => {
      this.getAllLogos();
    }
  }

  cloneLogo(id: number)
  {
    const tx: IDBTransaction = this.db.transaction("logos","readwrite");
    const store: IDBObjectStore = tx.objectStore("logos");
    const request = store.get(id);

    request.onsuccess = () => {
      const logo = request.result as Logo
      delete logo.id
      this.createNewLogo(logo)
    }
  }

  modifyLogo(patch: Logo)
  {
    const tx: IDBTransaction = this.db.transaction("logos","readwrite");
    const store: IDBObjectStore = tx.objectStore("logos");
    const request = store.put(patch);
  }

  getAllLogos()
  {
      const tx: IDBTransaction = this.db.transaction("logos","readonly");
      const store: IDBObjectStore = tx.objectStore("logos");
      const request = store.getAll();

      request.onsuccess = () => {
        this.logosSubject.next(request.result as Logo[])

        if(request.result.length === 0)
        {
          this.createNewLogo();
        }
      }

      request.onerror = () => {
        this.logosSubject.error("READ REQUEST FAILED!");
      }
  }

  defaultObject(): LogoImage
  {
    return {
      type: "image",
      name: "Default Logo",
      speed: DvdLogoComponent.defaultSpeed,
      bounceVariance: DvdLogoComponent.defaultBounceVar,
      typeConfig: {
        width: 500,
        height: 300,
        colorOpacity: 1,
        fileSource: "assets/DefaultLogo.svg"
      }
    }
  }
}
