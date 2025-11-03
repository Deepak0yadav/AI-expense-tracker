import React, { useCallback, useEffect, useState } from 'react';
import { AppState, StyleSheet, Text, View, TextInput, Modal, TouchableOpacity, ScrollView, RefreshControl, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { importBankSms, uploadTransactions } from '@/utils/smsImporter';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

type Transaction = {
  _id: string;
  amount: number;
  merchant?: string;
  category?: string;
  date?: string;
  mode?: string;
};

export default function ExpensesScreen() {
  const insets = useSafeAreaInsets();
  const [items, setItems] = useState<Transaction[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [email, setEmail] = useState<string>('');
  const [isEmailModalVisible, setEmailModalVisible] = useState<boolean>(false);
  const [pendingTransactions, setPendingTransactions] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadFromSms = useCallback(async () => {
    setRefreshing(true);
    try {
      const smsTxns = await importBankSms(500);
      const mapped: Transaction[] = smsTxns.map((t, idx) => ({
        _id: `${t.date || 'nodate'}-${t.merchant}-${t.amount}-${idx}`,
        amount: t.amount,
        merchant: t.merchant,
        category: t.amount < 0 ? 'Expense' : 'Income',
        date: t.date,
        mode: t.mode,
      }));
      const expenses = mapped.filter((t) => t.amount < 0);
      setItems(expenses);
      setTotal(expenses.reduce((sum, t) => sum + Math.abs(t.amount), 0));
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => { if (mounted) await loadFromSms(); })();
    return () => { mounted = false; };
  }, [loadFromSms]);

  useFocusEffect(useCallback(() => { loadFromSms(); }, [loadFromSms]));
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') loadFromSms();
    });
    return () => sub.remove();
  }, [loadFromSms]);

  const handleEmailSubmit = async () => {
    try {
      if (pendingTransactions.length === 0) return;
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (email && !emailRegex.test(email)) {
        Alert.alert('Invalid Email', 'Please enter a valid email address or leave it empty.');
        return;
      }
      await uploadTransactions(pendingTransactions, email);
      const mapped: Transaction[] = pendingTransactions.map((t, idx) => ({
        _id: `${t.date || 'nodate'}-${t.merchant}-${t.amount}-${idx}`,
        amount: t.amount,
        merchant: t.merchant,
        category: t.amount < 0 ? 'Expense' : 'Income',
        date: t.date,
        mode: t.mode,
      }));
      const expenses = mapped.filter((t) => t.amount < 0);
      setItems(expenses);
      setTotal(expenses.reduce((sum, t) => sum + Math.abs(t.amount), 0));
      setPendingTransactions([]);
      setEmailModalVisible(false);
      Alert.alert('Success', `Uploaded ${expenses.length} expenses.${email ? '\nNotifications will be sent to ' + email : ''}`);
    } catch (e) {
      console.error('Upload error:', e);
      Alert.alert('Upload Error', 'Failed to upload transactions. Please try again.');
    }
  };

  async function onImportFromSms() {
    try {
      const smsTxns = await importBankSms(500);
      if (!smsTxns.length) {
        Alert.alert('Import from SMS', 'No bank messages found or permission denied.');
        return;
      }
      setPendingTransactions(smsTxns);
      setEmailModalVisible(true);
    } catch (e) {
      console.error('Import error:', e);
      Alert.alert('Import Error', 'Failed to import transactions. Please try again.');
    }
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadFromSms} />}>
        <View style={styles.header}>
          <Text style={styles.title}>Expenses</Text>
          <View style={styles.totalCard}>
            <Text style={styles.totalLabel}>Total Expenses</Text>
            <Text style={styles.totalAmount}>-{formatINR(total)}</Text>
          </View>
          <TouchableOpacity style={styles.importButton} onPress={onImportFromSms}>
            <MaterialIcons name="upload" size={20} color="#fff" />
            <Text style={styles.importButtonText}>Import from SMS</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.transactionsCard}>
          {items.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialIcons name="inbox" size={48} color="#d1d5db" />
              <Text style={styles.emptyText}>No expense transactions yet</Text>
              <Text style={styles.emptySubtext}>Pull down to refresh or import from SMS</Text>
            </View>
          ) : (
            items.map((item, index) => (
              <React.Fragment key={item._id}>
                {index > 0 && <View style={styles.divider} />}
                <TransactionRow item={item} />
              </React.Fragment>
            ))
          )}
        </View>
      </ScrollView>
      <Modal animationType="slide" transparent={true} visible={isEmailModalVisible} onRequestClose={() => setEmailModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Email Notifications</Text>
            <Text style={styles.modalSubtitle}>Enter your email to receive transaction notifications (optional)</Text>
            <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="your.email@example.com" keyboardType="email-address" autoCapitalize="none" />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.button, styles.buttonCancel]} onPress={() => setEmailModalVisible(false)}>
                <Text style={styles.buttonCancelText}>Skip</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.button, styles.buttonSubmit]} onPress={handleEmailSubmit}>
                <Text style={styles.buttonText}>Submit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function TransactionRow({ item }: { item: Transaction }) {
  const amount = Math.abs(item.amount);
  return (
    <View style={styles.txRow}>
      <View style={styles.txBadge}>
        <MaterialIcons name="trending-down" color="#ef4444" size={20} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.txTitle}>{item.merchant || 'Unknown'}</Text>
        <Text style={styles.txSub}>{formatDate(item.date)}  {item.mode || 'N/A'}</Text>
      </View>
      <Text style={styles.txAmount}>-{formatINR(amount)}</Text>
    </View>
  );
}

