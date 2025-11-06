// Toggle folders open/close
function toggleFolder(id) {
  const folder = document.getElementById(id);
  folder.style.display = folder.style.display === "block" ? "none" : "block";
}

// Open and render assignments (.txt or .ipynb)
function openAssignment(name, filepath) {
  const tabBar = document.getElementById("tabBar");
  const codeArea = document.getElementById("codeArea");

  document.querySelectorAll(".tab").forEach(tab => tab.classList.remove("active"));
  let existingTab = Array.from(tabBar.children).find(tab => tab.textContent === name);

  if (!existingTab) {
    const newTab = document.createElement("div");
    newTab.classList.add("tab", "active");
    newTab.textContent = name;
    newTab.onclick = () => switchTab(name, filepath);
    tabBar.appendChild(newTab);
  } else existingTab.classList.add("active");

  if (filepath.endsWith(".ipynb")) loadNotebook(filepath, name, codeArea);
  else loadTextFile(filepath, name, codeArea);
}

// Load .txt file
function loadTextFile(filepath, name, codeArea) {
  fetch(filepath)
    .then(response => response.text())
    .then(data => {
      codeArea.innerHTML = `
        <button class="copy-btn" onclick="copyCode()">📋 Copy Code</button>
        <h3>${name}</h3>
        <pre><code id="code-content" class="language-python">${data}</code></pre>
      `;
      hljs.highlightAll();
    })
    .catch(() => {
      codeArea.innerHTML = `<p style="color:red;">⚠️ Error loading file: ${filepath}</p>`;
    });
}

// Load .ipynb notebook
function loadNotebook(filepath, name, codeArea) {
  fetch(filepath)
    .then(response => response.json())
    .then(nb => {
      let html = `<button class="copy-btn" onclick="copyCode()">📋 Copy Code</button><h3>${name}</h3><div class="notebook-view">`;
      nb.cells.forEach(cell => {
        if (cell.cell_type === "markdown") {
          html += `<div class="markdown-cell">${renderMarkdown(cell.source.join(""))}</div>`;
        } else if (cell.cell_type === "code") {
          const code = cell.source.join("");
          html += `<div class="code-cell"><pre><code class="language-python">${code}</code></pre></div>`;
        }
      });
      html += "</div>";
      codeArea.innerHTML = html;
      hljs.highlightAll();
    })
    .catch(() => {
      codeArea.innerHTML = `<p style="color:red;">⚠️ Error loading notebook: ${filepath}</p>`;
    });
}

// Markdown render helper
function renderMarkdown(md) {
  return md
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    .replace(/\*\*(.*?)\*\*/gim, '<b>$1</b>')
    .replace(/\*(.*?)\*/gim, '<i>$1</i>')
    .replace(/\n/g, '<br>');
}

// Copy all visible code
function copyCode() {
  const codeBlocks = document.querySelectorAll(".code-cell code, #code-content");
  if (!codeBlocks.length) return alert("No code to copy.");
  const allCode = Array.from(codeBlocks).map(c => c.innerText).join("\n\n");
  navigator.clipboard.writeText(allCode).then(() => {
    const btn = document.querySelector(".copy-btn");
    btn.textContent = "✅ Copied!";
    setTimeout(() => (btn.textContent = "📋 Copy Code"), 1500);
  });
}

// Switch tabs
function switchTab(name, filepath) {
  document.querySelectorAll(".tab").forEach(tab => {
    tab.classList.toggle("active", tab.textContent === name);
  });
  openAssignment(name, filepath);
}

// Download CSV button function
function downloadFile(filePath, fileName) {
  const link = document.createElement("a");
  link.href = filePath;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
