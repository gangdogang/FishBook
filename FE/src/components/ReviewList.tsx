import { ThumbsUp, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { Review } from '../types/review';

const HELPFUL_STORAGE_KEY = 'fishnote.helpfulReviewIds';

interface ReviewListProps {
  reviews: Review[];
  onDelete: (reviewId: number, password: string) => Promise<boolean>;
  onHelpful: (reviewId: number) => Promise<boolean>;
  workingReviewId?: number;
}

export default function ReviewList({ reviews, onDelete, onHelpful, workingReviewId }: ReviewListProps) {
  const [helpfulReviewIds, setHelpfulReviewIds] = useState<number[]>(() => readHelpfulReviewIds());
  const [message, setMessage] = useState<string | undefined>();
  const [deletingReviewId, setDeletingReviewId] = useState<number | undefined>();
  const [deletePassword, setDeletePassword] = useState('');
  const helpfulSet = useMemo(() => new Set(helpfulReviewIds), [helpfulReviewIds]);

  if (reviews.length === 0) {
    return <div className="rounded-[14px] border border-dashed border-line bg-white px-5 py-8 text-center text-sm text-muted">아직 후기가 없습니다.</div>;
  }

  async function handleHelpful(reviewId: number) {
    if (helpfulSet.has(reviewId)) {
      setMessage('이미 도움돼요를 누른 후기입니다.');
      return;
    }

    setMessage(undefined);
    const ok = await onHelpful(reviewId);
    if (!ok) return;

    const nextIds = [...helpfulReviewIds, reviewId];
    setHelpfulReviewIds(nextIds);
    writeHelpfulReviewIds(nextIds);
  }

  function openDeleteForm(reviewId: number) {
    setMessage(undefined);
    setDeletingReviewId(reviewId);
    setDeletePassword('');
  }

  async function handleDelete(reviewId: number) {
    if (deletePassword.trim().length < 4) {
      setMessage('삭제용 비밀번호는 4자 이상 입력해 주세요.');
      return;
    }

    setMessage(undefined);
    const ok = await onDelete(reviewId, deletePassword);
    if (!ok) return;

    setDeletingReviewId(undefined);
    setDeletePassword('');
  }

  return (
    <div className="flex flex-col gap-3.5">
      {message ? <p className="m-0 rounded-[10px] bg-red-50 px-3 py-2 text-[13.5px] font-medium text-red-700">{message}</p> : null}
      {reviews.map((review) => (
        <article key={review.id} className="rounded-[14px] border border-line px-5 py-[18px]">
          <div className="mb-[9px] flex items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-2.5">
              <span className="flex h-8 w-8 flex-none items-center justify-center rounded-full bg-brand-50 text-[13px] font-bold text-brand-700">
                {getInitial(review.nickname)}
              </span>
              <div className="min-w-0">
                <b className="block truncate text-sm text-ink">{review.nickname}</b>
                <RatingStars rating={review.rating ?? 0} className="text-[12.5px]" />
              </div>
            </div>
            <time className="flex-none text-[12.5px] text-faint">{formatDate(review.createdAt)}</time>
          </div>

          <p className="m-0 mb-3 whitespace-pre-line break-words text-[14.5px] leading-[1.65] text-ink">{review.content}</p>
          {review.imageUrl ? <img src={review.imageUrl} alt="" className="mb-3 max-h-64 rounded-[10px] object-cover" /> : null}

          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              disabled={helpfulSet.has(review.id) || workingReviewId === review.id}
              onClick={() => void handleHelpful(review.id)}
              className={[
                'inline-flex items-center gap-1.5 rounded-full border px-[13px] py-1.5 text-[12.5px] font-semibold transition',
                helpfulSet.has(review.id)
                  ? 'border-brand-100 bg-brand-50 text-brand-700'
                  : 'border-line bg-white text-muted hover:border-brand-600 hover:text-brand-700',
                workingReviewId === review.id ? 'cursor-wait opacity-60' : '',
              ].join(' ')}
            >
              <ThumbsUp className="h-3.5 w-3.5" aria-hidden />
              도움돼요 {review.helpfulCount ?? 0}
            </button>
            <button
              type="button"
              title="후기 삭제"
              aria-label="후기 삭제"
              disabled={workingReviewId === review.id}
              onClick={() => openDeleteForm(review.id)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full text-faint transition hover:bg-red-50 hover:text-red-600 disabled:cursor-wait disabled:opacity-50"
            >
              <Trash2 className="h-4 w-4" aria-hidden />
            </button>
          </div>

          {deletingReviewId === review.id ? (
            <div className="mt-3 flex flex-col gap-2 rounded-[10px] bg-[#FBFCFC] p-3 sm:flex-row sm:items-center">
              <input
                type="password"
                value={deletePassword}
                onChange={(event) => setDeletePassword(event.target.value)}
                placeholder="삭제용 비밀번호"
                className="min-w-0 flex-1 rounded-[10px] border border-line bg-white px-3 py-2 text-[13.5px] text-ink outline-none focus:border-brand-600"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setDeletingReviewId(undefined);
                    setDeletePassword('');
                    setMessage(undefined);
                  }}
                  className="flex-1 rounded-[10px] border border-line bg-white px-3 py-2 text-[13.5px] font-semibold text-muted sm:flex-none"
                >
                  취소
                </button>
                <button
                  type="button"
                  disabled={workingReviewId === review.id}
                  onClick={() => void handleDelete(review.id)}
                  className="flex-1 rounded-[10px] border-0 bg-red-600 px-3 py-2 text-[13.5px] font-semibold text-white disabled:cursor-wait disabled:bg-slate-300 sm:flex-none"
                >
                  삭제
                </button>
              </div>
            </div>
          ) : null}
        </article>
      ))}
    </div>
  );
}

function RatingStars({ rating, className = '' }: { rating: number; className?: string }) {
  const full = Math.max(0, Math.min(5, Math.round(rating)));

  return (
    <span className={className} aria-label={`${full}점`}>
      <span className="text-accent">{'★'.repeat(full)}</span>
      <span className="text-[#E0E3E6]">{'★'.repeat(5 - full)}</span>
    </span>
  );
}

function getInitial(nickname: string) {
  return nickname.trim().charAt(0) || '익';
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

function readHelpfulReviewIds() {
  try {
    return JSON.parse(window.localStorage.getItem(HELPFUL_STORAGE_KEY) ?? '[]') as number[];
  } catch {
    return [];
  }
}

function writeHelpfulReviewIds(ids: number[]) {
  window.localStorage.setItem(HELPFUL_STORAGE_KEY, JSON.stringify(ids));
}
