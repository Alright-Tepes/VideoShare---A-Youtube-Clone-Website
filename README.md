# VideoShare - Çevrimiçi Video Paylaşım Platformu 🚀

VideoShare, kullanıcıların video embed linklerini paylaşabildiği, kanalları takip edebildiği ve gelişmiş moderasyon özelliklerine sahip modern bir video paylaşım platformudur.

## ✨ Özellikler

- **Tam Yerelleştirme:** Platformun tamamı Türkçe dil desteğine sahiptir. 🇹🇷
- **Video Paylaşımı:** YouTube ve benzeri platformlardan embed linkleri ile kolay video yükleme.
- **Kanal Sistemi:** Kişiselleştirilmiş kanal sayfaları, kapak fotoğrafları ve takip etme özelliği.
- **Dinamik Yan Menü (Sidebar):** Takip edilen kanallar ve hızlı erişim butonları.
- **Etkileşim:** Beğenme/Beğenmeme, yorum yapma ve yorumlara yanıt verme (AJAX destekli).
- **Gelişmiş Moderasyon:** 
  - Admin Paneli (Kullanıcı ve video yönetimi).
  - Raporlama sistemi (Video ve yorumlar için).
  - Kullanıcı yasaklama (IP tabanlı ban desteği).
  - Video silme itiraz sistemi.
- **Stüdyo Paneli:** İçerik üreticileri için detaylı video analitiği ve yönetim araçları.
- **Gece/Gündüz Modu:** Kullanıcı tercihine göre değişen modern arayüz.

## 🛠️ Kullanılan Teknolojiler

- **Backend:** Node.js, Express.js
- **Frontend:** EJS (Embedded JavaScript), Vanilla CSS
- **Veritabanı:** MongoDB (Mongoose)
- **Oturum Yönetimi:** Express-Session, MongoDB Store
- **Güvenlik:** Bcrypt.js (Şifreleme), IP tabanlı moderasyon

## 🚀 Yerel Kurulum

1. **Projeyi klonlayın:**
   ```bash
   git clone https://github.com/Alright-Tepes/VideoShare---A-Youtube-Clone-Website.git
   cd cevrimicivideoses
   ```

2. **Bağımlılıkları yükleyin:**
   ```bash
   npm install
   ```

3. **.env ayarlayın:**
   Kök dizinde bir `.env` dosyası oluşturun ve şu bilgileri ekleyin:
   ```env
   MONGODB_URI=your_mongodb_connection_string
   SESSION_SECRET=your_secret_key
   ```

4. **Uygulamayı başlatın:**
   ```bash
   npm run dev

   or

   click "start.bat"
   ```


