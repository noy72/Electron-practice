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