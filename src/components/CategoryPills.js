import React, { useState } from 'react';
import {
  ScrollView,
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { Colors } from '../theme/colors';

export const CategoryPills = ({ selectedCategory, onSelectCategory }) => {
  const { categories, isAdmin, addCategory, deleteCategory } = useApp();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [error, setError] = useState('');
  const [pendingDelete, setPendingDelete] = useState(null); // category to confirm
  const [deleteError, setDeleteError] = useState('');

  const closeDelete = () => {
    setPendingDelete(null);
    setDeleteError('');
  };

  const handleConfirmDelete = () => {
    const res = deleteCategory(pendingDelete.id);
    if (!res.success) {
      setDeleteError(res.message);
      return;
    }
    if (selectedCategory === pendingDelete.id) onSelectCategory('all');
    closeDelete();
  };

  const closeAdd = () => {
    setIsAddOpen(false);
    setNewName('');
    setError('');
  };

  const handleAddCategory = () => {
    const res = addCategory(newName);
    if (!res.success) {
      setError(res.message);
      return;
    }
    closeAdd();
    onSelectCategory(res.id);
  };

  return (
    <View style={styles.wrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.pill,
                isSelected && styles.pillSelected,
              ]}
              onPress={() => onSelectCategory(cat.id)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={cat.icon}
                size={16}
                color={isSelected ? Colors.white : Colors.primary}
                style={styles.icon}
              />
              <Text
                style={[
                  styles.label,
                  isSelected && styles.labelSelected,
                ]}
              >
                {cat.name}
              </Text>
              {/* Store Owner: delete category */}
              {isAdmin && cat.id !== 'all' && (
                <TouchableOpacity
                  style={styles.deleteIcon}
                  onPress={() => setPendingDelete(cat)}
                  hitSlop={{ top: 8, bottom: 8, left: 6, right: 8 }}
                  accessibilityLabel={`Delete category ${cat.name}`}
                >
                  <Ionicons
                    name="close-circle"
                    size={16}
                    color={isSelected ? Colors.white : Colors.textMuted}
                  />
                </TouchableOpacity>
              )}
            </TouchableOpacity>
          );
        })}

        {/* Store Owner can create new categories */}
        {isAdmin && (
          <TouchableOpacity
            style={[styles.pill, styles.addPill]}
            onPress={() => setIsAddOpen(true)}
            accessibilityLabel="Add new category"
          >
            <Ionicons name="add" size={16} color={Colors.text} style={styles.icon} />
            <Text style={styles.label}>New Category</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      <Modal visible={isAddOpen} transparent animationType="fade" onRequestClose={closeAdd}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.overlay}
        >
          <View style={styles.dialog}>
            <Text style={styles.dialogTitle}>Add New Category</Text>
            <TextInput
              style={[styles.input, error ? styles.inputError : null]}
              value={newName}
              onChangeText={(t) => {
                setNewName(t);
                if (error) setError('');
              }}
              placeholder="e.g. Spices, Frozen Foods"
              placeholderTextColor={Colors.textMuted}
              autoFocus
              onSubmitEditing={handleAddCategory}
            />
            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <View style={styles.dialogActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={closeAdd}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleAddCategory}>
                <Text style={styles.saveText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Confirm delete category */}
      <Modal visible={!!pendingDelete} transparent animationType="fade" onRequestClose={closeDelete}>
        <View style={styles.overlay}>
          <View style={styles.dialog}>
            <Text style={styles.dialogTitle}>Delete Category?</Text>
            <Text style={styles.dialogText}>
              Are you sure you want to delete "{pendingDelete?.name}"?
            </Text>
            {deleteError ? <Text style={styles.errorText}>{deleteError}</Text> : null}

            <View style={styles.dialogActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={closeDelete}>
                <Text style={styles.cancelText}>{deleteError ? 'Close' : 'Cancel'}</Text>
              </TouchableOpacity>
              {!deleteError && (
                <TouchableOpacity style={styles.saveBtn} onPress={handleConfirmDelete}>
                  <Text style={styles.saveText}>Delete</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    paddingVertical: 10,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  container: {
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: Colors.primaryLight,
    marginRight: 10,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  pillSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primaryDark,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  addPill: {
    backgroundColor: Colors.white,
    borderColor: Colors.borderStrong,
    borderStyle: 'dashed',
  },
  icon: {
    marginRight: 6,
  },
  deleteIcon: {
    marginLeft: 6,
  },
  dialogText: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text,
  },
  labelSelected: {
    color: Colors.white,
  },
  overlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  dialog: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 20,
  },
  dialogTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 14,
  },
  input: {
    outlineStyle: 'none', // hide browser focus box on web
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: Colors.text,
  },
  inputError: {
    borderColor: Colors.danger,
  },
  errorText: {
    fontSize: 11,
    color: Colors.danger,
    marginTop: 4,
  },
  dialogActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 18,
  },
  cancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginRight: 8,
  },
  cancelText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  saveBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 22,
    borderRadius: 12,
  },
  saveText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
});
