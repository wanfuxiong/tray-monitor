export function bytesToSize(bytes: number) {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (bytes / Math.pow(k, i)).toFixed(2) + " " + sizes[i];
    //toPrecision(3) 后面保留两位小数，如1.00GB
}

export function drawTrayIcon(
    ctx: CanvasRenderingContext2D,
    color: {
        fillColor: string;
        borderColor: string;
        backgroundColor?: string;
        warnColor?: string;
    },
    maxValue: number,
    array: Array<number>,
    warnValue?: number
) {
    color.backgroundColor || (color.backgroundColor = "rgba(0,0,0,0)");
    ctx.clearRect(0, 0, 256, 256);
    // 画背景
    ctx.fillStyle = color.backgroundColor;
    ctx.fillRect(0, 0, 256, 256);
    // 画边框
    ctx.lineWidth = 32;
    ctx.strokeStyle = color.borderColor;
    ctx.strokeRect(0, 0, 256, 256);
    // 画里面
    for (let i = 0; i < 14; i++) {
        if (warnValue && color.warnColor && array[i] > warnValue) {
            ctx.fillStyle = color.warnColor;
        } else {
            ctx.fillStyle = color.fillColor;
        }
        ctx.fillRect(
            16 + i * 16,
            ((maxValue - array[i]) / maxValue) * 224 + 16,
            16,
            (array[i] / maxValue) * 224
        );
    }
}
