import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Alert
} from 'react-native';
import { Audio } from 'expo-av';
import { LanguageService } from '../services/LanguageService';
import { Ionicons } from '@expo/vector-icons';

export default function FlashcardsScreen({ route }) {
  const [flashcards, setFlashcards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const flipAnim = useState(new Animated.Value(0))[0];
  const language = route.params?.language || 'spanish';

  useEffect(() => {
    loadFlashcards();
  }, [language]);

  const loadFlashcards = async () => {
    const lessons = await LanguageService.getLessons(language);
    const allFlashcards = lessons.flatMap(lesson => 
      lesson.content.map(item => ({
        ...item,
        category: lesson.category
      }))
    );
    setFlashcards(allFlashcards);
  };

  const flipCard = () => {
    Animated.spring(flipAnim, {
      toValue: isFlipped ? 0 : 180,
      friction: 8,
      tension: 10,
      useNativeDriver: true,
    }).start();
    setIsFlipped(!isFlipped);
  };

  const playSound = async (text) => {
    Alert.alert('Pronunciation', text);
  };

  const nextCard = () => {
    flipAnim.setValue(0);
    setIsFlipped(false);
    setCurrentIndex((currentIndex + 1) % flashcards.length);
  };

  const prevCard = () => {
    flipAnim.setValue(0);
    setIsFlipped(false);
    setCurrentIndex((currentIndex - 1 + flashcards.length) % flashcards.length);
  };

  const frontInterpolate = flipAnim.interpolate({
    inputRange: [0, 180],
    outputRange: ['0deg', '180deg'],
  });

  const backInterpolate = flipAnim.interpolate({
    inputRange: [0, 180],
    outputRange: ['180deg', '360deg'],
  });

  const frontAnimatedStyle = {
    transform: [{ rotateY: frontInterpolate }]
  };

  const backAnimatedStyle = {
    transform: [{ rotateY: backInterpolate }]
  };

  if (flashcards.length === 0) {
    return (
      <View style={styles.container}>
        <Text>Loading flashcards...</Text>
      </View>
    );
  }

  const currentCard = flashcards[currentIndex];

  return (
    <View style={styles.container}>
      <View style={styles.progress}>
        <Text style={styles.progressText}>
          {currentIndex + 1} / {flashcards.length}
        </Text>
      </View>

      <View style={styles.cardContainer}>
        <TouchableOpacity onPress={flipCard} activeOpacity={0.9}>
          <Animated.View style={[styles.card, styles.cardFront, frontAnimatedStyle]}>
            <Text style={styles.category}>{currentCard.category}</Text>
            <Text style={styles.frontText}>
              {currentCard.word || currentCard.phrase}
            </Text>
            <TouchableOpacity 
              style={styles.soundButton}
              onPress={() => playSound(currentCard.word || currentCard.phrase)}
            >
              <Ionicons name="volume-high" size={24} color="#4A90E2" />
            </TouchableOpacity>
            <Text style={styles.hint}>Tap to flip</Text>
          </Animated.View>

          <Animated.View style={[styles.card, styles.cardBack, backAnimatedStyle]}>
            <Text style={styles.category}>{currentCard.category}</Text>
            <Text style={styles.translation}>{currentCard.translation}</Text>
            <Text style={styles.pronunciation}>{currentCard.pronunciation}</Text>
            <TouchableOpacity 
              style={styles.soundButton}
              onPress={() => playSound(currentCard.translation)}
            >
              <Ionicons name="volume-high" size={24} color="#4A90E2" />
            </TouchableOpacity>
            <Text style={styles.hint}>Tap to flip back</Text>
          </Animated.View>
        </TouchableOpacity>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity style={styles.controlButton} onPress={prevCard}>
          <Ionicons name="chevron-back" size={24} color="white" />
          <Text style={styles.controlText}>Previous</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.controlButton} onPress={nextCard}>
          <Text style={styles.controlText}>Next</Text>
          <Ionicons name="chevron-forward" size={24} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    padding: 20,
  },
  progress: {
    alignItems: 'center',
    marginBottom: 20,
  },
  progressText: {
    fontSize: 16,
    color: '#666',
  },
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: 300,
    height: 400,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backfaceVisibility: 'hidden',
    position: 'absolute',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
  },
  cardFront: {
    backgroundColor: '#4A90E2',
  },
  cardBack: {
    backgroundColor: '#4ECDC4',
  },
  category: {
    position: 'absolute',
    top: 20,
    fontSize: 12,
    color: 'white',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  frontText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  translation: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 10,
  },
  pronunciation: {
    fontSize: 16,
    color: 'white',
    fontStyle: 'italic',
    marginBottom: 20,
  },
  soundButton: {
    padding: 10,
  },
  hint: {
    position: 'absolute',
    bottom: 20,
    fontSize: 12,
    color: 'white',
    opacity: 0.7,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  controlButton: {
    backgroundColor: '#4A90E2',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
  },
  controlText: {
    color: 'white',
    fontWeight: 'bold',
    marginHorizontal: 5,
  },
});