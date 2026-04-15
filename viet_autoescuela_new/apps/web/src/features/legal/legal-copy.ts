import type { Language } from '@/lib/api/types';

export type LegalDocId = 'terms' | 'service';

export type LegalSection = { heading: string; paragraphs: string[] };

export type LegalDocument = {
  title: string;
  updatedLabel: string;
  intro?: string;
  sections: LegalSection[];
};

const DOCS: Record<Language, Record<LegalDocId, LegalDocument>> = {
  vi: {
    terms: {
      title: 'Điều khoản sử dụng',
      updatedLabel: 'Cập nhật lần cuối: tháng 4 năm 2026',
      intro:
        'Bằng cách truy cập và sử dụng Viet Autoescuela, bạn đồng ý tuân thủ các điều khoản dưới đây.',
      sections: [
        {
          heading: '1. Mô tả dịch vụ',
          paragraphs: [
            'Viet Autoescuela cung cấp công cụ ôn tập lý thuyết và mô phỏng câu hỏi trắc nghiệm phục vụ chuẩn bị kỳ thi bằng lái xe tại Tây Ban Nha (DGT). Nội dung trên nền tảng chỉ mang tính hỗ trợ ôn tập; người học vẫn phải tuân thủ quy định pháp luật và hướng dẫn của cơ quan có thẩm quyền. Viet Autoescuela luôn cố gắng cập nhật tài liệu chính xác, nhưng không đảm bảo mọi thông tin đều đầy đủ hoặc luôn kịp thời.',
            'Vì vậy, người dùng chịu trách nhiệm xác minh thông tin học tập với tài liệu chính thức khi cần.',
            'Các tính năng chính: ôn luyện lý thuyết (câu hỏi trắc nghiệm, tình huống), mô phỏng đề thi sát hạch theo cấu trúc DGT, tài liệu hướng dẫn lái xe.',
            'Mục đích: trang web chỉ để ôn tập và luyện thi; không thay thế hoàn toàn giáo viên hay autoescuela chính thức.',
          ],
        },
        {
          heading: '2. Tài khoản và bảo mật',
          paragraphs: [
            'Để sử dụng Viet Autoescuela, người dùng cần tạo tài khoản cá nhân. Bạn chịu trách nhiệm bảo mật thông tin đăng nhập (tên đăng nhập, mật khẩu) và mọi hoạt động diễn ra trên tài khoản của mình. Cụ thể, bạn phải:',
            'Không chia sẻ tài khoản hoặc tiết lộ mật khẩu cho người khác.',
            'Thông báo ngay cho chúng tôi nếu nghi ngờ có truy cập trái phép hoặc các hành vi bất thường liên quan đến tài khoản.',
            'Cập nhật đầy đủ, trung thực thông tin cá nhân theo yêu cầu để bảo vệ quyền lợi của bạn và bảo mật hệ thống.',
          ],
        },
        {
          heading: '3. Nội dung và gói trả phí',
          paragraphs: [
            'Nền tảng Viet Autoescuela cung cấp cả tài liệu miễn phí và tài liệu/kỹ năng nâng cao trong gói trả phí (Premium). Chúng tôi cung cấp nhiều nội dung cơ bản miễn phí, nhưng một số chức năng hoặc tài liệu chuyên sâu chỉ khả dụng khi đăng ký gói Premium. Quyền sử dụng gói Premium của bạn sẽ tuân theo mô tả trên trang thanh toán và xác nhận kích hoạt từ phía chúng tôi. Ví dụ:',
            'Nội dung miễn phí: đề thi lý thuyết cơ bản, mô phỏng lái cơ bản, tài liệu ôn tập thông thường.',
            'Gói Premium: mở khóa bộ đề thi nâng cao, mô phỏng giao thông thực tế 3D, phân tích chi tiết các câu sai, các bài tập tình huống chuyên sâu.',
            'Thanh toán: tuân theo hình thức và điều kiện thanh toán được niêm yết trên trang, bao gồm chính sách hoàn tiền nếu có (tham khảo phần Chính sách thanh toán).',
          ],
        },
        {
          heading: '4. Giới hạn trách nhiệm',
          paragraphs: [
            'Viet Autoescuela luôn nỗ lực cập nhật thông tin chính xác nhưng dịch vụ được cung cấp “như hiện có” và không có bất kỳ bảo đảm ngầm định nào về kết quả học tập. Cụ thể:',
            'Nội dung trên trang web được biên soạn cẩn thận, nhưng có thể vẫn tồn tại sai sót kỹ thuật hoặc lỗi đánh máy. Người dùng nên tự kiểm tra lại thông tin với các nguồn chính thức trước khi áp dụng vào thực tế.',
            'Chúng tôi không đảm bảo bạn sẽ đỗ kỳ thi bằng lái xe sau khi ôn luyện trên trang; kết quả phụ thuộc vào nhiều yếu tố (độ chuẩn bị, tình trạng sức khỏe, v.v.).',
            'Trong phạm vi pháp luật cho phép, chúng tôi loại trừ trách nhiệm đối với mọi thiệt hại gián tiếp, sự gián đoạn hoặc sai sót do sử dụng hoặc không sử dụng được dịch vụ của chúng tôi. Bạn hoàn toàn chịu trách nhiệm về rủi ro khi sử dụng nội dung trên trang.',
            'Dịch vụ có thể tạm ngưng hoặc thay đổi do bảo trì, sự cố kỹ thuật hoặc các tình huống bất khả kháng; chúng tôi sẽ cố gắng giảm thiểu ảnh hưởng nhưng không chịu trách nhiệm bồi thường cho người dùng trong trường hợp này.',
          ],
        },
        {
          heading: '5. Thay đổi điều khoản',
          paragraphs: [
            'Chúng tôi có quyền sửa đổi, cập nhật các điều khoản này bất cứ lúc nào. Bản điều khoản mới nhất sẽ được đăng kèm ngày cập nhật và có hiệu lực ngay khi được công bố. Việc bạn tiếp tục sử dụng trang web sau khi điều khoản được sửa đổi sẽ được coi là bạn đã chấp nhận các thay đổi đó. Ví dụ:',
            'Phiên bản cập nhật ghi rõ ngày (ngày, tháng, năm) để người dùng dễ theo dõi.',
            'Mọi thay đổi quan trọng sẽ được thông báo trên trang web hoặc email cho thành viên (nếu có).',
          ],
        },
        {
          heading: '6. Liên hệ',
          paragraphs: [
            'Mọi thắc mắc hoặc yêu cầu liên quan đến Điều khoản sử dụng này, xin vui lòng liên hệ qua:',
            '• Email: vietautoescuela@gmail.com',
            '• Số WhatsApp: 642087268',
            '• Số Zalo: 0377858814',
            '© 2026 Viet Autoescuela. Bảo lưu mọi quyền. Cập nhật lần cuối: tháng 4 năm 2026.',
          ],
        },
      ],
    },
    service: {
      title: 'Chính sách dịch vụ',
      updatedLabel: 'Cập nhật lần cuối: tháng 4 năm 2026',
      intro: '',
      sections: [
        {
          heading: '1.1. Mục đích cung cấp dịch vụ',
          paragraphs: [
            'Viet Autoescuela là nền tảng hỗ trợ học và ôn thi lý thuyết lái xe dành cho người dùng đang chuẩn bị kỳ thi bằng lái xe tại Tây Ban Nha, đặc biệt là kỳ thi theo hệ thống DGT. Dịch vụ của chúng tôi bao gồm kho câu hỏi luyện tập, đề thi mô phỏng, nội dung học tập theo chủ đề, các công cụ theo dõi tiến độ và một số tính năng nâng cao dành cho người dùng đăng ký gói Premium.',
            'Mục tiêu của dịch vụ là giúp người học ôn tập hiệu quả hơn, làm quen với cấu trúc đề thi, và cải thiện khả năng ghi nhớ các tình huống giao thông thường gặp. Tuy nhiên, nội dung trên nền tảng chỉ có giá trị tham khảo và hỗ trợ học tập, không thay thế văn bản pháp luật, hướng dẫn chính thức hay kết luận chuyên môn từ cơ quan có thẩm quyền.',
          ],
        },
        {
          heading: '1.2. Phạm vi dịch vụ',
          paragraphs: [
            'Tùy theo từng thời điểm, Viet Autoescuela có thể cung cấp một hoặc nhiều nhóm dịch vụ sau:',
            '• Luyện thi lý thuyết theo chủ đề.',
            '• Làm đề thi mô phỏng.',
            '• Xem đáp án và giải thích câu sai.',
            '• Theo dõi điểm số, tiến độ học tập và lịch sử làm bài.',
            '• Truy cập tài liệu ôn tập chuyên sâu.',
            '• Các tính năng cao cấp chỉ dành cho gói Premium.',
            'Một số chức năng có thể thay đổi, bổ sung hoặc tạm ngưng nhằm phục vụ bảo trì, nâng cấp hoặc cập nhật nội dung theo quy định mới.',
          ],
        },
        {
          heading: '1.3. Tài khoản người dùng',
          paragraphs: [
            'Khi tạo tài khoản, người dùng cần cung cấp thông tin chính xác, đầy đủ và cập nhật. Người dùng chịu trách nhiệm đối với toàn bộ hoạt động phát sinh từ tài khoản của mình.',
            'Người dùng cần tự bảo mật mật khẩu và không chia sẻ thông tin đăng nhập cho bên thứ ba. Nếu phát hiện tài khoản có dấu hiệu bị sử dụng trái phép, người dùng phải thông báo cho Viet Autoescuela trong thời gian sớm nhất để chúng tôi hỗ trợ xử lý.',
            'Chúng tôi có thể tạm khóa, hạn chế hoặc chấm dứt quyền truy cập trong trường hợp phát hiện hành vi gian lận, lạm dụng hệ thống, vi phạm điều khoản sử dụng hoặc gây ảnh hưởng đến trải nghiệm chung của cộng đồng người học.',
          ],
        },
        {
          heading: '1.4. Gói miễn phí và gói Premium',
          paragraphs: [
            'Viet Autoescuela có thể cung cấp nội dung miễn phí và nội dung trả phí.',
            'Gói miễn phí thường bao gồm các chức năng cơ bản như làm bài thi thử, xem một phần tài liệu học, hoặc truy cập một số bài luyện tập giới hạn.',
            'Gói Premium là gói nâng cao, có thể bao gồm:',
            '• Ngân hàng câu hỏi mở rộng.',
            '• Đề thi nâng cao.',
            '• Phân tích chi tiết kết quả.',
            '• Thống kê tiến độ.',
            '• Tài liệu chuyên sâu.',
            '• Các tiện ích khác được mô tả rõ tại trang thanh toán.',
            'Quyền sử dụng gói Premium chỉ có hiệu lực sau khi thanh toán thành công và được hệ thống hoặc quản trị viên xác nhận kích hoạt.',
          ],
        },
        {
          heading: '1.5. Thanh toán',
          paragraphs: [
            'Nếu người dùng đăng ký gói trả phí, thông tin giá, thời hạn sử dụng, phạm vi quyền lợi và điều kiện áp dụng sẽ được hiển thị rõ tại thời điểm thanh toán.',
            'Người dùng cần kiểm tra kỹ trước khi xác nhận giao dịch. Sau khi giao dịch hoàn tất, hệ thống có thể gửi email xác nhận đến địa chỉ đã đăng ký.',
            'Chúng tôi có thể sử dụng các đơn vị xử lý thanh toán bên thứ ba. Trong trường hợp đó, việc thanh toán sẽ chịu thêm điều kiện sử dụng và chính sách bảo mật của nhà cung cấp cổng thanh toán tương ứng.',
          ],
        },
        {
          heading: '1.6. Hủy dịch vụ và hoàn tiền',
          paragraphs: [
            'Do đặc thù là dịch vụ số và nội dung học tập trực tuyến, việc hoàn tiền có thể bị hạn chế. Thông thường, khi dịch vụ đã được kích hoạt hoặc nội dung đã được truy cập, yêu cầu hoàn tiền có thể không được chấp nhận.',
            'Tuy nhiên, trong một số trường hợp đặc biệt như:',
            '• lỗi kỹ thuật nghiêm trọng kéo dài,',
            '• thanh toán bị ghi nhận sai,',
            '• dịch vụ không thể kích hoạt dù người dùng đã thanh toán hợp lệ,',
            'chúng tôi có thể xem xét xử lý hỗ trợ hoặc hoàn tiền theo từng trường hợp cụ thể.',
            'Mọi yêu cầu liên quan đến thanh toán, hủy dịch vụ hoặc hoàn tiền cần được gửi qua email hỗ trợ. Chúng tôi sẽ tiếp nhận, kiểm tra và phản hồi trong thời gian hợp lý.',
          ],
        },
        {
          heading: '1.7. Hỗ trợ và bảo trì',
          paragraphs: [
            'Chúng tôi luôn cố gắng duy trì hệ thống ổn định, an toàn và dễ sử dụng. Tuy nhiên, nền tảng có thể tạm ngưng hoạt động trong thời gian ngắn để cập nhật tính năng, sửa lỗi, hoặc bảo trì máy chủ.',
            'Trong thời gian bảo trì, một số chức năng có thể bị hạn chế hoặc truy cập chậm hơn bình thường. Chúng tôi sẽ nỗ lực thông báo trước khi có kế hoạch gián đoạn lớn, nếu điều kiện kỹ thuật cho phép.',
          ],
        },
        {
          heading: '1.8. Quyền và trách nhiệm của người dùng',
          paragraphs: [
            'Người dùng có quyền:',
            '• sử dụng dịch vụ theo gói đã đăng ký,',
            '• được hỗ trợ khi gặp lỗi kỹ thuật,',
            '• được bảo vệ dữ liệu cá nhân theo chính sách bảo mật,',
            '• được thông báo khi có thay đổi quan trọng liên quan đến dịch vụ.',
            'Người dùng có trách nhiệm:',
            '• sử dụng dịch vụ đúng mục đích học tập,',
            '• không sao chép, phát tán hoặc khai thác trái phép nội dung,',
            '• không sử dụng hệ thống theo cách gây ảnh hưởng đến tính ổn định hoặc an toàn của nền tảng,',
            '• tự kiểm tra và đối chiếu thông tin với nguồn chính thức khi cần áp dụng vào thực tế.',
          ],
        },
        {
          heading: '1.9. Giới hạn trách nhiệm',
          paragraphs: [
            'Viet Autoescuela luôn nỗ lực cung cấp nội dung chính xác và cập nhật, nhưng không thể bảo đảm rằng mọi nội dung luôn tuyệt đối không có sai sót hoặc luôn phản ánh tức thời mọi thay đổi pháp lý, kỹ thuật hay nội dung thi.',
            'Chúng tôi không chịu trách nhiệm đối với:',
            '• kết quả thi của người dùng,',
            '• thiệt hại gián tiếp phát sinh từ việc sử dụng dịch vụ,',
            '• gián đoạn do mạng, máy chủ, bên thứ ba hoặc sự kiện ngoài tầm kiểm soát hợp lý,',
            '• việc người dùng áp dụng thông tin trên nền tảng mà không kiểm tra lại với nguồn chính thức.',
          ],
        },
        {
          heading: '1.10. Sửa đổi chính sách',
          paragraphs: [
            'Viet Autoescuela có thể cập nhật chính sách dịch vụ bất kỳ lúc nào để phản ánh thay đổi về chức năng, quy trình vận hành, pháp luật hoặc nhu cầu cải thiện trải nghiệm người dùng.',
            'Phiên bản cập nhật sẽ được đăng trên website kèm ngày hiệu lực. Việc tiếp tục sử dụng dịch vụ sau khi chính sách được cập nhật được xem là người dùng đã chấp nhận nội dung mới.',
          ],
        },
        {
          heading: '1.11. Liên hệ',
          paragraphs: [
            'Mọi câu hỏi, khiếu nại hoặc yêu cầu hỗ trợ liên quan đến dịch vụ có thể gửi qua:',
            '• Email: vietautoescuela@gmail.com',
            '• WhatsApp: 642087268',
            '• Zalo: 0377858814',
          ],
        },
      ],
    },
  },
  es: {
    terms: {
      title: 'Términos del servicio',
      updatedLabel: 'Última actualización: abril de 2026',
      intro:
        'Al acceder y usar Viet Autoescuela, aceptas estos términos. Si no estás de acuerdo, no utilices el servicio.',
      sections: [
        {
          heading: '1. Descripción del servicio',
          paragraphs: [
            'Viet Autoescuela ofrece herramientas de estudio teórico y tests tipo examen para preparar el permiso de conducción en España (DGT). El contenido es formativo; debes cumplir la normativa vigente y las indicaciones oficiales.',
          ],
        },
        {
          heading: '2. Cuenta y seguridad',
          paragraphs: [
            'Eres responsable de mantener la confidencialidad de tu acceso y de las actividades realizadas con tu cuenta. Notifícanos cualquier uso no autorizado.',
          ],
        },
        {
          heading: '3. Contenido y planes de pago',
          paragraphs: [
            'Parte del material o funciones puede estar en plan avanzado (Premium). El uso se rige por la información mostrada en la página de pago y la activación confirmada por nosotros.',
          ],
        },
        {
          heading: '4. Limitación de responsabilidad',
          paragraphs: [
            'Procuramos un servicio estable y actualizado, pero no garantizamos un resultado concreto en el examen. El servicio se ofrece “tal cual”; en la medida permitida por la ley, excluimos daños indirectos o interrupciones fuera de un control razonable.',
          ],
        },
        {
          heading: '5. Cambios',
          paragraphs: [
            'Podemos modificar estos términos; publicaremos la fecha de actualización. El uso continuado implica aceptación.',
          ],
        },
        {
          heading: '6. Contacto',
          paragraphs: [
            'Para consultas sobre los términos, escríbenos al correo indicado en el pie de página.',
          ],
        },
      ],
    },
    service: {
      title: 'Política de servicio',
      updatedLabel: 'Última actualización: abril de 2026',
      intro:
        'Este texto describe el propósito, el alcance del servicio, las cuentas, los planes gratuito/Premium, pagos, reembolsos, soporte y responsabilidades al usar Viet Autoescuela.',
      sections: [
        {
          heading: '1.1. Finalidad del servicio',
          paragraphs: [
            'Viet Autoescuela es una plataforma para estudiar y preparar el examen teórico de conducción en España, en particular según el sistema DGT. El servicio incluye banco de preguntas, exámenes simulados, contenido por temas, seguimiento del progreso y funciones avanzadas para usuarios con plan Premium.',
            'El objetivo es ayudar a estudiar con más eficacia, familiarizarse con el formato del examen y retener mejor las situaciones de tráfico habituales. El contenido es meramente orientativo y formativo; no sustituye la normativa oficial, las guías de la administración ni dictámenes de autoridad competente.',
          ],
        },
        {
          heading: '1.2. Alcance del servicio',
          paragraphs: [
            'Según el momento, Viet Autoescuela puede ofrecer uno o más de estos grupos de servicios:',
            '• Práctica teórica por temas.',
            '• Exámenes simulados.',
            '• Ver respuestas y explicaciones de fallos.',
            '• Seguimiento de puntuación, progreso e historial.',
            '• Acceso a material de estudio avanzado.',
            '• Funciones de pago reservadas al plan Premium.',
            'Algunas funciones pueden cambiarse, ampliarse o suspenderse por mantenimiento, mejoras o actualización normativa.',
          ],
        },
        {
          heading: '1.3. Cuenta de usuario',
          paragraphs: [
            'Al crear una cuenta debes facilitar datos exactos, completos y actualizados. Eres responsable de toda actividad realizada con tu cuenta.',
            'Debes proteger tu contraseña y no compartir el acceso con terceros. Si detectas uso indebido, notifícanos cuanto antes para ayudarte.',
            'Podemos restringir, suspender o cerrar el acceso ante fraude, abuso, incumplimiento de términos o perjuicio a la experiencia de otros usuarios.',
          ],
        },
        {
          heading: '1.4. Plan gratuito y Premium',
          paragraphs: [
            'Viet Autoescuela puede ofrecer contenido gratuito y de pago.',
            'El plan gratuito suele incluir funciones básicas: exámenes de prueba, parte del material o prácticas limitadas.',
            'El plan Premium puede incluir:',
            '• Banco de preguntas ampliado.',
            '• Exámenes avanzados.',
            '• Análisis detallado de resultados.',
            '• Estadísticas de progreso.',
            '• Material en profundidad.',
            '• Otras ventajas descritas en la página de pago.',
            'El Premium solo surte efecto tras pago confirmado y activación por el sistema o administración.',
          ],
        },
        {
          heading: '1.5. Pagos',
          paragraphs: [
            'Si contratas un plan de pago, precio, duración, alcance y condiciones se mostrarán claramente al pagar.',
            'Revisa antes de confirmar. Tras completar el pago, podemos enviar un email de confirmación a tu dirección registrada.',
            'Podemos usar pasarelas de terceros; en ese caso aplicarán también sus términos y política de privacidad.',
          ],
        },
        {
          heading: '1.6. Cancelación y reembolsos',
          paragraphs: [
            'Al ser un servicio digital y formativo en línea, los reembolsos pueden ser limitados. Si el servicio ya está activado o el contenido accedido, la solicitud puede no aceptarse.',
            'En casos excepcionales, como:',
            '• fallo técnico grave prolongado,',
            '• cargo indebido,',
            '• imposibilidad de activar pese a pago válido,',
            'podremos estudiar asistencia o reembolso caso por caso.',
            'Las peticiones sobre pago, cancelación o reembolso deben enviarse al email de soporte; las revisaremos y responderemos en un plazo razonable.',
          ],
        },
        {
          heading: '1.7. Soporte y mantenimiento',
          paragraphs: [
            'Procuramos mantener el sistema estable y seguro. La plataforma puede interrumpirse brevemente por actualizaciones, correcciones o mantenimiento de servidores.',
            'Durante el mantenimiento algunas funciones pueden ir más lentas o no estar disponibles. Intentaremos avisar con antelación ante interrupciones importantes cuando la técnica lo permita.',
          ],
        },
        {
          heading: '1.8. Derechos y deberes del usuario',
          paragraphs: [
            'El usuario tiene derecho a:',
            '• usar el servicio según el plan contratado,',
            '• recibir soporte ante incidencias técnicas,',
            '• que sus datos se protejan según la política de privacidad,',
            '• ser informado de cambios relevantes del servicio.',
            'El usuario se compromete a:',
            '• usar el servicio con fines de estudio,',
            '• no copiar, distribuir o explotar el contenido sin autorización,',
            '• no comprometer la estabilidad o seguridad de la plataforma,',
            '• contrastar la información con fuentes oficiales cuando deba aplicarla en la realidad.',
          ],
        },
        {
          heading: '1.9. Limitación de responsabilidad',
          paragraphs: [
            'Procuramos contenido fiable y actualizado, pero no garantizamos ausencia total de errores ni reflejo inmediato de todo cambio legal, técnico o de examen.',
            'No nos responsabilizamos de:',
            '• el resultado del examen del usuario,',
            '• daños indirectos derivados del uso del servicio,',
            '• interrupciones por red, servidores, terceros o causa de fuer mayor razonable,',
            '• el uso de la información sin verificar fuentes oficiales.',
          ],
        },
        {
          heading: '1.10. Cambios de la política',
          paragraphs: [
            'Podemos actualizar esta política en cualquier momento por cambios de funciones, operación, normativa o mejora de experiencia.',
            'La versión nueva se publicará en la web con fecha de vigencia. Seguir usando el servicio implica aceptar el texto actualizado.',
          ],
        },
        {
          heading: '1.11. Contacto',
          paragraphs: [
            'Consultas, reclamaciones o soporte: vietautoescuela@gmail.com, WhatsApp 642087268 o Zalo 0377858814.',
          ],
        },
      ],
    },
  },
  en: {
    terms: {
      title: 'Terms of service',
      updatedLabel: 'Last updated: April 2026',
      intro:
        'By accessing Viet Autoescuela you agree to these terms. If you disagree, please do not use the service.',
      sections: [
        {
          heading: '1. Service description',
          paragraphs: [
            'Viet Autoescuela provides theory study tools and multiple-choice practice for preparing for the Spanish driving theory exam (DGT). Content is educational; you must still follow applicable law and official guidance.',
          ],
        },
        {
          heading: '2. Account and security',
          paragraphs: [
            'You are responsible for safeguarding your login and for activity under your account. Notify us of any suspected unauthorised access.',
          ],
        },
        {
          heading: '3. Content and paid plans',
          paragraphs: [
            'Some materials or features may be part of an advanced (Premium) plan. Use is governed by the checkout description and our activation confirmation.',
          ],
        },
        {
          heading: '4. Limitation of liability',
          paragraphs: [
            'We aim for a reliable, up-to-date service but do not guarantee a specific exam outcome. The service is provided “as is”; to the extent permitted by law we exclude indirect damages or outages beyond reasonable control.',
          ],
        },
        {
          heading: '5. Changes',
          paragraphs: [
            'We may update these terms; the new date will be posted. Continued use means acceptance.',
          ],
        },
        {
          heading: '6. Contact',
          paragraphs: [
            'For questions about these terms, use the contact email in the site footer.',
          ],
        },
      ],
    },
    service: {
      title: 'Service policy',
      updatedLabel: 'Last updated: April 2026',
      intro:
        'This document sets out the purpose, scope, accounts, free/Premium plans, payments, refunds, support, and responsibilities when you use Viet Autoescuela.',
      sections: [
        {
          heading: '1.1. Purpose of the service',
          paragraphs: [
            'Viet Autoescuela is a platform to study and practise for the Spanish driving theory test, especially under the DGT system. The service includes question banks, mock exams, topic-based learning, progress tracking, and advanced features for Premium subscribers.',
            'The goal is to help learners revise effectively, get used to exam structure, and retain common traffic situations. Platform content is for reference and study support only; it does not replace official law, government guidance, or professional determinations by competent authorities.',
          ],
        },
        {
          heading: '1.2. Scope of services',
          paragraphs: [
            'Depending on the period, Viet Autoescuela may provide one or more of the following:',
            '• Topic-based theory practice.',
            '• Mock exams.',
            '• Review answers and explanations for mistakes.',
            '• Scores, learning progress, and attempt history.',
            '• In-depth study materials.',
            '• Premium-only advanced features.',
            'Some features may change, be added, or be paused for maintenance, upgrades, or regulatory updates.',
          ],
        },
        {
          heading: '1.3. User accounts',
          paragraphs: [
            'When you create an account, you must provide accurate, complete, and up-to-date information. You are responsible for all activity under your account.',
            'You must keep your password secure and not share login details with third parties. If you suspect unauthorised use, notify Viet Autoescuela promptly so we can help.',
            'We may restrict, suspend, or terminate access if we detect fraud, abuse, breach of terms, or harm to other learners’ experience.',
          ],
        },
        {
          heading: '1.4. Free and Premium plans',
          paragraphs: [
            'Viet Autoescuela may offer both free and paid content.',
            'The free tier typically includes basics such as trial tests, partial materials, or limited practice.',
            'Premium may include:',
            '• Expanded question banks.',
            '• Advanced exams.',
            '• Detailed performance analysis.',
            '• Progress statistics.',
            '• In-depth materials.',
            '• Other benefits clearly described at checkout.',
            'Premium access is effective only after successful payment and activation confirmed by the system or an administrator.',
          ],
        },
        {
          heading: '1.5. Payments',
          paragraphs: [
            'For paid plans, price, duration, benefits, and conditions are shown clearly at the time of payment.',
            'Please review carefully before confirming. After completion, we may send a confirmation email to your registered address.',
            'We may use third-party payment processors; their terms and privacy policy also apply.',
          ],
        },
        {
          heading: '1.6. Cancellation and refunds',
          paragraphs: [
            'As a digital learning service, refunds may be limited. Once the service is activated or content accessed, refund requests may be declined.',
            'We may consider support or refunds case by case in special situations such as:',
            '• prolonged serious technical failure,',
            '• incorrect charging,',
            '• failure to activate despite valid payment.',
            'Send payment, cancellation, or refund requests to our support email; we will review and respond within a reasonable time.',
          ],
        },
        {
          heading: '1.7. Support and maintenance',
          paragraphs: [
            'We strive to keep the system stable and secure. The platform may be briefly unavailable for feature updates, fixes, or server maintenance.',
            'During maintenance some functions may be limited or slower. We will try to give notice before major outages when technically possible.',
          ],
        },
        {
          heading: '1.8. User rights and responsibilities',
          paragraphs: [
            'Users have the right to:',
            '• use the service according to their subscribed plan,',
            '• receive support for technical issues,',
            '• have personal data protected under our privacy policy,',
            '• be informed of material changes to the service.',
            'Users are responsible for:',
            '• using the service for study purposes,',
            '• not copying, distributing, or exploiting content unlawfully,',
            '• not undermining platform stability or security,',
            '• verifying information against official sources when applying it in real life.',
          ],
        },
        {
          heading: '1.9. Limitation of liability',
          paragraphs: [
            'We work to provide accurate, updated content but cannot guarantee zero errors or instant reflection of every legal, technical, or exam change.',
            'We are not liable for:',
            '• users’ exam results,',
            '• indirect damage from use of the service,',
            '• outages due to networks, servers, third parties, or events beyond reasonable control,',
            '• reliance on platform information without checking official sources.',
          ],
        },
        {
          heading: '1.10. Policy changes',
          paragraphs: [
            'We may update this policy at any time to reflect changes to features, operations, law, or user experience.',
            'The updated version will be posted on the website with an effective date. Continued use means acceptance of the new terms.',
          ],
        },
        {
          heading: '1.11. Contact',
          paragraphs: [
            'Questions, complaints, or support: vietautoescuela@gmail.com, WhatsApp 642087268, or Zalo 0377858814.',
          ],
        },
      ],
    },
  },
};

