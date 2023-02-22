<script setup lang="ts">
import os from "os";
import { onMounted, reactive, ref } from "vue";
import { ipcRenderer, nativeImage, Notification, Tray } from "electron";

const state = reactive({
    cpu: {
        usage: "",
    },
    ram: {
        used: "0",
        total: "0",
    },
});

function bytesToSize(bytes: number) {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (bytes / Math.pow(k, i)).toFixed(2) + " " + sizes[i];
    //toPrecision(3) 后面保留两位小数，如1.00GB
}

const ramArray = reactive(new Array(14).fill(0));

let ramCanvas;

onMounted(() => {
    setInterval(() => {
        //cpu

        // ram
        const usedRam = os.totalmem() - os.freemem();
        const totalRam = os.totalmem();
        state.ram.used = bytesToSize(usedRam);
        state.ram.total = bytesToSize(totalRam);
        ramArray.shift();
        ramArray.push(usedRam);
        ramCanvas = document.createElement("canvas");
        ramCanvas.width = 256;
        ramCanvas.height = 256;
        const ctx = ramCanvas.getContext("2d")!;
        ctx.clearRect(0, 0, 256, 256);
        ctx.lineWidth = 32;
        ctx.strokeStyle = "#494968";
        ctx.strokeRect(0, 0, 256, 256);
        ctx.fillStyle = "#7777ff";
        for (let i = 0; i < ramArray.length; i++) {
            ctx.fillRect(
                16 + i * 16,
                ((totalRam - ramArray[i]) / totalRam) * 224 + 16,
                16,
                (ramArray[i] / totalRam) * 224
            );
        }
        ipcRenderer.invoke("ram", ramCanvas.toDataURL("image/png"));
        ramCanvas = null;

        // network

        // disk
    }, 1000);
});
</script>

<template>
    <div>
        <div>{{ state.cpu.usage }}</div>
        <div>{{ state.ram.used }} / {{ state.ram.total }}</div>
    </div>
</template>

<style></style>
