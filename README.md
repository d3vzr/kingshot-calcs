# 🏰 Kingshot Calculators

Essential calculators and tools for Kingshot mobile game players.

## 🎯 Features

### Resource Balancer
- Balance your resources using the standard ratio **Bread:Wood:Stone:Iron = 20:20:4:1**
- Input values in millions for easy handling of large numbers
- Instantly see which resource you need most
- Beautiful, mobile-friendly interface
- Works completely offline

## 🚀 Getting Started

### Prerequisites
- Node.js 20.19+ or 22.12+
- pnpm (or npm/yarn)

### Installation

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build
```

## 📱 Adding New Calculators

The app is structured to easily add new calculators:

1. **Create your calculator component** in `src/components/`
   ```tsx
   // src/components/YourCalculator.tsx
   export default function YourCalculator() {
     return <div>Your calculator here</div>
   }
   ```

2. **Add the tab** in `src/App.tsx`:
   ```tsx
   const tabs = [
     { id: 'balancer', label: 'Resource Balancer', icon: '⚖️' },
     { id: 'your-calc', label: 'Your Calculator', icon: '🎯' },
   ];
   ```

3. **Add the route** in the switch statement:
   ```tsx
   case 'your-calc':
     return <YourCalculator />;
   ```

## 🎨 Tech Stack

- React 19
- TypeScript
- Vite (Rolldown)
- CSS3 (with dark mode support)

## 👨‍💻 Built By

**Ahmed** from **Kingdom 844** ❤️

## 📄 License

This project is open source and available for all Kingshot players.
