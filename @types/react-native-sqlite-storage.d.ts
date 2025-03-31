// @types/react-native-sqlite-storage.d.ts

declare module 'react-native-sqlite-storage' {
    interface SQLiteDatabase {
      transaction(callback: (tx: any) => void): void;
      executeSql(sql: string, params: any[], callback: (tx: any, results: any) => void): void;
    }
  
    function openDatabase(
      config: { name: string; location: string },
      successCallback?: () => void,
      errorCallback?: (error: any) => void
    ): SQLiteDatabase;
  
    export { openDatabase };
  }
  