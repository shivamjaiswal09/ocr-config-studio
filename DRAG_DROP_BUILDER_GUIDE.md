# 🎨 Drag & Drop Template Builder Guide

## 🚀 Access the Builder

**URL:** http://localhost:3001/builder

Safari should be opening it now!

---

## 📐 What You'll See

```
┌─────────────────────────────────────────────────────────┐
│  📐 PDF Template Builder  [Settings]  [💾 Save]        │
├───────────┬─────────────────────────┬───────────────────┤
│ Components│      A4 Canvas          │   Properties      │
│           │                         │                   │
│ 📝 Text   │   ┌───────────────┐    │  Type: Field      │
│ 📋 Section│   │               │    │  Position X: 100  │
│ 📊 Table  │   │  Drag & Drop  │    │  Position Y: 50   │
│ 🖼️ Image  │   │  Elements     │    │  Width: 300       │
│           │   │  Here!        │    │  Height: 40       │
│ Data Flds │   │               │    │  Font Size: 14    │
│ 🏷️ Invoice│   └───────────────┘    │  [Delete]         │
│ 🏷️ Date   │                         │                   │
│ 🏷️ Amount │                         │  Elements List    │
│ ...       │                         │  - Invoice #      │
│           │                         │  - From Section   │
└───────────┴─────────────────────────┴───────────────────┘
```

---

## 🎯 How to Build Your Template

### Step 1: Set Template Name
At the top, enter a name like "HRI Custom Invoice"

### Step 2: Choose Page Settings
- **Page Size:** A4 / Letter / Legal
- **Orientation:** Portrait / Landscape
- **Grid:** Toggle on/off
- **Zoom:** 50% - 200%

### Step 3: Drag Components from Left Panel

**From "Basic Elements":**
1. **📝 Text Label** - Static text like headers, notes
2. **📋 Section Header** - Bold section titles
3. **📊 Table** - For line items, charges
4. **🖼️ Image/Logo** - Company logo, stamps

**From "Data Fields":**
- 🏷️ **Invoice Number** - Dynamic field from your data
- 🏷️ **Invoice Date** - Auto-populated date
- 🏷️ **Consignor Name** - Customer name
- 🏷️ **Freight Charge** - Amount fields
- ... and 25+ more fields!

### Step 4: Drop on Canvas (White Area)
- Drag any component
- Drop it anywhere on the white A4 canvas
- It appears exactly where you drop it!

### Step 5: Position Precisely
**Two ways to position:**

**A) Drag to Move:**
- Click and hold any element
- Drag it to new position
- Release mouse

**B) Use Properties Panel:**
- Click an element to select
- Edit X, Y position in right panel
- Type exact pixel coordinates

### Step 6: Resize Elements
- Click element
- In properties panel, change Width/Height
- Or drag corner handles (if implemented)

### Step 7: Style Elements
When an element is selected, you can change:
- **Font Size:** 8-72px
- **Font Weight:** Normal / Bold
- **Color:** Pick any color
- **Width/Height:** Exact dimensions

### Step 8: Delete Elements
- Select element
- Click **🗑️ Delete Element** button
- Or press Delete key

### Step 9: Save Template
Click **💾 Save Template** button at top right

---

## 💡 Pro Tips

### Creating an Invoice Like Your Example

1. **Add Company Header (Top)**
   - Drag "Text Label" to top left
   - Type: "Union Transporter_HRI"
   - Position: X:50, Y:30

2. **Add Invoice Number (Top Right)**
   - Drag "Invoice Number" field
   - Position: X:500, Y:30
   - Align to the right

3. **Add Date**
   - Drag "Invoice Date" field
   - Position: X:650, Y:60

4. **Add "From" Section**
   - Drag "Section Header"
   - Type: "From"
   - Position: X:50, Y:120
   - Then drag fields below it:
     - Consignor Name
     - Address
     - GST IN

5. **Add "Bill To" Section**
   - Drag another "Section Header"
   - Type: "Bill To"
   - Position: X:400, Y:120
   - Add fields below

6. **Add Table for Charges**
   - Drag "Table" component
   - Position: X:50, Y:400
   - Resize: Width: 700, Height: 200

7. **Add Footer**
   - Drag "Text Label"
   - Position at bottom
   - Type terms & conditions

---

## 🎨 Layout Tips

### Standard Invoice Layout (A4 Portrait)

**Dimensions:** 794px wide × 1123px tall

**Recommended Spacing:**
- **Top Margin:** 50px
- **Left Margin:** 50px
- **Right Margin:** 50px
- **Bottom Margin:** 50px
- **Between Sections:** 30-40px
- **Between Fields:** 8-12px

### Position Guide (X, Y coordinates):

| Element | X | Y | Width | Height |
|---------|---|---|-------|--------|
| Header Logo | 50 | 50 | 150 | 60 |
| Invoice Title | 300 | 50 | 400 | 40 |
| Invoice # | 600 | 50 | 150 | 30 |
| From Section | 50 | 150 | 300 | 150 |
| To Section | 400 | 150 | 300 | 150 |
| Table | 50 | 350 | 700 | 250 |
| Total | 550 | 620 | 200 | 40 |
| Footer | 50 | 1000 | 700 | 80 |

