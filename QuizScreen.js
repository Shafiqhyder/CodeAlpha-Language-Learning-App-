import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { LanguageService } from '../services/LanguageService';

export default function QuizScreen({ route }) {
  const { user } = useAuth();
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const language = route.params?.language || 'spanish';

  useEffect(() => {
    generateQuiz();
  }, [language]);

  const generateQuiz = async () => {
    const lessons = await LanguageService.getLessons(language);
    const allItems = lessons.flatMap(lesson => lesson.content);
    
    // Generate multiple choice questions
    const questions = allItems.slice(0, 10).map((item, index) => {
      const correctAnswer = item.translation;
      const otherAnswers = allItems
        .filter((_, i) => i !== index)
        .slice(0, 3)
        .map(item => item.translation);
      
      const answers = [correctAnswer, ...otherAnswers]
        .sort(() => Math.random() - 0.5);

      return {
        id: index,
        question: item.word || item.phrase,
        correctAnswer,
        answers,
        type: item.word ? 'vocabulary' : 'phrase'
      };
    });

    setQuizQuestions(questions);
  };

  const handleAnswerSelect = (answer) => {
    setSelectedAnswer(answer);
    
    if (answer === quizQuestions[currentQuestionIndex].correctAnswer) {
      setScore(score + 1);
    }

    // Move to next question after delay
    setTimeout(() => {
      if (currentQuestionIndex < quizQuestions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setSelectedAnswer(null);
      } else {
        completeQuiz();
      }
    }, 1000);
  };

  const completeQuiz = async () => {
    setQuizCompleted(true);
    if (user) {
      const progress = await LanguageService.getUserProgress(user.uid);
      progress.quizScores = progress.quizScores || [];
      progress.quizScores.push({
        score,
        total: quizQuestions.length,
        date: new Date().toISOString(),
        language
      });
      await LanguageService.updateUserProgress(user.uid, progress);
    }
  };

  const restartQuiz = () => {
    setCurrentQuestionIndex(0);
    setScore(0);
    setSelectedAnswer(null);
    setQuizCompleted(false);
    generateQuiz();
  };

  if (quizQuestions.length === 0) {
    return (
      <View style={styles.container}>
        <Text>Loading quiz...</Text>
      </View>
    );
  }

  if (quizCompleted) {
    const percentage = (score / quizQuestions.length) * 100;
    return (
      <View style={styles.container}>
        <View style={styles.resultCard}>
          <Text style={styles.resultTitle}>Quiz Complete!</Text>
          <Text style={styles.resultScore}>
            {score} / {quizQuestions.length}
          </Text>
          <Text style={styles.resultPercentage}>
            {percentage.toFixed(1)}%
          </Text>
          <Text style={styles.resultMessage}>
            {percentage >= 80 ? 'Excellent! 🎉' : 
             percentage >= 60 ? 'Good job! 👍' : 
             'Keep practicing! 💪'}
          </Text>
          <TouchableOpacity style={styles.restartButton} onPress={restartQuiz}>
            <Text style={styles.restartButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const currentQuestion = quizQuestions[currentQuestionIndex];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.progress}>
          Question {currentQuestionIndex + 1} of {quizQuestions.length}
        </Text>
        <Text style={styles.score}>Score: {score}</Text>
      </View>

      <View style={styles.questionCard}>
        <Text style={styles.questionType}>
          {currentQuestion.type === 'vocabulary' ? 'Vocabulary' : 'Phrase'}
        </Text>
        <Text style={styles.question}>
          What is the translation of "{currentQuestion.question}"?
        </Text>
      </View>

      <View style={styles.answersContainer}>
        {currentQuestion.answers.map((answer, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.answerButton,
              selectedAnswer === answer && 
                answer === currentQuestion.correctAnswer && styles.correctAnswer,
              selectedAnswer === answer && 
                answer !== currentQuestion.correctAnswer && styles.wrongAnswer,
              selectedAnswer && styles.answerDisabled
            ]}
            onPress={() => handleAnswerSelect(answer)}
            disabled={selectedAnswer !== null}
          >
            <Text style={styles.answerText}>{answer}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.progressBar}>
        <View 
          style={[
            styles.progressFill,
            { width: `${((currentQuestionIndex + 1) / quizQuestions.length) * 100}%` }
          ]} 
        />
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  progress: {
    fontSize: 16,
    color: '#666',
  },
  score: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4A90E2',
  },
  questionCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  questionType: {
    fontSize: 12,
    color: '#4A90E2',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  question: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  answersContainer: {
    marginBottom: 20,
  },
  answerButton: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  correctAnswer: {
    backgroundColor: '#4ECDC4',
  },
  wrongAnswer: {
    backgroundColor: '#FF6B6B',
  },
  answerDisabled: {
    opacity: 0.7,
  },
  answerText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4A90E2',
  },
  resultCard: {
    backgroundColor: 'white',
    padding: 30,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  resultTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  resultScore: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#4A90E2',
    marginBottom: 10,
  },
  resultPercentage: {
    fontSize: 24,
    color: '#666',
    marginBottom: 20,
  },
  resultMessage: {
    fontSize: 18,
    marginBottom: 30,
    textAlign: 'center',
  },
  restartButton: {
    backgroundColor: '#4A90E2',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
  },
  restartButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});