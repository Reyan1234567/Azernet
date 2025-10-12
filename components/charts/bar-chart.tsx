import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import Svg, { G, Rect, Text as SvgText } from 'react-native-svg';

interface DataPoint {
  label: string;
  value: number;
  color: string;
}

interface BarChartConfig {
  height?: number;
  showLabels?: boolean;
  animated?: boolean;
  duration?: number;
}

interface BarChartProps {
  data: DataPoint[];
  config?: BarChartConfig;
}

export function BarChart({ data, config = {} }: BarChartProps) {
  const {
    height = 220,
    showLabels = true,
    animated = true,
    duration = 1000,
  } = config;

  const animatedValues = useRef<Animated.Value[]>([]);
  const { width } = Dimensions.get('window');

  // Initialize animated values
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
  const chartWidth = width - 32; // Account for padding
  const chartHeight = height - 60; // Account for labels
  const barWidth = (chartWidth - (data.length - 1) * 8) / data.length; // 8px gap between bars

  return (
    <View style={[styles.container, { height }]}>
      <Svg width={chartWidth} height={chartHeight}>
        <G>
          {/* Bars */}
          {data.map((item, index) => {
            const barHeight = (item.value / maxValue) * (chartHeight - 40);
            const x = index * (barWidth + 8);
            const y = chartHeight - 40 - barHeight;

            const animatedHeight = animated
              ? animatedValues.current[index]?.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, barHeight],
                })
              : barHeight;

            return (
              <G key={index}>
                {animated ? (
                  <Animated.View style={{ position: 'absolute', left: x, top: y }}>
                    <Animated.View
                      style={[
                        styles.bar,
                        {
                          width: barWidth,
                          height: animatedHeight,
                          backgroundColor: item.color,
                        },
                      ]}
                    />
                  </Animated.View>
                ) : (
                  <Rect
                    x={x}
                    y={y}
                    width={barWidth}
                    height={barHeight}
                    fill={item.color}
                    rx={4}
                  />
                )}

                {/* Labels */}
                {showLabels && (
                  <SvgText
                    x={x + barWidth / 2}
                    y={chartHeight - 20}
                    fontSize={10}
                    fill="#6B7280"
                    textAnchor="middle"
                  >
                    {item.label}
                  </SvgText>
                )}
              </G>
            );
          })}
        </G>
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  bar: {
    borderRadius: 4,
  },
});
