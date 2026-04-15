import type { Locale } from '@viet/shared-types';
import { pageFragments, type PageI18nKey } from './page-fragments';

export const supportedLocales: Locale[] = ['vi', 'es', 'en'];
export const defaultLocale: Locale = 'vi';

export const dictionary = {
  vi: {
    common: {
      appName: 'Viet Autoescuela',
      loading: 'Đang tải...',
      retry: 'Thử lại',
      language: 'Ngôn ngữ'
    },
    nav: {
      home: 'Trang chủ',
      quizzes: 'Bài thi',
      materials: 'Tài liệu',
      premium: 'Premium',
      leaderboard: 'Xếp hạng',
      admin: 'Quản trị',
      account: 'Tài khoản',
      profile: 'Hồ sơ',
      login: 'Đăng nhập',
      register: 'Đăng ký',
      logout: 'Đăng xuất',
      viewProfile: 'Xem hồ sơ →',
      chooseLanguage: 'Chọn ngôn ngữ',
      backHome: 'Về trang chủ Viet Autoescuela',
      premiumAdminBadge: 'Gói nâng cao — tài khoản quản trị (toàn quyền nội dung)',
      premiumAdminNavShort: 'Premium · Quản trị',
      premiumLearnerBadge: 'Gói nâng cao: {plan} — còn {days} ngày',
      premiumLearnerNavCompact: '{days} ngày'
    },
    footer: {
      learning: 'Học tập',
      account: 'Tài khoản',
      contact: 'Liên hệ',
      rights: 'Bảo lưu mọi quyền.',
      dgtTagline: 'Ôn thi DGT · Chuẩn Tây Ban Nha',
      description: 'Hệ thống học và luyện thi bằng lái xe Tây Ban Nha.',
      linkTerms: 'Điều khoản',
      linkService: 'Chính sách dịch vụ',
      linkFaq: 'Câu hỏi thường gặp',
      legalNavAria: 'Thông tin pháp lý và trợ giúp',
      legalEyebrow: 'PHÁP LÝ & TRỢ GIÚP',
      legalIntro: 'Điều khoản, chính sách dịch vụ và thông tin sử dụng dịch vụ.'
    },
    languageOption: {
      viTitle: 'Tiếng Việt',
      esTitle: 'Español',
      enTitle: 'Tiếng Anh',
      viHint: 'Giao diện & bài thi/tài liệu bằng tiếng Việt',
      esHint: 'Giao diện & bài thi/tài liệu bằng tiếng Tây Ban Nha',
      enHint: 'Giao diện & bài thi/tài liệu bằng tiếng Anh'
    },
    auth: {
      loginTitle: 'Đăng nhập',
      loginSubtitle: 'Đăng nhập để tiếp tục luyện thi',
      loginIdentifierLabel: 'Email hoặc tên đăng nhập',
      loginIdentifierPlaceholder: 'email@vd.com hoặc ten_dang_nhap',
      passwordRulesHint: 'Tối thiểu 8 ký tự, có ít nhất một chữ cái và một chữ số.',
      registerUsernameHint: '3–50 ký tự: chữ, số, dấu chấm, gạch dưới hoặc gạch ngang.',
      fillLoginFields: 'Vui lòng nhập email hoặc tên đăng nhập và mật khẩu.',
      registerTitle: 'Đăng ký tài khoản',
      registerSubtitle: 'Tạo tài khoản miễn phí để bắt đầu luyện thi',
      password: 'Mật khẩu',
      hidePassword: 'Ẩn mật khẩu',
      showPassword: 'Hiện mật khẩu',
      processing: 'Đang xử lý...',
      noAccount: 'Chưa có tài khoản?',
      registerNow: 'Đăng ký ngay',
      haveAccount: 'Đã có tài khoản?',
      fullName: 'Họ và tên',
      username: 'Tên đăng nhập',
      signUp: 'Đăng ký',
      forgotPasswordLink: 'Quên mật khẩu?',
      forgotPasswordTitle: 'Khôi phục mật khẩu',
      forgotPasswordHint:
        'Nhập email — nếu có tài khoản dùng mật khẩu, hệ thống gửi link đổi mật tới hộp thư của bạn.',
      forgotPasswordSubmit: 'Gửi link',
      forgotPasswordDone: 'Đã gửi yêu cầu',
      forgotPasswordCheckEmail: 'Kiểm tra hộp thư (và spam).',
      resetPasswordTitle: 'Đặt mật khẩu mới',
      resetPasswordSubmit: 'Lưu mật khẩu',
      resetPasswordSuccess: 'Đổi mật khẩu thành công — đăng nhập lại.',
      continueWithGoogle: 'Tiếp tục với Google',
      googleSignInSetupHint:
        'Đăng nhập Google chưa bật trên máy chủ. Hãy cấu hình GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET / GOOGLE_OAUTH_REDIRECT_URI trong user-service, hoặc dùng email và mật khẩu.',
      oauthFailed: 'Đăng nhập Google không thành công',
      useGoogleInstead: 'Tài khoản này dùng Google — hãy đăng nhập bằng Google.',
      confirmPassword: 'Nhập lại mật khẩu',
      passwordMismatch: 'Hai mật khẩu không khớp.'
    },
    premium: {
      title: 'Kích hoạt gói nâng cao — luyện đề & tài liệu đầy đủ',
      subtitle:
        'Quét QR chuyển khoản, sau đó tải ảnh biên lai và gửi đơn — chúng tôi xác minh và bật gói nâng cao cho bạn.',
      qr: 'Quét mã QR',
      transfer: 'Chuyển khoản',
      choosePlan: 'Chọn gói',
      month: 'tháng',
      months: 'tháng',
      inboxEmail: 'Email nhận đơn',
      transferNote: 'Nội dung CK',
      fullName: 'họ tên',
      mailStepTitle: 'Gửi đơn đăng ký',
      saveStepLabel: 'Gửi đơn',
      requestReceivedTitle: 'Đã gửi đơn thành công',
      requestReceivedHint: 'Chúng tôi sẽ xử lý sau khi đối chiếu chuyển khoản.',
      labelOrderId: 'Mã đơn',
      labelFullName: 'Họ và tên',
      labelUsername: 'Tài khoản',
      labelEmail: 'Email',
      labelPlan: 'Gói',
      labelReceiptImage: 'Ảnh biên lai',
      formHintOneStep:
        'Chọn ảnh biên lai rồi bấm nút: hệ thống lưu đơn và mở sẵn thư (Mail/Gmail) để bạn gửi cho chúng tôi.',
      bankTabVn: 'Ngân hàng Việt Nam',
      bankTabEs: 'Ngân hàng Tây Ban Nha',
      bankAccountHeading: 'Tài khoản nhận',
      paymentChannelMail: 'Kênh CK',
      duration1Month: '30 ngày',
      duration3Months: '90 ngày',
      durationActiveGeneric: 'Gói nâng cao'
    },
    routeLoading: {
      title: 'Đang tải',
      subtitle: 'Vui lòng đợi trong giây lát.'
    },
    contact: {
      menuAria: 'Menu liên hệ',
      title: 'Liên hệ',
      channelsSubtitle: 'WhatsApp, Zalo & Gmail — phản hồi nhanh',
      directMessage: 'Nhắn tin trực tiếp',
      zaloChat: 'Chat qua Zalo',
      gmailEmail: 'Gmail',
      gmailHint: 'Gửi email cho chúng tôi',
      openMenuAria: 'Mở menu liên hệ'
    },
    authSplit: {
      highlightBank: 'Ngân hàng câu hỏi',
      highlightTests: 'Thi thử giống thật',
      highlightProgress: 'Theo dõi tiến độ',
      backHome: 'Về trang chủ',
      tagline: 'Luyện thi bằng lái Tây Ban Nha',
      description:
        'Ôn tập câu hỏi, làm bài thi thử và theo dõi tiến độ mỗi ngày.',
      practiceAnywhere: 'Luyện tập mọi lúc, mọi nơi'
    },
    leaderboard: {
      loadError: 'Không tải được bảng xếp hạng',
      community: 'Cộng đồng',
      title: 'Bảng xếp hạng',
      subtitle: 'Top 10 theo điểm tích lũy và độ chính xác.',
      loadingYourRank: 'Đang tải vị trí của bạn…',
      rankLabel: 'Hạng',
      scoreWithColon: 'Điểm:',
      gapToFirst: 'Còn ~{n} để vượt #1',
      gapTop10: 'Còn ~{n} điểm để lọt Top 10 trên bảng này.',
      rankLoadFailed:
        'Không lấy được hạng — thử đăng nhập lại hoặc làm mới trang.',
      statLb: 'BXH',
      statMax: 'Max',
      statExams: 'Bài',
      emptyData: 'Chưa có dữ liệu bảng xếp hạng.',
      loginPromptSuffix: ' để xem thứ hạng và điểm của bạn.',
      yourRank: 'Bạn đang xếp hạng',
      scoreMid: ' · Điểm:',
      leading: 'Bạn đang dẫn đầu bảng xếp hạng!',
      top3Motivation: 'Cố lên để vào Top 3!',
      gapAbovePerson:
        'Còn khoảng {n} điểm để vượt người ngay phía trên.',
      closeToFirst:
        'Bạn gần vượt hạng #1 — còn khoảng {n} điểm (theo điểm hiện có trên bảng).',
      climbCta: 'Làm thêm bài để tăng rank',
      top10Hint:
        'BXH hiển thị top 10 — hãy leo rank để lọt vào danh sách.',
      colAttempts: 'Bài làm',
      colScore: 'Điểm',
      you: 'Bạn',
      avg: 'TB',
      practiceNow: 'Luyện thi ngay',
      competeRank: 'Luyện để cạnh tranh hạng này',
      quizzesShort: 'Bài'
    },
    ...pageFragments.vi
  },
  es: {
    common: {
      appName: 'Viet Autoescuela',
      loading: 'Cargando...',
      retry: 'Reintentar',
      language: 'Idioma'
    },
    nav: {
      home: 'Inicio',
      quizzes: 'Exámenes',
      materials: 'Temario',
      premium: 'Premium',
      leaderboard: 'Ranking',
      admin: 'Admin',
      account: 'Cuenta',
      profile: 'Perfil',
      login: 'Entrar',
      register: 'Registro',
      logout: 'Salir',
      viewProfile: 'Ver perfil →',
      chooseLanguage: 'Seleccionar idioma',
      backHome: 'Ir al inicio Viet Autoescuela',
      premiumAdminBadge: 'Plan avanzado — cuenta de administración (acceso completo)',
      premiumAdminNavShort: 'Premium · Admin',
      premiumLearnerBadge: 'Plan avanzado: {plan} — quedan {days} días',
      premiumLearnerNavCompact: '{days} días'
    },
    footer: {
      learning: 'Aprendizaje',
      account: 'Cuenta',
      contact: 'Contacto',
      rights: 'Todos los derechos reservados.',
      dgtTagline: 'DGT · España',
      description: 'Preparación para el permiso de conducir en España.',
      linkTerms: 'Términos',
      linkService: 'Política de servicio',
      linkFaq: 'FAQ',
      legalNavAria: 'Información legal y ayuda',
      legalEyebrow: 'LEGAL Y AYUDA',
      legalIntro: 'Términos, política de servicio e información sobre el servicio.'
    },
    languageOption: {
      viTitle: 'Tiếng Việt',
      esTitle: 'Español',
      enTitle: 'Inglés',
      viHint: 'Interfaz y contenidos en vietnamita',
      esHint: 'Interfaz y contenidos en español',
      enHint: 'Interfaz y contenidos en inglés'
    },
    auth: {
      loginTitle: 'Iniciar sesión',
      loginSubtitle: 'Inicia sesión para seguir practicando',
      loginIdentifierLabel: 'Correo o usuario',
      loginIdentifierPlaceholder: 'correo@ejemplo.com o usuario',
      passwordRulesHint: 'Mínimo 8 caracteres, al menos una letra y un número.',
      registerUsernameHint: '3–50 caracteres: letras, números, punto, guión bajo o guión.',
      fillLoginFields: 'Introduce correo o usuario y contraseña.',
      registerTitle: 'Crear cuenta',
      registerSubtitle: 'Crea tu cuenta gratis para empezar',
      password: 'Contraseña',
      hidePassword: 'Ocultar contraseña',
      showPassword: 'Mostrar contraseña',
      processing: 'Procesando...',
      noAccount: '¿No tienes cuenta?',
      registerNow: 'Regístrate',
      haveAccount: '¿Ya tienes cuenta?',
      fullName: 'Nombre completo',
      username: 'Nombre de usuario',
      signUp: 'Registrarse',
      forgotPasswordLink: '¿Olvidaste la contraseña?',
      forgotPasswordTitle: 'Recuperar contraseña',
      forgotPasswordHint:
        'Introduce tu email. Si hay cuenta con contraseña, enviaremos un enlace a tu correo.',
      forgotPasswordSubmit: 'Enviar enlace',
      forgotPasswordDone: 'Solicitud enviada',
      forgotPasswordCheckEmail: 'Revisa tu correo (y spam).',
      resetPasswordTitle: 'Nueva contraseña',
      resetPasswordSubmit: 'Guardar',
      resetPasswordSuccess: 'Contraseña actualizada — inicia sesión.',
      continueWithGoogle: 'Continuar con Google',
      googleSignInSetupHint:
        'El inicio de sesión con Google no está activo en el servidor. Configura GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET y GOOGLE_OAUTH_REDIRECT_URI en user-service, o usa email y contraseña.',
      oauthFailed: 'Error al iniciar sesión con Google',
      useGoogleInstead: 'Esta cuenta usa Google — inicia sesión con Google.',
      confirmPassword: 'Repite la contraseña',
      passwordMismatch: 'Las contraseñas no coinciden.'
    },
    premium: {
      title: 'Activa el plan avanzado — prácticas y materiales completos',
      subtitle:
        'Escanea QR y transfiere; luego sube el comprobante y envía la solicitud — lo verificamos y activamos tu plan avanzado.',
      qr: 'Código QR',
      transfer: 'Transferencia',
      choosePlan: 'Elige plan',
      month: 'mes',
      months: 'meses',
      inboxEmail: 'Correo de destino',
      transferNote: 'Concepto',
      fullName: 'nombre',
      mailStepTitle: 'Enviar solicitud',
      saveStepLabel: 'Enviar solicitud',
      requestReceivedTitle: 'Solicitud enviada',
      requestReceivedHint: 'La revisaremos al comprobar la transferencia.',
      labelOrderId: 'N.º de solicitud',
      labelFullName: 'Nombre completo',
      labelUsername: 'Usuario',
      labelEmail: 'Correo',
      labelPlan: 'Plan',
      labelReceiptImage: 'Imagen del comprobante',
      formHintOneStep:
        'Elige la foto del comprobante y pulsa el botón: guardamos la solicitud y abrimos el correo para que envíes el mensaje.',
      bankTabVn: 'Banco Vietnam',
      bankTabEs: 'Bancos España',
      bankAccountHeading: 'Cuenta beneficiaria',
      paymentChannelMail: 'Canal de pago',
      duration1Month: '30 días',
      duration3Months: '90 días',
      durationActiveGeneric: 'Plan avanzado'
    },
    routeLoading: {
      title: 'Cargando',
      subtitle: 'Espera un momento, por favor.'
    },
    contact: {
      menuAria: 'Menú de contacto',
      title: 'Contacto',
      channelsSubtitle: 'WhatsApp, Zalo y Gmail — respuesta rápida',
      directMessage: 'Mensaje directo',
      zaloChat: 'Chat por Zalo',
      gmailEmail: 'Gmail',
      gmailHint: 'Escríbenos por correo',
      openMenuAria: 'Abrir menú de contacto'
    },
    authSplit: {
      highlightBank: 'Banco de preguntas',
      highlightTests: 'Exámenes de práctica',
      highlightProgress: 'Seguimiento',
      backHome: 'Inicio',
      tagline: 'Examen teórico España',
      description:
        'Practica preguntas, exámenes de prueba y sigue tu progreso cada día.',
      practiceAnywhere: 'Practica cuando quieras'
    },
    leaderboard: {
      loadError: 'No se pudo cargar el ranking',
      community: 'Comunidad',
      title: 'Clasificación',
      subtitle: 'Top 10 por puntos y precisión acumulada.',
      loadingYourRank: 'Cargando tu posición…',
      rankLabel: 'Puesto',
      scoreWithColon: 'Pts:',
      gapToFirst: '~{n} pts para el #1',
      gapTop10: '~{n} pts para entrar en el top 10.',
      rankLoadFailed:
        'No se pudo cargar el puesto. Recarga o vuelve a iniciar sesión.',
      statLb: 'Lista',
      statMax: 'Máx',
      statExams: 'Ex.',
      emptyData: 'Aún no hay datos de clasificación.',
      loginPromptSuffix: ' para ver tu posición y puntos.',
      yourRank: 'Tu posición',
      scoreMid: ' · Puntos:',
      leading: '¡Líder del ranking!',
      top3Motivation: '¡Sigue así para el top 3!',
      gapAbovePerson:
        'Faltan unos {n} pts para superar al de arriba.',
      closeToFirst:
        'Cerca del #1: faltan unos {n} pts (según esta tabla).',
      climbCta: 'Practica más para subir',
      top10Hint: 'Solo se muestran 10 — sigue sumando.',
      colAttempts: 'Exámenes',
      colScore: 'Pts',
      you: 'Tú',
      avg: 'Prom.',
      practiceNow: 'Practicar ya',
      competeRank: 'Practica para competir',
      quizzesShort: 'Ex.'
    },
    ...pageFragments.es
  },
  en: {
    common: {
      appName: 'Viet Autoescuela',
      loading: 'Loading...',
      retry: 'Retry',
      language: 'Language'
    },
    nav: {
      home: 'Home',
      quizzes: 'Quizzes',
      materials: 'Materials',
      premium: 'Premium',
      leaderboard: 'Leaderboard',
      admin: 'Admin',
      account: 'Account',
      profile: 'Profile',
      login: 'Log in',
      register: 'Sign up',
      logout: 'Log out',
      viewProfile: 'View profile →',
      chooseLanguage: 'Choose language',
      backHome: 'Back to Viet Autoescuela home',
      premiumAdminBadge: 'Advanced plan — admin account (full access)',
      premiumAdminNavShort: 'Premium · Admin',
      premiumLearnerBadge: 'Advanced plan: {plan} — {days} days left',
      premiumLearnerNavCompact: '{days} days'
    },
    footer: {
      learning: 'Learning',
      account: 'Account',
      contact: 'Contact',
      rights: 'All rights reserved.',
      dgtTagline: 'DGT prep · Spain',
      description: 'Practice system for the Spanish driving licence.',
      linkTerms: 'Terms',
      linkService: 'Service policy',
      linkFaq: 'FAQ',
      legalNavAria: 'Legal information and help',
      legalEyebrow: 'LEGAL & HELP',
      legalIntro: 'Terms, service policy, and information about using the service.'
    },
    languageOption: {
      viTitle: 'Vietnamese',
      esTitle: 'Spanish',
      enTitle: 'English',
      viHint: 'Interface and content in Vietnamese',
      esHint: 'Interface and content in Spanish',
      enHint: 'Interface and content in English'
    },
    auth: {
      loginTitle: 'Log in',
      loginSubtitle: 'Sign in to keep practising',
      loginIdentifierLabel: 'Email or username',
      loginIdentifierPlaceholder: 'you@example.com or username',
      passwordRulesHint: 'At least 8 characters, including one letter and one number.',
      registerUsernameHint: '3–50 characters: letters, numbers, dot, underscore or hyphen.',
      fillLoginFields: 'Please enter email or username and password.',
      registerTitle: 'Create account',
      registerSubtitle: 'Create a free account to start practicing',
      password: 'Password',
      hidePassword: 'Hide password',
      showPassword: 'Show password',
      processing: 'Processing...',
      noAccount: 'No account yet?',
      registerNow: 'Register',
      haveAccount: 'Already have an account?',
      fullName: 'Full name',
      username: 'Username',
      signUp: 'Sign up',
      forgotPasswordLink: 'Forgot password?',
      forgotPasswordTitle: 'Reset password',
      forgotPasswordHint:
        'Enter your email. If an account with a password exists, we will send a reset link to your inbox.',
      forgotPasswordSubmit: 'Send link',
      forgotPasswordDone: 'Request sent',
      forgotPasswordCheckEmail: 'Check your inbox (and spam).',
      resetPasswordTitle: 'New password',
      resetPasswordSubmit: 'Save password',
      resetPasswordSuccess: 'Password updated — sign in again.',
      continueWithGoogle: 'Continue with Google',
      googleSignInSetupHint:
        'Google sign-in is not enabled on the server. Set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GOOGLE_OAUTH_REDIRECT_URI on user-service, or use email and password.',
      oauthFailed: 'Google sign-in failed',
      useGoogleInstead: 'This account uses Google — sign in with Google.',
      confirmPassword: 'Confirm password',
      passwordMismatch: 'Passwords do not match.'
    },
    premium: {
      title: 'Activate the advanced plan — full quizzes & materials',
      subtitle:
        'Scan QR and transfer, then upload your receipt and submit the request — we verify and activate your advanced plan.',
      qr: 'QR code',
      transfer: 'Bank transfer',
      choosePlan: 'Choose plan',
      month: 'month',
      months: 'months',
      inboxEmail: 'Inbox',
      transferNote: 'Transfer note',
      fullName: 'full name',
      mailStepTitle: 'Submit registration',
      saveStepLabel: 'Submit request',
      requestReceivedTitle: 'Request submitted',
      requestReceivedHint: 'We will process it after verifying your transfer.',
      labelOrderId: 'Request number',
      labelFullName: 'Full name',
      labelUsername: 'Username',
      labelEmail: 'Email',
      labelPlan: 'Plan',
      labelReceiptImage: 'Receipt image',
      formHintOneStep:
        'Pick your receipt image and tap the button: we save your request and open your mail app so you can send the message.',
      bankTabVn: 'Vietnam bank',
      bankTabEs: 'Spain banks',
      bankAccountHeading: 'Recipient account',
      paymentChannelMail: 'Payment channel',
      duration1Month: '30 days',
      duration3Months: '90 days',
      durationActiveGeneric: 'Advanced plan'
    },
    routeLoading: {
      title: 'Loading',
      subtitle: 'Please wait a moment.'
    },
    contact: {
      menuAria: 'Contact menu',
      title: 'Contact',
      channelsSubtitle: 'WhatsApp, Zalo & Gmail — quick replies',
      directMessage: 'Message directly',
      zaloChat: 'Chat on Zalo',
      gmailEmail: 'Gmail',
      gmailHint: 'Email us',
      openMenuAria: 'Open contact menu'
    },
    authSplit: {
      highlightBank: 'Question bank',
      highlightTests: 'Realistic practice tests',
      highlightProgress: 'Progress tracking',
      backHome: 'Home',
      tagline: 'Spanish driving theory prep',
      description:
        'Review questions, take practice tests, and track progress every day.',
      practiceAnywhere: 'Practice anytime, anywhere'
    },
    leaderboard: {
      loadError: 'Could not load leaderboard',
      community: 'Community',
      title: 'Leaderboard',
      subtitle: 'Top 10 by total score and accuracy.',
      loadingYourRank: 'Loading your rank…',
      rankLabel: 'Rank',
      scoreWithColon: 'Score:',
      gapToFirst: '~{n} pts to pass #1',
      gapTop10: '~{n} points to reach the top 10 on this board.',
      rankLoadFailed:
        'Could not load your rank — try logging in again or refresh the page.',
      statLb: 'LB',
      statMax: 'Max',
      statExams: 'Exams',
      emptyData: 'No leaderboard data yet.',
      loginPromptSuffix: ' to see your rank and score.',
      yourRank: 'Your rank',
      scoreMid: ' · Score:',
      leading: "You're leading the leaderboard!",
      top3Motivation: 'Keep going for the top 3!',
      gapAbovePerson:
        'About {n} points to pass the person above.',
      closeToFirst:
        'Close to #1 — about {n} points to go (on this board).',
      climbCta: 'Take more quizzes to climb',
      top10Hint:
        'Leaderboard shows top 10 — keep climbing to get on the list.',
      colAttempts: 'Attempts',
      colScore: 'Pts',
      you: 'You',
      avg: 'Avg.',
      practiceNow: 'Practice now',
      competeRank: 'Practice to compete for this rank',
      quizzesShort: 'Ex.'
    },
    ...pageFragments.en
  }
} as const;

