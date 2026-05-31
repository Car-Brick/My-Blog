---
title: "Project Beta"
tags: "AI Infrastructure · Python"
summary: "面向大模型训练与推理的统一资源调度层，实现 GPU 资源的细粒度分配与任务优先级管理。"
---

## 背景

随着团队内部大模型训练需求的增长，GPU 资源的管理成为一个瓶颈。我们需要一个统一的资源调度层来管理跨多个集群的 GPU 资源。

## 核心能力

### GPU 资源池化

```python
class GPUResourcePool:
    def __init__(self, clusters: list[Cluster]):
        self.clusters = clusters

    def allocate(
        self, gpu_type: str, count: int, priority: Priority
    ) -> Allocation:
        # 跨集群细粒度 GPU 分配
        ...
```

### 任务优先级管理

- **Critical**：训练中的大模型作业，必须保证资源
- **High**：推理服务，需要低延迟
- **Normal**：实验性训练，可被抢占
- **Low**：离线评估任务，利用空闲资源

## 技术实现

- 基于 **Kubernetes** 的调度器扩展，自定义调度策略
- GPU 拓扑感知调度，优先分配同一 NVLink 域内的 GPU
- 支持 **Fractional GPU** 分配，提高小任务的资源利用率

## 效果

GPU 整体利用率从 35% 提升至 72%，训练作业平均排队时间减少 60%。
