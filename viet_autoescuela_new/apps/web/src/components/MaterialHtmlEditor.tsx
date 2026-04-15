'use client';

import { Editor } from '@tinymce/tinymce-react';

const TINYMCE_VERSION = '7.6.1';
const TINYMCE_CDN = `https://cdn.jsdelivr.net/npm/tinymce@${TINYMCE_VERSION}`;
const TINYMCE_SRC = `${TINYMCE_CDN}/tinymce.min.js`;

/** Khớp font + scale heading/đoạn với `.material-study-prose` (trang public). */
const MATERIAL_TINYMCE_CONTENT_STYLE = `
@import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700&display=swap');
body {
  font-family: 'Be Vietnam Pro', ui-sans-serif, system-ui, sans-serif;
  font-size: 15px;
  line-height: 1.6;
  color: hsl(220, 20%, 18%);
  margin: 12px;
}
h1 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #3d2230;
  margin: 2.5rem 0 0.75rem;
  letter-spacing: -0.02em;
}
h2 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #3d2230;
  margin: 2.5rem 0 0.75rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid hsl(20, 12%, 88%);
  letter-spacing: -0.02em;
}
h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #3d2230;
  margin: 2rem 0 0.5rem;
  letter-spacing: -0.02em;
}
p { margin: 0 0 1rem; }
ul, ol { margin: 0 0 1rem; padding-left: 1.5rem; }
li { margin: 0.25rem 0; }
table { border-collapse: collapse; width: 100%; margin: 1rem 0; }
td, th { border: 1px solid #d1d5db; padding: 6px 8px; }
th { background: hsl(20, 10%, 89%); font-weight: 600; color: #3d2230; }
hr {
  border: 0;
  border-top: 1px solid hsl(20, 12%, 88%);
  margin: 1.25rem 0;
}
blockquote {
  border-left: 3px solid #6b1528;
  background: hsla(20, 10%, 89%, 0.45);
  margin: 1rem 0;
  padding: 0.35rem 1rem 0.35rem 1rem;
}
figure.image {
  margin: 1rem auto;
  text-align: center;
}
img {
  display: block;
  margin: 1rem auto;
  max-width: 100%;
  width: auto;
  height: auto;
  object-fit: contain;
  max-height: min(85vh, 48rem);
  border-radius: 0.375rem;
}
`.trim();

type Props = {
  value: string;
  onChange: (html: string) => void;
  height?: number;
  onUploadImage: (file: File) => Promise<string>;
};

export function MaterialHtmlEditor({ value, onChange, height = 300, onUploadImage }: Props) {
  return (
    <Editor
      tinymceScriptSrc={TINYMCE_SRC}
      licenseKey="gpl"
      value={value}
      onEditorChange={onChange}
      init={{
        base_url: TINYMCE_CDN,
        suffix: '.min',
        // Keep Tiny dialogs above Radix Dialog overlay.
        z_index: 200000,
        height,
        menubar: false,
        branding: false,
        promotion: false,
        statusbar: true,
        resize: true,
        plugins:
          'advlist autoresize lists link image charmap searchreplace visualblocks code fullscreen table wordcount hr',
        toolbar1:
          'undo redo | blocks fontsize fontfamily | bold italic underline strikethrough | forecolor backcolor | alignleft aligncenter alignright alignjustify | bullist numlist | outdent indent',
        toolbar2:
          'table tabledelete | tableprops tablerowprops tablecellprops | link image | hr | removeformat | charmap | visualblocks | searchreplace | code fullscreen',
        font_size_formats: '12px 14px 16px 18px 20px 24px',
        font_family_formats:
          'Sans Serif=sans-serif,system-ui; Serif=Georgia,serif; Monospace=ui-monospace,monospace',
        content_style: MATERIAL_TINYMCE_CONTENT_STYLE,
        image_title: true,
        image_caption: true,
        image_advtab: true,
        images_upload_handler(blobInfo) {
          return new Promise((resolve, reject) => {
            const blob = blobInfo.blob();
            const type = blob.type || 'image/png';
            const ext = type.includes('jpeg') ? 'jpg' : type.split('/')[1] || 'png';
            const file = new File([blob], `inline.${ext}`, { type });
            onUploadImage(file).then(resolve).catch(reject);
          });
        },
        automatic_uploads: true,
        file_picker_types: 'image',
      }}
    />
  );
}
