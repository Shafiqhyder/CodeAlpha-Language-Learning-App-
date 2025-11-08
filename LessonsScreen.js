import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { LanguageService } from '../services/LanguageService';
import { Ionicons } from '@expo/vector-icons';

export default function LessonsScreen({ navigation, route }) {
  const { user } = useAuth();
  const [lessons, setLessons] = useState([]);
  const [progress, setProgress] = useState({});
  const language = route.params?.language || 'spanish';

  useEffect(() => {
    loadLessons();
    loadProgress();
  }, [language]);

  const loadLessons = async () => {
    const lessonData = await LanguageService.getLessons(language);
    setLessons(lessonData);
  };

  const loadProgress = async () => {
    if (user) {
      const userProgress = await LanguageService.getUserProgress(user.uid);
      setProgress(userProgress);
    }
  };

  const isLessonCompleted = (lessonId) => {
    return progress.completedLessons?.includes(lessonId);
  };

  const renderLessonItem = ({ item }) => (
    <TouchableOpacity
      style={styles.lessonCard}
      onPress={() => navigation.navigate('LessonDetail', { 
        lesson: item,
        language 
      })}
    >
      <View style={styles.lessonHeader}>
        <View style={styles.lessonInfo}>
          <Text style={styles.lessonTitle}>{item.title}</Text>
          <View style={styles.lessonMeta}>
            <Text style={styles.category}>{item.category}</Text>
            <Text style={styles.difficulty}>{item.difficulty}</Text>
          </View>
        </View>
        <View style={styles.lessonStatus}>
          {isLessonCompleted(item.id) ? (
            <Ionicons name="checkmark-circle" size={24} color="#4ECDC4" />
          ) : (
            <Ionicons name="play-circle" size={24} color="#4A90E2" />
          )}
        </View>
      </View>
      <View style={styles.progressBar}>
        <View 
          style={[
            styles.progressFill,
            { width: isLessonCompleted(item.id) ? '100%' : '0%' }
          ]} 
        />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Lessons</Text>
        <Text style={styles.subtitle}>Learn {language.charAt(0).toUpperCase() + language.slice(1)}</Text>
      </View>
      
      <FlatList
        data={lessons}
        renderItem={renderLessonItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: 'white',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  listContent: {
    padding: 10,
  },
  lessonCard: {
    backgroundColor: 'white',
    margin: 10,
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  lessonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lessonInfo: {
    flex: 1,
  },
  lessonTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  lessonMeta: {
    flexDirection: 'row',
  },
  category: {
    fontSize: 12,
    color: '#4A90E2',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginRight: 5,
  },
  difficulty: {
    fontSize: 12,
    color: '#FF6B6B',
    backgroundColor: '#FFE5E5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    marginTop: 10,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4A90E2',
    borderRadius: 2,
  },
});