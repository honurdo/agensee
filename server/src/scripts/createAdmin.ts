import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from '../models/User';
import path from 'path';

// .env dosyasının yolunu doğru şekilde belirt
dotenv.config({ path: path.join(__dirname, '../../.env') });

const createAdmin = async () => {
  try {
    // MongoDB bağlantı kontrolü
    const mongoURI = process.env.MONGODB_URI;
    if (!mongoURI) {
      throw new Error('MongoDB URI bulunamadı. Lütfen .env dosyasını kontrol edin.');
    }

    // MongoDB'ye bağlan
    console.log('MongoDB bağlantısı kuruluyor...');
    await mongoose.connect(mongoURI);
    console.log('MongoDB bağlantısı başarılı');

    // Mevcut admin kontrolü
    const existingAdmin = await User.findOne({ email: 'admin@example.com' });
    if (existingAdmin) {
      console.log('Admin kullanıcısı zaten mevcut:');
      console.log('Email: admin@example.com');
      console.log('(Mevcut şifreyi kullanın)');
      await mongoose.connection.close();
      return;
    }

    // Admin kullanıcısı oluştur
    const adminUser = new User({
      email: 'admin@example.com',
      password: 'admin123',
      name: 'Admin User',
      company: 'Digital Agency',
      role: 'admin',
      isActive: true
    });

    await adminUser.save();
    console.log('-----------------------------------');
    console.log('Admin kullanıcısı oluşturuldu!');
    console.log('Email: admin@example.com');
    console.log('Şifre: admin123');
    console.log('-----------------------------------');

  } catch (error) {
    console.error('Hata oluştu:', error);
  } finally {
    // MongoDB bağlantısını kapat
    await mongoose.connection.close();
    console.log('MongoDB bağlantısı kapatıldı');
    process.exit(0);
  }
};

// Script'i çalıştır
createAdmin();