/* ================================
   SLTI 交互逻辑
   ================================ */

// DOM 引用
// TODO: 获取各屏幕、按钮、进度条等元素

// 应用状态
const app = {
  shuffledQuestions: [],
  answers: {},
};

// 屏幕切换
function showScreen(name) {
  // TODO: intro / test / result 切换
}

// 题目洗牌
function shuffle(array) {
  // TODO: Fisher-Yates
}

// 获取当前可见题目列表（含动态插入的特殊题）
function getVisibleQuestions() {
  // TODO
}

// 渲染题目列表
function renderQuestions() {
  // TODO
}

// 更新进度条
function updateProgress() {
  // TODO
}

// 渲染结果页
function renderResult() {
  // TODO: 调用 computeResult → 填充结果页 DOM
}

// 渲染维度评分列表
function renderDimList(result) {
  // TODO
}

// 开始测试
function startTest() {
  // TODO: 重置状态 → 洗牌 → 渲染 → 切屏
}

// 事件绑定
// TODO: 开始按钮、返回按钮、提交按钮、重测按钮
