import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Colors, Radius, FontSize, Spacing } from '../../constants/theme';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: Variant;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  style,
  textStyle,
}: ButtonProps) {
  return (
    <TouchableOpacity
      style={[styles.base, styles[variant], disabled && styles.disabled, style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.75}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'ghost' ? Colors.primary : Colors.white} />
      ) : (
        <Text style={[styles.text, styles[`${variant}Text`], textStyle]}>{label}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: Spacing.sm + 2,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: { backgroundColor: Colors.primary },
  secondary: { backgroundColor: Colors.surfaceElevated },
  ghost: { backgroundColor: 'transparent', borderWidth: 1, borderColor: Colors.primary },
  danger: { backgroundColor: Colors.danger },
  disabled: { opacity: 0.4 },
  text: { fontSize: FontSize.md, fontWeight: '600' },
  primaryText: { color: Colors.white },
  secondaryText: { color: Colors.text },
  ghostText: { color: Colors.primary },
  dangerText: { color: Colors.white },
});
