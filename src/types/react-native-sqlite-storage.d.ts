declare module 'react-native-sqlite-storage' {
  export interface SQLiteDatabase {
    executeSql(sql: string, params?: any[]): Promise<[any]>;
    close(): Promise<void>;
  }

  export interface OpenDatabaseOptions {
    name: string;
    location: string;
  }

  export function openDatabase(options: OpenDatabaseOptions): Promise<SQLiteDatabase>;
  export function DEBUG(debug: boolean): void;
  export function enablePromise(enable: boolean): void;

  const SQLite: {
    openDatabase: (options: OpenDatabaseOptions) => Promise<SQLiteDatabase>;
    DEBUG: (debug: boolean) => void;
    enablePromise: (enable: boolean) => void;
  };

  export default SQLite;
}
