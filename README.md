Standard Operating Procedure (SOP).


Prerequisites:
 
1.React Application: The target software must be a React application .
2.API Key: You will need a valid Google Generative AI API key to connect with the model.

Steps for Implementation:

STEP 1 : Install React and Required Libraries

run the below command 
npm install react-markdown remark-gfm react-syntax-highlighter @google/generative-ai

Step 2: Create the Clone of the Component

Inside your React application, create a new file  in the src folder.
Copy and paste the GeminiAI.jsx code into the created file.

Set up API Key:

In the ChatGPTClone component, the API key is fetched using import.meta.env.VITE_API_KEY. Make sure you create a .env file in the root of your project and define the API key:(inside .env)

API_KEY=your_google_api_key_here

Step 3: Integrating the ChatGPTClone Component into Your Application

Import the ChatGPTClone Component:
In the App.js or any other component where you want to display the chat interface, import the ChatGPTClone component:

import ChatGPTClone from './ChatGPTClone';

Step 4: Styling the Chat Interface

Customizing the Styles:
If necessary, modify the styles object inside the ChatGPTClone component to match the design requirements of your software. The component already includes basic styling, but it can be customized to match the look and feel of your app.

Test Styling:
Run the app and verify the chat interface displays as expected:

npm run dev

Ensure responsiveness and any additional UI adjustments as per your project.

Step 5: Google Generative AI API Configuration
Integrating Google Generative AI API:

The code dynamically loads the @google/generative-ai library and interacts with the GoogleGenerativeAI class. Ensure the API key is correct, and that the model is set as "gemini-2.0-flash" in the generateContent function.

Validating API Call:

Verify that the chat input correctly triggers an API call and that responses are generated and displayed in the chat interface.

You can monitor network activity and API responses using browser developer tools to ensure correct interaction with the Google API.

Step 6: Error Handling and Testing

Error Handling:
The handleSend function includes error handling that logs issues to the console and updates the chat UI if there’s a failure.
Test various edge cases such as:
Empty input or invalid input.
API failures (e.g., incorrect API key or connectivity issues).

Testing the Chat Interface:

Test the chat interface by sending various messages and verifying the responses.
Ensure that messages from the user and AI are clearly differentiated, and the styling looks appropriate.

Step 7: Deployment
Build the Application:

Once you are satisfied with the local testing, you can build your application for production:

npm run build

Deploy the Application:
You can deploy your app to platforms like Vercel, Netlify, or any other platform that supports React apps. Follow the respective deployment documentation for your chosen platform.
