# Oracle

Oracle is an innovative tool developed to summarize your Twitter timeline using cutting-edge AI. This project was created for the HackFS hackathon, leveraging the power of Galadriel, the first Layer 1 for AI, and RapidAPI for Twitter data.

## Features

- **AI-Powered Summarization**: Get concise summaries of your Twitter timeline.
- **Seamless Integration**: Utilizes Galadriel for AI processing and RapidAPI for Twitter timeline data.
- **User-Friendly Interface**: A React-based frontend for easy interaction.

## Getting Started

To get Oracle running locally, follow the steps below:

### Prerequisites

- Node.js installed on your machine
- NPM (Node Package Manager)
- A private key for Galadriel
- RapidAPI keys for Twitter and news data

### Installation

#### Backend Server

1. Navigate to the `backend` folder:
   ```bash
   cd backend
   ```

2. Install the dependencies:
   ```bash
   npm install
   ```

3. Add your `PRIVATE_KEY_GALADRIEL` to the `.env` file:
   ```env
   PRIVATE_KEY_GALADRIEL=your_private_key_here
   ```

4. Start the backend server:
   ```bash
   npm start
   ```

#### Client (Frontend)

1. Navigate to the `client` folder:
   ```bash
   cd client
   ```

2. Install the dependencies:
   ```bash
   npm install
   ```

3. Fill in the `.env` file with your RapidAPI keys:
   ```env
   REACT_APP_X_RAPIDAPI_KEY=your_rapidapi_key_here
   REACT_APP_NEWS_RAPIDAPI_KEY=your_news_rapidapi_key_here
   ```

4. Start the client:
   ```bash
   npm start
   ```

### Smart Contract

#### Deployment

1. Navigate to the `smart-contract` folder:
   ```bash
   cd smart-contract
   ```

2. Add your `PRIVATE_KEY_GALADRIEL` and `ORACLE_ADDRESS` to the `.env` file:
   ```env
   PRIVATE_KEY_GALADRIEL=your_private_key_here
   ORACLE_ADDRESS="0x4168668812C94a3167FCd41D12014c5498D74d7e"
   ```

3. Deploy the smart contract using your preferred method.

### Smart Contract Deployment

You can view the deployed smart contract on the Galadriel blockchain explorer at the following link: [Oracle Smart Contract](https://explorer.galadriel.com/address/0x804BCb3B87F93Ec42B672cda3f88A1978d6e884F)

### Usage

Once both the backend server and the client application are running, you can interact with Oracle through the user-friendly web interface. 


## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any changes or improvements.

## License

This project is licensed under the MIT License. See the LICENSE file for details.

## Acknowledgments

- **Galadriel**: The first Layer 1 for AI
- **RapidAPI**: For providing the Twitter timeline data
- **HackFS**: For hosting the hackathon

Enjoy summarizing your Twitter timeline with Oracle!