'use client'

import { useState, useEffect } from 'react'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useAccount, useContractWrite, useContractRead } from 'wagmi'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { 
  Star, 
  Sparkles, 
  Calendar, 
  Coins, 
  CheckCircle,
  Loader2,
  Zap
} from 'lucide-react'
import { HoroscopeCard } from '@/components/HoroscopeCard'
import { ZodiacSelector } from '@/components/ZodiacSelector'
import { CheckInButton } from '@/components/CheckInButton'
import { DailyStreak } from '@/components/DailyStreak'
import { CategorySelector } from '@/components/CategorySelector'
import { PredictionCard } from '@/components/PredictionCard'
import { LanguageSelector } from '@/components/LanguageSelector'
import { useLanguage } from '@/contexts/LanguageContext'

// SDCE Token Contract (Base ağında)
const SDCE_CONTRACT = {
  address: '0x...' as `0x${string}`, // SDCE token contract address
  abi: [
    {
      name: 'transfer',
      type: 'function',
      stateMutability: 'nonpayable',
      inputs: [
        { name: 'to', type: 'address' },
        { name: 'amount', type: 'uint256' }
      ],
      outputs: [{ name: '', type: 'bool' }]
    },
    {
      name: 'balanceOf',
      type: 'function',
      stateMutability: 'view',
      inputs: [{ name: 'account', type: 'address' }],
      outputs: [{ name: '', type: 'uint256' }]
    }
  ]
}

// HoroscopeMint Contract
const HOROSCOPE_CONTRACT = {
  address: '0x...' as `0x${string}`, // HoroscopeMint contract address
  abi: [
    {
      name: 'checkIn',
      type: 'function',
      stateMutability: 'nonpayable',
      inputs: [
        { name: 'zodiacSign', type: 'uint8' },
        { name: 'farcasterId', type: 'uint256' }
      ],
      outputs: []
    },
    {
      name: 'getDailyHoroscope',
      type: 'function',
      stateMutability: 'view',
      inputs: [{ name: 'zodiacSign', type: 'uint8' }],
      outputs: [
        { name: 'message', type: 'string' }
      ]
    },
    {
      name: 'hasCheckedInToday',
      type: 'function',
      stateMutability: 'view',
      inputs: [{ name: 'user', type: 'address' }],
      outputs: [{ name: '', type: 'bool' }]
    }
  ]
}

const ZODIAC_SIGNS = [
  { id: 0, name: 'Koç', symbol: '♈', color: 'zodiac-aries' },
  { id: 1, name: 'Boğa', symbol: '♉', color: 'zodiac-taurus' },
  { id: 2, name: 'İkizler', symbol: '♊', color: 'zodiac-gemini' },
  { id: 3, name: 'Yengeç', symbol: '♋', color: 'zodiac-cancer' },
  { id: 4, name: 'Aslan', symbol: '♌', color: 'zodiac-leo' },
  { id: 5, name: 'Başak', symbol: '♍', color: 'zodiac-virgo' },
  { id: 6, name: 'Terazi', symbol: '♎', color: 'zodiac-libra' },
  { id: 7, name: 'Akrep', symbol: '♏', color: 'zodiac-scorpio' },
  { id: 8, name: 'Yay', symbol: '♐', color: 'zodiac-sagittarius' },
  { id: 9, name: 'Oğlak', symbol: '♑', color: 'zodiac-capricorn' },
  { id: 10, name: 'Kova', symbol: '♒', color: 'zodiac-aquarius' },
  { id: 11, name: 'Balık', symbol: '♓', color: 'zodiac-pisces' },
]

const LANGUAGES = [
  {
    code: 'tr',
    name: 'Türkçe',
    flag: '🇹🇷',
    nativeName: 'Türkçe'
  },
  {
    code: 'en',
    name: 'English',
    flag: '🇺🇸',
    nativeName: 'English'
  }
]

const PREDICTION_CATEGORIES = [
  {
    id: 'love',
    name: 'Aşk',
    icon: <Heart className="w-8 h-8 text-pink-400" />,
    color: 'bg-pink-500/20',
    description: 'Aşk hayatınız ve ilişkileriniz hakkında kehanetler',
    price: 1
  },
  {
    id: 'money',
    name: 'Para',
    icon: <DollarSign className="w-8 h-8 text-green-400" />,
    color: 'bg-green-500/20',
    description: 'Finansal durumunuz ve para kazanma fırsatları',
    price: 1
  },
  {
    id: 'career',
    name: 'Kariyer',
    icon: <Briefcase className="w-8 h-8 text-blue-400" />,
    color: 'bg-blue-500/20',
    description: 'İş hayatınız ve kariyer gelişiminiz',
    price: 1
  },
  {
    id: 'crypto',
    name: 'Kripto',
    icon: <Coins className="w-8 h-8 text-yellow-400" />,
    color: 'bg-yellow-500/20',
    description: 'Kripto para yatırımları ve blockchain fırsatları',
    price: 1
  },
  {
    id: 'nft',
    name: 'NFT',
    icon: <Image className="w-8 h-8 text-purple-400" />,
    color: 'bg-purple-500/20',
    description: 'NFT koleksiyonları ve dijital sanat',
    price: 1
  }
]

