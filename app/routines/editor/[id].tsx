import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { useRoutineStore } from '../../../src/store/routineStore';
import { useCategoryStore } from '../../../src/store/categoryStore';
import { Colors, FontSize, Spacing, Radius } from '../../../src/constants/theme';
import { WEIGHT_UNIT } from '../../../src/constants/units';
import { generateId } from '../../../src/utils/id';
import { ActionSheet } from '../../../src/components/common/ActionSheet';
import { Routine, Exercise } from '../../../src/types';

type ExerciseForm = {
  name: string;
  weight: string;
  sets: string;
  reps: string;
  restTimeSeconds: string;
  notes: string;
};

type FormValues = {
  routineName: string;
  exercises: ExerciseForm[];
};

function emptyExercise(): ExerciseForm {
  return { name: '', weight: '', sets: '3', reps: '10', restTimeSeconds: '90', notes: '' };
}

export default function RoutineEditorScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const isNew = id === 'new';
  const { routines, upsertRoutine } = useRoutineStore();
  const { categories } = useCategoryStore();
  const existing = isNew ? null : routines.find((r) => r.id === id);
  const topLevelCategories = categories.filter((c) => !c.parentId);

  const [selectedCategoryId, setSelectedCategoryId] = useState<string | undefined>(
    existing?.categoryId
  );
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      routineName: existing?.name ?? '',
      exercises:
        existing?.exercises.map((e) => ({
          name: e.name,
          weight: String(e.weight),
          sets: String(e.sets),
          reps: String(e.reps),
          restTimeSeconds: String(e.restTimeSeconds),
          notes: e.notes ?? '',
        })) ?? [emptyExercise()],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'exercises' });

  async function onSubmit(values: FormValues) {
    const name = values.routineName.trim();
    if (!name) return;

    const now = new Date().toISOString();
    const exercises: Exercise[] = values.exercises
      .filter((e) => e.name.trim() !== '')
      .map((e) => ({
        id: generateId(),
        name: e.name.trim(),
        weight: parseFloat(e.weight) || 0,
        sets: parseInt(e.sets, 10) || 1,
        reps: parseInt(e.reps, 10) || 1,
        restTimeSeconds: parseInt(e.restTimeSeconds, 10) || 0,
        notes: e.notes.trim() || undefined,
      }));

    if (exercises.length === 0) {
      Alert.alert('No exercises', 'Add at least one named exercise before saving.');
      return;
    }

    const routine: Routine = {
      id: isNew ? generateId() : (id as string),
      name,
      exercises,
      categoryId: selectedCategoryId,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    };

    await upsertRoutine(routine);
    router.back();
  }

  function confirmRemove(index: number) {
    if (fields.length === 1) {
      Alert.alert('Cannot remove', 'A routine must have at least one exercise.');
      return;
    }
    Alert.alert('Remove Exercise', 'Remove this exercise from the routine?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => remove(index) },
    ]);
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="close" size={24} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.heading}>{isNew ? 'New Routine' : 'Edit Routine'}</Text>
          <TouchableOpacity onPress={handleSubmit(onSubmit)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={styles.saveText}>Save</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Routine Name */}
          <Text style={styles.fieldLabel}>Routine Name</Text>
          <Controller
            control={control}
            name="routineName"
            rules={{ required: true }}
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={[styles.nameInput, errors.routineName && styles.inputError]}
                placeholder="e.g. Push Day, Leg Day..."
                placeholderTextColor={Colors.textMuted}
                value={value}
                onChangeText={onChange}
                returnKeyType="done"
              />
            )}
          />
          {errors.routineName && (
            <Text style={styles.errorText}>Routine name is required</Text>
          )}

          {/* Category picker */}
          <Text style={[styles.fieldLabel, { marginTop: Spacing.lg }]}>Category</Text>
          <TouchableOpacity
            style={styles.categoryPicker}
            onPress={() => setShowCategoryPicker(true)}
          >
            <Ionicons name="folder-outline" size={18} color={Colors.textSecondary} />
            <Text style={[
              styles.categoryPickerText,
              !selectedCategoryId && styles.categoryPickerPlaceholder,
            ]}>
              {selectedCategoryId
                ? (categories.find((c) => c.id === selectedCategoryId)?.name ?? 'Unknown')
                : 'No category'}
            </Text>
            <Ionicons name="chevron-down" size={16} color={Colors.textMuted} />
          </TouchableOpacity>

          {/* Category picker */}
          <ActionSheet
            visible={showCategoryPicker}
            title="Select Category"
            onClose={() => setShowCategoryPicker(false)}
            options={[
              {
                label: 'No category',
                icon: 'close-circle-outline',
                onPress: () => setSelectedCategoryId(undefined),
              },
              ...topLevelCategories.flatMap((cat) => [
                {
                  label: cat.name,
                  icon: 'folder-outline' as const,
                  onPress: () => setSelectedCategoryId(cat.id),
                },
                ...categories
                  .filter((c) => c.parentId === cat.id)
                  .map((sub) => ({
                    label: sub.name,
                    icon: 'return-down-forward-outline' as const,
                    indent: true,
                    onPress: () => setSelectedCategoryId(sub.id),
                  })),
              ]),
            ]}
          />
          <Text style={[styles.fieldLabel, { marginTop: Spacing.xl }]}>Exercises</Text>
          {fields.map((field, index) => (
            <View key={field.id} style={styles.exerciseCard}>
              {/* Card header */}
              <View style={styles.exerciseCardHeader}>
                <Text style={styles.exerciseIndex}>Exercise {index + 1}</Text>
                <TouchableOpacity
                  onPress={() => confirmRemove(index)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons name="trash-outline" size={18} color={Colors.danger} />
                </TouchableOpacity>
              </View>

              {/* Exercise name */}
              <Controller
                control={control}
                name={`exercises.${index}.name`}
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    style={styles.exerciseNameInput}
                    placeholder="Exercise name (e.g. Bench Press)"
                    placeholderTextColor={Colors.textMuted}
                    value={value}
                    onChangeText={onChange}
                    returnKeyType="done"
                  />
                )}
              />

              {/* Metrics row */}
              <View style={styles.metricsRow}>
                <View style={styles.metricField}>
                  <Text style={styles.metricLabel}>Weight ({WEIGHT_UNIT})</Text>
                  <Controller
                    control={control}
                    name={`exercises.${index}.weight`}
                    render={({ field: { onChange, value } }) => (
                      <TextInput
                        style={styles.metricInput}
                        placeholder="0"
                        placeholderTextColor={Colors.textMuted}
                        value={value}
                        onChangeText={onChange}
                        keyboardType="decimal-pad"
                        returnKeyType="done"
                      />
                    )}
                  />
                </View>

                <View style={styles.metricField}>
                  <Text style={styles.metricLabel}>Sets</Text>
                  <Controller
                    control={control}
                    name={`exercises.${index}.sets`}
                    render={({ field: { onChange, value } }) => (
                      <TextInput
                        style={styles.metricInput}
                        placeholder="3"
                        placeholderTextColor={Colors.textMuted}
                        value={value}
                        onChangeText={onChange}
                        keyboardType="number-pad"
                        returnKeyType="done"
                      />
                    )}
                  />
                </View>

                <View style={styles.metricField}>
                  <Text style={styles.metricLabel}>Reps</Text>
                  <Controller
                    control={control}
                    name={`exercises.${index}.reps`}
                    render={({ field: { onChange, value } }) => (
                      <TextInput
                        style={styles.metricInput}
                        placeholder="10"
                        placeholderTextColor={Colors.textMuted}
                        value={value}
                        onChangeText={onChange}
                        keyboardType="number-pad"
                        returnKeyType="done"
                      />
                    )}
                  />
                </View>

                <View style={styles.metricField}>
                  <Text style={styles.metricLabel}>Rest (s)</Text>
                  <Controller
                    control={control}
                    name={`exercises.${index}.restTimeSeconds`}
                    render={({ field: { onChange, value } }) => (
                      <TextInput
                        style={styles.metricInput}
                        placeholder="90"
                        placeholderTextColor={Colors.textMuted}
                        value={value}
                        onChangeText={onChange}
                        keyboardType="number-pad"
                        returnKeyType="done"
                      />
                    )}
                  />
                </View>
              </View>

              {/* Notes */}
              <Controller
                control={control}
                name={`exercises.${index}.notes`}
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    style={styles.notesInput}
                    placeholder="Notes (optional)"
                    placeholderTextColor={Colors.textMuted}
                    value={value}
                    onChangeText={onChange}
                    returnKeyType="done"
                    multiline
                  />
                )}
              />
            </View>
          ))}

          {/* Add Exercise */}
          <TouchableOpacity
            style={styles.addExerciseBtn}
            onPress={() => append(emptyExercise())}
          >
            <Ionicons name="add-circle-outline" size={22} color={Colors.primary} />
            <Text style={styles.addExerciseText}>Add Exercise</Text>
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  heading: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.text },
  saveText: { color: Colors.primary, fontWeight: '700', fontSize: FontSize.md },
  scroll: { padding: Spacing.md },
  fieldLabel: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: Spacing.xs,
  },
  nameInput: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    color: Colors.text,
    fontSize: FontSize.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  inputError: { borderColor: Colors.danger },
  errorText: { color: Colors.danger, fontSize: FontSize.xs, marginTop: 4 },
  exerciseCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  exerciseCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  exerciseIndex: {
    color: Colors.primary,
    fontSize: FontSize.sm,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  exerciseNameInput: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: Spacing.sm,
    color: Colors.text,
    fontSize: FontSize.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  metricField: { flex: 1 },
  metricLabel: {
    color: Colors.textMuted,
    fontSize: FontSize.xs,
    fontWeight: '600',
    marginBottom: 4,
    textAlign: 'center',
  },
  metricInput: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.xs,
    paddingVertical: Spacing.sm,
    color: Colors.text,
    fontSize: FontSize.md,
    textAlign: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  notesInput: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: Spacing.sm,
    color: Colors.text,
    fontSize: FontSize.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    marginTop: Spacing.sm,
    minHeight: 38,
  },
  addExerciseBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.primary,
    borderStyle: 'dashed',
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  addExerciseText: { color: Colors.primary, fontWeight: '600', fontSize: FontSize.md },
  categoryPicker: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    borderWidth: 1,
    borderColor: Colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  categoryPickerText: { flex: 1, color: Colors.text, fontSize: FontSize.md },
  categoryPickerPlaceholder: { color: Colors.textMuted },
});

