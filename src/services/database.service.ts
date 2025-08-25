import { Injectable } from "@angular/core";
import { Logo, LogoImage } from "../models/logo";
import { DvdLogoComponent } from "../app/screen-bouncer/dvd-logo/dvd-logo.component";
import { BehaviorSubject, Subject } from "rxjs";
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
  //OBSERVABLES
  public loadSuccess!: Promise<boolean>;
  private db!: IDBDatabase;

  private logosSubject: BehaviorSubject<Logo[]> = new BehaviorSubject<Logo[]>([]);
  public logos$ = this.logosSubject.asObservable();

  private logoAddedSubject: Subject<Logo> = new Subject<Logo>();
  public logosAdded$ = this.logoAddedSubject.asObservable();

  private logoDeletedSubject: Subject<number> = new Subject<number>();
  public logosDeleted$ = this.logoDeletedSubject.asObservable();

  public constructor() 
  {
    this.loadSuccess = new Promise((resolve,reject) => 
    {
      const openRequest: IDBOpenDBRequest = window.indexedDB.open("screenBouncer",3);

      //After opening the main database, retrieve all logos that is currently in the IndexedDB.
      openRequest.onsuccess = (event): void  => 
      {
        this.db = openRequest.result;
        this.getAllLogos();
        resolve(true);
      };

      //Verify if any objectStoreNames is missing.
      openRequest.onupgradeneeded = (event): void => 
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

      openRequest.onerror = (event): void => 
      {
        console.error("FAILED TO OPEN DATABASE!");
        resolve(false);
      };
    });
  }

  /**
   * Images file sources can be huge in nature. Because IndexedDB cannot patch, if you make a slight change
   * (such as speed), the image file source will be readded which can cause slowdown. 
   * Therefore, this helper function will clone the object with the removed file source.
   * 
   * @param obj - The current object this should have its file source removed.
   * @returns
   * Image object without a file source if successful.
   * Else, null if stripping fails (can fail if object is not an image type).
   */
  private stripFileSource(obj: Logo): LogoImage | null
  {
    if(obj.type === "image")
    {
      const clone = structuredClone(obj);
      delete clone.typeConfig.fileSource;
      return clone;
    }
    return null;
  }

  /**
   * Add a given logo object to the database, or add a default Logo if obj parameter is nil.
   * 
   * @param obj - OPTIONAL. Object to add to the database. Should NOT have an ID property.
   */
  public createNewLogo(obj?: Logo): void
  {
    const tx: IDBTransaction = this.db.transaction("logos","readwrite");
    const store: IDBObjectStore = tx.objectStore("logos");
    const logoModel = obj ?? this.defaultObject();

    const request = store.add(this.stripFileSource(logoModel) ?? logoModel);
    request.onsuccess = (): void =>
    {
      logoModel.id = request.result as number;

      if(logoModel.type === "image")
      {
        this.updateImage(logoModel);
      }

      this.logoAddedSubject.next(logoModel);
    };
  }

  /**
   * Remove a logo from the datastore.
   * 
   * @param id - The id of the Logo that should be removed from the datastore.
   */
  public deleteLogo(id: number): void
  {
    const tx: IDBTransaction = this.db.transaction("logos","readwrite");
    const store: IDBObjectStore = tx.objectStore("logos");
    const request = store.delete(id);

    request.onsuccess = (): void => 
    {
      this.logoDeletedSubject.next(id);

      const imageTx: IDBTransaction = this.db.transaction("images","readwrite");
      const imageStore: IDBObjectStore = imageTx.objectStore("images");
      imageStore.delete(id);
    };
  }

  /**
   * Remove everything from the image and logos datastore. Afterwards, the default DVD logo will be added.
   */
  public clearAll(): void
  {
    const imageTx: IDBTransaction = this.db.transaction("images","readwrite");
    const imageStore: IDBObjectStore = imageTx.objectStore("images");
    imageStore.clear();

    const tx: IDBTransaction = this.db.transaction("logos","readwrite");
    const store: IDBObjectStore = tx.objectStore("logos");
    const request = store.clear();

    request.onsuccess = (): void => 
    {
      this.getAllLogos();
    };
  }

  /**
   * Given an ID, clone the logo.
   * 
   * @param id - The ID of the logo that should be cloned.
   */
  public cloneLogo(id: number): void
  {
    const tx: IDBTransaction = this.db.transaction("logos","readwrite");
    const store: IDBObjectStore = tx.objectStore("logos");
    const request = store.get(id);

    request.onsuccess = (): void =>
    {
      const logo = request.result as Logo;

      const imageTx: IDBTransaction = this.db.transaction("images","readwrite");
      const imageStore: IDBObjectStore = imageTx.objectStore("images");
      const imageRequest = imageStore.get(logo.id!);

      delete logo.id; // The clone will have its own ID.

      if(logo.type === "image")
      {
        imageRequest.onsuccess = (): void =>
        {
          const result = imageRequest.result as Image;
          if(result?.fileSource)
          {
            logo.typeConfig.fileSource = result.fileSource;
          }
        };
      }
      this.createNewLogo(logo);
    };
  }

  /**
   * Modify a preexisting object in the datastore.
   * 
   * @param patch - The object that should overwrite. Should have an ID property.
   */
  public modifyLogo(patch: Logo): void
  {
    const tx: IDBTransaction = this.db.transaction("logos","readwrite");
    const store: IDBObjectStore = tx.objectStore("logos");

    if(patch.type === "image")
    {
      patch = structuredClone(patch);
      
      this.updateImage(patch);
      delete patch.typeConfig.fileSource;
    }
    store.put(patch);
  }

  /**
   * Given a patch object, update the image in the image database. It will only update
   * if the patch image source has been changed.
   * 
   * Images are in a separate database due to IndexDB not supporting patching.
   * 
   * @param patch 
   */
  private updateImage(patch: LogoImage): void
  {
    if(!patch.typeConfig.fileSource || patch.typeConfig.fileSource == "assets/DefaultLogo.svg") return;
    const fileSource: string = patch.typeConfig.fileSource;

    const imageTx: IDBTransaction = this.db.transaction("images","readwrite");
    const imageStore: IDBObjectStore = imageTx.objectStore("images");

    const readResult = imageStore.get(patch.id!);
    readResult.onsuccess = (): void =>
    {
      const result = readResult.result as Image;
    
      if(!result || result.fileSource !== fileSource)
      {
        imageStore.put({id: patch.id,fileSource: fileSource});
      }
    };
  }

  /**
   * Get all logos from the database.
   * 
   * @remarks
   * If there are no logos found, then a new default one is created.
   */
  private getAllLogos(): void
  {
      const imageTx: IDBTransaction = this.db.transaction("images","readonly");
      const imageStore: IDBObjectStore = imageTx.objectStore("images");
      const imageRequest = imageStore.getAll();

      imageRequest.onsuccess = (): void =>
      {
        //Image map of {id: filesource} so Logos can quickly refer to it.
        const images = imageRequest.result as Image[];
        const imageMap: Record<number,string> = images.reduce((images, image) => ({...images, [image.id]: image.fileSource}), {});

        const tx: IDBTransaction = this.db.transaction("logos","readonly");
        const store: IDBObjectStore = tx.objectStore("logos");
        const request = store.getAll();
        request.onsuccess = (): void =>
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

          //FALLBACK. If there are no logos, then create a new default logo.
          if(request.result.length === 0)
          {
            this.createNewLogo();
          }
        };

        request.onerror = (): void =>
        {
          this.logosSubject.error("READ REQUEST FAILED!");
        };
      };
  }

  /**
   * @returns Default DVD logo
   */
  public defaultObject(): LogoImage
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
