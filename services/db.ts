import initSqlJs, { Database, SqlJsStatic } from 'sql.js';

const DB_NAME = 'fcprocess_db';
const STORE_NAME = 'sqlite_store';
const KEY_NAME = 'sqlite_db_file';

class DatabaseService {
  private db: Database | null = null;
  private SQL: SqlJsStatic | null = null;
  private initPromise: Promise<void> | null = null;

  constructor() {
    this.initPromise = this.init();
  }

  private async init() {
    if (this.db) return;

    try {
      // Load sql.js WASM
      this.SQL = await initSqlJs({
        locateFile: (file) => `/${file}`,
      });

      // Try to load existing DB from IndexedDB
      const savedData = await this.loadFromIndexedDB();

      if (savedData) {
        this.db = new this.SQL.Database(new Uint8Array(savedData));
        console.log('Database loaded from IndexedDB');
      } else {
        this.db = new this.SQL.Database();
        console.log('New database created');
        this.initTables();
        await this.save();
      }
    } catch (error) {
      console.error('Failed to initialize database:', error);
      throw error;
    }
  }

  private initTables() {
    if (!this.db) return;

    const createWorkflowsTable = `
      CREATE TABLE IF NOT EXISTS workflows (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        updated_at TEXT
      );
    `;

    const createGraphsTable = `
      CREATE TABLE IF NOT EXISTS graphs (
        workflow_id TEXT PRIMARY KEY,
        nodes JSON,
        edges JSON,
        default_edge_options JSON,
        FOREIGN KEY(workflow_id) REFERENCES workflows(id) ON DELETE CASCADE
      );
    `;

    this.db.run(createWorkflowsTable);
    this.db.run(createGraphsTable);
  }

  private async loadFromIndexedDB(): Promise<ArrayBuffer | null> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, 1);

      request.onupgradeneeded = (event: any) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };

      request.onsuccess = (event: any) => {
        const db = event.target.result;
        const transaction = db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const getRequest = store.get(KEY_NAME);

        getRequest.onsuccess = () => {
          resolve(getRequest.result);
        };

        getRequest.onerror = () => {
          reject(getRequest.error);
        };
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  private async saveToIndexedDB(data: Uint8Array): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, 1);

      request.onsuccess = (event: any) => {
        const db = event.target.result;
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const putRequest = store.put(data, KEY_NAME);

        putRequest.onsuccess = () => {
          resolve();
        };

        putRequest.onerror = () => {
          reject(putRequest.error);
        };
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  public async save() {
    if (!this.db) return;
    const data = this.db.export();
    await this.saveToIndexedDB(data);
  }

  public async getDb(): Promise<Database> {
    if (!this.initPromise) {
        this.initPromise = this.init();
    }
    await this.initPromise;
    if (!this.db) {
      throw new Error('Database not initialized');
    }
    return this.db;
  }

  public async run(sql: string, params?: any[]) {
    const db = await this.getDb();
    db.run(sql, params);
    await this.save();
  }

  public async exec(sql: string, params?: any[]) {
      const db = await this.getDb();
      return db.exec(sql, params);
  }
  
  // Helper to get all rows as objects
  public async query(sql: string, params?: any[]): Promise<any[]> {
      const db = await this.getDb();
      const result = db.exec(sql, params);
      if (result.length === 0) return [];
      
      const columns = result[0].columns;
      const values = result[0].values;
      
      return values.map(row => {
          const obj: any = {};
          columns.forEach((col, index) => {
              obj[col] = row[index];
          });
          return obj;
      });
  }
  
  // Helper to get a single row
  public async queryOne(sql: string, params?: any[]): Promise<any | undefined> {
      const rows = await this.query(sql, params);
      return rows[0];
  }
}

export const dbService = new DatabaseService();
