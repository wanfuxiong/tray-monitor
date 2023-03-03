<script setup lang="ts">
import { ref } from "vue";
import { invoke } from "@tauri-apps/api/tauri";

// greetMsg.value = await invoke("greet", { name: name.value });
</script>

<template>
    <div class="container"></div>
</template>

<style scoped>
.container {
    width: 100vw;
    height: 100vh;
    background: white;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
}
</style>
