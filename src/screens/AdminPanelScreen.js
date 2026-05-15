import React, { useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';

import {
  createMarketingActivity,
  createOrder,
  createProduct,
  deleteMarketingActivity as deleteMarketingActivityRecord,
  deleteProduct as deleteProductRecord,
  updateMarketingActivity,
  updateProduct,
} from '../services/remediumData';
import DateInput from '../components/DateInput';

const createOrderRow = () => ({
  id: `${Date.now()}-${Math.random()}`,
  name: '',
  quantity: '',
});

const initialForms = {
  product: { name: '', quantity: '' },
  order: { date: '' },
  marketing: { title: '', image: '', imageName: '', description: '' },
};

const sections = [
  {
    id: 'product',
    title: 'Наличности за продукта',
    description: 'Продукти и налични количества',
    color: '#16a34a',
  },
  {
    id: 'order',
    title: 'Поръчки',
    description: 'Дата, продукти и бройки към поръчка',
    color: '#2563eb',
  },
  {
    id: 'marketing',
    title: 'Маркетингови активности',
    description: 'Снимки, подмяна и описания',
    color: '#db2777',
  },
];

export default function AdminPanelScreen({
  route,
  currentUser,
  products = [],
  orders = [],
  marketingActivities = [],
  dataError = '',
  onProductsChange = () => {},
  onOrdersChange = () => {},
  onMarketingActivitiesChange = () => {},
  onLogout,
}) {
  const { storeId = '1', storeName = 'Избран обект' } = route?.params ?? {};
  const { width } = useWindowDimensions();
  const isTablet = width >= 720;
  const storeProducts = products.filter(product => product.storeId === storeId);
  const storeOrders = orders.filter(order => order.storeId === storeId);
  const storeMarketingActivities = marketingActivities.filter(activity => activity.storeId === storeId);
  const [activeSection, setActiveSection] = useState(null);
  const [forms, setForms] = useState(initialForms);
  const [productStockDate, setProductStockDate] = useState('');
  const [editingProductId, setEditingProductId] = useState(null);
  const [orderRows, setOrderRows] = useState([createOrderRow()]);
  const [editingMarketingId, setEditingMarketingId] = useState(null);
  const [formError, setFormError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const updateForm = (section, field, value) => {
    setForms(currentForms => ({
      ...currentForms,
      [section]: {
        ...currentForms[section],
        [field]: value,
      },
    }));
  };

  const resetForm = section => {
    setForms(currentForms => ({
      ...currentForms,
      [section]: initialForms[section],
    }));
  };

  const resetProductForm = () => {
    resetForm('product');
    setEditingProductId(null);
  };

  const resetMarketingForm = () => {
    resetForm('marketing');
    setEditingMarketingId(null);
  };

  const saveProduct = async () => {
    const name = forms.product.name.trim();
    const quantity = forms.product.quantity.trim();
    const date = productStockDate.trim();
    if (!date || !name || !quantity) return;

    setIsSaving(true);
    setFormError('');

    try {
      if (editingProductId) {
        const updatedProduct = await updateProduct({ id: editingProductId, date, name, quantity });
        onProductsChange(
          products.map(product => (product.id === editingProductId ? updatedProduct : product))
        );
      } else {
        const createdProduct = await createProduct({ storeId, date, name, quantity });
        onProductsChange([createdProduct, ...products]);
      }

      resetProductForm();
    } catch (error) {
      setFormError(error.message ?? 'Неуспешен запис на продукта.');
    } finally {
      setIsSaving(false);
    }
  };

  const startEditProduct = product => {
    setEditingProductId(product.id);
    setForms(currentForms => ({
      ...currentForms,
      product: {
        name: product.name,
        quantity: product.quantity,
      },
    }));
    if (product.date) {
      setProductStockDate(product.date);
    }
  };

  const deleteProduct = async productId => {
    setIsSaving(true);
    setFormError('');

    try {
      await deleteProductRecord(productId);
      onProductsChange(products.filter(product => product.id !== productId));
      if (editingProductId === productId) {
        resetProductForm();
      }
    } catch (error) {
      setFormError(error.message ?? 'Неуспешно изтриване на продукта.');
    } finally {
      setIsSaving(false);
    }
  };

  const updateOrderRow = (rowId, field, value) => {
    setOrderRows(currentRows =>
      currentRows.map(row => (row.id === rowId ? { ...row, [field]: value } : row))
    );
  };

  const addOrderRow = () => {
    setOrderRows(currentRows => [...currentRows, createOrderRow()]);
  };

  const removeOrderRow = rowId => {
    setOrderRows(currentRows =>
      currentRows.length === 1 ? currentRows : currentRows.filter(row => row.id !== rowId)
    );
  };

  const addOrder = async () => {
    const date = forms.order.date.trim();
    const orderedProducts = orderRows
      .map(row => ({
        id: row.id,
        name: row.name.trim(),
        quantity: row.quantity.trim(),
      }))
      .filter(row => row.name && row.quantity);

    if (!date || orderedProducts.length === 0) return;

    setIsSaving(true);
    setFormError('');

    try {
      const createdOrder = await createOrder({ storeId, date, products: orderedProducts });
      onOrdersChange([createdOrder, ...orders]);
      resetForm('order');
      setOrderRows([createOrderRow()]);
    } catch (error) {
      setFormError(error.message ?? 'Неуспешно създаване на поръчка.');
    } finally {
      setIsSaving(false);
    }
  };

  const chooseMarketingImage = () => {
    if (!globalThis.document || !globalThis.FileReader) return;

    const input = globalThis.document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = event => {
      const file = event.target.files?.[0];
      if (!file) return;

      const reader = new globalThis.FileReader();
      reader.onload = readerEvent => {
        setForms(currentForms => ({
          ...currentForms,
          marketing: {
            ...currentForms.marketing,
            image: readerEvent.target?.result ?? '',
            imageName: file.name,
          },
        }));
      };
      reader.readAsDataURL(file);
    };
    input.click();
  };

  const removeMarketingImage = () => {
    setForms(currentForms => ({
      ...currentForms,
      marketing: {
        ...currentForms.marketing,
        image: '',
        imageName: '',
      },
    }));
  };

  const saveMarketingActivity = async () => {
    const title = forms.marketing.title.trim();
    const image = forms.marketing.image.trim();
    const imageName = forms.marketing.imageName.trim();
    const description = forms.marketing.description.trim();
    if (!title || !description) return;

    setIsSaving(true);
    setFormError('');

    try {
      if (editingMarketingId) {
        const updatedActivity = await updateMarketingActivity({
          id: editingMarketingId,
          title,
          description,
          image,
          imageName,
        });

        onMarketingActivitiesChange(
          marketingActivities.map(activity =>
            activity.id === editingMarketingId ? updatedActivity : activity
          )
        );
      } else {
        const createdActivity = await createMarketingActivity({
          storeId,
          title,
          description,
          image,
          imageName,
        });

        onMarketingActivitiesChange([createdActivity, ...marketingActivities]);
      }

      resetMarketingForm();
    } catch (error) {
      setFormError(error.message ?? 'Неуспешен запис на маркетингова активност.');
    } finally {
      setIsSaving(false);
    }
  };

  const startEditMarketingActivity = activity => {
    setEditingMarketingId(activity.id);
    setForms(currentForms => ({
      ...currentForms,
      marketing: {
        title: activity.title,
        image: activity.image ?? '',
        imageName: activity.imageName ?? '',
        description: activity.description,
      },
    }));
  };

  const deleteMarketingActivity = async activityId => {
    setIsSaving(true);
    setFormError('');

    try {
      await deleteMarketingActivityRecord(activityId);
      onMarketingActivitiesChange(marketingActivities.filter(activity => activity.id !== activityId));
      if (editingMarketingId === activityId) {
        resetMarketingForm();
      }
    } catch (error) {
      setFormError(error.message ?? 'Неуспешно изтриване на маркетингова активност.');
    } finally {
      setIsSaving(false);
    }
  };

  const renderActiveSection = () => {
    if (activeSection === 'product') {
      return (
        <AdminSection
          title="Наличности за продукта"
          description="Добавяне, редактиране и изтриване на продуктови наличности."
          buttonText={isSaving ? 'Запис...' : editingProductId ? 'Запази продукта' : 'Добави продукт'}
          onBack={() => setActiveSection(null)}
          onSubmit={saveProduct}
        >
          {editingProductId ? (
            <EditNotice text="Редактирате избран продукт." onCancel={resetProductForm} />
          ) : null}

          <Field
            label="Дата"
            value={productStockDate}
            onChangeText={setProductStockDate}
            placeholder="15.05.2026"
          />
          <Field
            label="Име на продукт"
            value={forms.product.name}
            onChangeText={value => updateForm('product', 'name', value)}
            placeholder="Продукт 21 - артикул"
          />
          <Field
            label="Количество"
            value={forms.product.quantity}
            onChangeText={value => updateForm('product', 'quantity', value)}
            placeholder="12"
            keyboardType="numeric"
          />
          <ProductPreviewList
            items={storeProducts}
            editingProductId={editingProductId}
            onEdit={startEditProduct}
            onDelete={deleteProduct}
          />
        </AdminSection>
      );
    }

    if (activeSection === 'order') {
      return (
        <AdminSection
          title="Поръчки"
          description="Към една дата може да добавите няколко продукта с отделни бройки."
          buttonText={isSaving ? 'Запис...' : 'Създай поръчка'}
          onBack={() => setActiveSection(null)}
          onSubmit={addOrder}
        >
          <Field
            label="Дата"
            value={forms.order.date}
            onChangeText={value => updateForm('order', 'date', value)}
            placeholder="14.05.2026"
          />

          <View style={styles.orderRowsHeader}>
            <Text style={styles.orderRowsTitle}>Продукти към поръчката</Text>
            <Pressable
              accessibilityRole="button"
              style={({ pressed }) => [styles.secondaryButton, pressed && styles.secondaryButtonPressed]}
              onPress={addOrderRow}
            >
              <Text style={styles.secondaryButtonText}>+ Продукт</Text>
            </Pressable>
          </View>

          {orderRows.map((row, index) => (
            <View key={row.id} style={styles.orderRowCard}>
              <View style={styles.orderRowHeader}>
                <Text style={styles.orderRowTitle}>Продукт {index + 1}</Text>
                {orderRows.length > 1 ? (
                  <Pressable
                    accessibilityRole="button"
                    style={({ pressed }) => [styles.removeButton, pressed && styles.removeButtonPressed]}
                    onPress={() => removeOrderRow(row.id)}
                  >
                    <Text style={styles.removeButtonText}>Махни</Text>
                  </Pressable>
                ) : null}
              </View>
              <Field
                label="Име на продукт"
                value={row.name}
                onChangeText={value => updateOrderRow(row.id, 'name', value)}
                placeholder="Продукт 1 - артикул"
              />
              <Field
                label="Брой"
                value={row.quantity}
                onChangeText={value => updateOrderRow(row.id, 'quantity', value)}
                placeholder="4"
                keyboardType="numeric"
              />
            </View>
          ))}

          <PreviewList
            items={storeOrders}
            emptyText="Няма създадени поръчки."
            renderText={item =>
              `${item.date} - ${item.products.map(product => `${product.name}: ${product.quantity} бр.`).join(', ')}`
            }
          />
        </AdminSection>
      );
    }

    if (activeSection === 'marketing') {
      return (
        <AdminSection
          title="Маркетингови активности"
          description="Добавяне, разглеждане и подмяна на снимка към маркетингова активност."
          buttonText={isSaving ? 'Запис...' : editingMarketingId ? 'Запази активността' : 'Добави активност'}
          onBack={() => setActiveSection(null)}
          onSubmit={saveMarketingActivity}
        >
          {editingMarketingId ? (
            <EditNotice text="Редактирате избрана маркетингова активност." onCancel={resetMarketingForm} />
          ) : null}

          <Field
            label="Заглавие"
            value={forms.marketing.title}
            onChangeText={value => updateForm('marketing', 'title', value)}
            placeholder="Витрина за сезонни продукти"
          />
          <Field
            label="Снимка или URL"
            value={forms.marketing.image}
            onChangeText={value => updateForm('marketing', 'image', value)}
            placeholder="Изберете файл или поставете URL към снимка"
          />
          <MarketingImagePicker
            image={forms.marketing.image}
            imageName={forms.marketing.imageName}
            onPick={chooseMarketingImage}
            onRemove={removeMarketingImage}
          />
          <Field
            label="Описание"
            value={forms.marketing.description}
            onChangeText={value => updateForm('marketing', 'description', value)}
            placeholder="Описание на визуалната активност"
            multiline
          />
          <MarketingPreviewList
            items={storeMarketingActivities}
            editingMarketingId={editingMarketingId}
            onEdit={startEditMarketingActivity}
            onDelete={deleteMarketingActivity}
          />
        </AdminSection>
      );
    }

    return (
      <View style={[styles.menuGrid, isTablet && styles.tabletMenuGrid]}>
        {sections.map(section => (
          <Pressable
            key={section.id}
            accessibilityRole="button"
            style={({ pressed }) => [
              styles.menuCard,
              isTablet && styles.tabletMenuCard,
              { borderLeftColor: section.color },
              pressed && styles.menuCardPressed,
            ]}
            onPress={() => setActiveSection(section.id)}
          >
            <View style={[styles.menuIcon, { backgroundColor: section.color }]}>
              <Text style={styles.menuIconText}>{section.title[0]}</Text>
            </View>
            <View style={styles.menuText}>
              <Text style={styles.menuTitle}>{section.title}</Text>
              <Text style={styles.menuDescription}>{section.description}</Text>
            </View>
            <Text style={[styles.menuArrow, { color: section.color }]}>{'>'}</Text>
          </Pressable>
        ))}
      </View>
    );
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, isTablet && styles.tabletContent]}
    >
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.title}>Административен панел</Text>
          <Text style={styles.subtitle}>{storeName} - {currentUser.label}</Text>
        </View>
        <Pressable
          accessibilityRole="button"
          style={({ pressed }) => [styles.logoutButton, pressed && styles.logoutButtonPressed]}
          onPress={onLogout}
        >
          <Text style={styles.logoutText}>Изход</Text>
        </Pressable>
      </View>

      {dataError || formError ? (
        <Text style={styles.errorBanner}>{formError || dataError}</Text>
      ) : null}

      {renderActiveSection()}
    </ScrollView>
  );
}

