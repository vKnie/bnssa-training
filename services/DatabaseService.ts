// services/DatabaseService.ts
import * as SQLite from 'expo-sqlite';

// === INTERFACES POUR LA BASE DE DONNÉES ===

export interface ExamSession {
  id?: number;
  examDate: string;
  duration: number; // en secondes
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  unansweredQuestions: number;
  successRate: number; // pourcentage
  isPassed: boolean; // >= 30 points
}

export interface ThemeResult {
  id?: number;
  examSessionId: number;
  themeName: string;
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  unansweredQuestions: number;
  successRate: number;
}

export interface DetailedExamResult {
  examSession: ExamSession;
  themeResults: ThemeResult[];
}

// === SERVICE DE BASE DE DONNÉES ===

class DatabaseService {
  private db: SQLite.SQLiteDatabase | null = null;
  private isInitializing: boolean = false; // NOUVEAU : Flag d'initialisation
  private isInitialized: boolean = false; // NOUVEAU : Flag d'état

  // Initialisation de la base de données avec protection contre les appels multiples
  async initDatabase(): Promise<void> {
    // NOUVEAU : Si déjà initialisé, ne rien faire
    if (this.isInitialized && this.db) {
      console.log('✅ Base de données déjà initialisée');
      return;
    }

    // NOUVEAU : Si en cours d'initialisation, attendre
    if (this.isInitializing) {
      console.log('⏳ Initialisation en cours, attente...');
      // Attendre que l'initialisation se termine
      while (this.isInitializing) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      return;
    }

    try {
      this.isInitializing = true; // NOUVEAU : Marquer comme en cours
      console.log('🔄 Initialisation de la base de données...');
      
      // Ouverture de la base de données
      this.db = await SQLite.openDatabaseAsync('bnssa_exams.db');
      console.log('✅ Base de données ouverte');
      
      // Création des tables
      await this.createTables();
      console.log('✅ Tables créées avec succès');
      
      this.isInitialized = true; // NOUVEAU : Marquer comme initialisé
    } catch (error) {
      console.error('❌ Erreur lors de l\'initialisation de la base de données:', error);
      this.isInitialized = false; // NOUVEAU : Réinitialiser en cas d'erreur
      throw error;
    } finally {
      this.isInitializing = false; // NOUVEAU : Toujours libérer le flag
    }
  }

  // Création des tables avec gestion d'erreurs améliorée
  private async createTables(): Promise<void> {
    if (!this.db) throw new Error('Base de données non initialisée');

    try {
      // NOUVEAU : Vérifier si les tables existent déjà
      const existingTables = await this.db.getAllAsync(
        "SELECT name FROM sqlite_master WHERE type='table' AND name IN ('exam_sessions', 'theme_results')"
      );

      if (existingTables.length === 2) {
        console.log('✅ Tables déjà existantes');
        return;
      }

      // Table des sessions d'examen
      await this.db.execAsync(`
        CREATE TABLE IF NOT EXISTS exam_sessions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          examDate TEXT NOT NULL,
          duration INTEGER NOT NULL,
          score INTEGER NOT NULL,
          totalQuestions INTEGER NOT NULL,
          correctAnswers INTEGER NOT NULL,
          incorrectAnswers INTEGER NOT NULL,
          unansweredQuestions INTEGER NOT NULL,
          successRate REAL NOT NULL,
          isPassed INTEGER NOT NULL
        );
      `);

      // Table des résultats par thème
      await this.db.execAsync(`
        CREATE TABLE IF NOT EXISTS theme_results (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          examSessionId INTEGER NOT NULL,
          themeName TEXT NOT NULL,
          totalQuestions INTEGER NOT NULL,
          correctAnswers INTEGER NOT NULL,
          incorrectAnswers INTEGER NOT NULL,
          unansweredQuestions INTEGER NOT NULL,
          successRate REAL NOT NULL,
          FOREIGN KEY (examSessionId) REFERENCES exam_sessions (id) ON DELETE CASCADE
        );
      `);

      console.log('✅ Tables créées');
    } catch (error) {
      console.error('❌ Erreur lors de la création des tables:', error);
      throw error;
    }
  }

  // NOUVEAU : Méthode pour s'assurer que la DB est prête
  private async ensureDbReady(): Promise<void> {
    if (!this.isInitialized || !this.db) {
      await this.initDatabase();
    }
  }

