<template>
  <v-container class="p-5">
    <h2 class="text-center mb-4">Transaction Summary</h2>

    <div class="text-center mb-4">
      <v-btn color="primary" :to="{ path: '/products' }" class="mr-2">View Products</v-btn>
      <v-btn color="secondary" :to="{ path: '/transactions' }">View Transactions</v-btn>
    </div>

    <v-list v-if="transactions.length > 0">
      <v-list-item-group>
        <v-list-item v-for="transaction in transactions" :key="transaction.invoiceNo" class="mb-3">
          <v-card class="list-group-item hover">
            <v-card-title class="font-weight-bold">Transaction #{{ transaction.invoiceNo }}</v-card-title>
            <v-card-subtitle>
              Date: {{ new Date(transaction.date).toLocaleDateString() }}
            </v-card-subtitle>
            <v-card-subtitle>
              Customer: <span class="font-weight-bold">{{ transaction.customer }}</span>
            </v-card-subtitle>
            <v-card-subtitle>
              Total Amount: <span class="font-weight-bold">Rp.{{ transaction.totalPrice.toFixed(2) }}</span>
            </v-card-subtitle>
            <v-card-subtitle class="mt-2">Products:</v-card-subtitle>
            <v-list>
              <v-list-item v-for="product in transaction.products" :key="product.productId">
                <v-list-item-content>
                  <v-list-item-title>{{ product.name }}</v-list-item-title>
                  <v-list-item-subtitle>
                    Quantity: <span class="font-weight-bold">{{ product.quantity }}</span> |
                    Price: Rp.{{ product.price.toFixed(2) }}
                  </v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
            </v-list>
          </v-card>
        </v-list-item>
      </v-list-item-group>
    </v-list>

    <div v-else class="text-center mt-5">
      <p>No transactions have been made.</p>
    </div>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const transactions = ref([]);
const router = useRouter();

const fetchTransactionSummary = async () => {
  const accessToken = localStorage.getItem("accessToken");

  if (!accessToken) {
    router.push('/register');
    return;
  }

  try {
    const response = await fetch('http://localhost:3001/transaction/summary', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    transactions.value = result.data || [];
  } catch (error) {
    console.error("Error fetching transaction summary:", error);
  }
};

onMounted(fetchTransactionSummary);
</script>

<style scoped>
.hover {
  transition: transform 0.2s, box-shadow 0.2s;
}

.hover:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}
</style>