function AdminSection({ title, description, buttonText, onBack, onSubmit, children }) {
  return (
    <View style={styles.section}>
      <Pressable
        accessibilityRole="button"
        style={({ pressed }) => [styles.backButton, pressed && styles.backButtonPressed]}
        onPress={onBack}
      >
        <Text style={styles.backButtonText}>{'< Назад'}</Text>
      </Pressable>

      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.sectionDescription}>{description}</Text>
      <View style={styles.fields}>{children}</View>
      <Pressable
        accessibilityRole="button"
        style={({ pressed }) => [styles.primaryButton, pressed && styles.primaryButtonPressed]}
        onPress={onSubmit}
      >
        <Text style={styles.primaryButtonText}>{buttonText}</Text>
      </Pressable>
    </View>
  );
}

function EditNotice({ text, onCancel }) {
  return (
    <View style={styles.editNotice}>
      <Text style={styles.editNoticeText}>{text}</Text>
      <Pressable
        accessibilityRole="button"
        style={({ pressed }) => [styles.cancelEditButton, pressed && styles.cancelEditButtonPressed]}
        onPress={onCancel}
      >
        <Text style={styles.cancelEditButtonText}>Отказ</Text>
      </Pressable>
    </View>
  );
}

function Field({ label, multiline = false, ...props }) {
  const isDateField = /^\d{1,2}\.\d{1,2}\.\d{4}$/.test(props.placeholder ?? '');

  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      {isDateField ? (
        <DateInput style={styles.input} {...props} />
      ) : (
        <TextInput
          style={[styles.input, multiline && styles.multilineInput]}
          multiline={multiline}
          textAlignVertical={multiline ? 'top' : 'center'}
          {...props}
        />
      )}
    </View>
  );
}

