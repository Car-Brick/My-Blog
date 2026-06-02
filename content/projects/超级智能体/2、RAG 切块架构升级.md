---
title: RAG 切块架构升级
summary: 设计父子块拆分架构与组合式切块引擎，集成结构化、递归、语义、LLM 智能四种切块策略实现文档自适应切分，通过子块检索+父块补全上下文大幅提升检索语义完整性
date: 2026-06-02
tags:
  - RAG
  - 架构
  - 父子块
  - 切块策略
---

# RAG 父子块拆分架构与组合式切块引擎

设计父子块拆分架构与组合式切块引擎，集成结构化、递归、语义、LLM 智能四种切块策略，实现文档自适应切分；通过子块检索 + 父块补全上下文，大幅提升检索语义完整性，保障知识库数据质量。

---

## 一、架构全景

### 文档上传 → 异步处理管道

1. 解析文档 (Tika)
2. 结构提取 (DocumentLineClassifier)
3. 策略推荐 (recommendStrategy)
4. 用户确认策略
5. 执行双管道切块（父管道 + 子管道）
6. 持久化父块 & 子块 → MySQL
7. 向量化子块 → PGVector / 关键词索引子块 → Elasticsearch

### 对话检索时

```
用户问题 → Vector/Keyword 双通道检索子块
         → RRF 融合
         → elevateToParentBlocks() 补全上下文
         → Rerank
         → 送入 LLM 生成
```

核心设计理念：子块负责精准检索（~800字符），父块负责语义完整性（~2200字符）。子块小，容易被向量检索精准命中；父块大，提供足够上下文供 LLM 理解。

---

## 二、核心数据模型

| 模型                                | 数据库表                                  | 说明                                                      |
| --------------------------------- | ------------------------------------- | ------------------------------------------------------- |
| `SuperAgentDocumentParentBlock`   | `super_agent_document_parent_block`   | 父块，大语义单元，记录 start_chunk_no / end_chunk_no / child_count |
| `SuperAgentDocumentChunk`         | `super_agent_document_chunk`          | 子块，小可检索单元，外键 parent_block_id 关联父块                       |
| `SuperAgentDocumentStructureNode` | `super_agent_document_structure_node` | 文档结构节点（章节/步骤/列表项），驱动结构切分                                |
| `SuperAgentDocumentStrategyPlan`  | `super_agent_document_strategy_plan`  | 切块策略计划（版本号、快照、状态）                                       |
| `SuperAgentDocumentStrategyStep`  | `super_agent_document_strategy_step`  | 策略步骤，字段 pipeline_type / strategy_type / strategy_role   |
| `ChunkCandidate`                  | 内存模型                                  | 管道中间块候选（section_path、text、source_type）                  |
| `ParentBlockCandidate`            | 内存模型                                  | 父块候选 = 父文本 + `List<ChunkCandidate>`                     |

关键关系：

- `SuperAgentDocumentChunk.parent_block_id` → `SuperAgentDocumentParentBlock.id`
- `strategy_type` 枚举：`STRUCTURE(1)` / `RECURSIVE(2)` / `SEMANTIC(3)` / `LLM(4)`
- `strategy_role` 枚举：`PRIMARY` / `OPTIMIZE` / `FALLBACK` / `ENHANCE`

---

## 三、四种切块策略详解

全部实现在 `DocumentStrategyServiceImpl`，通过策略链模式组合执行。

### 策略 A：结构切分 (STRUCTURE)

```
文档文本 → DocumentLineClassifier 逐行检测标题
  ├─ 检测到标题 → 刷新当前块，新建块
  ├─ 维护标题栈 → 构建 section_path（如 "第一章 > 第2节"）
  └─ 支持 8 种标题格式:
        Markdown #、数字 1.2.3、中文章节"第一章"、
        中文大纲"一、"、显式步骤"步骤1"、附录、简述数字、列表标记
```

父管道基于 `DocumentStructureNode` 树的层次关系构建父种子块，保证父块覆盖完整章节。

适用场景：结构化文档（PDF、Word、Markdown），有清晰的层级标题。

### 策略 B：递归切分 (RECURSIVE)

