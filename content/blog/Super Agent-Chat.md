---
title: 超级智能体-部分模块功能解析
date: 2026-04-20
summary: 五步前置编排器 + 三级路由
---
# 项目介绍
项目介绍:这是一个面向企业知识管理的AI智能体平台，支持多格式文档上传与解析、智能分块与向量化、知识库构建、多轮对话问答、ReActAgent 智能编排、RAG检索增强生成等全链路业务闭环。

技术栈: SpringBoot、SpringAI-Alibaba、MCP、Milvus、Kafka、MinIO、Redis、Redisson、RAG、Tavily等

---

# 五步前置编排器 + 三级路由

  整个对话的核心调度在 ChatPreparationOrchestrator.prepare()（ChatPreparationOrchestrator.java:80），被
  BusinessChatService.prepareExecutionPlan() 调用。它接收一个 TaskInfo，输出一个 ConversationExecutionPlan，这个 plan
  决定了用什么执行器、问什么、查什么文档、走什么检索策略。

## 一、五步前置编排器

  用户问题 → [Step1 记忆] → [Step2 改写] → [Step3 文档路由] → [Step4 决策路由] → [Step5 组装]

### Step 1: 记忆装载

  loadMemoryContext(conversationId) → ConversationMemoryContext

  从数据库加载该会话的长期摘要（压缩后的历史）+ 最近窗口对话记录。核心产物：
  - longTermSummary：历史的压缩摘要
  - recentTranscript：最近 N 轮的完整对话文本
  - historySummary：上述两者拼接，用于后续改写和路由的上下文

### Step 2: 问题改写

  chatQueryRewriteService.rewrite(question, historySummary) → RagRewriteResult

  用 LLM 做三件事：
  - 指代消解："那个文档的第3条呢？" → "XX操作手册第3条的内容是什么？"
  - 上下文补全：结合历史补充省略的主语/宾语
  - 多问题拆分：如果用户一次问了多个独立问题（多问号、编号列表、"分别"），自动拆成 sub_questions

  改写策略非常保守——默认 should_split=false，只在明确存在多个显式独立问题时才拆分。改写失败则回退到规则匹配。

### Step 3: 文档路由（第一级 + 第二级路由在此）

  这是最复杂的一步，涉及两层路由判断（详见下文"三级路由"）。核心逻辑：

  switch (chatMode):
    OPEN_CHAT     → 直接 REACT_AGENT，跳过 Step4
    DOCUMENT      → 用用户指定的文档，继续 Step4
    AUTO_DOCUMENT → 自动路由文档，可能触发 CLARIFICATION

### Step 4: 决策路由（第三级路由）

  documentQuestionRouter.route(documentId, question, rewriteResult) → DocumentNavigationDecision

  判断走哪种执行模式。核心规则（DocumentQuestionRouter.java:68-119）：

  ┌───────────────────────────────────────┬─────────────────────┐
  │                 条件                  │        结果         │
  ├───────────────────────────────────────┼─────────────────────┤
  │ 问"上一节/下一节/章节列表" 且非分析类 │ GRAPH_ONLY          │
  ├───────────────────────────────────────┼─────────────────────┤
  │ 问"第X步/第X项" 且非分析类            │ GRAPH_THEN_EVIDENCE │
  ├───────────────────────────────────────┼─────────────────────┤
  │ 其他所有情况                          │ RETRIEVAL           │
  └───────────────────────────────────────┴─────────────────────┘

  结构线索（章节信息）在 RETRIEVAL 模式下作为软提示传递给检索，辅助提升检索精度。

### Step 5: 执行计划组装

  将前面所有产物打包成 ConversationExecutionPlan：
  - mode：最终执行模式
  - navigationDecision：结构导航决策（含章节、编号项）
  - rewriteQuestion / retrievalQuestion：改写后的问题 / 检索用问题
  - selectedDocumentId / retrievalDocumentIds：目标文档
  - noEvidenceReply：无证据时的兜底回复

  ---
## 二、三级路由

  Level 1: 聊天模式路由 (OPEN_CHAT / DOCUMENT / AUTO_DOCUMENT)
    └─ Level 2: 文档范围路由 (选哪份文档? 是否要问用户?)
         └─ Level 3: 执行策略路由 (GRAPH_ONLY / GRAPH_THEN_EVIDENCE / RETRIEVAL)