function MarketingImagePicker({ image, imageName, onPick, onRemove }) {
  const canPickFile = Boolean(globalThis.document && globalThis.FileReader);

  return (
    <View style={styles.imagePickerBox}>
      {image ? (
        <Image source={{ uri: image }} style={styles.marketingImagePreview} resizeMode="cover" />
      ) : (
        <View style={styles.emptyImagePreview}>
          <Text style={styles.emptyImageText}>Няма избрана снимка</Text>
        </View>
      )}

      {imageName ? <Text style={styles.imageName}>{imageName}</Text> : null}

      <View style={styles.imageActions}>
        <Pressable
          accessibilityRole="button"
          disabled={!canPickFile}
          style={({ pressed }) => [
            styles.secondaryButton,
            !canPickFile && styles.disabledButton,
            pressed && styles.secondaryButtonPressed,
          ]}
          onPress={onPick}
        >
          <Text style={[styles.secondaryButtonText, !canPickFile && styles.disabledButtonText]}>
            {image ? 'Подмени снимка' : 'Качи снимка'}
          </Text>
        </Pressable>

        {image ? (
          <Pressable
            accessibilityRole="button"
            style={({ pressed }) => [styles.removeButton, pressed && styles.removeButtonPressed]}
            onPress={onRemove}
          >
            <Text style={styles.removeButtonText}>Махни</Text>
          </Pressable>
        ) : null}
      </View>

      {!canPickFile ? (
        <Text style={styles.helperText}>На това устройство може да поставите URL към снимка в полето по-горе.</Text>
      ) : null}
    </View>
  );
}

