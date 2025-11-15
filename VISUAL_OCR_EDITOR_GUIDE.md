# 🎨 Visual OCR Template Editor - User Guide

## Overview

The **Visual OCR Template Editor** allows you to create OCR extraction templates by uploading a sample document and visually drawing bounding boxes around important fields. This makes template configuration intuitive and accurate.

---

## ✨ Key Features

### 1. **Visual Bounding Box Creation**
- Upload a sample document image
- Click and drag to draw bounding boxes around fields
- Visual feedback with colored boxes
- Easy selection and management

### 2. **ALL Fields are Optional**
- Field configuration is **optional** and used only for **prompt improvement**
- OCR automatically extracts **ALL visible fields** regardless of configuration
- No mandatory fields - create minimal templates or detailed ones

### 3. **Intelligent Field Extraction**
- OCR extracts all fields it can find in the document
- Configured fields are treated as **priority hints**
- Even unconfigured fields will be extracted

### 4. **Interactive Canvas**
- Click and drag to create bounding boxes
- Click existing boxes to select them
- Delete selected boxes
- Clear all boxes at once

---

## 🚀 How to Use

### Step 1: Access the Visual Editor

1. Go to: http://localhost:3001/ocr-templates
2. Click the **🎨 Visual Editor** button

### Step 2: Fill General Information

**Required Fields:**
- Template Name (e.g., "Freight Invoice - Client A")
- Client ID
- Branch ID
- Transporter ID
- Document Type (invoice/pod/lr/etc.)

### Step 3: Upload Sample Document

1. Click **"Choose File"** under "Upload Sample Document Image"
2. Select an image of your document (JPG, PNG, etc.)
3. The image will appear on the canvas

### Step 4: Draw Bounding Boxes (Optional)

**To create a bounding box:**
1. Click and drag on the image
2. Release to create the box
3. Box appears with coordinates

**To select a box:**
- Click on any existing box
- Selected box turns blue
- Coordinates shown below

**To delete:**
- Select a box
- Click **"Delete Selected"**

**To clear all:**
- Click **"Clear All"** button

### Step 5: Configure Field Hints (Optional)

You can optionally add field configuration to prioritize certain fields:

1. Click **"+ Add Field Hint"**
2. Fill in:
   - **Field Name:** e.g., `invoice_number`, `freight_value`
   - **Data Type:** string, number, date, boolean, array
   - **Alternative Labels:** comma-separated synonyms
3. **Assign Bounding Box:**
   - Click on a box in the image to select it
   - Click **"Assign Selected Box"** for the field
   - Box will be linked to that field

**Remember:** Fields are optional! OCR works without any field configuration.

### Step 6: Configure Extraction Rules (Optional)

- **Currency Hint:** e.g., INR, USD
- **Date Formats:** e.g., DD-MM-YYYY, YYYY-MM-DD
- **Extraction Instructions:** Custom instructions for the AI

### Step 7: Create Template

Click **"Create Template"** to save.

---

## 📊 How It Works

### The Magic Behind the Scenes

When you create a template with the visual editor:

1. **Sample Image & Boxes** are stored for reference
2. **Field hints** (if provided) are used to prioritize certain fields
3. **Bounding boxes** help guide the AI to field locations
4. **OCR always extracts ALL fields** it can find

### Extraction Process

```
Document Upload
     ↓
Template Resolution (finds your template)
     ↓
AI receives:
  - Document image
  - Priority fields (if configured)
  - Bounding box hints (if provided)
  - Instructions to extract ALL fields
     ↓
AI extracts EVERYTHING it can find
     ↓
Returns comprehensive JSON with all fields
```

### Example Output

Even with minimal configuration, OCR extracts:

```json
{
  "invoice_number": "INV-2025-001234",
  "invoice_date": "2025-01-15",
  "consignor_name": "ABC Transport Ltd",
  "consignor_address": "123 Main Street, Mumbai",
  "consignor_gst": "27XXXXX1234X1X1",
  "consignee_name": "XYZ Industries",
  "freight_value": 12000,
  "loading_charge": 500,
  "unloading_charge": 300,
  "gst_amount": 2160,
  "cgst": 1080,
  "sgst": 1080,
  "total_amount": 14960,
  "vehicle_number": "MH12AB1234",
  "lr_number": "LR-001234",
  "route": "Mumbai to Delhi",
  // ... and many more fields automatically extracted
}
```

---

## 💡 Best Practices

### When to Use Visual Editor

