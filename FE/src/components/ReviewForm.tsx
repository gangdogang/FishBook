import { FormEvent, useEffect, useState, type ReactNode, type RefObject } from 'react';
import type { ReviewRequest } from '../types/review';

type ReviewFormField = 'nickname' | 'rating' | 'content' | 'password';

interface ReviewFormState {
  nickname: string;
  rating: number | null;
  content: string;
  password: string;
}

type FieldErrors = Partial<Record<ReviewFormField, string>>;

interface ReviewFormProps {
  submitting: boolean;
  error?: string;
  resetKey: number;
  formRef?: RefObject<HTMLFormElement>;
  onSubmit: (request: ReviewRequest) => void;
}

const emptyForm: ReviewFormState = {
  nickname: '',
  rating: null,
  content: '',
  password: '',
};

export default function ReviewForm({ submitting, error, resetKey, formRef, onSubmit }: ReviewFormProps) {
  const [form, setForm] = useState<ReviewFormState>(emptyForm);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  useEffect(() => {
    setForm(emptyForm);
    setFieldErrors({});
  }, [resetKey]);

  function updateField<Field extends ReviewFormField>(field: Field, value: ReviewFormState[Field]) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validateForm(form);
    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors);
      return;
    }

    setFieldErrors({});
    onSubmit({
      nickname: form.nickname.trim(),
      rating: form.rating,
      content: form.content.trim(),
      imageUrl: null,
      password: form.password,
    });
  }

  return (
    <form
      ref={formRef}
      id="review-form"
      onSubmit={handleSubmit}
      noValidate
      className="mt-3.5 rounded-card border border-line bg-white p-[18px]"
    >
      <h3 className="m-0 mb-3.5 text-[15px] font-bold text-ink">후기 남기기</h3>

      <div className="mb-3 grid gap-3 sm:grid-cols-2">
        <Field label="닉네임" error={fieldErrors.nickname}>
          <input
            name="nickname"
            maxLength={30}
            value={form.nickname}
            placeholder="예: 회러버"
            aria-invalid={Boolean(fieldErrors.nickname)}
            onChange={(event) => updateField('nickname', event.target.value)}
            className={inputClass(Boolean(fieldErrors.nickname))}
          />
        </Field>

        <Field label="별점 (선택)" error={fieldErrors.rating}>
          <div className="flex min-h-[42px] items-center gap-1" role="radiogroup" aria-label="별점">
            {[1, 2, 3, 4, 5].map((score) => {
              const selected = form.rating !== null && score <= form.rating;
              return (
                <button
                  key={score}
                  type="button"
                  role="radio"
                  aria-checked={form.rating === score}
                  onClick={() => updateField('rating', form.rating === score ? null : score)}
                  className={[
                    'min-h-9 min-w-9 border-0 bg-transparent p-0 text-[24px] leading-none transition',
                    selected ? 'text-star' : 'text-line hover:text-star',
                  ].join(' ')}
                  aria-label={`${score}점`}
                >
                  ★
                </button>
              );
            })}
          </div>
        </Field>
      </div>

      <div className="mb-3">
        <Field label="후기" error={fieldErrors.content}>
          <textarea
            maxLength={1000}
            rows={4}
            value={form.content}
            placeholder="맛·식감·먹은 곳 분위기, 자유롭게 적어주세요"
            aria-invalid={Boolean(fieldErrors.content)}
            onChange={(event) => updateField('content', event.target.value)}
            className={[inputClass(Boolean(fieldErrors.content)), 'min-h-[96px] resize-y leading-[1.6]'].join(' ')}
          />
        </Field>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 sm:items-end">
        <Field label="비밀번호" error={fieldErrors.password}>
          <input
            minLength={4}
            maxLength={20}
            type="password"
            value={form.password}
            placeholder="4자 이상"
            aria-invalid={Boolean(fieldErrors.password)}
            onChange={(event) => updateField('password', event.target.value)}
            className={inputClass(Boolean(fieldErrors.password))}
          />
          <p className="m-0 mt-1 text-xs leading-snug text-ink-mute">후기를 지울 때만 써요 (4자 이상)</p>
        </Field>

        <div className="flex flex-col items-stretch gap-2 sm:items-end">
          {error ? <p className="m-0 text-[13px] font-medium leading-snug text-red-700">{error}</p> : null}
          <button
            disabled={submitting}
            className="inline-flex min-h-11 w-full items-center justify-center rounded-[10px] border-0 bg-sea px-5 py-2.5 text-sm font-bold text-white transition hover:bg-sea disabled:cursor-not-allowed disabled:bg-slate-300 sm:w-auto"
            type="submit"
          >
            {submitting ? '등록 중...' : '등록하기'}
          </button>
        </div>
      </div>
    </form>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
  return (
    <div className="block">
      <span className="mb-[5px] block text-xs font-bold text-ink-mute">{label}</span>
      {children}
      {error ? <span className="mt-1 block text-[13px] font-medium leading-snug text-red-700">{error}</span> : null}
    </div>
  );
}

function inputClass(hasError: boolean) {
  return [
    'block w-full rounded-[10px] border bg-mist px-3 py-2.5 text-sm text-ink outline-none transition placeholder:text-ink-mute/70 focus:border-sea',
    hasError ? 'border-red-300' : 'border-line',
  ].join(' ');
}

function validateForm(form: ReviewFormState) {
  const errors: FieldErrors = {};

  if (!form.nickname.trim()) errors.nickname = '닉네임을 입력해 주세요.';
  if (form.rating !== null && (form.rating < 1 || form.rating > 5)) errors.rating = '별점은 1~5점 중 선택해 주세요.';
  if (!form.content.trim()) errors.content = '후기를 입력해 주세요.';
  if (form.password.length < 4 || form.password.length > 20) errors.password = '비밀번호는 4~20자로 입력해 주세요.';

  return errors;
}
