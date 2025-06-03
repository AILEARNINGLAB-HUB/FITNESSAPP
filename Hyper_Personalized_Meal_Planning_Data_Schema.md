# Hyper-Personalized Meal Planning with Local Grocery Integration: Data Schema Outline

This document outlines a potential data schema for the core entities of the Hyper-Personalized Meal Planning platform. This schema is conceptual and would be refined for a specific database implementation.

## I. User & Profile Data

**1. `Users` Table**
    *   `UserID` (Primary Key, UUID/Auto-increment Int)
    *   `Email` (String, Unique, Indexed)
    *   `PasswordHash` (String)
    *   `FirstName` (String, Optional)
    *   `LastName` (String, Optional)
    *   `RegistrationDate` (Timestamp)
    *   `LastLoginDate` (Timestamp)
    *   `AccountStatus` (Enum: 'active', 'inactive', 'premium')

**2. `UserProfiles` Table (1-to-1 with Users)**
    *   `ProfileID` (Primary Key, Foreign Key to `Users.UserID`)
    *   `HouseholdSizeAdults` (Integer, Default: 1)
    *   `HouseholdSizeChildren` (Integer, Default: 0)
    *   `ChildrenAgeRanges` (Array/JSON, Optional, e.g., ["toddler", "child_5_10"])
    *   `CookingSkillLevel` (Enum: 'beginner', 'intermediate', 'advanced')
    *   `TimeAvailabilityWeekdays` (Integer, minutes for meal prep, Optional)
    *   `TimeAvailabilityWeekends` (Integer, minutes for meal prep, Optional)
    *   `BudgetLevel` (Enum: 'low', 'medium', 'high', Optional)
    *   `PreferredCuisines` (Array/JSON of strings, e.g., ["Italian", "Mexican", "Asian"])
    *   `DislikedIngredients` (Array/JSON of Foreign Keys to `Ingredients.IngredientID` or ingredient names)
    *   `KitchenEquipment` (Array/JSON of strings, e.g., ["oven", "microwave", "blender", "air_fryer"])
    *   `DefaultStorePreference` (Foreign Key to `GroceryStores.StoreID`, Optional)

**3. `UserDietaryRestrictions` Table (Many-to-Many between Users and Diets/Allergens)**
    *   `UserDietaryRestrictionID` (Primary Key)
    *   `UserID` (Foreign Key to `Users.UserID`)
    *   `RestrictionType` (Enum: 'allergy', 'intolerance', 'diet_preference')
    *   `RestrictionName` (String, e.g., "Gluten", "Dairy", "Peanuts", "Vegan", "Keto")
    *   `Severity` (Enum: 'mild', 'moderate', 'severe', Optional for allergies)

**4. `UserHealthGoals` Table (Many-to-Many between Users and HealthGoals)**
    *   `UserHealthGoalID` (Primary Key)
    *   `UserID` (Foreign Key to `Users.UserID`)
    *   `GoalName` (String, e.g., "Weight Loss", "Muscle Gain", "Lower Cholesterol")
    *   `TargetNutrients` (JSON, Optional, e.g., `{"calories_max": 2000, "protein_min_grams": 120}`)

## II. Recipe & Ingredient Data

**1. `Ingredients` Table (Master list of ingredients)**
    *   `IngredientID` (Primary Key, UUID/Auto-increment Int)
    *   `IngredientName` (String, Unique, Indexed)
    *   `StandardUnit` (Enum: 'gram', 'ml', 'unit', Optional - for normalization)
    *   `DefaultCategory` (String, e.g., "Produce", "Dairy", "Meat", "Pantry Staple")
    *   `NutritionalInfoPer100g` (JSON, Optional, e.g., `{"calories": 50, "protein": 2, ...}`)
    *   `CommonAllergens` (Array/JSON of strings, Optional)

**2. `Recipes` Table**
    *   `RecipeID` (Primary Key, UUID/Auto-increment Int)
    *   `RecipeTitle` (String, Indexed)
    *   `Description` (Text)
    *   `Instructions` (Text, or JSON for step-by-step)
    *   `PrepTimeMinutes` (Integer)
    *   `CookTimeMinutes` (Integer)
    *   `Servings` (Integer)
    *   `DifficultyLevel` (Enum: 'easy', 'medium', 'hard')
    *   `CuisineType` (String, e.g., "Italian", "Indian")
    *   `MealType` (Array/JSON, e.g., ["dinner", "lunch"])
    *   `ImageURL` (String, Optional)
    *   `VideoURL` (String, Optional)
    *   `Source` (String, e.g., "Original", "Imported - AllRecipes.com", `Users.UserID` if user-submitted)
    *   `AverageRating` (Float, calculated from `UserRecipeRatings`)
    *   `IsPublic` (Boolean, for user-submitted recipes)
    *   `CreationDate` (Timestamp)
    *   `LastUpdatedDate` (Timestamp)

**3. `RecipeIngredients` Table (Junction table for Recipes and Ingredients)**
    *   `RecipeIngredientID` (Primary Key)
    *   `RecipeID` (Foreign Key to `Recipes.RecipeID`)
    *   `IngredientID` (Foreign Key to `Ingredients.IngredientID`)
    *   `Quantity` (Float)
    *   `Unit` (String, e.g., "grams", "cups", "tbsp", "cloves", "to taste")
    *   `Notes` (String, Optional, e.g., "finely chopped", "ripe")

