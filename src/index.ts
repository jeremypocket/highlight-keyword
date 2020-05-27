export type WrapperFunc<T> = (pieceStr: string, pieceIdx: number) => T;

type CharIndexes = {
  charIndex: number;
  indexes: number[];
};

/** word piece */
type Piece = number[];

type HighlightKeyword<T> = (text: string, keyword: string, wrapper: WrapperFunc<T>) => (T | string)[];

/**
 * 关键字高亮
 */
const highlightKeyword: HighlightKeyword<any> = (text, keyword, wrapper) => {
  if (!text || !keyword || text.length < 2 || keyword.length < 2) return [text];

  const charIndexesList: CharIndexes[] = [];
  const lg = keyword.length;
  let i = 0;
  for (; i < lg; i++) {
    const kChar = keyword[i];
    const indexes = charInStrIndexesOf(text, kChar);
    charIndexesList.push({
      charIndex: i,
      indexes,
    });
  }

  const analyzeResult: Piece[] = analyze(charIndexesList);
  return joinWithAnalyze(analyzeResult, text, wrapper);
};

function charInStrIndexesOf(text: string, kChar: string): number[] {
  const result = [];
  const lg = text.length;
  for (let i = 0; i < lg; i++) {
    if (text[i] === kChar) {
      result.push(i);
    }
  }
  return result;
}

function analyze(charIndexesList: CharIndexes[]): Piece[] {
  const charIdxPieceMap: {
    [key: number]: Piece[];
  } = {};

  const lg = charIndexesList.length;
  for (let i = 0; i < lg; i++) {
    const charIndexes = charIndexesList[i];
    const { charIndex, indexes } = charIndexes;
    if (!indexes.length) continue;

    if (!charIdxPieceMap[charIndex]) {
      charIdxPieceMap[charIndex] = [];
    }

    // 分析每个文字出现次数
    indexes.forEach((index) => {
      // 是否可加入到上一个字符集
      Object.keys(charIdxPieceMap).forEach((preIndexStr) => {
        const preIndex = parseInt(preIndexStr, 10);
        const prePieceList: Piece[] = charIdxPieceMap[preIndex];
        prePieceList.forEach((prePiece) => {
          const isNear = charIndex - preIndex === prePiece.length;
          const isSame = prePiece[prePiece.length - 1] === index - 1;

          if (isNear && isSame) {
            prePiece.push(index);
          }
        });
      });

      // 加入自身
      charIdxPieceMap[charIndex].push([index]);
    });
  }

  // 打平
  let pieceList: Piece[] = [];
  Object.values(charIdxPieceMap).forEach((charPieceList) => {
    pieceList = pieceList.concat(charPieceList);
  });

  // 排序准备筛选：length desc, piece[0] asc
  pieceList.sort((lf, rt) => {
    return lf.length === rt.length ? lf[0] - rt[0] : rt.length - lf.length;
  });

  // 过滤出符合规则结果
  let finalResult: Piece[] = [];
  pieceList.forEach((currPiece) => {
    finalResult = addPieceToFinalResult(finalResult, currPiece);
  });

  // 排序准备拼装：piece[0] asc
  finalResult.sort((lf, rt) => lf[0] - rt[0]);

  return finalResult;
}

/**
 * 判断curr片段，是否与最终结果重合
 * 规则：
 * 1、有重合时，取最长片段
 */
function addPieceToFinalResult(finalResult: Piece[], currPiece: Piece) {
  if (currPiece.length < 2) return finalResult;

  let needAdd = true;

  // 进行重合判断
  let newFinalResult: Piece[] = [];
  finalResult.forEach((finalPiece) => {
    const finalS = finalPiece[0];
    const finalE = finalPiece[finalPiece.length - 1];
    const currS = currPiece[0];
    const currE = currPiece[currPiece.length - 1];
    // 重合字符
    if (finalE >= currS && finalS <= currE) {
      const isFinalLarger = finalPiece.length >= currPiece.length;
      if (isFinalLarger) {
        needAdd = false;
        newFinalResult.push(finalPiece);
        // 当片段前部余留，大于等于2字符则加入
        let moreLg = finalS - currS;
        if (moreLg >= 2) {
          newFinalResult = addPieceToFinalResult(newFinalResult, currPiece.slice(0, moreLg));
        }
        // 当片段后部余留，大于等于2字符则加入
        moreLg = currE - finalE;
        if (moreLg >= 2) {
          newFinalResult = addPieceToFinalResult(
            newFinalResult,
            currPiece.slice(currPiece.length - moreLg, currPiece.length),
          );
        }
      }
    } else {
      newFinalResult.push(finalPiece);
    }
  });

  // 添加
  if (needAdd) {
    newFinalResult.push(currPiece);
  }
  return newFinalResult;
}

function joinWithAnalyze<T>(analyzeResult: Piece[], text: string, wrapper: WrapperFunc<T>) {
  const result: (T | string)[] = [];
  let currIndex = 0;

  analyzeResult.forEach((piece, i) => {
    const key = text.substr(piece[0], piece.length);
    const pre = text.substring(currIndex, piece[0]);

    // 设为最后一位
    currIndex = piece[piece.length - 1] + 1;

    if (pre) {
      result.push(pre);
    }
    result.push(wrapper ? wrapper(key, i) : key);
  });

  const last = text.substr(currIndex);
  if (last) {
    result.push(last);
  }
  return result;
}

export default highlightKeyword;
