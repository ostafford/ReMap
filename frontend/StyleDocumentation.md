# ReMap Typography System Documentation

## 📋 **Table of Contents**

1. [System Overview](#system-overview)
2. [Component Reference](#component-reference)
3. [Usage Guidelines](#usage-guidelines)
4. [Implementation Examples](#implementation-examples)
5. [Migration Guide](#migration-guide)
6. [Best Practices](#best-practices)

---

## 🏗️ **System Overview**

### **Typography Hierarchy:**

```
DisplayText (32px)    →  App titles, splash screens
HeaderText (28px)     →  Page titles, major headings
SubheaderText (20px)  →  Section titles, card headers
BodyLargeText (18px)  →  Emphasized content
BodyText (16px)       →  Main content, descriptions
LabelText (14px)      →  Form labels, small headers
BodySmallText (14px)  →  De-emphasized content
CaptionText (12px)    →  Metadata, fine print
```

### **Special Purpose Components:**

```
ButtonText (16px)     →  Button labels (600 weight)
LinkText (16px)       →  Clickable links (underlined)
ErrorText (12px)      →  Form errors (red, medium weight)
SuccessText (12px)    →  Success messages (green, medium weight)
```

---

## 📖 **Component Reference**

### **DisplayText** - Extra Large Branding

```typescript
// Specs: 32px, bold, 38px line height, 12px margin bottom
<DisplayText align="center">ReMap</DisplayText>
<DisplayText>Your Interactive Memory Atlas</DisplayText>

// ✅ BEST FOR: App branding, splash screen titles, major announcements
// ❌ AVOID FOR: Page headers, regular content, small screens
```

### **HeaderText** - Page Titles

```typescript
// Specs: 28px, bold, 34px line height, 8px margin bottom
<HeaderText>Create Your Account</HeaderText>
<HeaderText align="center">Welcome to ReMap</HeaderText>

// ✅ BEST FOR: Page titles, screen headers, primary headings
// ❌ AVOID FOR: App title, section headers, form labels
```

### **SubheaderText** - Section Titles

```typescript
// Specs: 20px, 600 weight, 26px line height, 6px margin bottom
<SubheaderText>With a ReMap account:</SubheaderText>
<SubheaderText>Location Benefits</SubheaderText>

// ✅ BEST FOR: Card titles, section headers, secondary headings
// ❌ AVOID FOR: Main page titles, body content, form labels
```

### **BodyLargeText** - Emphasized Content

```typescript
// Specs: 18px, 400 weight, 26px line height, 6px margin bottom
<BodyLargeText>Important announcements and emphasized content</BodyLargeText>

// ✅ BEST FOR: Important descriptions, featured content, introductions
// ❌ AVOID FOR: Regular paragraphs, form labels, metadata
```

### **BodyText** - Main Content

```typescript
// Specs: 16px, 400 weight, 24px line height, 4px margin bottom
<BodyText>Transform your experiences into an interactive atlas.</BodyText>
<BodyText color={ReMapColors.primary.blue}>Custom colored content</BodyText>

// ✅ BEST FOR: Main content, descriptions, explanations, default text
// ❌ AVOID FOR: Titles, form labels, error messages, metadata
```

### **LabelText** - Form Labels

```typescript
// Specs: 14px, 500 weight, 18px line height, 4px margin bottom
<LabelText>Email Address</LabelText>
<LabelText>Full Name</LabelText>

// ✅ BEST FOR: Input labels, form field headers, small section titles
// ❌ AVOID FOR: Error messages, main content, page titles
```

### **BodySmallText** - Secondary Content

```typescript
// Specs: 14px, 400 weight, 20px line height, 4px margin bottom
// Default color: ReMapColors.ui.textSecondary
<BodySmallText>Save and sync your memories across devices</BodySmallText>
<BodySmallText>Secondary information and details</BodySmallText>

// ✅ BEST FOR: Feature descriptions, benefit lists, supporting details
// ❌ AVOID FOR: Main content, form labels, error messages
```

### **CaptionText** - Metadata

```typescript
// Specs: 12px, 400 weight, 16px line height, 2px margin bottom
// Default color: ReMapColors.ui.textSecondary
<CaptionText>Step 2 of 3</CaptionText>
<CaptionText>Your location is kept private</CaptionText>

// ✅ BEST FOR: Progress indicators, timestamps, fine print, disclaimers
// ❌ AVOID FOR: Main content, form labels, important information
```

### **ButtonText** - Button Labels

```typescript
// Specs: 16px, 600 weight, 20px line height, center aligned, single line
// Default color: ReMapColors.ui.cardBackground (white)
<ButtonText>Create Account</ButtonText>
<ButtonText color={ReMapColors.ui.text}>Cancel</ButtonText>

// ✅ BEST FOR: Button labels only (use inside Button components)
// ❌ AVOID FOR: Standalone text, links, content outside buttons
```

### **LinkText** - Interactive Links

```typescript
// Specs: 16px, 500 weight, 24px line height, underlined
// Default color: ReMapColors.primary.blue
<LinkText onPress={() => router.navigate('/help')}>Need help?</LinkText>
<LinkText onPress={handlePress}>Terms and Conditions</LinkText>

// ✅ BEST FOR: Navigation links, external links, interactive text
// ❌ AVOID FOR: Buttons, non-interactive text
// 🔧 ALWAYS include onPress for interactive behavior
```

### **ErrorText** - Form Validation

```typescript
// Specs: 12px, 500 weight, error color (red)
<ErrorText>Please enter a valid email address</ErrorText>
<ErrorText>Password must be at least 6 characters</ErrorText>

// ✅ BEST FOR: Form validation, error states, critical warnings
// ❌ AVOID FOR: Regular content, success messages
// ♿ Automatically optimized for screen readers
```

### **SuccessText** - Positive Feedback

```typescript
// Specs: 12px, 500 weight, success color (green)
<SuccessText>Account created successfully!</SuccessText>
<SuccessText>Location access granted</SuccessText>

// ✅ BEST FOR: Success states, confirmations, positive feedback
// ❌ AVOID FOR: Regular content, error messages
```

---

## 🎯 **Usage Guidelines**

### **Page Structure Pattern:**

```typescript
// Recommended hierarchy for pages
<HeaderText>Page Title</HeaderText>              // Primary heading
  <BodyText>Page introduction...</BodyText>      // Main explanation

  <SubheaderText>Section Title</SubheaderText>   // Section break
    <BodyText>Section content...</BodyText>      // Section explanation
    <BodySmallText>Additional details</BodySmallText> // Supporting info

  <LabelText>Form Section</LabelText>            // Form grouping
    <ErrorText>Validation message</ErrorText>   // Error feedback
    <SuccessText>Success message</SuccessText>   // Success feedback

  <CaptionText>Metadata or fine print</CaptionText> // Footer info
```

### **Component Properties:**

#### **Common Props (All Components):**

```typescript
interface BaseTextProps {
	children: React.ReactNode; // Text content
	style?: TextStyle | TextStyle[]; // Custom styling
	color?: string; // Text color override
	align?: 'left' | 'center' | 'right' | 'justify'; // Text alignment
	numberOfLines?: number; // Line clamping
	onPress?: () => void; // Touch handler
}
```

#### **Special Props:**

```typescript
// ButtonText: numberOfLines defaults to 1
// ErrorText & SuccessText: color prop not available (semantic colors only)
// BodySmallText & CaptionText: default to textSecondary color
```

---

## 💻 **Implementation Examples**

### **Onboarding Flow:**

```typescript
// onboarding/index.tsx
<HeaderText align="center">Welcome to ReMap</HeaderText>
<BodyText align="center">
  Transform your experiences into an interactive atlas
</BodyText>

<SubheaderText>📍 Pin Your Memories</SubheaderText>
<BodyText>
  Every place has a story - yours.
</BodyText>

<CaptionText align="center">Step 1 of 3</CaptionText>
```

### **Account Creation:**

```typescript
// account.tsx
<HeaderText>Create Your Account</HeaderText>
<BodyText>Join the ReMap community and start building your memory atlas.</BodyText>

<SubheaderText>With a ReMap account:</SubheaderText>
<BodySmallText>• Save and sync memories across devices</BodySmallText>
<BodySmallText>• Share with friends and family</BodySmallText>

<LabelText>Email Address</LabelText>
<ErrorText>Please enter a valid email</ErrorText>
<SuccessText>Account created successfully!</SuccessText>
```

### **Permission Flow:**

```typescript
// permissions.tsx
<HeaderText>Location Permissions</HeaderText>
<BodyText>
  ReMap uses your location to pin memories to specific places.
</BodyText>

<SubheaderText>With location access, you can:</SubheaderText>
<BodySmallText>Automatically pin memories to your exact location</BodySmallText>

<CaptionText>Your location is only used to enhance your experience.</CaptionText>
```

### **Splash Screen:**

```typescript
// index.tsx
<DisplayText align="center">ReMap</DisplayText>
<BodyText align="center">
  Your Interactive Memory Atlas
</BodyText>
```

---

## 🔄 **Migration Guide**

### **Step 1: Import Pattern**

```typescript
// Add to page imports
import {
	HeaderText,
	BodyText,
	SubheaderText,
	LabelText,
	ErrorText,
	SuccessText,
	CaptionText,
} from '@/components/ui/Typography';
```

### **Step 2: Common Replacements**

```typescript
// ❌ OLD: Basic Text with inline styles
<Text style={styles.title}>Page Title</Text>
<Text style={{fontSize: 16}}>Content</Text>
<Text style={{color: 'red'}}>Error</Text>
<Text style={{color: 'green'}}>Success</Text>

// ✅ NEW: Semantic Typography
<HeaderText>Page Title</HeaderText>
<BodyText>Content</BodyText>
<ErrorText>Error</ErrorText>
<SuccessText>Success</SuccessText>
```

### **Step 3: Form Migrations**

```typescript
// ❌ OLD: Mixed form styling
<Text>Email Address</Text>
<Text style={{color: 'red', fontSize: 12}}>Please enter valid email</Text>

// ✅ NEW: Consistent form typography
<LabelText>Email Address</LabelText>
<ErrorText>Please enter valid email</ErrorText>
```

### **Step 4: Content Hierarchy**

```typescript
// ❌ OLD: Unclear hierarchy
<Text style={{fontSize: 24, fontWeight: 'bold'}}>Section</Text>
<Text>Content here</Text>
<Text style={{fontSize: 12, color: 'gray'}}>Fine print</Text>

// ✅ NEW: Clear semantic hierarchy
<SubheaderText>Section</SubheaderText>
<BodyText>Content here</BodyText>
<CaptionText>Fine print</CaptionText>
```

---

## ✅ **Best Practices**

### **DO:**

-   ✅ Use semantic components for their intended purpose
-   ✅ Follow the visual hierarchy (Display → Header → Subheader → Body)
-   ✅ Use ErrorText and SuccessText for all form feedback
-   ✅ Include onPress for interactive LinkText
-   ✅ Use align prop for layout needs
-   ✅ Prefer semantic components over color overrides

### **DON'T:**

-   ❌ Mix old Text components with new Typography
-   ❌ Override colors when semantic components exist
-   ❌ Use HeaderText for form labels
-   ❌ Use BodyText for error messages
-   ❌ Use ButtonText outside of Button components
-   ❌ Skip the visual hierarchy (Header directly to Caption)

### **When to Override:**

```typescript
// ✅ GOOD: Spacing adjustments
<HeaderText style={{marginBottom: 20}}>Title</HeaderText>

// ✅ GOOD: Layout-specific changes
<BodyText style={{textAlign: 'justify'}}>Long paragraph</BodyText>

// ❌ AVOID: Color changes when semantic option exists
<BodyText style={{color: 'red'}}>Error</BodyText> // Use ErrorText instead

// ❌ AVOID: Font size changes that break hierarchy
<BodyText style={{fontSize: 24}}>Title</BodyText> // Use HeaderText instead
```

---

## 📊 **Typography Scale Reference**

| Component     | Size | Weight | Line Height | Use Case           |
| ------------- | ---- | ------ | ----------- | ------------------ |
| DisplayText   | 32px | bold   | 38px        | App branding       |
| HeaderText    | 28px | bold   | 34px        | Page titles        |
| SubheaderText | 20px | 600    | 26px        | Section titles     |
| BodyLargeText | 18px | 400    | 26px        | Emphasized content |
| BodyText      | 16px | 400    | 24px        | Main content       |
| LabelText     | 14px | 500    | 18px        | Form labels        |
| BodySmallText | 14px | 400    | 20px        | Secondary content  |
| CaptionText   | 12px | 400    | 16px        | Metadata           |
| ButtonText    | 16px | 600    | 20px        | Button labels      |
| LinkText      | 16px | 500    | 24px        | Interactive links  |
| ErrorText     | 12px | 500    | 16px        | Error messages     |
| SuccessText   | 12px | 500    | 16px        | Success messages   |

---

## 🎯 **Quick Decision Tree**

**What type of text are you adding?**

```
📱 App name/branding? → DisplayText
📄 Page title? → HeaderText
📋 Section title? → SubheaderText
📝 Main content? → BodyText
🏷️ Form label? → LabelText
ℹ️ Supporting info? → BodySmallText
🔍 Fine print/metadata? → CaptionText
🔘 Button label? → ButtonText
🔗 Clickable text? → LinkText
❌ Error message? → ErrorText
✅ Success message? → SuccessText
```

---

## 📞 **Getting Help**

**If you're unsure which component to use:**

1. Check this documentation for similar examples
2. Look at existing pages for patterns
3. Ask: "What is the semantic purpose of this text?"
4. When in doubt, use BodyText and refine later

**Remember: Consistency across the app is more important than perfect component selection!**
