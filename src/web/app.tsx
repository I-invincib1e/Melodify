import { Route, Switch, useLocation } from "wouter";
import { useEffect, lazy, Suspense } from "react";
import { Provider } from "./components/provider";
import Sidebar from "./components/sidebar";
import Player from "./components/player";
import MobileNav from "./components/mobile-nav";
import HomePage from "./pages/index";
import AuthPage from "./pages/auth";
import OnboardingPage from "./pages/onboarding";
import LandingPage from "./pages/landing";
import ToastContainer from "./components/toast-container";

// Code-split heavy pages
const SearchPage = lazy(() => import("./pages/search"));
const AlbumPage = lazy(() => import("./pages/album"));
const ArtistPage = lazy(() => import("./pages/artist"));
const PlaylistPage = lazy(() => import("./pages/playlist"));
const QueuePage = lazy(() => import("./pages/queue"));
const LikedPage = lazy(() => import("./pages/liked"));
const HistoryPage = lazy(() => import("./pages/history"));
const MyPlaylistPage = lazy(() => import("./pages/my-playlist"));
const ProfilePage = lazy(() => import("./pages/profile"));

function PageLoader() {
  return (
    <div className="flex items-center justify-center h-[60vh]">
      <div className="w-5 h-5 rounded-full border-2 border-[#1db954] border-t-transparent animate-spin" />
    </div>
  );
}

function ScrollToTop() {
  const [location] = useLocation();
  useEffect(() => {
    document.querySelector("main")?.scrollTo({ top: 0, behavior: "instant" });
  }, [location]);
  return null;
}

const FULLSCREEN_ROUTES = ["/auth", "/onboarding", "/landing"];

function AppShell() {
  const [location] = useLocation();
  const isFullscreen = FULLSCREEN_ROUTES.includes(location);

  if (isFullscreen) {
    return (
      <Switch>
        <Route path="/auth" component={AuthPage} />
        <Route path="/onboarding" component={OnboardingPage} />
        <Route path="/landing" component={LandingPage} />
      </Switch>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden text-foreground">
      <Sidebar />
      <main className="flex-1 overflow-y-auto relative z-0 md:rounded-lg md:m-2 md:mb-0 pb-6 md:pb-0">
        <ScrollToTop />
        <Suspense fallback={<PageLoader />}>
          <Switch>
            <Route path="/" component={HomePage} />
            <Route path="/search" component={SearchPage} />
            <Route path="/album/:id" component={AlbumPage} />
            <Route path="/artist/:id" component={ArtistPage} />
            <Route path="/playlist/:id" component={PlaylistPage} />
            <Route path="/queue" component={QueuePage} />
            <Route path="/liked" component={LikedPage} />
            <Route path="/history" component={HistoryPage} />
            <Route path="/my-playlist/:id" component={MyPlaylistPage} />
            <Route path="/profile" component={ProfilePage} />
            <Route>
              <div className="flex flex-col items-center justify-center h-[60vh] animate-fade-in">
                <p className="text-2xl font-bold text-white mb-2">404</p>
                <p className="text-[#a7a7a7]">Page not found</p>
              </div>
            </Route>
          </Switch>
        </Suspense>
      </main>
      <MobileNav />
      <Player />
    </div>
  );
}

function App() {
  return (
    <Provider>
      <AppShell />
      <ToastContainer />
    </Provider>
  );
}

export default App;