尝试多种分割符，逐级回退：

1. 按双换行符分割（段落边界）→ 质量最优
2. 按单换行符分割（行边界）
3. 按句号分割（句子边界 `.。！？!?`）
4. 固定窗口切分（逐字符 + 步长）→ 最终兜底

参数配置：

| 参数 | 父管道 | 子管道 |
|------|--------|--------|
| maxChars | 2200 | 800（可配置） |
| overlapChars | 180 | 120（可配置） |

`mergeAndSplit` 合并小片段、递归拆分大片段；`applyOverlap` 在前块尾部取 N 字符作为上下文前缀。

适用场景：无结构或弱结构文档（纯文本、对话记录等）。

### 策略 C：语义切分 (SEMANTIC)

1. 按句子边界分割文本（正则 `(?<=[。！？!?；;\.])`）
2. 计算相邻块间的 Jaccard 相似度（字符级 token 集合）
3. 触发分割条件：
   - 超过 `semanticMaxChars`（父 1600 / 子 700）
   - 超过 `semanticMinChars`（父 480 / 子 240）且 Jaccard < 阈值(0.18)

`extractTokens`：英文数字 → 2+ 字符串为 token，中文 → 每个字为 token。

适用场景：中等质量文档，有自然段落边界，语义一致性较好。

### 策略 D：LLM 智能切分 (LLM)

```
Prompt: "你是 RAG 文档切块助手。请把下面文本切成适合知识检索的若干片段，
        并严格返回 JSON 数组字符串。"

若文本 > llmMaxChars(3500):
  → recursiveSplit 预拆分
  → 每个片段单独发给 LLM

失败回退: LLM 解析失败 → 自动降级为语义切分
开关控制: app.manage.chunk.llmEnabled（默认 false）
```

适用场景：低质量文档（格式混乱、无段落），需要 AI 理解语义边界。

---

## 四、组合式切块引擎

### 引擎核心：`executePipeline(sourceList, orderedSteps)`

```
输入: 原始文本列表 List<ChunkCandidate>
  ↓
Step 1 (PRIMARY 策略)  → applyStrategy()
  ↓  currentChunks
Step 2 (OPTIMIZE/FALLBACK 策略) → applyStrategy()
  ↓  currentChunks
Step N ...
  ↓
cleanupChunkList() — 按 (canonicalPath||itemIndex||text) 去重
  ↓
输出: 最终块列表
```

每个策略接收前一步的输出，后续步骤自然形成兜底。`cleanupChunkList` 使用三元组作为唯一键去重。

### 父-子块构建流程：`buildParentBlocks`

1. 解析策略计划中的步骤，分为 `parentSteps` 和 `childSteps`
2. 父管道执行：全文 → `executePipeline(fullText, parentSteps)` → `parentSeedList`
3. 对每个 `parentSeed`，子管道执行：`parentSeed.text` → `executePipeline(parentText, childSteps)` → `childSeedList`
4. 组装为 `ParentBlockCandidate(parentText, childChunks)`
5. 全局去重 → `cleanupParentBlockList()`
6. 持久化：
   - `ParentBlockCandidate` → `SuperAgentDocumentParentBlock`（记录 startChunkNo / endChunkNo / childCount）
   - 每个 `childChunk` → `SuperAgentDocumentChunk`（parent_block_id 外键，全局递增 chunkNo）

---

## 五、策略推荐引擎

`recommendStrategy()` 根据文档特征自动推荐：

### 父管道推荐

| 判断条件 | 推荐策略 |
|----------|----------|
| 结构化文档（PDF/DOCX/MD/HTML + structureLevel ≥ MEDIUM 或 headingCount ≥ 2） | `[STRUCTURE]` |
| 非结构化文档 | `[RECURSIVE]` |

### 子管道推荐

| 判断条件 | 推荐策略 |
|----------|----------|
| 低质量文档 + `recommendLlmWhenLowQuality=true` | `[LLM, RECURSIVE]` |
| 中等以上质量 + 段落 ≥ 3 + chars ≥ minChars | `[SEMANTIC, RECURSIVE]` |
| 其他情况 | `[RECURSIVE]` |

### 典型策略组合示例

