import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Modal,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { AppHeader } from '../components/AppHeader';
import { CategoryPills } from '../components/CategoryPills';
import { ProductCard } from '../components/ProductCard';
import { Colors } from '../theme/colors';

const SORT_OPTIONS = [
  { id: 'default', label: 'Relevance', icon: 'list-outline' },
  { id: 'price-low', label: 'Price: Low to High', icon: 'arrow-up-outline' },
  { id: 'price-high', label: 'Price: High to Low', icon: 'arrow-down-outline' },
  { id: 'rating', label: 'Top Rated', icon: 'star-outline' },
];

export const ProductsScreen = () => {
  const { isAdmin, products, categories, addProduct, updateProduct } = useApp();

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [filterOrganicOnly, setFilterOrganicOnly] = useState(false);
  const [sortBy, setSortBy] = useState('default'); // one of SORT_OPTIONS ids
  const [isSortOpen, setIsSortOpen] = useState(false);

  // Admin Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Admin Form Fields
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState('fruits');
  const [formPrice, setFormPrice] = useState('');
  const [formUnit, setFormUnit] = useState('');
  const [formStock, setFormStock] = useState('20');
  const [formImage, setFormImage] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formOrganic, setFormOrganic] = useState(true);
  const [formErrors, setFormErrors] = useState({});

  // Filtered & Sorted Products
  const filteredProducts = useMemo(() => {
    let result = products;

    // Category filter
    if (selectedCategory !== 'all') {
      result = result.filter((p) => p.category === selectedCategory);
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          (p.description && p.description.toLowerCase().includes(q))
      );
    }

    // Organic filter
    if (filterOrganicOnly) {
      result = result.filter((p) => p.isOrganic);
    }

    // Sorting
    if (sortBy === 'price-low') {
      result = [...result].sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
      result = [...result].sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      result = [...result].sort((a, b) => b.rating - a.rating);
    }

    return result;
  }, [products, selectedCategory, searchQuery, filterOrganicOnly, sortBy]);

  // Open Admin Add Modal
  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setFormName('');
    setFormCategory('fruits');
    setFormPrice('');
    setFormUnit('1 kg');
    setFormStock('25');
    setFormImage('https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80');
    setFormDescription('Farm fresh daily grocery product of top tier quality.');
    setFormOrganic(true);
    setFormErrors({});
    setIsModalOpen(true);
  };

  // Open Admin Edit Modal
  const handleOpenEditModal = (product) => {
    setEditingProduct(product);
    setFormName(product.name);
    setFormCategory(product.category);
    setFormPrice(product.price.toString());
    setFormUnit(product.unit);
    setFormStock((product.stock || 20).toString());
    setFormImage(product.image);
    setFormDescription(product.description || '');
    setFormOrganic(Boolean(product.isOrganic));
    setFormErrors({});
    setIsModalOpen(true);
  };

  // Validate & Save Product Form
  const handleSaveProduct = () => {
    const errors = {};
    if (!formName.trim()) errors.name = 'Product name is required';
    if (!formPrice.trim() || isNaN(formPrice) || parseFloat(formPrice) <= 0) {
      errors.price = 'Valid price is required';
    }
    if (!formUnit.trim()) errors.unit = 'Unit is required (e.g. 1 kg)';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    // Allow 0 (out of stock); fall back to 20 only when the field is empty / invalid
    const parsedStock = Number.isNaN(parseInt(formStock, 10)) ? 20 : Math.max(0, parseInt(formStock, 10));

    if (editingProduct) {
      updateProduct(editingProduct.id, {
        name: formName.trim(),
        category: formCategory,
        price: parseFloat(formPrice),
        unit: formUnit.trim(),
        stock: parsedStock,
        image: formImage.trim() || editingProduct.image,
        description: formDescription.trim(),
        isOrganic: formOrganic,
      });
    } else {
      addProduct({
        name: formName.trim(),
        category: formCategory,
        price: parseFloat(formPrice),
        unit: formUnit.trim(),
        stock: parsedStock,
        image: formImage.trim() || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80',
        description: formDescription.trim(),
        isOrganic: formOrganic,
      });
    }

    setIsModalOpen(false);
  };

  return (
    <View style={styles.container}>
      <AppHeader
        title={isAdmin ? 'Store Inventory' : 'Daily Groceries'}
        subtitle={isAdmin ? 'Admin • Manage products' : 'Fresh & Organic Market'}
      />

      {/* Search Bar & Filter Controls */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={20} color={Colors.textMuted} style={styles.searchIcon} />
          <TextInput
            placeholder="Search fruits, veggies, milk, bread..."
            placeholderTextColor={Colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchInput}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color={Colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Category Pills Bar */}
      <CategoryPills
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      {/* Quick Filter Chips & Admin Add Button */}
      <View style={styles.filterBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          <TouchableOpacity
            style={[styles.filterChip, filterOrganicOnly && styles.filterChipActive]}
            onPress={() => setFilterOrganicOnly(!filterOrganicOnly)}
          >
            <Ionicons
              name="leaf"
              size={12}
              color={filterOrganicOnly ? Colors.white : Colors.primary}
            />
            <Text style={[styles.filterChipText, filterOrganicOnly && styles.filterChipTextActive]}>
              Organic Only
            </Text>
          </TouchableOpacity>

          {/* Sort dropdown */}
          <TouchableOpacity
            style={[styles.filterChip, sortBy !== 'default' && styles.filterChipActive]}
            onPress={() => setIsSortOpen(true)}
            accessibilityLabel="Sort products"
          >
            <Ionicons
              name="swap-vertical"
              size={12}
              color={sortBy !== 'default' ? Colors.white : Colors.primary}
            />
            <Text style={[styles.filterChipText, sortBy !== 'default' && styles.filterChipTextActive]}>
              {sortBy === 'default' ? 'Sort' : SORT_OPTIONS.find((o) => o.id === sortBy).label}
            </Text>
            <Ionicons
              name="chevron-down"
              size={12}
              color={sortBy !== 'default' ? Colors.white : Colors.primary}
              style={{ marginLeft: 3 }}
            />
          </TouchableOpacity>
        </ScrollView>

        {/* Admin "Add Product" Action Button */}
        {isAdmin && (
          <TouchableOpacity
            style={styles.adminAddBtn}
            onPress={handleOpenAddModal}
            accessibilityLabel="Add New Product"
          >
            <Ionicons name="add-circle" size={18} color={Colors.white} />
            <Text style={styles.adminAddBtnText}>Add Product</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Sort options menu */}
      <Modal
        visible={isSortOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsSortOpen(false)}
      >
        <TouchableOpacity
          style={styles.sortOverlay}
          activeOpacity={1}
          onPress={() => setIsSortOpen(false)}
        >
          <View style={styles.sortMenu}>
            <Text style={styles.sortTitle}>Sort by</Text>
            {SORT_OPTIONS.map((o) => {
              const selected = sortBy === o.id;
              return (
                <TouchableOpacity
                  key={o.id}
                  style={styles.sortItem}
                  onPress={() => {
                    setSortBy(o.id);
                    setIsSortOpen(false);
                  }}
                >
                  <Ionicons name={o.icon} size={18} color={Colors.text} />
                  <Text style={[styles.sortItemText, selected && styles.sortItemTextActive]}>
                    {o.label}
                  </Text>
                  {selected && <Ionicons name="checkmark" size={18} color={Colors.text} />}
                </TouchableOpacity>
              );
            })}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Products Grid */}
      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={styles.columnWrapper}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <ProductCard product={item} onEdit={handleOpenEditModal} />
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="nutrition-outline" size={48} color={Colors.textMuted} />
            <Text style={styles.emptyTitle}>No products found</Text>
            <Text style={styles.emptySubtitle}>Try adjusting your search or filters</Text>
            <TouchableOpacity
              style={styles.resetBtn}
              onPress={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setFilterOrganicOnly(false);
                setSortBy('default');
              }}
            >
              <Text style={styles.resetBtnText}>Reset Filters</Text>
            </TouchableOpacity>
          </View>
        }
      />

      {/* Admin Add/Edit Product Modal */}
      <Modal
        visible={isModalOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsModalOpen(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingProduct ? 'Edit Grocery Item' : 'Add New Grocery Item'}
              </Text>
              <TouchableOpacity onPress={() => setIsModalOpen(false)}>
                <Ionicons name="close" size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Name */}
              <View style={styles.modalInputGroup}>
                <Text style={styles.modalLabel}>Product Name *</Text>
                <TextInput
                  style={[styles.modalInput, formErrors.name && styles.modalInputError]}
                  value={formName}
                  onChangeText={setFormName}
                  placeholder="e.g. Crisp Fuji Apples"
                />
                {formErrors.name && <Text style={styles.errorText}>{formErrors.name}</Text>}
              </View>

              {/* Category */}
              <View style={styles.modalInputGroup}>
                <Text style={styles.modalLabel}>Category</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexDirection: 'row' }}>
                  {categories.filter((c) => c.id !== 'all').map((c) => (
                    <TouchableOpacity
                      key={c.id}
                      style={[
                        styles.catOption,
                        formCategory === c.id && styles.catOptionActive,
                      ]}
                      onPress={() => setFormCategory(c.id)}
                    >
                      <Text
                        style={[
                          styles.catOptionText,
                          formCategory === c.id && styles.catOptionTextActive,
                        ]}
                      >
                        {c.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Price & Unit Row */}
              <View style={styles.modalRow}>
                <View style={[styles.modalInputGroup, { flex: 1, marginRight: 8 }]}>
                  <Text style={styles.modalLabel}>Price (₹) *</Text>
                  <TextInput
                    style={[styles.modalInput, formErrors.price && styles.modalInputError]}
                    value={formPrice}
                    onChangeText={setFormPrice}
                    placeholder="99"
                    keyboardType="numeric"
                  />
                  {formErrors.price && <Text style={styles.errorText}>{formErrors.price}</Text>}
                </View>

                <View style={[styles.modalInputGroup, { flex: 1 }]}>
                  <Text style={styles.modalLabel}>Unit/Weight *</Text>
                  <TextInput
                    style={[styles.modalInput, formErrors.unit && styles.modalInputError]}
                    value={formUnit}
                    onChangeText={setFormUnit}
                    placeholder="1 kg"
                  />
                  {formErrors.unit && <Text style={styles.errorText}>{formErrors.unit}</Text>}
                </View>
              </View>

              {/* Stock */}
              <View style={styles.modalInputGroup}>
                <Text style={styles.modalLabel}>Stock Quantity</Text>
                <TextInput
                  style={styles.modalInput}
                  value={formStock}
                  onChangeText={setFormStock}
                  placeholder="30"
                  keyboardType="number-pad"
                />
              </View>

              {/* Image URL */}
              <View style={styles.modalInputGroup}>
                <Text style={styles.modalLabel}>Image URL</Text>
                <TextInput
                  style={styles.modalInput}
                  value={formImage}
                  onChangeText={setFormImage}
                  placeholder="https://images.unsplash.com/..."
                />
              </View>

              {/* Description */}
              <View style={styles.modalInputGroup}>
                <Text style={styles.modalLabel}>Description</Text>
                <TextInput
                  style={[styles.modalInput, { height: 70, textAlignVertical: 'top' }]}
                  value={formDescription}
                  onChangeText={setFormDescription}
                  placeholder="Fresh organic product information..."
                  multiline
                />
              </View>

              {/* Organic Toggle */}
              <TouchableOpacity
                style={styles.organicToggle}
                onPress={() => setFormOrganic(!formOrganic)}
              >
                <Ionicons
                  name={formOrganic ? 'checkbox' : 'square-outline'}
                  size={20}
                  color={Colors.primary}
                />
                <Text style={styles.organicToggleText}>Mark as Certified Organic</Text>
              </TouchableOpacity>

              {/* Save Button */}
              <TouchableOpacity style={styles.saveBtn} onPress={handleSaveProduct}>
                <Text style={styles.saveBtnText}>
                  {editingProduct ? 'Save Product Changes' : 'Add to Catalog'}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 6,
    backgroundColor: Colors.white,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 44,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    outlineStyle: 'none', // hide browser focus box on web
    flex: 1,
    fontSize: 14,
    color: Colors.text,
  },
  filterBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  filterScroll: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: Colors.background,
    marginRight: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primaryDark,
  },
  filterChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.text,
    marginLeft: 4,
  },
  filterChipTextActive: {
    color: Colors.white,
  },
  adminAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.secondary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  adminAddBtnText: {
    color: Colors.white,
    fontSize: 11,
    fontWeight: '700',
    marginLeft: 4,
  },
  sortOverlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  sortMenu: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: Colors.white,
    borderRadius: 18,
    paddingVertical: 8,
  },
  sortTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  sortItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 13,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  sortItemText: {
    flex: 1,
    fontSize: 15,
    color: Colors.text,
    marginLeft: 12,
  },
  sortItemTextActive: {
    fontWeight: '700',
  },
  listContent: {
    padding: 10,
    paddingBottom: 40,
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 13,
    color: Colors.textMuted,
    marginTop: 4,
  },
  resetBtn: {
    marginTop: 16,
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: Colors.primaryLight,
  },
  resetBtnText: {
    color: Colors.primary,
    fontWeight: '700',
    fontSize: 13,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: 'flex-end',
  },
  modalContent: {
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingBottom: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  modalInputGroup: {
    marginBottom: 12,
  },
  modalRow: {
    flexDirection: 'row',
  },
  modalLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 6,
  },
  modalInput: {
    outlineStyle: 'none', // hide browser focus box on web
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: Colors.text,
  },
  modalInputError: {
    borderColor: Colors.danger,
    backgroundColor: Colors.dangerLight,
  },
  errorText: {
    fontSize: 11,
    color: Colors.danger,
    marginTop: 3,
  },
  catOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: 6,
  },
  catOptionActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  catOptionText: {
    fontSize: 12,
    color: Colors.text,
    fontWeight: '600',
  },
  catOptionTextActive: {
    color: Colors.white,
  },
  organicToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 12,
  },
  organicToggleText: {
    fontSize: 13,
    color: Colors.text,
    marginLeft: 8,
    fontWeight: '600',
  },
  saveBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  saveBtnText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '700',
  },
});
