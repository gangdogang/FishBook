import { Bookmark, ChevronRight, Plus } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import ReviewForm from '../components/ReviewForm';
import ReviewList from '../components/ReviewList';
import SeasonBar from '../components/SeasonBar';
import { formatMonths, formatPriceLevel } from '../lib/format';
import { getErrorMessage } from '../lib/errors';
import { useFishDetail } from '../hooks/useFish';
import { useBookmarks } from '../hooks/useBookmarks';
import { useCreateReview, useDeleteReview, useMarkReviewHelpful, useReviews } from '../hooks/useReviews';
import type { RatingDistribution } from '../types/fish';
import type { ReviewRequest, ReviewSort } from '../types/review';

export default function FishDetailPage() {
  const params = useParams();
  const fishId = Number(params.id);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [formOpen, setFormOpen] = useState(false);
  const [formError, setFormError] = useState<string | undefined>();
  const [reviewActionError, setReviewActionError] = useState<string | undefined>();
  const [reviewSort, setReviewSort] = useState<ReviewSort>('latest');
  const { data: fish, isLoading, isError } = useFishDetail(fishId);
  const { data: reviewList } = useReviews(fishId, reviewSort);
  const { data: latestReviewList } = useReviews(fishId, 'latest');
  const createMutation = useCreateReview(fishId);
  const deleteMutation = useDeleteReview(fishId);
  const helpfulMutation = useMarkReviewHelpful(fishId);
  const { isBookmarked, toggleBookmark } = useBookmarks();

  useEffect(() => {
    setSelectedImageIndex(0);
  }, [fishId]);

  const galleryImages = useMemo(() => {
    const images = fish?.images?.filter(Boolean) ?? [];
    if (images.length > 0) return images;
    return fish?.imageUrl ? [fish.imageUrl] : [];
  }, [fish]);

  function handleCreate(request: ReviewRequest) {
    setFormError(undefined);
    createMutation.mutate(request, {
      onSuccess: () => setFormOpen(false),
      onError: (error) => setFormError(getErrorMessage(error)),
    });
  }

  function openReviewForm() {
    setFormError(undefined);
    setFormOpen(true);
  }

  function closeReviewForm() {
    setFormError(undefined);
    setFormOpen(false);
  }

  async function handleDeleteReview(reviewId: number, password: string) {
    setReviewActionError(undefined);
    try {
      await deleteMutation.mutateAsync({ reviewId, password });
      return true;
    } catch (error) {
      setReviewActionError(getErrorMessage(error));
      return false;
    }
  }

  async function handleHelpfulReview(reviewId: number) {
    setReviewActionError(undefined);
    try {
      await helpfulMutation.mutateAsync(reviewId);
      return true;
    } catch (error) {
      setReviewActionError(getErrorMessage(error));
      return false;
    }
  }

  if (isLoading) {
    return <StateText text="상세 정보를 불러오는 중입니다." />;
  }

  if (isError || !fish) {
    return <StateText text="생선을 찾을 수 없습니다." />;
  }

  const selectedImage = galleryImages[selectedImageIndex] ?? galleryImages[0] ?? null;
  const avgRating = reviewList?.avgRating ?? fish.avgRating;
  const reviewCount = reviewList?.totalCount ?? fish.reviewCount;
  const ratingDistribution = reviewList?.ratingDistribution ?? fish.ratingDistribution;
  const tips = fish.tips ?? [];
  const description = fish.tasteDesc ?? fish.description;
  const bookmarked = isBookmarked(fish.id);
  const recentReviews = (latestReviewList?.reviews ?? []).slice(0, 3);

  return (
    <main className="mx-auto max-w-[1200px] px-4 pb-20 pt-5 sm:px-7">
      <nav className="flex items-center gap-1.5 px-0 py-2.5 pb-[18px] text-[13.5px] text-ink-mute/70" aria-label="breadcrumb">
        <Link to="/" className="text-ink-mute hover:text-sea">
          도감
        </Link>
        <ChevronRight className="h-3.5 w-3.5" aria-hidden />
        <span className="font-medium text-ink">{fish.name}</span>
      </nav>

      <section className="flex flex-wrap items-start gap-8 lg:gap-11">
        <div className="min-w-[300px] flex-1 basis-[400px]">
          <div className="relative flex aspect-[3/2] items-center justify-center overflow-hidden rounded-card bg-chipbg">
            {selectedImage ? (
              <img src={selectedImage} alt={fish.name} className="h-full w-full object-cover" />
            ) : (
              <FishPlaceholder className="h-[105px] w-[168px] stroke-ink-mute/30" />
            )}
            <button
              type="button"
              onClick={() => toggleBookmark(fish.id)}
              className="absolute right-4 top-4 inline-flex h-10 items-center gap-1.5 rounded-full border-0 bg-white/95 px-4 text-sm font-semibold text-ink shadow-sm transition hover:text-sea"
              aria-label={bookmarked ? '생선 저장 해제' : '생선 저장'}
              aria-pressed={bookmarked}
            >
              <Bookmark className={bookmarked ? 'h-4 w-4 fill-sea text-sea' : 'h-4 w-4 fill-none text-ink-mute/70'} aria-hidden />
              {bookmarked ? '저장됨' : '저장'}
            </button>
          </div>
          {galleryImages.length > 0 ? (
            <div className="mt-3 flex gap-2.5">
              {galleryImages.map((image, index) => (
                <button
                  key={`${image}-${index}`}
                  type="button"
                  onClick={() => setSelectedImageIndex(index)}
                  className={[
                    'aspect-square min-w-0 flex-1 overflow-hidden rounded-[10px] bg-chipbg',
                    selectedImageIndex === index ? 'border-2 border-sea' : 'border border-transparent',
                  ].join(' ')}
                  aria-label={`${fish.name} 이미지 ${index + 1}`}
                >
                  <img src={image} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          ) : null}

          {recentReviews.length > 0 ? (
            <div className="mt-5 rounded-card border border-line bg-white px-5 py-[18px]">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-[13.5px] font-semibold text-ink">최근 후기</span>
                <button
                  type="button"
                  onClick={() => document.getElementById('reviews')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                  className="bg-transparent text-[12.5px] font-semibold text-sea transition hover:text-sea"
                >
                  후기 {reviewCount}개 전체 보기
                </button>
              </div>
              <div className="flex flex-col gap-3">
                {recentReviews.map((review) => (
                  <div key={review.id} className="flex items-start gap-3">
                    {review.imageUrl ? (
                      <img src={review.imageUrl} alt="" className="h-14 w-14 flex-none rounded-[10px] border border-line object-cover" />
                    ) : null}
                    <div className="min-w-0">
                      <div className="mb-0.5 flex items-center gap-1.5">
                        <RatingStars rating={review.rating ?? 0} className="text-[12px]" />
                        <span className="truncate text-[12px] font-semibold text-ink-mute">{review.nickname}</span>
                      </div>
                      <p className="m-0 line-clamp-2 break-words text-[13.5px] leading-[1.55] text-ink">{review.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        <div className="min-w-[300px] flex-1 basis-[420px]">
          <div className="mb-3 flex items-center gap-[9px]">
            <span className="rounded-full bg-chipbg px-3 py-[5px] text-[13px] font-semibold text-ink-mute">{formatMonths(fish.seasonMonths)} 제철</span>
            <span className="text-sm font-semibold text-ink">{formatPriceLevel(fish.priceLevel)}</span>
          </div>

          <div className="mb-2.5 flex items-baseline gap-2.5">
            <h1 className="m-0 text-[32px] font-bold leading-tight tracking-normal text-ink">{fish.name}</h1>
            {fish.nameEn ? <span className="text-base text-ink-mute/70">{fish.nameEn}</span> : null}
          </div>

          <div className="mb-[22px] flex items-center gap-2">
            <span className="text-base text-star">★</span>
            <b className="text-base">{avgRating.toFixed(1)}</b>
            <span className="text-line">·</span>
            <button
              type="button"
              onClick={() => document.getElementById('reviews')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
              className="bg-transparent text-sm text-ink-mute underline underline-offset-2"
            >
              후기 {reviewCount}개
            </button>
          </div>

          {description ? <p className="m-0 mb-6 text-[15.5px] leading-[1.7] text-ink">{description}</p> : null}

          <div className="mb-6 grid grid-cols-2 gap-px overflow-hidden rounded-[14px] border border-line bg-line">
            <SpecCell label="제철" value={formatMonths(fish.seasonMonths)} />
            <SpecCell label="가격대" value={formatPriceLevel(fish.priceLevel)} subValue={priceWord(fish.priceLevel)} strongClassName="text-ink" />
            <SpecCell label="맛 프로필" value={fish.tasteTags.length > 0 ? fish.tasteTags.join(' · ') : '정보 준비 중'} />
            <SpecCell label="평균 별점" value={`★ ${avgRating.toFixed(1)} / 5.0`} strongClassName="text-ink" />
          </div>

          <div className="mb-6 rounded-[14px] border border-line bg-white px-5 py-[18px]">
            <div className="mb-3.5 text-[13.5px] font-semibold">
              월별 제철 <span className="text-[12.5px] font-normal text-ink-mute/70">· 진한 달이 제철</span>
            </div>
            <SeasonBar months={fish.seasonMonths} />
          </div>

          <div className="rounded-[14px] border border-line bg-white px-5 py-[18px]">
            <div className="mb-3 text-[13.5px] font-semibold">이렇게 즐겨요</div>
            {tips.length > 0 ? (
              <div className="flex flex-col gap-[11px]">
                {tips.map((tip, index) => (
                  <div key={`${tip}-${index}`} className="flex items-start gap-2.5">
                    <span className="mt-px flex h-5 w-5 flex-none items-center justify-center rounded-full bg-chipbg text-[11px] font-bold text-ink">{index + 1}</span>
                    <span className="text-sm leading-[1.55] text-ink">{tip}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="m-0 text-sm text-ink-mute">준비된 팁이 없습니다.</p>
            )}
          </div>
        </div>
      </section>

      {fish.similarFishes.length > 0 ? (
        <section className="mt-14">
          <h2 className="m-0 mb-[18px] text-xl font-bold tracking-normal text-ink">비슷한 생선</h2>
          <div className="flex gap-4 overflow-x-auto pb-1">
            {fish.similarFishes.map((similar) => (
              <Link
                key={similar.id}
                to={`/fish/${similar.id}`}
                className="block w-[210px] flex-none overflow-hidden rounded-card border border-line bg-white transition duration-150 hover:-translate-y-0.5"
              >
                <div className="relative flex aspect-[4/3] items-center justify-center bg-chipbg">
                  {similar.imageUrl ? <img src={similar.imageUrl} alt={similar.name} className="h-full w-full object-cover" /> : <FishPlaceholder className="h-[41px] w-[66px] stroke-ink-mute/30" />}
                  {similar.seasonMonths.length > 0 ? (
                    <span className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-[5px] text-xs font-semibold text-ink-mute shadow-sm">
                      {formatMonths(similar.seasonMonths)}
                    </span>
                  ) : null}
                </div>
                <div className="px-[15px] py-[13px]">
                  <div className="mb-[5px] flex items-baseline justify-between gap-3">
                    <h3 className="m-0 truncate text-[15.5px] font-semibold text-ink">{similar.name}</h3>
                    <span className="flex-none text-[13px] font-semibold text-ink">{formatPriceLevel(similar.priceLevel)}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[12.5px] text-ink-mute">
                    <span className="text-star">★</span>
                    <span>{similar.avgRating.toFixed(1)}</span>
                    {similar.seasonMonths.length > 0 ? (
                      <>
                        <span className="text-line">·</span>
                        <span className="truncate">{formatMonths(similar.seasonMonths)} 제철</span>
                      </>
                    ) : null}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <section id="reviews" className="mt-14 border-t border-line pt-[34px]">
        <h2 className="m-0 mb-5 text-xl font-bold tracking-normal text-ink">
          후기 <span className="font-medium text-ink-mute/70">{reviewCount}</span>
        </h2>
        <div className="mb-6 flex flex-wrap items-center gap-8 rounded-card border border-line bg-white px-7 py-6">
          <div className="flex-none text-center">
            <div className="text-[44px] font-bold leading-none tracking-normal">{avgRating.toFixed(1)}</div>
            <RatingStars rating={Math.round(avgRating)} className="my-2 text-[15px] tracking-[2px]" />
            <div className="text-[12.5px] text-ink-mute/70">후기 {reviewCount}개</div>
          </div>

          <RatingDistributionBars distribution={ratingDistribution} />

          <button
            type="button"
            onClick={openReviewForm}
            className="inline-flex flex-none items-center gap-2 rounded-[11px] border-0 bg-sea px-6 py-[13px] text-[14.5px] font-semibold text-white hover:bg-sea"
          >
            <Plus className="h-4 w-4" aria-hidden />
            후기 쓰기
          </button>
        </div>

        <div className="flex flex-col gap-3.5">
          <div className="flex items-center justify-between gap-3">
            <span className="text-[15px] font-semibold">
              전체 후기 <span className="font-medium text-ink-mute/70">{reviewCount}</span>
            </span>
            <select
              value={reviewSort}
              onChange={(event) => setReviewSort(event.target.value as ReviewSort)}
              className="rounded-[10px] border border-line bg-white px-3 py-2 text-[13.5px] text-ink outline-none"
              aria-label="후기 정렬"
            >
              <option value="latest">최신순</option>
              <option value="helpful">도움돼요순</option>
            </select>
          </div>

          {reviewActionError ? <p className="m-0 rounded-[10px] bg-red-50 px-3 py-2 text-[13.5px] font-medium text-red-700">{reviewActionError}</p> : null}

          <ReviewList
            reviews={reviewList?.reviews ?? []}
            onDelete={handleDeleteReview}
            onHelpful={handleHelpfulReview}
            workingReviewId={
              helpfulMutation.isPending
                ? helpfulMutation.variables
                : deleteMutation.isPending
                  ? deleteMutation.variables?.reviewId
                  : undefined
            }
          />
        </div>
      </section>

      <ReviewForm
        open={formOpen}
        submitting={createMutation.isPending}
        error={formError}
        onClose={closeReviewForm}
        onSubmit={handleCreate}
      />
    </main>
  );
}

function SpecCell({
  label,
  value,
  subValue,
  strongClassName = '',
}: {
  label: string;
  value: string;
  subValue?: string;
  strongClassName?: string;
}) {
  return (
    <div className="bg-white px-[17px] py-[15px]">
      <div className="mb-[5px] text-xs text-ink-mute/70">{label}</div>
      <div className={['text-[15px] font-semibold', strongClassName].join(' ')}>
        {value}
        {subValue ? <span className="ml-1 text-[13px] font-normal text-ink-mute/70">{subValue}</span> : null}
      </div>
    </div>
  );
}

function RatingDistributionBars({ distribution }: { distribution: RatingDistribution }) {
  const rows = [5, 4, 3, 2, 1] as const;
  const max = Math.max(...rows.map((star) => distribution[String(star) as keyof RatingDistribution] ?? 0), 1);

  return (
    <div className="flex min-w-[220px] flex-1 basis-[260px] flex-col gap-[7px]">
      {rows.map((star) => {
        const count = distribution[String(star) as keyof RatingDistribution] ?? 0;
        return (
          <div key={star} className="flex items-center gap-2.5">
            <span className="w-[30px] text-[12.5px] text-ink-mute">{star}점</span>
            <div className="h-[7px] flex-1 overflow-hidden rounded-full bg-chipbg">
              <div className="h-full rounded-full bg-star" style={{ width: `${Math.round((count / max) * 100)}%` }} />
            </div>
            <span className="w-[34px] text-right text-xs text-ink-mute/70">{count}</span>
          </div>
        );
      })}
    </div>
  );
}

function StateText({ text }: { text: string }) {
  return <main className="mx-auto max-w-6xl px-4 py-12 text-center text-slate-500 sm:px-6">{text}</main>;
}

function RatingStars({ rating, className = '' }: { rating: number; className?: string }) {
  const full = Math.max(0, Math.min(5, Math.round(rating)));

  return (
    <span className={className} aria-label={`${full}점`}>
      <span className="text-star">{'★'.repeat(full)}</span>
      <span className="text-line">{'★'.repeat(5 - full)}</span>
    </span>
  );
}

function FishPlaceholder({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 64 40" fill="none" strokeWidth="1.6" className={className} aria-hidden>
      <path d="M2 20 C16 3, 42 3, 52 20 C42 37, 16 37, 2 20 Z" />
      <path d="M50 20 L63 9 L63 31 Z" />
      <circle cx="18" cy="17" r="2" />
    </svg>
  );
}

function priceWord(priceLevel: number | null) {
  if (priceLevel === 1) return '저렴한 편';
  if (priceLevel === 2) return '중간 가격대';
  if (priceLevel === 3) return '고급 어종';
  return '';
}
