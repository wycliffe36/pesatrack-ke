import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function App() {
  const [amount, setAmount] = useState('');
  const [desc, setDesc] = useState('');
  const [transactions, setTransactions] = useState([]);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const data = await AsyncStorage.getItem('pesatrack');
      if (data) setTransactions(JSON.parse(data));
    } catch(e) {}
  };

  const saveData = async (newTx) => {
    setTransactions(newTx);
    await AsyncStorage.setItem('pesatrack', JSON.stringify(newTx));
  };

  const addTransaction = (type) => {
    if (!amount || isNaN(parseFloat(amount))) {
      Alert.alert('Error', 'Enter valid amount');
      return;
    }
    const newTx = {
      id: Date.now().toString(),
      amount: parseFloat(amount),
      desc: desc.trim() || (type === 'income' ? 'Income' : 'Expense'),
      type,
      date: new Date().toLocaleDateString(),
    };
    saveData([newTx, ...transactions]);
    setAmount(''); setDesc('');
  };

  const deleteTransaction = (id) => {
    Alert.alert('Delete', 'Delete this transaction?', [
      { text: 'Cancel' },
      { text: 'Delete', onPress: () => saveData(transactions.filter(t => t.id !== id)) }
    ]);
  };

  const clearAll = () => {
    Alert.alert('Clear All', 'Delete all transactions?', [
      { text: 'Cancel' },
      { text: 'Yes', onPress: () => saveData([]) }
    ]);
  };

  const income = transactions.filter(t => t.type === 'income').reduce((s,t) => s + t.amount, 0);
  const expense = transactions.filter(t => t.type === 'expense').reduce((s,t) => s + t.amount, 0);
  const balance = income - expense;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>PesaTrack KE 🇰🇪</Text>
      
      <View style={styles.card}>
        <Text style={styles.balanceLabel}>Balance</Text>
        <Text style={styles.balance}>Ksh {balance.toFixed(2)}</Text>
        <View style={styles.summaryRow}>
          <Text style={styles.income}>+ Ksh {income.toFixed(2)}</Text>
          <Text style={styles.expense}>- Ksh {expense.toFixed(2)}</Text>
        </View>
      </View>

      <TextInput style={styles.input} placeholder="Amount (Ksh)" 
        keyboardType="numeric" value={amount} onChangeText={setAmount} />
      <TextInput style={styles.input} placeholder="Description e.g. Lunch, Salary" 
        value={desc} onChangeText={setDesc} />
      
      <View style={styles.btnRow}>
        <TouchableOpacity style={[styles.btn, styles.btnIncome]} onPress={() => addTransaction('income')}>
          <Text style={styles.btnText}>+ Income</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.btn, styles.btnExpense]} onPress={() => addTransaction('expense')}>
          <Text style={styles.btnText}>- Expense</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.listHeader}>
        <Text style={styles.listTitle}>Transactions ({transactions.length})</Text>
        {transactions.length > 0 && (
          <TouchableOpacity onPress={clearAll}>
            <Text style={styles.clear}>Clear All</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList data={transactions}
        keyExtractor={item => item.id}
        ListEmptyComponent={<Text style={styles.empty}>No transactions yet. Add one above.</Text>}
        renderItem={({item}) => (
          <TouchableOpacity style={styles.item} onLongPress={() => deleteTransaction(item.id)}>
            <View>
              <Text style={styles.itemDesc}>{item.desc}</Text>
              <Text style={styles.itemDate}>{item.date}</Text>
            </View>
            <Text style={[styles.itemAmount, item.type === 'income' ? styles.income : styles.expense]}>
              {item.type === 'income' ? '+' : '-'} Ksh {item.amount.toFixed(2)}
            </Text>
          </TouchableOpacity>
        )}
      />
      <Text style={styles.hint}>Long press to delete</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, paddingTop: 50, backgroundColor: '#f5f5f5' },
  title: { fontSize: 26, fontWeight: 'bold', textAlign: 'center', marginBottom: 12 },
  card: { backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 12, elevation: 2 },
  balanceLabel: { textAlign: 'center', color: '#666', fontSize: 14 },
  balance: { textAlign: 'center', fontSize: 28, fontWeight: 'bold', marginVertical: 4 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  income: { color: 'green', fontWeight: '600' },
  expense: { color: 'red', fontWeight: '600' },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd', padding: 12, marginVertical: 5, borderRadius: 8 },
  btnRow: { flexDirection: 'row', gap: 10, marginVertical: 10 },
  btn: { flex: 1, padding: 14, borderRadius: 8, alignItems: 'center' },
  btnIncome: { backgroundColor: '#2e7d32' },
  btnExpense: { backgroundColor: '#c62828' },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  listHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 8 },
  listTitle: { fontSize: 18, fontWeight: 'bold' },
  clear: { color: 'red' },
  item: { backgroundColor: '#fff', padding: 12, borderRadius: 8, marginVertical: 4, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  itemDesc: { fontSize: 16, fontWeight: '500' },
  itemDate: { fontSize: 12, color: '#888' },
  itemAmount: { fontSize: 16, fontWeight: 'bold' },
  empty: { textAlign: 'center', color: '#888', marginTop: 20 },
  hint: { textAlign: 'center', color: '#aaa', fontSize: 12, marginTop: 4 }
});
