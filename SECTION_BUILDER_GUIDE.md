# ⭐ Section-Based PDF Template Builder - Complete Guide

## 🚀 Access

**URL:** http://localhost:3001/sections-builder

Safari is opening it now!

---

## 🎯 What's New - Section-Based Approach

Instead of placing individual fields one by one, you now work with **complete sections** that contain related fields grouped together - just like your invoice example!

---

## 📦 **8 Pre-Configured Sections Available:**

### 1. 🏢 **Company Details**
**Fields:**
- Company Name
- Address (multiline)
- Phone

**Default Size:** 350×120px  
**Use:** Top header with your company info

### 2. 📄 **Invoice Details**
**Fields:**
- Invoice Number
- Invoice Date
- Due Date
- PO Number (hidden by default)

**Default Size:** 300×120px  
**Use:** Invoice header information

### 3. 📮 **Bill From** (Transporter/Sender)
**Fields:**
- Name
- Address (multiline)
- GSTIN
- State Code

**Default Size:** 350×150px  
**Use:** Sender/Transporter information

### 4. 📮 **Bill To** (Consignor/Receiver)
**Fields:**
- Name
- Address (multiline)
- GSTIN
- State Code

**Default Size:** 350×150px  
**Use:** Receiver/Customer information

### 5. 📊 **Line Item Table**
**Columns:**
- Trip ID (100px)
- Description (250px)
- Amount (100px)
- Tax (100px)
- Total (150px)

**Default Size:** 700×250px  
**Special:** Auto-validates column width, configurable columns

### 6. 💰 **GST Summary**
**Fields:**
- CGST
- SGST
- IGST

**Default Size:** 400×120px  
**Use:** Tax breakdown

### 7. 💰 **Total Summary**
**Fields:**
- Total Amount
- Amount in Words

**Default Size:** 400×100px  
**Use:** Final totals

### 8. 📝 **Notes / Declaration**
**Fields:**
- Notes (multiline)
- Declaration (multiline)

**Default Size:** 700×100px  
**Use:** Terms, conditions, disclaimers

---

## 🎨 How to Build Your Template

### **Step 1: Set Template Name**
Enter name at top (e.g., "HRI Invoice Template")

### **Step 2: Choose Page Settings**
- **Page Size:** A4 / Letter / Legal
- **Orientation:** Portrait / Landscape
- **Grid:** Toggle on/off for alignment help
- **Snap:** Enable/disable snap-to-grid (10px grid)
- **Preview:** Toggle to see with sample data
- **Zoom:** 50% - 200%

### **Step 3: Drag Sections to Canvas**

**From left panel:**
1. Click and hold a section (e.g., "Company Details")
2. Drag to canvas
3. Drop where you want it
4. Section appears with all its fields!

**Sections snap to 10px grid automatically** (if snap is ON)

### **Step 4: Position Section Precisely**

**Two ways:**

**A) Drag Manually**
- Click section
- Drag to new position
- Snaps to grid if enabled

**B) Use Properties Panel**
- Click section to select
- Edit X, Y position in right panel
- Type exact coordinates

### **Step 5: Customize Section**

**In Properties Panel (right side):**

**Position & Size:**
- X Position (with grid snap)
- Y Position (with grid snap)
- Width
- Height

**Styling:**
- Font Size
- Background Color
- Show/Hide Border

**Fields (for non-table sections):**
- ☑️ Toggle visibility
- ✏️ Rename labels (aliasing)
- Each field shown with checkbox + text input

**Columns (for table section):**
- ☑️ Toggle column visibility
- ✏️ Rename column headers
- 📏 Adjust column width
- **Auto-calculates total width**
- **Shows error if too wide!**

### **Step 6: Validate**

**Automatic validation shows:**
- ❌ **Errors** (red) - Must fix to save:
  - Section exceeds page bounds
  - Table too wide
- ⚠️ **Warnings** (yellow) - Can save but review:
  - Sections overlap

### **Step 7: Save Template**
Click **💾 Save Template**
- Blocked if errors exist
- Saves to database with all configurations

---

## 🎯 Quick Start: Default Layout

Click **🔄 Default Layout** button to get a pre-configured invoice layout:

```
┌─────────────────────────────────────┐
│ [Company Details]  [Invoice Details]│ ← Top
│                                     │
│ [Bill From]        [Bill To]       │ ← Middle Top
│                                     │
│ [Line Item Table - Full Width]     │ ← Middle
│                                     │
│              [GST Summary]          │ ← Right Side
│              [Total Summary]        │ ← Right Side
│                                     │
│ [Notes/Declaration - Full Width]   │ ← Bottom
└─────────────────────────────────────┘
```

**Positions (A4 Portrait):**
- Company: X:50, Y:50
- Invoice: X:450, Y:50
- Bill From: X:50, Y:200
- Bill To: X:420, Y:200
- Table: X:50, Y:400
- GST: X:370, Y:680
- Total: X:370, Y:820
- Notes: X:50, Y:950

