# Gamified Social Fitness Challenges: Data Schema Outline

This document outlines a potential data schema for the core entities of the Gamified Social Fitness Challenges platform. This schema is conceptual and would be refined for a specific database implementation.

## I. User & Profile Data

**1. `Users` Table**
    *   `UserID` (Primary Key, UUID/Auto-increment Int)
    *   `Username` (String, Unique, Indexed)
    *   `Email` (String, Unique, Indexed, Optional if using phone number login)
    *   `PhoneNumber` (String, Unique, Indexed, Optional if using email login)
    *   `PasswordHash` (String)
    *   `DisplayName` (String)
    *   `ProfilePictureURL` (String, Optional)
    *   `RegistrationDate` (Timestamp)
    *   `LastLoginDate` (Timestamp)
    *   `AccountStatus` (Enum: 'active', 'inactive', 'suspended')
    *   `PrivacySettings` (JSON, e.g., `{"profile_visibility": "friends", "activity_sharing": "public"}`)

**2. `UserProfiles` Table (1-to-1 with Users, or extend Users table)**
    *   `ProfileID` (Primary Key, Foreign Key to `Users.UserID`)
    *   `Bio` (Text, Optional)
    *   `Location` (String, Optional)
    *   `DateOfBirth` (Date, Optional - for age-related features, consider privacy)
    *   `FitnessLevel` (Enum: 'beginner', 'intermediate', 'advanced', Optional)
    *   `Interests` (Array/JSON of strings, e.g., ["running", "cycling", "yoga"], Optional)

**3. `UserConnections` Table (Friendships - Many-to-Many through this table)**
    *   `ConnectionID` (Primary Key, UUID/Auto-increment Int)
    *   `UserID_Requester` (Foreign Key to `Users.UserID`)
    *   `UserID_Accepter` (Foreign Key to `Users.UserID`)
    *   `Status` (Enum: 'pending', 'accepted', 'blocked')
    *   `CreationDate` (Timestamp)
    *   `AcceptedDate` (Timestamp, Optional)
    *   *Index on (UserID_Requester, UserID_Accepter) for quick lookups*

