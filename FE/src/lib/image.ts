// Cloudinary URL에 표시용 최적화 변환(f_auto·q_auto·리사이즈)을 끼워 넣는다.
// Cloudinary가 아닌 URL(정적 파일 등)은 그대로 반환.
export function optimizedImageUrl(url: string, width = 800) {
  if (!url.includes('res.cloudinary.com') || !url.includes('/upload/')) return url;
  if (/\/upload\/[a-z]+_[^/]*\//.test(url)) return url; // 이미 변환이 붙은 URL

  return url.replace('/upload/', `/upload/f_auto,q_auto,w_${width},c_limit/`);
}
