import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, Spacing, Radius } from '../../src/constants/theme';
import { useRoutineStore } from '../../src/store/routineStore';
import { useCategoryStore } from '../../src/store/categoryStore';
import { Routine, Category } from '../../src/types';
import { ActionSheet, ActionSheetOption } from '../../src/components/common/ActionSheet';

function ReorderButtons({
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
}: {
  onMoveUp: () => void;
  onMoveDown: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
}) {
  return (
    <View style={styles.reorderButtons}>
      <TouchableOpacity
        style={[styles.reorderBtn, !canMoveUp && styles.reorderBtnDisabled]}
        onPress={onMoveUp}
        disabled={!canMoveUp}
        hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
      >
        <Ionicons name="chevron-up" size={18} color={canMoveUp ? Colors.text : Colors.textMuted} />
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.reorderBtn, !canMoveDown && styles.reorderBtnDisabled]}
        onPress={onMoveDown}
        disabled={!canMoveDown}
        hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
      >
        <Ionicons
          name="chevron-down"
          size={18}
          color={canMoveDown ? Colors.text : Colors.textMuted}
        />
      </TouchableOpacity>
    </View>
  );
}

function RoutineCard({
  routine,
  reorderMode,
  onPress,
  onMenu,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
}: {
  routine: Routine;
  reorderMode: boolean;
  onPress: () => void;
  onMenu: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
}) {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={reorderMode ? undefined : onPress}
      activeOpacity={reorderMode ? 1 : 0.7}
      disabled={reorderMode}
    >
      {reorderMode && (
        <ReorderButtons
          onMoveUp={onMoveUp}
          onMoveDown={onMoveDown}
          canMoveUp={canMoveUp}
          canMoveDown={canMoveDown}
        />
      )}
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{routine.name}</Text>
        <Text style={styles.cardMeta}>
          {routine.exercises.length} exercise{routine.exercises.length !== 1 ? 's' : ''}
        </Text>
      </View>
      {!reorderMode && (
        <TouchableOpacity
          onPress={onMenu}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={styles.kebabBtn}
        >
          <Ionicons name="ellipsis-vertical" size={18} color={Colors.textSecondary} />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}

function CategoryFolder({
  category,
  level,
  allCategories,
  allRoutines,
  reorderMode,
  onDeleteCategory,
  onAddSubcategory,
  onRoutinePress,
  onRoutineMenu,
  onRoutineMoveUp,
  onRoutineMoveDown,
  onCategoryMoveUp,
  onCategoryMoveDown,
}: {
  category: Category;
  level: 0 | 1;
  allCategories: Category[];
  allRoutines: Routine[];
  reorderMode: boolean;
  onDeleteCategory: (c: Category) => void;
  onAddSubcategory: (c: Category) => void;
  onRoutinePress: (r: Routine) => void;
  onRoutineMenu: (r: Routine) => void;
  onRoutineMoveUp: (id: string) => void;
  onRoutineMoveDown: (id: string) => void;
  onCategoryMoveUp: (id: string) => void;
  onCategoryMoveDown: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const isOpen = reorderMode || expanded;

  const siblings = allCategories.filter((c) => c.parentId === category.parentId);
  const siblingIdx = siblings.findIndex((c) => c.id === category.id);
  const canMoveUp = siblingIdx > 0;
  const canMoveDown = siblingIdx < siblings.length - 1;

  const directRoutines = allRoutines.filter((r) => r.categoryId === category.id);
  const subcategories = level === 0 ? allCategories.filter((c) => c.parentId === category.id) : [];
  const isEmpty = directRoutines.length === 0 && subcategories.length === 0;

  return (
    <View style={[styles.folder, level === 1 && styles.subfolder]}>
      <TouchableOpacity
        style={styles.folderHeader}
        onPress={() => !reorderMode && setExpanded((v) => !v)}
        activeOpacity={reorderMode ? 1 : 0.75}
        disabled={reorderMode}
      >
        {reorderMode && (
          <ReorderButtons
            onMoveUp={() => onCategoryMoveUp(category.id)}
            onMoveDown={() => onCategoryMoveDown(category.id)}
            canMoveUp={canMoveUp}
            canMoveDown={canMoveDown}
          />
        )}
        <Ionicons
          name={isOpen ? 'folder-open-outline' : 'folder-outline'}
          size={level === 0 ? 20 : 17}
          color={Colors.textSecondary}
        />
        <Text style={[styles.folderName, level === 1 && styles.subfolderName]}>
          {category.name}
        </Text>
        <Text style={styles.folderCount}>{directRoutines.length}</Text>

        {!reorderMode && (
          <>
            <Ionicons
              name={expanded ? 'chevron-up' : 'chevron-down'}
              size={16}
              color={Colors.textMuted}
            />
            <TouchableOpacity
              onPress={() => onDeleteCategory(category)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              style={styles.kebabBtn}
            >
              <Ionicons name="ellipsis-vertical" size={18} color={Colors.textSecondary} />
            </TouchableOpacity>
          </>
        )}
      </TouchableOpacity>

      {isOpen && (
        <View style={styles.folderContents}>
          {directRoutines.map((r, idx) => (
            <RoutineCard
              key={r.id}
              routine={r}
              reorderMode={reorderMode}
              onPress={() => onRoutinePress(r)}
              onMenu={() => onRoutineMenu(r)}
              onMoveUp={() => onRoutineMoveUp(r.id)}
              onMoveDown={() => onRoutineMoveDown(r.id)}
              canMoveUp={idx > 0}
              canMoveDown={idx < directRoutines.length - 1}
            />
          ))}

          {subcategories.map((sub) => (
            <CategoryFolder
              key={sub.id}
              category={sub}
              level={1}
              allCategories={allCategories}
              allRoutines={allRoutines}
              reorderMode={reorderMode}
              onDeleteCategory={onDeleteCategory}
              onAddSubcategory={onAddSubcategory}
              onRoutinePress={onRoutinePress}
              onRoutineMenu={onRoutineMenu}
              onRoutineMoveUp={onRoutineMoveUp}
              onRoutineMoveDown={onRoutineMoveDown}
              onCategoryMoveUp={onCategoryMoveUp}
              onCategoryMoveDown={onCategoryMoveDown}
            />
          ))}

          {level === 0 && !reorderMode && (
            <TouchableOpacity
              style={styles.addSubfolderBtn}
              onPress={() => onAddSubcategory(category)}
            >
              <Ionicons name="add" size={16} color={Colors.textSecondary} />
              <Text style={styles.addSubfolderText}>Add Subcategory</Text>
            </TouchableOpacity>
          )}

          {isEmpty && <Text style={styles.folderEmpty}>No routines yet</Text>}
        </View>
      )}
    </View>
  );
}

function AddCategoryModal({
  visible,
  title,
  onClose,
  onAdd,
}: {
  visible: boolean;
  title: string;
  onClose: () => void;
  onAdd: (name: string) => void;
}) {
  const [name, setName] = useState('');

  function handleAdd() {
    const trimmed = name.trim();
    if (!trimmed) return;
    onAdd(trimmed);
    setName('');
    onClose();
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity style={styles.modalBox} activeOpacity={1}>
          <Text style={styles.modalTitle}>{title}</Text>
          <TextInput
            style={styles.modalInput}
            placeholder="e.g. Push, Pull, Legs..."
            placeholderTextColor={Colors.textMuted}
            value={name}
            onChangeText={setName}
            autoFocus
            returnKeyType="done"
            onSubmitEditing={handleAdd}
          />
          <View style={styles.modalActions}>
            <TouchableOpacity style={styles.modalCancel} onPress={onClose}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalConfirm} onPress={handleAdd}>
              <Text style={styles.modalConfirmText}>Add</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

export default function RoutinesScreen() {
  const router = useRouter();
  const { routines, deleteRoutine, assignCategory, moveRoutineUp, moveRoutineDown } =
    useRoutineStore();
  const {
    categories,
    addCategory,
    deleteCategory,
    moveCategoryUp,
    moveCategoryDown,
    setCategoryParent,
  } = useCategoryStore();

  const [reorderMode, setReorderMode] = useState(false);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [addSubcategoryFor, setAddSubcategoryFor] = useState<Category | null>(null);
  const [routineMenuFor, setRoutineMenuFor] = useState<Routine | null>(null);
  const [categoryMenuFor, setCategoryMenuFor] = useState<Category | null>(null);
  const [movePickerFor, setMovePickerFor] = useState<Routine | null>(null);
  const [categoryParentPickerFor, setCategoryParentPickerFor] = useState<Category | null>(null);

  function handleDeleteRoutine(routine: Routine) {
    Alert.alert('Delete Routine', `Delete "${routine.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteRoutine(routine.id) },
    ]);
  }

  function handleDeleteCategory(category: Category) {
    const childCategories = categories.filter((c) => c.parentId === category.id);
    const isParent = childCategories.length > 0;
    Alert.alert(
      'Delete Folder',
      isParent
        ? `Delete "${category.name}" and its ${childCategories.length} subcategor${childCategories.length !== 1 ? 'ies' : 'y'}? Routines inside will become uncategorized.`
        : `Delete "${category.name}"? Routines inside will become uncategorized.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const affectedIds = [category.id, ...childCategories.map((c) => c.id)];
            for (const r of routines.filter((r) => affectedIds.includes(r.categoryId ?? ''))) {
              await assignCategory(r.id, undefined);
            }
            for (const c of childCategories) {
              await deleteCategory(c.id);
            }
            await deleteCategory(category.id);
          },
        },
      ]
    );
  }

  const topLevelCategories = categories.filter((c) => !c.parentId);
  const uncategorized = routines.filter((r) => !r.categoryId);

  function getCategoryMenuOptions(category: Category): ActionSheetOption[] {
    const hasChildren = categories.some((c) => c.parentId === category.id);
    const eligibleParents = topLevelCategories.filter((c) => c.id !== category.id);
    const options: ActionSheetOption[] = [];

    if (!category.parentId) {
      options.push({
        label: 'Add Subcategory',
        icon: 'add-circle-outline',
        onPress: () => setAddSubcategoryFor(category),
      });
      if (!hasChildren && eligibleParents.length > 0) {
        options.push({
          label: 'Nest Under...',
          icon: 'return-down-forward-outline',
          onPress: () => setCategoryParentPickerFor(category),
        });
      }
    } else {
      if (eligibleParents.length > 0) {
        options.push({
          label: 'Move to Category',
          icon: 'folder-outline',
          onPress: () => setCategoryParentPickerFor(category),
        });
      }
      options.push({
        label: 'Make Top-Level Category',
        icon: 'arrow-up-circle-outline',
        onPress: () => setCategoryParent(category.id, undefined),
      });
    }

    options.push({
      label: 'Delete Folder',
      icon: 'trash-outline',
      destructive: true,
      onPress: () => handleDeleteCategory(category),
    });

    return options;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.heading}>{reorderMode ? 'Reorder' : 'My Routines'}</Text>
        <TouchableOpacity
          style={[styles.reorderToggle, reorderMode && styles.reorderToggleActive]}
          onPress={() => setReorderMode((v) => !v)}
        >
          {reorderMode ? (
            <Text style={styles.reorderToggleDoneText}>Done</Text>
          ) : (
            <>
              <Ionicons name="swap-vertical" size={16} color={Colors.textSecondary} />
              <Text style={styles.reorderToggleText}>Reorder</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {topLevelCategories.map((cat) => (
          <CategoryFolder
            key={cat.id}
            category={cat}
            level={0}
            allCategories={categories}
            allRoutines={routines}
            reorderMode={reorderMode}
            onDeleteCategory={(c) => setCategoryMenuFor(c)}
            onAddSubcategory={(c) => setAddSubcategoryFor(c)}
            onRoutinePress={(r) => router.push(`/routines/${r.id}`)}
            onRoutineMenu={(r) => setRoutineMenuFor(r)}
            onRoutineMoveUp={(id) => moveRoutineUp(id)}
            onRoutineMoveDown={(id) => moveRoutineDown(id)}
            onCategoryMoveUp={(id) => moveCategoryUp(id)}
            onCategoryMoveDown={(id) => moveCategoryDown(id)}
          />
        ))}

        {uncategorized.length > 0 && (
          <>
            {categories.length > 0 && (
              <Text style={styles.uncategorizedLabel}>Uncategorized</Text>
            )}
            {uncategorized.map((r, idx) => (
              <RoutineCard
                key={r.id}
                routine={r}
                reorderMode={reorderMode}
                onPress={() => router.push(`/routines/${r.id}`)}
                onMenu={() => setRoutineMenuFor(r)}
                onMoveUp={() => moveRoutineUp(r.id)}
                onMoveDown={() => moveRoutineDown(r.id)}
                canMoveUp={idx > 0}
                canMoveDown={idx < uncategorized.length - 1}
              />
            ))}
          </>
        )}

        {routines.length === 0 && categories.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="barbell-outline" size={60} color={Colors.textMuted} />
            <Text style={styles.emptyTitle}>No routines yet</Text>
            <Text style={styles.emptySubtext}>Tap + to create your first routine</Text>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {!reorderMode && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => setShowAddMenu(true)}
          activeOpacity={0.85}
        >
          <Ionicons name="add" size={30} color={Colors.white} />
        </TouchableOpacity>
      )}

      <ActionSheet
        visible={showAddMenu}
        onClose={() => setShowAddMenu(false)}
        options={[
          {
            label: 'New Routine',
            icon: 'barbell-outline',
            onPress: () => router.push('/routines/editor/new'),
          },
          {
            label: 'New Category',
            icon: 'folder-outline',
            onPress: () => setShowAddCategory(true),
          },
        ]}
      />

      <AddCategoryModal
        visible={showAddCategory}
        title="New Category"
        onClose={() => setShowAddCategory(false)}
        onAdd={(name) => addCategory(name)}
      />

      <AddCategoryModal
        visible={!!addSubcategoryFor}
        title={`New Subcategory${addSubcategoryFor ? ` in "${addSubcategoryFor.name}"` : ''}`}
        onClose={() => setAddSubcategoryFor(null)}
        onAdd={(name) => addSubcategoryFor && addCategory(name, addSubcategoryFor.id)}
      />

      <ActionSheet
        visible={!!routineMenuFor}
        title={routineMenuFor?.name}
        onClose={() => setRoutineMenuFor(null)}
        options={[
          {
            label: 'Edit',
            icon: 'create-outline',
            onPress: () => routineMenuFor && router.push(`/routines/editor/${routineMenuFor.id}`),
          },
          {
            label: 'Move to Category',
            icon: 'folder-outline',
            onPress: () => routineMenuFor && setMovePickerFor(routineMenuFor),
          },
          {
            label: 'Delete',
            icon: 'trash-outline',
            destructive: true,
            onPress: () => routineMenuFor && handleDeleteRoutine(routineMenuFor),
          },
        ]}
      />

      <ActionSheet
        visible={!!categoryMenuFor}
        title={categoryMenuFor?.name}
        onClose={() => setCategoryMenuFor(null)}
        options={categoryMenuFor ? getCategoryMenuOptions(categoryMenuFor) : []}
      />

      <ActionSheet
        visible={!!categoryParentPickerFor}
        title={
          categoryParentPickerFor ? `Nest "${categoryParentPickerFor.name}" Under` : undefined
        }
        onClose={() => setCategoryParentPickerFor(null)}
        options={topLevelCategories
          .filter((c) => c.id !== categoryParentPickerFor?.id)
          .map((c) => ({
            label: c.name,
            icon: 'folder-outline' as const,
            onPress: () =>
              categoryParentPickerFor && setCategoryParent(categoryParentPickerFor.id, c.id),
          }))}
      />

      <ActionSheet
        visible={!!movePickerFor}
        title="Move to Category"
        onClose={() => setMovePickerFor(null)}
        options={[
          ...topLevelCategories.flatMap((c) => [
            {
              label: c.name,
              icon: 'folder-outline' as const,
              onPress: () => movePickerFor && assignCategory(movePickerFor.id, c.id),
            },
            ...categories
              .filter((sc) => sc.parentId === c.id)
              .map((sc) => ({
                label: sc.name,
                icon: 'return-down-forward-outline' as const,
                indent: true,
                onPress: () => movePickerFor && assignCategory(movePickerFor.id, sc.id),
              })),
          ]),
          {
            label: 'Uncategorized',
            icon: 'close-circle-outline' as const,
            onPress: () => movePickerFor && assignCategory(movePickerFor.id, undefined),
          },
        ]}
      />
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
  reorderToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  reorderToggleActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary,
  },
  reorderToggleText: { color: Colors.textSecondary, fontWeight: '600', fontSize: FontSize.sm },
  reorderToggleDoneText: { color: Colors.white, fontWeight: '700', fontSize: FontSize.sm },
  scroll: { paddingHorizontal: Spacing.md, paddingTop: Spacing.sm },

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
  kebabBtn: { padding: 2 },

  reorderButtons: { gap: 2, marginRight: Spacing.xs },
  reorderBtn: {
    width: 28,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surfaceElevated,
    borderRadius: Radius.sm,
  },
  reorderBtnDisabled: { opacity: 0.35 },

  folder: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  subfolder: {
    backgroundColor: Colors.surfaceElevated,
    marginBottom: Spacing.sm,
    marginLeft: Spacing.md,
    borderStyle: 'dashed',
  },
  folderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  folderName: {
    flex: 1,
    color: Colors.text,
    fontWeight: '700',
    fontSize: FontSize.md,
  },
  subfolderName: {
    fontSize: FontSize.sm,
    fontWeight: '600',
  },
  folderCount: {
    color: Colors.textMuted,
    fontSize: FontSize.sm,
    fontWeight: '600',
    backgroundColor: Colors.surfaceElevated,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radius.full,
    overflow: 'hidden',
  },
  folderContents: {
    paddingHorizontal: Spacing.sm,
    paddingBottom: Spacing.sm,
  },
  folderEmpty: {
    color: Colors.textMuted,
    fontSize: FontSize.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
    fontStyle: 'italic',
  },
  addSubfolderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    marginTop: 2,
  },
  addSubfolderText: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    fontWeight: '600',
  },

  uncategorizedLabel: {
    color: Colors.textMuted,
    fontSize: FontSize.xs,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: Spacing.sm,
    marginTop: Spacing.xs,
  },

  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: Spacing.xxl * 2,
    gap: Spacing.sm,
  },
  emptyTitle: { color: Colors.textSecondary, fontSize: FontSize.xl, fontWeight: '600' },
  emptySubtext: { color: Colors.textMuted, fontSize: FontSize.md },

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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  modalBox: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    width: '100%',
    gap: Spacing.md,
  },
  modalTitle: { color: Colors.text, fontWeight: '700', fontSize: FontSize.xl },
  modalInput: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    color: Colors.text,
    fontSize: FontSize.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  modalActions: { flexDirection: 'row', gap: Spacing.sm, justifyContent: 'flex-end' },
  modalCancel: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  modalCancelText: { color: Colors.textSecondary, fontWeight: '600' },
  modalConfirm: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
    backgroundColor: Colors.primary,
  },
  modalConfirmText: { color: Colors.white, fontWeight: '700' },
});
