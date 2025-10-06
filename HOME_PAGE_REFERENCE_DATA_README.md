# Home Page Reference Data System

## Overview

This system allows you to fetch home pages with their sections and items, where each item includes the actual data of the referenced entity (banner, slider, product, category, collection, or HTML content) instead of just the reference ID.

## How It Works

### 1. Data Flow
```
HomePage → HomePageSections → HomePageSectionItems → Reference Data (Banner/Slider/Product/etc.)
```

### 2. Reference Types
The system supports the following reference types:
- `banner` - References banner entities
- `slider` - References slider entities  
- `product` - References product entities (TODO: implement)
- `category` - References category entities (TODO: implement)
- `collection` - References collection entities (TODO: implement)
- `html` - HTML content (stored as referenceId)

### 3. Key Components

#### HomePageSectionItems Entity
- Added `referenceData` virtual property to store actual reference data
- This property is populated by the service layer

#### HomePageSectionItemsService
- `fetchReferenceData()` - Fetches actual data based on reference type and ID
- `populateReferenceData()` - Populates reference data for multiple items
- All CRUD methods now automatically populate reference data

#### HomePageService
- `populateHomePageReferenceData()` - Populates reference data for all sections and items
- All methods that return home pages now include populated reference data

### 4. API Response Structure

When you fetch a home page, the response will look like this:

```json
{
  "id": "home-page-id",
  "titleAr": "الصفحة الرئيسية",
  "titleEn": "Home Page",
  "type": "mobile",
  "homePageSections": [
    {
      "id": "section-id",
      "titleAr": "قسم البانرات",
      "titleEn": "Banners Section",
      "type": 1,
      "homePageSectionItems": [
        {
          "id": "item-id",
          "referenceType": "banner",
          "referenceId": 123,
          "orderSort": 1,
          "settings": { "highlight": true },
          "referenceData": {
            "id": "123",
            "titleAr": "عنوان البانر",
            "titleEn": "Banner Title",
            "sort": 1,
            "isActive": true,
            "countryId": 1,
            "offer": true,
            "linkableIds": "1,2,3",
            "linkableType": "product"
          }
        }
      ]
    }
  ]
}
```

### 5. Usage Examples

#### Fetch Home Page by ID
```typescript
const homePage = await homePageService.findById('home-page-id');
// homePage.homePageSections[0].homePageSectionItems[0].referenceData 
// will contain the actual banner data
```

#### Fetch Home Page by Type
```typescript
const homePages = await homePageService.findByType(HomePageType.MOBILE);
// All home pages will have populated reference data
```

#### Fetch Default Home Page
```typescript
const defaultHomePage = await homePageService.getDefaultByType(HomePageType.WEB);
// Default home page will have populated reference data
```

### 6. Performance Considerations

- Reference data is fetched on-demand when home pages are requested
- Each reference type is fetched using its respective service
- Failed reference data fetches return `null` instead of throwing errors
- Consider implementing caching for frequently accessed reference data

### 7. Extending the System

To add support for new reference types:

1. Add the new type to `HomePageSectionItemReferenceType` enum
2. Implement the corresponding service method in `fetchReferenceData()`
3. Add the service to the module imports
4. Update the DTOs if needed

### 8. Error Handling

- If a referenced entity is not found, `referenceData` will be `null`
- The system continues to function even if some reference data cannot be fetched
- Logs are generated for debugging purposes

## Benefits

1. **Complete Data**: Get all necessary data in a single API call
2. **Structured Response**: Well-organized hierarchy of home page → sections → items → reference data
3. **Type Safety**: Proper TypeScript types for all data structures
4. **Extensible**: Easy to add new reference types
5. **Performance**: Efficient data fetching with proper relationships
6. **Clean Code**: Follows existing system patterns and structure 