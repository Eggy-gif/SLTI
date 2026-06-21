/* ================================
   SLTI 交互逻辑
   ================================ */

import { computeResult, getVisibleQuestions } from './engine.js';

// 页面数据（从 zh.json 异步加载）
let pageData;

// 应用状态
const state = {
  answers: {},
  shuffledQuestions: [],
};

// DOM 引用
const screens = {
  intro: document.getElementById('intro'),
  result: document.getElementById('result'),
  test: document.getElementById('test'),
};

const questionList = document.getElementById('questionList');
const progressBar = document.getElementById('progressBar');
const progressText = document.getElementById('progressText');
const submitButton = document.getElementById('submitBtn');
const testButton = document.getElementById('testResult1Btn');
const testHint = document.getElementById('testHint');

// 屏幕切换
function showScreen(name) {
  for (const [key, element] of Object.entries(screens)) {
    element.classList.toggle('active', key === name);
  }
  window.scrollTo({ behavior: 'smooth', top: 0 });
}

// 题目洗牌
function shuffle(list) {
  const next = [...list];
  for (let index = next.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [next[index], next[randomIndex]] = [next[randomIndex], next[index]];
  }
  return next;
}

// 获取题目元信息标签
function getQuestionMetaLabel(question) {
  if (question.special) {
    return pageData.chrome.test.specialQuestion;
  }
  return pageData.chrome.test.hiddenDimension;
}

// 格式化模板字符串
function formatText(template, replacements) {
  return Object.entries(replacements).reduce(
    (value, [key, replacement]) => value.replaceAll(`{${key}}`, String(replacement)),
    template
  );
}

// 更新进度条
function updateProgress() {
  const visibleQuestions = getVisibleQuestions({
    answers: state.answers,
    questions: state.shuffledQuestions,
    specialQuestions: pageData.specialQuestions,
  });
  const total = visibleQuestions.length;
  const done = visibleQuestions.filter((q) => state.answers[q.id] !== undefined).length;
  const percent = total === 0 ? 0 : (done / total) * 100;
  const isComplete = total > 0 && total === done;

  progressBar.style.width = `${percent}%`;
  progressText.textContent = formatText(pageData.chrome.test.progressPattern, {
    done,
    total,
  });
  submitButton.disabled = !isComplete;
  testHint.textContent = isComplete
    ? pageData.chrome.test.completeHint
    : pageData.chrome.test.incompleteHint;
}

// 渲染题目列表
function renderQuestions() {
  const visibleQuestions = getVisibleQuestions({
    answers: state.answers,
    questions: state.shuffledQuestions,
    specialQuestions: pageData.specialQuestions,
  });

  questionList.innerHTML = '';
  visibleQuestions.forEach((question, index) => {
    const card = document.createElement('article');
    card.className = 'question';
    card.innerHTML = `
      <div class="question-meta">
        <div class="badge">${formatText(pageData.chrome.test.questionPattern, {
          index: index + 1,
        })}</div>
        <div>${getQuestionMetaLabel(question)}</div>
      </div>
      <div class="question-title">${question.text}</div>
      <div class="options">
        ${question.options
          .map((option, optionIndex) => {
            const optionCode = ['A', 'B', 'C', 'D'][optionIndex] || String(optionIndex + 1);
            const checked = state.answers[question.id] === option.value ? 'checked' : '';
            return `
              <label class="option">
                <input type="radio" name="${question.id}" value="${option.value}" ${checked} />
                <div class="option-code">${optionCode}</div>
                <div>${option.label}</div>
              </label>
            `;
          })
          .join('')}
      </div>
    `;
    questionList.appendChild(card);
  });

  questionList.querySelectorAll('input[type="radio"]').forEach((input) => {
    input.addEventListener('change', (event) => {
      const { name, value } = event.target;
      state.answers[name] = Number(value);

      if (name === pageData.specialQuestions[0].id && Number(value) !== 3) {
        delete state.answers[pageData.drunkTriggerQuestionId];
      }

      renderQuestions();
      updateProgress();
    });
  });

  updateProgress();
}

// 渲染维度评分列表
function renderDimensionList(result) {
  const dimensionList = document.getElementById('dimList');
  dimensionList.innerHTML = pageData.dimensionOrder
    .map((dimension) => {
      const level = result.levels[dimension];
      return `
        <div class="dim-item">
          <div class="dim-item-top">
            <div class="dim-item-name">${pageData.dimensionMeta[dimension].name}</div>
            <div class="dim-item-score">${formatText(
              pageData.chrome.result.scorePattern,
              { level, score: result.rawScores[dimension] }
            )}</div>
          </div>
          <p>${pageData.dimExplanations[dimension][level]}</p>
        </div>
      `;
    })
    .join('');
}

