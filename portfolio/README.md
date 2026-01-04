# 🎨 Digital Resume Portfolio - Angular App

A modern, responsive digital resume/portfolio built with **Angular 18** and **SCSS**.

## 🚀 Features

- ✅ **Modern UI/UX** - Beautiful gradient designs and smooth animations
- ✅ **Fully Responsive** - Works perfectly on all devices
- ✅ **Single Page Application** - Smooth scrolling between sections
- ✅ **Section Components**:
  - 👤 About - Hero section with profile and social links
  - 💼 Experience - Work history timeline
  - 🎓 Education - Academic background
  - 🛠️ Skills - Technical skills with progress bars
  - 📁 Projects - Portfolio showcase
  - 📧 Contact - Contact form and information
  - 🔗 Footer - Social links and copyright

## 📦 Installation

```bash
# Navigate to portfolio folder
cd codingTerminals-Interview-Website/portfolio

# Install dependencies
npm install

# Start development server
ng serve

# Open browser at http://localhost:4200
```

## 🎯 Quick Start

1. **Update Your Information**:
   - Edit each component's `.ts` file to add your personal data
   - Replace placeholder image in `about.component.html`
   - Update social links and contact info

2. **Customize Colors**:
   - Modify CSS variables in `src/styles.scss`
   - Change gradient colors in component styles

3. **Add Your Resume PDF**:
   - Place your resume PDF in `src/assets/resume.pdf`

## 📁 Project Structure

```
portfolio/
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   ├── header/       # Navigation bar
│   │   │   ├── about/        # Hero section
│   │   │   ├── experience/   # Work experience
│   │   │   ├── education/    # Education history
│   │   │   ├── skills/       # Technical skills
│   │   │   ├── projects/     # Portfolio projects
│   │   │   ├── contact/      # Contact form
│   │   │   └── footer/       # Footer
│   │   ├── app.component.*
│   │   ├── app.config.ts
│   │   └── app.routes.ts
│   ├── styles.scss           # Global styles
│   └── index.html
└── angular.json
```

## 🎨 Customization Guide

### Update Profile Picture
Replace the placeholder in `about.component.html`:
```html
<img src="assets/your-photo.jpg" alt="Your Name">
```

### Update Personal Info
Edit `about.component.html` and `about.component.ts`:
```typescript
export class AboutComponent {
  yearsOfExperience = 5; // Your experience years
}
```

### Add Social Links
Update links in `about.component.html`:
```html
<a href="https://github.com/YOUR_USERNAME">GitHub</a>
<a href="https://linkedin.com/in/YOUR_PROFILE">LinkedIn</a>
```

## 🚀 Build for Production

```bash
# Build optimized production bundle
ng build --configuration production

# Output will be in dist/portfolio folder
# Deploy the dist/portfolio folder to your hosting
```

## 🌐 Deployment Options

1. **Netlify** (Recommended):
   ```bash
   # Install Netlify CLI
   npm install -g netlify-cli
   
   # Build and deploy
   ng build --configuration production
   netlify deploy --prod
   ```

2. **GitHub Pages**:
   ```bash
   ng build --configuration production --base-href /your-repo/
   # Push dist/portfolio to gh-pages branch
   ```

3. **Vercel**:
   ```bash
   # Install Vercel CLI
   npm install -g vercel
   
   # Deploy
   vercel
   ```

## 🎯 Next Steps

1. ✏️ Edit components to add your real data
2. 🎨 Customize colors and styles
3. 📸 Add your profile photo
4. 📄 Add your resume PDF
5. 🚀 Build and deploy!

## 📝 Tech Stack

- **Framework**: Angular 18
- **Styling**: SCSS
- **Routing**: Angular Router
- **Icons**: SVG Icons
- **Build**: Angular CLI

## 👨‍💻 Author

**Coding Terminals**
- YouTube: [@codingterminals](https://www.youtube.com/@codingterminals)

## 📄 License

MIT License - Feel free to use this template for your personal portfolio!

---

**Happy Coding! 🚀**
