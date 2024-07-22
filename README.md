# ⚠️⚠️⚠️ WARNING: THIS PROJECT IS STILL UNDER DEVELOPMENT AND IS NOT READY FOR PRODUCTION USE ⚠️⚠️⚠️

# OpenForum

OpenForum is an open-source forum template built with a TypeScript backend, designed to serve as a base for developers to create their own forums. Users can discuss any topic, making it a versatile platform for various communities.

## Table of Contents

- [OpenForum](#openforum)
  - [Table of Contents](#table-of-contents)
  - [Project Overview](#project-overview)
  - [Features](#features)
  - [Installation](#installation)
    - [Prerequisites](#prerequisites)
    - [Steps](#steps)
  - [Usage](#usage)
  - [Contributing](#contributing)
    - [Contributor License Agreement (CLA)](#contributor-license-agreement-cla)
    - [Code Style and Testing](#code-style-and-testing)
  - [Feedback](#feedback)
  - [License](#license)

## Project Overview

OpenForum is designed to be a flexible and extensible forum template that developers can use to build custom forums for their specific needs. With a TypeScript backend, it ensures type safety and scalability.

## Features

- **Multi-topic discussions**: Users can create and participate in discussions on a wide range of topics.
- **TypeScript backend**: Ensures type safety and maintainability.
- **MongoDB integration**: For robust data storage and management.
- **Node.js**: Leverages the power and simplicity of Node.js for backend operations.

## Installation

### Prerequisites

- **Node.js**: Ensure you have Node.js installed. You can download it from [nodejs.org](https://nodejs.org/).
- **MongoDB**: Make sure you have MongoDB installed and running. You can download it from [mongodb.com](https://www.mongodb.com/).

### Steps

1. **Clone the repository**:
    ```sh
    git clone https://github.com/programORdie2/OpenForum.git
    cd OpenForum
    ```

2. **Install dependencies**:
    ```sh
    npm install
    ```

3. **Set up environment variables**:
    Create a `.env` file in the root directory and add the following:
    ```env
    PORT=3000
    JWT_SECRET="ASecretToEncryptSessions"
    DB_URL="mongodb://localhost:27017/openforum"
    ```

4. **Run the application**:
    ```sh
    npm run dev
    ```
    Or:
    ```
    npm run build
    npm start
    ```

5. **Access the forum**:
    Open your browser and navigate to `http://localhost:3000`.

## Usage

Once the forum is up and running, users can start creating discussions on any topic. Developers can further customize the forum by modifying the source code to suit their specific requirements.

## Contributing

We welcome contributions from the community! To contribute to OpenForum, please follow these steps:

1. **Fork the repository**.
2. **Create a new branch**: `git checkout -b my-feature-branch`.
3. **Make your changes** and commit them: `git commit -m 'Add new feature'`.
4. **Push to the branch**: `git push origin my-feature-branch`.
5. **Submit a pull request**.

### Contributor License Agreement (CLA)

All contributors must sign a Contributor License Agreement (CLA) before their contributions can be merged. This ensures that the project can remain open-source and free to use.

### Code Style and Testing

Please adhere to the existing code style and ensure your changes pass all automated error checks before submitting a pull request.

## Feedback

We value your feedback! If you have any suggestions, issues, or feature requests, please [open an issue](https://github.com/programORdie2/OpenForum/issues) on GitHub.

## License

OpenForum is released under the AGPL-3.0 License. See the [LICENSE](LICENSE) file for more details.