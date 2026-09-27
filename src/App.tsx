import React, { useState } from 'react';
import {
  INITIAL_TRIBES,
  INITIAL_SPOTS,
  INITIAL_TREASURE_NOTES,
  INITIAL_POSTS,
  INITIAL_USER,
  INITIAL_ROUTES,
} from './data/mockData';
import {
  Tribe,
  HolySpot,
  TreasureNote,
  CommunityPost,
  UserProfile,
  PilgrimageRoute,
} from './types';
import { MobileFrame } from './components/MobileFrame';
import { HeaderTribeBar } from './components/HeaderTribeBar';
import { TribeSquareModal } from './components/TribeSquareModal';
import { MapPilgrimage } from './components/MapPilgrimage';
import { TreasureHuntView } from './components/TreasureHuntView';
import { CheckinGeneratorModal } from './components/CheckinGeneratorModal';
import { CommunityFeed } from './components/CommunityFeed';
import { ProfileView } from './components/ProfileView';
import { RouteWaterfallFeed } from './components/RouteWaterfallFeed';
import { RoutePlannerModal } from './components/RoutePlannerModal';

export default function App() {
  // Navigation tab: discover | map | community | profile
  const [activeNavTab, setActiveNavTab] = useState<'discover' | 'map' | 'community' | 'profile'>('discover');
  const [isFramedView, setIsFramedView] = useState(true);

  // Tribes state (Default active: Cortis)
  const [tribes, setTribes] = useState<Tribe[]>(INITIAL_TRIBES);
  const [activeTribe, setActiveTribe] = useState<Tribe>(INITIAL_TRIBES[0]);
  const [isTribeSquareOpen, setIsTribeSquareOpen] = useState(false);

  // Spots state
  const [spots, setSpots] = useState<HolySpot[]>(INITIAL_SPOTS);
  const [selectedSpot, setSelectedSpot] = useState<HolySpot | null>(INITIAL_SPOTS[0]);

  // Routes state
  const [routes, setRoutes] = useState<PilgrimageRoute[]>(INITIAL_ROUTES);
  const [activeRoute, setActiveRoute] = useState<PilgrimageRoute | null>(INITIAL_ROUTES[0]);
  const [isRoutePlannerOpen, setIsRoutePlannerOpen] = useState(false);

  // Notes state
  const [notes, setNotes] = useState<TreasureNote[]>(INITIAL_TREASURE_NOTES);
  const [myNotes, setMyNotes] = useState<TreasureNote[]>([]);

  // Community posts state
  const [posts, setPosts] = useState<CommunityPost[]>(INITIAL_POSTS);

  // User Profile state
  const [user, setUser] = useState<UserProfile>(INITIAL_USER);

  // User simulated GPS coordinates (Default: near Sinsa 2 overpass)
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number }>({
    lat: 37.5206,
    lng: 127.0229,
  });

  // Search query in top bar
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [isTreasureModalOpen, setIsTreasureModalOpen] = useState(false);
  const [isCheckinModalOpen, setIsCheckinModalOpen] = useState(false);
  const [modalTargetSpot, setModalTargetSpot] = useState<HolySpot>(INITIAL_SPOTS[0]);

  // Current tribe's spots
  const currentTribeSpots = spots.filter((s) => s.tribeId === activeTribe.id);

  // Tribe Switcher handler
  const handleSelectTribe = (newTribe: Tribe) => {
    setActiveTribe(newTribe);
    const tribeSpots = spots.filter((s) => s.tribeId === newTribe.id);
    if (tribeSpots.length > 0) {
      setSelectedSpot(tribeSpots[0]);
      setUserCoords({
        lat: tribeSpots[0].coordinates.lat + 0.0001,
        lng: tribeSpots[0].coordinates.lng + 0.0001,
      });
    }

    // Switch active route if matching tribe route exists
    const matchingRoute = routes.find((r) => r.tribeId === newTribe.id);
    if (matchingRoute) {
      setActiveRoute(matchingRoute);
    }
  };

  const handleToggleSubscribe = (tribeId: string) => {
    setTribes((prev) =>
      prev.map((t) =>
        t.id === tribeId ? { ...t, isSubscribed: !t.isSubscribed } : t
      )
    );
  };

  const handleAddCustomTribe = (newTribe: Tribe) => {
    setTribes((prev) => [newTribe, ...prev]);
    const newSpot: HolySpot = {
      id: `spot-${Date.now()}`,
      tribeId: newTribe.id,
      title: `${newTribe.name.split(' ')[0]} 巡礼始发站`,
      subTitle: 'First Holy Spot Point',
      category: '景点',
      members: ['全员'],
      contentType: '粉丝共建始发站',
      city: '韩国 · 首尔实景',
      address: '粉丝共建提交坐标',
      coordinates: { lat: 37.5445, lng: 127.056 },
      sceneDesc: newTribe.description,
      animeQuote: newTribe.tagline,
      originalSceneImg: newTribe.coverImage,
      shootingTips: '请携带应援手幅或周边，注意文明巡礼。',
      bestTime: '全天均可',
      accessGuide: '周边公共交通直达。',
      treasureCount: 1,
      checkinCount: 1,
      featuredEp: '粉丝推荐机位',
    };
    setSpots((prev) => [newSpot, ...prev]);
  };

  // Route reuse handler (from Waterfall Feed)
  const handleReuseRoute = (route: PilgrimageRoute) => {
    setActiveRoute(route);
    // If the route belongs to another tribe, switch active tribe
    const targetTribe = tribes.find((t) => t.id === route.tribeId);
    if (targetTribe && targetTribe.id !== activeTribe.id) {
      setActiveTribe(targetTribe);
    }
    // Set selected spot to the first waypoint
    const firstSpot = spots.find((s) => s.id === route.waypoints[0]?.spotId);
    if (firstSpot) {
      setSelectedSpot(firstSpot);
      setUserCoords({
        lat: firstSpot.coordinates.lat + 0.0001,
        lng: firstSpot.coordinates.lng + 0.0001,
      });
    }
    // Automatically switch view to Map mode to show active navigation!
    setActiveNavTab('map');
  };

  // Route apply handler (from Route Planner)
  const handleApplyRoute = (updatedRoute: PilgrimageRoute) => {
    setActiveRoute(updatedRoute);
    setRoutes((prev) => {
      const idx = prev.findIndex((r) => r.id === updatedRoute.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = updatedRoute;
        return copy;
      }
      return [updatedRoute, ...prev];
    });
    setActiveNavTab('map');
  };

  // Treasure Notes Handlers
  const handleAddNote = (newNote: TreasureNote) => {
    setNotes((prev) => [newNote, ...prev]);
    setMyNotes((prev) => [newNote, ...prev]);
    setUser((prev) => {
      const hasBadge = prev.badges.some((b) => b.tribeId === activeTribe.id);
      const newBadges = hasBadge
        ? prev.badges
        : [
            ...prev.badges,
            {
              id: `badge-${Date.now()}`,
              tribeId: activeTribe.id,
              title: activeTribe.badgeTitle,
              icon: activeTribe.badgeIcon,
              unlockedAt: '刚刚',
              desc: `在${activeTribe.name}部落圣地留下实地寻宝纸条`,
            },
          ];
      return {
        ...prev,
        notesLeftCount: prev.notesLeftCount + 1,
        badges: newBadges,
      };
    });
    setSpots((prev) =>
      prev.map((s) =>
        s.id === newNote.spotId
          ? { ...s, treasureCount: s.treasureCount + 1 }
          : s
      )
    );
  };

  const handleLikeNote = (noteId: string) => {
    setNotes((prev) =>
      prev.map((n) =>
        n.id === noteId
          ? {
              ...n,
              likes: n.likedByMe ? n.likes - 1 : n.likes + 1,
              likedByMe: !n.likedByMe,
            }
          : n
      )
    );
  };

  // Community Posts Handlers
  const handlePublishPost = (newPost: CommunityPost) => {
    setPosts((prev) => [newPost, ...prev]);
    setUser((prev) => ({
      ...prev,
      visitedSpotsCount: prev.visitedSpotsCount + 1,
    }));
    if (newPost.spotId) {
      setSpots((prev) =>
        prev.map((s) =>
          s.id === newPost.spotId
            ? { ...s, checkinCount: s.checkinCount + 1 }
            : s
        )
      );
    }
    setActiveNavTab('community');
  };

  const handleLikePost = (postId: string) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? {
              ...p,
              likes: p.likedByMe ? p.likes - 1 : p.likes + 1,
              likedByMe: !p.likedByMe,
            }
          : p
      )
    );
  };

  const handleOpenCheckin = (spot: HolySpot) => {
    setModalTargetSpot(spot);
    setIsCheckinModalOpen(true);
  };

  const handleOpenTreasure = (spot: HolySpot) => {
    setModalTargetSpot(spot);
    setIsTreasureModalOpen(true);
  };

  return (
    <MobileFrame
      activeNavTab={activeNavTab}
      onNavTabChange={(tab) => setActiveNavTab(tab)}
      isFramedView={isFramedView}
      onToggleFramedView={() => setIsFramedView(!isFramedView)}
      onQuickCheckin={() => {
        if (currentTribeSpots.length > 0) {
          handleOpenCheckin(selectedSpot || currentTribeSpots[0]);
        }
      }}
    >
      {/* Top Tribe Story / Switcher Bar (Available across views) */}
      <HeaderTribeBar
        tribes={tribes}
        activeTribe={activeTribe}
        onSelectTribe={handleSelectTribe}
        onOpenTribeSquare={() => setIsTribeSquareOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Main Tab Views */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Tab 1: Discover Waterfall Feed (Holy Spots of Current Tribe) */}
        {activeNavTab === 'discover' && (
          <div className="flex-1 overflow-y-auto bg-[#f5f7f6]">
            <RouteWaterfallFeed
              spots={currentTribeSpots}
              activeTribe={activeTribe}
              notes={notes}
              onSelectSpot={(spot) => {
                setSelectedSpot(spot);
                setActiveNavTab('map');
              }}
              onOpenCheckin={handleOpenCheckin}
              onOpenTreasure={handleOpenTreasure}
              onLikeNote={handleLikeNote}
              searchQuery={searchQuery}
              userCoords={userCoords}
            />
          </div>
        )}

        {/* Tab 2: Map & Route Navigation */}
        {activeNavTab === 'map' && (
          <MapPilgrimage
            activeTribe={activeTribe}
            spots={currentTribeSpots}
            selectedSpot={selectedSpot}
            onSelectSpot={(spot) => setSelectedSpot(spot)}
            userCoords={userCoords}
            onSimulateCoords={(coords) => setUserCoords(coords)}
            onOpenCheckinModal={handleOpenCheckin}
            onOpenTreasureModal={handleOpenTreasure}
            routes={routes}
            activeRoute={activeRoute}
            onSelectRoute={(route) => setActiveRoute(route)}
            onOpenRoutePlanner={() => setIsRoutePlannerOpen(true)}
            onClearActiveRoute={() => setActiveRoute(null)}
          />
        )}

        {/* Tab 3: Tribe Community Feed */}
        {activeNavTab === 'community' && (
          <CommunityFeed
            activeTribe={activeTribe}
            posts={posts}
            onLikePost={handleLikePost}
            onAddPost={handlePublishPost}
          />
        )}

        {/* Tab 4: User Profile & Pilgrimage Passport */}
        {activeNavTab === 'profile' && (
          <ProfileView
            user={user}
            tribes={tribes}
            posts={posts}
            myNotes={myNotes}
          />
        )}
      </div>

      {/* Tribe Square Modal */}
      <TribeSquareModal
        isOpen={isTribeSquareOpen}
        onClose={() => setIsTribeSquareOpen(false)}
        tribes={tribes}
        activeTribe={activeTribe}
        onSelectTribe={handleSelectTribe}
        onToggleSubscribe={handleToggleSubscribe}
        onAddCustomTribe={handleAddCustomTribe}
      />

      {/* Route Planner Modal (Start/End selection, auto optimization, waypoint add/remove/reorder) */}
      <RoutePlannerModal
        isOpen={isRoutePlannerOpen}
        onClose={() => setIsRoutePlannerOpen(false)}
        activeTribe={activeTribe}
        spots={currentTribeSpots}
        activeRoute={activeRoute}
        onApplyRoute={handleApplyRoute}
        userCoords={userCoords}
      />

      {/* LBS Treasure Hunt Modal */}
      <TreasureHuntView
        isOpen={isTreasureModalOpen}
        onClose={() => setIsTreasureModalOpen(false)}
        spot={modalTargetSpot}
        tribe={activeTribe}
        notes={notes}
        userCoords={userCoords}
        onSimulateAtSpot={() => {
          setUserCoords({
            lat: modalTargetSpot.coordinates.lat + 0.0001,
            lng: modalTargetSpot.coordinates.lng + 0.0001,
          });
        }}
        onAddNote={handleAddNote}
        onLikeNote={handleLikeNote}
      />

      {/* AI Post-Processing & RedBook Check-in Modal */}
      <CheckinGeneratorModal
        isOpen={isCheckinModalOpen}
        onClose={() => setIsCheckinModalOpen(false)}
        spot={modalTargetSpot}
        tribe={activeTribe}
        onPublishPost={handlePublishPost}
      />
    </MobileFrame>
  );
}
