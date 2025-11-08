import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function ProgressChart({ progress }) {
  const totalLessons = 20; // Example total
  const completedLessons = progress?.completedLessons?.length || 0;
  const percentage = (completedLessons / totalLessons) * 100;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Overall Progress</Text>
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill,
              { width: `${percentage}%` }
            ]} 
          />
        </View>
        <Text style={styles.percentage}>{Math.round(percentage)}%</Text>
      </View>
      <Text style={styles.progressText}>
        {completedLessons} of {totalLessons} lessons completed
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    margin: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
    marginRight: 10,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4A90E2',
    borderRadius: 4,
  },
  percentage: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4A90E2',
  },
  progressText: {
    marginTop: 5,
    fontSize: 12,
    color: '#666',
  },
});