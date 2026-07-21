import { useState, useCallback } from "react";
import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { UserDataProvider } from "@/contexts/user-data-context";
import LandingPage from "@/pages/landing";
import ProfilesPage from "@/pages/profiles";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Search from "@/pages/search";
import MovieDetail from "@/pages/movie-detail";
import TvDetail from "@/pages/tv-detail";
import PersonDetail from "@/pages/person-detail";
import WatchPage from "@/pages/watch";
import MyListPage from "@/pages/my-list";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
    },
  },
});

type AppStage = "landing" | "profiles" | "app";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/search" component={Search} />
      <Route path="/movie/:id" component={MovieDetail} />
      <Route path="/tv/:id" component={TvDetail} />
      <Route path="/watch/movie/:id" component={WatchPage} />
      <Route path="/watch/tv/:id/:season/:episode" component={WatchPage} />
      <Route path="/person/:id" component={PersonDetail} />
      <Route path="/my-list" component={MyListPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [stage, setStage] = useState<AppStage>(() => {
    const path = window.location.pathname;
    const base = import.meta.env.BASE_URL.replace(/\/$/, "");
    // Watch pages always skip straight to app (new tab)
    if (path.startsWith(base + "/watch/") || path.includes("/watch/")) return "app";
    // Returning user → skip landing + profiles
    try {
      if (localStorage.getItem("ruhflix_seen") === "1") return "app";
    } catch {}
    return "landing";
  });

  const handleWatchNow = useCallback(() => {
    setStage("profiles");
  }, []);

  const handleProfileSelect = useCallback(() => {
    try { localStorage.setItem("ruhflix_seen", "1"); } catch {}
    setStage("app");
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <UserDataProvider>
        <TooltipProvider>
          {stage === "landing" && <LandingPage onWatchNow={handleWatchNow} />}
          {stage === "profiles" && <ProfilesPage onSelect={handleProfileSelect} />}
          {stage === "app" && (
            <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
              <Router />
            </WouterRouter>
          )}
          <Toaster />
        </TooltipProvider>
      </UserDataProvider>
    </QueryClientProvider>
  );
}

export default App;
