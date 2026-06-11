/* ================================
   SLTI 数据定义
   ================================ */

// 维度元信息：维度ID → { name, model }
const dimensionMeta = {
  // 示例：
  // S1: { name: 'S1 维度名称', model: '模型名称' },
};

// 维度顺序（用于算分和展示）
const dimensionOrder = [];

// 常规题目列表
// 每题：{ id, dim, text, options: [{ label, value }] }
const questions = [];

// 特殊/隐藏题目（可选）
const specialQuestions = [];

// 人格类型库
// code → { code, cn, intro, desc }
const TYPE_LIBRARY = {};

// 人格匹配 pattern
// 每项：{ code, pattern }（pattern 格式如 "HMH-LHL-..."）
const NORMAL_TYPES = [];

// 人格结果配图映射
// code → 图片路径
const TYPE_IMAGES = {};

// 维度等级解释
// dim → { L, M, H } 各一句话
const DIM_EXPLANATIONS = {};
