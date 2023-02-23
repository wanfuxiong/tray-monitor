<script setup lang="ts">
import os from "os";
import { onMounted, reactive, ref } from "vue";
import { ipcRenderer, nativeImage, Notification, Tray } from "electron";
import si from "systeminformation";

const cpuTrayVisible = ref(false);
const ramTrayVisible = ref(false);
const networkTrayVisible = ref(false);

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

const cpuArray = reactive(new Array(14).fill(0));
const ramArray = reactive(new Array(14).fill(0));
const networkArray = reactive(new Array(14).fill(0));

let cpuCanvas;
let ramCanvas;
let networkCanvas;

let lastIdleTime = 0,
    lastTotalTime = 0;

onMounted(() => {
    function getCpuUsage() {
        // const cpus = os.cpus();
        // let idleTime = 0,
        //     totalTime = 0;
        // cpus.forEach((cpu) => {
        //     Object.values(cpu.times).forEach((time) => {
        //         totalTime += time;
        //     });
        //     idleTime += cpu.times.idle;
        // });
        // const idleDifference = idleTime - lastIdleTime;
        // const totalDifference = totalTime - lastTotalTime;
        // // const percentageCpu =
        // //     100 - ~~((100 * idleDifference) / totalDifference);
        // const percentageCpu = 100 - (100 * idleDifference) / totalDifference;
        si.currentLoad().then((data) => {
            const percentageCpu = data.currentLoad;
            state.cpu.usage = percentageCpu + "%";
            cpuArray.shift();
            cpuArray.push(percentageCpu);
            cpuCanvas = document.createElement("canvas");
            cpuCanvas.width = 256;
            cpuCanvas.height = 256;
            const ctx = cpuCanvas.getContext("2d")!;
            ctx.clearRect(0, 0, 256, 256);
            ctx.fillStyle = "#000000";
            ctx.fillRect(0, 0, 256, 256);
            ctx.lineWidth = 32;
            ctx.strokeStyle = "rgba(255,255,255,0.8)";
            ctx.strokeRect(0, 0, 256, 256);
            for (let i = 0; i < ramArray.length; i++) {
                ctx.fillStyle = cpuArray[i] > 60 ? "#ff0000" : "#ffffff";
                ctx.fillRect(
                    16 + i * 16,
                    ((100 - cpuArray[i]) / 100) * 224 + 16,
                    16,
                    (cpuArray[i] / 100) * 224
                );
            }
            ipcRenderer.invoke(
                "cpu",
                cpuTrayVisible.value,
                cpuCanvas.toDataURL("image/png")
            );
            ramCanvas = null;
        });
    }

    function getRamUsage() {
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
        ipcRenderer.invoke(
            "ram",
            ramTrayVisible.value,
            ramCanvas.toDataURL("image/png")
        );
        ramCanvas = null;
    }

    function getNetwork() {
        Promise.all([si.networkStats(), si.networkInterfaces()]).then(
            ([stats, interfaces]) => {
                // console.log(
                //     stats[0].rx_sec,
                //     stats[0].tx_sec,
                //     (interfaces[0].speed * 1024 * 1024) / 8
                // );
                const max = (interfaces[0].speed * 1024 * 1024) / 8;
                const receive = stats[0].rx_sec;
                if (receive || receive === 0) {
                    console.log(receive, max);
                    networkArray.shift();
                    networkArray.push(receive);
                    networkCanvas = document.createElement("canvas");
                    networkCanvas.width = 256;
                    networkCanvas.height = 256;
                    const ctx = networkCanvas.getContext("2d")!;
                    ctx.clearRect(0, 0, 256, 256);
                    ctx.lineWidth = 32;
                    ctx.strokeStyle = "rgba(0,255,0,0.8)";
                    ctx.strokeRect(0, 0, 256, 256);
                    ctx.fillStyle = "rgba(0,255,0,1)";
                    for (let i = 0; i < ramArray.length; i++) {
                        ctx.fillRect(
                            16 + i * 16,
                            ((max - networkArray[i] * 10) / max) * 224 + 16,
                            16,
                            ((networkArray[i] * 10) / max) * 224
                        );
                    }
                    ipcRenderer.invoke(
                        "network",
                        networkTrayVisible.value,
                        networkCanvas.toDataURL("image/png")
                    );
                    ramCanvas = null;
                }

                getNetwork();
            }
        );
    }

    setInterval(() => {
        console.log("开始");
        //cpu
        getCpuUsage();

        // ram
        getRamUsage();

        // disk
    }, 1000);

    // network
    getNetwork();
});
</script>

<template>
    <div>
        <!--<input id="cpu-checkbox" type="checkbox" v-model="cpuTrayVisible" />-->
        <!--<label for="cpu-checkbox">cpu</label>-->
        <!--<input id="ram-checkbox" type="checkbox" v-model="ramTrayVisible" />-->
        <!--<label for="ram-checkbox">ram</label>-->
        <!--<input-->
        <!--    id="network-checkbox"-->
        <!--    type="checkbox"-->
        <!--    v-model="networkTrayVisible"-->
        <!--/>-->
        <!--<label for="network-checkbox">network</label>-->
        <!--<div>{{ cpuTrayVisible }}</div>-->
        <!--<div>{{ ramTrayVisible }}</div>-->
        <!--<div>{{ state.cpu.usage }}</div>-->
        <!--<div>{{ state.ram.used }} / {{ state.ram.total }}</div>-->
    </div>
</template>

<style></style>
