import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, Spacing, Radius } from '../../src/constants/theme';
import { WEIGHT_UNIT } from '../../src/constants/units';
import { useSessionStore } from '../../src/store/sessionStore';
import { SessionExercise } from '../../src/types';
import { formatDate, formatDuration, formatTime } from '../../src/utils/format';

function SessionExerciseCard({ exercise, index }: { exercise: SessionExercise; index: number }) {
  return (
    <View style={styles.exerciseCard}>
      <View style={styles.exerciseHeader}>
        <Text style={styles.exerciseNumber}>{index + 1}</Text>
        <Text style={styles.exerciseName}>{exercise.name}</Text>
      </View>

      {exercise.sets.map((set, setIndex) => (
        <View key={set.id} style={styles.setRow}>
          <Text style={[styles.setLabel, !set.completed && styles.setDim]}>
            Set {setIndex + 1}
          </Text>
          {set.completed && set.weight !== null && set.reps !== null ? (
            <Text style={styles.setValue}>
              {set.weight} {WEIGHT_UNIT} × {set.reps} reps
            </Text>
          ) : (
            <Text style={[styles.setValue, styles.setDim]}>Skipped</Text>
          )}
        </View>
      ))}

      {exercise.notes ? <Text style={styles.exerciseNotes}>{exercise.notes}</Text> : null}
    </View>
  );
}

export default function SessionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const session = useSessionStore((s) => s.sessions).find((x) => x.id === id);

  if (!session) {
    return (
      <SafeAreaView style={styles.container}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <View style={styles.notFoundState}>
          <Text style={styles.notFoundText}>Session not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.heading} numberOfLines={1}>{session.routineName}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.summary}>
          {formatDate(session.startedAt)} · {formatTime(session.startedAt)}
          {session.finishedAt ? ` · ${formatDuration(session.startedAt, session.finishedAt)}` : ''}
        </Text>

        {session.exercises.map((exercise, index) => (
          <SessionExerciseCard key={exercise.id} exercise={exercise} index={index} />
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
    justifyContent: 'space-between',
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
    textAlign: 'center',
  },
  backBtn: { padding: Spacing.xs },
  scroll: { padding: Spacing.md },
  summary: {
    color: Colors.textMuted,
    fontSize: FontSize.sm,
    fontWeight: '600',
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
  setRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  setLabel: { color: Colors.textSecondary, fontSize: FontSize.sm, fontWeight: '600' },
  setValue: { color: Colors.text, fontSize: FontSize.sm, fontWeight: '600' },
  setDim: { color: Colors.textMuted, fontWeight: '400' },
  exerciseNotes: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    marginTop: Spacing.sm,
    fontStyle: 'italic',
  },
  notFoundState: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  notFoundText: { color: Colors.textSecondary, fontSize: FontSize.md },
});
