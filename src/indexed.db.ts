import { error, log } from './logging';

export type ImageDataUrl = `data:image/${
  | 'jpeg'
  | 'png'
  | 'gif'};base64,${string}`;

type Axis = 'x' | 'y';
export type Coordinates = Record<Axis, CanvasParameterType>;

export type Dimension = 'height' | 'width';
export type Dimensions = Record<Dimension, CanvasParameterType>;

type CanvasParameter = Axis | Dimension;
type CanvasParameterType = number;
export type CanvasParameters = Record<CanvasParameter, CanvasParameterType>;

interface TagAnnotation extends Coordinates {
  text: string;
}

type TagBox = CanvasParameters;

interface Tag {
  annotation: TagAnnotation;
  box: TagBox;
}

interface Image extends CanvasParameters {
  dataUrl: ImageDataUrl;
}

type Tags = Tag[];

export interface TaggedImage {
  id: number;
  image: Image;
  tags: Tags;
}

export type TaggedImages = TaggedImage[];
export type DraftTaggedImage = Omit<TaggedImage, 'id'>;

export class TaggedImageService {
  private databaseInstance: IDBDatabase | null = null;

  private readonly databaseConfiguration = Object.freeze({
    name: 'canvasGallery' as const,
    version: 1 as const,
  });

  private readonly objectStoreName = 'taggedImages' as const;

  private readonly objectColumns = Object.freeze({
    id: 'id' as const,
    image: 'image' as const,
    tags: 'tags' as const,
  });

  private readonly messages = Object.freeze({
    indexDbNotSupportedError:
      'This browser does not support IndexedDB' as const,
    loadingError: 'Error loading database' as const,
    isInitialized: 'Database initialized' as const,
  });

  // REF: https://developer.mozilla.org/en-US/docs/Web/API/IDBOpenDBRequest
  protected async initializeDatabase(): Promise<IDBDatabase> {
    const databaseInstance = await new Promise<IDBDatabase>(
      (resolve, reject) => {
        // Check for support
        if (!('indexedDB' in window)) {
          error(this.messages.indexDbNotSupportedError);
          reject(this.messages.indexDbNotSupportedError);
        }

        // Open database
        const idbOpenDBRequest = window.indexedDB.open(
          this.databaseConfiguration.name,
          this.databaseConfiguration.version
        );

        // This event handles the event whereby a new version of
        // the database needs to be created Either one has not
        // been created before, or a new version number has been
        // submitted via the window.indexedDB.open line above
        // it is only implemented in recent browsers
        idbOpenDBRequest.addEventListener(
          'upgradeneeded',
          (event: IDBVersionChangeEvent) => {
            const database = (event.target as IDBOpenDBRequest).result;

            database.addEventListener('error', () => {
              error(this.messages.loadingError);
              reject(this.messages.loadingError);
            });

            // Create an `objectStore` for this database
            const objectStore = database.createObjectStore(
              this.objectStoreName,
              {
                keyPath: this.objectColumns.id,
                autoIncrement: true,
              }
            );

            // Define what data items the `objectStore` will contain
            objectStore.createIndex(
              this.objectColumns.image,
              this.objectColumns.image,
              { unique: false }
            );
            objectStore.createIndex(
              this.objectColumns.tags,
              this.objectColumns.tags,
              { unique: false }
            );

            objectStore.transaction.addEventListener('complete', (event) => {
              const database = (event.target as IDBTransaction).db;

              resolve(database);
            });
          }
        );

        // These event handlers act on the database being opened.
        idbOpenDBRequest.addEventListener('error', () => {
          error(this.messages.loadingError);
          reject(this.messages.loadingError);
        });

        idbOpenDBRequest.addEventListener('success', () => {
          log(this.messages.isInitialized);
          const database = idbOpenDBRequest.result;

          resolve(database);
        });
      }
    );

    this.databaseInstance = databaseInstance;

    return databaseInstance;
  }

  private get databaseConnection(): Promise<IDBDatabase> {
    log('databaseConnection');

    return this.databaseInstance
      ? Promise.resolve(this.databaseInstance)
      : this.initializeDatabase();
  }

  private useTaggedImagesStore(): Promise<IDBObjectStore> {
    log('useTaggedImagesStore');

    return this.databaseConnection.then((database) => {
      return new Promise((resolve) => {
        const transaction = database.transaction(
          [this.objectStoreName],
          'readwrite'
        );
        const objectStore = transaction.objectStore(this.objectStoreName);

        resolve(objectStore);
      });
    });
  }

  // REF: https://sebhastian.com/indexeddb-introduction/
  public create(taggedImage: DraftTaggedImage): Promise<TaggedImage['id']> {
    log('createTaggedImage');

    return this.useTaggedImagesStore().then((objectStore) => {
      return new Promise((resolve) => {
        // Add a new data to developers object store
        const idbRequest: IDBRequest<IDBValidKey> =
          objectStore.add(taggedImage);

        // Listen for 'complete' before resolving
        objectStore.transaction.addEventListener('complete', () => {
          const { result } = idbRequest;
          resolve(result as TaggedImage['id']);
        });
      });
    });
  }

  public getAll() {
    log('getAllTaggedImages');

    return this.useTaggedImagesStore().then((objectStore) => {
      return new Promise<TaggedImages>((resolve) => {
        const idbRequest: IDBRequest<TaggedImages> = objectStore.getAll();

        idbRequest.addEventListener('success', (event) => {
          const { result } = event.target as IDBRequest<TaggedImages>;

          resolve(result);
        });
      });
    });
  }

  public getOne(id: TaggedImage['id']) {
    log('getOneTaggedImage');

    return this.useTaggedImagesStore().then((objectStore) => {
      return new Promise<TaggedImage>((resolve) => {
        const idbRequest: IDBRequest<IDBCursorWithValue | null> =
          objectStore.openCursor(id);

        idbRequest.addEventListener('success', (event) => {
          const cursor = (event.target as IDBRequest<IDBCursorWithValue>)
            .result;

          resolve(cursor.value);
        });
      });
    });
  }

  public updateOne(taggedImage: TaggedImage, id: TaggedImage['id']) {
    log('getOneTaggedImage');

    return this.useTaggedImagesStore().then((objectStore) => {
      return new Promise<TaggedImage>((resolve) => {
        const idbRequest: IDBRequest<IDBCursorWithValue | null> =
          objectStore.openCursor(id);

        idbRequest.addEventListener('success', (event) => {
          const cursor = (event.target as IDBRequest<IDBCursorWithValue>)
            .result;
          cursor.update(taggedImage);

          resolve(cursor.value);
        });
      });
    });
  }

  public deleteOne(id: TaggedImage['id']) {
    log('getOneTaggedImage');

    return this.useTaggedImagesStore().then((objectStore) => {
      return new Promise<TaggedImage>((resolve) => {
        const idbRequest: IDBRequest<IDBCursorWithValue | null> =
          objectStore.openCursor(id);

        idbRequest.addEventListener('success', (event) => {
          const cursor = (event.target as IDBRequest<IDBCursorWithValue>)
            .result;
          cursor.delete();

          resolve(cursor.value);
        });
      });
    });
  }
}