---

## 🔧 Features

### ✅ What Works
- ✅ Drag & drop from palette
- ✅ Click and drag to reposition
- ✅ Precise positioning with X/Y inputs
- ✅ Resize with width/height controls
- ✅ Style with fonts and colors
- ✅ Delete elements
- ✅ A4/Letter/Legal page sizes
- ✅ Portrait/Landscape orientation
- ✅ Grid overlay for alignment
- ✅ Zoom in/out 50-200%
- ✅ Element selection
- ✅ Properties panel
- ✅ Elements list
- ✅ Save template

### 🎯 Element Types

**1. Text Label** 📝
- Static text
- Use for titles, headers, notes
- Fully styled

**2. Section Header** 📋
- Bold, larger text
- Use for "From", "To", "Charges" sections
- Auto-styled as header

**3. Table** 📊
- For line items, charges breakdown
- 3 columns by default
- Resizable

**4. Image/Logo** 🖼️
- Placeholder for logos
- Shows 🖼️ icon
- Position and resize

**5. Data Fields** 🏷️
- Dynamic data from your payload
- Shows as: **Label:** {value}
- Auto-populated when generating PDF

---

## 🎨 Example Template Designs

### Design 1: Classic Invoice

```
┌────────────────────────────────────┐
│ COMPANY LOGO    FREIGHT INVOICE    │
│                 Invoice #: XXX     │
│                 Date: XX/XX/XXXX   │
├────────────────┬───────────────────┤
│ FROM:          │ TO:               │
│ Transporter    │ Consignor         │
│ Address        │ Address           │
│ GST: XXXXX     │ GST: XXXXX        │
├────────────────┴───────────────────┤
│ SHIPMENT DETAILS                   │
│ Vehicle: XXXXXXX                   │
│ From: Mumbai   To: Delhi           │
├────────────────────────────────────┤
│ CHARGES                            │
│ ┌──────────────┬─────────────────┐ │
│ │ Description  │ Amount          │ │
│ ├──────────────┼─────────────────┤ │
│ │ Freight      │ ₹7,534          │ │
│ │ CGST         │ ₹677            │ │
│ │ SGST         │ ₹677            │ │
│ ├──────────────┼─────────────────┤ │
│ │ TOTAL        │ ₹8,888          │ │
│ └──────────────┴─────────────────┘ │
├────────────────────────────────────┤
│ Footer Text / Terms                │
└────────────────────────────────────┘
```

---

## 🚀 Quick Start Example

**Build a simple invoice in 2 minutes:**

1. Open: http://localhost:3001/builder
2. Name: "Quick Invoice"
3. Drag these in order:
   - Text Label (top) → "FREIGHT INVOICE"
   - Invoice Number field (top right)
   - Invoice Date field (below number)
   - Section Header → "FROM"
   - Consignor Name field
   - Section Header → "TO"
   - Consignee Name field
   - Table (middle)
   - Text Label (bottom) → "Thank you"
4. Adjust positions
5. Click Save!

---

## 📱 Keyboard Shortcuts

- **Delete**: Delete selected element
- **Esc**: Deselect element
- **Arrow Keys**: Move element 1px (coming soon)
- **Shift + Arrow**: Move 10px (coming soon)

---

## 🎯 Best Practices

1. **Start with structure** - Add sections first, then fields
2. **Use grid** - Turn on grid for better alignment
3. **Name elements clearly** - Use descriptive text
4. **Test spacing** - Leave enough room between elements
5. **Preview often** - Check how it looks at 100% zoom
6. **Save frequently** - Don't lose your work!

---

## 🔄 Workflow

```
1. Plan Layout
   ↓
2. Drag Components
   ↓
3. Position Elements
   ↓
4. Style & Resize
   ↓
5. Preview
   ↓
6. Save Template
   ↓
7. Generate PDFs!
```

---

## 📊 Current Page Sizes

| Size | Portrait (W×H) | Landscape (W×H) |
|------|----------------|-----------------|
| A4 | 794×1123px | 1123×794px |
| Letter | 816×1056px | 1056×816px |
| Legal | 816×1344px | 1344×816px |

*(at 96 DPI)*

---

## 🎨 Access Now

**Open in browser:**
```
http://localhost:3001/builder
```

Safari should be opening automatically!

---

## 💡 Example Use Cases

### 1. Customer-Specific Layout
- HRI wants logo top-left, invoice # top-right
- Drag elements to exact positions they want

### 2. Minimal Invoice
- Just essential fields
- Clean, simple layout
- Large fonts

### 3. Detailed Invoice
- Multiple sections
- Large table with many columns
- Footer with bank details

### 4. Multi-Page Template
- Use multiple tables
- Position elements for page breaks
- Add "Continued..." text

---

**Start Building Your Perfect Invoice Template Now!** 🚀

The builder gives you complete control - every pixel, every field, exactly where YOU want it!

