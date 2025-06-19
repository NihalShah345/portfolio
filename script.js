let commandHistory = [];
let historyIndex = -1;
let waitingForConfirmation = false;
let currentPath = "~";
let hasPulledProjects = false;
let outputQueue = [];
let isPrinting = false;

window.onload = function () {
  const welcomeMessage = [
    "Welcome to Nihal's interactive terminal!",
    "Type 'help' to get started."
  ];
  welcomeMessage.forEach(line => printToTerminal(line));
  updatePrompt();
};

function updatePrompt() {
  document.getElementById("terminalPrompt").textContent = `root@nihals_world:${currentPath}$`;
}

function getInputText() {
  return document.getElementById("terminalInput").innerText.trim();
}

function clearInput() {
  document.getElementById("terminalInput").innerText = "";
}

document.getElementById("terminalInput").addEventListener("keydown", function (e) {
  if (e.key === "Enter") {
    e.preventDefault();
    const input = getInputText();
    printUserCommand(`root@nihals_world:${currentPath}$`, input);
    clearInput();

    if (input === "") return;

    if (waitingForConfirmation) {
      if (input.toLowerCase() === "yes" || input.toLowerCase() === "y") {
        downloadResume();
      } else {
        printToTerminal("Aborted.");
      }
      waitingForConfirmation = false;
      return;
    }

    handleCommand(input);
    commandHistory.push(input);
    historyIndex = commandHistory.length;
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    if (historyIndex > 0) {
      historyIndex--;
      document.getElementById("terminalInput").innerText = commandHistory[historyIndex];
    }
  } else if (e.key === "ArrowDown") {
    e.preventDefault();
    if (historyIndex < commandHistory.length - 1) {
      historyIndex++;
      document.getElementById("terminalInput").innerText = commandHistory[historyIndex];
    } else {
      historyIndex = commandHistory.length;
      clearInput();
    }
  }
});




