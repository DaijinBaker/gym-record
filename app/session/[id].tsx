import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Colors, FontSize, Spacing, Radius } from '../../src/constants/theme';
import { WEIGHT_UNIT } from '../../src/constants/units';
import { useSessionStore } from '../../src/store/sessionStore';
import { SessionExercise, LoggedSet } from '../../src/types';
import { formatCountdown } from '../../src/utils/format';

function parseFloatOrNull(text: string): number | null {
  if (text.trim() === '') return null;
  const n = parseFloat(text);
  return Number.isNaN(n) ? null : n;
}

function parseIntOrNull(text: string): number | null {
  if (text.trim() === '') return null;
  const n = parseInt(text, 10);
  return Number.isNaN(n) ? null : n;
}

type RestTimer = { exerciseId: string; setId: string; remaining: number };

function SetRow({
  set,
  index,
  onUpdate,
  onRemove,
  onToggleComplete,
}: {
  set: LoggedSet;
  index: number;
  onUpdate: (patch: Partial<Pick<LoggedSet, 'reps' | 'weight'>>) => void;
  onRemove: () => void;
  onToggleComplete: () => void;
}) {
  return (
    <View style={styles.setRow}>
      <Text style={styles.setIndex}>{index + 1}</Text>
      <TextInput
        style={styles.setInput}
        placeholder={String(set.targetWeight)}
        placeholderTextColor={Colors.textMuted}
        value={set.weight === null ? '' : String(set.weight)}
        onChangeText={(t) => onUpdate({ weight: parseFloatOrNull(t) })}
        keyboardType="decimal-pad"
        returnKeyType="done"
      />
      <TextInput
        style={styles.setInput}
        placeholder={String(set.targetReps)}
        placeholderTextColor={Colors.textMuted}
        value={set.reps === null ? '' : String(set.reps)}
        onChangeText={(t) => onUpdate({ reps: parseIntOrNull(t) })}
        keyboardType="number-pad"
        returnKeyType="done"
      />
      <TouchableOpacity
        onPress={onToggleComplete}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Ionicons
          name={set.completed ? 'checkmark-circle' : 'ellipse-outline'}
          size={26}
          color={set.completed ? Colors.success : Colors.textMuted}
        />
      </TouchableOpacity>
      <TouchableOpacity onPress={onRemove} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
        <Ionicons name="trash-outline" size={18} color={Colors.danger} />
      </TouchableOpacity>
    </View>
  );
}

function SessionExerciseCard({
  exercise,
  index,
  onUpdateSet,
  onAddSet,
  onRemoveSet,
  onCompleteSet,
}: {
  exercise: SessionExercise;
  index: number;
  onUpdateSet: (setId: string, patch: Partial<Pick<LoggedSet, 'reps' | 'weight'>>) => void;
  onAddSet: () => void;
  onRemoveSet: (setId: string) => void;
  onCompleteSet: (setId: string) => void;
}) {
  return (
    <View style={styles.exerciseCard}>
      <View style={styles.exerciseHeader}>
        <Text style={styles.exerciseNumber}>{index + 1}</Text>
        <Text style={styles.exerciseName}>{exercise.name}</Text>
      </View>

      <View style={styles.setHeaderRow}>
        <Text style={styles.setHeaderLabel}> </Text>
        <Text style={styles.setHeaderLabel}>{WEIGHT_UNIT}</Text>
        <Text style={styles.setHeaderLabel}>reps</Text>
        <Text style={[styles.setHeaderLabel, { width: 26 }]}> </Text>
        <Text style={[styles.setHeaderLabel, { width: 18 }]}> </Text>
      </View>

      {exercise.sets.map((set, setIndex) => (
        <SetRow
          key={set.id}
          set={set}
          index={setIndex}
          onUpdate={(patch) => onUpdateSet(set.id, patch)}
          onRemove={() => onRemoveSet(set.id)}
          onToggleComplete={() => onCompleteSet(set.id)}
        />
      ))}

      <TouchableOpacity style={styles.addSetBtn} onPress={onAddSet}>
        <Ionicons name="add" size={16} color={Colors.primary} />
        <Text style={styles.addSetText}>Add Set</Text>
      </TouchableOpacity>

      {exercise.notes ? <Text style={styles.exerciseNotes}>{exercise.notes}</Text> : null}
    </View>
  );
}

