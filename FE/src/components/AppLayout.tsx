import { useEffect, useRef, useState, type ReactNode } from 'react';
import { BookOpen, CalendarDays, Fish, Heart, Moon, Sun } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useBookmarks } from '../hooks/useBookmarks';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import BookmarkMergeDialog from './BookmarkMergeDialog';
import SearchBar from './SearchBar';

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const { bookmarkCount } = useBookmarks();
  const { accessToken, user, isAuthLoading, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const { pathname } = location;
  const searchParams = new URLSearchParams(location.search);
  const navClassName = (active: boolean) =>
    active
      ? 'flex-none px-0 py-2 text-sm font-semibold text-sea transition'
      : 'flex-none px-0 py-2 text-sm font-semibold text-ink-mute transition hover:text-sea';

  function handleHeaderSearch(value: string) {
    const params = new URLSearchParams();
    if (value) params.set('search', value);
    navigate(`/search${params.toString() ? `?${params.toString()}` : ''}`);
  }

  useEffect(() => {
    setProfileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!profileOpen) return;

    function handlePointerDown(event: MouseEvent) {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (!profileRef.current?.contains(target)) setProfileOpen(false);
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setProfileOpen(false);
    }

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [profileOpen]);

  function handleLogout() {
    logout();
    setProfileOpen(false);
    navigate('/');
  }

  return (
    <div className="flex min-h-screen flex-col bg-mist pb-[68px] font-sans text-ink antialiased md:pb-0">
      <header className="sticky top-0 z-50 border-b border-line bg-surface">
        <div className="mx-auto max-w-content px-4 py-2.5 sm:px-7 md:flex md:min-h-[65px] md:items-center md:gap-7 md:py-3">
          <div className="flex min-h-11 w-full items-center gap-4">
            <Link to="/" className="flex min-h-11 flex-none items-center gap-2 p-0 text-ink transition hover:text-sea focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sea focus-visible:ring-offset-2" aria-label="FishNote 홈">
              <Fish className="h-4 w-[26px] flex-none text-sea" aria-hidden />
              <span className="text-17 font-extrabold leading-none text-ink">FishNote</span>
            </Link>

            <nav className="hidden min-w-0 flex-1 items-center gap-5.5 md:flex">
              <Link
                to="/"
                className={navClassName(pathname === '/' || pathname.startsWith('/fish'))}
              >
                도감
              </Link>
              <Link
                to="/calendar"
                className={navClassName(pathname === '/calendar')}
              >
                제철 캘린더
              </Link>
              <Link
                to="/saved"
                className={`${navClassName(pathname === '/saved')} inline-flex items-center gap-1.5`}
              >
                저장한 도감
                <BookmarkCount count={bookmarkCount} active={pathname === '/saved'} />
              </Link>
            </nav>

            <div className="ml-auto flex flex-none items-center">
            <ThemeToggle />
            {!accessToken || (!isAuthenticated && !isAuthLoading) ? (
              <Link
                to="/login"
                state={{ from: location }}
                className="inline-flex min-h-11 items-center whitespace-nowrap px-2 text-sm font-semibold text-ink-mute transition hover:text-sea focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sea"
              >
                로그인
              </Link>
            ) : null}

            {accessToken && isAuthLoading ? <div className="h-7 w-7 rounded-full bg-sea-soft" aria-hidden /> : null}

            {isAuthenticated && user ? (
              <div ref={profileRef} className="relative">
                <button
                  type="button"
                  aria-haspopup="menu"
                  aria-expanded={profileOpen}
                  aria-label={`${user.nickname} 계정 메뉴`}
                  onClick={() => setProfileOpen((open) => !open)}
                  className="flex h-11 w-11 items-center justify-center rounded-full border-0 bg-sea-soft p-0 text-13 font-extrabold leading-none text-sea transition hover:bg-sea-soft focus:outline-none focus-visible:ring-2 focus-visible:ring-sea focus-visible:ring-offset-2"
                >
                  {getInitial(user.nickname)}
                </button>

                {profileOpen ? (
                  <div
                    role="menu"
                    className="absolute right-0 top-[calc(100%+10px)] z-50 w-[204px] rounded-card border border-line bg-surface py-2 shadow-[0_12px_30px_rgba(26,43,51,0.14)]"
                  >
                    <div className="px-3.5 pb-2 pt-1">
                      <p className="m-0 truncate text-sm font-bold leading-snug text-ink">{user.nickname}</p>
                      <p className="m-0 mt-0.5 truncate text-xs leading-snug text-ink-mute">{user.email ?? '카카오 계정'}</p>
                    </div>
                    <div className="my-1 h-px bg-line" />
                    <Link
                      role="menuitem"
                      to="/saved"
                      onClick={() => setProfileOpen(false)}
                      className="block px-3.5 py-2 text-13 font-semibold text-ink transition hover:bg-mist hover:text-sea"
                    >
                      저장한 도감
                    </Link>
                    <Link
                      role="menuitem"
                      to="/account"
                      onClick={() => setProfileOpen(false)}
                      className="block px-3.5 py-2 text-13 font-semibold text-ink transition hover:bg-mist hover:text-sea"
                    >
                      계정 관리
                    </Link>
                    <button
                      type="button"
                      role="menuitem"
                      onClick={handleLogout}
                      className="block w-full border-0 bg-transparent px-3.5 py-2 text-left text-13 font-semibold text-ink transition hover:bg-mist hover:text-sea"
                    >
                      로그아웃
                    </button>
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>

            <div className="hidden w-[220px] flex-none md:block">
              <SearchBar
                key={`desktop-${location.search}`}
                initialValue={searchParams.get('search') ?? ''}
                placeholder="생선 이름 검색"
                onSubmit={handleHeaderSearch}
                variant="compact"
              />
            </div>
          </div>

          <div className="mt-2 w-full md:hidden">
            <SearchBar
              key={`mobile-${location.search}`}
              initialValue={searchParams.get('search') ?? ''}
              placeholder="생선 이름 검색"
              onSubmit={handleHeaderSearch}
              variant="compact"
            />
          </div>
        </div>
      </header>

      <div className="flex-1">{children}</div>
      <SiteFooter />
      <MobileNavigation pathname={pathname} bookmarkCount={bookmarkCount} />
      <BookmarkMergeDialog />
    </div>
  );
}

function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? '라이트 모드로 전환' : '다크 모드로 전환'}
      title={isDark ? '라이트 모드' : '다크 모드'}
      className="mr-1 flex h-11 w-11 items-center justify-center rounded-full border-0 bg-transparent text-ink-mute transition hover:bg-mist hover:text-sea focus:outline-none focus-visible:ring-2 focus-visible:ring-sea"
    >
      {isDark ? <Sun className="h-[18px] w-[18px]" aria-hidden /> : <Moon className="h-[18px] w-[18px]" aria-hidden />}
    </button>
  );
}

function BookmarkCount({ count, active }: { count: number; active: boolean }) {
  return (
    <span
      className={
        active
          ? 'inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-sea px-1 text-11 font-bold leading-none text-white'
          : 'inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-chipbg px-1 text-11 font-bold leading-none text-ink-mute'
      }
      aria-label={`저장 ${count}개`}
    >
      {count}
    </span>
  );
}

function MobileNavigation({ pathname, bookmarkCount }: { pathname: string; bookmarkCount: number }) {
  const items = [
    { to: '/', label: '도감', icon: BookOpen, active: pathname === '/' || pathname.startsWith('/fish') },
    { to: '/calendar', label: '제철', icon: CalendarDays, active: pathname === '/calendar' },
    { to: '/saved', label: '저장', icon: Heart, active: pathname === '/saved' },
  ];

  return (
    <nav aria-label="모바일 주요 메뉴" className="fixed inset-x-0 bottom-0 z-50 border-t border-line bg-surface/95 px-3 pb-[max(6px,env(safe-area-inset-bottom))] pt-1.5 backdrop-blur md:hidden">
      <div className="mx-auto grid max-w-sm grid-cols-3">
        {items.map(({ to, label, icon: Icon, active }) => (
          <Link
            key={to}
            to={to}
            aria-current={active ? 'page' : undefined}
            className={[
              'relative flex min-h-14 flex-col items-center justify-center gap-1 rounded-btn text-11 font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sea',
              active ? 'text-sea' : 'text-ink-mute hover:bg-mist hover:text-sea',
            ].join(' ')}
          >
            <Icon className={active ? 'h-5 w-5 fill-sea/10' : 'h-5 w-5'} aria-hidden />
            <span>{label}</span>
            {to === '/saved' && bookmarkCount > 0 ? (
              <span className="absolute left-1/2 top-1 ml-2 inline-flex h-[17px] min-w-[17px] items-center justify-center rounded-full bg-sea px-1 text-10 font-bold leading-none text-white" aria-label={`저장 ${bookmarkCount}개`}>
                {bookmarkCount}
              </span>
            ) : null}
          </Link>
        ))}
      </div>
    </nav>
  );
}

function SiteFooter() {
  return (
    <footer className="border-t border-line bg-surface">
      <div className="mx-auto flex max-w-content flex-col gap-3 px-4 py-7 text-12.5 text-ink-mute sm:px-7 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="m-0 font-bold text-ink">FishNote</p>
          <p className="m-0 mt-1">제철과 맛 정보는 지역·유통 환경에 따라 달라질 수 있어요.</p>
        </div>
        <nav aria-label="서비스 정보" className="flex min-h-11 flex-wrap items-center gap-x-5 gap-y-2">
          <Link to="/sources" className="py-2 font-semibold transition hover:text-sea">정보 출처</Link>
          <Link to="/privacy" className="py-2 font-semibold transition hover:text-sea">개인정보처리방침</Link>
          <Link to="/terms" className="py-2 font-semibold transition hover:text-sea">이용약관</Link>
        </nav>
      </div>
    </footer>
  );
}

function getInitial(nickname: string) {
  return Array.from(nickname.trim())[0] ?? '?';
}
