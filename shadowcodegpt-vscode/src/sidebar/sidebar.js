window.onload = function () {
    const vscode = acquireVsCodeApi();

    const analyzeButton = document.getElementById('analyzeButton');
    const resultArea = document.getElementById('resultArea');

    analyzeButton.addEventListener('click', function () {
        resultArea.innerHTML = 'Analyzing...';

        vscode.postMessage({
            command: 'analyzeFile'
        });
    });

    // 监听来自扩展的消息
    window.addEventListener('message', function (event) {
        const message = event.data;
        if (message.command === 'showResult') {
            resultArea.innerHTML = message.result;
        }
    });
};
