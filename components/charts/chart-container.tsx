import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface ChartContainerProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

export function ChartContainer({ title, description, children }: ChartContainerProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {description && <Text style={styles.description}>{description}</Text>}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 12,
    gap: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  description: {
    fontSize: 12,
    color: '#6B7280',
  },
});
