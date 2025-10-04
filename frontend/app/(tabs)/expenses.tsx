import React, { useCallback, useEffect, useState } from 'react';
import { AppState, StyleSheet, Text, View, TextInput, Modal, TouchableOpacity } from 'react-native';
import { Button, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import TransactionList, { Transaction } from '@/components/transactions/TransactionList';
import { importBankSms, uploadTransactions } from '@/utils/smsImporter';

export default function ExpensesScreen() {
  const insets = useSafeAreaInsets();
  const [items, setItems] = useState<Transaction[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [email, setEmail] = useState<string>('');
  const [isEmailModalVisible, setEmailModalVisible] = useState<boolean>(false);
  const [pendingTransactions, setPendingTransactions] = useState<any[]>([]);

  const loadFromSms = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => { if (mounted) await loadFromSms(); })();
    return () => { mounted = false; };
  }, [loadFromSms]);

  useFocusEffect(
    useCallback(() => {
      // Reload whenever the Expenses tab gains focus
      loadFromSms();
    }, [loadFromSms])
  );

  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        // Reload when app returns to foreground
        loadFromSms();
      }
    });
    return () => sub.remove();
  }, [loadFromSms]);

  const handleEmailSubmit = async () => {
    try {
      if (pendingTransactions.length === 0) return;
      
      // Simple email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (email && !emailRegex.test(email)) {
        Alert.alert('Invalid Email', 'Please enter a valid email address or leave it empty.');
        return;
      }

      // Upload transactions with email
      await uploadTransactions(pendingTransactions, email);

      // Map the transactions for display
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

      // Clear pending transactions and close modal
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

      // Store transactions and show email modal
      setPendingTransactions(smsTxns);
      setEmailModalVisible(true);
    } catch (e) {
      console.error('Import error:', e);
      Alert.alert('Import Error', 'Failed to import transactions. Please try again.');
    }
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top + 8 }]}>
      <View style={styles.header}> 
        <Text style={styles.title}>All Expenses</Text>
        <Text style={styles.total}>₹{new Intl.NumberFormat('en-IN').format(total)}</Text>
        <View style={styles.actions}>
          <Button title="Import from SMS" onPress={onImportFromSms} />
        </View>
      </View>
      <View style={{ flex: 1 }}>
        <TransactionList data={items} />
      </View>

      {/* Email Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isEmailModalVisible}
        onRequestClose={() => setEmailModalVisible(false)}
      >
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>Email Notifications</Text>
          <Text style={styles.modalSubtitle}>
            Enter your email to receive transaction notifications (optional)
          </Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="your.email@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.button, styles.buttonCancel]}
              onPress={() => setEmailModalVisible(false)}
            >
              <Text style={styles.buttonText}>Skip</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.buttonSubmit]}
              onPress={handleEmailSubmit}
            >
              <Text style={styles.buttonText}>Submit</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, paddingBottom: 32 },
  header: { marginBottom: 12 },
  title: { fontSize: 18, fontWeight: '700' },
  total: { fontSize: 16, color: '#ef4444', marginTop: 4, fontWeight: '700' },
  actions: { marginBottom: 12 },

  // Modal styles
  modalView: {
    margin: 20,
    marginTop: 'auto',
    marginBottom: 'auto',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 20
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 5
  },
  buttonCancel: {
    backgroundColor: '#e5e7eb'
  },
  buttonSubmit: {
    backgroundColor: '#3b82f6'
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: '600'
  }
});
