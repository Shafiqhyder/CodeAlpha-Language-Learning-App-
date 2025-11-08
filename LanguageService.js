import { db } from '../config/firebase';
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  updateDoc,
  arrayUnion 
} from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

export class LanguageService {
  static async getLessons(language) {
    try {
      // Mock data - replace with actual Firestore data
      const lessons = {
        spanish: [
          {
            id: '1',
            title: 'Basic Greetings',
            category: 'Vocabulary',
            difficulty: 'Beginner',
            content: [
              { word: 'Hola', translation: 'Hello', pronunciation: 'OH-lah' },
              { word: 'Adiós', translation: 'Goodbye', pronunciation: 'ah-DYOHS' },
              { word: 'Gracias', translation: 'Thank you', pronunciation: 'GRAH-syahs' },
              { word: 'Por favor', translation: 'Please', pronunciation: 'por fah-BOR' },
              { word: 'Lo siento', translation: 'Sorry', pronunciation: 'loh SYEN-toh' }
            ]
          },
          {
            id: '2',
            title: 'Common Phrases',
            category: 'Phrases',
            difficulty: 'Beginner',
            content: [
              { phrase: '¿Cómo estás?', translation: 'How are you?', pronunciation: 'KOH-moh ehs-TAHS' },
              { phrase: 'Me llamo...', translation: 'My name is...', pronunciation: 'meh YAH-moh' },
              { phrase: '¿Dónde está el baño?', translation: 'Where is the bathroom?', pronunciation: 'DOHN-deh ehs-TAH el BAH-nyoh' },
              { phrase: 'No entiendo', translation: 'I don\'t understand', pronunciation: 'noh en-TYEN-doh' }
            ]
          },
          {
            id: '3',
            title: 'Numbers 1-10',
            category: 'Numbers',
            difficulty: 'Beginner',
            content: [
              { word: 'Uno', translation: 'One', pronunciation: 'OO-noh' },
              { word: 'Dos', translation: 'Two', pronunciation: 'dohs' },
              { word: 'Tres', translation: 'Three', pronunciation: 'tres' },
              { word: 'Cuatro', translation: 'Four', pronunciation: 'KWAH-troh' },
              { word: 'Cinco', translation: 'Five', pronunciation: 'SEEN-koh' },
              { word: 'Seis', translation: 'Six', pronunciation: 'says' },
              { word: 'Siete', translation: 'Seven', pronunciation: 'SYEH-teh' },
              { word: 'Ocho', translation: 'Eight', pronunciation: 'OH-choh' },
              { word: 'Nueve', translation: 'Nine', pronunciation: 'NWEH-beh' },
              { word: 'Diez', translation: 'Ten', pronunciation: 'dyes' }
            ]
          }
        ],
        french: [
          {
            id: '1',
            title: 'Basic Greetings',
            category: 'Vocabulary',
            difficulty: 'Beginner',
            content: [
              { word: 'Bonjour', translation: 'Hello', pronunciation: 'bohn-ZHOOR' },
              { word: 'Au revoir', translation: 'Goodbye', pronunciation: 'oh ruh-VWAHR' },
              { word: 'Merci', translation: 'Thank you', pronunciation: 'mehr-SEE' },
              { word: 'S\'il vous plaît', translation: 'Please', pronunciation: 'seel voo PLEH' },
              { word: 'Désolé', translation: 'Sorry', pronunciation: 'deh-zoh-LEH' }
            ]
          }
        ],
        german: [
          {
            id: '1',
            title: 'Basic Greetings',
            category: 'Vocabulary',
            difficulty: 'Beginner',
            content: [
              { word: 'Hallo', translation: 'Hello', pronunciation: 'HAH-loh' },
              { word: 'Auf Wiedersehen', translation: 'Goodbye', pronunciation: 'owf VEE-der-zayn' },
              { word: 'Danke', translation: 'Thank you', pronunciation: 'DAHN-keh' },
              { word: 'Bitte', translation: 'Please', pronunciation: 'BIT-teh' },
              { word: 'Entschuldigung', translation: 'Sorry', pronunciation: 'ent-SHOOL-dee-goong' }
            ]
          }
        ],
        japanese: [
          {
            id: '1',
            title: 'Basic Greetings',
            category: 'Vocabulary',
            difficulty: 'Beginner',
            content: [
              { word: 'こんにちは', translation: 'Hello', pronunciation: 'kon-nichi-wa' },
              { word: 'さようなら', translation: 'Goodbye', pronunciation: 'sa-yo-na-ra' },
              { word: 'ありがとう', translation: 'Thank you', pronunciation: 'a-ri-ga-to' },
              { word: 'お願いします', translation: 'Please', pronunciation: 'o-ne-gai-shi-ma-su' },
              { word: 'ごめんなさい', translation: 'Sorry', pronunciation: 'go-men-na-sai' }
            ]
          }
        ]
      };

      return lessons[language] || [];
    } catch (error) {
      console.error('Error getting lessons:', error);
      return [];
    }
  }

  static async getUserProgress(userId) {
    try {
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        return userSnap.data().progress || {};
      } else {
        const initialProgress = {
          completedLessons: [],
          quizScores: [],
          streak: 0,
          lastActive: new Date().toISOString(),
          totalStudyTime: 0
        };
        await setDoc(userRef, { progress: initialProgress });
        return initialProgress;
      }
    } catch (error) {
      console.error('Error getting user progress:', error);
      const localProgress = await AsyncStorage.getItem(`progress_${userId}`);
      return localProgress ? JSON.parse(localProgress) : {
        completedLessons: [],
        quizScores: [],
        streak: 0,
        lastActive: new Date().toISOString(),
        totalStudyTime: 0
      };
    }
  }

  static async updateUserProgress(userId, progress) {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        progress: progress
      });
      await AsyncStorage.setItem(`progress_${userId}`, JSON.stringify(progress));
    } catch (error) {
      console.error('Error updating progress:', error);
      await AsyncStorage.setItem(`progress_${userId}`, JSON.stringify(progress));
    }
  }

  static async markLessonComplete(userId, lessonId) {
    const progress = await this.getUserProgress(userId);
    if (!progress.completedLessons.includes(lessonId)) {
      progress.completedLessons.push(lessonId);
      
      // Update streak
      const today = new Date().toDateString();
      const lastActive = new Date(progress.lastActive).toDateString();
      if (today !== lastActive) {
        progress.streak = (progress.streak || 0) + 1;
      }
      progress.lastActive = new Date().toISOString();
      
      await this.updateUserProgress(userId, progress);
    }
  }

  static async addStudyTime(userId, minutes) {
    const progress = await this.getUserProgress(userId);
    progress.totalStudyTime = (progress.totalStudyTime || 0) + minutes;
    await this.updateUserProgress(userId, progress);
  }
}