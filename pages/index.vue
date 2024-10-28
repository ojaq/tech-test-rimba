<template>
    <v-container>
        <nuxt-link to="/login">Login</nuxt-link>
        <nuxt-link to="/register">Register</nuxt-link>
    </v-container>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { onMounted } from 'vue';

const router = useRouter();

onMounted(() => {
    router.replace('/register');
});
</script>