// Helper functions for mock data
const getHoroscopeMessage = (zodiacId: number) => {
  // Günlük tarih bazlı mesajlar - her gün farklı
  const today = new Date()
  const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24))
  
  const dailyMessages = {
    0: [ // Koç
      "Bugün Mars'ın güçlü enerjisi sizi sarıp sarmalıyor, Koç! Bu enerji dalgası sizi yeni maceralara sürükleyecek. Sabah erken saatlerde yapacağınız fiziksel aktiviteler, gün boyunca sürecek enerji patlamasının anahtarı olacak. İş hayatınızda beklenmedik bir fırsat kapınızı çalabilir - bu fırsatı değerlendirmek için cesaretinizi toplayın. Öğleden sonra, yaratıcı projelerinizde büyük ilerleme kaydedeceksiniz. Akşam saatlerinde sosyal çevrenizde liderlik rolü üstleneceksiniz. Duygusal olarak bugün çok güçlü hissedeceksiniz, bu enerjiyi sevdiklerinizle paylaşın.",
      "Koç, bugün yıldızlar size özel bir mesaj gönderiyor! Merkür'ün retrosu sona erdi ve artık iletişim kanallarınız tamamen açık. Sabah saatlerinde alacağınız bir telefon veya mesaj, hafta sonu planlarınızı tamamen değiştirebilir. Finansal konularda dikkatli olun - beklenmedik bir harcama karşınıza çıkabilir. Öğleden sonra, yaratıcı yeteneklerinizi sergilemek için mükemmel bir zaman. Akşam saatlerinde aile üyelerinizle derin sohbetler yapacaksınız. Bu sohbetler, gelecekteki kararlarınızı etkileyecek önemli bilgiler içerebilir.",
      "Bugün Koç, yıldızların enerjisi sizi farklı yönlere çekiyor! Sabah erken saatlerde aldığınız bir karar, gün boyunca sizi takip edecek. İş hayatınızda yeni bir proje başlatmak için ideal bir gün - bu proje sizi uzun vadede çok mutlu edecek. Öğleden sonra, sağlığınıza odaklanma zamanı. Spor yapmak veya doğa yürüyüşü yapmak sizi rahatlatacak. Akşam saatlerinde sosyal medyada paylaştığınız bir içerik, beklenmedik bir şekilde viral olabilir. Duygusal olarak bugün çok hassas olacaksınız - bu hassasiyeti yaratıcılığınıza yönlendirin.",
      "Koç, bugün yıldızlar size özel bir enerji gönderiyor! Sabah saatlerinde alacağınız bir haber, gün boyunca sizi motive edecek. İş hayatınızda yeni bir işbirliği fırsatı doğabilir - bu fırsatı değerlendirmek için hızlı karar verin. Öğleden sonra, yaratıcı projelerinizde büyük ilerleme kaydedeceksiniz. Bu projeler, gelecekteki kariyerinizi şekillendirecek. Akşam saatlerinde sosyal çevrenizde önemli bir kişiyle tanışacaksınız. Bu tanışma, hayatınızda yeni bir dönemin başlangıcı olabilir. Duygusal olarak bugün çok güçlü hissedeceksiniz - bu enerjiyi sevdiklerinizle paylaşın.",
      "Bugün Koç, yıldızların enerjisi sizi farklı yönlere çekiyor! Sabah erken saatlerde aldığınız bir karar, gün boyunca sizi takip edecek. İş hayatınızda yeni bir proje başlatmak için ideal bir gün - bu proje sizi uzun vadede çok mutlu edecek. Öğleden sonra, sağlığınıza odaklanma zamanı. Spor yapmak veya doğa yürüyüşü yapmak sizi rahatlatacak. Akşam saatlerinde sosyal medyada paylaştığınız bir içerik, beklenmedik bir şekilde viral olabilir. Duygusal olarak bugün çok hassas olacaksınız - bu hassasiyeti yaratıcılığınıza yönlendirin."
    ],
    1: [ // Boğa
      "Bugün Boğa, Venüs'ün güçlü enerjisi sizi sarıp sarmalıyor! Bu enerji dalgası sizi güzellik ve estetik konulara yönlendirecek. Sabah erken saatlerde yapacağınız doğa yürüyüşü, gün boyunca sürecek huzurun anahtarı olacak. İş hayatınızda beklenmedik bir finansal fırsat kapınızı çalabilir - bu fırsatı değerlendirmek için sabırlı olun. Öğleden sonra, yaratıcı projelerinizde büyük ilerleme kaydedeceksiniz. Akşam saatlerinde sosyal çevrenizde önemli bir kişiyle tanışacaksınız. Bu tanışma, hayatınızda yeni bir dönemin başlangıcı olabilir. Duygusal olarak bugün çok güçlü hissedeceksiniz, bu enerjiyi sevdiklerinizle paylaşın.",
      "Boğa, bugün yıldızlar size özel bir mesaj gönderiyor! Merkür'ün retrosu sona erdi ve artık iletişim kanallarınız tamamen açık. Sabah saatlerinde alacağınız bir telefon veya mesaj, hafta sonu planlarınızı tamamen değiştirebilir. Finansal konularda dikkatli olun - beklenmedik bir harcama karşınıza çıkabilir. Öğleden sonra, yaratıcı yeteneklerinizi sergilemek için mükemmel bir zaman. Akşam saatlerinde aile üyelerinizle derin sohbetler yapacaksınız. Bu sohbetler, gelecekteki kararlarınızı etkileyecek önemli bilgiler içerebilir. Duygusal olarak bugün çok hassas olacaksınız - bu hassasiyeti yaratıcılığınıza yönlendirin.",
      "Bugün Boğa, yıldızların enerjisi sizi farklı yönlere çekiyor! Sabah erken saatlerde aldığınız bir karar, gün boyunca sizi takip edecek. İş hayatınızda yeni bir proje başlatmak için ideal bir gün - bu proje sizi uzun vadede çok mutlu edecek. Öğleden sonra, sağlığınıza odaklanma zamanı. Spor yapmak veya doğa yürüyüşü yapmak sizi rahatlatacak. Akşam saatlerinde sosyal medyada paylaştığınız bir içerik, beklenmedik bir şekilde viral olabilir. Duygusal olarak bugün çok hassas olacaksınız - bu hassasiyeti yaratıcılığınıza yönlendirin. Bu gün, yaratıcı projelerinizde büyük ilerleme kaydedeceksiniz.",
      "Boğa, bugün yıldızlar size özel bir enerji gönderiyor! Sabah saatlerinde alacağınız bir haber, gün boyunca sizi motive edecek. İş hayatınızda yeni bir işbirliği fırsatı doğabilir - bu fırsatı değerlendirmek için hızlı karar verin. Öğleden sonra, yaratıcı projelerinizde büyük ilerleme kaydedeceksiniz. Bu projeler, gelecekteki kariyerinizi şekillendirecek. Akşam saatlerinde sosyal çevrenizde önemli bir kişiyle tanışacaksınız. Bu tanışma, hayatınızda yeni bir dönemin başlangıcı olabilir. Duygusal olarak bugün çok güçlü hissedeceksiniz - bu enerjiyi sevdiklerinizle paylaşın. Bu gün, yaratıcı projelerinizde büyük ilerleme kaydedeceksiniz.",
      "Bugün Boğa, yıldızların enerjisi sizi farklı yönlere çekiyor! Sabah erken saatlerde aldığınız bir karar, gün boyunca sizi takip edecek. İş hayatınızda yeni bir proje başlatmak için ideal bir gün - bu proje sizi uzun vadede çok mutlu edecek. Öğleden sonra, sağlığınıza odaklanma zamanı. Spor yapmak veya doğa yürüyüşü yapmak sizi rahatlatacak. Akşam saatlerinde sosyal medyada paylaştığınız bir içerik, beklenmedik bir şekilde viral olabilir. Duygusal olarak bugün çok hassas olacaksınız - bu hassasiyeti yaratıcılığınıza yönlendirin. Bu gün, yaratıcı projelerinizde büyük ilerleme kaydedeceksiniz."
    ],
    2: [ // İkizler
      "Bugün İkizler, Merkür'ün güçlü enerjisi sizi sarıp sarmalıyor! Bu enerji dalgası sizi iletişim ve öğrenme konularına yönlendirecek. Sabah erken saatlerde yapacağınız okuma veya araştırma, gün boyunca sürecek bilgi arayışının anahtarı olacak. İş hayatınızda beklenmedik bir iletişim fırsatı kapınızı çalabilir - bu fırsatı değerlendirmek için hızlı düşünün. Öğleden sonra, yaratıcı projelerinizde büyük ilerleme kaydedeceksiniz. Akşam saatlerinde sosyal çevrenizde önemli bir kişiyle tanışacaksınız. Bu tanışma, hayatınızda yeni bir dönemin başlangıcı olabilir. Duygusal olarak bugün çok güçlü hissedeceksiniz, bu enerjiyi sevdiklerinizle paylaşın.",
      "İkizler, bugün yıldızlar size özel bir mesaj gönderiyor! Merkür'ün retrosu sona erdi ve artık iletişim kanallarınız tamamen açık. Sabah saatlerinde alacağınız bir telefon veya mesaj, hafta sonu planlarınızı tamamen değiştirebilir. Finansal konularda dikkatli olun - beklenmedik bir harcama karşınıza çıkabilir. Öğleden sonra, yaratıcı yeteneklerinizi sergilemek için mükemmel bir zaman. Akşam saatlerinde aile üyelerinizle derin sohbetler yapacaksınız. Bu sohbetler, gelecekteki kararlarınızı etkileyecek önemli bilgiler içerebilir. Duygusal olarak bugün çok hassas olacaksınız - bu hassasiyeti yaratıcılığınıza yönlendirin.",
      "Bugün İkizler, yıldızların enerjisi sizi farklı yönlere çekiyor! Sabah erken saatlerde aldığınız bir karar, gün boyunca sizi takip edecek. İş hayatınızda yeni bir proje başlatmak için ideal bir gün - bu proje sizi uzun vadede çok mutlu edecek. Öğleden sonra, sağlığınıza odaklanma zamanı. Spor yapmak veya doğa yürüyüşü yapmak sizi rahatlatacak. Akşam saatlerinde sosyal medyada paylaştığınız bir içerik, beklenmedik bir şekilde viral olabilir. Duygusal olarak bugün çok hassas olacaksınız - bu hassasiyeti yaratıcılığınıza yönlendirin. Bu gün, yaratıcı projelerinizde büyük ilerleme kaydedeceksiniz.",
      "İkizler, bugün yıldızlar size özel bir enerji gönderiyor! Sabah saatlerinde alacağınız bir haber, gün boyunca sizi motive edecek. İş hayatınızda yeni bir işbirliği fırsatı doğabilir - bu fırsatı değerlendirmek için hızlı karar verin. Öğleden sonra, yaratıcı projelerinizde büyük ilerleme kaydedeceksiniz. Bu projeler, gelecekteki kariyerinizi şekillendirecek. Akşam saatlerinde sosyal çevrenizde önemli bir kişiyle tanışacaksınız. Bu tanışma, hayatınızda yeni bir dönemin başlangıcı olabilir. Duygusal olarak bugün çok güçlü hissedeceksiniz - bu enerjiyi sevdiklerinizle paylaşın. Bu gün, yaratıcı projelerinizde büyük ilerleme kaydedeceksiniz.",
      "Bugün İkizler, yıldızların enerjisi sizi farklı yönlere çekiyor! Sabah erken saatlerde aldığınız bir karar, gün boyunca sizi takip edecek. İş hayatınızda yeni bir proje başlatmak için ideal bir gün - bu proje sizi uzun vadede çok mutlu edecek. Öğleden sonra, sağlığınıza odaklanma zamanı. Spor yapmak veya doğa yürüyüşü yapmak sizi rahatlatacak. Akşam saatlerinde sosyal medyada paylaştığınız bir içerik, beklenmedik bir şekilde viral olabilir. Duygusal olarak bugün çok hassas olacaksınız - bu hassasiyeti yaratıcılığınıza yönlendirin. Bu gün, yaratıcı projelerinizde büyük ilerleme kaydedeceksiniz."
    ],
    3: [ // Yengeç
      "Bugün Yengeç, Ay'ın güçlü enerjisi sizi sarıp sarmalıyor! Bu enerji dalgası sizi duygusal ve aile konularına yönlendirecek. Sabah erken saatlerde yapacağınız aile ziyareti veya telefon görüşmesi, gün boyunca sürecek huzurun anahtarı olacak. İş hayatınızda beklenmedik bir duygusal fırsat kapınızı çalabilir - bu fırsatı değerlendirmek için içgüdülerinize güvenin. Öğleden sonra, yaratıcı projelerinizde büyük ilerleme kaydedeceksiniz. Akşam saatlerinde sosyal çevrenizde önemli bir kişiyle tanışacaksınız. Bu tanışma, hayatınızda yeni bir dönemin başlangıcı olabilir. Duygusal olarak bugün çok güçlü hissedeceksiniz, bu enerjiyi sevdiklerinizle paylaşın.",
      "Yengeç, bugün yıldızlar size özel bir mesaj gönderiyor! Merkür'ün retrosu sona erdi ve artık iletişim kanallarınız tamamen açık. Sabah saatlerinde alacağınız bir telefon veya mesaj, hafta sonu planlarınızı tamamen değiştirebilir. Finansal konularda dikkatli olun - beklenmedik bir harcama karşınıza çıkabilir. Öğleden sonra, yaratıcı yeteneklerinizi sergilemek için mükemmel bir zaman. Akşam saatlerinde aile üyelerinizle derin sohbetler yapacaksınız. Bu sohbetler, gelecekteki kararlarınızı etkileyecek önemli bilgiler içerebilir. Duygusal olarak bugün çok hassas olacaksınız - bu hassasiyeti yaratıcılığınıza yönlendirin.",
      "Bugün Yengeç, yıldızların enerjisi sizi farklı yönlere çekiyor! Sabah erken saatlerde aldığınız bir karar, gün boyunca sizi takip edecek. İş hayatınızda yeni bir proje başlatmak için ideal bir gün - bu proje sizi uzun vadede çok mutlu edecek. Öğleden sonra, sağlığınıza odaklanma zamanı. Spor yapmak veya doğa yürüyüşü yapmak sizi rahatlatacak. Akşam saatlerinde sosyal medyada paylaştığınız bir içerik, beklenmedik bir şekilde viral olabilir. Duygusal olarak bugün çok hassas olacaksınız - bu hassasiyeti yaratıcılığınıza yönlendirin. Bu gün, yaratıcı projelerinizde büyük ilerleme kaydedeceksiniz.",
      "Yengeç, bugün yıldızlar size özel bir enerji gönderiyor! Sabah saatlerinde alacağınız bir haber, gün boyunca sizi motive edecek. İş hayatınızda yeni bir işbirliği fırsatı doğabilir - bu fırsatı değerlendirmek için hızlı karar verin. Öğleden sonra, yaratıcı projelerinizde büyük ilerleme kaydedeceksiniz. Bu projeler, gelecekteki kariyerinizi şekillendirecek. Akşam saatlerinde sosyal çevrenizde önemli bir kişiyle tanışacaksınız. Bu tanışma, hayatınızda yeni bir dönemin başlangıcı olabilir. Duygusal olarak bugün çok güçlü hissedeceksiniz - bu enerjiyi sevdiklerinizle paylaşın. Bu gün, yaratıcı projelerinizde büyük ilerleme kaydedeceksiniz.",
      "Bugün Yengeç, yıldızların enerjisi sizi farklı yönlere çekiyor! Sabah erken saatlerde aldığınız bir karar, gün boyunca sizi takip edecek. İş hayatınızda yeni bir proje başlatmak için ideal bir gün - bu proje sizi uzun vadede çok mutlu edecek. Öğleden sonra, sağlığınıza odaklanma zamanı. Spor yapmak veya doğa yürüyüşü yapmak sizi rahatlatacak. Akşam saatlerinde sosyal medyada paylaştığınız bir içerik, beklenmedik bir şekilde viral olabilir. Duygusal olarak bugün çok hassas olacaksınız - bu hassasiyeti yaratıcılığınıza yönlendirin. Bu gün, yaratıcı projelerinizde büyük ilerleme kaydedeceksiniz."
    ],
    4: [ // Aslan
      "Bugün Aslan, Güneş'in güçlü enerjisi sizi sarıp sarmalıyor! Bu enerji dalgası sizi yaratıcılık ve liderlik konularına yönlendirecek. Sabah erken saatlerde yapacağınız yaratıcı aktiviteler, gün boyunca sürecek ilhamın anahtarı olacak. İş hayatınızda beklenmedik bir liderlik fırsatı kapınızı çalabilir - bu fırsatı değerlendirmek için cesaretinizi toplayın. Öğleden sonra, yaratıcı projelerinizde büyük ilerleme kaydedeceksiniz. Akşam saatlerinde sosyal çevrenizde önemli bir kişiyle tanışacaksınız. Bu tanışma, hayatınızda yeni bir dönemin başlangıcı olabilir. Duygusal olarak bugün çok güçlü hissedeceksiniz, bu enerjiyi sevdiklerinizle paylaşın.",
      "Aslan, bugün yıldızlar size özel bir mesaj gönderiyor! Merkür'ün retrosu sona erdi ve artık iletişim kanallarınız tamamen açık. Sabah saatlerinde alacağınız bir telefon veya mesaj, hafta sonu planlarınızı tamamen değiştirebilir. Finansal konularda dikkatli olun - beklenmedik bir harcama karşınıza çıkabilir. Öğleden sonra, yaratıcı yeteneklerinizi sergilemek için mükemmel bir zaman. Akşam saatlerinde aile üyelerinizle derin sohbetler yapacaksınız. Bu sohbetler, gelecekteki kararlarınızı etkileyecek önemli bilgiler içerebilir. Duygusal olarak bugün çok hassas olacaksınız - bu hassasiyeti yaratıcılığınıza yönlendirin.",
      "Bugün Aslan, yıldızların enerjisi sizi farklı yönlere çekiyor! Sabah erken saatlerde aldığınız bir karar, gün boyunca sizi takip edecek. İş hayatınızda yeni bir proje başlatmak için ideal bir gün - bu proje sizi uzun vadede çok mutlu edecek. Öğleden sonra, sağlığınıza odaklanma zamanı. Spor yapmak veya doğa yürüyüşü yapmak sizi rahatlatacak. Akşam saatlerinde sosyal medyada paylaştığınız bir içerik, beklenmedik bir şekilde viral olabilir. Duygusal olarak bugün çok hassas olacaksınız - bu hassasiyeti yaratıcılığınıza yönlendirin. Bu gün, yaratıcı projelerinizde büyük ilerleme kaydedeceksiniz.",
      "Aslan, bugün yıldızlar size özel bir enerji gönderiyor! Sabah saatlerinde alacağınız bir haber, gün boyunca sizi motive edecek. İş hayatınızda yeni bir işbirliği fırsatı doğabilir - bu fırsatı değerlendirmek için hızlı karar verin. Öğleden sonra, yaratıcı projelerinizde büyük ilerleme kaydedeceksiniz. Bu projeler, gelecekteki kariyerinizi şekillendirecek. Akşam saatlerinde sosyal çevrenizde önemli bir kişiyle tanışacaksınız. Bu tanışma, hayatınızda yeni bir dönemin başlangıcı olabilir. Duygusal olarak bugün çok güçlü hissedeceksiniz - bu enerjiyi sevdiklerinizle paylaşın. Bu gün, yaratıcı projelerinizde büyük ilerleme kaydedeceksiniz.",
      "Bugün Aslan, yıldızların enerjisi sizi farklı yönlere çekiyor! Sabah erken saatlerde aldığınız bir karar, gün boyunca sizi takip edecek. İş hayatınızda yeni bir proje başlatmak için ideal bir gün - bu proje sizi uzun vadede çok mutlu edecek. Öğleden sonra, sağlığınıza odaklanma zamanı. Spor yapmak veya doğa yürüyüşü yapmak sizi rahatlatacak. Akşam saatlerinde sosyal medyada paylaştığınız bir içerik, beklenmedik bir şekilde viral olabilir. Duygusal olarak bugün çok hassas olacaksınız - bu hassasiyeti yaratıcılığınıza yönlendirin. Bu gün, yaratıcı projelerinizde büyük ilerleme kaydedeceksiniz."
    ],
    5: [ // Başak
      "Bugün Başak, Merkür'ün güçlü enerjisi sizi sarıp sarmalıyor! Bu enerji dalgası sizi analiz ve organizasyon konularına yönlendirecek. Sabah erken saatlerde yapacağınız planlama aktiviteleri, gün boyunca sürecek verimliliğin anahtarı olacak. İş hayatınızda beklenmedik bir detay fırsatı kapınızı çalabilir - bu fırsatı değerlendirmek için dikkatli olun. Öğleden sonra, yaratıcı projelerinizde büyük ilerleme kaydedeceksiniz. Akşam saatlerinde sosyal çevrenizde önemli bir kişiyle tanışacaksınız. Bu tanışma, hayatınızda yeni bir dönemin başlangıcı olabilir. Duygusal olarak bugün çok güçlü hissedeceksiniz, bu enerjiyi sevdiklerinizle paylaşın.",
      "Başak, bugün yıldızlar size özel bir mesaj gönderiyor! Merkür'ün retrosu sona erdi ve artık iletişim kanallarınız tamamen açık. Sabah saatlerinde alacağınız bir telefon veya mesaj, hafta sonu planlarınızı tamamen değiştirebilir. Finansal konularda dikkatli olun - beklenmedik bir harcama karşınıza çıkabilir. Öğleden sonra, yaratıcı yeteneklerinizi sergilemek için mükemmel bir zaman. Akşam saatlerinde aile üyelerinizle derin sohbetler yapacaksınız. Bu sohbetler, gelecekteki kararlarınızı etkileyecek önemli bilgiler içerebilir. Duygusal olarak bugün çok hassas olacaksınız - bu hassasiyeti yaratıcılığınıza yönlendirin.",
      "Bugün Başak, yıldızların enerjisi sizi farklı yönlere çekiyor! Sabah erken saatlerde aldığınız bir karar, gün boyunca sizi takip edecek. İş hayatınızda yeni bir proje başlatmak için ideal bir gün - bu proje sizi uzun vadede çok mutlu edecek. Öğleden sonra, sağlığınıza odaklanma zamanı. Spor yapmak veya doğa yürüyüşü yapmak sizi rahatlatacak. Akşam saatlerinde sosyal medyada paylaştığınız bir içerik, beklenmedik bir şekilde viral olabilir. Duygusal olarak bugün çok hassas olacaksınız - bu hassasiyeti yaratıcılığınıza yönlendirin. Bu gün, yaratıcı projelerinizde büyük ilerleme kaydedeceksiniz.",
      "Başak, bugün yıldızlar size özel bir enerji gönderiyor! Sabah saatlerinde alacağınız bir haber, gün boyunca sizi motive edecek. İş hayatınızda yeni bir işbirliği fırsatı doğabilir - bu fırsatı değerlendirmek için hızlı karar verin. Öğleden sonra, yaratıcı projelerinizde büyük ilerleme kaydedeceksiniz. Bu projeler, gelecekteki kariyerinizi şekillendirecek. Akşam saatlerinde sosyal çevrenizde önemli bir kişiyle tanışacaksınız. Bu tanışma, hayatınızda yeni bir dönemin başlangıcı olabilir. Duygusal olarak bugün çok güçlü hissedeceksiniz - bu enerjiyi sevdiklerinizle paylaşın. Bu gün, yaratıcı projelerinizde büyük ilerleme kaydedeceksiniz.",
      "Bugün Başak, yıldızların enerjisi sizi farklı yönlere çekiyor! Sabah erken saatlerde aldığınız bir karar, gün boyunca sizi takip edecek. İş hayatınızda yeni bir proje başlatmak için ideal bir gün - bu proje sizi uzun vadede çok mutlu edecek. Öğleden sonra, sağlığınıza odaklanma zamanı. Spor yapmak veya doğa yürüyüşü yapmak sizi rahatlatacak. Akşam saatlerinde sosyal medyada paylaştığınız bir içerik, beklenmedik bir şekilde viral olabilir. Duygusal olarak bugün çok hassas olacaksınız - bu hassasiyeti yaratıcılığınıza yönlendirin. Bu gün, yaratıcı projelerinizde büyük ilerleme kaydedeceksiniz."
    ],
    6: [ // Terazi
      "Bugün Terazi, Venüs'ün güçlü enerjisi sizi sarıp sarmalıyor! Bu enerji dalgası sizi denge ve güzellik konularına yönlendirecek. Sabah erken saatlerde yapacağınız estetik aktiviteler, gün boyunca sürecek huzurun anahtarı olacak. İş hayatınızda beklenmedik bir denge fırsatı kapınızı çalabilir - bu fırsatı değerlendirmek için adil olun. Öğleden sonra, yaratıcı projelerinizde büyük ilerleme kaydedeceksiniz. Akşam saatlerinde sosyal çevrenizde önemli bir kişiyle tanışacaksınız. Bu tanışma, hayatınızda yeni bir dönemin başlangıcı olabilir. Duygusal olarak bugün çok güçlü hissedeceksiniz, bu enerjiyi sevdiklerinizle paylaşın.",
      "Terazi, bugün yıldızlar size özel bir mesaj gönderiyor! Merkür'ün retrosu sona erdi ve artık iletişim kanallarınız tamamen açık. Sabah saatlerinde alacağınız bir telefon veya mesaj, hafta sonu planlarınızı tamamen değiştirebilir. Finansal konularda dikkatli olun - beklenmedik bir harcama karşınıza çıkabilir. Öğleden sonra, yaratıcı yeteneklerinizi sergilemek için mükemmel bir zaman. Akşam saatlerinde aile üyelerinizle derin sohbetler yapacaksınız. Bu sohbetler, gelecekteki kararlarınızı etkileyecek önemli bilgiler içerebilir. Duygusal olarak bugün çok hassas olacaksınız - bu hassasiyeti yaratıcılığınıza yönlendirin.",
      "Bugün Terazi, yıldızların enerjisi sizi farklı yönlere çekiyor! Sabah erken saatlerde aldığınız bir karar, gün boyunca sizi takip edecek. İş hayatınızda yeni bir proje başlatmak için ideal bir gün - bu proje sizi uzun vadede çok mutlu edecek. Öğleden sonra, sağlığınıza odaklanma zamanı. Spor yapmak veya doğa yürüyüşü yapmak sizi rahatlatacak. Akşam saatlerinde sosyal medyada paylaştığınız bir içerik, beklenmedik bir şekilde viral olabilir. Duygusal olarak bugün çok hassas olacaksınız - bu hassasiyeti yaratıcılığınıza yönlendirin. Bu gün, yaratıcı projelerinizde büyük ilerleme kaydedeceksiniz.",
      "Terazi, bugün yıldızlar size özel bir enerji gönderiyor! Sabah saatlerinde alacağınız bir haber, gün boyunca sizi motive edecek. İş hayatınızda yeni bir işbirliği fırsatı doğabilir - bu fırsatı değerlendirmek için hızlı karar verin. Öğleden sonra, yaratıcı projelerinizde büyük ilerleme kaydedeceksiniz. Bu projeler, gelecekteki kariyerinizi şekillendirecek. Akşam saatlerinde sosyal çevrenizde önemli bir kişiyle tanışacaksınız. Bu tanışma, hayatınızda yeni bir dönemin başlangıcı olabilir. Duygusal olarak bugün çok güçlü hissedeceksiniz - bu enerjiyi sevdiklerinizle paylaşın. Bu gün, yaratıcı projelerinizde büyük ilerleme kaydedeceksiniz.",
      "Bugün Terazi, yıldızların enerjisi sizi farklı yönlere çekiyor! Sabah erken saatlerde aldığınız bir karar, gün boyunca sizi takip edecek. İş hayatınızda yeni bir proje başlatmak için ideal bir gün - bu proje sizi uzun vadede çok mutlu edecek. Öğleden sonra, sağlığınıza odaklanma zamanı. Spor yapmak veya doğa yürüyüşü yapmak sizi rahatlatacak. Akşam saatlerinde sosyal medyada paylaştığınız bir içerik, beklenmedik bir şekilde viral olabilir. Duygusal olarak bugün çok hassas olacaksınız - bu hassasiyeti yaratıcılığınıza yönlendirin. Bu gün, yaratıcı projelerinizde büyük ilerleme kaydedeceksiniz."
    ],
    7: [ // Akrep
      "Bugün Akrep, Pluto'nun güçlü enerjisi sizi sarıp sarmalıyor! Bu enerji dalgası sizi dönüşüm ve derinlik konularına yönlendirecek. Sabah erken saatlerde yapacağınız içsel çalışmalar, gün boyunca sürecek dönüşümün anahtarı olacak. İş hayatınızda beklenmedik bir gizli fırsat kapınızı çalabilir - bu fırsatı değerlendirmek için sezgilerinize güvenin. Öğleden sonra, yaratıcı projelerinizde büyük ilerleme kaydedeceksiniz. Akşam saatlerinde sosyal çevrenizde önemli bir kişiyle tanışacaksınız. Bu tanışma, hayatınızda yeni bir dönemin başlangıcı olabilir. Duygusal olarak bugün çok güçlü hissedeceksiniz, bu enerjiyi sevdiklerinizle paylaşın.",
      "Akrep, bugün yıldızlar size özel bir mesaj gönderiyor! Merkür'ün retrosu sona erdi ve artık iletişim kanallarınız tamamen açık. Sabah saatlerinde alacağınız bir telefon veya mesaj, hafta sonu planlarınızı tamamen değiştirebilir. Finansal konularda dikkatli olun - beklenmedik bir harcama karşınıza çıkabilir. Öğleden sonra, yaratıcı yeteneklerinizi sergilemek için mükemmel bir zaman. Akşam saatlerinde aile üyelerinizle derin sohbetler yapacaksınız. Bu sohbetler, gelecekteki kararlarınızı etkileyecek önemli bilgiler içerebilir. Duygusal olarak bugün çok hassas olacaksınız - bu hassasiyeti yaratıcılığınıza yönlendirin.",
      "Bugün Akrep, yıldızların enerjisi sizi farklı yönlere çekiyor! Sabah erken saatlerde aldığınız bir karar, gün boyunca sizi takip edecek. İş hayatınızda yeni bir proje başlatmak için ideal bir gün - bu proje sizi uzun vadede çok mutlu edecek. Öğleden sonra, sağlığınıza odaklanma zamanı. Spor yapmak veya doğa yürüyüşü yapmak sizi rahatlatacak. Akşam saatlerinde sosyal medyada paylaştığınız bir içerik, beklenmedik bir şekilde viral olabilir. Duygusal olarak bugün çok hassas olacaksınız - bu hassasiyeti yaratıcılığınıza yönlendirin. Bu gün, yaratıcı projelerinizde büyük ilerleme kaydedeceksiniz.",
      "Akrep, bugün yıldızlar size özel bir enerji gönderiyor! Sabah saatlerinde alacağınız bir haber, gün boyunca sizi motive edecek. İş hayatınızda yeni bir işbirliği fırsatı doğabilir - bu fırsatı değerlendirmek için hızlı karar verin. Öğleden sonra, yaratıcı projelerinizde büyük ilerleme kaydedeceksiniz. Bu projeler, gelecekteki kariyerinizi şekillendirecek. Akşam saatlerinde sosyal çevrenizde önemli bir kişiyle tanışacaksınız. Bu tanışma, hayatınızda yeni bir dönemin başlangıcı olabilir. Duygusal olarak bugün çok güçlü hissedeceksiniz - bu enerjiyi sevdiklerinizle paylaşın. Bu gün, yaratıcı projelerinizde büyük ilerleme kaydedeceksiniz.",
      "Bugün Akrep, yıldızların enerjisi sizi farklı yönlere çekiyor! Sabah erken saatlerde aldığınız bir karar, gün boyunca sizi takip edecek. İş hayatınızda yeni bir proje başlatmak için ideal bir gün - bu proje sizi uzun vadede çok mutlu edecek. Öğleden sonra, sağlığınıza odaklanma zamanı. Spor yapmak veya doğa yürüyüşü yapmak sizi rahatlatacak. Akşam saatlerinde sosyal medyada paylaştığınız bir içerik, beklenmedik bir şekilde viral olabilir. Duygusal olarak bugün çok hassas olacaksınız - bu hassasiyeti yaratıcılığınıza yönlendirin. Bu gün, yaratıcı projelerinizde büyük ilerleme kaydedeceksiniz."
    ],
    8: [ // Yay
      "Bugün Yay, Jüpiter'in güçlü enerjisi sizi sarıp sarmalıyor! Bu enerji dalgası sizi macera ve öğrenme konularına yönlendirecek. Sabah erken saatlerde yapacağınız öğrenme aktiviteleri, gün boyunca sürecek bilgi arayışının anahtarı olacak. İş hayatınızda beklenmedik bir seyahat fırsatı kapınızı çalabilir - bu fırsatı değerlendirmek için cesaretinizi toplayın. Öğleden sonra, yaratıcı projelerinizde büyük ilerleme kaydedeceksiniz. Akşam saatlerinde sosyal çevrenizde önemli bir kişiyle tanışacaksınız. Bu tanışma, hayatınızda yeni bir dönemin başlangıcı olabilir. Duygusal olarak bugün çok güçlü hissedeceksiniz, bu enerjiyi sevdiklerinizle paylaşın.",
      "Yay, bugün yıldızlar size özel bir mesaj gönderiyor! Merkür'ün retrosu sona erdi ve artık iletişim kanallarınız tamamen açık. Sabah saatlerinde alacağınız bir telefon veya mesaj, hafta sonu planlarınızı tamamen değiştirebilir. Finansal konularda dikkatli olun - beklenmedik bir harcama karşınıza çıkabilir. Öğleden sonra, yaratıcı yeteneklerinizi sergilemek için mükemmel bir zaman. Akşam saatlerinde aile üyelerinizle derin sohbetler yapacaksınız. Bu sohbetler, gelecekteki kararlarınızı etkileyecek önemli bilgiler içerebilir. Duygusal olarak bugün çok hassas olacaksınız - bu hassasiyeti yaratıcılığınıza yönlendirin.",
      "Bugün Yay, yıldızların enerjisi sizi farklı yönlere çekiyor! Sabah erken saatlerde aldığınız bir karar, gün boyunca sizi takip edecek. İş hayatınızda yeni bir proje başlatmak için ideal bir gün - bu proje sizi uzun vadede çok mutlu edecek. Öğleden sonra, sağlığınıza odaklanma zamanı. Spor yapmak veya doğa yürüyüşü yapmak sizi rahatlatacak. Akşam saatlerinde sosyal medyada paylaştığınız bir içerik, beklenmedik bir şekilde viral olabilir. Duygusal olarak bugün çok hassas olacaksınız - bu hassasiyeti yaratıcılığınıza yönlendirin. Bu gün, yaratıcı projelerinizde büyük ilerleme kaydedeceksiniz.",
      "Yay, bugün yıldızlar size özel bir enerji gönderiyor! Sabah saatlerinde alacağınız bir haber, gün boyunca sizi motive edecek. İş hayatınızda yeni bir işbirliği fırsatı doğabilir - bu fırsatı değerlendirmek için hızlı karar verin. Öğleden sonra, yaratıcı projelerinizde büyük ilerleme kaydedeceksiniz. Bu projeler, gelecekteki kariyerinizi şekillendirecek. Akşam saatlerinde sosyal çevrenizde önemli bir kişiyle tanışacaksınız. Bu tanışma, hayatınızda yeni bir dönemin başlangıcı olabilir. Duygusal olarak bugün çok güçlü hissedeceksiniz - bu enerjiyi sevdiklerinizle paylaşın. Bu gün, yaratıcı projelerinizde büyük ilerleme kaydedeceksiniz.",
      "Bugün Yay, yıldızların enerjisi sizi farklı yönlere çekiyor! Sabah erken saatlerde aldığınız bir karar, gün boyunca sizi takip edecek. İş hayatınızda yeni bir proje başlatmak için ideal bir gün - bu proje sizi uzun vadede çok mutlu edecek. Öğleden sonra, sağlığınıza odaklanma zamanı. Spor yapmak veya doğa yürüyüşü yapmak sizi rahatlatacak. Akşam saatlerinde sosyal medyada paylaştığınız bir içerik, beklenmedik bir şekilde viral olabilir. Duygusal olarak bugün çok hassas olacaksınız - bu hassasiyeti yaratıcılığınıza yönlendirin. Bu gün, yaratıcı projelerinizde büyük ilerleme kaydedeceksiniz."
    ],
    9: [ // Oğlak
      "Bugün Oğlak, Satürn'ün güçlü enerjisi sizi sarıp sarmalıyor! Bu enerji dalgası sizi disiplin ve başarı konularına yönlendirecek. Sabah erken saatlerde yapacağınız planlama aktiviteleri, gün boyunca sürecek başarının anahtarı olacak. İş hayatınızda beklenmedik bir kariyer fırsatı kapınızı çalabilir - bu fırsatı değerlendirmek için sabırlı olun. Öğleden sonra, yaratıcı projelerinizde büyük ilerleme kaydedeceksiniz. Akşam saatlerinde sosyal çevrenizde önemli bir kişiyle tanışacaksınız. Bu tanışma, hayatınızda yeni bir dönemin başlangıcı olabilir. Duygusal olarak bugün çok güçlü hissedeceksiniz, bu enerjiyi sevdiklerinizle paylaşın.",
      "Oğlak, bugün yıldızlar size özel bir mesaj gönderiyor! Merkür'ün retrosu sona erdi ve artık iletişim kanallarınız tamamen açık. Sabah saatlerinde alacağınız bir telefon veya mesaj, hafta sonu planlarınızı tamamen değiştirebilir. Finansal konularda dikkatli olun - beklenmedik bir harcama karşınıza çıkabilir. Öğleden sonra, yaratıcı yeteneklerinizi sergilemek için mükemmel bir zaman. Akşam saatlerinde aile üyelerinizle derin sohbetler yapacaksınız. Bu sohbetler, gelecekteki kararlarınızı etkileyecek önemli bilgiler içerebilir. Duygusal olarak bugün çok hassas olacaksınız - bu hassasiyeti yaratıcılığınıza yönlendirin.",
      "Bugün Oğlak, yıldızların enerjisi sizi farklı yönlere çekiyor! Sabah erken saatlerde aldığınız bir karar, gün boyunca sizi takip edecek. İş hayatınızda yeni bir proje başlatmak için ideal bir gün - bu proje sizi uzun vadede çok mutlu edecek. Öğleden sonra, sağlığınıza odaklanma zamanı. Spor yapmak veya doğa yürüyüşü yapmak sizi rahatlatacak. Akşam saatlerinde sosyal medyada paylaştığınız bir içerik, beklenmedik bir şekilde viral olabilir. Duygusal olarak bugün çok hassas olacaksınız - bu hassasiyeti yaratıcılığınıza yönlendirin. Bu gün, yaratıcı projelerinizde büyük ilerleme kaydedeceksiniz.",
      "Oğlak, bugün yıldızlar size özel bir enerji gönderiyor! Sabah saatlerinde alacağınız bir haber, gün boyunca sizi motive edecek. İş hayatınızda yeni bir işbirliği fırsatı doğabilir - bu fırsatı değerlendirmek için hızlı karar verin. Öğleden sonra, yaratıcı projelerinizde büyük ilerleme kaydedeceksiniz. Bu projeler, gelecekteki kariyerinizi şekillendirecek. Akşam saatlerinde sosyal çevrenizde önemli bir kişiyle tanışacaksınız. Bu tanışma, hayatınızda yeni bir dönemin başlangıcı olabilir. Duygusal olarak bugün çok güçlü hissedeceksiniz - bu enerjiyi sevdiklerinizle paylaşın. Bu gün, yaratıcı projelerinizde büyük ilerleme kaydedeceksiniz.",
      "Bugün Oğlak, yıldızların enerjisi sizi farklı yönlere çekiyor! Sabah erken saatlerde aldığınız bir karar, gün boyunca sizi takip edecek. İş hayatınızda yeni bir proje başlatmak için ideal bir gün - bu proje sizi uzun vadede çok mutlu edecek. Öğleden sonra, sağlığınıza odaklanma zamanı. Spor yapmak veya doğa yürüyüşü yapmak sizi rahatlatacak. Akşam saatlerinde sosyal medyada paylaştığınız bir içerik, beklenmedik bir şekilde viral olabilir. Duygusal olarak bugün çok hassas olacaksınız - bu hassasiyeti yaratıcılığınıza yönlendirin. Bu gün, yaratıcı projelerinizde büyük ilerleme kaydedeceksiniz."
    ],
    10: [ // Kova
      "Bugün Kova, Uranüs'ün güçlü enerjisi sizi sarıp sarmalıyor! Bu enerji dalgası sizi yenilik ve orijinallik konularına yönlendirecek. Sabah erken saatlerde yapacağınız yaratıcı aktiviteler, gün boyunca sürecek ilhamın anahtarı olacak. İş hayatınızda beklenmedik bir teknoloji fırsatı kapınızı çalabilir - bu fırsatı değerlendirmek için cesaretinizi toplayın. Öğleden sonra, yaratıcı projelerinizde büyük ilerleme kaydedeceksiniz. Akşam saatlerinde sosyal çevrenizde önemli bir kişiyle tanışacaksınız. Bu tanışma, hayatınızda yeni bir dönemin başlangıcı olabilir. Duygusal olarak bugün çok güçlü hissedeceksiniz, bu enerjiyi sevdiklerinizle paylaşın.",
      "Kova, bugün yıldızlar size özel bir mesaj gönderiyor! Merkür'ün retrosu sona erdi ve artık iletişim kanallarınız tamamen açık. Sabah saatlerinde alacağınız bir telefon veya mesaj, hafta sonu planlarınızı tamamen değiştirebilir. Finansal konularda dikkatli olun - beklenmedik bir harcama karşınıza çıkabilir. Öğleden sonra, yaratıcı yeteneklerinizi sergilemek için mükemmel bir zaman. Akşam saatlerinde aile üyelerinizle derin sohbetler yapacaksınız. Bu sohbetler, gelecekteki kararlarınızı etkileyecek önemli bilgiler içerebilir. Duygusal olarak bugün çok hassas olacaksınız - bu hassasiyeti yaratıcılığınıza yönlendirin.",
      "Bugün Kova, yıldızların enerjisi sizi farklı yönlere çekiyor! Sabah erken saatlerde aldığınız bir karar, gün boyunca sizi takip edecek. İş hayatınızda yeni bir proje başlatmak için ideal bir gün - bu proje sizi uzun vadede çok mutlu edecek. Öğleden sonra, sağlığınıza odaklanma zamanı. Spor yapmak veya doğa yürüyüşü yapmak sizi rahatlatacak. Akşam saatlerinde sosyal medyada paylaştığınız bir içerik, beklenmedik bir şekilde viral olabilir. Duygusal olarak bugün çok hassas olacaksınız - bu hassasiyeti yaratıcılığınıza yönlendirin. Bu gün, yaratıcı projelerinizde büyük ilerleme kaydedeceksiniz.",
      "Kova, bugün yıldızlar size özel bir enerji gönderiyor! Sabah saatlerinde alacağınız bir haber, gün boyunca sizi motive edecek. İş hayatınızda yeni bir işbirliği fırsatı doğabilir - bu fırsatı değerlendirmek için hızlı karar verin. Öğleden sonra, yaratıcı projelerinizde büyük ilerleme kaydedeceksiniz. Bu projeler, gelecekteki kariyerinizi şekillendirecek. Akşam saatlerinde sosyal çevrenizde önemli bir kişiyle tanışacaksınız. Bu tanışma, hayatınızda yeni bir dönemin başlangıcı olabilir. Duygusal olarak bugün çok güçlü hissedeceksiniz - bu enerjiyi sevdiklerinizle paylaşın. Bu gün, yaratıcı projelerinizde büyük ilerleme kaydedeceksiniz.",
      "Bugün Kova, yıldızların enerjisi sizi farklı yönlere çekiyor! Sabah erken saatlerde aldığınız bir karar, gün boyunca sizi takip edecek. İş hayatınızda yeni bir proje başlatmak için ideal bir gün - bu proje sizi uzun vadede çok mutlu edecek. Öğleden sonra, sağlığınıza odaklanma zamanı. Spor yapmak veya doğa yürüyüşü yapmak sizi rahatlatacak. Akşam saatlerinde sosyal medyada paylaştığınız bir içerik, beklenmedik bir şekilde viral olabilir. Duygusal olarak bugün çok hassas olacaksınız - bu hassasiyeti yaratıcılığınıza yönlendirin. Bu gün, yaratıcı projelerinizde büyük ilerleme kaydedeceksiniz."
    ],
    11: [ // Balık
      "Bugün Balık, Neptün'ün güçlü enerjisi sizi sarıp sarmalıyor! Bu enerji dalgası sizi sezgiler ve yaratıcılık konularına yönlendirecek. Sabah erken saatlerde yapacağınız meditasyon veya yaratıcı aktiviteler, gün boyunca sürecek ilhamın anahtarı olacak. İş hayatınızda beklenmedik bir sanat fırsatı kapınızı çalabilir - bu fırsatı değerlendirmek için sezgilerinize güvenin. Öğleden sonra, yaratıcı projelerinizde büyük ilerleme kaydedeceksiniz. Akşam saatlerinde sosyal çevrenizde önemli bir kişiyle tanışacaksınız. Bu tanışma, hayatınızda yeni bir dönemin başlangıcı olabilir. Duygusal olarak bugün çok güçlü hissedeceksiniz, bu enerjiyi sevdiklerinizle paylaşın.",
      "Balık, bugün yıldızlar size özel bir mesaj gönderiyor! Merkür'ün retrosu sona erdi ve artık iletişim kanallarınız tamamen açık. Sabah saatlerinde alacağınız bir telefon veya mesaj, hafta sonu planlarınızı tamamen değiştirebilir. Finansal konularda dikkatli olun - beklenmedik bir harcama karşınıza çıkabilir. Öğleden sonra, yaratıcı yeteneklerinizi sergilemek için mükemmel bir zaman. Akşam saatlerinde aile üyelerinizle derin sohbetler yapacaksınız. Bu sohbetler, gelecekteki kararlarınızı etkileyecek önemli bilgiler içerebilir. Duygusal olarak bugün çok hassas olacaksınız - bu hassasiyeti yaratıcılığınıza yönlendirin.",
      "Bugün Balık, yıldızların enerjisi sizi farklı yönlere çekiyor! Sabah erken saatlerde aldığınız bir karar, gün boyunca sizi takip edecek. İş hayatınızda yeni bir proje başlatmak için ideal bir gün - bu proje sizi uzun vadede çok mutlu edecek. Öğleden sonra, sağlığınıza odaklanma zamanı. Spor yapmak veya doğa yürüyüşü yapmak sizi rahatlatacak. Akşam saatlerinde sosyal medyada paylaştığınız bir içerik, beklenmedik bir şekilde viral olabilir. Duygusal olarak bugün çok hassas olacaksınız - bu hassasiyeti yaratıcılığınıza yönlendirin. Bu gün, yaratıcı projelerinizde büyük ilerleme kaydedeceksiniz.",
      "Balık, bugün yıldızlar size özel bir enerji gönderiyor! Sabah saatlerinde alacağınız bir haber, gün boyunca sizi motive edecek. İş hayatınızda yeni bir işbirliği fırsatı doğabilir - bu fırsatı değerlendirmek için hızlı karar verin. Öğleden sonra, yaratıcı projelerinizde büyük ilerleme kaydedeceksiniz. Bu projeler, gelecekteki kariyerinizi şekillendirecek. Akşam saatlerinde sosyal çevrenizde önemli bir kişiyle tanışacaksınız. Bu tanışma, hayatınızda yeni bir dönemin başlangıcı olabilir. Duygusal olarak bugün çok güçlü hissedeceksiniz - bu enerjiyi sevdiklerinizle paylaşın. Bu gün, yaratıcı projelerinizde büyük ilerleme kaydedeceksiniz.",
      "Bugün Balık, yıldızların enerjisi sizi farklı yönlere çekiyor! Sabah erken saatlerde aldığınız bir karar, gün boyunca sizi takip edecek. İş hayatınızda yeni bir proje başlatmak için ideal bir gün - bu proje sizi uzun vadede çok mutlu edecek. Öğleden sonra, sağlığınıza odaklanma zamanı. Spor yapmak veya doğa yürüyüşü yapmak sizi rahatlatacak. Akşam saatlerinde sosyal medyada paylaştığınız bir içerik, beklenmedik bir şekilde viral olabilir. Duygusal olarak bugün çok hassas olacaksınız - bu hassasiyeti yaratıcılığınıza yönlendirin. Bu gün, yaratıcı projelerinizde büyük ilerleme kaydedeceksiniz."
    ]
  }
  
  const zodiacMessages = dailyMessages[zodiacId as keyof typeof dailyMessages] || dailyMessages[0]
  const messageIndex = dayOfYear % zodiacMessages.length
  return zodiacMessages[messageIndex]
}


