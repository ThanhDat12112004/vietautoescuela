import { useEffect, useState } from 'react';

/** Bump khi `markMaterialPostRead` hoặc storage từ tab khác — để list Tài liệu refilter. */
export function useMaterialPostReadVersion() {
  const [v, setV] = useState(0);

  useEffect(() => {
    const bump = () => setV((n) => n + 1);
    window.addEventListener('material-post-read-updated', bump);
    window.addEventListener('storage', bump);
    return () => {
      window.removeEventListener('material-post-read-updated', bump);
      window.removeEventListener('storage', bump);
    };
  }, []);

  return v;
}
