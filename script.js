let commandHistory = [];
let historyIndex = -1;
let waitingForConfirmation = false;
let currentPath = "~";
let hasPulledProjects = false;
let outputQueue = [];
let isPrinting = false;

const githubMap = {
  "CampNav": "CampNav",
  "semantic_AI_Movie_Rec": "Semantic_AI_Movie_Recommender",
  "Flight_DBMS": "Flight_DBMS",
  "5G_Satellite_Research": "WINLAB_research",
  "PDF_Things": "PDF_Things",
  "portfolio": "portfolio"
};


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
    "<strong>ls &lt;folder&gt;</strong>         List contents of a specific folder (e.g., ls projects).",
    "<strong>cd &lt;folder&gt;</strong>         Change directory (e.g., cd artworks).",
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
  if (lsKey.startsWith("projects/")) {
  const folderName = lsKey.split("/")[1];
  const repoSlug = githubMap[folderName];
  if (repoSlug) {
    const githubURL = `https://github.com/NihalShah345/${repoSlug}`;
    printRawHTMLToTerminal(
      `<span class="git-link">🔗 GitHub: <a href="${githubURL}" target="_blank">${githubURL}</a></span>`
    );
  }
}

  break;



case "cd":
  if (arg === "..") {
    if (currentPath === "~") return;
    currentPath = currentPath.slice(0, currentPath.lastIndexOf("/"));
    if (currentPath === "" || currentPath === "~") currentPath = "~";
    updatePrompt();
    return;
  }

  if (!arg) {
    currentPath = "~";
    updatePrompt();
    return;
  }

  const currentKey = currentPath === "~" ? "~" : currentPath.replace(/^~\//, "");
  const children = fileSystem[currentKey];

  if (!children || !children.includes(arg)) {
    printToTerminal("cd: no such directory");
    return;
  }

  const fullPath = currentKey === "~" ? arg : `${currentKey}/${arg}`;
  const isDirectory = fileSystem[fullPath] && Array.isArray(fileSystem[fullPath]);

  if (!isDirectory) {
    printToTerminal(`cd: not a directory: ${arg}`);
    return;
  }

  currentPath = `~/${fullPath}`;
  updatePrompt();
  break;

  case "cat":
  if (!arg) {
    printToTerminal("cat: missing file operand");
    return;
  }

  const fileContextKey = currentPath === "~" ? "~" : currentPath.replace(/^~\//, "");
  const filecontents = fileSystem[fileContextKey];

  if (!filecontents || !filecontents.includes(arg)) {
    printToTerminal(`cat: ${arg}: No such file`);
    return;
  }

  // Build file path
  let assetPath = "assets/";
  if (fileContextKey !== "~") {
    assetPath += fileContextKey + "/";
  }
  assetPath += arg;

  fetch(assetPath)
    .then(response => {
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return response.text();
    })
    .then(text => {
      printToTerminal(`📄 Contents of ${arg}:\n`);
      printToTerminal(text);
    })
    .catch(err => {
      printToTerminal(`cat: cannot read file: ${arg}`);
    });
  break;



    case "git":
  if ((arg === "clone" || arg == "pull") && parts[2]) {
    if (hasPulledProjects) {
      printToTerminal("Already up to date.");
      return;
    }
printToTerminal("Cloning into 'projects'...");

const steps = [
  "<span class='git-clone-step'>remote: Enumerating objects: 7, done.</span>",
  "<span class='git-clone-step'>remote: Counting objects: 100% (7/7), done.</span>",
  "<span class='git-clone-step'>remote: Compressing objects: 100% (4/4), done.</span>",
  "<span class='git-clone-step'>remote: Total 7 (delta 0), reused 7 (delta 0)</span>",
  "<span class='git-clone-step'>Unpacking objects: 100% (7/7), done.</span>",
  "<span class='git-success'>✔ Projects successfully pulled.</span>",
  `<span class="git-link">View my Github repos: <a href="https://github.com/NihalShah345?tab=repositories" target="_blank">https://github.com/NihalShah345?tab=repositories</a></span>`
];

let delay = 500;
steps.forEach((line, i) => {
  setTimeout(() => {
    printHTMLToTerminal(line);
    if (i === steps.length - 2) {
      hasPulledProjects = true;
      fileSystem["projects"] = [
        "CampNav",
        "Semantic_AI_Movie_Rec",
        "Flight_DBMS",
        "5G_Satellite_Research",
        "PDF_Things",
        "portfolio"
      ];

      fileSystem["projects/CampNav"] = ["README.md", "demo.mp4", "github.txt"];
      fileSystem["projects/Semantic_AI_Movie_Rec"] = ["README.md", "demo.mp4", "github.txt"];
      fileSystem["projects/Flight_DBMS"] = ["README.md", "demo.mp4", "github.txt"];
      fileSystem["projects/5G_Satellite_Research"] = ["README.md", "demo.mp4", "github.txt"];
      fileSystem["projects/PDF_Things"] = ["README.md", "demo.mp4", "github.txt"];
      fileSystem["projects/portfolio"] = ["README.md", "demo.mp4", "github.txt"];
    }
  }, delay * (i + 1));
});

  } else {
    printToTerminal("fatal: remote repository not found.");
  }
  break;
case "play":
  if (!arg) {
    printToTerminal("play: missing file operand");
    return;
  }

  // Strip "~/", result is "projects/CampNav"
  let pathKey = currentPath.replace(/^~\//, "");
  if (!fileSystem[pathKey] || !fileSystem[pathKey].includes(arg)) {
    printToTerminal(`play: ${arg}: No such file`);
    return;
  }

  // Expect structure: assets/projects/<project-name>/demo.mp4
  const projectName = pathKey.split("/")[1]; // CampNav, Flight_DBMS, etc.
  const videoPath = `assets/projects/${projectName}/${arg}`;

  const videoHTML = `
    <div style="margin-top: 10px;">
      <video width="480" controls>
        <source src="${videoPath}" type="video/mp4">
        Your browser does not support the video tag.
      </video>
    </div>
  `;

  printToTerminal(`▶️ Playing ${arg}...`);
  printRawHTMLToTerminal(videoHTML);
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


