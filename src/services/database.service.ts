import { Injectable } from "@angular/core";
import { Logo, LogoBase, LogoImage } from "../models/logo";
import { DvdLogoComponent } from "../app/screen-bouncer/dvd-logo/dvd-logo.component";
import { BehaviorSubject, Observable, Subject } from "rxjs";
import { LogoImageComponent } from "../app/screen-bouncer/logo-image/logo-image.component";

interface Image
{
  id: number
  fileSource: string
}

@Injectable({
  providedIn: "root"
})
export class DatabaseService 
{
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
    this.loadSuccess = new Promise((resolve,reject) => 
    {
      const openRequest: IDBOpenDBRequest = window.indexedDB.open("screenBouncer",3);

      openRequest.onsuccess = (event) => 
      {
        this.db = openRequest.result;

        this.getAllLogos();

        resolve(true);
      };

      openRequest.onupgradeneeded = (event) => 
      {
        if (!openRequest.result.objectStoreNames.contains("logos")) 
        {
          openRequest.result.createObjectStore("logos", {keyPath: "id", autoIncrement: true});
        }
        if (!openRequest.result.objectStoreNames.contains("images")) 
        {
          openRequest.result.createObjectStore("images", {keyPath: "id"});
        }
      };

      openRequest.onerror = (event) => 
      {
        console.error("FAILED TO OPEN DATABASE!");
        resolve(false);
      };
    });
  }

  stripFileSource(obj: Logo)
  {
    if(obj.type === "image")
    {
      const clone = structuredClone(obj);
      delete clone.typeConfig.fileSource;
      return clone;
    }
    return null;
  }

  createNewLogo(obj: Logo | null = null)
  {
    const tx: IDBTransaction = this.db.transaction("logos","readwrite");
    const store: IDBObjectStore = tx.objectStore("logos");
    const logoModel = obj ?? this.defaultObject();

    const request = store.add(this.stripFileSource(logoModel) ?? logoModel);

    request.onsuccess = () => 
    {
      logoModel.id = request.result as number;

      if(logoModel.type === "image")
      {
        this.updateImage(logoModel);
      }

      this.logoAddedSubject.next(logoModel);
    };
  }

  deleteLogo(id: number)
  {
    const tx: IDBTransaction = this.db.transaction("logos","readwrite");
    const store: IDBObjectStore = tx.objectStore("logos");
    const request = store.delete(id);

    request.onsuccess = () => 
    {
      this.logoDeletedSubject.next(id);

      const imageTx: IDBTransaction = this.db.transaction("images","readwrite");
      const imageStore: IDBObjectStore = imageTx.objectStore("images");
      const imageRequest = imageStore.delete(id);
    };
  }

  clearAll()
  {
    const imageTx: IDBTransaction = this.db.transaction("images","readwrite");
    const imageStore: IDBObjectStore = imageTx.objectStore("images");
    imageStore.clear();

    const tx: IDBTransaction = this.db.transaction("logos","readwrite");
    const store: IDBObjectStore = tx.objectStore("logos");
    const request = store.clear();

    request.onsuccess = () => 
    {
      this.getAllLogos();
    };
  }

  cloneLogo(id: number)
  {
    const tx: IDBTransaction = this.db.transaction("logos","readwrite");
    const store: IDBObjectStore = tx.objectStore("logos");
    const request = store.get(id);

    request.onsuccess = () => 
    {
      const logo = request.result as Logo;

      const imageTx: IDBTransaction = this.db.transaction("images","readwrite");
      const imageStore: IDBObjectStore = imageTx.objectStore("images");
      const imageRequest = imageStore.get(logo.id!);

      delete logo.id;

      if(logo.type === "image")
      {
        imageRequest.onsuccess = () => 
        {
          const result = imageRequest.result as Image;
          if(result?.fileSource)
          {
            logo.typeConfig.fileSource = result.fileSource;
          }
          this.createNewLogo(logo);
        };
      }
      else
      {
        this.createNewLogo(logo);
      }
    };
  }

  modifyLogo(patch: Logo)
  {
    const tx: IDBTransaction = this.db.transaction("logos","readwrite");
    const store: IDBObjectStore = tx.objectStore("logos");

    if(patch.type === "image")
    {
      patch = structuredClone(patch);
      this.updateImage(patch);
      delete patch.typeConfig.fileSource;
    }
    const request = store.put(patch);

    return patch;
  }

  updateImage(patch: LogoImage)
  {
    if(!patch.typeConfig.fileSource || patch.typeConfig.fileSource == "assets/DefaultLogo.svg") return;
    const fileSource: string = patch.typeConfig.fileSource;

    const imageTx: IDBTransaction = this.db.transaction("images","readwrite");
    const imageStore: IDBObjectStore = imageTx.objectStore("images");

    const readResult = imageStore.get(patch.id!);

    readResult.onsuccess = () => 
    {
      const result = readResult.result as Image;
    
      if(!result || result.fileSource !== fileSource)
      {
        imageStore.put({id: patch.id,fileSource: fileSource});
      }
    };
  }

  getImage(id: number)
  {
    return new Promise((resolve,reject) => 
    {
      const tx: IDBTransaction = this.db.transaction("images","readonly");
      const store: IDBObjectStore = tx.objectStore("images");
      const request = store.get(id);

      request.onsuccess = () => 
      {
        const logo = request.result as Image;
        resolve(logo.fileSource);
      };

      request.onerror = () => 
      {
        reject();
      };
    });
  }

  getAllLogos()
  {
      const imageTx: IDBTransaction = this.db.transaction("images","readonly");
      const imageStore: IDBObjectStore = imageTx.objectStore("images");
      const imageRequest = imageStore.getAll();

      imageRequest.onsuccess = () => 
      {
        const images = imageRequest.result as Image[];
        const imageMap: Record<number,string> = images.reduce((images, image) => ({...images, [image.id]: image.fileSource}), {});

        const tx: IDBTransaction = this.db.transaction("logos","readonly");
        const store: IDBObjectStore = tx.objectStore("logos");
        const request = store.getAll();

        request.onsuccess = () => 
        {
          const logos = request.result as Logo[];

          for(const logo of logos)
          {
            if(logo.type === "image" && imageMap[logo.id!])
            {
              logo.typeConfig.fileSource = imageMap[logo.id!];
            }
          }

          this.logosSubject.next(request.result as Logo[]);

          if(request.result.length === 0)
          {
            this.createNewLogo();
          }
        };

        request.onerror = () => 
        {
          this.logosSubject.error("READ REQUEST FAILED!");
        };
      };
  }

  defaultObject(): LogoImage
  {
    const [width,height] = LogoImageComponent.determineSpawnSize(500,300);

    return {
      type: "image",
      name: "Default Logo",
      quantity: 1,
      speed: DvdLogoComponent.defaultSpeed,
      bounceVariance: DvdLogoComponent.defaultBounceVar,
      typeConfig: {
        width: width,
        height: height,
        colorOpacity: 1,
        fileSource: "assets/DefaultLogo.svg"
      }
    };
  }
}
