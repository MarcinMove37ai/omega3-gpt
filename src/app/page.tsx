export const dynamic = 'force-dynamic'
export const revalidate = 0

import React from 'react'
import Link from 'next/link'

function Home() {
  return (
    <div id="app-root">
      <MedicalChatbotLoader />
    </div>
  )
}

// Komponent ładujący właściwy chatbot
function MedicalChatbotLoader() {
  return (
    <div suppressHydrationWarning>
      <div id="medical-chatbot-root" suppressHydrationWarning>
        Loading...
      </div>
      <script
        dangerouslySetInnerHTML={{
          __html: `
            (function loadApp() {
              import('/components/MedicalChatbot').then(module => {
                const MedicalChatbot = module.default;
                const root = document.getElementById('medical-chatbot-root');
                if (root) {
                  const app = React.createElement(MedicalChatbot);
                  ReactDOM.render(app, root);
                }
              });
            })();
          `,
        }}
      />
    </div>
  )
}

export default Home