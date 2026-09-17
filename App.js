import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function App() {
  const [amount, setAmount] = useState('');
  const [desc, setDesc] = useState('');
  const [transactions, setTransactions] = useState([]);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const data = await AsyncStorage.getItem('pesatrack');
    if (data) setTransactions(JSON.parse(data));
  };

  const saveData = async (newTx) => {
    setTransactions(newTx);
    await AsyncStorage.setItem('pesatrack', JSON.stringify(newTx));
  };

  const addTransaction = (type) => {
    if (!amount) return;
    const newTx = {
      id: Date.now().toString(),
      amount: parseFloat(amount),
      desc: desc || type,
      type,
    };
    saveData([...transactions, newTx]);
    setAmount(''); setDesc('');
  };

  const balance = transactions.reduce((sum, t) => 
    t.type === 'income' ? sum + t.amount : sum - t.amount, 0);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>PesaTrack KE</Text>
      <Text style={styles.balance}>Balance: Ksh {balance}</Text>
      
      <TextInput style={styles.input} placeholder="Amount (Ksh)" 
        keyboardType="numeric" value={amount} onChangeText={setAmount} />
      <TextInput style={styles.input} placeholder="Description" 
        value={desc} onChangeText={setDesc} />
      
      <View style={styles.row}>
        <Button title="Add Income" onPress={() => addTransaction('income')} />
        <Button title="Add Expense" onPress={() => addTransaction('expense')} color="red" />
      </View>

      <FlatList data={transactions}
        keyExtractor={item => item.id}
        renderItem={({item}) => (
          <Text style={styles.item}>
            {item.type === 'income' ? '+' : '-'} Ksh {item.amount} - {item.desc}
          </Text>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 50 },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center' },
  balance: { fontSize: 18, textAlign: 'center', marginVertical: 10 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, marginVertical: 5, borderRadius: 5 },
  row: { flexDirection: 'row', justifyContent: 'space-around', marginVertical: 10 },
  item: { padding: 10, borderBottomWidth: 1, borderBottomColor: '#eee' }
});