---

## ⚙️ **Features Explained**

### ✅ **Grid & Snap**

**Grid Toggle (🔲):**
- Shows 10px grid overlay on canvas
- Helps align sections visually

**Snap Toggle (🧲):**
- Snaps sections to 10px grid when dragging
- Snaps X/Y inputs to 10px increments
- Turn OFF for pixel-perfect positioning

### 🎨 **Preview Mode (👁️)**

**Preview OFF:** Shows field keys like `{invoice_number}`  
**Preview ON:** Shows sample data like "Sample Data"

Helps visualize how final PDF will look!

### ⚡ **Real-Time Validation**

**Boundary Checks:**
- Sections can't exceed page width/height
- Shows red border on canvas
- Error message at top

**Table Width Validation:**
- Calculates total of visible columns
- Warns if > page width - 100px
- Shows exact width in properties

**Overlap Detection:**
- Warns if sections overlap
- Doesn't block save (just warning)

### 📏 **Precise Positioning**

**Grid snapping helps but you control:**
- Exact X, Y coordinates
- Exact width, height
- All in pixels

**A4 Portrait Canvas:** 794×1123px

---

## 🔧 **Customization Examples**

### Example 1: Hide PO Number

1. Select "Invoice Details" section
2. In properties, find "PO Number" field
3. Uncheck the checkbox
4. PO Number disappears from section!

### Example 2: Rename "GSTIN" to "GST Number"

1. Select "Bill From" section
2. In fields list, find "GSTIN"
3. Change text from "GSTIN" to "GST Number"
4. Label updates instantly!

### Example 3: Remove Tax Column from Table

1. Select "Line Item Table"
2. In columns list, find "Tax"
3. Uncheck it
4. Column disappears, width recalculates!

### Example 4: Change Section Background

