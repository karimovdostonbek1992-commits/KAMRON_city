# 🍽️ KAMRON - Premium Restoran Tizimi

Bu loyiha zamonaviy restoranlar uchun buyurtma berish, xona band qilish va sun'iy intellekt (Gemini AI) yordamida tahlil qilish imkoniyatini beruvchi veb-ilovadir.

## ✨ Xususiyatlari
* **Menu:** Taomlar ro'yxati va narxlari.
* **Savatcha:** Taomlarni tanlash va buyurtma berish.
* **Rezervatsiya:** Restorandan joy band qilish tizimi.
* **AI Tahlil:** Gemini AI yordamida mijozlar so'rovlarini tahlil qilish.
* **Admin Panel:** Buyurtmalarni boshqarish interfeysi.

## 🚀 Ishga tushirish (Local Run)

Loyiha **Vite** yordamida qurilgan. Uni kompyuteringizda yurgizish uchun:

1.  **Kutubxonalarni yuklash:**
    ```bash
    npm install
    ```

2.  **API Kalitni sozlash:**
    `.env.local` faylini oching va `GEMINI_API_KEY` qismiga o'z kalitingizni qo'ying:
    ```env
    GEMINI_API_KEY=AIzaSyADqOtw5JSLXHFIkBCJhTgIMPpMRGT-Ygk
    ```

3.  **Dasturni yurgizish:**
    ```bash
    npm run dev
    ```
    Sayt odatda `http://localhost:3000` manzilida ochiladi.

## 🛠️ Texnologiyalar
* **Frontend:** HTML5, Tailwind CSS, JavaScript (Vanilla)
* **Asboblar:** Vite.js
* **AI:** Google Gemini API

## 🌐 Internetga joylash
Loyihani **Vercel** yoki **Netlify** platformalariga GitHub orqali oson ulanib, bepul joylash mumkin. Joylash vaqtida `GEMINI_API_KEY`ni Environment Variables qismiga qo'shishni unutmang.

---
*Yaratuvchi: Kamron*
