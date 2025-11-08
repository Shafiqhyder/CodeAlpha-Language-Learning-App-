import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { LanguageService } from '../services/LanguageService';
import { Ionicons } from '@expo/vector-icons';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const [progress, setProgress] = useState(null);

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    if (user) {
      const userProgress = await LanguageService.getUserProgress(user.uid);
      setProgress(userProgress);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: async () => {
            await logout();
          }
        }
      ]
    );
  };

  const getLevel = () => {
    const completedLessons = progress?.completedLessons?.length || 0;
    if (completedLessons >= 20) return 'Advanced';
    if (completedLessons >= 10) return 'Intermediate';
    return 'Beginner';
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={40} color="#4A90E2" />
        </View>
        <Text style={styles.userName}>{user?.email?.split('@')[0]}</Text>
        <Text style={styles.userEmail}>{user?.email}</Text>
        <View style={styles.levelBadge}>
          <Text style={styles.levelText}>{getLevel()} Learner</Text>
        </View>
      </View>

      {/* Stats */}
      <View style={styles.statsSection}>
        <Text style={styles.sectionTitle}>Your Progress</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{progress?.streak || 0}</Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{progress?.completedLessons?.length || 0}</Text>
            <Text style={styles.statLabel}>Lessons</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{Math.round((progress?.totalStudyTime || 0) / 60)}</Text>
            <Text style={styles.statLabel}>Hours</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {progress?.quizScores?.length || 0}
            </Text>
            <Text style={styles.statLabel}>Quizzes</Text>
          </View>
        </View>
      </View>

      {/* Quiz History */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Quiz Results</Text>
        {progress?.quizScores?.slice(-3).map((quiz, index) => (
          <View key={index} style={styles.quizItem}>
            <View style={styles.quizInfo}>
              <Text style={styles.quizDate}>
                {new Date(quiz.date).toLocaleDateString()}
              </Text>
              <Text style={styles.quizLanguage}>{quiz.language}</Text>
            </View>
            <Text style={styles.quizScore}>
              {quiz.score}/{quiz.total}
            </Text>
          </View>
        ))}
        {(!progress?.quizScores || progress.quizScores.length === 0) && (
          <Text style={styles.noDataText}>No quiz results yet</Text>
        )}
      </View>

      {/* Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Settings</Text>
        <TouchableOpacity style={styles.settingItem}>
          <Ionicons name="notifications-outline" size={20} color="#666" />
          <Text style={styles.settingText}>Notifications</Text>
          <Ionicons name="chevron-forward" size={20} color="#666" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.settingItem}>
          <Ionicons name="language-outline" size={20} color="#666" />
          <Text style={styles.settingText}>Language Settings</Text>
          <Ionicons name="chevron-forward" size={20} color="#666" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.settingItem}>
          <Ionicons name="help-circle-outline" size={20} color="#666" />
          <Text style={styles.settingText}>Help & Support</Text>
          <Ionicons name="chevron-forward" size={20} color="#666" />
        </TouchableOpacity>
      </View>

      {/* Logout */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={20} color="#FF6B6B" />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: 'white',
    alignItems: 'center',
    padding: 30,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 16,
    color: '#666',
    marginBottom: 15,
  },
  levelBadge: {
    backgroundColor: '#4A90E2',
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 15,
  },
  levelText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  statsSection: {
    backgroundColor: 'white',
    marginTop: 10,
    padding: 20,
  },
  section: {
    backgroundColor: 'white',
    marginTop: 10,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4A90E2',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  quizItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  quizInfo: {
    flex: 1,
  },
  quizDate: {
    fontSize: 14,
    fontWeight: '500',
  },
  quizLanguage: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  quizScore: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4A90E2',
  },
  noDataText: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
    marginVertical: 20,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  settingText: {
    flex: 1,
    fontSize: 16,
    marginLeft: 15,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    margin: 20,
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FF6B6B',
  },
  logoutText: {
    color: '#FF6B6B',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
});