1. Select any section
2. Click background color picker
3. Choose color (e.g., light blue #e8f4fd)
4. Section background changes!

### Example 5: Adjust Table Column Widths

1. Select table section
2. In columns config, adjust widths:
   - Trip ID: 80px
   - Description: 300px
   - Amount: 120px
   - Tax: 100px
   - Total: 100px
3. Total width shown at bottom
4. Error if exceeds ~700px!

---

## 🎨 Building Your Invoice Layout

### **Layout Like Your Example Image:**

**Step-by-Step:**

1. **Top Left - Company/Transporter:**
   ```
   Drag: Bill From
   Position: X:50, Y:30
   ```

2. **Top Right - Invoice Number:**
   ```
   Drag: Invoice Details
   Position: X:500, Y:30
   Remove: Due Date, PO Number (uncheck)
   Keep: Invoice Number, Invoice Date
   ```

3. **Bill From Section:**
   ```
   Already placed or reposition
   X:50, Y:120
   ```

4. **Bill To Section:**
   ```
   Drag: Bill To
   Position: X:400, Y:120
   Rename: As needed
   ```

5. **HSN/Vendor Details:** (Custom section)
   ```
   Use: Company Details or Notes
   Position: Between Bill sections and Table
   ```

6. **Line Item Table:**
   ```
   Drag: Line Item Table
   Position: X:50, Y:350
   Configure columns as needed
   Resize height for multiple rows
   ```

7. **Totals on Right:**
   ```
   Drag: GST Summary
   Position: X:500, Y:600
   
   Drag: Total Summary
   Position: X:500, Y:750
   ```

8. **Bottom - Rupees in Words:**
   ```
   Drag: Total Summary
   Or use Notes section
   Position: X:50, Y:900
   ```

---

## 📊 **Saved Template Format**

When you save, template is stored as:

```json
{
  "template_name": "HRI Invoice",
  "orientation": "portrait",
  "pageSize": "A4",
  "sections": [
    {
      "id": "section-12345",
      "type": "InvoiceDetails",
      "name": "Invoice Details",
      "x": 500,
      "y": 30,
      "width": 300,
      "height": 120,
      "fields": [
        { "key": "invoice_number", "label": "Invoice #", "visible": true },
        { "key": "invoice_date", "label": "Date", "visible": true },
        { "key": "due_date", "label": "Due Date", "visible": false }
      ],
      "style": {
        "fontSize": 14,
        "fontWeight": "normal",
        "backgroundColor": "#ffffff",
        "showBorder": true
      }
    },
    {
      "id": "section-67890",
      "type": "LineItemTable",
      "name": "Line Item Table",
      "x": 50,
      "y": 400,
      "width": 700,
      "height": 250,
      "columns": [
        { "key": "trip_id", "label": "Trip ID", "width": 100, "visible": true },
        { "key": "freight_charge", "label": "Amount", "width": 150, "visible": true }
      ]
    }
  ]
}
```

---

## 🎯 **Key Advantages**

### **vs. Element-by-Element Builder:**

| Feature | Section Builder ⭐ | Element Builder |
|---------|------------------|-----------------|
| **Speed** | Fast - drag complete sections | Slow - place each field |
| **Organization** | Grouped logically | Individual elements |
| **Field Management** | Checkbox list per section | One by one |
| **Validation** | Auto section bounds check | Manual checking |
| **Reusability** | Predefined templates | Start from scratch |
| **Consistency** | Structured sections | Free-form |

### **Benefits:**

✅ **Faster** - Drag 1 section instead of 10 fields  
✅ **Organized** - Related fields together  
✅ **Validated** - Auto-checks bounds and overlaps  
✅ **Standardized** - All invoices follow same structure  
✅ **Customizable** - Still full control over fields  
✅ **Error-Free** - Can't save with validation errors  

---

## 🔍 **Error Messages Explained**

### **"Section exceeds right boundary"**
**Cause:** Section X + Width > Page Width  
**Fix:** Move section left OR reduce width

### **"Section exceeds bottom boundary"**
**Cause:** Section Y + Height > Page Height  
**Fix:** Move section up OR reduce height

### **"Table too wide (800px). Reduce columns or width."**
**Cause:** Sum of visible column widths > ~700px  
**Fix:** 
- Hide some columns (uncheck)
- Reduce column widths
- Change to landscape orientation

### **"Company Details overlaps with Invoice Details"**
**Cause:** Sections positioned too close  
**Fix:** Move sections apart (warning only, can still save)

---

## 💡 **Pro Tips**

1. **Use Default Layout First**
   - Click "Default Layout" to get started
   - Adjust positions from there
   - Saves time!

2. **Enable Snap for Quick Alignment**
   - Snap ON = sections align to grid
   - Snap OFF = pixel-perfect control

3. **Use Preview Mode**
   - Toggle preview to see with data
   - Easier to judge spacing

4. **Check Total Width for Tables**
   - Watch the "Total Width" indicator
   - Keep under 700px for A4 portrait

5. **Group Related Sections**
   - Bill From and Bill To side-by-side
   - GST Summary and Total stacked vertically

6. **Use Background Colors**
   - Highlight totals with light blue
   - Add subtle backgrounds to sections
   - Makes invoice more readable

7. **Hide Unused Fields**
   - Don't need PO Number? Uncheck it!
   - Cleaner invoice with only needed fields

8. **Test Different Page Sizes**
   - A4 for India/Europe
   - Letter for US
   - Landscape for wide tables

---

## ⌨️ **Keyboard Shortcuts** (Planned)

- **Delete**: Delete selected section
- **Esc**: Deselect section
- **Arrow Keys**: Move section 1px
- **Shift + Arrows**: Move 10px

---

## 🎨 **Example Layouts**

### **Layout 1: Standard Invoice**
- Company (top-left) + Invoice Details (top-right)
- Bill From (left) + Bill To (right)
- Table (full width)
- Totals (right side)
- Notes (bottom)

### **Layout 2: Compact Invoice**
- Invoice Details (top-right only)
- Bill To (left, no Bill From)
- Table (full width, fewer columns)
- Total only (no GST breakdown)

### **Layout 3: Detailed Invoice**
- Company Details (top banner)
- Invoice Details (below company)
- Bill From + Bill To (side by side)
- Table (tall, many rows)
- GST Summary (detailed)
- Total + In Words
- Notes + Declaration (bottom)

---

## 🚀 **Workflow**

```
1. Open: http://localhost:3001/sections-builder
2. Name template
3. Click "Default Layout" (or start from scratch)
4. Drag/adjust sections as needed
5. Customize fields and styling
6. Toggle preview to check
7. Fix any errors/warnings
8. Save template
9. Use in API to generate PDFs!
```

---

## 📊 **Navigation**

At the top of the page, you'll see navigation:
- **📋 Simple UI** - Form-based configuration
- **🎨 Element Builder** - Individual element placement
- **⭐ Section Builder (New!)** - This section-based builder

Click any to switch between builders!

---

## 🎯 **When to Use This Builder**

**Use Section Builder for:**
- ✅ Standard invoices with common sections
- ✅ Templates that follow a structure
- ✅ When you want speed and consistency
- ✅ Multiple similar templates

**Use Element Builder for:**
- Complex custom layouts
- Unique positioning needs
- Artistic/creative designs
- Non-standard documents

---

## 💾 **Accessing Your Saved Templates**

After saving, your template is stored in the database and can be:

1. **Used via API** to generate PDFs
2. **Listed** in the templates view
3. **Edited** (future feature - load and modify)
4. **Versioned** automatically

---

## 🎉 **You're Ready!**

The Section-Based Builder gives you the perfect balance:
- **Fast** like a template
- **Flexible** like custom design
- **Structured** for consistency
- **Validated** for error-free output

**Start building your invoice template now!** 🚀

Safari should be showing the builder at: **http://localhost:3001/sections-builder**

Try clicking **"🔄 Default Layout"** to see a complete invoice layout instantly!

