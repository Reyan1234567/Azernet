import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import Svg, { G, Line, Path, Circle, Text as SvgText } from 'react-native-svg';

interface DataPoint {
  label: string;
  value: number;
  color: string;
}

interface LineChartConfig {
  height?: number;
  showLabels?: boolean;
  animated?: boolean;
  duration?: number;
}

interface LineChartProps {
  data: DataPoint[];
  config?: LineChartConfig;
}

export function LineChart({ data, config = {} }: LineChartProps) {
  const {
    height = 220,
    showLabels = true,
    animated = true,
    duration = 1000,
  } = config;

  const animatedValues = useRef<Animated.Value[]>([]);
  const { width } = Dimensions.get('window');

  // Initialize animated values for path animation
  useEffect(() => {
    if (animated) {
      animatedValues.current = data.map((_, index) =>
        new Animated.Value(0)
      );

      // Start animations
      Animated.stagger(
        duration / data.length,
        animatedValues.current.map((value) =>
          Animated.timing(value, {
            toValue: 1,
            duration: duration,
            useNativeDriver: false,
          })
        )
      ).start();
    }
  }, [data, animated, duration]);

  const maxValue = Math.max(...data.map((item) => item.value));
  const minValue = Math.min(...data.map((item) => item.value));
  const chartWidth = width - 32;
  const chartHeight = height - 60;

  // Generate path data
  const points = data.map((item, index) => {
    const x = (chartWidth / (data.length - 1)) * index;
    const y = chartHeight - 40 - ((item.value - minValue) / (maxValue - minValue)) * (chartHeight - 40);
    return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ');

  return (
    <View style={[styles.container, { height }]}>
      <Svg width={chartWidth} height={chartHeight}>
        <G>
          {/* Grid lines (optional) */}
          <Line
            x1={0}
            y1={chartHeight - 40}
            x2={chartWidth}
            y2={chartHeight - 40}
            stroke="#E5E7EB"
            strokeWidth={1}
          />

          {/* Animated path */}
          {animated ? (
            <AnimatedPath
              d={points}
              stroke={data[0]?.color || '#3b82f6'}
              strokeWidth={2}
              fill="none"
            />
          ) : (
            <Path
              d={points}
              stroke={data[0]?.color || '#3b82f6'}
              strokeWidth={2}
              fill="none"
            />
          )}

          {/* Data points */}
          {data.map((item, index) => {
            const x = (chartWidth / (data.length - 1)) * index;
            const y = chartHeight - 40 - ((item.value - minValue) / (maxValue - minValue)) * (chartHeight - 40);

            return (
              <Circle
                key={index}
                cx={x}
                cy={y}
                r={4}
                fill={item.color}
              />
            );
          })}

          {/* Labels */}
          {showLabels && data.map((item, index) => {
            const x = (chartWidth / (data.length - 1)) * index;

            return (
              <SvgText
                key={index}
                x={x}
                y={chartHeight - 20}
                fontSize={10}
                fill="#6B7280"
                textAnchor="middle"
              >
                {item.label}
              </SvgText>
            );
          })}
        </G>
      </Svg>
    </View>
  );
}

// Animated Path component
const AnimatedPath = Animated.createAnimatedComponent(Path);

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
