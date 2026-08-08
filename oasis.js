(() => {
  const output = document.getElementById('output');
  const input = document.getElementById('commandInput');
  const form = document.getElementById('commandForm');
  const fileInput = document.getElementById('fileInput');

  const print = (text = '', type = '') => {
    const line = document.createElement('div');
    line.className = `line ${type}`;
    line.textContent = String(text);
    output.appendChild(line);
    output.scrollTop = output.scrollHeight;
  };

  const tsoe = {
    version: '1.0',
    print: (text) => print(text),
    log: (text) => print(text),
    alert: (text) => print(`[TSOE ALERT] ${text}`, 'info'),
    clear: () => { output.innerHTML = ''; },
    sleep: (ms) => new Promise(resolve => setTimeout(resolve, ms)),
    app: {
      name: 'Oasis App',
      close: () => print('[TSOE] app closed', 'system')
    }
  };

  window.tsoe = tsoe;

  function execute(code, filename = 'script.js') {
    print(`$ run ${filename}`, 'system');
    try {
      const runner = new Function('tsoe', 'oasis', `"use strict";\n${code}`);
      const result = runner(tsoe, window.Oasis);
      if (result instanceof Promise) {
        result.catch(err => print(`Runtime error: ${err.message}`, 'error'));
      }
      print(`[OK] ${filename} executed`, 'success');
    } catch (err) {
      print(`Runtime error: ${err.message}`, 'error');
    }
  }

  async function loadFile(file) {
    if (!file) return;
    const code = await file.text();
    execute(code, file.name);
  }

  window.Oasis = {
    version: '1.0',
    run: execute,
    load: loadFile,
    print,
    clear: tsoe.clear,
    tsoe
  };

  const commands = {
    help() {
      print('Oasis — The Simulator OS Elsewhere', 'info');
      print('Commands:');
      print('  help              Show this help');
      print('  clear             Clear the console');
      print('  run <code>        Run JavaScript as TSOE');
      print('  version           Show Oasis/TSOE version');
      print('  load              Pick a .js file to run');
      print('');
      print('JS files receive the global tsoe API.');
    },
    clear() { tsoe.clear(); },
    version() { print('Oasis 1.0 | TSOE 1.0', 'success'); },
    load() { fileInput.click(); }
  };

  form.addEventListener('submit', event => {
    event.preventDefault();
    const value = input.value.trim();
    input.value = '';
    if (!value) return;

    print(`tsoe> ${value}`, 'system');
    const [command, ...rest] = value.split(' ');
    const arg = rest.join(' ');

    if (commands[command]) {
      commands[command](arg);
    } else if (command === 'run') {
      execute(arg || 'tsoe.print("Hello from TSOE!");', 'console.js');
    } else {
      print(`Unknown command: ${command}. Type help.`, 'error');
    }
  });

  fileInput.addEventListener('change', () => loadFile(fileInput.files[0]));

  print('OASIS TSOE CONSOLE', 'info');
  print('The Simulator OS Elsewhere runtime is ready.', 'system');
  print('Type "help" to get started.', 'system');
})();