| 文档类型 | 快照格式 | 说明 |
|----------|----------|------|
| 高质量 Word | `PARENT:1;CHILD:3,2` | 父用结构 → 子用语义+递归兜底 |
| 纯文本 | `PARENT:2;CHILD:2` | 父递归 → 子递归 |
| 低质量扫描件 | `PARENT:2;CHILD:4,2` | 父递归 → 子LLM+递归兜底 |

---

## 六、检索流程：子块检索 + 父块补全

这是整个架构的价值核心——检索用子块（精准），补全用父块（完整）：

```
用户问题
  → 子问题拆分
  → 每个子问题并发检索:
      ├─ VectorRetrievalChannel:  PGVector 余弦相似度 (topK=8)
      └─ KeywordRetrievalChannel: ES/PostgreSQL 关键词 (topK=8)
  → EvidenceGate 门控过滤:
      向量: similarity ≥ 0.45
      关键词: score ≥ maxScore × 0.35
  → RRF 融合 (K=60)
  → ★ elevateToParentBlocks(mergedResults)
  → Rerank 精排
  → finalTopK (5) 送入 Prompt
```

### `elevateToParentBlocks()` 详细过程

位于 `DocumentKnowledgeServiceImpl`：

1. 收集所有子块结果的 `parent_block_id`
2. 按 `parent_block_id` 分组
3. 从数据库加载对应的父块
4. 对每组构建父证据文档：

```
evidence = 父块完整内容
         + "\n\n命中子片段:\n"
         + "child#N：<子块前140字符>"
```

5. 重新计算分数：

```
parentScore = bestChildScore × (1 + 0.12 × 额外命中数 + 0.10 × 多通道命中权重)
最大额外加成: 0.36 + 0.10 = 46%
```

多子块命中同一父块时，该父块排名显著提升。

### Prompt 组装时的证据预算控制

`RagPromptAssemblyService` 三层预算：

| 预算参数 | 默认值 | 说明 |
|----------|--------|------|
| `totalEvidenceMaxChars` | 5200 | 所有证据总字符上限 |
| `perSubQuestionEvidenceMaxChars` | 2200 | 单个子问题证据上限 |
| `parentEvidenceMaxChars` | 2200 | 单个父块文本上限 |
| 去重键 | `"PARENT:" + parentBlockId` | 同一父块只引入一次 |

---

## 七、配置参数汇总

### 切块配置 (`DocumentManageProperties.Chunk`)

| 参数 | 默认值 | 说明 |
|------|--------|------|
| `recursiveMaxChars` | 800 | 子块递归最大字符数 |
| `recursiveOverlapChars` | 120 | 子块递归重叠字符数 |
| `semanticMaxChars` | 700 | 子块语义最大字符数 |
| `semanticMinChars` | 240 | 子块语义最小字符数 |
| `semanticSimilarityThreshold` | 0.18 | Jaccard 相似度阈值 |
| `llmEnabled` | false | LLM 切块开关 |
| `llmMaxChars` | 3500 | LLM 单次调用最大字符数 |
| `recommendLlmWhenLowQuality` | true | 低质量文档推荐 LLM 切块 |

### 检索配置 (`ChatRagProperties`)

| 参数 | 默认值 | 说明 |
|------|--------|------|
| `vectorTopK` | 8 | 向量搜索 TopK |
| `keywordTopK` | 8 | 关键词搜索 TopK |
| `candidateTopK` | 10 | RRF 融合后候选数 |
| `finalTopK` | 5 | 最终送入 LLM 的文档数 |
| `minVectorSimilarity` | 0.45 | 向量门控阈值 |
| `keywordRelativeScoreFloor` | 0.35 | 关键词门控相对分数 |
| `parentEvidenceMaxChars` | 2200 | 父证据文本最大字符数 |

---

## 八、完整文件清单

### 切块引擎核心