const FAQ: Record<Language, { title: string; intro: string; items: { q: string; a: string }[] }> = {
  vi: {
    title: 'Câu hỏi thường gặp',
    intro:
      'Giải đáp về tài khoản, gói miễn phí/Premium, luyện thi, thanh toán, hoàn tiền và hỗ trợ.',
    items: [
      {
        q: 'Viet Autoescuela có miễn phí không?',
        a: 'Có. Viet Autoescuela có một số nội dung miễn phí để người dùng có thể bắt đầu học ngay, như làm bài thi thử cơ bản, xem một phần tài liệu ôn tập và trải nghiệm giao diện học tập. Ngoài ra, một số tính năng nâng cao sẽ thuộc gói Premium để phục vụ nhu cầu học tập chuyên sâu hơn.',
      },
      {
        q: 'Tôi có cần tạo tài khoản để sử dụng không?',
        a: 'Không phải lúc nào cũng cần. Một số nội dung có thể xem mà không cần đăng nhập. Tuy nhiên, tạo tài khoản sẽ giúp bạn lưu tiến độ, lưu điểm số, xem lại bài đã làm, đồng bộ dữ liệu học tập và nhận thông báo quan trọng từ hệ thống.',
      },
      {
        q: 'Viet Autoescuela hỗ trợ những loại bằng lái nào?',
        a: 'Nền tảng có thể được thiết kế để hỗ trợ nhiều nhóm bằng lái theo hệ thống tại Tây Ban Nha, bao gồm các hạng phổ biến như xe máy, ô tô, xe tải và xe khách. Mỗi hạng có ngân hàng câu hỏi hoặc bộ đề riêng để người học dễ luyện đúng nội dung cần thiết.',
      },
      {
        q: 'Hệ thống có bao nhiêu câu hỏi?',
        a: 'Tùy theo giai đoạn vận hành, hệ thống có thể bao gồm nhiều nghìn câu hỏi ôn tập, được phân theo chủ đề, mức độ khó và loại bằng lái. Điều quan trọng là dữ liệu câu hỏi cần được cập nhật thường xuyên để người học không bị lệch so với nội dung thi thực tế.',
      },
      {
        q: 'Đề thi mô phỏng có giống thi thật không?',
        a: 'Đề thi mô phỏng được xây dựng để giúp người học làm quen với cấu trúc bài thi, áp lực thời gian và cách chọn đáp án. Mục tiêu là tạo trải nghiệm gần giống thực tế nhất có thể trong khuôn khổ một nền tảng học tập trực tuyến.',
      },
      {
        q: 'Tôi làm sai câu hỏi thì có xem lại được không?',
        a: 'Có. Hệ thống có thể lưu lại lịch sử làm bài và danh sách câu sai để người dùng xem lại. Đây là một tính năng rất quan trọng vì giúp người học nhận ra lỗi thường gặp và ôn tập đúng trọng tâm hơn.',
      },
      {
        q: 'Tôi quên mật khẩu thì làm sao?',
        a: 'Bạn có thể dùng chức năng “Quên mật khẩu” ở trang đăng nhập. Sau khi nhập email đã đăng ký, hệ thống sẽ gửi hướng dẫn đặt lại mật khẩu. Nếu không nhận được email hoặc gặp lỗi trong quá trình khôi phục, hãy liên hệ bộ phận hỗ trợ.',
      },
      {
        q: 'Tôi đã thanh toán nhưng chưa mở được Premium, xử lý thế nào?',
        a: 'Trước tiên hãy kiểm tra email xác nhận thanh toán và làm mới trang tài khoản. Nếu dịch vụ vẫn chưa được kích hoạt, bạn nên gửi mã giao dịch hoặc ảnh chụp xác nhận thanh toán cho bộ phận hỗ trợ để được kiểm tra thủ công.',
      },
      {
        q: 'Viet Autoescuela có hoàn tiền không?',
        a: 'Trong đa số trường hợp, gói học tập trực tuyến đã được kích hoạt sẽ không hoàn tiền. Tuy nhiên, nếu phát sinh lỗi nghiêm trọng hoặc giao dịch bất thường, chúng tôi có thể xem xét từng trường hợp riêng để đưa ra hỗ trợ phù hợp.',
      },
      {
        q: 'Dữ liệu cá nhân của tôi có an toàn không?',
        a: 'Chúng tôi áp dụng các biện pháp bảo mật phù hợp để bảo vệ dữ liệu người dùng. Dữ liệu chỉ được sử dụng cho mục đích vận hành tài khoản, hỗ trợ học tập và cải thiện dịch vụ, theo nội dung nêu trong chính sách bảo mật.',
      },
      {
        q: 'Website có lưu thông tin thẻ thanh toán không?',
        a: 'Thông thường, thông tin thẻ sẽ được xử lý qua cổng thanh toán an toàn của bên thứ ba. Viet Autoescuela không nên lưu đầy đủ thông tin thẻ trên máy chủ nội bộ nếu không thật sự cần thiết, nhằm giảm rủi ro bảo mật.',
      },
      {
        q: 'Nếu website bị lỗi thì tôi phải làm gì?',
        a: 'Bạn nên thử tải lại trang, đăng xuất rồi đăng nhập lại, hoặc đổi thiết bị/trình duyệt khác. Nếu lỗi vẫn còn, hãy gửi mô tả lỗi, ảnh chụp màn hình và thời điểm xảy ra sự cố để chúng tôi kiểm tra nhanh hơn.',
      },
      {
        q: 'Tôi có thể học trên điện thoại không?',
        a: 'Có. Nên tối ưu giao diện để hoạt động tốt trên điện thoại, máy tính bảng và máy tính. Điều này giúp người dùng học mọi lúc, mọi nơi và duy trì thói quen ôn tập đều đặn.',
      },
      {
        q: 'Nội dung trên web có thay thế tài liệu chính thức không?',
        a: 'Không. Nội dung chỉ hỗ trợ học tập. Khi cần áp dụng thực tế hoặc đối chiếu quy định, hãy kiểm tra nguồn chính thức từ cơ quan có thẩm quyền.',
      },
      {
        q: 'Tôi có thể liên hệ hỗ trợ bằng cách nào?',
        a: 'Bạn có thể liên hệ qua email hoặc số điện thoại hiển thị trên website. Nếu cần xử lý nhanh, hãy cung cấp đầy đủ thông tin: tài khoản, nội dung lỗi, ảnh chụp màn hình và thời điểm phát sinh vấn đề.',
      },
    ],
  },
  es: {
    title: 'Preguntas frecuentes',
    intro: 'Cuenta, planes gratuito/Premium, práctica de examen y soporte.',
    items: [
      {
        q: '¿Viet Autoescuela es gratuito?',
        a: 'Sí. Hay contenido gratuito para empezar ya: exámenes de prueba básicos, parte del material y la experiencia de la plataforma. Funciones avanzadas pueden estar en el plan Premium.',
      },
      {
        q: '¿Necesito crear una cuenta?',
        a: 'No siempre. Parte del contenido se puede ver sin iniciar sesión. Con cuenta guardas progreso, puntuaciones, historial, sincronización y avisos importantes.',
      },
      {
        q: '¿Qué permisos de conducir cubre?',
        a: 'La plataforma está orientada a distintos permisos en España (moto, coche, camión, autobús, etc.), con bancos o tests según categoría.',
      },
      {
        q: '¿Cuántas preguntas hay?',
        a: 'Depende de la fase del producto: pueden ser miles de ítems por temas, dificultad y tipo de permiso, actualizados para aproximarse al examen real.',
      },
      {
        q: '¿Los exámenes simulados son como el oficial?',
        a: 'Están pensados para acostumbrarte al formato, al tiempo y a marcar respuestas; buscan acercarse lo máximo posible dentro de un entorno online.',
      },
      {
        q: '¿Puedo revisar fallos?',
        a: 'Sí. Puedes guardar historial y repasar errores para detectar patrones y estudiar mejor.',
      },
      {
        q: 'Olvidé mi contraseña',
        a: 'Usa “¿Olvidaste la contraseña?” en el inicio de sesión con tu email registrado; recibirás instrucciones. Si no llega el correo o falla, contacta soporte.',
      },
      {
        q: 'Pagué y no tengo Premium',
        a: 'Revisa el email de confirmación y actualiza la cuenta. Si sigue sin activarse, envía código de operación o captura del pago al soporte para revisión manual.',
      },
      {
        q: '¿Hay reembolsos?',
        a: 'En general, los planes ya activados no se reembolsan. Ante fallos graves o cargos anómalos, valoramos cada caso.',
      },
      {
        q: '¿Mis datos están seguros?',
        a: 'Aplicamos medidas de seguridad adecuadas. Los datos se usan para la cuenta, el aprendizaje y mejorar el servicio, según la política de privacidad.',
      },
      {
        q: '¿Guardáis datos de tarjeta?',
        a: 'Lo habitual es procesar el pago con pasarelas seguras de terceros. No almacenamos datos completos de tarjeta en nuestros servidores salvo necesidad real.',
      },
      {
        q: 'La web falla, ¿qué hago?',
        a: 'Recarga, cierra sesión y vuelve a entrar, o prueba otro dispositivo o navegador. Si persiste, envía descripción, captura y hora del fallo.',
      },
      {
        q: '¿Puedo estudiar en el móvil?',
        a: 'Sí. La interfaz está pensada para móvil, tablet y ordenador para estudiar en cualquier momento.',
      },
      {
        q: '¿Sustituye el material oficial?',
        a: 'No. Es apoyo formativo; para normativa o trámites reales consulta siempre fuentes oficiales.',
      },
      {
        q: '¿Cómo contacto con soporte?',
        a: 'Por email o teléfono indicados en la web. Para ir más rápido: cuenta, descripción del error, capturas y cuándo ocurrió.',
      },
    ],
  },
  en: {
    title: 'Frequently asked questions',
    intro: 'Account, free/Premium plans, exam practice, and support.',
    items: [
      {
        q: 'Is Viet Autoescuela free?',
        a: 'Yes. There is free content so you can start right away—basic trial tests, part of the study materials, and the learning UI. Advanced features may be part of Premium.',
      },
      {
        q: 'Do I need an account?',
        a: 'Not always. Some content can be viewed without logging in. An account lets you save progress, scores, history, sync data, and receive important notices.',
      },
      {
        q: 'Which licence categories do you support?',
        a: 'The platform targets common Spanish categories (e.g. motorcycle, car, truck, bus), with question banks or tests tailored where applicable.',
      },
      {
        q: 'How many questions are there?',
        a: 'It depends on the product phase: there may be thousands of items by topic, difficulty, and licence type, updated to stay close to the real exam.',
      },
      {
        q: 'Are mock exams like the real test?',
        a: 'They help you get used to structure, timing, and answering under pressure, and aim to be as close as possible within an online study product.',
      },
      {
        q: 'Can I review mistakes?',
        a: 'Yes. You can keep attempt history and review wrong answers to spot recurring issues.',
      },
      {
        q: 'I forgot my password',
        a: 'Use “Forgot password” on the login page with your registered email for reset instructions. If email fails or errors occur, contact support.',
      },
      {
        q: 'I paid but Premium is not active',
        a: 'Check your payment confirmation email and refresh your account page. If it still does not activate, send the transaction ID or a payment screenshot to support for manual checks.',
      },
      {
        q: 'Do you offer refunds?',
        a: 'Generally, activated learning plans are non-refundable. We may review serious technical issues or abnormal charges on a case-by-case basis.',
      },
      {
        q: 'Is my personal data safe?',
        a: 'We use appropriate security measures. Data is used to run your account, support learning, and improve the service, as described in the privacy policy.',
      },
      {
        q: 'Do you store card details?',
        a: 'Card data is usually handled by secure third-party gateways. We do not store full card data on our own servers unless strictly necessary.',
      },
      {
        q: 'The site has errors—what should I do?',
        a: 'Try reloading, signing out and back in, or another device/browser. If it persists, send a short description, screenshot, and when it happened.',
      },
      {
        q: 'Can I study on my phone?',
        a: 'Yes. The interface is optimised for phones, tablets, and desktops so you can study anywhere.',
      },
      {
        q: 'Does the site replace official materials?',
        a: 'No. It supports study only; for real-world rules or procedures always check official sources.',
      },
      {
        q: 'How do I contact support?',
        a: 'Use the email or phone shown on the website. For faster help, include your account, error description, screenshots, and timing.',
      },
    ],
  },
};

export function getLegalDocument(id: LegalDocId, lang: Language): LegalDocument {
  const pack = DOCS[lang] ?? DOCS.vi;
  return pack[id];
}

export function getFaqContent(lang: Language) {
  return FAQ[lang] ?? FAQ.vi;
}
