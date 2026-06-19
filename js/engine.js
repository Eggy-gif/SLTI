/* ================================
   SLTI 算分引擎
   ================================ */

// 原始分 → 等级（L/M/H）
export function sumToLevel(score) {
  if (score <= 3) {
    return 'L';
  }

  if (score === 4) {
    return 'M';
  }

  return 'H';
}

// 等级 → 数值（用于向量距离计算）
export function levelNum(level) {
  return { L: 1, M: 2, H: 3 }[level];
}

// 解析 pattern 字符串为数组
export function parsePattern(pattern) {
  return pattern.replaceAll('-', '').split('');
}

export function getVisibleQuestions({ answers, questions, specialQuestions }) {
  const visible = [...questions];
  const gateIndex = Math.max(1, Math.floor(visible.length / 2));
  visible.splice(gateIndex, 0, specialQuestions[0]);

  if (answers[specialQuestions[0].id] === 3) {
    visible.splice(gateIndex + 1, 0, specialQuestions[1]);
  }

  return visible;
}

// 核心：根据用户答案计算结果
// 输入：answers 对象
// 输出：{ rawScores, levels, ranked, finalType, modeKicker, badge, sub, ... }
export function computeResult({
  answers,
  dimensionMeta,
  dimensionOrder,
  drunkTriggerQuestionId,
  normalTypes,
  questions,
  typeLibrary,
}) {
  const rawScores = Object.fromEntries(
    Object.keys(dimensionMeta).map((dimension) => [dimension, 0])
  );
  const levels = {};

  for (const question of questions) {
    rawScores[question.dim] += Number(answers[question.id] || 0);
  }

  for (const [dimension, score] of Object.entries(rawScores)) {
    levels[dimension] = sumToLevel(score);
  }

  const userVector = dimensionOrder.map((dimension) => levelNum(levels[dimension]));
  const ranked = normalTypes
    .map((type) => {
      const vector = parsePattern(type.pattern).map(levelNum);
      let distance = 0;
      let exact = 0;

      for (let index = 0; index < vector.length; index += 1) {
        const difference = Math.abs(userVector[index] - vector[index]);
        distance += difference;
        if (difference === 0) {
          exact += 1;
        }
      }



      const similarity = Math.max(0, Math.round((1 - distance / 30) * 100));

      return {
        ...type,
        ...typeLibrary[type.code],
        distance,
        exact,
        similarity,
      };
    })
    .sort((left, right) => {
      if (left.distance !== right.distance) {
        return left.distance - right.distance;
      }

      if (left.exact !== right.exact) {
        return right.exact - left.exact;
      }

      return right.similarity - left.similarity;
    });

  const bestNormal = ranked[0];
  const drunkTriggered = answers[drunkTriggerQuestionId] === 2;

  if (drunkTriggered) {
    return {
      badge: 'drunk',
      bestNormal,
      finalType: typeLibrary.DRUNK,
      levels,
      mode: 'hidden',
      rawScores,
      ranked,
      secondaryType: bestNormal,
      similarity: 100,
      special: true,
      subType: 'drunk',
    };
  }

  if (bestNormal.similarity < 60) {
    return {
      badge: 'fallback',
      bestNormal,
      finalType: typeLibrary.HHHH,
      levels,
      mode: 'fallback',
      rawScores,
      ranked,
      secondaryType: null,
      similarity: bestNormal.similarity,
      special: true,
      subType: 'hhhh',
    };
  }

  return {
    badge: 'regular',
    bestNormal,
    finalType: bestNormal,
    levels,
    mode: 'regular',
    rawScores,
    ranked,
    secondaryType: null,
    similarity: bestNormal.similarity,
    special: false,
    subType: 'normal',
  };
}
