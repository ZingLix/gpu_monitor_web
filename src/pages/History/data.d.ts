export interface Response {
    [name: string]: NodeInfo[];
}

export interface NodeInfo {
    name: string;
    stat: GPUStat;
    time: string;
}

export interface GPUStat {
    attached_gpus: string;
    cuda_version: string;
    gpu: GPUInfo[];
}

export interface GPUInfo {
    product_name: string;
    fan_speed: string;
    uuid: string;
    fb_memory_usage: {
        free: string;
        total: string;
        used: string;
    }
    temperature: {
        gpu_temp: string;
    }
    utilization: {
        gpu_util: string;
        memory_util: string;
    }
    processes: {
        process_info: {
            pid: string;
            process_name: string;
            type: string;
            used_memory: string;
            user: string;
        }[];
    }
}