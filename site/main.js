const terminalInput = document.querySelector('#terminal-input');
const terminalOutput = document.querySelector('.terminal-output');



terminalInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        const userInput = terminalInput.value.trim();
        if (userInput !== null && userInput !== '') {
            terminalOutput.scrollTop = terminalOutput.scrollHeight;
            updateTerminalOutput(`You: ${userInput}`);
            processUserInput(userInput);
            terminalInput.value = '';
        }
    }
});

async function generateResponse(prompt) {
    try {
        const response = await fetch('http://localhost:11434/api/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'llama2',
                prompt: prompt,
                stream: true
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        terminalOutput.innerHTML += 'Ollama: ';

        reader.read().then(function processText({ done, value }) {
            if (done) {
                return;
            }

            const chunk = decoder.decode(value, { stream: true });
            
            const lines = chunk.split('\n');
            
            lines.forEach(line => {
                if (line.trim()) {
                    try {
                        
                        const data = JSON.parse(line);
                        if (data.response) {
                            liveUpdateTerminalOutput(data.response);
                        }
                    } catch (error) {
                        console.error('JSON parse error:', error);
                    }
                }
            });
            return reader.read().then(processText);
        });
    } catch (error) {
        console.error('Error:', error);
    }
}

async function processUserInput(input) {
    try {
        generateResponse(input);
    } catch (error) {
        console.error(`Error: ${error}`);
        updateTerminalOutput(`Error: ${error.message}`);
    }
}

function updateTerminalOutput(output) {
    terminalOutput.innerHTML += output + '<br>';
}

function liveUpdateTerminalOutput(output) {
    terminalOutput.scrollTop = terminalOutput.scrollHeight;
    terminalOutput.innerHTML += output;
    if (output.includes('\n')) {
        terminalOutput.innerHTML += '<br>';
    }
}