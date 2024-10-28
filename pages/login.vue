<template>
    <v-container class="d-flex justify-center align-center" style="min-height: 100vh;">
        <v-card class="pa-5" elevation="2" style="width: 400px;">
            <v-form @submit.prevent="login" ref="form">
                <v-text-field v-model="email" label="Email" type="email" required :rules="emailRules"
                    class="mb-1"></v-text-field>
                <v-text-field v-model="password" label="Password" type="password" required :rules="passwordRules"
                    class="mb-1"></v-text-field>
                <v-btn type="submit" color="primary" class="mb-2 w-100">Login</v-btn>
                <v-btn text @click="goToRegister" class="w-100">Don't have an account? Register</v-btn>
            </v-form>
        </v-card>
    </v-container>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";

const email = ref("");
const password = ref("");
const router = useRouter();

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

const login = async () => {
    try {
        const isValid =
            emailRules[0](email.value) === true &&
            passwordRules[0](password.value) === true;

        if (!isValid) {
            console.error("Validation failed");
            return;
        }

        const response = await fetch("http://localhost:3001/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email: email.value, password: password.value }),
        });

        const result = await response.json();

        if (response.ok) {
            console.log("Login successful", result.data);
            localStorage.setItem("accessToken", result.data.accessToken);
            localStorage.setItem("refreshToken", result.data.refreshToken);
            router.push("/dashboard");
        } else {
            console.error(result.message || "Login failed");
        }
    } catch (error) {
        console.error("Error during login:", error);
    }
};

const goToRegister = () => {
    router.push("/register");
};
</script>