// 解析结果页 chrome 文案
function resolveResultChrome(result) {
  if (result.subType === 'drunk') {
    return {
      badge: pageData.chrome.result.hiddenOverrideBadge,
      kicker: pageData.chrome.result.hiddenOverrideKicker,
      note: pageData.chrome.result.specialNote,
      sub: pageData.chrome.result.hiddenOverrideSub,
    };
  }

  if (result.subType === 'hhhh') {
    return {
      badge: formatText(pageData.chrome.result.fallbackBadgePattern, {
        similarity: result.similarity,
      }),
      kicker: pageData.chrome.result.fallbackKicker,
      note: pageData.chrome.result.specialNote,
      sub: pageData.chrome.result.fallbackSub,
    };
  }

  return {
    badge: formatText(pageData.chrome.result.regularBadgePattern, {
      exact: result.bestNormal.exact,
      similarity: result.bestNormal.similarity,
    }),
    kicker: pageData.chrome.result.modeKicker,
    note: pageData.chrome.result.regularNote,
    sub: pageData.chrome.result.regularSub,
  };
}

// 渲染树礼推荐列表
function renderRecommendations(type) {
  const container = document.getElementById('recommendList');
  if (!type.recommendations || !type.recommendations.length) {
    container.innerHTML = '<p>暂无推荐</p>';
    return;
  }
  const pool = pageData.activityPool || {};
  container.innerHTML = type.recommendations
    .map((rec) => {
      const info = pool[rec.activity] || {};
      const name = info.name || rec.activity;
      const img = info.image && info.image !== 'TODO'
        ? `<img src="${info.image}" alt="${name}" class="rec-img" />`
        : `<div class="rec-img-placeholder">TODO：后续添加活动图片</div>`;
      const link = info.url && info.url !== 'TODO'
        ? `<a href="${info.url}" target="_blank" rel="noopener" class="rec-link">了解更多 →</a>`
        : `<span class="rec-link-todo">TODO：后续添加公众号链接</span>`;
      return `
        <div class="rec-item">
          ${img}
          <div class="rec-name">${name}</div>
          <div class="rec-reason">${rec.reason}</div>
          ${link}
        </div>
      `;
    })
    .join('');
}

// 渲染结果页
function renderResult() {
  const result = computeResult({
    answers: state.answers,
    dimensionMeta: pageData.dimensionMeta,
    dimensionOrder: pageData.dimensionOrder,
    drunkTriggerQuestionId: pageData.drunkTriggerQuestionId,
    normalTypes: pageData.normalTypes,
    questions: pageData.questions,
    typeLibrary: pageData.typeLibrary,
  });
  const chrome = resolveResultChrome(result);
  const type = result.finalType;
  const imagePath = pageData.imagePaths[type.code];

  document.getElementById('resultModeKicker').textContent = chrome.kicker;
  document.getElementById('resultTypeName').textContent = formatText(
    pageData.chrome.result.resultNamePattern,
    { code: type.code, name: type.cn }
  );
  document.getElementById('matchBadge').textContent = chrome.badge;
  document.getElementById('resultTypeSub').textContent = chrome.sub;
  document.getElementById('resultDesc').textContent = type.desc;
  document.getElementById('posterCaption').textContent = type.intro;

  renderRecommendations(type);

  const posterImage = document.getElementById('posterImage');
  posterImage.src = imagePath;
  posterImage.alt = `${type.code} ${type.cn}`;

  renderDimensionList(result);
  showScreen('result');
}

// 开始测试
function startTest() {
  state.answers = {};
  state.shuffledQuestions = shuffle(pageData.questions);
  renderQuestions();
  showScreen('test');
}

// 初始化：加载数据 → 绑定事件
async function init() {
  const resp = await fetch('src/data/content/content.json');
  pageData = await resp.json();

  document.getElementById('heroStartBtn').addEventListener('click', startTest);
  document.getElementById('backIntroBtn').addEventListener('click', () => showScreen('intro'));
  document.getElementById('restartBtn').addEventListener('click', startTest);
  document.getElementById('toTopBtn').addEventListener('click', () => showScreen('intro'));
  submitButton.addEventListener('click', renderResult);
  testButton.addEventListener('click', renderResult);
}

init();
