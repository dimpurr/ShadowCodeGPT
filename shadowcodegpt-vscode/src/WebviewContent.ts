export function getWebviewHTML() {
    return `<!DOCTYPE html>
        <html>
        <head>
            <script src="https://cdnjs.cloudflare.com/ajax/libs/showdown/1.9.1/showdown.min.js"></script>
            <style>
                .result {
                    margin-top: 10px;
                    padding: 10px;
                    background-color: #F6F6F6;
                    border-radius: 4px;
                }
            </style>
        </head>
        <body>
            <button id="analyzeButton">分析当前文件</button>
            <div id="status"></div>
            <div class="result" id="content"></div>
            <script>
                ${getJavaScriptContent()}
            </script>
        </body>
        </html>`;
}

export function getJavaScriptContent() {
    return `window.onload = function () {
            const vscode = acquireVsCodeApi();
            const analyzeButton = document.getElementById('analyzeButton');
            const statusElement = document.getElementById('status');
            const contentElement = document.getElementById('content');
            
            analyzeButton.addEventListener('click', function () {
                contentElement.innerHTML = 'Analyzing...';
                vscode.postMessage({
                    command: 'analyzeFile'
                });
            });

            window.addEventListener('message', function (event) {
                const message = event.data;
                switch (message.type) {
                    case 'batch-update':
                        statusElement.innerText = \`正在等待批次（\${message.batchNumber}/\${message.totalBatches}）的回复……\`;
                        contentElement.innerText += message.content + "\\n";
                        break;
                    case 'error':
                        statusElement.innerText = '错误';
                        contentElement.innerText = message.content;
                        break;
                }
            });
        };`;
}
