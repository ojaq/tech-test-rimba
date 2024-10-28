<template>
    <v-container class="mt-5">
        <h2 class="text-center mb-4">Create Product</h2>

        <div class="text-center mb-4">
            <v-btn class="text-white" color="orange" @click="goBack">Back</v-btn>
        </div>

        <v-form @submit.prevent="createProduct" class="mb-5">
            <v-text-field v-model="newProductCode" label="Product Code" required></v-text-field>
            <v-text-field v-model="newProductName" label="Product Name" required></v-text-field>
            <v-text-field v-model.number="newProductPrice" label="Price in IDR" type="number" required></v-text-field>
            <v-text-field v-model.number="newProductStock" label="Stock" type="number" required></v-text-field>
            <v-btn type="submit" color="primary">Add Product</v-btn>
        </v-form>

        <h2 class="text-center mb-4">Product List</h2>
        <div v-if="products.length === 0" class="text-center mb-4">
            <p>No products have been added yet.</p>
        </div>

        <v-list v-if="products.length">
            <v-list-item-group>
                <v-list-item v-for="product in products" :key="product.id" class="mb-3">
                    <v-card class="p-3 hover">
                        <v-list-item-content>
                            <v-list-item-title class="font-weight-bold">{{ product.name }}</v-list-item-title>
                            <v-list-item-subtitle>
                                Price: Rp.{{ product.price }} | Stock: {{ product.stock }} | Product Code: {{
                                    product.productCode }}
                            </v-list-item-subtitle>
                        </v-list-item-content>
                    </v-card>
                </v-list-item>
            </v-list-item-group>
        </v-list>
    </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const newProductName = ref('');
const newProductCode = ref('');
const newProductPrice = ref(0);
const newProductStock = ref(0);
const products = ref([]);
const router = useRouter();

const fetchProducts = async () => {
    const accessToken = localStorage.getItem("accessToken");

    if (!accessToken) {
        router.push('/register');
        return;
    }

    try {
        const response = await fetch('http://localhost:3001/product', {
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("accessToken")}`,
            },
        });
        const result = await response.json();
        if (response.ok && result.success) {
            products.value = result.data;
        } else {
            error.value = result.message || "Failed to load products.";
        }
    } catch (error) {
        console.error('Error fetching products:', error);
    }
};

const createProduct = async () => {
    try {
        const response = await fetch('http://localhost:3001/product', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                "Authorization": `Bearer ${localStorage.getItem("accessToken")}`,
            },
            body: JSON.stringify({
                productCode: newProductCode.value,
                name: newProductName.value,
                price: newProductPrice.value,
                stock: newProductStock.value,
            }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const newProduct = await response.json();
        products.value.push(newProduct);

        newProductName.value = '';
        newProductCode.value = '';
        newProductPrice.value = 0;
        newProductStock.value = 0;
        await fetchProducts()
    } catch (error) {
        console.error('Error creating product:', error);
        error.value = 'Failed to create product.';
    }
};

const goBack = () => {
    router.go(-1);
};

onMounted(fetchProducts);
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