### Level 1: 聊天模式路由

  在 buildLaunchPlan() 阶段根据请求参数判定，三种模式：

  ┌───────────────┬──────────────────────┬───────────────────────────────────────────────────────────────────┐
  │     模式      │       触发条件       │                               行为                                │
  ├───────────────┼──────────────────────┼───────────────────────────────────────────────────────────────────┤
  │ OPEN_CHAT     │ 用户选择"开放式提问" │ 跳过 RAG 全流程，直接进入 REACT_AGENT，Agent 自主决定是否联网搜索 │
  ├───────────────┼──────────────────────┼───────────────────────────────────────────────────────────────────┤
  │ DOCUMENT      │ 用户指定一份文档     │ 锁定这份文档，走完整 RAG 链路                                     │
  ├───────────────┼──────────────────────┼───────────────────────────────────────────────────────────────────┤
  │ AUTO_DOCUMENT │ 自动知识问答         │ 由系统自动判断应该检索哪份文档                                    │
  └───────────────┴──────────────────────┴───────────────────────────────────────────────────────────────────┘

### Level 2: 文档范围路由（仅 AUTO_DOCUMENT 模式生效）

  knowledgeRouteService.route(question, rewriteQuestion) → KnowledgeRouteDecision

  这是一个基于 LLM 的知识路由服务，返回候选文档列表 + 置信度。然后在 selectAutoCandidates() 中做判断：

  if 路由结果为空 或 候选为空
    → CLARIFICATION（反问用户）

  if 置信度 < 0.55
    → CLARIFICATION（不够确定，需要确认）

  if 候选 >= 2 且 前两名分数差 ≤ 3 且 属于不同知识范围
    → CLARIFICATION（歧义，需要确认）

  if 置信度 >= 0.55
    → 选定 top-1 文档，继续 Step4

  如果路由失败，还有降级策略 fallbackDocuments()：用用户问题的关键词在所有可检索文档的元数据（名称、标签、业务分类）上做
   N-gram 匹配打分。

### Level 3: 执行策略路由

  在 DocumentQuestionRouter.route() 中，用纯规则匹配（不调 LLM）判断问题类型：

  规则判断流程：

  1. 提取章节线索：正则匹配 1.2.3 格式的章节号、引号内的关键词、步骤号
  2. 章节定位（resolveSection）：三阶段查找
    - 精确章节号匹配（Neo4j 图查询）
    - 导航索引搜索（DocumentNavigationIndexService）
    - 全文章节标题打分（短语匹配，阈值 ≥ 45）
    - 最后兜底：graphService.findBestSection() 语义搜索
  3. 判断路由：
  问"上一节/下一节/章节列表" 且非分析类 且单问题 → GRAPH_ONLY
  问"第X步/第X项" 且非分析类                → GRAPH_THEN_EVIDENCE
  其他全部                                 → RETRIEVAL
  4. 分析类问题（"为什么/原因/区别/影响"）即使提到章节号，也只把章节线索作为软提示，最终仍走 RETRIEVAL。

  ---
  总览流程图

  用户请求
    │
    ├─ Level 1: 聊天模式判断
    │   ├─ OPEN_CHAT ──────────────────────────────→ REACT_AGENT (联网工具自主执行)
    │   ├─ DOCUMENT (指定文档)
    │   └─ AUTO_DOCUMENT
    │        │
    │        └─ Level 2: 文档范围路由
    │             ├─ 高置信度 + 单候选 → 选定文档
    │             ├─ 低置信度 / 歧义   → CLARIFICATION (反问用户)
    │             └─ 路由失败          → 降级关键词匹配兜底
    │
    ├─ Step 1: 装载会话记忆（摘要 + 最近窗口）
    ├─ Step 2: LLM 改写问题（消解 + 补全 + 拆分）
    ├─ Level 3: 执行策略路由
    │   ├─ 结构性问题 ("上一节" / "目录") → GRAPH_ONLY
    │   ├─ 编号项查找 ("第3步" / "第5项")  → GRAPH_THEN_EVIDENCE
    │   └─ 普通文档问题                     → RETRIEVAL (双通道混合检索)
    │
    └─ Step 5: 打包 ConversationExecutionPlan → 交给执行器

  ---
  关键设计亮点

  5. 路由粒度递进：先粗粒度判断"查不查文档"（Level1），再中粒度"查哪份文档"（Level2），最后细粒度"怎么查"（Level3），层
  层收窄
  6. 保守拆分：问题改写默认不拆分，只在明确多问题时拆，避免假阳性的子问题导致检索噪音
  7. 规则兜底 LLM：Level3 完全用规则匹配，不调 LLM，保证路由环节的速度和稳定性；Level2 用 LLM 但有多层降级策略
  8. CLARIFICATION 安全阀：当不确定该查哪份文档时，宁可反问用户也不瞎猜，避免答非所问