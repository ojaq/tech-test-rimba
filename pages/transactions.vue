<template>
    <v-container class="mt-5">
        <h2 class="text-center mb-4">Create Transaction</h2>

        <div class="text-center mb-4">
            <v-btn class="text-white" color="orange" @click="goBack">Back</v-btn>
        </div>

        <v-form @submit.prevent="createTransaction" class="mb-5">
            <v-text-field v-model="transactionCustomer" label="Customer Name" required
                :rules="[v => !!v || 'Customer name is required']">
            </v-text-field>
            <v-text-field v-model="transactionDate" label="Date" type="date" required>
            </v-text-field>
            <v-text-field v-model="transactionProduct" label="Product Code" required>
            </v-text-field>
            <v-text-field v-model="transactionQuantity" label="Quantity" type="number" required
                :rules="[v => v > 0 || 'Quantity must be greater than 0']">
            </v-text-field>
            <v-btn type="submit" color="primary">Add Transaction</v-btn>
        </v-form>

        <h2 class="text-center mb-4">Transaction List</h2>
        <v-list v-if="transactions.length">
            <v-list-item-group>
                <v-list-item v-for="transaction in transactions" :key="transaction.id" class="mb-3">
                    <v-card class="p-3">
                        <v-list-item-content>
                            <v-list-item-title>Transaction #{{ transaction.invoiceNo }}</v-list-item-title>
                            <v-list-item-subtitle>Customer: {{ transaction.customer }}</v-list-item-subtitle>
                            <v-list-item-subtitle>Date: {{ transaction.date }}</v-list-item-subtitle>
                            <v-list-item-action>
                                <v-btn color="red" @click="confirmDelete(transaction.id)">Delete</v-btn>
                            </v-list-item-action>
                        </v-list-item-content>
                    </v-card>
                </v-list-item>
            </v-list-item-group>
        </v-list>

        <v-dialog v-model="confirmDialog" max-width="400">
            <v-card>
                <v-card-title class="text-h6">Confirm Deletion</v-card-title>
                <v-card-text>Are you sure you want to delete this transaction?</v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="grey" @click="confirmDialog = false">Cancel</v-btn>
                    <v-btn color="red" @click="deleteTransaction(confirmedDeleteId)">Delete</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const transactionCustomer = ref('');
const transactionDate = ref('');
const transactionProduct = ref('');
const transactionQuantity = ref(0);
const transactions = ref([]);
const confirmDialog = ref(false);
const confirmedDeleteId = ref(null);
const router = useRouter();

const fetchTransactions = async () => {
    const accessToken = localStorage.getItem("accessToken");

    if (!accessToken) {
        router.push('/register');
        return;
    }

    try {
        const response = await fetch(`http://${import.meta.env.VITE_API_URL}/transaction`, {
            headers: { "Authorization": `Bearer ${localStorage.getItem("accessToken")}` },
        });
        const result = await response.json();
        if (response.ok && result.success) {
            transactions.value = result.data;
        } else {
            error.value = result.message || "Failed to load transactions.";
        }
    } catch (err) {
        console.error('Error fetching transactions:', err);
    }
};

const createTransaction = async () => {
    try {
        const response = await fetch('http://${import.meta.env.VITE_API_URL}/transaction', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                "Authorization": `Bearer ${localStorage.getItem("accessToken")}`,
            },
            body: JSON.stringify({
                customer: transactionCustomer.value,
                products: [
                    {
                        productCode: transactionProduct.value,
                        quantity: transactionQuantity.value
                    }
                ],
                date: transactionDate.value,
            }),
        });

        const newTransaction = await response.json();

        if (!response.ok || !newTransaction.success) {
            throw new Error(newTransaction.message || `HTTP error! status: ${response.status}`);
        }

        transactions.value.push(newTransaction.data);
        resetForm();
        await fetchTransactions();
    } catch (err) {
        console.error('Error creating transaction:', err);
    }
};

const resetForm = () => {
    transactionCustomer.value = '';
    transactionDate.value = '';
    transactionProduct.value = '';
    transactionQuantity.value = 0;
};

const confirmDelete = (id) => {
    confirmedDeleteId.value = id;
    confirmDialog.value = true;
};

const deleteTransaction = async (id) => {
    try {
        const response = await fetch(`http://${import.meta.env.VITE_API_URL}/transaction/${id}`, {
            method: 'DELETE',
            headers: { "Authorization": `Bearer ${localStorage.getItem("accessToken")}` },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        transactions.value = transactions.value.filter(transaction => transaction.id !== id);
        confirmDialog.value = false;
    } catch (err) {
        console.error('Error deleting transaction:', err);
    }
};

const goBack = () => {
    router.go(-1);
};

onMounted(fetchTransactions);
</script>

<style scoped>
.v-card {
    transition: transform 0.2s, box-shadow 0.2s;
}

.v-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}
</style>
