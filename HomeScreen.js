import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  Alert 
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { LanguageService } from '../services/LanguageService';
import { Ionicons } from '@expo/vector-icons';

export default function HomeScreen({ navigation }) {
  const { user } = useAuth();
  const [progress, setProgress] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState('spanish');

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    if (user) {
      const userProgress = await LanguageService.getUserProgress(user.uid);
      setProgress(userProgress);
    }
  };

  const languages = [
    { id: 'spanish', name: 'Spanish', flag: '🇪🇸' },
    { id: 'french', name: 'French', flag: '🇫🇷' },
    { id: 'german', name: 'German', flag: '🇩🇪' },
    { id: 'japanese', name: 'Japanese', flag: '🇯🇵' }
  ];

  const quickActions = [
    {
      title: 'Daily Lesson',
      icon: 'book',
      screen: 'Lessons',
      color: '#4A90E2'
    },
    {
      title: 'Practice Flashcards',
      icon: 'flash',
      screen: 'Flashcards',
      color: '#FF6B6B'
    },
    {
      title: 'Take Quiz',
      icon: 'help-circle',
      screen: 'Quiz',
      color: '#4ECDC4'
    }
  ];

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.greeting}>Hello, {user?.email?.split('@')[0]}! 👋</Text>
        <Text style={styles.subtitle}>Ready to learn today?</Text>
      </View>

      {/* Streak and Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Ionicons name="flame" size={24} color="#FF6B6B" />
          <Text style={styles.statNumber}>{progress?.streak || 0}</Text>
          <Text style={styles.statLabel}>Day Streak</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="checkmark-circle" size={24} color="#4ECDC4" />
          <Text style={styles.statNumber}>{progress?.completedLessons?.length || 0}</Text>
          <Text style={styles.statLabel}>Lessons</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="time" size={24} color="#4A90E2" />
          <Text style={styles.statNumber}>{Math.round((progress?.totalStudyTime || 0) / 60)}</Text>
          <Text style={styles.statLabel}>Hours</Text>
        </View>
      </View>

      {/* Language Selection */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Select Language</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {languages.map((language) => (
            <TouchableOpacity
              key={language.id}
              style={[
                styles.languageCard,
                selectedLanguage === language.id && styles.selectedLanguage
              ]}
              onPress={() => setSelectedLanguage(language.id)}
            >
              <Text style={styles.flag}>{language.flag}</Text>
              <Text style={styles.languageName}>{language.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          {quickActions.map((action, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.actionCard, { backgroundColor: action.color }]}
              onPress={() => navigation.navigate(action.screen, { language: selectedLanguage })}
            >
              <Ionicons name={action.icon} size={32} color="white" />
              <Text style={styles.actionTitle}>{action.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Daily Goal */}
      <View style={styles.dailyGoalCard}>
        <Text style={styles.goalTitle}>Daily Goal</Text>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { width: `${Math.min(((progress?.completedLessons?.length || 0) / 5) * 100, 100)}%` }
            ]} 
          />
        </View>
        <Text style={styles.goalText}>
          {progress?.completedLessons?.length || 0} of 5 lessons completed today
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    padding: 20,
    backgroundColor: 'white',
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: 'white',
    marginTop: 10,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
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
  languageCard: {
    alignItems: 'center',
    padding: 15,
    marginRight: 10,
    borderRadius: 10,
    backgroundColor: '#F8F9FA',
    minWidth: 80,
  },
  selectedLanguage: {
    backgroundColor: '#4A90E2',
  },
  flag: {
    fontSize: 24,
    marginBottom: 5,
  },
  languageName: {
    fontSize: 12,
    fontWeight: '500',
  },
  selectedLanguageText: {
    color: 'white',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    width: '48%',
    alignItems: 'center',
    padding: 20,
    borderRadius: 15,
    marginBottom: 10,
  },
  actionTitle: {
    color: 'white',
    fontWeight: 'bold',
    marginTop: 10,
    textAlign: 'center',
  },
  dailyGoalCard: {
    backgroundColor: 'white',
    margin: 20,
    padding: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4A90E2',
  },
  goalText: {
    marginTop: 10,
    fontSize: 14,
    color: '#666',
  },
});