export default function ActiveSessionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { sessions, updateSet, addSet, removeSet, finishSession, discardSession } =
    useSessionStore();
  const session = sessions.find((s) => s.id === id);

  const [restTimer, setRestTimer] = useState<RestTimer | null>(null);

  useEffect(() => {
    if (!restTimer || restTimer.remaining <= 0) return;
    const t = setInterval(() => {
      setRestTimer((prev) => (prev ? { ...prev, remaining: prev.remaining - 1 } : prev));
    }, 1000);
    return () => clearInterval(t);
  }, [restTimer]);

  if (!session) {
    return (
      <SafeAreaView style={styles.container}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="close" size={24} color={Colors.text} />
        </TouchableOpacity>
        <View style={styles.notFoundState}>
          <Text style={styles.notFoundText}>Session not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  function handleCompleteSet(exercise: SessionExercise, set: LoggedSet) {
    const wasCompleted = set.completed;
    updateSet(session!.id, exercise.id, set.id, { completed: !wasCompleted });
    if (!wasCompleted && exercise.restTimeSeconds > 0) {
      setRestTimer({
        exerciseId: exercise.id,
        setId: set.id,
        remaining: exercise.restTimeSeconds,
      });
    }
  }

  function handleFinish() {
    Alert.alert('Finish Workout?', 'This will save your logged sets to history.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Finish',
        onPress: async () => {
          await finishSession(session!.id);
          router.replace(`/history/${session!.id}`);
        },
      },
    ]);
  }

  function handleDiscard() {
    Alert.alert('Discard Workout?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Discard',
        style: 'destructive',
        onPress: async () => {
          await discardSession(session!.id);
          router.back();
        },
      },
    ]);
  }

  const restExercise = restTimer
    ? session.exercises.find((e) => e.id === restTimer.exerciseId)
    : null;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="close" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.heading} numberOfLines={1}>{session.routineName}</Text>
        <TouchableOpacity onPress={handleFinish} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={styles.finishText}>Finish</Text>
        </TouchableOpacity>
      </View>

      {restTimer && restExercise && (
        <View style={styles.restBanner}>
          <Ionicons name="time-outline" size={18} color={Colors.primary} />
          <Text style={styles.restBannerText}>
            Resting · {restExercise.name} · {formatCountdown(restTimer.remaining)}
          </Text>
          <TouchableOpacity onPress={() => setRestTimer(null)}>
            <Text style={styles.restSkipText}>Skip</Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {session.exercises.map((exercise, index) => (
          <SessionExerciseCard
            key={exercise.id}
            exercise={exercise}
            index={index}
            onUpdateSet={(setId, patch) => updateSet(session.id, exercise.id, setId, patch)}
            onAddSet={() => addSet(session.id, exercise.id)}
            onRemoveSet={(setId) => removeSet(session.id, exercise.id, setId)}
            onCompleteSet={(setId) => {
              const set = exercise.sets.find((s) => s.id === setId);
              if (set) handleCompleteSet(exercise, set);
            }}
          />
        ))}

        <TouchableOpacity style={styles.discardBtn} onPress={handleDiscard}>
          <Text style={styles.discardText}>Discard Workout</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
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
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.text,
    textAlign: 'center',
  },
  finishText: { color: Colors.primary, fontWeight: '700', fontSize: FontSize.md },
  backBtn: { padding: Spacing.xs },

  restBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.surfaceElevated,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  restBannerText: { flex: 1, color: Colors.text, fontSize: FontSize.sm, fontWeight: '600' },
  restSkipText: { color: Colors.primary, fontWeight: '700', fontSize: FontSize.sm },

  scroll: { padding: Spacing.md },
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
  setHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: 2,
    marginBottom: 4,
  },
  setHeaderLabel: {
    flex: 1,
    color: Colors.textMuted,
    fontSize: FontSize.xs,
    fontWeight: '600',
    textAlign: 'center',
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: 6,
  },
  setIndex: {
    width: 18,
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    fontWeight: '700',
    textAlign: 'center',
  },
  setInput: {
    flex: 1,
    backgroundColor: Colors.surfaceElevated,
    borderRadius: Radius.sm,
    paddingVertical: Spacing.xs + 2,
    color: Colors.text,
    fontSize: FontSize.md,
    textAlign: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  addSetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: Spacing.sm,
    marginTop: Spacing.xs,
  },
  addSetText: { color: Colors.primary, fontWeight: '600', fontSize: FontSize.sm },
  exerciseNotes: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    marginTop: Spacing.sm,
    fontStyle: 'italic',
  },
  discardBtn: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
    marginTop: Spacing.sm,
  },
  discardText: { color: Colors.danger, fontWeight: '600', fontSize: FontSize.md },
  notFoundState: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  notFoundText: { color: Colors.textSecondary, fontSize: FontSize.md },
});
