---
title: "重新思考后端架构：从请求驱动到事件驱动"
date: "2026-03-10"
summary: "事件驱动架构如何重塑我们对后端系统的认知，以及在实践中的落地经验。"
---

## 传统后端架构的局限

过去十年，大多数后端系统围绕 **请求-响应** 模式构建。客户端发送请求，服务端处理并返回结果。这个模型简单直观，但在面对现代业务需求时暴露了明显的局限。

## 事件驱动架构的优势

事件驱动架构的核心思想是：**系统状态的变化本身就是一等公民**。

### 解耦

```typescript
// 传统的紧耦合方式
async function createOrder(order: Order) {
  await saveToDatabase(order)
  await sendEmail(order.userId)
  await updateInventory(order.items)
  await notifyAnalytics(order)
  return order
}

// 事件驱动方式
async function createOrder(order: Order) {
  await saveToDatabase(order)
  await publish("order.created", { orderId: order.id })
  return order
}
```

事件的发布者不需要知道有哪些消费者，消费者可以独立演进。

### 异步处理

不是所有操作都需要同步完成：

- 发送订单确认邮件 → 异步
- 更新库存 → 可以异步，但需要最终一致性保障
- 生成报表 → 明显应该是异步的

## 实践中的挑战

事件驱动架构并非没有代价：

| 优势 | 挑战 |
|------|------|
| 服务解耦 | 调试困难（跨越多个服务） |
| 独立演进 | 事件 schema 需要版本管理 |
| 异步处理 | 最终一致性模型复杂 |

### 消息可靠性

至少一次投递 + 消费者幂等，是最务实的组合。

### Schema 演进

事件 schema 应该向后兼容。新增字段不要破坏已有消费者。

## 总结

事件驱动不是银弹，但它为构建可扩展、可演进的系统提供了一个强大的范式。关键在于在适当的场景使用它，而不是为了事件驱动而事件驱动。
