<template>
    <v-container class="d-flex justify-center align-center" style="min-height: 100vh;">
        <v-card class="pa-5" elevation="2" style="width: 400px;">
            <v-form @submit.prevent="register" ref="form">
                <v-text-field v-model="name" label="Name" required :rules="nameRules" class="mb-1"></v-text-field>
                <v-text-field v-model="email" label="Email" type="email" required :rules="emailRules"
                    class="mb-1"></v-text-field>
                <v-text-field v-model="password" label="Password" type="password" required :rules="passwordRules"
                    class="mb-1"></v-text-field>
                <v-text-field v-model="phoneNumber" label="Phone Number""
                    class=" mb-1"></v-text-field>
                <v-btn type="submit" color="primary" class="mb-2 w-100">Register</v-btn>
                <v-btn text @click="goToLogin" class="w-100">Already have an account? Login</v-btn>
            </v-form>
        </v-card>
    </v-container>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const name = ref('');
const email = ref('');
const password = ref('');
const phoneNumber = ref('');
const router = useRouter();

const nameRules = [(value) => !!value || 'Name is required'];
const emailRules = [
    (value) => !!value || 'Email is required',
    (value) => {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailPattern.test(value) || 'Invalid email format';
    },
];
const passwordRules = [
    (value) => !!value || 'Password is required',
    (value) => (value && value.length >= 8) || 'Password must be at least 8 characters',
];

const register = async () => {
    try {
        const isValid =
            nameRules[0](name.value) === true &&
            emailRules[0](email.value) === true &&
            passwordRules[0](password.value) === true;

        if (!isValid) {
            console.error("Validation failed");
            return;
        }

        const response = await fetch("http://localhost:3001/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                name: name.value,
                email: email.value,
                password: password.value,
                phoneNumber: phoneNumber.value,
            }),
        });

        const result = await response.json();

        if (response.status === 201) {
            console.log("Registration successful", result.data);
            router.push("/login");
        } else {
            console.error(result.message || "Registration failed");
        }
    } catch (error) {
        console.error("Error during registration:", error);
    }
};

const goToLogin = () => {
    router.push("/login");
};
</script>