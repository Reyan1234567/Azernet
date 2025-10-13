import { Text } from '@/components/ui/text';
import { View } from '@/components/ui/view';
import { useColor } from '@/hooks/useColor';
import { BORDER_RADIUS, CORNERS, FONT_SIZE, HEIGHT } from '@/theme/globals';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  LayoutChangeEvent,
  ScrollView,
  TextStyle,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Extrapolate,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

// Types
interface TabsContextType {
  activeTab: string;
  setActiveTab: (value: string) => void;
  orientation: 'horizontal' | 'vertical';
  tabValues: string[];
  registerTab: (value: string) => void;
  unregisterTab: (value: string) => void;
  tabContents: { [key: string]: React.ReactNode };
  registerTabContent: (value: string, content: React.ReactNode) => void;
  unregisterTabContent: (value: string) => void;
  enableSwipe?: boolean;
  navigateToAdjacentTab?: (direction: 'next' | 'prev') => void;
}

interface TabsProps {
  children: React.ReactNode;
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  orientation?: 'horizontal' | 'vertical';
  style?: ViewStyle;
  enableSwipe?: boolean;
}

interface TabsListProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

interface TabsTriggerProps {
  children: React.ReactNode;
  value: string;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

interface TabsContentProps {
  children: React.ReactNode;
  value: string;
  style?: ViewStyle;
}

// Context
const TabsContext = createContext<TabsContextType | undefined>(undefined);

const useTabsContext = () => {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error('Tabs components must be used within a Tabs provider');
  }
  return context;
};

export function Tabs({
  children,
  defaultValue = '',
  value,
  onValueChange,
  orientation = 'horizontal',
  style,
  enableSwipe = true,
}: TabsProps) {
  const [internalActiveTab, setInternalActiveTab] = useState(defaultValue);
  const [tabValues, setTabValues] = useState<string[]>([]);
  const [tabContents, setTabContents] = useState<{ [key: string]: React.ReactNode }>({});

  // Determine if we're in controlled or uncontrolled mode
  const isControlled = value !== undefined;
  const activeTab = isControlled ? value : internalActiveTab;

  // Update internal state when value prop changes (controlled mode)
  useEffect(() => {
    if (isControlled && value !== internalActiveTab) {
      setInternalActiveTab(value);
    }
  }, [value, isControlled, internalActiveTab]);

  const setActiveTab = (newValue: string) => {
    if (!isControlled) {
      setInternalActiveTab(newValue);
    }

    if (onValueChange) {
      onValueChange(newValue);
    }
  };

  const registerTab = useCallback((tabValue: string) => {
    setTabValues((prev) => {
      if (!prev.includes(tabValue)) {
        return [...prev, tabValue];
      }
      return prev;
    });
  }, []);

  const unregisterTab = useCallback((tabValue: string) => {
    setTabValues((prev) => prev.filter((val) => val !== tabValue));
  }, []);

  const registerTabContent = useCallback((value: string, content: React.ReactNode) => {
    setTabContents(prev => ({ ...prev, [value]: content }));
  }, []);

  const unregisterTabContent = useCallback((value: string) => {
    setTabContents(prev => {
      const newContents = { ...prev };
      delete newContents[value];
      return newContents;
    });
  }, []);

  const navigateToAdjacentTab = useCallback(
    (direction: 'next' | 'prev') => {
      const currentIndex = tabValues.indexOf(activeTab);
      if (currentIndex === -1) return;

      let nextIndex;
      if (direction === 'next') {
        nextIndex = currentIndex + 1;
        if (nextIndex >= tabValues.length) nextIndex = 0;
      } else {
        nextIndex = currentIndex - 1;
        if (nextIndex < 0) nextIndex = tabValues.length - 1;
      }

      const nextTab = tabValues[nextIndex];
      if (nextTab) {
        setActiveTab(nextTab);
      }
    },
    [tabValues, activeTab, setActiveTab]
  );

  return (
    <TabsContext.Provider
      value={{
        activeTab,
        setActiveTab,
        orientation,
        tabValues,
        registerTab,
        unregisterTab,
        tabContents,
        registerTabContent,
        unregisterTabContent,
        enableSwipe,
        navigateToAdjacentTab,
      }}
    >
      <View
        style={[
          {
            flex: 1,
            width: '100%',
            flexDirection: orientation === 'horizontal' ? 'column' : 'row',
          },
          style,
        ]}
      >
        {children}
      </View>
    </TabsContext.Provider>
  );
}

