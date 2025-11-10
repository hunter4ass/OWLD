import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { User } from '../types';

export interface UserData {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class UserService {
  static async createUser(userData: Omit<UserData, 'createdAt' | 'updatedAt'>): Promise<void> {
    const now = new Date();
    const userDoc = {
      ...userData,
      createdAt: now,
      updatedAt: now,
    };
    
    await setDoc(doc(db, 'users', userData.id), userDoc);
  }

  static async getUser(userId: string): Promise<UserData | null> {
    try {
      if (typeof navigator !== 'undefined' && navigator && 'onLine' in navigator && !navigator.onLine) {
        // оффлайн: не дергаем Firestore, возвращаем null тихо
        return null;
      }
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        const data = userDoc.data();
        return {
          ...data,
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate(),
        } as UserData;
      }
      return null;
    } catch (error) {
      console.error('Error fetching user:', error);
      return null;
    }
  }

  static async updateUser(userId: string, updates: Partial<Omit<UserData, 'id' | 'createdAt'>>): Promise<void> {
    const updateData = {
      ...updates,
      updatedAt: new Date(),
    };
    
    await updateDoc(doc(db, 'users', userId), updateData);
  }

  static async getUserByEmail(email: string): Promise<UserData | null> {
    // В реальном приложении здесь был бы запрос по email
    // Для простоты пока возвращаем null
    return null;
  }
} 