  // Sauvegarde d'une session d'examen complète
  async saveExamSession(
    duration: number,
    score: number,
    totalQuestions: number,
    selectedQuestions: any[],
    selectedAnswers: string[][]
  ): Promise<number> {
    await this.ensureDbReady(); // NOUVEAU : Vérification avant utilisation

    try {
      console.log('🔄 Début sauvegarde session d\'examen...');
      
      const examDate = new Date().toISOString();
      const { correctAnswers, incorrectAnswers, unansweredQuestions } = this.calculateAnswerStats(
        selectedQuestions,
        selectedAnswers
      );
      const successRate = (score / totalQuestions) * 100;
      const isPassed = score >= 30;

      console.log('📊 Données calculées:', {
        duration,
        score,
        totalQuestions,
        correctAnswers,
        incorrectAnswers,
        unansweredQuestions,
        successRate,
        isPassed
      });

      // Insertion de la session d'examen
      const result = await this.db!.runAsync(
        `INSERT INTO exam_sessions 
         (examDate, duration, score, totalQuestions, correctAnswers, incorrectAnswers, unansweredQuestions, successRate, isPassed)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [examDate, duration, score, totalQuestions, correctAnswers, incorrectAnswers, unansweredQuestions, successRate, isPassed ? 1 : 0]
      );

      const examSessionId = result.lastInsertRowId;
      console.log('✅ Session d\'examen insérée avec ID:', examSessionId);

      // Calcul et sauvegarde des résultats par thème
      const themeStats = this.calculateThemeStats(selectedQuestions, selectedAnswers);
      const totalThemes = Object.keys(themeStats).length;

      console.log(`🔄 Sauvegarde de ${totalThemes} thèmes...`);

      let themeCount = 0;
      for (const [themeName, stats] of Object.entries(themeStats)) {
        const themeSuccessRate = stats.totalQuestions > 0 ? (stats.correctAnswers / stats.totalQuestions) * 100 : 0;
        
        await this.db!.runAsync(
          `INSERT INTO theme_results 
           (examSessionId, themeName, totalQuestions, correctAnswers, incorrectAnswers, unansweredQuestions, successRate)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [examSessionId, themeName, stats.totalQuestions, stats.correctAnswers, stats.incorrectAnswers, stats.unansweredQuestions, themeSuccessRate]
        );

        themeCount++;
        console.log(`✅ Thème ${themeCount}/${totalThemes} sauvegardé: ${themeName}`);
      }

      console.log('✅ Sauvegarde terminée avec succès');
      return examSessionId;
    } catch (error) {
      console.error('❌ Erreur lors de la sauvegarde de la session d\'examen:', error);
      throw error;
    }
  }

  // Calcul des statistiques globales de réponses
  private calculateAnswerStats(selectedQuestions: any[], selectedAnswers: string[][]) {
    let correctAnswers = 0;
    let incorrectAnswers = 0;
    let unansweredQuestions = 0;

    selectedQuestions.forEach((question, index) => {
      const userAnswers = selectedAnswers[index] || [];
      
      if (userAnswers.length === 0) {
        unansweredQuestions++;
      } else {
        const isCorrect = question.correct_answers.every((answer: string) => userAnswers.includes(answer)) && 
                         userAnswers.every((answer: string) => question.correct_answers.includes(answer));
        
        if (isCorrect) {
          correctAnswers++;
        } else {
          incorrectAnswers++;
        }
      }
    });

    return { correctAnswers, incorrectAnswers, unansweredQuestions };
  }

  // Calcul des statistiques par thème
  private calculateThemeStats(selectedQuestions: any[], selectedAnswers: string[][]) {
    const themeStats: Record<string, {
      totalQuestions: number;
      correctAnswers: number;
      incorrectAnswers: number;
      unansweredQuestions: number;
    }> = {};

    selectedQuestions.forEach((question, index) => {
      const themeName = question.theme_name;
      const userAnswers = selectedAnswers[index] || [];

      if (!themeStats[themeName]) {
        themeStats[themeName] = {
          totalQuestions: 0,
          correctAnswers: 0,
          incorrectAnswers: 0,
          unansweredQuestions: 0
        };
      }

      themeStats[themeName].totalQuestions++;

      if (userAnswers.length === 0) {
        themeStats[themeName].unansweredQuestions++;
      } else {
        const isCorrect = question.correct_answers.every((answer: string) => userAnswers.includes(answer)) && 
                         userAnswers.every((answer: string) => question.correct_answers.includes(answer));
        
        if (isCorrect) {
          themeStats[themeName].correctAnswers++;
        } else {
          themeStats[themeName].incorrectAnswers++;
        }
      }
    });

    return themeStats;
  }

  // Récupération de toutes les sessions d'examen
  async getAllExamSessions(): Promise<ExamSession[]> {
    await this.ensureDbReady(); // NOUVEAU : Vérification avant utilisation

    try {
      const result = await this.db!.getAllAsync('SELECT * FROM exam_sessions ORDER BY examDate DESC');
      const sessions = result.map(row => ({
        ...row,
        isPassed: Boolean(row.isPassed)
      })) as ExamSession[];
      
      console.log(`✅ ${sessions.length} sessions récupérées`);
      return sessions;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des sessions:', error);
      throw error;
    }
  }

  // Récupération d'une session avec ses résultats par thème
  async getExamSessionWithThemes(sessionId: number): Promise<DetailedExamResult | null> {
    await this.ensureDbReady(); // NOUVEAU : Vérification avant utilisation

    try {
      const sessionResult = await this.db!.getFirstAsync(
        'SELECT * FROM exam_sessions WHERE id = ?',
        [sessionId]
      );

      if (!sessionResult) {
        console.log('❌ Session non trouvée:', sessionId);
        return null;
      }

      const themeResults = await this.db!.getAllAsync(
        'SELECT * FROM theme_results WHERE examSessionId = ? ORDER BY themeName',
        [sessionId]
      );

      console.log(`✅ Session ${sessionId} récupérée avec ${themeResults.length} thèmes`);

      return {
        examSession: {
          ...sessionResult,
          isPassed: Boolean(sessionResult.isPassed)
        } as ExamSession,
        themeResults: themeResults as ThemeResult[]
      };
    } catch (error) {
      console.error('❌ Erreur lors de la récupération de la session détaillée:', error);
      throw error;
    }
  }

  // Suppression d'une session d'examen
  async deleteExamSession(sessionId: number): Promise<void> {
    await this.ensureDbReady(); // NOUVEAU : Vérification avant utilisation

    try {
      await this.db!.runAsync('DELETE FROM exam_sessions WHERE id = ?', [sessionId]);
      console.log('✅ Session supprimée:', sessionId);
    } catch (error) {
      console.error('❌ Erreur lors de la suppression de la session:', error);
      throw error;
    }
  }

  // Suppression de toutes les données
  async clearAllData(): Promise<void> {
    await this.ensureDbReady(); // NOUVEAU : Vérification avant utilisation

    try {
      await this.db!.runAsync('DELETE FROM theme_results');
      await this.db!.runAsync('DELETE FROM exam_sessions');
      console.log('✅ Toutes les données supprimées');
    } catch (error) {
      console.error('❌ Erreur lors de la suppression des données:', error);
      throw error;
    }
  }

  // Statistiques générales
  async getGeneralStats() {
    await this.ensureDbReady(); // NOUVEAU : Vérification avant utilisation

    try {
      const totalExams = await this.db!.getFirstAsync('SELECT COUNT(*) as count FROM exam_sessions');
      const passedExams = await this.db!.getFirstAsync('SELECT COUNT(*) as count FROM exam_sessions WHERE isPassed = 1');
      const averageScore = await this.db!.getFirstAsync('SELECT AVG(score) as average FROM exam_sessions');
      const bestScore = await this.db!.getFirstAsync('SELECT MAX(score) as max FROM exam_sessions');

      const stats = {
        totalExams: totalExams?.count || 0,
        passedExams: passedExams?.count || 0,
        averageScore: Math.round(averageScore?.average || 0),
        bestScore: bestScore?.max || 0,
        successRate: totalExams?.count > 0 ? Math.round((passedExams?.count / totalExams?.count) * 100) : 0
      };

      console.log('✅ Statistiques calculées:', stats);
      return stats;
    } catch (error) {
      console.error('❌ Erreur lors du calcul des statistiques:', error);
      throw error;
    }
  }

  // NOUVEAU : Méthode pour forcer la réinitialisation (utile pour le debugging)
  async resetDatabase(): Promise<void> {
    this.isInitialized = false;
    this.isInitializing = false;
    this.db = null;
    await this.initDatabase();
  }
}

// Instance singleton
export const databaseService = new DatabaseService();