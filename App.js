import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, FlatList, SafeAreaView } from 'react-native';

export default function App() {
  const [amount, setAmount] = useState('');
  const [desc, setDesc] = useState('');
  const [transactions, setTransactions] = useState([]);

  const addTransaction = (type) => {
    if (!amount) return;
    const newTx = {
      id: Date.now().toString(),
      amount: parseFloat(amount),
      desc: desc || 'No description',
      type,
    };
    setTransactions([newTx, ...transactions]);
    setAmount('');
    setDesc('');
  };

  const balance = transactions.reduce((sum, t) => 
    t.type === 'income' ? sum + t.amount : sum - t.amount, 0);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>PesaTrack</Text>
      <Text style={styles.balance}>Ksh {balance.toFixed(2)}</Text>
      
      <TextInput style={styles.input} placeholder="Amount" keyboardType="numeric" value={amount} onChangeText={setAmount} />
      <TextInput style={styles.input} placeholder="Description" value={desc} onChangeText={setDesc} />
      
      <View style={styles.row}>
        <TouchableOpacity style={[styles.btn, styles.income]} onPress={() => addTransaction('income')}>
          <Text style={styles.btnText}>+ Income</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.btn, styles.expense]} onPress={() => addTransaction('expense')}>
          <Text style={styles.btnText}>- Expense</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={transactions}
        keyExtractor={item => item.id}
        renderItem={({item}) => (
          <View style={styles.item}>
            <Text>{item.desc}</Text>
            <Text style={{color: item.type === 'income' ? 'green' : 'red'}}>
              {item.type === 'income' ? '+' : '-'} {item.amount}
            </Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginTop: 20 },
  balance: { fontSize: 22, textAlign: 'center', marginVertical: 15 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 12, borderRadius: 8, marginBottom: 10 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  btn: { flex: 1, padding: 15, borderRadius: 8, alignItems: 'center', marginHorizontal: 5 },
  income: { backgroundColor: '#4CAF50' },
  expense: { backgroundColor: '#F44336' },
  btnText: { color: '#fff', fontWeight: 'bold' },
  item: { flexDirection: 'row', justifyContent: 'space-between', padding: 15, borderBottomWidth: 1, borderBottomColor: '#eee' }
});
