export type TribeType = 'anime' | 'kpop' | 'drama' | 'novel';

export interface Tribe {
  id: string;
  name: string;
  jpOrKrName?: string;
  type: TribeType;
  tagline: string;
  description: string;
  avatar: string;
  coverImage: string;
  followersCount: number;
  spotsCount: number;
  accentColor: string;
  badgeTitle: string;
  badgeIcon: string;
  defaultTemplate: 'anime-split' | 'film-vintage' | 'y2k-cool' | 'cinematic-letterbox';
  isOfficial: boolean;
  isSubscribed: boolean;
}

export interface HolySpot {
  id: string;
  tribeId: string;
  title: string;
  subTitle: string;
  category: '商店' | '餐厅' | '咖啡' | '景点' | '其他';
  members: string[]; // e.g. ['全员', 'Martin', 'James']
  contentType: string; // e.g. '冬日街头画报', '夏日团综野餐', '草坪瑜伽能量', 'MV概念追风'
  city: string;
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  sceneDesc: string;
  animeQuote: string;
  originalSceneImg: string; // The official idol scene picture (1.1, 2.1, 3.1, 4.1)
  shootingTips: string;
  bestTime: string;
  accessGuide: string;
  treasureCount: number;
  checkinCount: number;
  featuredEp?: string;
}

export interface TreasureNote {
  id: string;
  spotId: string;
  tribeId: string;
  author: {
    name: string;
    avatar: string;
    badge?: string;
  };
  content: string;
  photoUrl?: string;
  createdAt: string;
  likes: number;
  likedByMe: boolean;
  isTimeCapsule: boolean;
  unlockAfterDays?: number;
}

export interface CommunityPost {
  id: string;
  tribeId: string;
  spotId?: string;
  spotTitle?: string;
  category: 'checkin' | 'discuss' | 'treasure-story';
  author: {
    name: string;
    avatar: string;
    handle: string;
  };
  timeAgo: string;
  title?: string;
  content: string;
  image?: string;
  templateUsed?: string;
  likes: number;
  commentsCount: number;
  likedByMe: boolean;
  tags: string[];
}

export interface UserProfile {
  name: string;
  handle: string;
  avatar: string;
  bio: string;
  visitedSpotsCount: number;
  notesLeftCount: number;
  badges: {
    id: string;
    tribeId: string;
    title: string;
    icon: string;
    unlockedAt: string;
    desc: string;
  }[];
}

export interface RouteWaypoint {
  id: string;
  name: string;
  type: 'start' | 'spot' | 'custom' | 'end';
  spotId?: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  note?: string;
}

export interface PilgrimageRoute {
  id: string;
  tribeId: string;
  title: string;
  subTitle: string;
  tagline: string;
  coverImage: string;
  author: {
    name: string;
    avatar: string;
  };
  startPoint: RouteWaypoint;
  endPoint: RouteWaypoint;
  waypoints: RouteWaypoint[]; // intermediate stops
  estimatedMinutes: number;
  totalDistanceKm: number;
  popularityCount: number;
  tags: string[];
  description: string;
}

