# Google Play Console Submission Guide

## ✅ Pre-Submission Checklist

- [x] APK signed and ready (`AME Trainer.apk` - 1.7M)
- [x] App tested on physical device (Galaxy A15 5G)
- [x] App tested on emulator (Pixel 2 XL)
- [x] No security vulnerabilities (Next.js 16.1.1)
- [x] Mobile design optimized and responsive

---

## 📋 Step 1: Create Google Play Developer Account

1. Go to https://play.google.com/console
2. Click **"Create account"**
3. Sign in with your Google account
4. Pay the **$25 one-time registration fee**
5. Complete your developer profile

---

## 🎯 Step 2: Create New Application

1. Click **"Create App"**
2. Fill in:
   - **App name**: `AME Exam Trainer`
   - **Default language**: English
   - **App type**: Application
   - **Category**: Education
   - **Free or Paid**: Free

---

## 📝 Step 3: App Information to Fill

### App Name
```
AME Exam Trainer
```

### Short Description (50 characters max)
```
Master your Aircraft Maintenance Engineer certification
```

### Full Description (4000 characters max)
```
AME Exam Trainer is the comprehensive study platform designed specifically 
for Aircraft Maintenance Engineer (AME) certification candidates.

KEY FEATURES:
• Comprehensive Study Materials: Access thousands of questions across all 
  AME exam topics
• Practice Questions: Interactive quizzes with detailed explanations
• Track Progress: Monitor your performance and identify areas for improvement
• Community Driven: Learn from peers, share knowledge, and contribute questions
• Study Smarter: Organized by topic with performance analytics
• Offline Access: Study without internet connection
• Mobile Optimized: Smooth experience on all Android devices

Whether you're preparing for your first AME exam or looking to refresh your 
knowledge, AME Exam Trainer provides everything you need to study effectively 
and pass faster.

Join thousands of aircraft maintenance engineers using our platform to advance 
their careers.
```

### Promotional Text (80 characters max)
```
Study smarter, pass faster - Master your AME certification
```

---

## 🖼️ Step 4: Graphics & Images

### App Icon (512x512 PNG)
**Location**: `/Users/andresbecerra/Desktop/AME Trainer/ame-app-v1/public/icon-512x512.png`

### Feature Graphic (1024x500 PNG)
**Required for Play Store listing**

Create using:
- Canva (https://www.canva.com) - Free template
- Design: Dark blue background with yellow accent
- Text: "AME Exam Trainer - Master Your Certification"
- Add plane icon/image

### Screenshots (1080x1920 PNG, max 8)
Take 4-5 screenshots from your Galaxy A15:
1. **Login screen** - showing the app welcome
2. **Dashboard** - showing main features
3. **Questions page** - showing study materials
4. **Progress tracking** - showing performance metrics

**Screenshots tips:**
- Crop to 9:16 aspect ratio (1080x1920)
- Add text overlay explaining each screen
- Keep them clean and professional

---

## 📦 Step 5: Upload APK

1. In Play Console, go to **"Release" → "Production"**
2. Click **"Create new release"**
3. Click **"Upload APK"** and select:
   ```
   /Users/andresbecerra/Desktop/AME Trainer/ame-apk/AME Trainer.apk
   ```
4. Fill in **Release notes**:
   ```
   Initial Release
   
   ✓ Comprehensive AME study materials
   ✓ Practice questions with explanations
   ✓ Performance tracking
   ✓ Community features
   ✓ Offline support
   ✓ Mobile optimized
   ```

---

## 🌍 Step 6: App Details

### Permissions
The app requests:
- **Internet**: For syncing with Supabase
- **Camera**: For profile photo uploads (optional)
- **Notifications**: For push notifications

### Content Rating
1. Go to **"Content Rating"**
2. Complete the **IARC Questionnaire**
3. Select:
   - Violence: None
   - Sexual Content: None
   - Profanity: None
   - Alcohol/Tobacco: None
   - Category: **PEGI 3** / **ESRB E**

### Target Audience
- Primary: Adults (18+)
- Secondary: Students preparing for certification
- Category: Education

### Privacy Policy
1. Go to **"App content"**
2. Add privacy policy URL:
   ```
   https://v0-ame-exam-trainer-app.vercel.app/privacy
   ```

---

## 💳 Step 7: Pricing & Distribution

1. **Pricing**: Free
2. **Countries**: Select all countries initially (or target specific regions)
3. **Audience**: 18+
4. **Consent & Compliance**: Mark as compliant

---

## ✅ Step 8: Review & Submit

1. Check all sections for ✅ green checkmarks
2. Review **"Program policies"** compliance
3. Click **"Review release"**
4. Click **"Submit for review"**

**Review Timeline**: 1-7 days (usually 2-3 days)

---

## 📊 After Submission

### Track Status
- Go to **"Release overview"**
- Check **"Managed publication"** for status
- You'll receive email updates

### Common Review Issues
- **Missing app description** → Add more details
- **Privacy policy issues** → Update privacy policy URL
- **Icon/graphic quality** → Ensure high resolution

### Once Approved
1. App appears on Google Play Store
2. Users can search and download
3. Monitor reviews and ratings
4. Update app regularly with new features

---

## 🚀 Quick Links

- **Google Play Console**: https://play.google.com/console
- **App URL Template**: `https://play.google.com/store/apps/details?id=com.ameexamtrainer.app`
- **Vercel App**: https://v0-ame-exam-trainer-app.vercel.app
- **Privacy Policy**: https://v0-ame-exam-trainer-app.vercel.app/privacy
- **Terms of Service**: https://v0-ame-exam-trainer-app.vercel.app/terms

---

## 📧 Support Information

For support, users can:
- Contact: support@ametrainer.com (set up if needed)
- Website: https://v0-ame-exam-trainer-app.vercel.app
- Report issues in-app

---

## ⏰ Timeline Summary

| Step | Time | Status |
|------|------|--------|
| Create Play Console account | 15 min | ⏳ Ready |
| Create app listing | 20 min | ⏳ Ready |
| Fill all information | 30 min | ⏳ Ready |
| Take screenshots | 10 min | ⏳ Ready |
| Create feature graphic | 20 min | ⏳ Ready |
| Upload APK | 5 min | ⏳ Ready |
| Submit for review | 5 min | ⏳ Ready |
| **Total Preparation** | **~1.5 hours** | |
| **Review Process** | **1-7 days** | ⏳ Pending |
| **Live on Store** | | 🎉 Success |

---

## 🎯 APK Details for Reference

- **File**: `AME Trainer.apk`
- **Size**: 1.7 MB
- **Package Name**: `com.ameexamtrainer.app`
- **Min SDK**: Android 5.0+
- **Target SDK**: Android 15+
- **Signing**: Already signed with production keystore

---

## Next Steps

1. ✅ **Create Google Play Developer Account** (if not done)
2. ✅ **Gather screenshots** from Galaxy A15
3. ✅ **Create feature graphic** (use Canva or similar)
4. ✅ **Fill in app information** in Play Console
5. ✅ **Upload APK**
6. ✅ **Submit for review**
7. ⏳ **Wait for approval** (1-7 days)
8. 🎉 **Launch on Google Play Store**

---