const getPredictionMessage = (zodiacId: number, categoryId: string) => {
  const predictions = {
    love: {
      0: "Aşk hayatınızda yeni bir başlangıç yaklaşıyor. Cesaretinizi toplayın ve kalbinizi açın. Yıldızlar size özel birini getirecek.",
      1: "Mevcut ilişkinizde derinleşme zamanı. Sabır ve anlayış gösterin. Aşkınız daha da güçlenecek.",
      2: "İletişim becerileriniz aşk hayatınızda büyük fark yaratacak. Dürüst olun ve duygularınızı paylaşın.",
      3: "Aile ve yakın çevrenizle ilgili aşk konularında dikkatli olun. İçgüdülerinize güvenin.",
      4: "Liderlik vasıflarınız aşk hayatınızda çekici gelecek. Kendinizi ifade etmekten çekinmeyin.",
      5: "Detaylara odaklanarak aşk hayatınızı iyileştirin. Küçük jestler büyük etki yaratacak.",
      6: "Denge ve uyum arayışınız aşk hayatınızda başarı getirecek. Adil olmaya çalışın.",
      7: "Derin duygusal bağlantılar kurma zamanı. Gizli duygular ortaya çıkabilir.",
      8: "Macera ve keşif ruhuyla aşk hayatınızda yeni deneyimler yaşayacaksınız.",
      9: "Uzun vadeli aşk planları yapma zamanı. Ciddi ilişkiler için hazır olun.",
      10: "Grup çalışmalarından aşk hayatınızda faydalanın. Yeni insanlarla tanışın.",
      11: "Sezgileriniz aşk hayatınızda çok güçlü. Duygusal derinlik yaşayacaksınız."
    },
    money: {
      0: "Yeni finansal fırsatlar kapınızı çalacak. Cesaretinizi toplayın ve yatırım yapın.",
      1: "Sabırlı yatırımlarınız meyvesini verecek. Finansal güvenliğiniz artacak.",
      2: "İletişim becerileriniz para kazanma konusunda size avantaj sağlayacak.",
      3: "Aile ve yakın çevrenizden finansal destek alabilirsiniz. İçgüdülerinize güvenin.",
      4: "Liderlik vasıflarınız finansal başarı getirecek. Yaratıcı projelerden para kazanın.",
      5: "Detaylı planlama ile finansal hedeflerinize ulaşacaksınız.",
      6: "Denge ve uyum arayışınız finansal konularda başarı getirecek.",
      7: "Derin analizler yaparak büyük finansal fırsatlar bulacaksınız.",
      8: "Macera ve keşif ruhuyla yeni para kazanma yolları keşfedeceksiniz.",
      9: "Disiplinli çalışma ile finansal hedeflerinize ulaşacaksınız.",
      10: "Grup çalışmalarından finansal fayda sağlayacaksınız.",
      11: "Sezgileriniz finansal konularda çok güçlü. Duygusal yatırımlardan kaçının."
    },
    career: {
      0: "Kariyerinizde yeni başlangıçlar için mükemmel zaman. Cesaretinizi toplayın.",
      1: "Sabır ve kararlılık ile kariyer hedeflerinize ulaşacaksınız.",
      2: "İletişim becerileriniz kariyerinizde büyük fark yaratacak.",
      3: "Aile ve yakın çevrenizden kariyer desteği alabilirsiniz.",
      4: "Liderlik vasıflarınız kariyerinizde öne çıkacak.",
      5: "Detaylı planlama ile kariyer hedeflerinize ulaşacaksınız.",
      6: "Denge ve uyum arayışınız kariyerinizde başarı getirecek.",
      7: "Derin analizler yaparak kariyer fırsatları bulacaksınız.",
      8: "Macera ve keşif ruhuyla yeni kariyer yolları keşfedeceksiniz.",
      9: "Disiplinli çalışma ile kariyer hedeflerinize ulaşacaksınız.",
      10: "Grup çalışmalarından kariyer faydası sağlayacaksınız.",
      11: "Sezgileriniz kariyer konularında çok güçlü. Yaratıcı projelerde başarılı olacaksınız."
    },
    crypto: {
      0: "Kripto para yatırımlarında yeni fırsatlar yaklaşıyor. Cesaretinizi toplayın.",
      1: "Sabırlı kripto yatırımlarınız meyvesini verecek.",
      2: "İletişim becerileriniz kripto topluluğunda avantaj sağlayacak.",
      3: "Aile ve yakın çevrenizden kripto desteği alabilirsiniz.",
      4: "Liderlik vasıflarınız kripto projelerinde başarı getirecek.",
      5: "Detaylı analizler ile kripto yatırımlarınızda başarılı olacaksınız.",
      6: "Denge ve uyum arayışınız kripto portföyünüzde başarı getirecek.",
      7: "Derin analizler yaparak büyük kripto fırsatları bulacaksınız.",
      8: "Macera ve keşif ruhuyla yeni kripto projeleri keşfedeceksiniz.",
      9: "Disiplinli yaklaşım ile kripto yatırımlarınızda başarılı olacaksınız.",
      10: "Grup çalışmalarından kripto faydası sağlayacaksınız.",
      11: "Sezgileriniz kripto konularında çok güçlü. Duygusal yatırımlardan kaçının."
    },
    nft: {
      0: "NFT koleksiyonunuzda yeni fırsatlar yaklaşıyor. Cesaretinizi toplayın.",
      1: "Sabırlı NFT yatırımlarınız meyvesini verecek.",
      2: "İletişim becerileriniz NFT topluluğunda avantaj sağlayacak.",
      3: "Aile ve yakın çevrenizden NFT desteği alabilirsiniz.",
      4: "Liderlik vasıflarınız NFT projelerinde başarı getirecek.",
      5: "Detaylı analizler ile NFT yatırımlarınızda başarılı olacaksınız.",
      6: "Denge ve uyum arayışınız NFT portföyünüzde başarı getirecek.",
      7: "Derin analizler yaparak büyük NFT fırsatları bulacaksınız.",
      8: "Macera ve keşif ruhuyla yeni NFT projeleri keşfedeceksiniz.",
      9: "Disiplinli yaklaşım ile NFT yatırımlarınızda başarılı olacaksınız.",
      10: "Grup çalışmalarından NFT faydası sağlayacaksınız.",
      11: "Sezgileriniz NFT konularında çok güçlü. Yaratıcı projelerde başarılı olacaksınız."
    }
  }
  
  return predictions[categoryId as keyof typeof predictions]?.[zodiacId as keyof typeof predictions[typeof categoryId]] || 
         "Yıldızlar size özel mesajlar gönderiyor. Pozitif enerjinizi koruyun ve fırsatları değerlendirin."
}

