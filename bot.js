const { Client, GatewayIntentBits } = require('discord.js');
const axios = require('axios');
const fs = require('fs');

// Read the API token from 'ctoken.txt'
const GOOGLE_GEMINI_API_KEY = fs.readFileSync('ctoken.txt', 'utf8').trim();

// Create a new Discord client with necessary intents
const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

// Function to call Google Gemini API
async function getGeminiResponse(prompt) {
    try {
        const response = await axios.post(
            'https://your-gemini-api-endpoint.com',  // Replace with actual Gemini API endpoint
            {
                prompt: prompt, // Adjust payload structure as per Gemini API spec
                model: 'gemini-1', // Use correct model version
            },
            {
                headers: {
                    'Authorization': `Bearer ${GOOGLE_GEMINI_API_KEY}`,
                    'Content-Type': 'application/json',
                },
            }
        );
        return response.data.output; // Adjust based on actual API response structure
    } catch (error) {
        console.error('Error getting response from Gemini:', error);
        return 'Error: Could not get a response from Gemini.';
    }
}

// When bot is ready
client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

// Event listener for message creation
client.on('messageCreate', async (message) => {
    if (message.author.bot) return; // Ignore bot messages

    const userPrompt = message.content;

    // Send the initial waiting message
    const waitingMessages = ['Waiting .', 'Waiting ..', 'Waiting ...', 'Waiting ..'];
    let currentIndex = 0;
    let waitingMessage = await message.channel.send(waitingMessages[currentIndex]);

    // Set an interval to update the waiting message every second
    const waitingInterval = setInterval(async () => {
        currentIndex = (currentIndex + 1) % waitingMessages.length;
        await waitingMessage.edit(waitingMessages[currentIndex]);
    }, 1000); // Update every second

    // Fetch response from Gemini API
    const geminiResponse = await getGeminiResponse(userPrompt);

    // Stop the waiting animation and delete the waiting message
    clearInterval(waitingInterval);
    await waitingMessage.delete();

    // Send the response back to the Discord channel
    await message.channel.send(geminiResponse);
});

// Log in to Discord with your bot token
client.login('YOUR_DISCORD_BOT_TOKEN');  // Replace with your bot token
