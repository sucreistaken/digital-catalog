// i18n - Translation System
// Languages: TR, EN, AR, DE, ZH

export const languages = [
    { code: 'en', name: 'English', flag: '🇬🇧', dir: 'ltr' },
    { code: 'tr', name: 'Türkçe', flag: '🇹🇷', dir: 'ltr' },
    { code: 'ar', name: 'العربية', flag: '🇸🇦', dir: 'rtl' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪', dir: 'ltr' },
    { code: 'zh', name: '中文', flag: '🇨🇳', dir: 'ltr' },
];

export const translations = {
    en: {
        // Navigation
        home: 'Home',
        catalog: 'Catalog',
        about: 'About',
        contact: 'Contact',
        adminPanel: 'Admin Panel',

        // Home Page
        heroTitle: 'Quality You Can',
        heroTitleHighlight: 'Trust',
        heroSubtitle: 'Leading manufacturer of sustainable plastic products for home, garden, and industry. Based in Adana, serving the world.',
        exploreCatalog: 'Explore Catalog',
        contactSales: 'Contact Sales',
        whyChooseUs: 'Why Choose FreeGarden?',
        builtWithQuality: 'Built with quality, designed for performance',

        // Features
        ecoFriendly: 'Eco-Friendly',
        ecoFriendlyDesc: 'Sustainable materials and recycled plastics for a greener future.',
        premiumQuality: 'Premium Quality',
        premiumQualityDesc: 'Durable products designed to last for years of use.',
        globalReach: 'Global Reach',
        globalReachDesc: 'Serving customers across Europe, Middle East, and beyond.',

        // Catalog
        ourProducts: 'Our Products',
        premiumPlasticSolutions: 'Premium plastic solutions for every need',
        searchProducts: 'Search products...',
        filter: 'Filter',
        all: 'All',
        viewDetails: 'View Details',
        outOfStock: 'Out of Stock',
        requestQuote: 'Request Quote',
        addToInquiry: 'Add to Inquiry',

        // Product Details
        productDetails: 'Product Details',
        dimensions: 'Dimensions',
        weight: 'Weight',
        material: 'Material',
        availableColors: 'Available Colors',
        colorOptions: 'Color Options',
        sku: 'SKU',
        widthLabel: 'Width',
        heightLabel: 'Height',
        depthLabel: 'Depth',
        cm: 'cm',
        kg: 'kg',

        // Quote Form
        requestAQuote: 'Request a Quote',
        quoteFormDesc: 'Fill out the form below and we will get back to you within 24 hours.',
        yourName: 'Your Name',
        companyName: 'Company Name',
        email: 'Email Address',
        phone: 'Phone Number',
        country: 'Country',
        message: 'Message',
        productsOfInterest: 'Products of Interest',
        submitRequest: 'Submit Request',
        sending: 'Sending...',
        quoteSuccess: 'Your quote request has been submitted successfully!',

        // Contact
        getInTouch: 'Get in Touch',
        contactDesc: 'Have questions? We would love to hear from you.',
        callUs: 'Call Us',
        whatsapp: 'WhatsApp',
        emailUs: 'Email Us',
        visitUs: 'Visit Us',
        address: 'Adana, Turkey',

        // Footer
        allRightsReserved: 'All rights reserved.',
        premiumPlasticProducts: 'Premium Plastic Solutions',

        // Admin
        dashboard: 'Dashboard',
        products: 'Products',
        categories: 'Categories',
        quoteRequests: 'Quote Requests',
        customers: 'Customers',
        settings: 'Settings',
        exitAdmin: 'Exit Admin',

        // Categories
        furniture: 'Furniture',
        garden: 'Garden',
        storage: 'Storage',
        industrial: 'Industrial',
        kids: 'Kids',
    },

    tr: {
        // Navigation
        home: 'Ana Sayfa',
        catalog: 'Katalog',
        about: 'Hakkımızda',
        contact: 'İletişim',
        adminPanel: 'Yönetim Paneli',

        // Home Page
        heroTitle: 'Güvenebileceğiniz',
        heroTitleHighlight: 'Kalite',
        heroSubtitle: 'Ev, bahçe ve endüstri için sürdürülebilir plastik ürünlerin lider üreticisi. Adana merkezli, dünyaya hizmet veriyor.',
        exploreCatalog: 'Kataloğu Keşfet',
        contactSales: 'Satış ile İletişim',
        whyChooseUs: 'Neden FreeGarden?',
        builtWithQuality: 'Kalite ile üretildi, performans için tasarlandı',

        // Features
        ecoFriendly: 'Çevre Dostu',
        ecoFriendlyDesc: 'Daha yeşil bir gelecek için sürdürülebilir malzemeler ve geri dönüştürülmüş plastikler.',
        premiumQuality: 'Premium Kalite',
        premiumQualityDesc: 'Yıllarca kullanım için tasarlanmış dayanıklı ürünler.',
        globalReach: 'Küresel Erişim',
        globalReachDesc: 'Avrupa, Orta Doğu ve ötesindeki müşterilere hizmet veriyoruz.',

        // Catalog
        ourProducts: 'Ürünlerimiz',
        premiumPlasticSolutions: 'Her ihtiyaç için premium plastik çözümler',
        searchProducts: 'Ürün ara...',
        filter: 'Filtrele',
        all: 'Tümü',
        viewDetails: 'Detayları Gör',
        outOfStock: 'Stokta Yok',
        requestQuote: 'Teklif İste',
        addToInquiry: 'Sorguya Ekle',

        // Product Details
        productDetails: 'Ürün Detayları',
        dimensions: 'Boyutlar',
        weight: 'Ağırlık',
        material: 'Malzeme',
        availableColors: 'Mevcut Renkler',
        colorOptions: 'Renk Seçenekleri',
        sku: 'Ürün Kodu',
        widthLabel: 'Genişlik',
        heightLabel: 'Yükseklik',
        depthLabel: 'Derinlik',
        cm: 'cm',
        kg: 'kg',

        // Quote Form
        requestAQuote: 'Teklif İsteyin',
        quoteFormDesc: 'Aşağıdaki formu doldurun, 24 saat içinde size dönüş yapacağız.',
        yourName: 'Adınız Soyadınız',
        companyName: 'Şirket Adı',
        email: 'E-posta Adresi',
        phone: 'Telefon Numarası',
        country: 'Ülke',
        message: 'Mesajınız',
        productsOfInterest: 'İlgilendiğiniz Ürünler',
        submitRequest: 'Gönder',
        sending: 'Gönderiliyor...',
        quoteSuccess: 'Teklif talebiniz başarıyla gönderildi!',

        // Contact
        getInTouch: 'Bize Ulaşın',
        contactDesc: 'Sorularınız mı var? Sizden haber almak isteriz.',
        callUs: 'Bizi Arayın',
        whatsapp: 'WhatsApp',
        emailUs: 'E-posta Gönderin',
        visitUs: 'Bizi Ziyaret Edin',
        address: 'Adana, Türkiye',

        // Footer
        allRightsReserved: 'Tüm hakları saklıdır.',
        premiumPlasticProducts: 'Premium Plastik Çözümler',

        // Admin
        dashboard: 'Kontrol Paneli',
        products: 'Ürünler',
        categories: 'Kategoriler',
        quoteRequests: 'Teklif Talepleri',
        customers: 'Müşteriler',
        settings: 'Ayarlar',
        exitAdmin: 'Çıkış',

        // Categories
        furniture: 'Mobilya',
        garden: 'Bahçe',
        storage: 'Depolama',
        industrial: 'Endüstriyel',
        kids: 'Çocuk',
    },

    ar: {
        // Navigation
        home: 'الرئيسية',
        catalog: 'الكتالوج',
        about: 'من نحن',
        contact: 'اتصل بنا',
        adminPanel: 'لوحة الإدارة',

        // Home Page
        heroTitle: 'جودة يمكنك',
        heroTitleHighlight: 'الوثوق بها',
        heroSubtitle: 'الشركة الرائدة في تصنيع المنتجات البلاستيكية المستدامة للمنزل والحديقة والصناعة. مقرها أضنة، تخدم العالم.',
        exploreCatalog: 'استكشف الكتالوج',
        contactSales: 'اتصل بالمبيعات',
        whyChooseUs: 'لماذا تختار فري جاردن؟',
        builtWithQuality: 'صُنعت بجودة، مصممة للأداء',

        // Features
        ecoFriendly: 'صديق للبيئة',
        ecoFriendlyDesc: 'مواد مستدامة وبلاستيك معاد تدويره لمستقبل أكثر خضرة.',
        premiumQuality: 'جودة ممتازة',
        premiumQualityDesc: 'منتجات متينة مصممة لتدوم لسنوات.',
        globalReach: 'انتشار عالمي',
        globalReachDesc: 'نخدم العملاء في أوروبا والشرق الأوسط وما بعده.',

        // Catalog
        ourProducts: 'منتجاتنا',
        premiumPlasticSolutions: 'حلول بلاستيكية متميزة لكل حاجة',
        searchProducts: 'البحث عن المنتجات...',
        filter: 'تصفية',
        all: 'الكل',
        viewDetails: 'عرض التفاصيل',
        outOfStock: 'غير متوفر',
        requestQuote: 'طلب عرض سعر',
        addToInquiry: 'إضافة للاستفسار',

        // Product Details
        productDetails: 'تفاصيل المنتج',
        dimensions: 'الأبعاد',
        weight: 'الوزن',
        material: 'المادة',
        availableColors: 'الألوان المتاحة',
        colorOptions: 'خيارات الألوان',
        sku: 'رمز المنتج',
        widthLabel: 'العرض',
        heightLabel: 'الارتفاع',
        depthLabel: 'العمق',
        cm: 'سم',
        kg: 'كجم',

        // Quote Form
        requestAQuote: 'طلب عرض سعر',
        quoteFormDesc: 'املأ النموذج أدناه وسنعود إليك خلال 24 ساعة.',
        yourName: 'اسمك',
        companyName: 'اسم الشركة',
        email: 'البريد الإلكتروني',
        phone: 'رقم الهاتف',
        country: 'البلد',
        message: 'الرسالة',
        productsOfInterest: 'المنتجات المهتم بها',
        submitRequest: 'إرسال الطلب',
        sending: 'جاري الإرسال...',
        quoteSuccess: 'تم إرسال طلب عرض السعر بنجاح!',

        // Contact
        getInTouch: 'تواصل معنا',
        contactDesc: 'لديك أسئلة؟ نحب أن نسمع منك.',
        callUs: 'اتصل بنا',
        whatsapp: 'واتساب',
        emailUs: 'راسلنا',
        visitUs: 'زرنا',
        address: 'أضنة، تركيا',

        // Footer
        allRightsReserved: 'جميع الحقوق محفوظة.',
        premiumPlasticProducts: 'حلول بلاستيكية متميزة',

        // Admin
        dashboard: 'لوحة التحكم',
        products: 'المنتجات',
        categories: 'الفئات',
        quoteRequests: 'طلبات الأسعار',
        customers: 'العملاء',
        settings: 'الإعدادات',
        exitAdmin: 'خروج',

        // Categories
        furniture: 'أثاث',
        garden: 'حديقة',
        storage: 'تخزين',
        industrial: 'صناعي',
        kids: 'أطفال',
    },

    de: {
        // Navigation
        home: 'Startseite',
        catalog: 'Katalog',
        about: 'Über uns',
        contact: 'Kontakt',
        adminPanel: 'Admin-Panel',

        // Home Page
        heroTitle: 'Qualität, der Sie',
        heroTitleHighlight: 'vertrauen können',
        heroSubtitle: 'Führender Hersteller nachhaltiger Kunststoffprodukte für Haus, Garten und Industrie. Sitz in Adana, weltweit tätig.',
        exploreCatalog: 'Katalog erkunden',
        contactSales: 'Vertrieb kontaktieren',
        whyChooseUs: 'Warum FreeGarden wählen?',
        builtWithQuality: 'Mit Qualität gebaut, für Leistung konzipiert',

        // Features
        ecoFriendly: 'Umweltfreundlich',
        ecoFriendlyDesc: 'Nachhaltige Materialien und recycelte Kunststoffe für eine grünere Zukunft.',
        premiumQuality: 'Premium-Qualität',
        premiumQualityDesc: 'Langlebige Produkte, die jahrelang halten.',
        globalReach: 'Globale Reichweite',
        globalReachDesc: 'Wir bedienen Kunden in Europa, dem Nahen Osten und darüber hinaus.',

        // Catalog
        ourProducts: 'Unsere Produkte',
        premiumPlasticSolutions: 'Premium-Kunststofflösungen für jeden Bedarf',
        searchProducts: 'Produkte suchen...',
        filter: 'Filtern',
        all: 'Alle',
        viewDetails: 'Details anzeigen',
        outOfStock: 'Nicht vorrätig',
        requestQuote: 'Angebot anfordern',
        addToInquiry: 'Zur Anfrage hinzufügen',

        // Product Details
        productDetails: 'Produktdetails',
        dimensions: 'Abmessungen',
        weight: 'Gewicht',
        material: 'Material',
        availableColors: 'Verfügbare Farben',
        colorOptions: 'Farboptionen',
        sku: 'Artikelnummer',
        widthLabel: 'Breite',
        heightLabel: 'Höhe',
        depthLabel: 'Tiefe',
        cm: 'cm',
        kg: 'kg',

        // Quote Form
        requestAQuote: 'Angebot anfordern',
        quoteFormDesc: 'Füllen Sie das Formular aus und wir melden uns innerhalb von 24 Stunden.',
        yourName: 'Ihr Name',
        companyName: 'Firmenname',
        email: 'E-Mail-Adresse',
        phone: 'Telefonnummer',
        country: 'Land',
        message: 'Nachricht',
        productsOfInterest: 'Interessante Produkte',
        submitRequest: 'Anfrage senden',
        sending: 'Wird gesendet...',
        quoteSuccess: 'Ihre Angebotsanfrage wurde erfolgreich übermittelt!',

        // Contact
        getInTouch: 'Kontaktieren Sie uns',
        contactDesc: 'Haben Sie Fragen? Wir würden gerne von Ihnen hören.',
        callUs: 'Rufen Sie uns an',
        whatsapp: 'WhatsApp',
        emailUs: 'E-Mail senden',
        visitUs: 'Besuchen Sie uns',
        address: 'Adana, Türkei',

        // Footer
        allRightsReserved: 'Alle Rechte vorbehalten.',
        premiumPlasticProducts: 'Premium-Kunststofflösungen',

        // Admin
        dashboard: 'Dashboard',
        products: 'Produkte',
        categories: 'Kategorien',
        quoteRequests: 'Angebotsanfragen',
        customers: 'Kunden',
        settings: 'Einstellungen',
        exitAdmin: 'Admin beenden',

        // Categories
        furniture: 'Möbel',
        garden: 'Garten',
        storage: 'Lagerung',
        industrial: 'Industrie',
        kids: 'Kinder',
    },

    zh: {
        // Navigation
        home: '首页',
        catalog: '产品目录',
        about: '关于我们',
        contact: '联系我们',
        adminPanel: '管理面板',

        // Home Page
        heroTitle: '值得信赖的',
        heroTitleHighlight: '品质',
        heroSubtitle: '家庭、花园和工业可持续塑料产品的领先制造商。总部位于阿达纳，服务全球。',
        exploreCatalog: '浏览目录',
        contactSales: '联系销售',
        whyChooseUs: '为什么选择 FreeGarden？',
        builtWithQuality: '品质铸就，专为性能设计',

        // Features
        ecoFriendly: '环保',
        ecoFriendlyDesc: '可持续材料和回收塑料，为更绿色的未来。',
        premiumQuality: '优质品质',
        premiumQualityDesc: '耐用产品，经久耐用。',
        globalReach: '全球覆盖',
        globalReachDesc: '服务欧洲、中东及其他地区的客户。',

        // Catalog
        ourProducts: '我们的产品',
        premiumPlasticSolutions: '满足各种需求的优质塑料解决方案',
        searchProducts: '搜索产品...',
        filter: '筛选',
        all: '全部',
        viewDetails: '查看详情',
        outOfStock: '缺货',
        requestQuote: '请求报价',
        addToInquiry: '添加到询价单',

        // Product Details
        productDetails: '产品详情',
        dimensions: '尺寸',
        weight: '重量',
        material: '材料',
        availableColors: '可选颜色',
        colorOptions: '颜色选项',
        sku: '产品编码',
        widthLabel: '宽度',
        heightLabel: '高度',
        depthLabel: '深度',
        cm: '厘米',
        kg: '公斤',

        // Quote Form
        requestAQuote: '请求报价',
        quoteFormDesc: '填写以下表格，我们将在24小时内与您联系。',
        yourName: '您的姓名',
        companyName: '公司名称',
        email: '电子邮箱',
        phone: '电话号码',
        country: '国家',
        message: '留言',
        productsOfInterest: '感兴趣的产品',
        submitRequest: '提交请求',
        sending: '发送中...',
        quoteSuccess: '您的报价请求已成功提交！',

        // Contact
        getInTouch: '联系我们',
        contactDesc: '有问题吗？我们很乐意听取您的意见。',
        callUs: '致电我们',
        whatsapp: 'WhatsApp',
        emailUs: '发送邮件',
        visitUs: '访问我们',
        address: '土耳其阿达纳',

        // Footer
        allRightsReserved: '版权所有。',
        premiumPlasticProducts: '优质塑料解决方案',

        // Admin
        dashboard: '仪表板',
        products: '产品',
        categories: '分类',
        quoteRequests: '报价请求',
        customers: '客户',
        settings: '设置',
        exitAdmin: '退出管理',

        // Categories
        furniture: '家具',
        garden: '花园',
        storage: '存储',
        industrial: '工业',
        kids: '儿童',
    },
};

export default translations;