**4. `UserLinkedAccounts` Table (For fitness trackers/apps)**
    *   `LinkedAccountID` (Primary Key, UUID/Auto-increment Int)
    *   `UserID` (Foreign Key to `Users.UserID`)
    *   `ProviderName` (String, e.g., 'Fitbit', 'Strava', 'GoogleFit', 'AppleHealth')
    *   `ProviderUserID` (String, User's ID on the external platform)
    *   `AccessToken` (String, Encrypted)
    *   `RefreshToken` (String, Encrypted, Optional)
    *   `Scopes` (Array/JSON of strings, permissions granted)
    *   `LastSyncDate` (Timestamp, Optional)
    *   `IsEnabled` (Boolean, Default: true)

## II. Activity Data

**1. `Activities` Table (Stores individual fitness activities)**
    *   `ActivityID` (Primary Key, UUID/Auto-increment Int)
    *   `UserID` (Foreign Key to `Users.UserID`)
    *   `ActivityType` (Enum: 'running', 'walking', 'cycling', 'swimming', 'gym_workout', 'other')
    *   `Source` (Enum: 'manual', 'fitbit', 'strava', 'apple_health', etc.)
    *   `ExternalActivityID` (String, Optional, ID from the source platform)
    *   `StartTime` (Timestamp)
    *   `EndTime` (Timestamp)
    *   `DurationSeconds` (Integer)
    *   `DistanceMeters` (Float, Optional)
    *   `Steps` (Integer, Optional)
    *   `CaloriesBurned` (Float, Optional)
    *   `ElevationGainMeters` (Float, Optional)
    *   `AverageHeartRate` (Integer, Optional)
    *   `RawDataURL` (String, Optional, e.g., link to GPX file if stored)
    *   `Notes` (Text, Optional)
    *   `CreationDate` (Timestamp, when it was recorded in this system)

## III. Challenge Data

**1. `Challenges` Table**
    *   `ChallengeID` (Primary Key, UUID/Auto-increment Int)
    *   `ChallengeName` (String)
    *   `ChallengeDescription` (Text)
    *   `ChallengeType` (Enum: 'individual_goal', 'head_to_head', 'team_vs_team', 'team_collaborative', 'streak', 'virtual_journey')
    *   `ActivityMetric` (Enum: 'steps', 'distance', 'active_minutes', 'calories_burned', 'elevation_gain', 'specific_workout_count')
    *   `GoalValue` (Float, Optional, e.g., 100000 steps, 50 km)
    *   `StartTime` (Timestamp)
    *   `EndTime` (Timestamp)
    *   `CreatorUserID` (Foreign Key to `Users.UserID`, Optional for system-generated challenges)
    *   `Visibility` (Enum: 'public', 'private', 'friends_only')
    *   `MaxParticipants` (Integer, Optional)
    *   `Status` (Enum: 'upcoming', 'active', 'completed', 'cancelled')
    *   `VirtualJourneyMapID` (Foreign Key to `VirtualJourneyMaps.MapID`, Optional, if type is 'virtual_journey')
    *   `TeamSizeMin` (Integer, Optional, for team challenges)
    *   `TeamSizeMax` (Integer, Optional, for team challenges)

**2. `ChallengeParticipants` Table**
    *   `ParticipantID` (Primary Key, UUID/Auto-increment Int)
    *   `ChallengeID` (Foreign Key to `Challenges.ChallengeID`)
    *   `UserID` (Foreign Key to `Users.UserID`)
    *   `TeamID` (Foreign Key to `ChallengeTeams.TeamID`, Optional)
    *   `JoinDate` (Timestamp)
    *   `Status` (Enum: 'joined', 'left', 'invited')
    *   `Progress` (Float, current value towards the goal for this participant in this challenge)
    *   `LastUpdated` (Timestamp, for progress)

**3. `ChallengeTeams` Table (For team-based challenges)**
    *   `TeamID` (Primary Key, UUID/Auto-increment Int)
    *   `ChallengeID` (Foreign Key to `Challenges.ChallengeID`)
    *   `TeamName` (String)
    *   `TeamCaptainUserID` (Foreign Key to `Users.UserID`, Optional)
    *   `TeamProgress` (Float, current aggregate value for the team)
    *   `CreationDate` (Timestamp)

**4. `VirtualJourneyMaps` Table (For virtual journey challenges)**
    *   `MapID` (Primary Key, UUID/Auto-increment Int)
    *   `MapName` (String, e.g., "Mount Everest Climb", "Great Wall Path")
    *   `TotalDistanceOrElevation` (Float)
    *   `MapData` (JSON, e.g., waypoints, image URLs for map segments)

## IV. Gamification Data

**1. `UserPoints` Table**
    *   `PointID` (Primary Key, UUID/Auto-increment Int)
    *   `UserID` (Foreign Key to `Users.UserID`)
    *   `PointsEarned` (Integer)
    *   `SourceType` (Enum: 'activity_completion', 'challenge_win', 'badge_unlock', 'daily_login', 'manual_adjustment')
    *   `SourceID` (UUID/Int, e.g., ActivityID, ChallengeID, BadgeID)
    *   `TransactionDate` (Timestamp)
    *   `Description` (String, Optional)
    *   *Consider a separate `UserTotalPoints` table or denormalized sum on `Users` for quick leaderboard/profile display.*

**2. `Badges` Table (Master list of available badges)**
    *   `BadgeID` (Primary Key, UUID/Auto-increment Int)
    *   `BadgeName` (String, Unique)
    *   `BadgeDescription` (Text)
    *   `IconURL` (String)
    *   `Criteria` (JSON, e.g., `{"type": "steps_total", "value": 100000}` or `{"type": "challenge_wins", "value": 5}`)

**3. `UserBadges` Table (Badges earned by users)**
    *   `UserBadgeID` (Primary Key, UUID/Auto-increment Int)
    *   `UserID` (Foreign Key to `Users.UserID`)
    *   `BadgeID` (Foreign Key to `Badges.BadgeID`)
    *   `DateEarned` (Timestamp)

**4. `Leaderboards` Table (Could be dynamically generated or snapshots)**
    *   `LeaderboardID` (Primary Key, UUID/Auto-increment Int)
    *   `ChallengeID` (Foreign Key to `Challenges.ChallengeID`, if challenge-specific)
    *   `LeaderboardType` (Enum: 'overall_points', 'challenge_progress', 'weekly_steps', etc.)
    *   `Timeframe` (Enum: 'all_time', 'weekly', 'monthly', 'custom_challenge_duration')
    *   `GeneratedDate` (Timestamp)
    *   `Data` (JSON, storing ranked list of UserID and scores, e.g., `[{"UserID": "uuid1", "score": 1500, "rank": 1}, ...]`)

**5. `VirtualCurrencyTransactions` Table**
    *   `TransactionID` (Primary Key, UUID/Auto-increment Int)
    *   `UserID` (Foreign Key to `Users.UserID`)
    *   `Amount` (Integer, positive for earning, negative for spending)
    *   `TransactionType` (Enum: 'earned_challenge', 'spent_cosmetic', 'daily_bonus')
    *   `ItemID` (UUID/Int, Optional, if currency spent on an item)
    *   `TransactionDate` (Timestamp)
    *   `Description` (String, Optional)
    *   *Consider a `UserVirtualCurrencyBalance` table or denormalized sum on `Users`.*

## V. Social Interaction Data

**1. `FeedItems` Table**
    *   `FeedItemID` (Primary Key, UUID/Auto-increment Int)
    *   `UserID` (Foreign Key to `Users.UserID`, the user whose action generated this feed item)
    *   `ItemType` (Enum: 'activity_shared', 'challenge_joined', 'challenge_completed', 'badge_earned', 'level_up', 'custom_post')
    *   `ReferenceID` (UUID/Int, e.g., ActivityID, ChallengeID, BadgeID)
    *   `ContentText` (Text, Optional, for custom posts)
    *   `MediaURL` (String, Optional, for custom posts with images/videos)
    *   `CreationDate` (Timestamp)
    *   `Visibility` (Enum: 'public', 'friends', 'private_group_for_challenge')

**2. `FeedItemReactions` Table (Likes/Kudos)**
    *   `ReactionID` (Primary Key, UUID/Auto-increment Int)
    *   `FeedItemID` (Foreign Key to `FeedItems.FeedItemID`)
    *   `UserID` (Foreign Key to `Users.UserID`, who reacted)
    *   `ReactionType` (Enum: 'like', 'kudos', 'celebrate', etc.)
    *   `CreationDate` (Timestamp)

**3. `FeedItemComments` Table**
    *   `CommentID` (Primary Key, UUID/Auto-increment Int)
    *   `FeedItemID` (Foreign Key to `FeedItems.FeedItemID`)
    *   `UserID` (Foreign Key to `Users.UserID`, who commented)
    *   `ParentCommentID` (Foreign Key to `FeedItemComments.CommentID`, for threaded comments, Optional)
    *   `CommentText` (Text)
    *   `CreationDate` (Timestamp)

This schema provides a comprehensive starting point. Indexing strategies, denormalization for performance (especially for leaderboards and feeds), and choice of specific data types would be critical during detailed database design. Consideration for data archiving or deletion policies for large datasets like raw activity data or old feed items would also be needed.
