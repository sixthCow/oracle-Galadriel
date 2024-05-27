require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { ethers } = require('ethers');
const ABI = require('./abis/Agent.json');
const app = express();
const port = 3100;

app.use(cors());
app.use(express.json());

app.post('/run-command', async (req, res) => {
    const { prompt } = req.body;

    if (!prompt) {
        console.log('Prompt is required');
        return res.status(400).send('Prompt is required');
    }

    // Sanitize and extract fields
    console.log('prompt:', prompt);
    // const sanitizedPrompt = sanitizeAndExtractFields(prompt);
    // if (!sanitizedPrompt) {
    //     return res.status(400).send('Invalid prompt format');
    // }
    let sanitizedPrompt;
    if (prompt.startsWith('Imagine')) {
        sanitizedPrompt = sanitizeImaginePrompt(prompt);
    } else {
        sanitizedPrompt = sanitizeAndExtractFields(prompt);
    }

    if (!sanitizedPrompt) {
        return res.status(400).send('Invalid prompt format');
    }

    console.log('Running agent with sanitized prompt:', sanitizedPrompt);

    try {
        const response = await runAgentWithPrompt(sanitizedPrompt);
        res.send(response);
    } catch (error) {
        console.error(`Error running agent: ${error.message}`);
        res.status(500).send(`Error: ${error.message}`);
    }
});

function sanitizeImaginePrompt(prompt) {
    console.log('Sanitizing "Imagine" prompt');
    try {
        // Remove any backslashes and new line characters
        let sanitizedPrompt = prompt.replace(/\\n/g, ' ')
                                    .replace(/\\'/g, "'")
                                    .replace(/\\"/g, '"')
                                    .replace(/[\n\r]/g, ' ')
                                    .trim();
        return sanitizedPrompt;
    } catch (error) {
        console.error(`Error sanitizing "Imagine" prompt: ${error.message}`);
        return null;
    }
}


// function sanitizeAndExtractFields(prompt) {
//     console.log('Sanitizing and extracting fields');
//     try {
//         const timelineStartIndex = prompt.indexOf('{"timeline":');
//         const timelineEndIndex = prompt.lastIndexOf('}}') + 2;

//         if (timelineStartIndex === -1 || timelineEndIndex === -1) {
//             throw new Error('Timeline JSON not found in prompt');
//         }

//         let timelineJson = prompt.slice(timelineStartIndex, timelineEndIndex);

//         // Replace any invalid JSON characters
//         timelineJson = timelineJson.replace(/\\n/g, ' ')
//                                    .replace(/\\'/g, "'")
//                                    .replace(/\\"/g, '"');

//         // Ensure the JSON is properly formatted
//         const lastValidCharIndex = timelineJson.lastIndexOf('}');
//         if (lastValidCharIndex !== -1) {
//             // Ensure the array ends with ']}'
//             if (timelineJson[lastValidCharIndex + 1] !== ']') {
//                 timelineJson = timelineJson.slice(0, lastValidCharIndex + 1) + ']';
//             }
//             // Ensure the whole JSON ends with ']}'
//             if (timelineJson[timelineJson.length - 1] !== '}') {
//                 timelineJson += '}';
//             }
//         }
//         console.log('Final timeline JSON string:', timelineJson);
//         const tweets = JSON.parse(timelineJson).timeline;
//         const sanitizedTweets = tweets.map(tweet => ({
//             created_at: tweet.created_at,
//             screen_name: tweet.screen_name,
//             text: tweet.text.replace(/[\\"']/g, '').replace(/\u0000/g, '')
//         }));

//         // Create the desired cleaned output
//         let cleanedOutput = 'Read this timeline from Twitter: {timeline:[';
//         sanitizedTweets.forEach(tweet => {
//             cleanedOutput += `{created_at:${tweet.created_at},screen_name:${tweet.screen_name},text:${tweet.text.replace(/'/g, '')}}, `;
//         });
//         cleanedOutput = cleanedOutput.slice(0, -2) + ']} Based on this timeline, generate a very detailed analysis as if you are a professional sentiment analyzer on these key categories. Provide at least 3-4 paragraphs each, incorporating specific details mentioned from the timeline data into your paragraphs. Be analytical and detailed, do not use lists only paragraphs in this format: [Background {brief history about event/topic?}, Relevant Locations and Dates, Summarization {summarize what the posts are discussing about the topic}, Trending Discussions {what key words were used? what did users talk about?}, Sentiment Analysis {compare views and emotions on the topic between users in the data}, Impact Assessment {what lasting impact does this event have?}. Be very detailed, professional, and descriptive in your response, in organized markdown format.';

//         return cleanedOutput;
//     } catch (error) {
//         console.error(`Error sanitizing and extracting fields: ${error.message}`);
//         return null;
//     }
// }

function sanitizeAndExtractFields(prompt) {
    console.log('Sanitizing and extracting fields');
    try {
        const createdAtRegex = /"created_at":"([^"]*)"/g;
        const screenNameRegex = /"screen_name":"([^"]*)"/g;
        const textRegex = /"text":"([^"]*)"/g;

        const createdAts = [];
        const screenNames = [];
        const texts = [];

        let match;

        // Extract created_at fields
        while ((match = createdAtRegex.exec(prompt)) !== null) {
            createdAts.push(match[1]);
        }

        // Extract screen_name fields
        while ((match = screenNameRegex.exec(prompt)) !== null) {
            screenNames.push(match[1]);
        }

        // Extract text fields and filter for English characters
        const englishTextRegex = /^[A-Za-z0-9\s.,!?'"-]*$/;

        while ((match = textRegex.exec(prompt)) !== null) {
            let text = match[1].replace(/"/g, '').replace(/[\n\r\\]/g, ' ');
            if (englishTextRegex.test(text)) {
                texts.push(text);
            }
        }

        // Create the desired cleaned output
        let cleanedOutput = 'Read this this timeline from Twitter: {timeline:[';
        for (let i = 0; i < createdAts.length; i++) {
            cleanedOutput += `{created_at:${createdAts[i]},screen_name:${screenNames[i]},text:${texts[i] ? texts[i].replace(/'/g, '') : ''}}, `;
        }
        cleanedOutput = cleanedOutput.slice(0, -2) + ']} Based on this timeline, generate a very detailed analysis as if you are a professional sentiment analyzer on these key categories. Provide at least 3-4 paragraphs each, incorporating specific details mentioned from the timeline data into your paragraphs. Be analytical and detailed, do not use lists only paragraphs in this format: [Background {brief history about event/topic?}, Relevant Locations and Dates, Summarization {summarize what the posts are discussing about the topic}, Trending Discussions {what key words were used? what did users talk about?}, Sentiment Analysis {compare views and emotions on the topic between users in the data}, Impact Assessment {what lasting impact does this event have?}. Be very detailed, professional, and descriptive in your response, in organized markdown format.';

        return cleanedOutput;
    } catch (error) {
        console.error(`Error sanitizing and extracting fields: ${error.message}`);
        return null;
    }
}



