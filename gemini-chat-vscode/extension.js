const vscode = require('vscode');
const { exec } = require('child_process');

function activate(context) {
  context.subscriptions.push(
    vscode.commands.registerCommand('gemini-chat.openChat', () => {
      const panel = vscode.window.createWebviewPanel(
        'geminiChat',
        'Gemini Chat',
        vscode.ViewColumn.Beside,
        {
          enableScripts: true
        }
      );

      panel.webview.html = getWebviewContent();

      panel.webview.onDidReceiveMessage(
        message => {
          const prompt = message.text;
          exec(`echo "${prompt}" | gemini --model gemini-2.5-pro`, (err, stdout, stderr) => {
            if (err) {
              panel.webview.postMessage({ type: 'response', text: stderr });
            } else {
              panel.webview.postMessage({ type: 'response', text: stdout });
            }
          });
        },
        undefined,
        context.subscriptions
      );
    })
  );
}

function getWebviewContent() {
  return `
    <html>
    <body>
      <h2>💬 Gemini Chat</h2>
      <div id="chat" style="height:300px; overflow:auto; border:1px solid #ccc; padding:10px;"></div>
      <input id="input" type="text" style="width:80%;" placeholder="Ask Gemini..." />
      <button onclick="send()">Send</button>

      <script>
        const vscode = acquireVsCodeApi();
        function send() {
          const input = document.getElementById('input');
          vscode.postMessage({ text: input.value });
          const chat = document.getElementById('chat');
          chat.innerHTML += '<div><b>You:</b> ' + input.value + '</div>';
          input.value = '';
        }
        window.addEventListener('message', event => {
          const msg = event.data;
          if (msg.type === 'response') {
            document.getElementById('chat').innerHTML += '<div><b>Gemini:</b> ' + msg.text + '</div>';
          }
        });
      </script>
    </body>
    </html>
  `;
}

exports.activate = activate;
exports.deactivate = function () {};