| 文件 | 职责 |
|------|------|
| `manage/service/impl/DocumentStrategyServiceImpl.java` | 组合引擎 + 四种策略全实现 |
| `manage/service/DocumentStrategyService.java` | 接口定义 |
| `manage/support/DocumentLineClassifier.java` | 8 种标题格式行分类器 |
| `manage/support/ChunkCandidate.java` | 块候选内存模型 |
| `manage/support/ParentBlockCandidate.java` | 父块候选（含子块列表） |
| `manage/support/DocumentStrategyPlanDraft.java` | 策略计划草稿模型 |
| `manage/support/DocumentStrategyStepDraft.java` | 策略步骤草稿模型 |
| `manage/config/DocumentManageProperties.java` | 切块配置属性 |

### 数据实体

| 文件 | 说明 |
|------|------|
| `manage/data/SuperAgentDocumentParentBlock.java` | 父块实体 |
| `manage/data/SuperAgentDocumentChunk.java` | 子块实体 |
| `manage/data/SuperAgentDocumentStructureNode.java` | 结构节点实体 |
| `manage/data/SuperAgentDocumentStrategyPlan.java` | 策略计划实体 |
| `manage/data/SuperAgentDocumentStrategyStep.java` | 策略步骤实体 |

### 异步处理 & 索引

| 文件 | 职责 |
|------|------|
| `manage/service/impl/DocumentAsyncProcessServiceImpl.java` | Kafka 异步管道 |
| `manage/service/impl/DefaultDocumentVectorGateway.java` | PGVector 向量化网关 |
| `manage/service/DocumentVectorGateway.java` | 向量网关接口 |

### 检索侧（消费者）

| 文件 | 职责 |
|------|------|
| `chatagent/rag/service/RagRetrievalEngine.java` | 双通道 + RRF + Rerank |
| `manage/service/impl/DocumentKnowledgeServiceImpl.java` | `elevateToParentBlocks()` 核心 |
| `manage/service/DocumentKnowledgeService.java` | 知识检索接口 |
| `chatagent/rag/service/RagPromptAssemblyService.java` | 证据预算 + Prompt 组装 |

### 检索通道

| 文件 | 职责 |
|------|------|
| `chatagent/rag/retrieve/channel/RetrievalChannel.java` | 通道接口 |
| `chatagent/rag/retrieve/channel/VectorRetrievalChannel.java` | 向量检索通道 |
| `chatagent/rag/retrieve/channel/KeywordRetrievalChannel.java` | 关键词检索通道 |
| `chatagent/rag/retrieve/channel/RetrievalChannelResult.java` | 通道结果模型 |

### 枚举（通用模块）

| 文件 | 说明 |
|------|------|
| `enums/DocumentStrategyTypeEnum.java` | STRUCTURE / RECURSIVE / SEMANTIC / LLM |
| `enums/DocumentStrategyPipelineTypeEnum.java` | PARENT / CHILD |
| `enums/DocumentStrategyRoleEnum.java` | PRIMARY / OPTIMIZE / FALLBACK / ENHANCE |
| `enums/DocumentChunkSourceTypeEnum.java` | 块来源类型 |
| `enums/DocumentStructureNodeTypeEnum.java` | DOCUMENT / SECTION / STEP / LIST_ITEM |

---

## 九、设计亮点总结

1. **策略链可编排**：父/子管道各自独立，每步有明确角色（PRIMARY → OPTIMIZE → FALLBACK → ENHANCE），后续步骤自然兜底，不会因前步失败而中断
2. **文档自适应**：`recommendStrategy()` 根据文档结构、质量、格式自动推荐最优策略组合，无需人工选择
3. **语义保真**：子块小保证检索精度，父块大保证上下文完整，`elevateToParentBlocks()` 将精准命中还原为完整语义单元
4. **分数加权设计**：`parentScore = bestChildScore × (1 + 0.12×额外命中 + 0.10×多通道)`，多子块命中同一父块显著提升其排名，保证最佳父块被优先送入 LLM
5. **三层证据预算**：总量 5200 / 单问题 2200 / 单父块 2200，防止 Prompt 溢出
6. **双重去重**：块级按 `(canonicalPath||itemIndex||text)` 去重，Prompt 级按 `parentBlockId` 去重，避免 token 浪费
7. **异步全流程**：Kafka 驱动，从文档解析 → 策略推荐 → 用户确认 → 切块 → 向量化 → 索引构建，全链路异步可观测
