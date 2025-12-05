import React, { useMemo, useState } from 'react';
import { StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { View } from '@/components/ui/view';

import { useColor } from '@/hooks/useColor';

type Operator = '+' | '-' | '×' | '÷';

const keypadRows: string[][] = [
  ['C', '±', '%', '÷'],
  ['7', '8', '9', '×'],
  ['4', '5', '6', '-'],
  ['1', '2', '3', '+'],
  ['0', '.', '='],
];

const MAX_DISPLAY_LENGTH = 12;

const Calculator = () => {
  const backgroundColor = useColor('background');
  const surfaceColor = useColor('secondary', {
    light: '#F7F7FB',
    dark: '#121214',
  });
  const displayTextColor = useColor('foreground');
  const borderColor = useColor('border');
  const textMuted = useColor('textMuted');
  const insets = useSafeAreaInsets();

  const [displayValue, setDisplayValue] = useState('0');
  const [storedValue, setStoredValue] = useState<number | null>(null);
  const [pendingOperator, setPendingOperator] = useState<Operator | null>(null);
  const [overwrite, setOverwrite] = useState(false);

  const handleClear = () => {
    setDisplayValue('0');
    setStoredValue(null);
    setPendingOperator(null);
    setOverwrite(false);
  };

  const triggerErrorState = () => {
    setDisplayValue('Error');
    setStoredValue(null);
    setPendingOperator(null);
    setOverwrite(true);
  };

  const formatNumber = (value: number) => {
    if (!Number.isFinite(value)) {
      return 'Error';
    }

    const rounded = parseFloat(value.toFixed(8));
    const asString = rounded.toString();

    if (asString.length <= MAX_DISPLAY_LENGTH) {
      return asString;
    }

    return value.toExponential(6).replace(/\.0+e/, 'e');
  };

  const getSafeDisplayValue = (raw: string) => {
    if (raw === 'Error') {
      return 0;
    }
    return parseFloat(raw);
  };

  const performCalculation = (
    first: number,
    second: number,
    operator: Operator
  ) => {
    switch (operator) {
      case '+':
        return first + second;
      case '-':
        return first - second;
      case '×':
        return first * second;
      case '÷':
        if (second === 0) {
          return null;
        }
        return first / second;
      default:
        return null;
    }
  };

  const commitOperation = () => {
    if (
      storedValue === null ||
      pendingOperator === null ||
      overwrite ||
      displayValue === 'Error'
    ) {
      return;
    }

    const currentValue = getSafeDisplayValue(displayValue);
    const result = performCalculation(storedValue, currentValue, pendingOperator);

    if (result === null) {
      triggerErrorState();
      return;
    }

    setStoredValue(result);
    setDisplayValue(formatNumber(result));
  };

  const handleOperator = (operator: Operator) => {
    if (displayValue === 'Error') {
      setDisplayValue('0');
    }

    if (overwrite && storedValue !== null) {
      setPendingOperator(operator);
      return;
    }

    if (storedValue === null) {
      setStoredValue(getSafeDisplayValue(displayValue));
    } else {
      setOverwrite(false);
      commitOperation();
    }

    setPendingOperator(operator);
    setOverwrite(true);
  };

  const handleEquals = () => {
    if (
      storedValue === null ||
      pendingOperator === null ||
      overwrite ||
      displayValue === 'Error'
    ) {
      return;
    }

    const currentValue = getSafeDisplayValue(displayValue);
    const result = performCalculation(storedValue, currentValue, pendingOperator);

    if (result === null) {
      triggerErrorState();
      return;
    }

    setDisplayValue(formatNumber(result));
    setStoredValue(null);
    setPendingOperator(null);
    setOverwrite(true);
  };

  const handleDigit = (digit: string) => {
    setDisplayValue((current) => {
      if (current === 'Error' || overwrite) {
        setOverwrite(false);
        return digit;
      }

      if (current === '0') {
        return digit;
      }

      if (current.length >= MAX_DISPLAY_LENGTH) {
        return current;
      }

      return `${current}${digit}`;
    });
  };

  const handleDecimal = () => {
    setDisplayValue((current) => {
      if (current === 'Error' || overwrite) {
        setOverwrite(false);
        return '0.';
      }

      if (current.includes('.')) {
        return current;
      }

      return `${current}.`;
    });
  };

  const handleToggleSign = () => {
    setDisplayValue((current) => {
      if (current === 'Error') {
        return '0';
      }

      if (current.startsWith('-')) {
        return current.slice(1);
      }

      if (current === '0') {
        return current;
      }

      return `-${current}`;
    });
  };

  const handlePercent = () => {
    if (displayValue === 'Error') {
      setDisplayValue('0');
      setOverwrite(false);
      return;
    }

    const currentValue = getSafeDisplayValue(displayValue);
    const result = currentValue / 100;
    setDisplayValue(formatNumber(result));
    setOverwrite(true);
  };

  const handleKeyPress = (key: string) => {
    if (/^[0-9]$/.test(key)) {
      handleDigit(key);
      return;
    }

    switch (key) {
      case '.':
        handleDecimal();
        break;
      case 'C':
        handleClear();
        break;
      case '±':
        handleToggleSign();
        break;
      case '%':
        handlePercent();
        break;
      case '=':
        handleEquals();
        break;
      default:
        handleOperator(key as Operator);
    }
  };

  const helperText = useMemo(() => {
    if (storedValue === null || pendingOperator === null) {
      return '';
    }
    return `${formatNumber(storedValue)} ${pendingOperator}`;
  }, [pendingOperator, storedValue]);

  const getButtonVariant = (key: string) => {
    if (key === 'C') {
      return 'destructive' as const;
    }
    if (key === '=') {
      return 'success' as const;
    }
    if (key === '±' || key === '%') {
      return 'secondary' as const;
    }
    if (/^[÷×\-+]$/.test(key)) {
      return 'default' as const;
    }
    return 'outline' as const;
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor,
          paddingTop: insets.top + 24,
          paddingBottom: insets.bottom + 16,
        },
      ]}
    >
      <View
        style={[
          styles.content,
          { paddingBottom: Math.max(insets.bottom, 16) },
        ]}
      >
        <View
          style={[
            styles.displayContainer,
            { backgroundColor: surfaceColor, borderColor },
          ]}
        >
          <Text
            variant="caption"
            numberOfLines={1}
            ellipsizeMode="head"
            style={[styles.helperText, { color: textMuted }]}
          >
            {helperText}
          </Text>
          <Text
            variant="heading"
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.4}
            style={[styles.display, { color: displayTextColor }]}
          >
            {displayValue}
          </Text>
        </View>
        <View style={styles.pad}>
          {keypadRows.map((row, rowIndex) => (
            <View key={`row-${rowIndex}`} style={styles.row}>
              {row.map((key) => (
                <View
                  key={key}
                  style={[
                    styles.keyWrapper,
                    key === '0' && row.length === 3 ? styles.doubleKey : null,
                  ]}
                >
                  <Button
                    size="lg"
                    variant={getButtonVariant(key)}
                    onPress={() => handleKeyPress(key)}
                    style={styles.button}
                    textStyle={styles.buttonText}
                  >
                    {key}
                  </Button>
                </View>
              ))}
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

export default Calculator;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    gap: 32,
  },
  displayContainer: {
    minHeight: 140,
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingVertical: 20,
    paddingHorizontal: 24,
    borderRadius: 24,
    borderWidth: StyleSheet.hairlineWidth,
  },
  helperText: {
    width: '100%',
    textAlign: 'right',
    fontSize: 16,
    marginBottom: 8,
  },
  display: {
    width: '100%',
    textAlign: 'right',
    fontSize: 64,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  pad: {
    gap: 12,
  },
  row: {
    flexDirection: 'row',
  },
  keyWrapper: {
    flex: 1,
    paddingHorizontal: 2,
    paddingVertical: 2
  },
  doubleKey: {
    flex: 2,
  },
  button: {
    width: '100%',
    height:80
  },
  buttonText: {
    fontSize: 20,
    fontWeight: '600',
  },
});