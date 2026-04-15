import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** [vi, es, en] — only single-quoted `lang === 'vi' ? … : …` pairs */
const TRIPLES = [
  ['Loại chủ đề bài thi', 'Grupos de tema (examen)', 'Quiz topic groups'],
  ['+ Thêm loại chủ đề', '+ Nuevo grupo', '+ Add topic group'],
  ['Thêm loại chủ đề bài thi', 'Agregar grupo de tema de examen', 'Add quiz topic group'],
  ['Thêm loại chủ đề', 'Agregar grupo de tema', 'Add topic group'],
  ['Sửa', 'Editar', 'Edit'],
  ['Xóa', 'Eliminar', 'Delete'],
  ['Sửa loại chủ đề bài thi', 'Editar grupo de examen', 'Edit quiz topic group'],
  ['Lưu', 'Guardar', 'Save'],
  ['Hủy', 'Cancelar', 'Cancel'],
  ['Chủ đề bài thi', 'Temas de examen', 'Quiz topics'],
  ['Lọc theo nhóm cha', 'Filtrar por grupo padre', 'Filter by parent group'],
  ['Tất cả loại chủ đề', 'Todos los grupos', 'All topic groups'],
  ['+ Thêm chủ đề bài thi', '+ Nuevo tema', '+ Add quiz topic'],
  ['Thêm chủ đề bài thi', 'Agregar tema de examen', 'Add quiz topic'],
  ['Chọn loại chủ đề', 'Selecciona grupo de tema', 'Select topic group'],
  ['Sửa chủ đề bài thi', 'Editar tema de examen', 'Edit quiz topic'],
  ['Xóa chủ đề bài thi', 'Eliminar tema de examen', 'Delete quiz topic'],
  ['Đóng', 'Cerrar', 'Close'],
  ['Loại chủ đề (nhóm cha)', 'Grupo de tema (padre)', 'Topic group (parent)'],
  ['Chọn loại chủ đề', 'Seleccionar grupo', 'Select topic group'],
  ['Tên chủ đề', 'Nombre (VI)', 'Name (VI)'],
  ['Mô tả', 'Descripción (VI)', 'Description (VI)'],
  ['Tên chủ đề', 'Nombre (ES)', 'Name (ES)'],
  ['Mô tả', 'Descripción (ES)', 'Description (ES)'],
  ['Tạo đề thi mới', 'Crear examen', 'Create quiz'],
  ['Thêm mới', 'Agregar nuevo', 'Add new'],
  ['Thông tin', 'Datos', 'Details'],
  ['Câu hỏi', 'Preguntas', 'Questions'],
  ['Loại chủ đề', 'Grupo de tema', 'Topic group'],
  ['Chủ đề', 'Tema', 'Topic'],
  ['Chọn chủ đề', 'Seleccionar tema', 'Select topic'],
  ['Điểm đạt', 'Mínimo', 'Passing score'],
  ['Tổng số', 'Total', 'Total'],
  ['Câu', 'Preg', 'Q'],
  ['Trả lời đúng', 'Correcta', 'Correct answer'],
  ['Hình ảnh', 'Imagen', 'Image'],
  ['Xem trước ảnh câu hỏi', 'Vista previa de imagen', 'Question image preview'],
  ['Quay lại', 'Atrás', 'Back'],
  ['Tiếp theo', 'Siguiente', 'Next'],
  ['Tạo đề thi', 'Crear examen', 'Create quiz'],
  ['Danh sách đề thi', 'Lista de exámenes', 'Quiz list'],
  ['Chủ đề bài thi', 'Tema de examen', 'Quiz topic'],
  ['Tất cả chủ đề', 'Todos los temas', 'All topics'],
  ['Tìm kiếm đề thi', 'Buscar examen', 'Search quizzes'],
  ['câu', 'preg', 'qs'],
  ['Chỉnh sửa đề thi', 'Editar examen', 'Edit quiz'],
  ['Xóa đề thi', 'Eliminar examen', 'Delete quiz'],
  ['Sửa bài thi', 'Editar examen', 'Edit quiz'],
  ['Tiêu đề VI', 'Título VI', 'Title (VI)'],
  ['Tiêu đề ES', 'Título ES', 'Title (ES)'],
  ['Mô tả VI', 'Descripción VI', 'Description (VI)'],
  ['Mô tả ES', 'Descripción ES', 'Description (ES)'],
  ['Hướng dẫn VI', 'Instrucciones VI', 'Instructions (VI)'],
  ['Hướng dẫn ES', 'Instrucciones ES', 'Instructions (ES)'],
  ['Trạng thái', 'Estado', 'Status'],
  ['Hiển thị', 'Activo', 'Visible'],
  ['Ẩn', 'Oculto', 'Hidden'],
  ['Thêm câu', 'Agregar pregunta', 'Add question'],
  ['Câu', 'Pregunta', 'Question'],
  ['Câu hỏi VI', 'Pregunta VI', 'Question (VI)'],
  ['Giải thích VI', 'Explicación VI', 'Explanation (VI)'],
  ['Câu hỏi ES', 'Pregunta ES', 'Question (ES)'],
  ['Giải thích ES', 'Explicación ES', 'Explanation (ES)'],
  ['Nội dung trả lời VI', 'Texto respuesta VI', 'Answer text (VI)'],
  ['Nội dung trả lời ES', 'Texto respuesta ES', 'Answer text (ES)'],
  ['Trả lời', 'Resp.', 'Ans.'],
  ['Trả lời', 'Respuesta', 'Answer'],
  ['Ảnh câu hỏi', 'Imagen de pregunta', 'Question image'],
  ['Đánh dấu đúng', 'Marcar correcta', 'Mark correct'],
  ['Xóa ảnh', 'Quitar imagen', 'Remove image'],
  ['Đúng', 'Ok', 'OK'],
  ['Loại chủ đề tài liệu', 'Grupos de tema (material)', 'Material topic groups'],
  ['+ Thêm loại chủ đề', '+ Nuevo grupo', '+ Add topic group'],
  ['Thêm loại chủ đề tài liệu', 'Agregar grupo de tema de material', 'Add material topic group'],
  ['Thêm loại chủ đề', 'Agregar grupo de tema', 'Add topic group'],
  ['Sửa loại chủ đề tài liệu', 'Editar grupo de tema de material', 'Edit material topic group'],
  ['Tên hiển thị (VI)', 'Nombre (VI)', 'Display name (VI)'],
  ['Mô tả (VI)', 'Descripción (VI)', 'Description (VI)'],
  ['Tên hiển thị (ES)', 'Nombre (ES)', 'Display name (ES)'],
  ['Mô tả (ES)', 'Descripción (ES)', 'Description (ES)'],
  ['Tên hiển thị', 'Nombre (VI)', 'Display name (VI)'],
  ['Mô tả', 'Descripción (VI)', 'Description (VI)'],
  ['Tên hiển thị', 'Nombre (ES)', 'Display name (ES)'],
  ['Mô tả', 'Descripción (ES)', 'Description (ES)'],
  ['Sửa chủ đề tài liệu', 'Editar tema de material', 'Edit material topic'],
  ['Chủ đề tài liệu', 'Temas de material', 'Material topics'],
  ['Nhóm cha (bắt buộc chọn)', 'Grupo padre (obligatorio)', 'Parent group (required)'],
  ['+ Thêm chủ đề', '+ Nuevo tema', '+ Add topic'],
  ['Thêm chủ đề tài liệu', 'Agregar tema de material', 'Add material topic'],
  ['Loại chủ đề (nhóm tài liệu)', 'Grupo de tema (padre)', 'Topic group (parent)'],
  ['Chọn loại chủ đề', 'Grupo de tema', 'Select topic group'],
  ['Tên chủ đề', 'Nombre del tema (VI)', 'Topic name (VI)'],
  ['Tên chủ đề', 'Nombre del tema (ES)', 'Topic name (ES)'],
  ['Thêm chủ đề', 'Agregar tema', 'Add topic'],
  ['Sửa chủ đề', 'Editar tema', 'Edit topic'],
  ['Xóa chủ đề', 'Eliminar tema', 'Delete topic'],
  ['Thêm tài liệu song ngữ', 'Agregar material bilingüe', 'Add bilingual material'],
  ['Thêm tài liệu', 'Agregar material', 'Add material'],
  ['Danh sách tài liệu', 'Lista del temario', 'Materials list'],
  ['Chủ đề tài liệu', 'Tema de material', 'Material topic'],
  ['Tất cả chủ đề', 'Todos los temas', 'All topics'],
  ['Đang hiển thị theo chủ đề:', 'Mostrando por tema:', 'Filtered by topic:'],
  ['chỉ PDF', 'solo PDF', 'PDF only'],
  ['Đang tải lên...', 'Subiendo...', 'Uploading…'],
  ['File PDF:', 'PDF:', 'PDF:'],
  ['Dung lượng', 'Tamaño', 'Size'],
  ['Số trang PDF', 'Páginas PDF', 'PDF pages'],
  ['Chỉnh sửa tài liệu', 'Editar material', 'Edit material'],
  ['Xóa tài liệu', 'Eliminar material', 'Delete material'],
  ['Sửa tài liệu', 'Editar material', 'Edit material'],
  ['File mới (VI)', 'Archivo nuevo (VI)', 'New file (VI)'],
  ['File mới (ES)', 'Archivo nuevo (ES)', 'New file (ES)'],
];

function esc(s) {
  return s.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

function patchFile(relPath) {
  const filePath = path.join(__dirname, '..', relPath);
  let s = fs.readFileSync(filePath, 'utf8');

  const rows = [...TRIPLES].sort((a, b) => b[0].length + b[1].length - (a[0].length + a[1].length));
  for (const [vi, es, en] of rows) {
    const old = `lang === 'vi' ? '${esc(vi)}' : '${esc(es)}'`;
    const neu = `adminT(lang, '${esc(vi)}', '${esc(es)}', '${esc(en)}')`;
    if (s.includes(old)) {
      s = s.split(old).join(neu);
    }
  }
  fs.writeFileSync(filePath, s);
}

patchFile('src/features/admin/quizzes/admin-quizzes-section.tsx');
patchFile('src/features/admin/materials/admin-materials-section.tsx');
console.log('apply-admin-t: done');
