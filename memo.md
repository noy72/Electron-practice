## 所感
- 解説に使われている Electron のバージョンは 2.0.4
- アプリを作成しながらElectronのAPIに触れていく
    - ほとんどコードだけを追ったが，それでもついていける程度には親切
    - 初心者向け
- 基礎的な JavaScript の知識は必要

## Section 2.3, p.26
`mainWindow.webContents.loadFile('index.html');`だとHTMLが表示されない．
`mainWindow.webContents.loadFile('./app/index.html');`だと表示された．

## Section 2.3.1 p.28
Listing 2.8 では `__diranme` を使っているが，このままでは動かない．
セキュリティ上の問題から，レンダラープロセスから Node.js へのアクセスに制限がかかるためである．
以下のように `nodeIntegration` を `true` にすると動く．
```javascript
mainWindow = new BrowserWindow({
        webPreferences: {
            nodeIntegration: true,
        },
    }
);
```

## Section 3.4 p.59
`index.html`で`require('./renderer');`しているため，`nodeIntegration`を`true`にする必要がある．


## 
Listing 4.2, `const files = dialog.showOpenDialog({...` だと， `files` は `Promise` オブジェクトである．
`const files = dialog.showOpenDialogSync({...` であれば，`files` は `String` のリストである．

## Section 6.3.3 p.111
`dialog.showSaveDialog` -> `dialog.showSaveDialogSync`

## Section 6.5 p.118
`fs.watchfile` は `Stats` を返すので，`event === 'change'` は常に `False` になる．
```javascript
...
const watcher = fs.watchfile(file, (event) => {
        if (event === 'change') {
...
```

`fs.watch` は `String` を返すので，`'change'` との比較が想定どおりに動く．
```javascript
...
const watcher = fs.watch(file, (event) => {
        if (event === 'change') {
...
```

## Section 6.6 p.120
`dialog.showMessageBox` -> `dialog.showMessageBoxSync`
