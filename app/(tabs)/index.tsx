import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, Spacing, Radius } from '../../src/constants/theme';
import { useRoutineStore } from '../../src/store/routineStore';
import { Routine } from '../../src/types';

export default function RoutinesScreen() {
  const router = useRouter();
  const { routines, deleteRoutine } = useRoutineStore();

  function handleDelete(routine: Routine) {
    Alert.alert('Delete Routine', `Delete "${routine.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => deleteRoutine(routine.id),
      },
    ]);
  }

  function renderRoutine({ item }: { item: Routine }) {
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push(`/routines/${item.id}`)}
        onLongPress={() => handleDelete(item)}
      >
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>{item.name}</Text>
          <Text style={styles.cardMeta}>
            {item.exercises.length} exercise{item.exercises.length !== 1 ? 's' : ''}
          </Text>
        </View>
        <View style={styles.cardActions}>
          <TouchableOpacity
            onPress={() => router.push(`/routines/editor/${item.id}`)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="create-outline" size={20} color={Colors.textSecondary} />
          </TouchableOpacity>
          <Ionicons name="chevron-forward" size={20} color={Colors.textMuted} />
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.heading}>My Routines</Text>
      </View>

      <FlatList
        data={routines}
        keyExtractor={(item) => item.id}
        renderItem={renderRoutine}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="barbell-outline" size={60} color={Colors.textMuted} />
            <Text style={styles.emptyTitle}>No routines yet</Text>
            <Text style={styles.emptySubtext}>Tap + to create your first routine</Text>
          </View>
        }
      />

      {/* Floating Action Button — bottom-left, away from Expo dev tools */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/routines/editor/new')}
        activeOpacity={0.85}
      >
        <Ionicons name="add" size={30} color={Colors.white} />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  heading: { fontSize: FontSize.xxxl, fontWeight: '700', color: Colors.text },
  fab: {
    position: 'absolute',
    bottom: Spacing.xl,
    left: Spacing.lg,
    backgroundColor: Colors.primary,
    borderRadius: Radius.full,
    width: 58,
    height: 58,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  list: { padding: Spacing.md, flexGrow: 1 },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardContent: { flex: 1 },
  cardTitle: { color: Colors.text, fontWeight: '600', fontSize: FontSize.lg },
  cardMeta: { color: Colors.textMuted, fontSize: FontSize.sm, marginTop: 3 },
  cardActions: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: Spacing.xxl * 2,
    gap: Spacing.sm,
  },
  emptyTitle: { color: Colors.textSecondary, fontSize: FontSize.xl, fontWeight: '600' },
  emptySubtext: { color: Colors.textMuted, fontSize: FontSize.md },
});

