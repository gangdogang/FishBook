import { FormEvent, useEffect, useState } from 'react';
import { X } from 'lucide-react';
import type { ReviewRequest } from '../types/review';

interface ReviewFormProps {
  open: boolean;
  submitting: boolean;
  error?: string;
  onClose: () => void;
  onSubmit: (request: ReviewRequest) => void;
}

export default function ReviewForm({ open, submitting, error, onClose, onSubmit }: ReviewFormProps) {
  const [form, setForm] = useState({
    nickname: '',
    rating: 5,
    content: '',
    imageUrl: '',
    password: '',
  });
  const [validationError, setValidationError] = useState<string | undefined>();

  useEffect(() => {
    if (!open) {
      setValidationError(undefined);
      setForm({
        nickname: '',
        rating: 5,
        content: '',
        imageUrl: '',
        password: '',
      });
    }
  }, [open]);

  if (!open) {
    return null;
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextError = validateForm(form);
    if (nextError) {
      setValidationError(nextError);
      return;
    }

    setValidationError(undefined);
    onSubmit({
      nickname: form.nickname.trim(),
      rating: form.rating,
      content: form.content.trim(),
      imageUrl: form.imageUrl.trim() || null,
      password: form.password,
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(20,24,28,0.45)] p-5" onClick={onClose}>
      <div className="max-h-[90vh] w-full max-w-[460px] overflow-y-auto rounded-[18px] bg-white p-[26px]" onClick={(event) => event.stopPropagation()}>
        <div className="mb-1.5 flex items-center justify-between">
          <h2 className="m-0 text-[19px] font-bold text-ink">후기 쓰기</h2>
          <button type="button" title="닫기" aria-label="닫기" onClick={onClose} className="border-0 bg-transparent p-0 text-[22px] leading-none text-ink-mute/70">
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>
        <p className="m-0 mb-[18px] text-[13.5px] text-ink-mute/70">선택한 생선에 대한 후기를 남겨주세요.</p>

        <form onSubmit={handleSubmit} noValidate>
          <label className="mb-[7px] block text-[13px] font-semibold text-ink-mute">별점</label>
          <div className="mb-[18px] flex gap-1">
            {[1, 2, 3, 4, 5].map((score) => (
              <button
                key={score}
                type="button"
                onClick={() => setForm((prev) => ({ ...prev, rating: score }))}
                className={[
                  'border-0 bg-transparent p-0 text-3xl leading-none transition',
                  score <= form.rating ? 'text-star' : 'text-line hover:text-star',
                ].join(' ')}
                aria-label={`${score}점`}
              >
                ★
              </button>
            ))}
          </div>

          <label className="mb-[7px] block text-[13px] font-semibold text-ink-mute">닉네임</label>
          <div className="mb-4">
            <input
              maxLength={30}
              value={form.nickname}
              placeholder="익명"
              onChange={(event) => setForm((prev) => ({ ...prev, nickname: event.target.value }))}
              className="w-full rounded-[10px] border border-line px-[13px] py-[11px] text-sm text-ink outline-none focus:border-sea"
            />
          </div>

          <label className="mb-[7px] block text-[13px] font-semibold text-ink-mute">내용</label>
          <div className="mb-4">
            <textarea
              maxLength={1000}
              rows={4}
              value={form.content}
              placeholder="맛, 식감, 어디서 드셨는지 자유롭게 남겨주세요."
              onChange={(event) => setForm((prev) => ({ ...prev, content: event.target.value }))}
              className="w-full resize-y rounded-[10px] border border-line px-[13px] py-[11px] text-sm leading-normal text-ink outline-none focus:border-sea"
            />
          </div>

          <label className="mb-[7px] block text-[13px] font-semibold text-ink-mute">
            이미지 URL <span className="font-normal text-ink-mute/70">(선택)</span>
          </label>
          <div className="mb-4">
            <input
              type="url"
              value={form.imageUrl}
              placeholder="https://example.com/photo.jpg"
              onChange={(event) => setForm((prev) => ({ ...prev, imageUrl: event.target.value }))}
              className="w-full rounded-[10px] border border-dashed border-line px-[13px] py-[11px] text-sm text-ink outline-none focus:border-sea"
            />
          </div>

          <label className="mb-[7px] block text-[13px] font-semibold text-ink-mute">삭제용 비밀번호</label>
          <div className="mb-[22px]">
            <input
              minLength={4}
              maxLength={20}
              type="password"
              value={form.password}
              placeholder="후기 삭제 시 필요해요"
              onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
              className="w-full rounded-[10px] border border-line px-[13px] py-[11px] text-sm text-ink outline-none focus:border-sea"
            />
          </div>

          {validationError || error ? (
            <p className="m-0 mb-4 rounded-[10px] bg-red-50 px-3 py-2 text-[13.5px] font-medium text-red-700">{validationError ?? error}</p>
          ) : null}

          <div className="flex gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-[10px] border border-line bg-white p-3 text-sm font-semibold text-ink-mute hover:bg-chipbg"
            >
              취소
            </button>
            <button
              disabled={submitting}
              className="flex-[2] rounded-[10px] border-0 bg-sea p-3 text-sm font-semibold text-white hover:bg-sea disabled:cursor-not-allowed disabled:bg-slate-300"
              type="submit"
            >
              {submitting ? '등록 중...' : '등록하기'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function validateForm(form: { nickname: string; rating: number; content: string; imageUrl: string; password: string }) {
  if (!form.nickname.trim()) return '닉네임을 입력해 주세요.';
  if (form.rating < 1 || form.rating > 5) return '별점은 1~5점 중 선택해 주세요.';
  if (!form.content.trim()) return '후기 내용을 입력해 주세요.';
  if (form.password.length < 4 || form.password.length > 20) return '삭제용 비밀번호는 4~20자로 입력해 주세요.';
  if (form.imageUrl.trim()) {
    try {
      new URL(form.imageUrl.trim());
    } catch {
      return '이미지 URL 형식을 확인해 주세요.';
    }
  }
  return undefined;
}