**4. `RecipeTags` Table (Junction table for Recipes and Tags like "QuickMeal", "FreezerFriendly")**
    *   `RecipeTagID` (Primary Key)
    *   `RecipeID` (Foreign Key to `Recipes.RecipeID`)
    *   `TagName` (String, Indexed)

**5. `UserRecipeRatings` Table**
    *   `RatingID` (Primary Key)
    *   `UserID` (Foreign Key to `Users.UserID`)
    *   `RecipeID` (Foreign Key to `Recipes.RecipeID`)
    *   `Rating` (Integer, 1-5)
    *   `Comment` (Text, Optional)
    *   `DateRated` (Timestamp)

**6. `UserFavoriteRecipes` Table**
    *   `UserFavoriteRecipeID` (Primary Key)
    *   `UserID` (Foreign Key to `Users.UserID`)
    *   `RecipeID` (Foreign Key to `Recipes.RecipeID`)
    *   `DateFavorited` (Timestamp)

## III. Meal Plan Data

**1. `MealPlans` Table**
    *   `MealPlanID` (Primary Key, UUID/Auto-increment Int)
    *   `UserID` (Foreign Key to `Users.UserID`)
    *   `PlanName` (String, Optional, e.g., "Week of Oct 12")
    *   `StartDate` (Date)
    *   `EndDate` (Date)
    *   `CreationDate` (Timestamp)
    *   `LastModifiedDate` (Timestamp)
    *   `Notes` (Text, Optional)

**2. `MealPlanItems` Table (Specific meals within a plan)**
    *   `MealPlanItemID` (Primary Key)
    *   `MealPlanID` (Foreign Key to `MealPlans.MealPlanID`)
    *   `RecipeID` (Foreign Key to `Recipes.RecipeID`)
    *   `DateScheduled` (Date)
    *   `MealType` (Enum: 'breakfast', 'lunch', 'dinner', 'snack')
    *   `ServingsToPrepare` (Integer, defaults from Recipe.Servings but can be adjusted)
    *   `Status` (Enum: 'planned', 'prepared', 'skipped')

## IV. Grocery & Pantry Data

**1. `GroceryLists` Table**
    *   `GroceryListID` (Primary Key, UUID/Auto-increment Int)
    *   `MealPlanID` (Foreign Key to `MealPlans.MealPlanID`, Optional, can be standalone)
    *   `UserID` (Foreign Key to `Users.UserID`)
    *   `ListName` (String, Optional)
    *   `CreationDate` (Timestamp)
    *   `StoreID` (Foreign Key to `GroceryStores.StoreID`, if list is store-specific)

**2. `GroceryListItems` Table**
    *   `GroceryListItemID` (Primary Key)
    *   `GroceryListID` (Foreign Key to `GroceryLists.GroceryListID`)
    *   `IngredientID` (Foreign Key to `Ingredients.IngredientID`)
    *   `RecipeIngredientID` (Foreign Key to `RecipeIngredients.RecipeIngredientID`, Optional, for traceability)
    *   `Quantity` (Float)
    *   `Unit` (String)
    *   `IsPurchased` (Boolean, Default: false)
    *   `Notes` (String, Optional, e.g., "Brand preference: X")
    *   `MatchedStoreID` (Foreign Key to `GroceryStoreProducts.ProductID`, Optional, if matched to a store item)
    *   `IsCustom` (Boolean, Default: false, if user added manually)

**3. `UserPantryItems` Table (Optional Feature)**
    *   `PantryItemID` (Primary Key)
    *   `UserID` (Foreign Key to `Users.UserID`)
    *   `IngredientID` (Foreign Key to `Ingredients.IngredientID`)
    *   `Quantity` (Float)
    *   `Unit` (String)
    *   `PurchaseDate` (Date, Optional)
    *   `ExpiryDate` (Date, Optional)
    *   `LastUpdated` (Timestamp)

**4. `GroceryStores` Table (Stores supported for integration)**
    *   `StoreID` (Primary Key, UUID/Auto-increment Int)
    *   `StoreName` (String, e.g., "Kroger - Elm Street", "Walmart Supercenter #123")
    *   `ProviderName` (String, e.g., "Instacart", "KrogerAPI", "WalmartAPI")
    *   `ApiEndpoint` (String, Optional)
    *   `Location` (Geography/JSON, Optional)
    *   `SupportedFeatures` (Array/JSON, e.g., ["cart_integration", "price_lookup", "inventory_check"])

**5. `GroceryStoreProducts` Table (Optional, if caching product data from stores)**
    *   `ProductID` (Primary Key, String/UUID, ideally store's own product ID)
    *   `StoreID` (Foreign Key to `GroceryStores.StoreID`)
    *   `ProductName` (String)
    *   `Brand` (String, Optional)
    *   `Price` (Decimal)
    *   `Size` (String, e.g., "16 oz", "500g")
    *   `SKU` (String, Optional)
    *   `UPC` (String, Optional, Indexed for matching)
    *   `NutritionalInfo` (JSON, Optional)
    *   `LastFetched` (Timestamp)
    *   `IngredientID` (Foreign Key to `Ingredients.IngredientID`, Optional, for mapping store products to standardized ingredients)

This schema provides a detailed foundation. Indexing, normalization/denormalization choices (e.g., for nutritional totals in meal plans), and handling of units/conversions would require further attention during detailed design. The `GroceryStoreProducts` table, in particular, would be complex to maintain due to reliance on external APIs and data freshness.
