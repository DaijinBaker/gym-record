import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, Spacing, Radius } from '../../src/constants/theme';
import { useSessionStore } from '../../src/store/sessionStore';
import { WorkoutSession } from '../../src/types';
import { formatDate, formatDuration, formatTime } from '../../src/utils/format';

function SessionCard({ session, onPress }: { session: WorkoutSession; onPress: () => void }) {
  const completedSets = session.exercises.flatMap((e) => e.sets).filter((s) => s.completed).length;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{session.routineName}</Text>
        <Text style={styles.cardMeta}>
          {formatTime(session.startedAt)}
          {session.finishedAt ? ` · ${formatDuration(session.startedAt, session.finishedAt)}` : ''}
          {' · '}
          {completedSets} set{completedSets !== 1 ? 's' : ''} logged
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
    </TouchableOpacity>
  );
}

export default function HistoryScreen() {
  const router = useRouter();
  const sessions = useSessionStore((s) => s.sessions);

  const completed = sessions
    .filter((s) => s.status === 'completed' && s.finishedAt)
    .sort((a, b) => (b.finishedAt ?? '').localeCompare(a.finishedAt ?? ''));

  const groups: { date: string; sessions: WorkoutSession[] }[] = [];
  for (const session of completed) {
    const date = formatDate(session.finishedAt!);
    const group = groups[groups.length - 1];
    if (group && group.date === date) {
      group.sessions.push(session);
    } else {
      groups.push({ date, sessions: [session] });
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.heading}>History</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {groups.map((group) => (
          <View key={group.date} style={styles.group}>
            <Text style={styles.groupLabel}>{group.date}</Text>
            {group.sessions.map((session) => (
              <SessionCard
                key={session.id}
                session={session}
                onPress={() => router.push(`/history/${session.id}`)}
              />
            ))}
          </View>
        ))}

        {completed.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="time-outline" size={60} color={Colors.textMuted} />
            <Text style={styles.emptyTitle}>No workouts logged yet</Text>
            <Text style={styles.emptySubtext}>Finish a workout to see it here</Text>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  heading: { fontSize: FontSize.xxxl, fontWeight: '700', color: Colors.text },
  scroll: { paddingHorizontal: Spacing.md, paddingTop: Spacing.sm },

  group: { marginBottom: Spacing.md },
  groupLabel: {
    color: Colors.textMuted,
    fontSize: FontSize.xs,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: Spacing.sm,
  },

  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  cardContent: { flex: 1 },
  cardTitle: { color: Colors.text, fontWeight: '600', fontSize: FontSize.lg },
  cardMeta: { color: Colors.textMuted, fontSize: FontSize.sm, marginTop: 3 },

  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: Spacing.xxl * 2,
    gap: Spacing.sm,
  },
  emptyTitle: { color: Colors.textSecondary, fontSize: FontSize.xl, fontWeight: '600' },
  emptySubtext: { color: Colors.textMuted, fontSize: FontSize.md },
});
