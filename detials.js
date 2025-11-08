import React, { useState } from 'react';
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

export default function LessonDetailScreen({ route, navigation }) {
  const { user } = useAuth();
  const { lesson, language } = route.params;
  const [currentItemIndex, setCurrentItemIndex] = useState(0);

  const markAsComplete = async () => {
    if (user) {
      await LanguageService.markLessonComplete(user.uid, lesson.id);
      await LanguageService.addStudyTime(user.uid, 10); // 10 minutes per lesson
      Alert.alert('Success', 'Lesson completed!');
      navigation.goBack();
    }
  };

  const renderContentItem = ({ item, index }) => (
    <View style={[
      styles.contentItem,
      index === currentItemIndex && styles.activeContentItem
    ]}>
      <Text style={styles.originalText}>
        {item.word || item.phrase}
      </Text>
      <Text style={styles.translation}>
        {item.translation}
      </Text>
      <Text style={styles.pronunciation}>
        {item.pronunciation}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.lessonTitle}>{lesson.title}</Text>
        <View style={styles.lessonMeta}>
          <Text style={styles.category}>{lesson.category}</Text>
          <Text style={styles.difficulty}>{lesson.difficulty}</Text>
        </View>
      </View>

      <View style={styles.contentContainer}>
        <Text style={styles.sectionTitle}>Learning Content</Text>
        
        <FlatList
          data={lesson.content}
          renderItem={renderContentItem}
          keyExtractor={(item, index) => index.toString()}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(event) => {
            const index = Math.round(
              event.nativeEvent.contentOffset.x / event.nativeEvent.layoutMeasurement.width
            );
            setCurrentItemIndex(index);
          }}
        />

        <View style={styles.pagination}>
          {lesson.content.map((_, index) => (
            <View
              key={index}
              style={[
                styles.paginationDot,
                index === currentItemIndex && styles.paginationDotActive
              ]}
            />
          ))}
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity 
          style={styles.completeButton}
          onPress={markAsComplete}
        >
          <Ionicons name="checkmark-circle" size={20} color="white" />
          <Text style={styles.completeButtonText}>Mark as Complete</Text>
        </TouchableOpacity>
      </View>
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
  lessonTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  lessonMeta: {
    flexDirection: 'row',
  },
  category: {
    fontSize: 14,
    color: '#4A90E2',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  difficulty: {
    fontSize: 14,
    color: '#FF6B6B',
    backgroundColor: '#FFE5E5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  contentContainer: {
    flex: 1,
    backgroundColor: 'white',
    marginTop: 10,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  contentItem: {
    width: 300,
    marginRight: 15,
    padding: 20,
    backgroundColor: '#F8F9FA',
    borderRadius: 10,
    alignItems: 'center',
  },
  activeContentItem: {
    backgroundColor: '#E3F2FD',
    borderColor: '#4A90E2',
    borderWidth: 2,
  },
  originalText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  translation: {
    fontSize: 18,
    color: '#666',
    marginBottom: 10,
    textAlign: 'center',
  },
  pronunciation: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: '#4A90E2',
  },
  actions: {
    padding: 20,
    backgroundColor: 'white',
  },
  completeButton: {
    backgroundColor: '#4ECDC4',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 10,
  },
  completeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});