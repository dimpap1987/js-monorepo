# How to start an ionic project in NX

npm install -g @ionic/cli

npm install @ionic/react @ionic/react-router ionicons

# What each package does:

# @ionic/react - The main Ionic components (buttons, cards, etc.)

# @ionic/react-router - Ionic's routing system (works with React Router)

# ionicons - Icon library (thousands of beautiful icons)

npm install -D @capacitor/core @capacitor/cli
nx generate @nx/react:application my-ionic-app --style=scss --routing
