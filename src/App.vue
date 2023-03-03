<script setup lang="ts">
import { onMounted, reactive, ref } from "vue";
import si from "systeminformation";
import { invoke } from "@tauri-apps/api/tauri";

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

function bytesToSize(bytes: number) {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (bytes / Math.pow(k, i)).toFixed(2) + " " + sizes[i];
    //toPrecision(3) 后面保留两位小数，如1.00GB
}

onMounted(() => {
    function getRamUsage() {
        si.mem().then((data) => {
            const usedRam = data.used;
            const totalRam = data.total;
            state.ram.used = bytesToSize(usedRam);
            state.ram.total = bytesToSize(totalRam);
            ramArray.shift();
            ramArray.push(usedRam);
            const ctx = ramCanvas.value!.getContext("2d")!;
            ctx.clearRect(0, 0, 256, 256);
            ctx.lineWidth = 32;
            ctx.strokeStyle = "rgba(127,127,255,0.8)";
            ctx.strokeRect(0, 0, 256, 256);
            ctx.fillStyle = "rgba(127,127,255,1)";
            for (let i = 0; i < ramArray.length; i++) {
                ctx.fillRect(
                    16 + i * 16,
                    ((totalRam - ramArray[i]) / totalRam) * 224 + 16,
                    16,
                    (ramArray[i] / totalRam) * 224
                );
            }
            // invoke("ram", { image: ramCanvas.value!.toDataURL("image/png") });
        });
    }

    setInterval(() => {
        console.log("开始");
        //cpu
        // getCpuUsage();
        // ram
        getRamUsage();
        // disk
    }, 1000);
    // network
    // getNetwork();
});
</script>

<template>
    <div class="container">
        <!--<canvas ref="cpuCanvas" width="256" height="256"></canvas>-->
        <!--<div>{{ state.ram.used }} / {{ state.ram.total }}</div>-->
        <canvas
            ref="ramCanvas"
            width="256"
            height="256"
            style="background: red"
        ></canvas>
    </div>
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