✅ **Best for:**
- First-time template creation
- Complex document layouts
- When you want to visually see field locations
- Quick template setup

### When to Use Form Editor

✅ **Best for:**
- Detailed field configuration
- Many fields with complex synonyms
- Few-shot examples needed
- Programmatic template creation

### Configuration Tips

1. **Start Minimal:**
   - Create template with just general info
   - Let OCR extract everything
   - Add hints later if needed

2. **Add Hints for Tricky Fields:**
   - If a field is consistently missed, add a hint
   - Use bounding boxes for hard-to-find fields
   - Add synonyms for fields with multiple labels

3. **Use Bounding Boxes Strategically:**
   - Focus on fields in cluttered areas
   - Use for small or faint text
   - Skip obvious, large fields

4. **Test and Iterate:**
   - Test extraction with real documents
   - Add hints where accuracy is low
   - Remove hints that don't help

---

## 🎯 Examples

### Example 1: Minimal Template

**Configuration:**
- General info only (client, branch, transporter, doc_type)
- No fields configured
- No bounding boxes

**Result:**
- OCR extracts ALL fields automatically
- Works great for standard, clear documents

### Example 2: Guided Template

**Configuration:**
- General info
- 5 priority fields: `invoice_number`, `invoice_date`, `freight_value`, `gst_amount`, `total_amount`
- 2 bounding boxes on `freight_value` and `total_amount` (in bottom-right corner)

**Result:**
- OCR prioritizes the 5 fields
- Uses bounding boxes as hints
- Still extracts 20+ other fields automatically

### Example 3: Detailed Template

**Configuration:**
- General info
- 15 fields with synonyms
- 8 bounding boxes
- Custom extraction instructions

**Result:**
- Highest accuracy for configured fields
- Still extracts additional fields not configured

---

## 🔧 Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Draw box | Click + Drag |
| Select box | Click on box |
| Delete selected | Del / Backspace (future) |
| Deselect | Click on canvas |

---

## ⚙️ Technical Details

### Bounding Box Format

Coordinates are normalized (0-1 range):
- `x`: Left edge (0 = left, 1 = right)
- `y`: Top edge (0 = top, 1 = bottom)  
- `w`: Width (0-1)
- `h`: Height (0-1)

**Example:**
```javascript
{
  x: 0.70,  // 70% from left
  y: 0.82,  // 82% from top
  w: 0.25,  // 25% wide
  h: 0.08   // 8% tall
}
```

### Image Requirements

- **Formats:** JPG, PNG, GIF, WebP
- **Size:** Any size (automatically scaled)
- **Quality:** Higher quality = better accuracy
- **File size:** Recommended < 5MB

### Storage

- Sample images are converted to base64
- Bounding boxes stored as JSON
- Template stored in database
- Original image not stored (only for UI preview)

---

## 🐛 Troubleshooting

### Issue: Bounding box not drawing

**Solution:**
- Ensure image is fully loaded
- Try refreshing the page
- Check browser console for errors

### Issue: Box coordinates seem wrong

**Solution:**
- Coordinates are normalized (0-1)
- They're relative to image dimensions
- Works across different image sizes

### Issue: Can't assign box to field

**Solution:**
- First select a box by clicking on it
- Box should turn blue when selected
- Then click "Assign Selected Box" button

### Issue: OCR missing some fields

**Solution:**
- Add those fields to configuration
- Draw bounding boxes around them
- Add alternative labels/synonyms
- Check document image quality

---

## 📚 Related Documentation

- **Quick Start:** `OCR_QUICK_START.md`
- **Full Guide:** `OCR_SYSTEM_README.md`
- **API Docs:** `API_DOCUMENTATION.md`

---

## ✨ What's Next?

After creating a template:

1. **Publish it:** Change status from "draft" to "published"
2. **Test extraction:** Use `POST /api/ocr/extract`
3. **Monitor accuracy:** Check extraction results
4. **Refine:** Add hints for missed fields
5. **Deploy:** Use in production

---

## 🎉 Summary

The Visual OCR Editor makes template creation:
- **Easy:** Visual interface, no coding
- **Flexible:** Optional configuration
- **Powerful:** Extracts ALL fields automatically
- **Accurate:** Bounding boxes guide extraction
- **Fast:** Quick template setup

**Remember:** Configuration is optional and only improves accuracy. OCR works great even without any field hints!

---

**Access:** http://localhost:3001/ocr-templates → 🎨 Visual Editor

