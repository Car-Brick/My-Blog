---
title: "Project Gamma"
tags: "Observability · Rust"
summary: "高性能分布式链路追踪系统，基于 eBPF 实现零侵入式数据采集，支持百万级 spans/秒吞吐量。"
---

## 动机

在迁移到微服务架构后，我们发现现有的链路追踪方案存在两个核心问题：

1. **性能开销**：SDK 注入方式带来了不可忽视的延迟
2. **覆盖不全**：第三方组件和数据库调用经常遗漏

## 技术方案

### eBPF 零侵入采集

通过在 Linux 内核层面挂钩网络系统调用，实现对 HTTP/gRPC 流量的自动追踪。

### 高性能处理管道

```rust
pub struct SpanProcessor {
    buffer: RingBuffer<Span>,
    exporter: GrpcExporter,
}

impl SpanProcessor {
    pub async fn process(&mut self) -> Result<()> {
        while let Some(span) = self.buffer.pop() {
            self.exporter.export(span).await?;
        }
        Ok(())
    }
}
```

## 性能数据

| 指标 | 数值 |
|------|------|
| 采集吞吐量 | 1.2M spans/秒 |
| CPU 开销 | < 1% |
| 内存占用 | < 200MB |
| P99 延迟影响 | < 0.5ms |

## 开源

项目已开源在 GitHub，累计获得 2k+ stars。
