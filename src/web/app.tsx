import { Route, Switch, useLocation } from "wouter";
import { useEffect } from "react";
import { Provider } from "./components/provider";
import Sidebar from "./components/sidebar";
import Player from "./components/player";
import MobileNav from "./components/mobile-nav";
import HomePage from "./pages/index";
import SearchPage from "./pages/search";
import AlbumPage from "./pages/album";
import ArtistPage from "./pages/artist";
import PlaylistPage from "./pages/playlist";
import QueuePage from "./pages/queue";
import LikedPage from "./pages/liked";
import HistoryPage from "./pages/history";
import MyPlaylistPage from "./pages/my-playlist";
import AuthPage from "./pages/auth";
import OnboardingPage from "./pages/onboarding";
import ProfilePage from "./pages/profile";
import LandingPage from "./pages/landing";

function ScrollToTop() {
  const [location] = useLocation();
  const mainRef = document.querySelector("main");
  useEffect(() => {
    mainRef?.scrollTo({ top: 0, behavior: "instant" });
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
      <main className="flex-1 overflow-y-auto relative z-0 md:rounded-lg md:m-2 md:mb-0">
        <ScrollToTop />
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
    </Provider>
  );
}

export default App;
