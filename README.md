# Wanderer Learning

![Version](https://img.shields.io/badge/version-0.9.2-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Framework](https://img.shields.io/badge/framework-Vue.js%203-brightgreen.svg)
![UI](https://img.shields.io/badge/UI-Quasar-blue.svg)
![Backend](https://img.shields.io/badge/backend-AWS%20Amplify-orange.svg)

> **⚠️ Development Status**: This project is currently **discontinued** in favor of a more modern approach implemented in [on-track](https://github.com/julienreichel/on-track). This repository serves as the foundational work and proof of concept for the newer implementation.

An AI-powered e-learning platform that enables educators to create interactive courses and lectures with automated content generation capabilities. Built with Vue.js 3, Quasar Framework, and AWS Amplify.

## 📖 Project Overview

Wanderer Learning was developed as an innovative e-learning platform with the following key capabilities:

- **AI-Driven Content Creation**: Automatic generation of course content, quizzes, and visual elements using OpenAI's GPT models
- **Interactive Learning Experiences**: Support for various content types including text, images, videos, drawings, and mathematical equations
- **Concept-Based Learning**: Educational content organized around learning concepts with difficulty levels
- **Quiz and Assessment System**: Automated quiz generation with multiple question types and adaptive difficulty
- **Multi-language Support**: Internationalization support (English/French) for global accessibility
- **Visual Content Creation**: Integration with Excalidraw for interactive drawings and Mermaid for diagrams

### Key Features Implemented

- **Course Management**: Create, edit, and organize courses with hierarchical lecture structures
- **Lecture Wizard**: Step-by-step AI-assisted lecture creation from course descriptions or PDF uploads
- **Rich Content Editor**: Support for Markdown, KaTeX equations, and interactive visual elements
- **Progress Tracking**: Student progress monitoring with detailed reporting and analytics
- **Responsive Design**: Mobile-friendly interface optimized for various screen sizes
- **File Management**: AWS S3 integration for media storage and PDF processing

## 🏗️ Architecture

### Technology Stack

**Frontend**
- **Vue.js 3** with Composition API
- **Quasar Framework** for UI components and responsive design
- **Vue Router** for SPA routing
- **Vue i18n** for internationalization

**Backend & Infrastructure**
- **AWS Amplify Gen 2** for backend services
- **Amazon DynamoDB** for data persistence
- **AWS Lambda** for serverless functions
- **Amazon S3** for file storage
- **AWS Cognito** for authentication
- **AWS AppSync** for GraphQL API

**AI & Content Generation**
- **OpenAI GPT-4** and GPT-4-mini for content generation
- **Custom AI prompts** for educational content optimization
- **Automated quiz generation** with difficulty adaptation
- **PDF text extraction** using PDF.js

### Data Model

```
Course
├── Lectures (hasMany)
│   ├── LectureSteps (hasMany)
│   │   ├── Parts (embedded)
│   │   │   ├── Text Content
│   │   │   ├── Images/Videos
│   │   │   ├── Quizzes
│   │   │   └── Drawings
│   │   └── Concept Associations
│   └── Concepts (manyToMany)
└── Progress Tracking
    ├── Step Reporting
    └── Quiz Results
```

### Project Structure

```
src/
├── components/          # Vue components
│   ├── concept/        # Concept management
│   ├── lecture/        # Lecture editing/display
│   ├── part/          # Content parts (text, quiz, etc.)
│   ├── wizard/        # AI-powered content generation
│   └── common/        # Shared components
├── services/          # Business logic layer
│   ├── ai.js         # AI service integration
│   ├── course.js     # Course management
│   ├── lecture.js    # Lecture operations
│   └── prompts/      # AI prompt templates
├── pages/            # Route components
└── composables/      # Reusable Vue composition functions

amplify/
├── auth/             # Cognito configuration
├── data/             # GraphQL schema & resolvers
├── functions/        # Lambda functions
└── storage/          # S3 bucket configuration
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v18, v20, v22, or v24)
- npm (>= 6.13.4) or yarn (>= 1.21.1)
- AWS CLI configured
- Amplify CLI installed globally

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/julienreichel/wanderer-learning.git
   cd wanderer-learning
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Configure AWS Amplify**
   ```bash
   npx ampx sandbox
   ```

4. **⚠️ Configure Authentication**

   **Important**: You must update the Google authentication configuration before deployment:

   - Edit `amplify/auth/resource.ts`
   - Replace the placeholder Google OAuth credentials with your own:
     ```typescript
     // Update these values in amplify/auth/resource.ts
     loginWith: {
       externalProviders: {
         callbackUrls: {
           "YOUR_CALLBACK_URLS",
           ...
         }
       }
     }
     ```
   - Configure your Google OAuth application in the [Google Cloud Console](https://console.cloud.google.com/)
   - Add your domain to authorized JavaScript origins and redirect URIs

### Development

1. **Start development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

2. **Access the application**
   - Open http://localhost:9000 in your browser

### Building for Production

```bash
npm run build
# or
yarn build
```

### Code Quality

```bash
# Lint code
npm run lint

# Format code
npm run format
```

## 📚 Usage

### Creating a Course

1. Navigate to the course creation page
2. Provide course title and description
3. Use the AI wizard to generate content automatically
4. Customize generated content as needed

### AI-Powered Lecture Generation

1. Access the Lecture Wizard
2. Input course description or upload PDF materials
3. Review AI-generated concepts and learning objectives
4. Generate table of contents with AI assistance
5. Create comprehensive lecture content with quizzes and visuals

### Content Types Supported

- **Text**: Rich text with Markdown support
- **Mathematics**: KaTeX equation rendering
- **Diagrams**: Mermaid chart integration
- **Interactive Drawings**: Excalidraw integration
- **Quizzes**: Multiple choice, checkboxes, and open-ended questions
- **Media**: Images, videos, and document uploads

## 🛠️ Development History

The project evolved through multiple versions with significant milestones:

- **v0.1.x**: Initial MVP with basic course creation
- **v0.2.x**: AI integration for content generation
- **v0.3.x**: Enhanced UI and concept management
- **v0.4.x**: International support and private courses
- **v0.5.x**: Quiz improvements and KaTeX equations
- **v0.6.x**: Advanced reporting and GraphQL optimization
- **v0.7.x**: Drawing integration and playground features
- **v0.8.x**: Enhanced reporting dashboard
- **v0.9.x**: AI drawing generation and user action recording

## 🔄 Migration to On-Track

Development of Wanderer Learning has been discontinued in favor of [on-track](https://github.com/julienreichel/on-track), which implements a more modern and scalable approach to the same educational goals. Key improvements in the new project include:

- Modern development practices and architecture
- Enhanced performance and user experience
- Improved AI integration capabilities
- Better scalability and maintainability

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Contributing

While this project is no longer actively maintained, the codebase serves as a valuable reference implementation. For active development, please consider contributing to [on-track](https://github.com/julienreichel/on-track).

## 📞 Contact

**Author**: Julien Reichel
**GitHub**: [@julienreichel](https://github.com/julienreichel)

---

*This project represents a significant exploration into AI-powered educational technology and serves as the foundation for more advanced implementations.*
