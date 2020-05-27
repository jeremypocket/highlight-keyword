# highlight keyword
highlight keyword with javascript

# use in react
```typescript jsx
import React from 'react';
import highlightKeyword from 'highlight-keyword';

const MyComponent: React.FC<{}> = () => {
  return (
    <div>
      {highlightKeyword("1234567890", "123_890_345678", (pieceStr, pieceIdx) => {
        return <span key={pieceIdx} style={{ color: 'red' }}>{pieceStr}</span>;
      })}
    </div>
  )
};
```

# test
```typescript
import highlightKeyword from 'highlight-keyword';

const findPieceList: string[] = [];
const result = highlightKeyword("1234567890", "123_890_345678", (pieceStr, pieceIdx) => {
  findPieceList.push(pieceStr);
  return pieceStr;
});
console.log(findPieceList); // [12,345678,90]
console.log(result.join(',')); // 12,345678,90
```
```typescript
import highlightKeyword from 'highlight-keyword';

const findPieceList: string[] = [];
const result = highlightKeyword("湖南省长沙市长沙县东十二路2号", "湖南省长沙市浏阳市长沙县开发区东十二路2号", (pieceStr, pieceIdx) => {
  findPieceList.push(pieceStr);
  return pieceStr;
});
console.log(result.join(',')); // 湖南省长沙市,长沙县,东十二路2号
```