const getTimeframe = (categoryId: string) => {
  const timeframes = {
    love: "1-3 ay içinde",
    money: "2-6 ay içinde", 
    career: "3-12 ay içinde",
    crypto: "1-6 ay içinde",
    nft: "1-4 ay içinde"
  }
  return timeframes[categoryId as keyof typeof timeframes] || "Yakın gelecekte"
}

export default function Home() {
  const { address, isConnected } = useAccount()
  const { language, setLanguage, t } = useLanguage()
  const [selectedZodiac, setSelectedZodiac] = useState<number>(0)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [farcasterId, setFarcasterId] = useState<string>('')
  const [hasCheckedIn, setHasCheckedIn] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [horoscopeData, setHoroscopeData] = useState<any>(null)
  const [predictionData, setPredictionData] = useState<any>(null)
  const [isMinted, setIsMinted] = useState<boolean>(false)

  // Mock data for development
  const mockHoroscopeData = {
    message: getHoroscopeMessage(selectedZodiac)
  }

  const mockPredictionData = selectedCategory ? {
    message: getPredictionMessage(selectedZodiac, selectedCategory),
    confidence: Math.floor(Math.random() * 30) + 70, // 70-100%
    timeframe: getTimeframe(selectedCategory)
  } : null

  // Mock check-in function
  const mockCheckIn = async () => {
    setIsLoading(true)
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000))
    setHasCheckedIn(true)
    // Set horoscope data based on selected zodiac
    setHoroscopeData({
      message: getHoroscopeMessage(selectedZodiac)
    })
    setIsLoading(false)
  }

  // Mock mint function
  const mockMint = async () => {
    setIsLoading(true)
    // Simulate minting delay
    await new Promise(resolve => setTimeout(resolve, 3000))
    setIsMinted(true)
    setIsLoading(false)
  }

  // Update horoscope data when zodiac changes
  useEffect(() => {
    if (hasCheckedIn) {
      setHoroscopeData({
        message: getHoroscopeMessage(selectedZodiac)
      })
    }
  }, [selectedZodiac, hasCheckedIn])

  const handleCheckIn = async () => {
    if (!address || !farcasterId) return
    
    await mockCheckIn()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Header */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10 container mx-auto px-4 py-6">
          {/* Logo - Centered at top */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center mb-6"
          >
            <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center overflow-hidden mb-4 shadow-2xl shadow-purple-500/50">
              <Image 
                src="/logo.png" 
                alt="HoroscopeMint Logo" 
                width={80} 
                height={80}
                className="w-full h-full object-contain"
              />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">HoroscopeMint</h1>
            <p className="text-purple-200 text-lg">Günlük Burç Yorumları</p>
          </motion.div>
          
          {/* Connect Button - Top Right */}
          <div className="flex justify-end">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <ConnectButton />
            </motion.div>
          </div>
        </div>
        
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse-slow"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-500/20 rounded-full blur-3xl animate-pulse-slow"></div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-4 py-8">
        {!isConnected ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <div className="max-w-md mx-auto">
              <h2 className="text-3xl font-bold text-white mb-4">
                Cüzdanınızı Bağlayın
              </h2>
              <p className="text-purple-200 mb-8">
                Günlük burç yorumlarınızı almak için cüzdanınızı bağlayın ve Base ağı üzerinde SDCE fee ödeyin.
              </p>
              <ConnectButton />
            </div>
          </motion.div>
        ) : (
          <div className="max-w-4xl mx-auto">
            {/* Language Selection */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <LanguageSelector
                languages={LANGUAGES}
                selectedLanguage={language}
                onSelectLanguage={setLanguage}
              />
            </motion.div>

            {/* Daily Streak */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-8"
            >
              <DailyStreak address={address} />
            </motion.div>

            {/* Zodiac Selection */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-8"
            >
              <ZodiacSelector
                zodiacSigns={ZODIAC_SIGNS}
                selectedZodiac={selectedZodiac}
                onSelectZodiac={setSelectedZodiac}
              />
            </motion.div>

            {/* Category Selection */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mb-8"
            >
              <CategorySelector
                categories={PREDICTION_CATEGORIES}
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
              />
            </motion.div>

            {/* Farcaster ID Input */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mb-8"
            >
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                <label className="block text-white font-medium mb-3">
                  Farcaster ID
                </label>
                <input
                  type="text"
                  value={farcasterId}
                  onChange={(e) => setFarcasterId(e.target.value)}
                  placeholder="Farcaster ID'nizi girin"
                  className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <p className="text-purple-200 text-sm mt-2">
                  Farcaster profilinizdeki ID numaranızı girin
                </p>
              </div>
            </motion.div>

            {/* Check-in Status */}
            {hasCheckedIn ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-8"
              >
                <div className="bg-green-500/20 border border-green-500/30 rounded-2xl p-6 text-center">
                  <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-green-400 mb-2">
                    Bugün Check-in Yaptınız!
                  </h3>
                  <p className="text-green-200">
                    Günlük burç yorumunuz hazır. Aşağıdan görüntüleyebilirsiniz.
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mb-8"
              >
                <CheckInButton
                  onCheckIn={handleCheckIn}
                  isLoading={isLoading}
                  disabled={!farcasterId}
                />
              </motion.div>
            )}


            {/* Prediction Display */}
            {selectedCategory && mockPredictionData && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="mb-8"
              >
                <PredictionCard
                  zodiacSign={ZODIAC_SIGNS[selectedZodiac]}
                  category={PREDICTION_CATEGORIES.find(cat => cat.id === selectedCategory)!}
                  predictionData={mockPredictionData}
                  isMinted={isMinted}
                  onMint={mockMint}
                />
              </motion.div>
            )}

            {/* Horoscope Display */}
            {horoscopeData && !selectedCategory && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <HoroscopeCard
                  zodiacSign={ZODIAC_SIGNS[selectedZodiac]}
                  horoscopeData={horoscopeData}
                />
              </motion.div>
            )}
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-black/20 backdrop-blur-lg border-t border-white/20 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-center space-x-8">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex flex-col items-center space-y-1 text-purple-300"
            >
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <span className="text-sm">🏠</span>
              </div>
              <span className="text-xs font-medium">Anasayfa</span>
            </motion.button>
            <Link href="/profile">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex flex-col items-center space-y-1 text-white hover:text-purple-300 transition-colors"
              >
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <span className="text-sm">👤</span>
                </div>
                <span className="text-xs font-medium">Profil</span>
              </motion.button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Footer */}
      <footer className="relative z-10 mt-20 py-8 border-t border-white/10">
        <div className="container mx-auto px-4 text-center">
          <p className="text-purple-200">
            HoroscopeMint - Base ağı üzerinde günlük burç yorumları
          </p>
          <div className="flex items-center justify-center space-x-4 mt-4">
            <div className="flex items-center space-x-2 text-purple-300">
              <Coins className="w-4 h-4" />
              <span className="text-sm">SDCE Fee: 0.001</span>
            </div>
            <div className="flex items-center space-x-2 text-purple-300">
              <Zap className="w-4 h-4" />
              <span className="text-sm">Base Network</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
