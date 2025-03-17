import SQLite from 'react-native-sqlite-storage';

// Ouvrir ou créer la base de données SQLite
const db = SQLite.openDatabase(
  { name: 'bnssa.db', location: 'default' },
  () => console.log("Base de données ouverte"),
  (error) => console.error("Erreur lors de l'ouverture de la base de données", error)
);

// Fonction pour créer la table des résultats
export const createTables = () => {
  db.transaction((tx) => {
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS results (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        mode TEXT NOT NULL,
        correctAnswers INTEGER NOT NULL,
        incorrectAnswers INTEGER NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
      );`,
      [],
      () => console.log("Table 'results' créée"),
      (error) => console.error("Erreur lors de la création de la table", error)
    );
  });
};

// Fonction pour insérer un résultat
export const insertResult = (mode: string, correctAnswers: number, incorrectAnswers: number) => {
  return new Promise<void>((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        `INSERT INTO results (mode, correctAnswers, incorrectAnswers) VALUES (?, ?, ?);`,
        [mode, correctAnswers, incorrectAnswers],
        (_, result) => {
          console.log("Résultat ajouté !");
          resolve();
        },
        (_, error) => {
          console.error("Erreur lors de l'insertion", error);
          reject(error);
        }
      );
    });
  });
};

// Fonction pour récupérer tous les résultats
export const getAllResults = () => {
  return new Promise<any[]>((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        `SELECT * FROM results ORDER BY timestamp DESC;`,
        [],
        (_, results) => resolve(results.rows.raw()),
        (_, error) => {
          console.error("Erreur lors de la récupération", error);
          reject(error);
        }
      );
    });
  });
};

export default db;