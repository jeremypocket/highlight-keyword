import highlightKeyword from './index';

test('normal', () => {
  const findPieceList: string[] = [];
  const result = highlightKeyword('abcdefj ssabcs', 'abcde', (pieceStr, pieceIdx) => {
    findPieceList.push(pieceStr);
    return pieceStr;
  });
  expect(findPieceList.length).toEqual(2);
  expect(findPieceList[0]).toEqual('abcde');
  expect(findPieceList[1]).toEqual('abc');
  expect(result.join(',')).toEqual('abcde,fj ss,abc,s');
});

test('number', () => {
  const findPieceList: string[] = [];
  const result = highlightKeyword('1234567890', '123_890_345678', (pieceStr, pieceIdx) => {
    findPieceList.push(pieceStr);
    return pieceStr;
  });
  expect(findPieceList.length).toEqual(3);
  expect(findPieceList[0]).toEqual('12');
  expect(findPieceList[1]).toEqual('345678');
  expect(findPieceList[2]).toEqual('90');
  expect(result.join(',')).toEqual('12,345678,90');
});

test('chinese', () => {
  const findPieceList: string[] = [];
  const result = highlightKeyword(
    '湖南省长沙市长沙县东十二路2号',
    '湖南省长沙市浏阳市长沙县开发区东十二路2号',
    (pieceStr, pieceIdx) => {
      findPieceList.push(pieceStr);
      return pieceStr;
    },
  );
  expect(findPieceList.length).toEqual(3);

  expect(findPieceList[0]).toEqual('湖南省长沙市');
  expect(findPieceList[1]).toEqual('长沙县');
  expect(findPieceList[2]).toEqual('东十二路2号');
  expect(result.join(',')).toEqual('湖南省长沙市,长沙县,东十二路2号');
});
