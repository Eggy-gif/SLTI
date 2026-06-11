/* ================================
   SLTI 算分引擎
   ================================ */

// 原始分 → 等级（L/M/H）
function sumToLevel(score) {
  // TODO: 定义阈值
}

// 等级 → 数值（用于向量距离计算）
function levelNum(level) {
  // TODO
}

// 解析 pattern 字符串为数组
function parsePattern(pattern) {
  // TODO
}

// 核心：根据用户答案计算结果
// 输入：answers 对象
// 输出：{ rawScores, levels, ranked, finalType, modeKicker, badge, sub, ... }
function computeResult(answers) {
  // TODO:
  // 1. 按维度汇总原始分
  // 2. 原始分转等级
  // 3. 与人格 pattern 做向量距离匹配
  // 4. 排序，取最佳匹配
  // 5. 处理特殊/兜底人格
  // 6. 返回结果对象
}