export type { PageI18nKey };

type BaseI18nKey =
  | 'common.appName'
  | 'common.loading'
  | 'common.retry'
  | 'common.language'
  | 'nav.home'
  | 'nav.quizzes'
  | 'nav.materials'
  | 'nav.premium'
  | 'nav.leaderboard'
  | 'nav.admin'
  | 'nav.account'
  | 'nav.profile'
  | 'nav.login'
  | 'nav.register'
  | 'nav.logout'
  | 'nav.viewProfile'
  | 'nav.chooseLanguage'
  | 'nav.backHome'
  | 'nav.premiumAdminBadge'
  | 'nav.premiumAdminNavShort'
  | 'nav.premiumLearnerBadge'
  | 'nav.premiumLearnerNavCompact'
  | 'footer.learning'
  | 'footer.account'
  | 'footer.contact'
  | 'footer.rights'
  | 'footer.dgtTagline'
  | 'footer.description'
  | 'footer.linkTerms'
  | 'footer.linkService'
  | 'footer.linkFaq'
  | 'footer.legalNavAria'
  | 'footer.legalEyebrow'
  | 'footer.legalIntro'
  | 'languageOption.viTitle'
  | 'languageOption.esTitle'
  | 'languageOption.enTitle'
  | 'languageOption.viHint'
  | 'languageOption.esHint'
  | 'languageOption.enHint'
  | 'auth.loginTitle'
  | 'auth.loginSubtitle'
  | 'auth.loginIdentifierLabel'
  | 'auth.loginIdentifierPlaceholder'
  | 'auth.passwordRulesHint'
  | 'auth.registerUsernameHint'
  | 'auth.fillLoginFields'
  | 'auth.registerTitle'
  | 'auth.registerSubtitle'
  | 'auth.password'
  | 'auth.hidePassword'
  | 'auth.showPassword'
  | 'auth.processing'
  | 'auth.noAccount'
  | 'auth.registerNow'
  | 'auth.haveAccount'
  | 'auth.fullName'
  | 'auth.username'
  | 'auth.signUp'
  | 'auth.forgotPasswordLink'
  | 'auth.forgotPasswordTitle'
  | 'auth.forgotPasswordHint'
  | 'auth.forgotPasswordSubmit'
  | 'auth.forgotPasswordDone'
  | 'auth.forgotPasswordCheckEmail'
  | 'auth.resetPasswordTitle'
  | 'auth.resetPasswordSubmit'
  | 'auth.resetPasswordSuccess'
  | 'auth.continueWithGoogle'
  | 'auth.googleSignInSetupHint'
  | 'auth.oauthFailed'
  | 'auth.useGoogleInstead'
  | 'auth.confirmPassword'
  | 'auth.passwordMismatch'
  | 'premium.title'
  | 'premium.subtitle'
  | 'premium.qr'
  | 'premium.transfer'
  | 'premium.choosePlan'
  | 'premium.month'
  | 'premium.months'
  | 'premium.inboxEmail'
  | 'premium.transferNote'
  | 'premium.fullName'
  | 'premium.mailStepTitle'
  | 'premium.saveStepLabel'
  | 'premium.requestReceivedTitle'
  | 'premium.requestReceivedHint'
  | 'premium.labelOrderId'
  | 'premium.labelFullName'
  | 'premium.labelUsername'
  | 'premium.labelEmail'
  | 'premium.labelPlan'
  | 'premium.labelReceiptImage'
  | 'premium.formHintOneStep'
  | 'premium.bankTabVn'
  | 'premium.bankTabEs'
  | 'premium.bankAccountHeading'
  | 'premium.paymentChannelMail'
  | 'premium.duration1Month'
  | 'premium.duration3Months'
  | 'premium.durationActiveGeneric'
  | 'routeLoading.title'
  | 'routeLoading.subtitle'
  | 'contact.menuAria'
  | 'contact.title'
  | 'contact.channelsSubtitle'
  | 'contact.directMessage'
  | 'contact.zaloChat'
  | 'contact.gmailEmail'
  | 'contact.gmailHint'
  | 'contact.openMenuAria'
  | 'authSplit.highlightBank'
  | 'authSplit.highlightTests'
  | 'authSplit.highlightProgress'
  | 'authSplit.backHome'
  | 'authSplit.tagline'
  | 'authSplit.description'
  | 'authSplit.practiceAnywhere'
  | 'leaderboard.loadError'
  | 'leaderboard.community'
  | 'leaderboard.title'
  | 'leaderboard.subtitle'
  | 'leaderboard.loadingYourRank'
  | 'leaderboard.rankLabel'
  | 'leaderboard.scoreWithColon'
  | 'leaderboard.gapToFirst'
  | 'leaderboard.gapTop10'
  | 'leaderboard.rankLoadFailed'
  | 'leaderboard.statLb'
  | 'leaderboard.statMax'
  | 'leaderboard.statExams'
  | 'leaderboard.emptyData'
  | 'leaderboard.loginPromptSuffix'
  | 'leaderboard.yourRank'
  | 'leaderboard.scoreMid'
  | 'leaderboard.leading'
  | 'leaderboard.top3Motivation'
  | 'leaderboard.gapAbovePerson'
  | 'leaderboard.closeToFirst'
  | 'leaderboard.climbCta'
  | 'leaderboard.top10Hint'
  | 'leaderboard.colAttempts'
  | 'leaderboard.colScore'
  | 'leaderboard.you'
  | 'leaderboard.avg'
  | 'leaderboard.practiceNow'
  | 'leaderboard.competeRank'
  | 'leaderboard.quizzesShort';

export type I18nKey = BaseI18nKey | PageI18nKey;

export function fillTemplate(
  template: string,
  vars: Record<string, string | number>
): string {
  let s = template;
  for (const [k, v] of Object.entries(vars)) {
    s = s.split(`{${k}}`).join(String(v));
  }
  return s;
}

export function tKey(locale: Locale, key: I18nKey): string {
  const segments = key.split('.');
  let value: unknown = dictionary[locale];
  for (const seg of segments) {
    if (typeof value !== 'object' || value === null || !(seg in value)) {
      value = undefined;
      break;
    }
    value = (value as Record<string, unknown>)[seg];
  }
  if (typeof value === 'string') return value;

  const fallback = segments.reduce<unknown>((acc, seg) => {
    if (typeof acc !== 'object' || acc === null || !(seg in acc)) return undefined;
    return (acc as Record<string, unknown>)[seg];
  }, dictionary[defaultLocale]);

  return typeof fallback === 'string' ? fallback : key;
}

export type CommonDict = {
  appName: string;
  loading: string;
  retry: string;
  language: string;
};

export function getCommonDict(locale: Locale): CommonDict {
  return (dictionary[locale]?.common ?? dictionary[defaultLocale].common) as CommonDict;
}