function handleCommand(input) {
  const parts = input.split(" ");
  const cmd = parts[0];
  const arg = parts[1];

  switch (cmd) {
    case "sudo":
      if (arg === "hire" && parts[2] === "me") {
        printToTerminal("[sudo] password for user: ********");
        setTimeout(() => {
          printToTerminal("Verifying credentials...");
          setTimeout(() => {
            printToTerminal("Credentials accepted.");
            printToTerminal("Are you sure you want to download my resume? (yes/no)");
            waitingForConfirmation = true;
          }, 1000);
        }, 800);
      } else {
        printToTerminal("Command not found.");
      }
      break;
    case "help":
  const helpLines = [
    "<strong>help</strong>                Show this help message.",
    "<strong>ls</strong>                  List files and folders in the current directory.",
    "<strong>ls &lt;folder&gt;</strong>       List contents of a specific folder (e.g., ls projects).",
    "<strong>cd &lt;folder&gt;</strong>       Change directory (e.g., cd artworks).",
    "<strong>cd</strong>                  Return to root (~) directory.",
    "<strong>clear</strong>               Clear the terminal screen.",
    "<strong>sudo hire me</strong>        Download my resume (with sudo flair).",
    "<strong>git pull NihalShah345</strong> Simulate fetching my latest project folders."
  ];
  helpLines.forEach(line => printHTMLToTerminal(`<span class="help-line">${line}</span>`));
  break;

    case "clear":
      document.getElementById("terminalOutput").textContent = "";
      break;
case "ls":
  let targetPath = arg ? arg : (currentPath === "~" ? "~" : currentPath.replace(/^~\//, ""));
  if (targetPath === "projects" && !hasPulledProjects) {
    printToTerminal("Projects not cloned yet found.");
    printToTerminal("Hint: try running 'git clone NihalShah345/projects' to fetch my latest projects.");
    return;
  }

  // Normalize path
  const lsKey = (targetPath === "~") ? "~" : targetPath;
  const contents = fileSystem[lsKey];

  if (!contents) {
    printToTerminal(`ls: cannot access '${arg || ""}': No such file or directory`);
    return;
  }
const formatted = contents.map(item => {
  const fullPath = (lsKey === "~") ? item : `${lsKey}/${item}`;
  const isFolder = fileSystem[fullPath] && Array.isArray(fileSystem[fullPath]);
  return isFolder
    ? `<span class="file-folder">${item}</span>`
    : `<span class="file-text">${item}</span>`;
}).join("    ");

  printRawHTMLToTerminal(formatted);
  printRawHTMLToTerminal(
    `<span class="legend">📘 <span class="file-folder">[blue]</span>=folder, 📄 <span class="file-text">[white]</span>=file</span>`
  );
  break;




    case "cd":
      if (arg === "..") {
  if (currentPath === "~") return; // already at root
  currentPath = currentPath.slice(0, currentPath.lastIndexOf("/"));
  if (currentPath === "~" || currentPath === "") currentPath = "~";
  updatePrompt();
  return;
}

  if (!arg) {
    currentPath = "~";
    updatePrompt();
    return;
  }

  const currentDir = currentPath.replace(/^~\//, "").replace(/^~$/, "");
  const target = currentDir ? `${currentDir}/${arg}` : arg;
  const pathParts = target.split("/");

  let temp = "~";
  let valid = true;

  for (let i = 0; i < pathParts.length; i++) {
    const segment = pathParts[i];
    const folderList = temp === "~"
      ? fileSystem["~"]
      : fileSystem[temp.split("/").slice(1).join("/")];

    if (folderList && folderList.includes(segment)) {
      temp = temp === "~" ? `~/${segment}` : `${temp}/${segment}`;
    } else {
      valid = false;
      break;
    }
  }

  if (valid) {
    currentPath = temp;
    updatePrompt();
  } else {
    printToTerminal("No such directory.");
  }
  break;

    case "git":
  if ((arg === "clone" || arg == "pull") && parts[2]) {
    if (hasPulledProjects) {
      printToTerminal("Already up to date.");
      return;
    }

    printToTerminal("Cloning into 'projects'...");

    const steps = [
      "<span class='git-clone-step'>remote: Enumerating objects: 5, done.</span>",
      "<span class='git-clone-step'>remote: Counting objects: 100% (5/5), done.</span>",
      "<span class='git-clone-step'>remote: Compressing objects: 100% (3/3), done.</span>",
      "<span class='git-clone-step'>remote: Total 5 (delta 0), reused 5 (delta 0)</span>",
      "<span class='git-clone-step'>Unpacking objects: 100% (5/5), done.</span>",
      "<span class='git-success'>✔ Projects successfully pulled.</span>",
      `<span class="git-link">View my Github repos: <a href="https://github.com/NihalShah345?tab=repositories" target="_blank">https://github.com/NihalShah345?tab=repositories</a></span>`
    ];

    let delay = 500;
    steps.forEach((line, i) => {
      setTimeout(() => {
        printHTMLToTerminal(line);
        if (i === steps.length - 2) {
          hasPulledProjects = true;
          fileSystem["projects"] = ["CampNav", "Semantic_AI_Movie_Recommender", "Flight_Reservation_System", "5G_Satellite_Project", "PDF_Things"];
        }
      }, delay * (i + 1));
    });
  } else {
    printToTerminal("fatal: remote repository not found.");
  }
  break;



    default:
      printToTerminal(`Command not recognized: ${input}`);
  }
  
}

function downloadResume() {
  printToTerminal("📄 Downloading resume...");
  printToTerminal("📬 Redirecting to contact...");
  const a = document.createElement('a');
  a.href = 'assets/resume.pdf';
  a.download = 'YourName_Resume.pdf';
  a.click();
}

function printToTerminal(text) {
  outputQueue.push({ type: "text", content: text });
  processOutputQueue();
}

function printHTMLToTerminal(html) {
  outputQueue.push({ type: "html", content: html });
  processOutputQueue();
}

function processOutputQueue() {
  if (isPrinting || outputQueue.length === 0) return;

  isPrinting = true;
  const terminal = document.getElementById("terminalOutput");
  const { type, content } = outputQueue.shift();

  const line = document.createElement("div");
  terminal.appendChild(line);
  scrollToBottom();

  // Clean HTML if needed
  const plainText = type === "html"
    ? new DOMParser().parseFromString(content, "text/html").body.textContent || ""
    : content;

  let i = 0;
  function typeChar() {
    if (i < plainText.length) {
      line.textContent += plainText.charAt(i);
      scrollToBottom();
      i++;
      setTimeout(typeChar, 8); // character speed
    } else {
      if (type === "html") line.innerHTML = content;
      isPrinting = false;
      setTimeout(processOutputQueue, 100); // wait before next line
    }
  }

  typeChar();
}
function printUserCommand(prompt, inputText) {
  const terminal = document.getElementById("terminalOutput");
  const line = document.createElement("div");
  line.innerHTML = `<span class="prompt">${prompt}</span> ${inputText}`;
  terminal.appendChild(line);
  scrollToBottom();
}
function printRawHTMLToTerminal(html) {
  const terminal = document.getElementById("terminalOutput");
  const line = document.createElement("div");
  line.innerHTML = html;
  terminal.appendChild(line);
  scrollToBottom();
}




function scrollToBottom() {
  const terminalContainer = document.getElementById("terminalView");
  terminalContainer.scrollTop = terminalContainer.scrollHeight;
}