function formatINR(n?: number) {
  if (typeof n !== 'number' || Number.isNaN(n)) return '0';
  return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(n);
}

function formatDate(iso?: string) {
  if (!iso) return '';
  try { const d = new Date(iso); return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }); } catch { return ''; }
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  scrollView: { flex: 1 },
  content: { padding: 20, paddingBottom: 100 },
  header: { marginBottom: 24 },
  title: { fontSize: 28, fontWeight: '800', color: '#111827', marginBottom: 16 },
  totalCard: { backgroundColor: '#fee2e2', borderRadius: 12, padding: 16, borderLeftWidth: 4, borderLeftColor: '#ef4444', marginBottom: 12 },
  totalLabel: { fontSize: 12, color: '#991b1b', fontWeight: '600', marginBottom: 4, textTransform: 'uppercase' },
  totalAmount: { fontSize: 28, fontWeight: '800', color: '#ef4444' },
  importButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#2563eb', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 10, gap: 8, shadowColor: '#2563eb', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 6, elevation: 3 },
  importButtonText: { fontSize: 14, fontWeight: '700', color: '#fff' },
  transactionsCard: { backgroundColor: '#fff', borderRadius: 12, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  emptyState: { alignItems: 'center', paddingVertical: 40 },
  emptyText: { fontSize: 16, fontWeight: '600', color: '#6b7280', marginTop: 12 },
  emptySubtext: { fontSize: 14, color: '#9ca3af', marginTop: 4 },
  txRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  txBadge: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#fee2e2', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  txTitle: { fontSize: 15, fontWeight: '700', color: '#111827', marginBottom: 2 },
  txSub: { fontSize: 12, color: '#6b7280' },
  txAmount: { fontSize: 16, fontWeight: '800', color: '#ef4444' },
  divider: { height: 1, backgroundColor: '#e5e7eb' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalView: { margin: 20, backgroundColor: 'white', borderRadius: 16, padding: 24, width: '90%', maxWidth: 400, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 8, elevation: 5 },
  modalTitle: { fontSize: 20, fontWeight: '800', marginBottom: 8, color: '#111827' },
  modalSubtitle: { fontSize: 14, color: '#6b7280', marginBottom: 20 },
  input: { height: 48, borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 10, paddingHorizontal: 16, marginBottom: 20, fontSize: 15, backgroundColor: '#f9fafb' },
  modalButtons: { flexDirection: 'row', gap: 12 },
  button: { flex: 1, paddingVertical: 14, borderRadius: 10, alignItems: 'center' },
  buttonCancel: { backgroundColor: '#f3f4f6' },
  buttonSubmit: { backgroundColor: '#2563eb' },
  buttonCancelText: { color: '#374151', fontSize: 15, fontWeight: '600' },
  buttonText: { color: 'white', fontSize: 15, fontWeight: '700' },
});
