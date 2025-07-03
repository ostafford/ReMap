# Onboarding Architecture Flow

## Overview

This document explains the refactored onboarding architecture that follows React best practices and provides better maintainability, testability, and performance.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    MAIN FILES (UI)                          │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │ onboarding/     │  │ onboarding/     │  │ onboarding/  │ │
│  │ index.tsx       │  │ starterpack.tsx │  │ account.tsx  │ │
│  └─────────────────┘  └─────────────────┘  └──────────────┘ │
│           │                    │                    │       │
│           └────────────────────┼────────────────────┘       │
│                                │                            │
└────────────────────────────────┼────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────-┐
│                COORDINATOR FILE                              │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ useOnboardingForm.ts (orchestrates everything)          │ │
│  └─────────────────────────────────────────────────────────┘ │
│           │                    │                    │        │
│           ▼                    ▼                    ▼        │
└─────────────────────────────────────────────────────────────-┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────┐
│              FOCUSED HOOKS (Single Responsibility)          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │useForm       │  │useAccount    │  │useOnboarding │       │
│  │Validation    │  │Creation      │  │Messages      │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
│           │                    │                    │       │
│           └────────────────────┼────────────────────┘       │
│                                │                            │
└────────────────────────────────┼────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────┐
│              CONTROLLER FILE (State Management)             │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ OnboardingContext.tsx (centralized state)               ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

## File Structure

```
frontend/
├── app/
│   ├── onboarding/
│   │   ├── index.tsx          # Welcome screen
│   │   ├── starterpack.tsx    # Starter pack selection
│   │   └── account.tsx        # Account creation
│   └── _layout.tsx            # App layout with providers
├── contexts/
│   └── OnboardingContext.tsx  # Centralized state management
└── hooks/
    └── onboarding/
        ├── useOnboardingForm.ts      # Coordinator hook
        ├── useFormValidation.ts      # Form validation logic
        ├── useAccountCreation.ts     # Account creation logic
        ├── useOnboardingMessages.ts  # Messaging logic
        └── useStarterPack.ts         # Starter pack management
```

## Layer Breakdown

### 1. UI Layer (Main Files)

**Purpose**: Display the interface and handle user interactions

**Files**:

-   `onboarding/index.tsx` - Welcome screen
-   `onboarding/starterpack.tsx` - Starter pack selection
-   `onboarding/account.tsx` - Account creation

**Responsibilities**:

-   Render UI components
-   Handle user interactions
-   Use coordinator hooks for business logic

**Example**:

```typescript
// onboarding/account.tsx
export default function OnboardingAccountScreen() {
	const { formData, handleSignUp } = useOnboardingForm();

	return (
		<View>
			<Input value={formData.fullname} />
			<Button onPress={handleSignUp}>Create Account</Button>
		</View>
	);
}
```

### 2. Orchestration Layer (Coordinator)

**Purpose**: Coordinate between different focused hooks

**File**: `useOnboardingForm.ts`

**Responsibilities**:

-   Combine multiple focused hooks
-   Provide unified interface to UI layer
-   Handle cross-cutting concerns

**Example**:

```typescript
export const useOnboardingForm = () => {
	const { formData, validateFormData } = useFormValidation();
	const { createAccount } = useAccountCreation();
	const { showMessage } = useOnboardingMessages();
	const { state } = useOnboardingContext();

	const handleSignUp = async () => {
		const validation = validateFormData();
		if (!validation.isValid) {
			showMessage(validation.errorMessage, 'error');
			return;
		}

		const result = await createAccount(accountData);
		// Handle result...
	};

	return { formData, handleSignUp };
};
```

### 3. Business Logic Layer (Focused Hooks)

**Purpose**: Handle specific business logic with single responsibility

**Files**:

-   `useFormValidation.ts` - Form validation only
-   `useAccountCreation.ts` - Account creation only
-   `useOnboardingMessages.ts` - Messaging only
-   `useStarterPack.ts` - Starter pack management only

**Responsibilities**:

-   Handle one specific concern
-   Provide clean, focused APIs
-   Be reusable across the app

**Example**:

```typescript
// useFormValidation.ts
export const useFormValidation = () => {
  const [formData, setFormData] = useState({...});

  const validateFormData = () => {
    // Only validation logic here
  };

  return { formData, validateFormData };
};
```

### 4. State Management Layer (Controller)

**Purpose**: Centralized state management using React Context

**File**: `OnboardingContext.tsx`

**Responsibilities**:

-   Store all onboarding state
-   Provide state update methods
-   Persist state across screen navigation

**Example**:

```typescript
export const OnboardingProvider = ({ children }) => {
	const [state, setState] = useState({
		starterPackSelections: [],
		profilePictureUri: null,
		formData: {
			/* ... */
		},
	});

	const updateStarterPackSelections = (selections) => {
		setState((prev) => ({ ...prev, starterPackSelections: selections }));
	};

	return (
		<OnboardingContext.Provider value={contextValue}>
			{children}
		</OnboardingContext.Provider>
	);
};
```

## Data Flow

### Before Refactoring (URL Parameters)

```
Screen 1: User selects packs
  ↓
Encode selections to URL
  ↓
Navigate with URL parameters
  ↓
Screen 2: Parse URL parameters
  ↓
Extract selections from URL
```

### After Refactoring (Context)

```
Screen 1: User selects packs
  ↓
Update context state
  ↓
Navigate (no parameters needed)
  ↓
Screen 2: Access context state directly
```

## Benefits

### ✅ Maintainability

-   **Single Responsibility**: Each file has one clear purpose
-   **Easy Debugging**: Clear separation makes issues easier to locate
-   **Simple Changes**: Modify one concern without affecting others

### ✅ Testability

-   **Isolated Testing**: Each hook can be tested independently
-   **Mock Dependencies**: Easy to mock specific pieces
-   **Clear Boundaries**: Test inputs and outputs are well-defined

### ✅ Reusability

-   **Focused Hooks**: Can be used in other parts of the app
-   **Clean APIs**: Simple, intuitive interfaces
-   **No Coupling**: Hooks don't depend on each other

### ✅ Performance

-   **Optimized Re-renders**: Only affected components re-render
-   **Parallel Processing**: Hooks can be processed in parallel
-   **Better Caching**: React can better optimize with focused hooks

### ✅ Developer Experience

-   **Type Safety**: Full TypeScript support
-   **Clear Structure**: Easy to understand and navigate
-   **Consistent Patterns**: Follows React best practices
