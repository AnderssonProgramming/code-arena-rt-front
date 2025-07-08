// User interfaces
export interface User {
  id?: string;
  username: string;
  email: string;
  profile: UserProfile;
  stats: UserStats;
  settings: UserSettings;
  createdAt?: Date;
  lastLoginAt?: Date;
  isActive?: boolean;
}

export interface UserProfile {
  displayName?: string;
  avatar?: string;
  level: number;
  experience: number;
}

export interface UserStats {
  gamesPlayed: number;
  gamesWon: number;
  averageScore: number;
  totalPlayTime: number;
  bestStreak: number;
  currentStreak: number;
  winRate: number;
}

export interface UserSettings {
  notifications: boolean;
  soundEnabled: boolean;
  theme: string;
}

// Auth interfaces
export interface LoginRequest {
  usernameOrEmail: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  displayName?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
  expiresIn: number;
}

// Game interfaces
export interface Game {
  id?: string;
  hostId: string;
  players: GamePlayer[];
  challenges: GameChallenge[];
  status: GameStatus;
  settings?: GameSettings;
  currentRound: number;
  startedAt?: Date;
  finishedAt?: Date;
  results?: GameResults;
}

export interface GamePlayer {
  userId: string;
  username: string;
  score: number;
  totalAnswers: number;
  correctAnswers: number;
  currentStreak: number;
  bestStreak: number;
  lastAnswerAt?: Date;
  hasAnswered: boolean;
  responseTime: number;
  isReady: boolean;
}

export interface GameChallenge {
  challengeId: string;
  startedAt: Date;
  duration: number;
  isCompleted: boolean;
  responses: ChallengeResponse[];
}

export interface ChallengeResponse {
  playerId: string;
  answer: string;
  submittedAt: Date;
  isCorrect: boolean;
  timeToAnswer: number;
  pointsEarned: number;
}

export interface Challenge {
  id?: string;
  title: string;
  description: string;
  type: ChallengeType;
  difficulty: ChallengeDifficulty;
  category: string;
  timeLimit: number;
  baseScore: number;
  question: string;
  options?: string[];
  correctAnswer: string;
  hints?: string[];
  explanation?: string;
  tags: string[];
  isActive: boolean;
  createdAt?: Date;
  createdBy?: string;
}

// Room interfaces
export interface Room {
  id?: string;
  name: string;
  description?: string;
  hostId: string;
  hostUsername: string;
  ownerId: string;
  players: RoomPlayer[];
  currentPlayers: RoomPlayer[];
  gameConfig: GameConfig;
  status: RoomStatus;
  createdAt?: Date;
  maxPlayers: number;
  isPrivate: boolean;
  password?: string;
}

export interface RoomPlayer {
  userId: string;
  username: string;
  isReady: boolean;
  joinedAt: Date;
  avatar?: string;
  level: number;
}

export interface GameConfig {
  gameType: GameType;
  maxPlayers: number;
  difficulty: ChallengeDifficulty;
  gameMode: GameMode;
  timePerChallenge: number;
  timeLimit: number;
  totalChallenges: number;
  isPublic: boolean;
}

// Enums
export enum GameStatus {
  WAITING = 'WAITING',
  STARTING = 'STARTING',
  IN_PROGRESS = 'IN_PROGRESS',
  PAUSED = 'PAUSED',
  FINISHED = 'FINISHED',
  CANCELLED = 'CANCELLED'
}

export enum RoomStatus {
  WAITING = 'WAITING',
  STARTING = 'STARTING',
  IN_PROGRESS = 'IN_PROGRESS',
  IN_GAME = 'IN_GAME',
  FINISHED = 'FINISHED'
}

export enum ChallengeType {
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
  TRUE_FALSE = 'TRUE_FALSE',
  FILL_BLANK = 'FILL_BLANK',
  CROSSWORD = 'CROSSWORD',
  WORD_SEARCH = 'WORD_SEARCH',
  SUDOKU = 'SUDOKU',
  CODING = 'CODING',
  MATH_PUZZLE = 'MATH_PUZZLE'
}

export enum GameType {
  SUDOKU = 'SUDOKU',
  CROSSWORD = 'CROSSWORD',
  WORD_SEARCH = 'WORD_SEARCH',
  MATH_PUZZLE = 'MATH_PUZZLE',
  CODE_CHALLENGE = 'CODE_CHALLENGE'
}

export enum ChallengeDifficulty {
  EASY = 'EASY',
  MEDIUM = 'MEDIUM',
  HARD = 'HARD',
  EXPERT = 'EXPERT'
}

export enum GameMode {
  CLASSIC = 'CLASSIC',
  BLITZ = 'BLITZ',
  SURVIVAL = 'SURVIVAL',
  TOURNAMENT = 'TOURNAMENT'
}

export enum ScoringMode {
  STANDARD = 'STANDARD',
  TIME_BASED = 'TIME_BASED',
  STREAK_BONUS = 'STREAK_BONUS',
  ELIMINATION = 'ELIMINATION'
}

// Results interfaces
export interface GameResults {
  playerResults: PlayerResult[];
  winner?: string;
  totalRounds: number;
  gameStats: GameStatsResults;
}

export interface PlayerResult {
  userId: string;
  username: string;
  score: number;
  correctAnswers: number;
  totalAnswers: number;
  averageResponseTime: number;
  rank: number;
}

export interface GameStatsResults {
  averageScore: number;
  fastestAnswer: number;
  hardestQuestion?: string;
}

export interface GameSettings {
  roundCount: number;
  timeLimit: number;
  scoringMode: ScoringMode;
  difficulty?: string;
  allowHints: boolean;
  showResults: boolean;
}

// Game Session interface for active game instances
export interface GameSession {
  id: string;
  roomId: string;
  gameType: GameType;
  participants: GamePlayer[];
  status: GameStatus;
  currentRound: number;
  maxRounds: number;
  timeLimit: number;
  startedAt: Date;
  endedAt?: Date;
  winnerId?: string;
  userScore: number;
  duration: number;
  gameData?: any; // Specific game data (sudoku board, crossword, etc.)
  settings: GameSettings;
  leaderboard: PlayerResult[];
}

// Game statistics interface
export interface GameStats {
  totalGames: number;
  wins: number;
  losses: number;
  winRate: number;
  averageScore: number;
  bestScore: number;
  totalPlayTime: number;
  averageGameDuration: number;
  favoriteGameType?: GameType;
  currentStreak: number;
  bestStreak: number;
  recentGames: GameSession[];
}

// WebSocket Messages
export interface WebSocketMessage {
  type: string;
  data: any;
  timestamp: Date;
}

export interface RoomJoinMessage {
  roomId: string;
  userId: string;
  username: string;
}

export interface RoomLeaveMessage {
  roomId: string;
  userId: string;
}

export interface ChatMessage {
  roomId: string;
  userId: string;
  username: string;
  message: string;
  timestamp: Date;
}

export interface GameStartMessage {
  gameId: string;
  roomId: string;
}

export interface GameAnswerMessage {
  gameId: string;
  userId: string;
  answer: string;
  timeToAnswer: number;
}

export interface PlayerReadyMessage {
  roomId: string;
  userId: string;
  isReady: boolean;
}
