# 🚀 Quick Deploy Reference Card

## One-Command Deploy

```powershell
# Interactive deployment wizard
.\deploy.ps1
```

---

## Manual Deploy Steps

### 1️⃣ Vercel Deploy
```powershell
# Install Vercel CLI (one-time)
npm install -g vercel

# Login
vercel login

# Deploy to production
vercel --prod
```

### 2️⃣ Generate TWA/APK
```powershell
# Install Bubblewrap (one-time)
npm install -g @bubblewrap/cli

# Initialize TWA project
bubblewrap init --manifest https://YOUR_VERCEL_URL/manifest.json

# Build signed APK
bubblewrap build
```

### 3️⃣ Test APK
```powershell
# Install on connected Android device
adb install app-release-signed.apk
```

---

## Required Info

### Vercel Env Vars
```env
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
SUPABASE_SERVICE_ROLE_KEY=your_key
```

### TWA Configuration
```
Package: com.ameexamtrainer.app
App Name: AME Exam Trainer
Theme: #003A63
Display: standalone
Orientation: portrait
```

### Keystore Generation
```powershell
keytool -genkey -v -keystore ame-trainer.keystore -keyalg RSA -keysize 2048 -validity 10000 -alias ame-trainer
```

---

## Play Store Assets Needed

- [ ] Screenshots (1080x1920) - minimum 2
- [ ] Feature graphic (1024x500)
- [ ] Icon 512x512 (already have: `icon-512x512.png`)
- [ ] Privacy Policy URL: `/privacy`
- [ ] Terms URL: `/terms`

---

## Timeline Estimate

| Phase | Time | Status |
|-------|------|--------|
| Vercel Deploy | 5-10 min | ⏳ Ready |
| TWA/APK Generation | 15-30 min | ⏳ Ready |
| Play Store Setup | 1-2 hours | ⏳ Pending |
| Google Review | 1-7 days | ⏳ Pending |

---

## Troubleshooting Quick Fixes

### Vercel fails
```powershell
# Check build locally
npm run build

# Check env vars in Vercel Dashboard
```

### Bubblewrap fails
```powershell
# Check Android SDK
echo $env:ANDROID_HOME

# If not set:
[System.Environment]::SetEnvironmentVariable("ANDROID_HOME", "C:\Users\$env:USERNAME\AppData\Local\Android\Sdk", "User")
```

### APK won't install
```powershell
# Verify signature
jarsigner -verify -verbose -certs app-release-signed.apk

# Re-sign if needed
bubblewrap build
```

---

## Support URLs

- Full Guide: [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
- Status: [DEPLOYMENT_READY.md](./DEPLOYMENT_READY.md)
- Privacy: [/privacy](./app/privacy/page.tsx)
- Terms: [/terms](./app/terms/page.tsx)

---

## Success Checklist

- [ ] `vercel --prod` completes successfully
- [ ] PWA installs on desktop browser
- [ ] Service Worker registers (check DevTools)
- [ ] Manifest loads: `your-url/manifest.json`
- [ ] Lighthouse PWA score 90+
- [ ] `bubblewrap build` generates APK
- [ ] APK installs on Android device
- [ ] App opens and functions correctly
- [ ] All Play Store assets uploaded
- [ ] Google review submitted

---

## 🎯 Current Status

✅ **Phase 1:** PWA Implementation - COMPLETE  
✅ **Phase 2:** Mobile Optimizations - COMPLETE  
✅ **Phase 3:** Deployment Prep - COMPLETE  
⏳ **Phase 4:** Vercel Deploy - READY TO START  
⏳ **Phase 5:** TWA/APK - READY TO START  
⏳ **Phase 6:** Play Store - READY TO START

---

**Ready to deploy?** Run `.\deploy.ps1` now! 🚀