// Carousel Tab Content Component
interface CarouselTabContentProps {
  children: React.ReactNode;
  value: string;
  style?: ViewStyle;
}

function CarouselTabContent({
  children,
  value,
  style,
}: CarouselTabContentProps) {
  const { 
    activeTab, 
    navigateToAdjacentTab, 
    tabValues,
    registerTabContent,
    unregisterTabContent
  } = useTabsContext();

  // Register content when component mounts
  useEffect(() => {
    registerTabContent(value, children);
    return () => unregisterTabContent(value);
  }, [value, children, registerTabContent, unregisterTabContent]);

  // Only render the carousel container for the active tab
  if (activeTab !== value) {
    return null;
  }

  return (
    <CarouselContainer
      activeTab={activeTab}
      tabValues={tabValues}
      onSwipe={navigateToAdjacentTab!}
      style={style}
    />
  );
}

// Carousel Container Component
function CarouselContainer({
  activeTab,
  tabValues,
  onSwipe,
  style,
}: {
  activeTab: string;
  tabValues: string[];
  onSwipe: (direction: 'next' | 'prev') => void;
  style?: ViewStyle;
}) {
  const { tabContents } = useTabsContext();
  const translateX = useSharedValue(0);
  const isGestureActive = useSharedValue(false);
  const [containerWidth, setContainerWidth] = useState(0);
  const currentIndex = tabValues.indexOf(activeTab);

  const onLayout = (event: LayoutChangeEvent) => {
    const width = event.nativeEvent.layout.width;
    setContainerWidth(width);
  };

  // Reset translation when active tab changes
  useEffect(() => {
    if (!isGestureActive.value && containerWidth > 0) {
      translateX.value = withTiming(0, { duration: 300 });
    }
  }, [activeTab, containerWidth]);

  const panGesture = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .failOffsetY([-10, 10])
    .onBegin(() => {
      isGestureActive.value = true;
    })
    .onUpdate((event) => {
      if (containerWidth > 0) {
        translateX.value = event.translationX;
      }
    })
    .onEnd((event) => {
      isGestureActive.value = false;

      if (containerWidth === 0) {
        translateX.value = withTiming(0, { duration: 300 });
        return;
      }

      const threshold = containerWidth * 0.15;
      const velocity = Math.abs(event.velocityX);
      const translation = event.translationX;

      const shouldChangeTab =
        Math.abs(translation) > threshold || velocity > 500;

      if (shouldChangeTab) {
        if (translation > 0 && currentIndex > 0) {
          runOnJS(onSwipe)('prev');
        } else if (translation < 0 && currentIndex < tabValues.length - 1) {
          runOnJS(onSwipe)('next');
        } else {
          translateX.value = withTiming(0, { duration: 300 });
        }
      } else {
        translateX.value = withTiming(0, { duration: 300 });
      }
    });

  const getPreviousTab = () => {
    const prevIndex = currentIndex - 1;
    return prevIndex >= 0 ? tabValues[prevIndex] : null;
  };

  const getNextTab = () => {
    const nextIndex = currentIndex + 1;
    return nextIndex < tabValues.length ? tabValues[nextIndex] : null;
  };

  const previousTab = getPreviousTab();
  const nextTab = getNextTab();

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const previousStyle = useAnimatedStyle(() => {
    if (containerWidth === 0) return { opacity: 0 };

    const opacity = interpolate(
      translateX.value,
      [0, containerWidth * 0.5],
      [0, 1],
      Extrapolate.CLAMP
    );

    return {
      transform: [{ translateX: translateX.value - containerWidth }],
      opacity: previousTab ? opacity : 0,
    };
  });

  const nextStyle = useAnimatedStyle(() => {
    if (containerWidth === 0) return { opacity: 0 };

    const opacity = interpolate(
      translateX.value,
      [-containerWidth * 0.5, 0],
      [1, 0],
      Extrapolate.CLAMP
    );

    return {
      transform: [{ translateX: translateX.value + containerWidth }],
      opacity: nextTab ? opacity : 0,
    };
  });

  return (
    <GestureDetector gesture={panGesture}>
      <View 
        style={{ flex: 1, width: '100%' }} 
        onLayout={onLayout}
      >
        {containerWidth > 0 && (
          <>
            {/* Previous content */}
            {previousTab && (
              <Animated.View
                style={[
                  {
                    position: 'absolute',
                    width: containerWidth,
                    height: '100%',
                    left: 0,
                    top: 0,
                  },
                  style,
                  previousStyle,
                ]}
                pointerEvents="none"
              >
                {tabContents[previousTab]}
              </Animated.View>
            )}

            {/* Current content */}
            <Animated.View
              style={[
                {
                  flex: 1,
                  width: containerWidth,
                },
                style,
                containerStyle,
              ]}
            >
              {tabContents[activeTab]}
            </Animated.View>

            {/* Next content */}
            {nextTab && (
              <Animated.View
                style={[
                  {
                    position: 'absolute',
                    width: containerWidth,
                    height: '100%',
                    left: 0,
                    top: 0,
                  },
                  style,
                  nextStyle,
                ]}
                pointerEvents="none"
              >
                {tabContents[nextTab]}
              </Animated.View>
            )}
          </>
        )}
      </View>
    </GestureDetector>
  );
}

