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
    wait: (ms) => new Promise(resolve => setTimeout(resolve, ms)),
    app: {
      name: 'Oasis App',
      close: () => print('[TSOE] app closed', 'system')
    }
  };

  // Make Oasis feel like a normal JavaScript environment while exposing TSOE APIs.
  const oasisConsole = {
    log: (...args) => print(args.join(' ')),
    info: (...args) => print(args.join(' '), 'info'),
    warn: (...args) => print(args.join(' '), 'system'),
    error: (...args) => print(args.join(' '), 'error'),
    clear: () => tsoe.clear()
  };

  window.tsoe = tsoe;
  window.oasis = null;

  async function execute(code, filename = 'script.js') {
    print(`$ run ${filename}`, 'system');

    try {
      // AsyncFunction executes real JavaScript and also supports top-level await.
      const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
      const runner = new AsyncFunction(
        'tsoe',
        'oasis',
        'console',
        `"use strict";\n${code}`
      );

      const result = await runner(tsoe, window.Oasis, oasisConsole);
      if (result !== undefined) print(result);
      print(`[OK] ${filename} executed`, 'success');
      return result;
    } catch (err) {
      print(`Runtime error: ${err && err.stack ? err.stack : err}`, 'error');
      return undefined;
    }
  }

  async function loadFile(file) {
    if (!file) return;
    try {
      const code = await file.text();
      await execute(code, file.name);
    } catch (err) {
      print(`File error: ${err.message}`, 'error');
    }
    fileInput.value = '';
  }

  window.Oasis = {
    version: '1.0',
    run: execute,
    load: loadFile,
    print,
    clear: tsoe.clear,
    tsoe,
    wait: tsoe.wait,
    sleep: tsoe.sleep,
    console: oasisConsole
  };

  window.oasis = window.Oasis;

  const commands = {
    help() {
      print('Oasis — The Simulator OS Elsewhere', 'info');
      print('Commands:');
      print('  help              Show this help');
      print('  clear             Clear the console');
      print('  run <JavaScript>  Run JavaScript');
      print('  version           Show Oasis/TSOE version');
      print('  load              Pick a .js file to run');
      print('');
      print('The console accepts normal JavaScript.');
      print('Example: console.log("Hello");');
      print('Example: await wait(1000); console.log("Done");');
    },
    clear() { tsoe.clear(); },
    version() { print('Oasis 1.1 | TSOE 1.0', 'success'); },
    load() { fileInput.click(); }
  };

  form.addEventListener('submit', async event => {
    event.preventDefault();
    const value = input.value.trim();
    input.value = '';
    if (!value) return;

    print(`tsoe> ${value}`, 'system');
    const firstSpace = value.indexOf(' ');
    const command = firstSpace === -1 ? value : value.slice(0, firstSpace);
    const arg = firstSpace === -1 ? '' : value.slice(firstSpace + 1);

    if (commands[command]) {
      commands[command](arg);
    } else if (command === 'run') {
      await execute(arg || 'console.log("Hello from JavaScript!");', 'console.js');
    } else {
      // Anything that is not an Oasis command is treated as JavaScript.
      await execute(value, 'console.js');
    }
  });

  fileInput.addEventListener('change', () => loadFile(fileInput.files[0]));

  print('OASIS TSOE CONSOLE', 'info');
  print('JavaScript runtime is ready.', 'system');
  print('Type JavaScript directly, or type "help".', 'system');
})();