function ProductPreviewList({ items, editingProductId, onEdit, onDelete }) {
  return (
    <View style={styles.previewBox}>
      <Text style={styles.previewTitle}>Въведени записи</Text>
      {items.length === 0 ? (
        <Text style={styles.emptyText}>Няма въведени продукти.</Text>
      ) : (
        items.map(item => (
          <View key={item.id} style={styles.productPreviewItem}>
            <View style={styles.productPreviewTextBlock}>
              <Text style={styles.productPreviewTitle}>{item.name}</Text>
              {item.date ? <Text style={styles.productPreviewMeta}>Дата: {item.date}</Text> : null}
              <Text style={styles.productPreviewMeta}>{item.quantity} бр.</Text>
            </View>
            <View style={styles.productActions}>
              <ActionButton
                label="Редактирай"
                active={editingProductId === item.id}
                onPress={() => onEdit(item)}
              />
              <DangerButton label="Изтрий" onPress={() => onDelete(item.id)} />
            </View>
          </View>
        ))
      )}
    </View>
  );
}

function MarketingPreviewList({ items, editingMarketingId, onEdit, onDelete }) {
  return (
    <View style={styles.previewBox}>
      <Text style={styles.previewTitle}>Въведени записи</Text>
      {items.length === 0 ? (
        <Text style={styles.emptyText}>Няма въведени маркетингови активности.</Text>
      ) : (
        items.map(item => (
          <View key={item.id} style={styles.marketingPreviewItem}>
            {item.image ? (
              <Image source={{ uri: item.image }} style={styles.marketingPreviewImage} resizeMode="cover" />
            ) : null}
            <View style={styles.productPreviewTextBlock}>
              <Text style={styles.productPreviewTitle}>{item.title}</Text>
              <Text style={styles.previewItem}>{item.description}</Text>
              {item.imageName ? <Text style={styles.productPreviewMeta}>{item.imageName}</Text> : null}
            </View>
            <View style={styles.productActions}>
              <ActionButton
                label="Редактирай"
                active={editingMarketingId === item.id}
                onPress={() => onEdit(item)}
              />
              <DangerButton label="Изтрий" onPress={() => onDelete(item.id)} />
            </View>
          </View>
        ))
      )}
    </View>
  );
}

