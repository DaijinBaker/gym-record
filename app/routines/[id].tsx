import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, Spacing, Radius } from '../../src/constants/theme';
import { WEIGHT_UNIT } from '../../src/constants/units';
import { useRoutineStore } from '../../src/store/routineStore';
import { Exercise } from '../../src/types';

function formatRest(seconds: number): string {
  if (seconds === 0) return 'No rest';
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return s > 0 ? `${m}m ${s}s` : `${m}m`;
}

function ExerciseRow({ exercise, index }: { exercise: Exercise; index: number }) {
  return (
    <View style={styles.exerciseCard}>
      <View style={styles.exerciseHeader}>
        <Text style={styles.exerciseNumber}>{index + 1}</Text>
        <Text style={styles.exerciseName}>{exercise.name}</Text>
      </View>
      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{exercise.weight}</Text>
          <Text style={styles.statLabel}>{WEIGHT_UNIT}</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.stat}>
          <Text style={styles.statValue}>{exercise.sets}</Text>
          <Text style={styles.statLabel}>sets</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.stat}>
          <Text style={styles.statValue}>{exercise.reps}</Text>
          <Text style={styles.statLabel}>reps</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.stat}>
          <Text style={styles.statValue}>{formatRest(exercise.restTimeSeconds)}</Text>
          <Text style={styles.statLabel}>rest</Text>
        </View>
      </View>
      {exercise.notes ? (
        <Text style={styles.exerciseNotes}>{exercise.notes}</Text>
      ) : null}
    </View>
  );
}

export default function RoutineDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { routines, deleteRoutine } = useRoutineStore();
  const routine = routines.find((r) => r.id === id);

  if (!routine) {
    return (
      <SafeAreaView style={styles.container}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <View style={styles.notFoundState}>
          <Text style={styles.notFoundText}>Routine not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  function handleDelete() {
    Alert.alert('Delete Routine', `Delete "${routine!.name}"? This cannot be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteRoutine(routine!.id);
          router.back();
        },
      },
    ]);
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.heading} numberOfLines={1}>{routine.name}</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            onPress={() => router.push(`/routines/editor/${id}`)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="create-outline" size={22} color={Colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleDelete}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="trash-outline" size={22} color={Colors.danger} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.exerciseCount}>
          {routine.exercises.length} exercise{routine.exercises.length !== 1 ? 's' : ''}
        </Text>

        {routine.exercises.map((exercise, index) => (
          <ExerciseRow
            key={exercise.id}
            exercise={exercise}
            index={index}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: Spacing.sm,
  },
  heading: {
    flex: 1,
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.text,
  },
  headerActions: { flexDirection: 'row', gap: Spacing.md, alignItems: 'center' },
  backBtn: { padding: Spacing.xs },
  scroll: { padding: Spacing.md },
  exerciseCount: {
    color: Colors.textMuted,
    fontSize: FontSize.sm,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: Spacing.md,
  },
  exerciseCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  exerciseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  exerciseNumber: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: Colors.primary,
    color: Colors.white,
    fontSize: FontSize.xs,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 26,
  },
  exerciseName: {
    color: Colors.text,
    fontSize: FontSize.lg,
    fontWeight: '600',
    flex: 1,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceElevated,
    borderRadius: Radius.sm,
    paddingVertical: Spacing.sm,
  },
  stat: { flex: 1, alignItems: 'center' },
  statValue: { color: Colors.text, fontWeight: '700', fontSize: FontSize.lg },
  statLabel: { color: Colors.textMuted, fontSize: FontSize.xs, marginTop: 2 },
  statDivider: { width: 1, height: 30, backgroundColor: Colors.border },
  exerciseNotes: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    marginTop: Spacing.sm,
    fontStyle: 'italic',
  },
  notFoundState: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  notFoundText: { color: Colors.textSecondary, fontSize: FontSize.md },
});

