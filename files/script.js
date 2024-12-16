// Inițializarea variabilelor globale
let processes = []; // lista proceselor
let executionTimes = []; // lista timpilor de execuție pentru fiecare proces
let priorities = []; // lista prioritaților, folosită doar pentru algoritmul de priorități
let algorithm = "roundRobin"; // algoritmul ales inițial

// Funcția care actualizează formularul în funcție de algoritmul ales
function updateAlgorithmForm() {
  algorithm = document.getElementById("algorithmSelect").value; // Obține algoritmul selectat
  addProcesses(); // Actualizează formularul cu câmpurile corespunzătoare algoritmului
}

// Funcția care adaugă câmpurile pentru introducerea proceselor
function addProcesses() {
  const numProcesses = document.getElementById("numProcesses").value; // Obține numărul de procese
  processes = []; // Resetează lista proceselor
  executionTimes = []; // Resetează lista timpilor de execuție
  priorities = []; // Resetează lista prioritaților
  const processData = document.getElementById("processData"); // Obține div-ul pentru datele proceselor
  processData.innerHTML = ""; // Curăță conținutul existent în div-ul respectiv

  // Adaugă câmpurile pentru fiecare proces
  for (let i = 0; i < numProcesses; i++) {
    processData.innerHTML += `
      <label>Nume proces ${i + 1}:</label>
      <input type="text" id="processName-${i}" placeholder="Introduceți numele procesului">
      <label>Timp de execuție:</label>
      <input type="number" id="processTime-${i}" placeholder="Introduceți timpul de execuție">
    `;
    // Dacă algoritmul ales este "priority", adaugă câmpul pentru prioritate
    if (algorithm === "priority") {
      processData.innerHTML += `
        <label>Prioritate (1-10):</label>
        <input type="number" id="processPriority-${i}" min="1" max="10" placeholder="Introduceți prioritatea">
      `;
    }
  }
}

// Funcția care calculează timpii și ordinea de execuție a proceselor
function calculate() {
  const numProcesses = document.getElementById("numProcesses").value; // Obține numărul de procese
  processes = []; // Resetează lista proceselor
  executionTimes = []; // Resetează lista timpilor de execuție
  priorities = []; // Resetează lista prioritaților

  // Adaugă informațiile pentru fiecare proces
  for (let i = 0; i < numProcesses; i++) {
    const processName = document.getElementById(`processName-${i}`).value;
    const processTime = document.getElementById(`processTime-${i}`).value;
    processes.push(processName); // Adaugă numele procesului
    executionTimes.push(parseInt(processTime)); // Adaugă timpul de execuție al procesului
    // Dacă algoritmul este "priority", adaugă și prioritatea
    if (algorithm === "priority") {
      const priority = document.getElementById(`processPriority-${i}`).value;
      priorities.push(parseInt(priority)); // Adaugă prioritatea procesului
    }
  }

  let result;
  // În funcție de algoritmul selectat, apelează funcția corespunzătoare
  if (algorithm === "roundRobin") {
    const quantum = parseInt(prompt("Introduceți cuantul de timp (K):")); // Cere utilizatorului cuantul de timp
    result = roundRobin(processes, executionTimes, quantum); // Apelează algoritmul Round Robin
  } else if (algorithm === "priority") {
    result = priorityScheduling(processes, executionTimes, priorities); // Apelează algoritmul de priorități
  }

  // Afișează rezultatele
  displayResults(result);
}