function PreviewList({ items, emptyText, renderText }) {
  return (
    <View style={styles.previewBox}>
      <Text style={styles.previewTitle}>Въведени записи</Text>
      {items.length === 0 ? (
        <Text style={styles.emptyText}>{emptyText}</Text>
      ) : (
        items.map(item => (
          <Text key={item.id} style={styles.previewItem}>
            {renderText(item)}
          </Text>
        ))
      )}
    </View>
  );
}

function ActionButton({ label, active = false, onPress }) {
  return (
    <Pressable
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.editButton,
        active && styles.editButtonActive,
        pressed && styles.editButtonPressed,
      ]}
      onPress={onPress}
    >
      <Text style={styles.editButtonText}>{label}</Text>
    </Pressable>
  );
}

function DangerButton({ label, onPress }) {
  return (
    <Pressable
      accessibilityRole="button"
      style={({ pressed }) => [styles.deleteButton, pressed && styles.deleteButtonPressed]}
      onPress={onPress}
    >
      <Text style={styles.deleteButtonText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f6f9',
  },
  content: {
    padding: 16,
    gap: 14,
    width: '100%',
    maxWidth: 980,
    alignSelf: 'center',
  },
  tabletContent: {
    paddingHorizontal: 24,
    paddingVertical: 22,
  },
  header: {
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#dce4ec',
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    flexWrap: 'wrap',
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: '#005eb8',
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },
  logoutButton: {
    backgroundColor: '#fee2e2',
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  logoutButtonPressed: {
    transform: [{ scale: 0.98 }],
    backgroundColor: '#fecaca',
  },
  logoutText: {
    color: '#b91c1c',
    fontSize: 15,
    fontWeight: '800',
  },
  errorBanner: {
    backgroundColor: '#fee2e2',
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: 10,
    padding: 12,
    color: '#b91c1c',
    fontWeight: '800',
  },
  menuGrid: {
    gap: 12,
  },
  tabletMenuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  menuCard: {
    minHeight: 88,
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 1,
    borderLeftWidth: 6,
    borderColor: '#dce4ec',
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 1,
  },
  tabletMenuCard: {
    width: '48.7%',
  },
  menuCardPressed: {
    transform: [{ scale: 0.99 }],
    backgroundColor: '#f8fbff',
  },
  menuIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuIconText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '900',
  },
  menuText: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: '#172033',
  },
  menuDescription: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 3,
  },
  menuArrow: {
    fontSize: 20,
    fontWeight: '900',
    marginLeft: 10,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#dce4ec',
    padding: 16,
    elevation: 1,
  },
  backButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#eef6ff',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 14,
  },
  backButtonPressed: {
    transform: [{ scale: 0.98 }],
    backgroundColor: '#dbeafe',
  },
  backButtonText: {
    color: '#005eb8',
    fontWeight: '800',
    fontSize: 15,
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: '900',
    color: '#172033',
  },
  sectionDescription: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },
  editNotice: {
    backgroundColor: '#eef6ff',
    borderWidth: 1,
    borderColor: '#bfdbfe',
    borderRadius: 10,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  editNoticeText: {
    flex: 1,
    color: '#005eb8',
    fontWeight: '800',
    fontSize: 14,
  },
  cancelEditButton: {
    backgroundColor: '#fff',
    borderRadius: 9,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  cancelEditButtonPressed: {
    transform: [{ scale: 0.98 }],
    backgroundColor: '#dbeafe',
  },
  cancelEditButtonText: {
    color: '#005eb8',
    fontWeight: '800',
    fontSize: 13,
  },
  fields: {
    gap: 12,
    marginTop: 14,
  },
  field: {
    gap: 6,
  },
  label: {
    fontSize: 14,
    color: '#334155',
    fontWeight: '700',
  },
  input: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#dce4ec',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 11,
    fontSize: 16,
    color: '#172033',
  },
  multilineInput: {
    minHeight: 82,
  },
  orderRowsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    flexWrap: 'wrap',
  },
  orderRowsTitle: {
    flex: 1,
    fontSize: 15,
    color: '#334155',
    fontWeight: '800',
  },
  orderRowCard: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 12,
    gap: 10,
  },
  orderRowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  orderRowTitle: {
    fontSize: 15,
    color: '#172033',
    fontWeight: '900',
  },
  imagePickerBox: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 12,
    gap: 10,
  },
  marketingImagePreview: {
    width: '100%',
    height: 180,
    borderRadius: 10,
    backgroundColor: '#e2e8f0',
  },
  emptyImagePreview: {
    height: 130,
    borderRadius: 10,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#cbd5e1',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  emptyImageText: {
    color: '#94a3b8',
    fontWeight: '700',
  },
  imageName: {
    color: '#64748b',
    fontSize: 13,
    fontWeight: '700',
  },
  imageActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  helperText: {
    color: '#64748b',
    fontSize: 13,
  },
  secondaryButton: {
    backgroundColor: '#eef6ff',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  secondaryButtonPressed: {
    transform: [{ scale: 0.98 }],
    backgroundColor: '#dbeafe',
  },
  secondaryButtonText: {
    color: '#005eb8',
    fontWeight: '800',
    fontSize: 14,
  },
  disabledButton: {
    backgroundColor: '#f1f5f9',
  },
  disabledButtonText: {
    color: '#94a3b8',
  },
  removeButton: {
    backgroundColor: '#fee2e2',
    borderRadius: 9,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  removeButtonPressed: {
    transform: [{ scale: 0.98 }],
    backgroundColor: '#fecaca',
  },
  removeButtonText: {
    color: '#b91c1c',
    fontWeight: '800',
    fontSize: 13,
  },
  primaryButton: {
    marginTop: 14,
    backgroundColor: '#005eb8',
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: 'center',
  },
  primaryButtonPressed: {
    transform: [{ scale: 0.99 }],
    backgroundColor: '#004f9c',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },
  previewBox: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    padding: 12,
  },
  previewTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#64748b',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  emptyText: {
    color: '#94a3b8',
    fontSize: 14,
  },
  previewItem: {
    color: '#172033',
    fontSize: 14,
    paddingVertical: 3,
  },
  productPreviewItem: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    padding: 12,
    marginTop: 8,
    gap: 10,
  },
  marketingPreviewItem: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    padding: 12,
    marginTop: 8,
    gap: 10,
  },
  marketingPreviewImage: {
    width: '100%',
    height: 150,
    borderRadius: 9,
    backgroundColor: '#e2e8f0',
  },
  productPreviewTextBlock: {
    gap: 3,
  },
  productPreviewTitle: {
    fontSize: 15,
    color: '#172033',
    fontWeight: '800',
  },
  productPreviewMeta: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '700',
  },
  productActions: {
    flexDirection: 'row',
    gap: 8,
  },
  editButton: {
    flex: 1,
    backgroundColor: '#eef6ff',
    borderRadius: 9,
    paddingVertical: 9,
    alignItems: 'center',
  },
  editButtonActive: {
    backgroundColor: '#dbeafe',
  },
  editButtonPressed: {
    transform: [{ scale: 0.98 }],
  },
  editButtonText: {
    color: '#005eb8',
    fontWeight: '800',
    fontSize: 13,
  },
  deleteButton: {
    flex: 1,
    backgroundColor: '#fee2e2',
    borderRadius: 9,
    paddingVertical: 9,
    alignItems: 'center',
  },
  deleteButtonPressed: {
    transform: [{ scale: 0.98 }],
    backgroundColor: '#fecaca',
  },
  deleteButtonText: {
    color: '#b91c1c',
    fontWeight: '800',
    fontSize: 13,
  },
});
