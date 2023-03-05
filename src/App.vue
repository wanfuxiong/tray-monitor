<script setup lang="ts">
import { onMounted, reactive, ref } from "vue";
import { invoke } from "@tauri-apps/api/tauri";
import { drawTrayIcon } from "./utils";

const cpuCanvas = ref<HTMLCanvasElement>();
const ramCanvas = ref<HTMLCanvasElement>();
const networkCanvas = ref<HTMLCanvasElement>();

const state = reactive({
    cpu: {
        usage: "",
    },
    ram: {
        used: "0",
        total: "0",
    },
});

const cpuArray = reactive(new Array(14).fill(0));
const ramArray = reactive(new Array(14).fill(0));
const networkArray = reactive(new Array(14).fill(0));

onMounted(() => {
    function getCpuUsage() {
        cpuArray.shift();
        cpuArray.push(Math.random() * 100);
        drawTrayIcon(
            cpuCanvas.value!.getContext("2d")!,
            {
                fillColor: "rgba(255,255,255,1)",
                borderColor: "rgba(255,255,255,0.6)",
                backgroundColor: "rgba(0,0,0,1)",
                warnColor: "rgba(255,0,0,1)",
            },
            100,
            cpuArray,
            60
        );
    }

    function getRamUsage() {
        ramArray.shift();
        ramArray.push(Math.random() * 100);
        drawTrayIcon(
            ramCanvas.value!.getContext("2d")!,
            {
                fillColor: "rgba(127,127,255,1)",
                borderColor: "rgba(127,127,255,0.6)",
            },
            100,
            ramArray
        );
    }

    function getNetworkUsage() {
        networkArray.shift();
        networkArray.push(Math.random() * 100);
        drawTrayIcon(
            networkCanvas.value!.getContext("2d")!,
            {
                fillColor: "rgba(0,255,0,1)",
                borderColor: "rgba(0,255,0,0.6)",
            },
            100,
            networkArray
        );
    }

    function getUsage() {
        //cpu
        getCpuUsage();

        // ram
        getRamUsage();

        // disk
        getNetworkUsage();

        return getUsage;
    }

    setInterval(getUsage(), 1000);
});
</script>

<template>
    <div class="container">
        <!--<canvas ref="cpuCanvas" width="256" height="256"></canvas>-->
        <!--<div>{{ state.ram.used }} / {{ state.ram.total }}</div>-->
        <canvas
            ref="cpuCanvas"
            width="256"
            height="256"
            style="width: 16px"
        ></canvas>
        <canvas
            ref="ramCanvas"
            width="256"
            height="256"
            style="width: 16px"
        ></canvas>
        <canvas
            ref="networkCanvas"
            width="256"
            height="256"
            style="width: 16px"
        ></canvas>
    </div>
</template>

<style scoped>
.container {
    width: 100vw;
    height: 100vh;
    background: transparent;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
}
</style>