// Algoritmul Round Robin
function roundRobin(processes, executionTimes, quantum) {
  let remainingTimes = [...executionTimes]; // Copie a timpurilor de execuție rămase
  let completionTimes = Array(processes.length).fill(0); // Timpii de finalizare
  let currentTime = 0; // Timpul curent
  let executionOrder = []; // Ordinea de execuție a proceselor
  let queue = Array.from(Array(processes.length).keys()); // Coada de procese (indici)

  // Continuă până când toate procesele sunt finalizate
  while (remainingTimes.some((rt) => rt > 0)) {
    const processIndex = queue.shift(); // Ia procesul din fața cozii
    const execTime = Math.min(quantum, remainingTimes[processIndex]); // Calculează timpul de execuție pentru acest proces
    currentTime += execTime; // Actualizează timpul curent
    remainingTimes[processIndex] -= execTime; // Actualizează timpul rămas pentru proces
    executionOrder.push({ process: processes[processIndex], execTime }); // Adaugă procesul și timpul său în ordinea de execuție

    // Dacă procesul nu este complet, îl pune din nou în coadă
    if (remainingTimes[processIndex] > 0) {
      queue.push(processIndex);
    } else {
      completionTimes[processIndex] = currentTime; // Notează timpul de finalizare al procesului
    }
  }

  // Calculul timpului mediu de răspuns și al timpului mediu de rulare ponderat
  const averageResponseTime =
    executionTimes.reduce((a, b) => a + b, 0) / processes.length;
  const weightedTurnaroundTime =
    executionOrder.reduce(
      (sum, { execTime }, i) =>
        sum + (executionOrder.length - i) * execTime,
      0
    ) / executionOrder.length;

  return {
    executionOrder,
    completionTimes,
    averageResponseTime,
    weightedTurnaroundTime,
  };
}

// Algoritmul de programare pe bază de priorități
function priorityScheduling(processes, executionTimes, priorities) {
  // Sortează procesele în funcție de prioritate (cele mai mari prioritate primele)
  let sortedProcesses = sortedProcessesByPriority(processes, executionTimes, priorities);
  let executionOrder = []; // Ordinea de execuție
  let currentTime = 0; // Timpul curent
  let weightedSum = 0; // Suma ponderată

  // Procesele sunt executate în ordinea priorității
  sortedProcesses.forEach(([process, execTime, priority], i) => {
    executionOrder.push({ process, execTime, priority });
    weightedSum += (sortedProcesses.length - i) * execTime; // Suma ponderată pentru calculul timpului mediu
  });

  // Calculul timpului mediu de răspuns și al timpului mediu de rulare
  const averageResponseTime =
    executionTimes.reduce((a, b) => a + b, 0) / processes.length;
  const averageTurnaroundTime = weightedSum / processes.length;

  return {
    executionOrder,
    averageResponseTime,
    averageTurnaroundTime,
  };
}

// Funcția pentru sortarea proceselor în funcție de prioritate
function sortedProcessesByPriority(processes, executionTimes, priorities) {
  return processes
    .map((process, i) => [process, executionTimes[i], priorities[i]]) // Combinați procesele cu timpii și prioritatea lor
    .sort((a, b) => b[2] - a[2]); // Sortează descrescător în funcție de prioritate
}

// Funcția care afișează rezultatele
function displayResults({
  executionOrder,
  completionTimes,
  averageResponseTime,
  weightedTurnaroundTime,
}) {
  const outputSection = document.getElementById("output-section"); // Obține secțiunea pentru rezultate
  const executionOrderDiv = document.getElementById("execution-order"); // Obține div-ul pentru ordinea de execuție
  const completionTimesDiv = document.getElementById("completion-times"); // Obține div-ul pentru timpii de finalizare
  const averagesDiv = document.getElementById("averages"); // Obține div-ul pentru medii

  outputSection.style.display = "block"; // Afișează secțiunea de rezultate

  // Afișează ordinea de execuție
  executionOrderDiv.innerHTML = "<h3>Ordinea de execuție:</h3>";
  executionOrder.forEach(({ process, execTime }) => {
    executionOrderDiv.innerHTML += `<p>${process}: ${execTime} unități</p>`;
  });

  // Afișează timpii de finalizare dacă există
  if (completionTimes) {
    completionTimesDiv.innerHTML = "<h3>Timpii de finalizare:</h3>";
    processes.forEach((process, i) => {
      completionTimesDiv.innerHTML += `<p>${process}: ${completionTimes[i]} unități</p>`;
    });
  }

  // Afișează mediile calculate
  averagesDiv.innerHTML = `
    <h3>Medii:</h3>
    <p>Timp mediu de răspuns: ${averageResponseTime.toFixed(
    2
  )} unități</p>
    ${weightedTurnaroundTime
      ? `<p>Timp mediu de rulare (Weighted Turnaround Time): ${weightedTurnaroundTime.toFixed(
        2
      )} unități</p>`
      : ""
    }
  `;
}