async function runAgentWithPrompt(prompt) {
    const rpcUrl = process.env.RPC_URL;
    const privateKey = process.env.PRIVATE_KEY;
    const contractAddress = process.env.AGENT_CONTRACT_ADDRESS;

    if (!rpcUrl || !privateKey || !contractAddress) {
        throw new Error('Missing required environment variables');
    }

    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const wallet = new ethers.Wallet(privateKey, provider);
    const contract = new ethers.Contract(contractAddress, ABI, wallet);

    const maxIterations = 2; // Set the number of iterations to 5

    // Call the runAgent function
    const transactionResponse = await contract.runAgent(prompt, maxIterations);
    const receipt = await transactionResponse.wait();
    console.log(`Task sent, tx hash: ${receipt.transactionHash}`);
    // console.log(`Agent started with task: "${prompt}"`);

    // Get the agent run ID from transaction receipt logs
    const agentRunID = getAgentRunId(receipt, contract);
    console.log("agentRunID", agentRunID)
    if (agentRunID === undefined) {
        throw new Error('Agent run ID not found in transaction receipt');
    }

    let allMessages = [];
    while (true) {
        const newMessages = await getNewMessages(contract, agentRunID, allMessages.length);
        allMessages = allMessages.concat(newMessages);

        if (await contract.isRunFinished(agentRunID)) {
            break;
        }

        await new Promise(resolve => setTimeout(resolve, 2000));
    }

    // Extract the final response from allMessages
    console.log(allMessages)
    const finalResponse = extractResponse(allMessages);
    return finalResponse;
}

function getAgentRunId(receipt, contract) {
    let agentRunID;
    for (const log of receipt.logs) {
        try {
            const parsedLog = contract.interface.parseLog(log);
            if (parsedLog && parsedLog.name === 'AgentRunCreated') {
                agentRunID = parsedLog.args[1];
                // Convert the agentRunID to a number
                if (ethers.BigNumber.isBigNumber(agentRunID)) {
                    agentRunID = agentRunID.toNumber();
                }
                break; 
            }
        } catch (error) {
            console.log('Could not parse log:', log);
        }
    }
    return agentRunID;
}

async function getNewMessages(contract, agentRunID, currentMessagesCount) {
    const messages = await contract.getMessageHistoryContents(agentRunID);
    const roles = await contract.getMessageHistoryRoles(agentRunID);

    const newMessages = [];
    for (let i = currentMessagesCount; i < messages.length; i++) {
        newMessages.push({
            role: roles[i],
            content: messages[i]
        });
    }
    return newMessages;
}

function extractResponse(messages) {
    // Process the messages to create a final response
    // Assuming the last message from the 'assistant' role is the final response
    const finalMessage = messages.filter(msg => msg.role === 'assistant').pop();
    if (!finalMessage) {
        throw new Error('No final response found from assistant');
    }
    return finalMessage.content;
}

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