export function TabsList({ children, style }: TabsListProps) {
  const { orientation } = useTabsContext();
  const backgroundColor = useColor('muted');

  return (
    <View
      style={[
        {
          padding: 6,
          backgroundColor,
          borderRadius: orientation === 'horizontal' ? CORNERS : BORDER_RADIUS,
        },
        style,
      ]}
    >
      <ScrollView
        horizontal={orientation === 'horizontal'}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          flexDirection: orientation === 'horizontal' ? 'row' : 'column',
          alignItems: 'center',
        }}
      >
        {children}
      </ScrollView>
    </View>
  );
}

export function TabsTrigger({
  children,
  value,
  disabled = false,
  style,
  textStyle,
}: TabsTriggerProps) {
  const { activeTab, setActiveTab, orientation, registerTab, unregisterTab } =
    useTabsContext();
  const isActive = activeTab === value;

  // Register/unregister tab for swipe navigation
  useEffect(() => {
    registerTab(value);
    return () => unregisterTab(value);
  }, [value, registerTab, unregisterTab]);

  const primaryColor = useColor('primary');
  const mutedForegroundColor = useColor('mutedForeground');
  const backgroundColor = useColor('background');

  const handlePress = () => {
    if (!disabled) {
      setActiveTab(value);
    }
  };

  const triggerStyle: ViewStyle = {
    paddingHorizontal: 12,
    paddingVertical: orientation === 'vertical' ? 8 : undefined,
    borderRadius: CORNERS,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: HEIGHT - 8,
    backgroundColor: isActive ? backgroundColor : 'transparent',
    opacity: disabled ? 0.5 : 1,
    flex: orientation === 'horizontal' ? 1 : undefined,
    marginBottom: orientation === 'vertical' ? 4 : 0,
    ...style,
  };

  const triggerTextStyle: TextStyle = {
    fontSize: FONT_SIZE,
    fontWeight: '500',
    color: isActive ? primaryColor : mutedForegroundColor,
    textAlign: 'center',
    ...textStyle,
  };

  return (
    <TouchableOpacity
      style={triggerStyle}
      onPress={handlePress}
      disabled={disabled}
      activeOpacity={0.8}
      accessibilityRole="tab"
      accessibilityState={{ selected: isActive }}
    >
      {typeof children === 'string' ? (
        <Text style={triggerTextStyle}>{children}</Text>
      ) : (
        children
      )}
    </TouchableOpacity>
  );
}

export function TabsContent({ children, value, style }: TabsContentProps) {
  const {
    activeTab,
    enableSwipe,
    orientation,
    navigateToAdjacentTab,
    tabValues,
  } = useTabsContext();
  const isActive = activeTab === value;

  // For carousel mode with swipe enabled
  if (enableSwipe && orientation === 'horizontal' && navigateToAdjacentTab) {
    return (
      <CarouselTabContent value={value} style={[{ flex: 1, width: '100%' }, style]}>
        {children}
      </CarouselTabContent>
    );
  }

  // Regular mode - only render active content
  if (!isActive) {
    return null;
  }

  return (
    <View
      style={[
        {
          flex: 1,
          width: '100%',
          alignSelf: 'stretch',
        },
        style,
      ]}
    >
      <View style={{ flex: 1, width: '100%' }}>
        {children}
      </View>
    </View>
  );
}