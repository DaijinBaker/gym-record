import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, Spacing, Radius } from '../../constants/theme';

export type ActionSheetOption = {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  destructive?: boolean;
  indent?: boolean;
  onPress: () => void;
};

export function ActionSheet({
  visible,
  title,
  options,
  onClose,
}: {
  visible: boolean;
  title?: string;
  options: ActionSheetOption[];
  onClose: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity style={styles.box} activeOpacity={1}>
          {title && <Text style={styles.title}>{title}</Text>}
          {options.map((opt, i) => (
            <TouchableOpacity
              key={i}
              style={[styles.option, opt.indent && styles.optionIndent]}
              onPress={() => {
                onClose();
                opt.onPress();
              }}
            >
              <Ionicons
                name={opt.icon}
                size={19}
                color={opt.destructive ? Colors.danger : Colors.text}
              />
              <Text style={[styles.optionText, opt.destructive && styles.optionDanger]}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={styles.cancel} onPress={onClose}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  box: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: Radius.lg,
    borderTopRightRadius: Radius.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
    paddingHorizontal: Spacing.md,
    gap: 2,
  },
  title: {
    color: Colors.textMuted,
    fontSize: FontSize.sm,
    fontWeight: '600',
    textAlign: 'center',
    paddingBottom: Spacing.sm,
    marginBottom: Spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
  },
  optionIndent: { paddingLeft: Spacing.lg + Spacing.sm },
  optionText: { color: Colors.text, fontSize: FontSize.md, fontWeight: '500' },
  optionDanger: { color: Colors.danger },
  cancel: {
    marginTop: Spacing.sm,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    backgroundColor: Colors.surfaceElevated,
    alignItems: 'center',
  },
  cancelText: { color: Colors.text, fontWeight: '700', fontSize: FontSize.md },
});
